from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from app.models.sqlalchemy_models import User, UserRole, Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceStatus, PaymentMethod
from app.core.security import require_roles
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[InvoiceResponse])
async def get_all_invoices(
    status: Optional[InvoiceStatus] = Query(None),
    payment_method: Optional[PaymentMethod] = Query(None),
    customer_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get all invoices with filtering and pagination (Admin only)"""
    try:
        # Build query
        query = select(Invoice)
        
        if status:
            query = query.where(Invoice.status == status)
        if payment_method:
            query = query.where(Invoice.payment_method == payment_method)
        if customer_id:
            import uuid
            try:
                customer_uuid = uuid.UUID(customer_id)
                query = query.where(Invoice.customer_id == customer_uuid)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid customer ID format"
                )
        if date_from:
            query = query.where(Invoice.invoice_date >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            query = query.where(Invoice.invoice_date <= datetime.combine(date_to, datetime.max.time()))
        if search:
            query = query.where(
                or_(
                    Invoice.invoice_number.ilike(f"%{search}%"),
                    Invoice.customer_name.ilike(f"%{search}%"),
                    Invoice.customer_email.ilike(f"%{search}%"),
                    Invoice.order_id.ilike(f"%{search}%")
                )
            )
        
        # Sort
        sort_field = getattr(Invoice, sort_by) if hasattr(Invoice, sort_by) else Invoice.created_at
        if sort_order == "desc":
            query = query.order_by(desc(sort_field))
        else:
            query = query.order_by(asc(sort_field))
        
        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        invoices = result.scalars().all()
        
        return [
            InvoiceResponse(
                id=str(invoice.id),
                invoice_number=invoice.invoice_number,
                order_id=invoice.order_id,
                customer_id=invoice.customer_id,
                customer_name=invoice.customer_name,
                customer_email=invoice.customer_email,
                customer_phone=invoice.customer_phone,
                customer_address=invoice.customer_address,
                invoice_date=invoice.invoice_date,
                due_date=invoice.due_date,
                status=invoice.status,
                items=invoice.items,
                subtotal=invoice.subtotal,
                gst_amount=invoice.gst_amount,
                total_amount=invoice.total_amount,
                payment_method=invoice.payment_method,
                payment_date=invoice.payment_date,
                payment_reference=invoice.payment_reference,
                notes=invoice.notes,
                terms_conditions=invoice.terms_conditions,
                created_at=invoice.created_at,
                updated_at=invoice.updated_at
            )
            for invoice in invoices
        ]
        
    except Exception as e:
        logger.error(f"Error fetching invoices: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch invoices"
        )


@router.post("/", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new invoice (Admin only)"""
    try:
        # Generate invoice number
        invoice_count_query = select(func.count(Invoice.id))
        invoice_count_result = await db.execute(invoice_count_query)
        invoice_count = invoice_count_result.scalar()
        invoice_number = f"INV-{datetime.now().year}-{str(invoice_count + 1).zfill(6)}"
        
        # Calculate totals
        subtotal = sum(item.net_amount for item in invoice_data.items)
        gst_amount = sum(item.gst_amount for item in invoice_data.items)
        total_amount = subtotal + gst_amount
        
        # Create invoice
        import uuid
        
        invoice = Invoice(
            id=uuid.uuid4(),
            invoice_number=invoice_number,
            order_id=invoice_data.order_id,
            customer_id=invoice_data.customer_id,
            customer_name=invoice_data.customer_name,
            customer_email=invoice_data.customer_email,
            customer_phone=invoice_data.customer_phone,
            customer_address=invoice_data.customer_address,
            due_date=invoice_data.due_date,
            items=invoice_data.items,
            subtotal=subtotal,
            gst_amount=gst_amount,
            total_amount=total_amount,
            notes=invoice_data.notes,
            terms_conditions=invoice_data.terms_conditions,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(invoice)
        await db.commit()
        await db.refresh(invoice)
        
        logger.info(f"Invoice created: {invoice_number} by {current_user.email}")
        
        return InvoiceResponse(
            id=str(invoice.id),
            invoice_number=invoice.invoice_number,
            order_id=invoice.order_id,
            customer_id=invoice.customer_id,
            customer_name=invoice.customer_name,
            customer_email=invoice.customer_email,
            customer_phone=invoice.customer_phone,
            customer_address=invoice.customer_address,
            invoice_date=invoice.invoice_date,
            due_date=invoice.due_date,
            status=invoice.status,
            items=invoice.items,
            subtotal=invoice.subtotal,
            gst_amount=invoice.gst_amount,
            total_amount=invoice.total_amount,
            payment_method=invoice.payment_method,
            payment_date=invoice.payment_date,
            payment_reference=invoice.payment_reference,
            notes=invoice.notes,
            terms_conditions=invoice.terms_conditions,
            created_at=invoice.created_at,
            updated_at=invoice.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invoice"
        )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific invoice (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            invoice_uuid = uuid.UUID(invoice_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        query = select(Invoice).where(Invoice.id == invoice_uuid)
        result = await db.execute(query)
        invoice = result.scalar_one_or_none()
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        return InvoiceResponse(
            id=str(invoice.id),
            invoice_number=invoice.invoice_number,
            order_id=invoice.order_id,
            customer_id=invoice.customer_id,
            customer_name=invoice.customer_name,
            customer_email=invoice.customer_email,
            customer_phone=invoice.customer_phone,
            customer_address=invoice.customer_address,
            invoice_date=invoice.invoice_date,
            due_date=invoice.due_date,
            status=invoice.status,
            items=invoice.items,
            subtotal=invoice.subtotal,
            gst_amount=invoice.gst_amount,
            total_amount=invoice.total_amount,
            payment_method=invoice.payment_method,
            payment_date=invoice.payment_date,
            payment_reference=invoice.payment_reference,
            notes=invoice.notes,
            terms_conditions=invoice.terms_conditions,
            created_at=invoice.created_at,
            updated_at=invoice.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch invoice"
        )


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice_update: InvoiceUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Update an invoice (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            invoice_uuid = uuid.UUID(invoice_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        query = select(Invoice).where(Invoice.id == invoice_uuid)
        result = await db.execute(query)
        invoice = result.scalar_one_or_none()
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        # Update fields
        update_data = invoice_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(invoice, field):
                setattr(invoice, field, value)
        
        await db.commit()
        await db.refresh(invoice)
        
        logger.info(f"Invoice updated: {invoice.invoice_number} by {current_user.email}")
        
        return InvoiceResponse(
            id=str(invoice.id),
            invoice_number=invoice.invoice_number,
            order_id=invoice.order_id,
            customer_id=invoice.customer_id,
            customer_name=invoice.customer_name,
            customer_email=invoice.customer_email,
            customer_phone=invoice.customer_phone,
            customer_address=invoice.customer_address,
            invoice_date=invoice.invoice_date,
            due_date=invoice.due_date,
            status=invoice.status,
            items=invoice.items,
            subtotal=invoice.subtotal,
            gst_amount=invoice.gst_amount,
            total_amount=invoice.total_amount,
            payment_method=invoice.payment_method,
            payment_date=invoice.payment_date,
            payment_reference=invoice.payment_reference,
            notes=invoice.notes,
            terms_conditions=invoice.terms_conditions,
            created_at=invoice.created_at,
            updated_at=invoice.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update invoice"
        )


@router.post("/{invoice_id}/mark-paid")
async def mark_invoice_paid(
    invoice_id: str,
    payment_method: PaymentMethod,
    payment_reference: Optional[str] = None,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Mark an invoice as paid (Admin only)"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            invoice_uuid = uuid.UUID(invoice_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        query = select(Invoice).where(Invoice.id == invoice_uuid)
        result = await db.execute(query)
        invoice = result.scalar_one_or_none()
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        if invoice.status == InvoiceStatus.PAID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invoice is already marked as paid"
            )
        
        # Update invoice
        invoice.status = InvoiceStatus.PAID
        invoice.payment_method = payment_method
        invoice.payment_date = datetime.utcnow()
        invoice.payment_reference = payment_reference
        await db.commit()
        await db.refresh(invoice)
        
        logger.info(f"Invoice marked as paid: {invoice.invoice_number} by {current_user.email}")
        
        return {"message": "Invoice marked as paid successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking invoice as paid: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark invoice as paid"
        )


@router.get("/stats/summary")
async def get_invoice_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Get invoice statistics summary (Admin only)"""
    try:
        # Get counts by status
        status_counts = {}
        for status in InvoiceStatus:
            count_query = select(func.count(Invoice.id)).where(Invoice.status == status)
            count_result = await db.execute(count_query)
            count = count_result.scalar()
            status_counts[status.value] = count
        
        # Get counts by payment method
        payment_method_counts = {}
        for payment_method in PaymentMethod:
            count_query = select(func.count(Invoice.id)).where(Invoice.payment_method == payment_method)
            count_result = await db.execute(count_query)
            count = count_result.scalar()
            payment_method_counts[payment_method.value] = count
        
        # Get total revenue
        total_revenue_query = select(func.sum(Invoice.total_amount)).where(Invoice.status == InvoiceStatus.PAID)
        total_revenue_result = await db.execute(total_revenue_query)
        total_revenue = total_revenue_result.scalar() or 0
        
        # Get pending amount
        pending_amount_query = select(func.sum(Invoice.total_amount)).where(
            Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.DRAFT])
        )
        pending_amount_result = await db.execute(pending_amount_query)
        pending_amount = pending_amount_result.scalar() or 0
        
        # Get today's stats
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        today_invoices_query = select(func.count(Invoice.id)).where(
            Invoice.created_at >= today_start,
            Invoice.created_at <= today_end
        )
        today_invoices_result = await db.execute(today_invoices_query)
        today_invoices = today_invoices_result.scalar()
        
        today_revenue_query = select(func.sum(Invoice.total_amount)).where(
            Invoice.created_at >= today_start,
            Invoice.created_at <= today_end,
            Invoice.status == InvoiceStatus.PAID
        )
        today_revenue_result = await db.execute(today_revenue_query)
        today_revenue = today_revenue_result.scalar() or 0
        
        # Get overdue invoices
        overdue_invoices_query = select(func.count(Invoice.id)).where(
            Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.DRAFT]),
            Invoice.due_date < datetime.utcnow()
        )
        overdue_invoices_result = await db.execute(overdue_invoices_query)
        overdue_invoices = overdue_invoices_result.scalar()
        
        return {
            "status_counts": status_counts,
            "payment_method_counts": payment_method_counts,
            "total_revenue": total_revenue,
            "pending_amount": pending_amount,
            "today_invoices": today_invoices,
            "today_revenue": today_revenue,
            "overdue_invoices": overdue_invoices
        }
        
    except Exception as e:
        logger.error(f"Error fetching invoice stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch invoice statistics"
        )
