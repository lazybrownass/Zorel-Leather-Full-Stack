from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from typing import List, Optional
from datetime import datetime, date
from app.models.sqlalchemy_models import User, UserRole, Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceStatus, PaymentMethod
from app.core.security import require_roles
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import logging
from app.services.invoice_service import InvoiceAIValidator, generate_invoice_pdf

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
        
        # Note: Model may not have these fields; skip filters that don't exist
        if payment_method and hasattr(Invoice, "payment_method"):
            query = query.where(Invoice.payment_method == payment_method)
        if date_from and hasattr(Invoice, "created_at"):
            query = query.where(Invoice.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to and hasattr(Invoice, "created_at"):
            query = query.where(Invoice.created_at <= datetime.combine(date_to, datetime.max.time()))
        
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
        
        responses: List[InvoiceResponse] = []
        for invoice in invoices:
            responses.append(InvoiceResponse(
                id=str(invoice.id),
                invoice_number=invoice.invoice_number,
                order_id=invoice.order_id,
                customer_id=invoice.user_id,
                customer_name="",
                customer_email="",
                customer_phone=None,
                customer_address=invoice.billing_address,
                invoice_date=invoice.issue_date,
                due_date=invoice.due_date,
                status=InvoiceStatus.SENT,
                items=invoice.items,
                subtotal=invoice.subtotal,
                gst_amount=invoice.gst_amount,
                total_amount=invoice.total_amount,
                payment_method=invoice.payment_method,
                payment_date=getattr(invoice, "payment_date", None),
                payment_reference=getattr(invoice, "payment_reference", None),
                notes=None,
                terms_conditions=None,
                created_at=invoice.created_at,
                updated_at=invoice.updated_at
            ))
        
        return responses
        
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
            user_id=invoice_data.customer_id,
            issue_date=invoice_data.invoice_date,
            due_date=invoice_data.due_date,
            items=[item.model_dump() for item in invoice_data.items],
            subtotal=subtotal,
            gst_amount=gst_amount,
            total_amount=total_amount,
            billing_address=invoice_data.customer_address,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(invoice)
        await db.commit()
        await db.refresh(invoice)
        
        # Cross-check with AI if configured
        validator = InvoiceAIValidator()
        _ = await validator.validate_invoice({
            "invoice_number": invoice_number,
            "order_id": str(invoice.order_id),
            "customer_id": str(invoice.user_id),
            "items": invoice.items,
            "subtotal": subtotal,
            "gst_amount": gst_amount,
            "total_amount": total_amount,
        })
        logger.info(f"Invoice created: {invoice_number} by {current_user.email}")
        
        return InvoiceResponse(
            id=str(invoice.id),
            invoice_number=invoice.invoice_number,
            order_id=invoice.order_id,
            customer_id=invoice.user_id,
            customer_name=invoice_data.customer_name,
            customer_email=invoice_data.customer_email,
            customer_phone=invoice_data.customer_phone,
            customer_address=invoice.billing_address,
            invoice_date=invoice.issue_date,
            due_date=invoice.due_date,
            status=InvoiceStatus.SENT,
            items=invoice.items,
            subtotal=invoice.subtotal,
            gst_amount=invoice.gst_amount,
            total_amount=invoice.total_amount,
            payment_method=invoice.payment_method,
            payment_date=getattr(invoice, "payment_date", None),
            payment_reference=getattr(invoice, "payment_reference", None),
            notes=invoice_data.notes,
            terms_conditions=invoice_data.terms_conditions,
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
            customer_id=invoice.user_id,
            customer_name="",
            customer_email="",
            customer_phone=None,
            customer_address=invoice.billing_address,
            invoice_date=invoice.issue_date,
            due_date=invoice.due_date,
            status=InvoiceStatus.SENT,
            items=invoice.items,
            subtotal=invoice.subtotal,
            gst_amount=invoice.gst_amount,
            total_amount=invoice.total_amount,
            payment_method=invoice.payment_method,
            payment_date=getattr(invoice, "payment_date", None),
            payment_reference=getattr(invoice, "payment_reference", None),
            notes=None,
            terms_conditions=None,
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
        
        # Update fields that exist on the model only
        update_data = invoice_update.dict(exclude_unset=True)
        if "subtotal" in update_data:
            invoice.subtotal = update_data["subtotal"]
        if "gst_amount" in update_data:
            invoice.gst_amount = update_data["gst_amount"]
        if "total_amount" in update_data:
            invoice.total_amount = update_data["total_amount"]
        if "due_date" in update_data and hasattr(invoice, "due_date"):
            invoice.due_date = update_data["due_date"]
        if "items" in update_data:
            invoice.items = [item.model_dump() for item in update_data["items"]]
        
        await db.commit()
        await db.refresh(invoice)
        
        logger.info(f"Invoice updated: {invoice.invoice_number} by {current_user.email}")
        
        return InvoiceResponse(
            id=str(invoice.id),
            invoice_number=invoice.invoice_number,
            order_id=invoice.order_id,
            customer_id=invoice.user_id,
            customer_name=None,
            customer_email=None,
            customer_phone=None,
            customer_address=invoice.billing_address,
            invoice_date=invoice.issue_date,
            due_date=invoice.due_date,
            status=InvoiceStatus.SENT,
            items=invoice.items,
            subtotal=invoice.subtotal,
            gst_amount=invoice.gst_amount,
            total_amount=invoice.total_amount,
            payment_method=invoice.payment_method,
            payment_date=getattr(invoice, "payment_date", None),
            payment_reference=getattr(invoice, "payment_reference", None),
            notes=None,
            terms_conditions=None,
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
        
        # Update invoice payment fields if present
        if hasattr(invoice, "payment_method"):
            invoice.payment_method = payment_method
        if hasattr(invoice, "payment_date"):
            invoice.payment_date = datetime.utcnow()
        if hasattr(invoice, "payment_reference"):
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
        # Get counts by payment method if available
        payment_method_counts = {}
        if hasattr(Invoice, "payment_method"):
            for payment_method in PaymentMethod:
                count_query = select(func.count(Invoice.id)).where(Invoice.payment_method == payment_method)
                count_result = await db.execute(count_query)
                count = count_result.scalar()
                payment_method_counts[payment_method.value] = count
        
        # Get total revenue
        total_revenue_query = select(func.sum(Invoice.total_amount))
        total_revenue_result = await db.execute(total_revenue_query)
        total_revenue = total_revenue_result.scalar() or 0
        
        # Today's stats
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
            Invoice.created_at <= today_end
        )
        today_revenue_result = await db.execute(today_revenue_query)
        today_revenue = today_revenue_result.scalar() or 0
        
        return {
            "payment_method_counts": payment_method_counts,
            "total_revenue": total_revenue,
            "today_invoices": today_invoices,
            "today_revenue": today_revenue
        }
        
    except Exception as e:
        logger.error(f"Error fetching invoice stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch invoice statistics"
        )


# New: Generate invoice from an Order with optional VAT 18%
@router.post("/from-order/{order_id}", response_model=InvoiceResponse)
async def create_invoice_from_order(
    order_id: str,
    apply_vat: bool = Query(default=True, description="Apply VAT at 18% to subtotal"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create an invoice from an existing order. If apply_vat is true, charges VAT 18%."""
    try:
        import uuid
        from app.models.sqlalchemy_models import Order, OrderItem, Product
        
        # Validate order id
        try:
            order_uuid = uuid.UUID(order_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
        # Fetch order
        order_result = await db.execute(select(Order).where(Order.id == order_uuid))
        order = order_result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
        # Fetch items
        items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        order_items = items_result.scalars().all()
        
        # Optional: product names
        product_names = {}
        if order_items:
            product_ids = [item.product_id for item in order_items]
            products_result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
            for p in products_result.scalars().all():
                product_names[str(p.id)] = p.name
        
        # Build invoice items
        invoice_items = []
        subtotal = 0.0
        for item in order_items:
            unit_price = float(item.price)
            quantity = int(item.quantity)
            net_amount = unit_price * quantity
            subtotal += net_amount
            invoice_items.append({
                "product_id": str(item.product_id),
                "product_name": product_names.get(str(item.product_id), ""),
                "quantity": quantity,
                "unit_price": unit_price,
                "net_amount": net_amount,
                "gst_amount": 0.0,  # will set aggregate below
                "total_amount": net_amount
            })
        
        vat_rate = 0.18 if apply_vat else 0.0
        gst_amount = round(subtotal * vat_rate, 2)
        total_amount = round(subtotal + gst_amount, 2)
        
        # Generate invoice number
        invoice_count_query = select(func.count(Invoice.id))
        invoice_count_result = await db.execute(invoice_count_query)
        invoice_count = invoice_count_result.scalar()
        invoice_number = f"INV-{datetime.now().year}-{str(invoice_count + 1).zfill(6)}"
        
        # Create invoice
        new_invoice = Invoice(
            invoice_number=invoice_number,
            order_id=order.id,
            user_id=order.user_id,
            issue_date=datetime.utcnow(),
            due_date=None,
            items=invoice_items,
            subtotal=subtotal,
            gst_amount=gst_amount,
            total_amount=total_amount,
            billing_address=order.billing_address or order.shipping_address,
            shipping_address=order.shipping_address,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_invoice)
        await db.commit()
        await db.refresh(new_invoice)
        
        # Cross-check with AI if configured
        validator = InvoiceAIValidator()
        _ = await validator.validate_invoice({
            "invoice_number": new_invoice.invoice_number,
            "order_id": str(new_invoice.order_id),
            "customer_id": str(new_invoice.user_id),
            "items": new_invoice.items,
            "subtotal": new_invoice.subtotal,
            "gst_amount": new_invoice.gst_amount,
            "total_amount": new_invoice.total_amount,
        })
        
        return InvoiceResponse(
            id=str(new_invoice.id),
            invoice_number=new_invoice.invoice_number,
            order_id=new_invoice.order_id,
            customer_id=new_invoice.user_id,
            customer_name=getattr(order, "customer_name", ""),
            customer_email=getattr(order, "customer_email", ""),
            customer_phone=getattr(order, "customer_phone", None),
            customer_address=new_invoice.billing_address,
            invoice_date=new_invoice.issue_date,
            due_date=new_invoice.due_date,
            status=InvoiceStatus.SENT,
            items=new_invoice.items,
            subtotal=new_invoice.subtotal,
            gst_amount=new_invoice.gst_amount,
            total_amount=new_invoice.total_amount,
            payment_method=new_invoice.payment_method,
            payment_date=getattr(new_invoice, "payment_date", None),
            payment_reference=getattr(new_invoice, "payment_reference", None),
            notes=None,
            terms_conditions=None,
            created_at=new_invoice.created_at,
            updated_at=new_invoice.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating invoice from order: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create invoice from order")


@router.get("/{invoice_id}/download", response_class=Response)
async def download_invoice_pdf(
    invoice_id: str,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Generate and download the invoice as a branded PDF."""
    import uuid
    try:
        try:
            invoice_uuid = uuid.UUID(invoice_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        q = select(Invoice).where(Invoice.id == invoice_uuid)
        r = await db.execute(q)
        inv = r.scalar_one_or_none()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        payload = {
            "invoice_number": inv.invoice_number,
            "order_id": str(inv.order_id),
            "customer_id": str(inv.user_id),
            "customer_name": "",
            "customer_email": "",
            "customer_address": inv.billing_address,
            "invoice_date": inv.issue_date.strftime('%Y-%m-%d'),
            "due_date": inv.due_date.strftime('%Y-%m-%d') if inv.due_date else "-",
            "items": inv.items or [],
            "subtotal": inv.subtotal,
            "gst_amount": inv.gst_amount,
            "total_amount": inv.total_amount,
        }
        pdf_bytes = generate_invoice_pdf(payload)
        headers = {
            "Content-Disposition": f"attachment; filename=invoice-{inv.invoice_number}.pdf",
            "Content-Type": "application/pdf",
        }
        return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate PDF")
