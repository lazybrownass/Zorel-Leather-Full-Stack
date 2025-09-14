from typing import Optional
from datetime import datetime
from app.models.inventory import Inventory, InventoryUpdate, InventoryStatus, InventoryMovement
from app.models.sqlalchemy_models import Product
from app.core.exceptions import NotFoundException, ValidationException
import logging

logger = logging.getLogger(__name__)


class InventoryService:
    async def get_inventory(self, product_id: str) -> Optional[Inventory]:
        """Get inventory for a product"""
        return await Inventory.find_one(Inventory.product_id == product_id)

    async def create_inventory(self, product_id: str, initial_stock: int, low_stock_threshold: int = 10) -> Inventory:
        """Create inventory record for a new product"""
        inventory = Inventory(
            product_id=product_id,
            current_stock=initial_stock,
            available_stock=initial_stock,
            low_stock_threshold=low_stock_threshold,
            status=InventoryStatus.IN_STOCK if initial_stock > 0 else InventoryStatus.OUT_OF_STOCK
        )
        
        # Add initial movement
        inventory.movements.append(InventoryMovement(
            type="in",
            quantity=initial_stock,
            reason="Initial stock"
        ))
        
        # Note: This would need to be called with a database session
        # db.add(inventory)
        # await db.commit()
        # await db.refresh(inventory)
        return inventory

    async def update_stock(
        self, 
        product_id: str, 
        quantity_change: int, 
        reason: str,
        reference_id: Optional[str] = None
    ) -> Inventory:
        """Update stock levels"""
        inventory = await self.get_inventory(product_id)
        if not inventory:
            raise NotFoundException("Inventory not found for product")

        # Calculate new stock
        new_stock = inventory.current_stock + quantity_change
        if new_stock < 0:
            raise ValidationException("Insufficient stock")

        # Update inventory
        inventory.current_stock = new_stock
        inventory.available_stock = new_stock - inventory.reserved_stock
        inventory.last_updated = datetime.utcnow()

        # Add movement record
        movement_type = "in" if quantity_change > 0 else "out"
        inventory.movements.append(InventoryMovement(
            type=movement_type,
            quantity=abs(quantity_change),
            reason=reason,
            reference_id=reference_id
        ))

        # Update status based on stock levels
        await self._update_inventory_status(inventory)
        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(inventory)

        return inventory

    async def reserve_stock(self, product_id: str, quantity: int, order_id: str) -> bool:
        """Reserve stock for an order"""
        inventory = await self.get_inventory(product_id)
        if not inventory:
            raise NotFoundException("Inventory not found for product")

        if inventory.available_stock < quantity:
            return False

        inventory.reserved_stock += quantity
        inventory.available_stock -= quantity
        inventory.last_updated = datetime.utcnow()

        # Add movement record
        inventory.movements.append(InventoryMovement(
            type="reserve",
            quantity=quantity,
            reason=f"Reserved for order {order_id}",
            reference_id=order_id
        ))

        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(inventory)
        return True

    async def release_stock(self, product_id: str, quantity: int, order_id: str) -> bool:
        """Release reserved stock"""
        inventory = await self.get_inventory(product_id)
        if not inventory:
            raise NotFoundException("Inventory not found for product")

        if inventory.reserved_stock < quantity:
            return False

        inventory.reserved_stock -= quantity
        inventory.available_stock += quantity
        inventory.last_updated = datetime.utcnow()

        # Add movement record
        inventory.movements.append(InventoryMovement(
            type="release",
            quantity=quantity,
            reason=f"Released from order {order_id}",
            reference_id=order_id
        ))

        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(inventory)
        return True

    async def consume_stock(self, product_id: str, quantity: int, order_id: str) -> bool:
        """Consume reserved stock (when order is confirmed)"""
        inventory = await self.get_inventory(product_id)
        if not inventory:
            raise NotFoundException("Inventory not found for product")

        if inventory.reserved_stock < quantity:
            return False

        inventory.reserved_stock -= quantity
        inventory.current_stock -= quantity
        inventory.last_updated = datetime.utcnow()

        # Add movement record
        inventory.movements.append(InventoryMovement(
            type="consume",
            quantity=quantity,
            reason=f"Consumed for order {order_id}",
            reference_id=order_id
        ))

        # Update status
        await self._update_inventory_status(inventory)
        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(inventory)

        return True

    async def _update_inventory_status(self, inventory: Inventory):
        """Update inventory status based on stock levels"""
        if inventory.current_stock <= 0:
            inventory.status = InventoryStatus.OUT_OF_STOCK
        elif inventory.current_stock <= inventory.low_stock_threshold:
            inventory.status = InventoryStatus.LOW_STOCK
        else:
            inventory.status = InventoryStatus.IN_STOCK

    async def get_low_stock_products(self) -> list[Inventory]:
        """Get products with low stock"""
        # Note: This would need to be called with a database session
        # from sqlalchemy import select
        # result = await db.execute(select(Inventory).where(Inventory.status == InventoryStatus.LOW_STOCK))
        # return result.scalars().all()
        return []

    async def get_out_of_stock_products(self) -> list[Inventory]:
        """Get out of stock products"""
        # Note: This would need to be called with a database session
        # from sqlalchemy import select
        # result = await db.execute(select(Inventory).where(Inventory.status == InventoryStatus.OUT_OF_STOCK))
        # return result.scalars().all()
        return []

    async def check_availability(self, product_id: str, quantity: int) -> bool:
        """Check if product is available in requested quantity"""
        inventory = await self.get_inventory(product_id)
        if not inventory:
            return False
        
        return inventory.available_stock >= quantity

    async def get_inventory_movements(self, product_id: str, limit: int = 50) -> list[InventoryMovement]:
        """Get inventory movement history for a product"""
        inventory = await self.get_inventory(product_id)
        if not inventory:
            return []
        
        # Return last N movements
        return inventory.movements[-limit:] if inventory.movements else []

    async def bulk_update_stock(self, updates: list[dict]) -> list[Inventory]:
        """Bulk update stock for multiple products"""
        results = []
        for update in updates:
            try:
                inventory = await self.update_stock(
                    update["product_id"],
                    update["quantity_change"],
                    update["reason"],
                    update.get("reference_id")
                )
                results.append(inventory)
            except Exception as e:
                logger.error(f"Error updating stock for product {update.get('product_id')}: {str(e)}")
                continue
        
        return results
