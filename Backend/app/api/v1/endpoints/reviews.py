from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy import select, and_, or_, desc, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sqlalchemy_models import Review, User, Product, Order
from app.schemas.review import (
    ReviewCreate, ReviewUpdate, ReviewResponse, ReviewWithUser, 
    ReviewStats, ReviewListResponse, ReviewHelpfulUpdate
)
from app.core.postgresql import get_db
from app.core.security import get_current_active_user
from app.services.file_service import FileService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/product/{product_id}", response_model=ReviewListResponse)
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    rating_filter: Optional[int] = Query(None, ge=1, le=5),
    sort_by: str = Query("created_at", regex="^(created_at|rating|helpful_count)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get reviews for a specific product"""
    try:
        # Verify product exists
        product_result = await db.execute(
            select(Product).where(Product.id == product_id, Product.is_active == True)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Build base query
        query = select(Review, User).join(User, Review.user_id == User.id).where(
            Review.product_id == product_id,
            Review.is_approved == True
        )
        
        if rating_filter:
            query = query.where(Review.rating == rating_filter)
        
        # Apply sorting
        if sort_by == "rating":
            if sort_order == "asc":
                query = query.order_by(asc(Review.rating))
            else:
                query = query.order_by(desc(Review.rating))
        elif sort_by == "helpful_count":
            if sort_order == "asc":
                query = query.order_by(asc(Review.helpful_count))
            else:
                query = query.order_by(desc(Review.helpful_count))
        else:  # created_at
            if sort_order == "asc":
                query = query.order_by(asc(Review.created_at))
            else:
                query = query.order_by(desc(Review.created_at))
        
        # Get total count
        count_query = select(func.count(Review.id)).where(
            Review.product_id == product_id,
            Review.is_approved == True
        )
        if rating_filter:
            count_query = count_query.where(Review.rating == rating_filter)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        review_data = result.fetchall()
        
        # Process reviews
        reviews = []
        for review, user in review_data:
            reviews.append(ReviewWithUser(
                id=str(review.id),
                user_id=str(review.user_id),
                product_id=str(review.product_id),
                rating=review.rating,
                title=review.title,
                comment=review.comment,
                images=review.images or [],
                is_verified_purchase=review.is_verified_purchase,
                is_approved=review.is_approved,
                helpful_count=review.helpful_count,
                created_at=review.created_at,
                updated_at=review.updated_at,
                user_name=user.name,
                user_email=user.email,
                user_profile_image=user.profile_image
            ))
        
        # Get review statistics
        stats_query = select(
            func.count(Review.id).label('total_reviews'),
            func.avg(Review.rating).label('average_rating')
        ).where(Review.product_id == product_id, Review.is_approved == True)
        
        stats_result = await db.execute(stats_query)
        stats_data = stats_result.fetchone()
        
        # Get rating distribution
        rating_dist_query = select(
            Review.rating,
            func.count(Review.id).label('count')
        ).where(Review.product_id == product_id, Review.is_approved == True).group_by(Review.rating)
        
        rating_dist_result = await db.execute(rating_dist_query)
        rating_distribution = {row[0]: row[1] for row in rating_dist_result.fetchall()}
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        return ReviewListResponse(
            reviews=reviews,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            stats=ReviewStats(
                total_reviews=stats_data[0] or 0,
                average_rating=float(stats_data[1] or 0),
                rating_distribution=rating_distribution
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product reviews: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch product reviews"
        )


@router.get("/product/{product_id}/stats", response_model=ReviewStats)
async def get_product_review_stats(
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get review statistics for a product"""
    try:
        # Verify product exists
        product_result = await db.execute(
            select(Product).where(Product.id == product_id, Product.is_active == True)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Get review statistics
        stats_query = select(
            func.count(Review.id).label('total_reviews'),
            func.avg(Review.rating).label('average_rating')
        ).where(Review.product_id == product_id, Review.is_approved == True)
        
        stats_result = await db.execute(stats_query)
        stats_data = stats_result.fetchone()
        
        # Get rating distribution
        rating_dist_query = select(
            Review.rating,
            func.count(Review.id).label('count')
        ).where(Review.product_id == product_id, Review.is_approved == True).group_by(Review.rating)
        
        rating_dist_result = await db.execute(rating_dist_query)
        rating_distribution = {row[0]: row[1] for row in rating_dist_result.fetchall()}
        
        # Ensure all ratings 1-5 are present
        for rating in range(1, 6):
            if rating not in rating_distribution:
                rating_distribution[rating] = 0
        
        return ReviewStats(
            total_reviews=stats_data[0] or 0,
            average_rating=float(stats_data[1] or 0),
            rating_distribution=rating_distribution
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching review stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch review statistics"
        )


@router.post("/", response_model=ReviewResponse)
async def create_review(
    product_id: str = Form(...),
    rating: int = Form(..., ge=1, le=5),
    title: Optional[str] = Form(None),
    comment: Optional[str] = Form(None),
    images: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new review"""
    try:
        # Verify product exists
        product = await Product.get(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check if user already reviewed this product
        existing_review = await Review.find_one({
            "user_id": str(current_user.id),
            "product_id": product_id
        })
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this product"
            )
        
        # Check if user has purchased this product (for verified purchase)
        is_verified_purchase = False
        if current_user.role.value == "customer":
            purchase_check = await Order.find_one({
                "user_id": str(current_user.id),
                "payment_status": PaymentStatus.PAID,
                "items.product_id": product_id
            })
            is_verified_purchase = purchase_check is not None
        
        # Upload images if provided
        uploaded_images = []
        if images:
            file_service = FileService()
            for image in images:
                if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Only JPEG, PNG, and WebP images are allowed"
                    )
                
                # Generate unique filename
                file_extension = image.filename.split('.')[-1]
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                
                # Upload to storage
                image_url = await file_service.upload_file(
                    file=image,
                    filename=unique_filename,
                    folder="reviews"
                )
                uploaded_images.append(image_url)
        
        # Create review
        review = Review(
            user_id=str(current_user.id),
            product_id=product_id,
            rating=rating,
            title=title,
            comment=comment,
            images=uploaded_images,
            is_verified_purchase=is_verified_purchase
        )
        
        db.add(review)
        await db.commit()
        await db.refresh(review)
        
        logger.info(f"Review created for product {product_id} by user {current_user.email}")
        
        return ReviewResponse(
            id=str(review.id),
            user_id=review.user_id,
            product_id=review.product_id,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            images=review.images,
            is_verified_purchase=review.is_verified_purchase,
            is_approved=review.is_approved,
            helpful_count=review.helpful_count,
            created_at=review.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create review"
        )


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    rating: Optional[int] = Form(None, ge=1, le=5),
    title: Optional[str] = Form(None),
    comment: Optional[str] = Form(None),
    images: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_active_user)
):
    """Update a review"""
    try:
        # Get review
        review = await Review.get(review_id)
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        # Check if user owns this review
        if review.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own reviews"
            )
        
        # Update fields
        if rating is not None:
            review.rating = rating
        if title is not None:
            review.title = title
        if comment is not None:
            review.comment = comment
        
        # Handle new images
        if images:
            file_service = FileService()
            uploaded_images = []
            
            for image in images:
                if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Only JPEG, PNG, and WebP images are allowed"
                    )
                
                # Generate unique filename
                file_extension = image.filename.split('.')[-1]
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                
                # Upload to storage
                image_url = await file_service.upload_file(
                    file=image,
                    filename=unique_filename,
                    folder="reviews"
                )
                uploaded_images.append(image_url)
            
            # Replace existing images
            review.images = uploaded_images
        
        await db.commit()
        await db.refresh(review)
        
        logger.info(f"Review updated: {review_id} by user {current_user.email}")
        
        return ReviewResponse(
            id=str(review.id),
            user_id=review.user_id,
            product_id=review.product_id,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            images=review.images,
            is_verified_purchase=review.is_verified_purchase,
            is_approved=review.is_approved,
            helpful_count=review.helpful_count,
            created_at=review.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update review"
        )


