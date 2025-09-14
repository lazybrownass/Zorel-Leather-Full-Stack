from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.postgresql import get_db
from app.core.security import get_current_active_user, get_current_super_admin
from app.models.sqlalchemy_models import AdminRequest, User, AdminRequestStatus, UserRole
from app.schemas.admin_request import (
    AdminRequestCreate, 
    AdminRequestResponse, 
    AdminRequestApproval,
    AdminRequestList
)
from app.core.security import hash_password

router = APIRouter()

@router.post("/", response_model=AdminRequestResponse)
async def create_admin_request(
    request_data: AdminRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new admin access request"""
    
    # Check if user with this email already exists
    existing_user = await db.execute(
        select(User).where(User.email == request_data.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if there's already a pending request for this email
    existing_request = await db.execute(
        select(AdminRequest).where(
            AdminRequest.email == request_data.email,
            AdminRequest.status == AdminRequestStatus.PENDING
        )
    )
    if existing_request.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending admin request"
        )
    
    # Create the admin request
    admin_request = AdminRequest(
        name=request_data.name,
        email=request_data.email,
        password_hash=hash_password(request_data.password),
        date_of_birth=request_data.date_of_birth,
        employee_id=request_data.employee_id,
        status=AdminRequestStatus.PENDING,
        requested_at=datetime.utcnow()
    )
    
    db.add(admin_request)
    await db.commit()
    await db.refresh(admin_request)
    
    return AdminRequestResponse(
        id=str(admin_request.id),
        name=admin_request.name,
        email=admin_request.email,
        date_of_birth=admin_request.date_of_birth,
        employee_id=admin_request.employee_id,
        status=admin_request.status,
        requested_at=admin_request.requested_at,
        reviewed_at=admin_request.approved_at,
        reviewed_by=admin_request.approved_by,
        rejection_reason=admin_request.rejection_reason
    )

@router.get("/", response_model=AdminRequestList)
async def get_admin_requests(
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[AdminRequestStatus] = None,
    current_user: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all admin requests (Super Admin only)"""
    
    # Build query
    query = select(AdminRequest)
    
    if status_filter:
        query = query.where(AdminRequest.status == status_filter)
    
    # Get total count
    count_query = select(func.count(AdminRequest.id))
    if status_filter:
        count_query = count_query.where(AdminRequest.status == status_filter)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit).order_by(AdminRequest.requested_at.desc())
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    # Convert to response format
    request_responses = []
    for req in requests:
        request_responses.append(AdminRequestResponse(
            id=str(req.id),
            name=req.name,
            email=req.email,
            date_of_birth=req.date_of_birth,
            employee_id=req.employee_id,
            status=req.status,
            requested_at=req.requested_at,
            reviewed_at=req.approved_at,
            reviewed_by=req.approved_by,
            rejection_reason=req.rejection_reason
        ))
    
    return AdminRequestList(
        requests=request_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@router.post("/{request_id}/approve", response_model=dict)
async def approve_admin_request(
    request_id: str,
    current_user: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Approve an admin request (Super Admin only)"""
    
    # Get the admin request
    result = await db.execute(
        select(AdminRequest).where(AdminRequest.id == uuid.UUID(request_id))
    )
    admin_request = result.scalar_one_or_none()
    
    if not admin_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin request not found"
        )
    
    if admin_request.status != AdminRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This request has already been processed"
        )
    
    # Check if user already exists
    existing_user = await db.execute(
        select(User).where(User.email == admin_request.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create the admin user
    admin_user = User(
        email=admin_request.email,
        username=admin_request.email.split('@')[0],  # Use email prefix as username
        password_hash=admin_request.password_hash,
        name=admin_request.name,
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
        date_of_birth=admin_request.date_of_birth,
        employee_id=admin_request.employee_id
    )
    
    db.add(admin_user)
    
    # Update the admin request
    admin_request.status = AdminRequestStatus.APPROVED
    admin_request.approved_by = current_user.id
    admin_request.approved_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Admin request approved successfully"}

@router.post("/{request_id}/reject", response_model=dict)
async def reject_admin_request(
    request_id: str,
    approval_data: AdminRequestApproval,
    current_user: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Reject an admin request (Super Admin only)"""
    
    # Get the admin request
    result = await db.execute(
        select(AdminRequest).where(AdminRequest.id == uuid.UUID(request_id))
    )
    admin_request = result.scalar_one_or_none()
    
    if not admin_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin request not found"
        )
    
    if admin_request.status != AdminRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This request has already been processed"
        )
    
    # Update the admin request
    admin_request.status = AdminRequestStatus.REJECTED
    admin_request.approved_by = current_user.id
    admin_request.approved_at = datetime.utcnow()
    admin_request.rejection_reason = approval_data.rejection_reason
    
    await db.commit()
    
    return {"message": "Admin request rejected successfully"}

@router.get("/{request_id}", response_model=AdminRequestResponse)
async def get_admin_request(
    request_id: str,
    current_user: User = Depends(get_current_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific admin request (Super Admin only)"""
    
    result = await db.execute(
        select(AdminRequest).where(AdminRequest.id == uuid.UUID(request_id))
    )
    admin_request = result.scalar_one_or_none()
    
    if not admin_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin request not found"
        )
    
    return AdminRequestResponse(
        id=str(admin_request.id),
        name=admin_request.name,
        email=admin_request.email,
        date_of_birth=admin_request.date_of_birth,
        employee_id=admin_request.employee_id,
        status=admin_request.status,
        requested_at=admin_request.requested_at,
        reviewed_at=admin_request.approved_at,
        reviewed_by=admin_request.approved_by,
        rejection_reason=admin_request.rejection_reason
    )