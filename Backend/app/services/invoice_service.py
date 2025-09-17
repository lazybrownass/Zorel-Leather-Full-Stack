from typing import List, Dict, Any
from datetime import datetime
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from app.core.config import settings

try:
    from openai import OpenAI  # type: ignore
    _openai_available = True
except Exception:
    OpenAI = None  # type: ignore
    _openai_available = False


class InvoiceAIValidator:
    def __init__(self):
        self.enabled = bool(settings.OPENAI_API_KEY and _openai_available)
        self.client = None
        if self.enabled:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def validate_invoice(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.enabled or not self.client:
            return {"ok": True, "notes": "AI validation skipped (no API key)"}
        try:
            content = [
                {
                    "type": "text",
                    "text": (
                        "You are a helpful auditor. Validate this invoice JSON for internal consistency. "
                        "Return JSON with fields: ok (boolean), findings (array of strings)."
                    ),
                },
                {"type": "text", "text": str(payload)},
            ]
            # Use responses API to avoid legacy chat names
            resp = self.client.responses.create(
                model="gpt-4o-mini",
                input=content,
                temperature=0.0,
            )
            text = resp.output_text  # type: ignore[attr-defined]
            # Basic parse; be resilient
            ok = "true" in text.lower() if "ok" in text.lower() else True
            return {"ok": ok, "notes": text}
        except Exception as e:
            return {"ok": True, "notes": f"AI validation error ignored: {e}"}


def generate_invoice_pdf(invoice: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    elements: List[Any] = []

    brand_title = "ZOREL LEATHER"
    brand_subtitle = "Premium Leather Goods"

    elements.append(Paragraph(brand_title, styles["Title"]))
    elements.append(Paragraph(brand_subtitle, styles["Italic"]))
    elements.append(Spacer(1, 8))

    header_table_data = [
        [
            Paragraph(f"Invoice #: <b>{invoice.get('invoice_number','')}</b>", styles["Normal"]),
            Paragraph(f"Date: {invoice.get('invoice_date','')}", styles["Normal"]),
        ],
        [
            Paragraph(f"Order ID: {invoice.get('order_id','')}", styles["Normal"]),
            Paragraph(f"Due: {invoice.get('due_date','-')}", styles["Normal"]),
        ],
    ]
    header_table = Table(header_table_data, colWidths=[90*mm, 70*mm])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.whitesmoke),
        ('INNERGRID', (0,0), (-1,-1), 0.25, colors.lightgrey),
        ('BOX', (0,0), (-1,-1), 0.25, colors.lightgrey),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))

    customer_lines = [
        Paragraph("Bill To:", styles["Heading4"]),
        Paragraph(invoice.get('customer_name', ''), styles["Normal"]),
        Paragraph(invoice.get('customer_email', ''), styles["Normal"]),
    ]
    address = invoice.get('customer_address') or {}
    if isinstance(address, dict):
        line = ", ".join(str(address.get(k, '')) for k in ["address", "city", "state", "postalCode", "country"] if address.get(k))
        if line:
            customer_lines.append(Paragraph(line, styles["Normal"]))
    elements.extend(customer_lines)
    elements.append(Spacer(1, 8))

    items: List[Dict[str, Any]] = invoice.get('items', []) or []
    table_data: List[List[Any]] = [["Item", "Qty", "Unit Price", "Amount"]]
    for it in items:
        table_data.append([
            it.get('product_name') or it.get('product_id', ''),
            str(it.get('quantity', 0)),
            f"{it.get('unit_price', 0):.2f}",
            f"{it.get('net_amount', 0):.2f}",
        ])
    items_table = Table(table_data, colWidths=[90*mm, 20*mm, 25*mm, 25*mm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 0.25, colors.grey),
        ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 10))

    subtotal = float(invoice.get('subtotal', 0))
    tax = float(invoice.get('gst_amount', 0))
    total = float(invoice.get('total_amount', 0))
    totals_table = Table([
        ["Subtotal", f"{subtotal:.2f}"],
        ["VAT (18%)", f"{tax:.2f}"],
        ["Total", f"{total:.2f}"],
    ], colWidths=[110*mm, 50*mm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('LINEABOVE', (0,2), (-1,2), 0.5, colors.black),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("Thank you for choosing Zorel Leather.", styles["Normal"]))
    elements.append(Paragraph("www.zorelleather.com", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