@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a review"""
    try:
        # Get review
        review = await Review.get(review_id)
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        # Check if user owns this review
        if review.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own reviews"
            )
        
        # Delete associated images
        if review.images:
            file_service = FileService()
            for image_url in review.images:
                await file_service.delete_file(image_url)
        
        await db.delete(review)
        await db.commit()
        
        logger.info(f"Review deleted: {review_id} by user {current_user.email}")
        
        return {"message": "Review deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete review"
        )


@router.get("/user/my-reviews", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: User = Depends(get_current_active_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50)
):
    """Get current user's reviews"""
    try:
        offset = (page - 1) * limit
        
        reviews_query = select(Review).where(Review.user_id == current_user.id).order_by(desc(Review.created_at)).offset(offset).limit(limit)
        reviews_result = await db.execute(reviews_query)
        reviews = reviews_result.scalars().all()
        
        return [
            ReviewResponse(
                id=str(review.id),
                user_id=review.user_id,
                product_id=review.product_id,
                rating=review.rating,
                title=review.title,
                comment=review.comment,
                images=review.images,
                is_verified_purchase=review.is_verified_purchase,
                is_approved=review.is_approved,
                helpful_count=review.helpful_count,
                created_at=review.created_at
            )
            for review in reviews
        ]
        
    except Exception as e:
        logger.error(f"Error fetching user reviews: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reviews"
        )


@router.post("/{review_id}/helpful")
async def mark_review_helpful(
    review_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Mark a review as helpful"""
    try:
        # Get review
        review = await Review.get(review_id)
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        # Check if user already marked this review as helpful
        # Note: You might want to create a separate collection to track helpful votes per user
        # For now, we'll just increment the count
        
        review.helpful_count += 1
        await db.commit()
        await db.refresh(review)
        
        return {"message": "Review marked as helpful", "helpful_count": review.helpful_count}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking review as helpful: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark review as helpful"
        )