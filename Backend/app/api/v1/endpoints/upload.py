from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import User
from app.core.security import get_current_active_user, require_roles, UserRole
from app.services.file_service import FileService
from app.core.exceptions import ValidationException

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/product-images")
@limiter.limit("10/minute")
async def upload_product_images(
    request: Request,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Upload product images (Admin only)"""
    if not files:
        raise ValidationException("No files provided")
    
    if len(files) > 10:
        raise ValidationException("Maximum 10 files allowed")
    
    file_service = FileService()
    
    try:
        # Save files with resizing for product images
        saved_files = await file_service.save_multiple_files(
            files, 
            "products", 
            (1200, 1200)  # Resize to max 1200x1200
        )
        
        if not saved_files:
            raise HTTPException(status_code=500, detail="Failed to save files")
        
        return {
            "message": f"Successfully uploaded {len(saved_files)} files",
            "files": saved_files
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/review-images")
@limiter.limit("5/minute")
async def upload_review_images(
    request: Request,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload review images"""
    if not files:
        raise ValidationException("No files provided")
    
    if len(files) > 5:
        raise ValidationException("Maximum 5 files allowed")
    
    file_service = FileService()
    
    try:
        # Save files with resizing for review images
        saved_files = await file_service.save_multiple_files(
            files, 
            "reviews", 
            (800, 600)  # Resize to max 800x600
        )
        
        if not saved_files:
            raise HTTPException(status_code=500, detail="Failed to save files")
        
        return {
            "message": f"Successfully uploaded {len(saved_files)} files",
            "files": saved_files
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/user-avatar")
@limiter.limit("5/minute")
async def upload_user_avatar(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload user avatar"""
    if not file:
        raise ValidationException("No file provided")
    
    file_service = FileService()
    
    try:
        # Save file with resizing for avatar
        saved_file = await file_service.save_uploaded_file(
            file, 
            "users", 
            (200, 200)  # Resize to 200x200 for avatar
        )
        
        return {
            "message": "Avatar uploaded successfully",
            "file": saved_file
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/file")
@limiter.limit("10/minute")
async def delete_file(
    request: Request,
    file_path: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Delete a file (Admin only)"""
    file_service = FileService()
    
    try:
        success = await file_service.delete_file(file_path)
        
        if success:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.get("/file-url")
@limiter.limit("60/minute")
async def get_file_url(request: Request, file_path: str):
    """Get full URL for a file"""
    file_service = FileService()
    
    try:
        url = file_service.get_file_url(file_path)
        return {"url": url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate URL: {str(e)}")
