import aiofiles
import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class FileService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        
        # Create upload directories
        os.makedirs(f"{self.upload_dir}/products", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/reviews", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/users", exist_ok=True)

    async def save_uploaded_file(
        self, 
        file: UploadFile, 
        subfolder: str = "products",
        resize: Optional[tuple] = None
    ) -> str:
        """Save uploaded file and return the file path"""
        try:
            # Validate file size
            if file.size and file.size > self.max_file_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds maximum allowed size of {self.max_file_size} bytes"
                )
            
            # Validate file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in self.allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(self.allowed_extensions)}"
                )
            
            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(self.upload_dir, subfolder, unique_filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Resize image if requested
            if resize and file_extension in {'.jpg', '.jpeg', '.png', '.gif', '.webp'}:
                await self._resize_image(file_path, resize)
            
            # Return relative path for URL generation
            return f"/uploads/{subfolder}/{unique_filename}"
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save file")

    async def save_multiple_files(
        self, 
        files: List[UploadFile], 
        subfolder: str = "products",
        resize: Optional[tuple] = None
    ) -> List[str]:
        """Save multiple uploaded files"""
        saved_files = []
        for file in files:
            try:
                file_path = await self.save_uploaded_file(file, subfolder, resize)
                saved_files.append(file_path)
            except Exception as e:
                logger.error(f"Error saving file {file.filename}: {str(e)}")
                # Continue with other files
                continue
        
        return saved_files

    async def _resize_image(self, file_path: str, size: tuple):
        """Resize image to specified dimensions"""
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize image
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Save resized image
                img.save(file_path, 'JPEG', quality=85, optimize=True)
                
        except Exception as e:
            logger.error(f"Error resizing image {file_path}: {str(e)}")

    async def delete_file(self, file_path: str) -> bool:
        """Delete a file"""
        try:
            # Remove /uploads/ prefix if present
            if file_path.startswith('/uploads/'):
                file_path = file_path[9:]  # Remove '/uploads/'
            
            full_path = os.path.join(self.upload_dir, file_path)
            
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}")
            return False

    async def delete_multiple_files(self, file_paths: List[str]) -> int:
        """Delete multiple files and return count of deleted files"""
        deleted_count = 0
        for file_path in file_paths:
            if await self.delete_file(file_path):
                deleted_count += 1
        return deleted_count

    def get_file_url(self, file_path: str) -> str:
        """Generate full URL for a file"""
        if file_path.startswith('http'):
            return file_path
        
        # Remove leading slash if present
        if file_path.startswith('/'):
            file_path = file_path[1:]
        
        # In production, this would be your CDN or static file server URL
        base_url = "http://localhost:8000"  # This should come from settings
        return f"{base_url}/{file_path}"

    async def optimize_image(self, file_path: str, quality: int = 85) -> bool:
        """Optimize image for web"""
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Save optimized image
                img.save(file_path, 'JPEG', quality=quality, optimize=True)
                return True
                
        except Exception as e:
            logger.error(f"Error optimizing image {file_path}: {str(e)}")
            return False
