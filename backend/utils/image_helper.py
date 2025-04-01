import os
import logging
import uuid
from typing import List, Optional
import shutil

logger = logging.getLogger(__name__)

class ImageHelper:
    """Helper class for image handling operations"""

    def __init__(self, uploads_dir: str):
        """Initialize with the directory path for uploads"""
        self.uploads_dir = uploads_dir
        logger.info(f"ImageHelper initialized with uploads directory: {uploads_dir}")

    def verify_uploads_directory(self) -> bool:
        """Ensure the uploads directory exists and is writable"""
        try:
            if not os.path.exists(self.uploads_dir):
                logger.info(f"Creating uploads directory: {self.uploads_dir}")
                os.makedirs(self.uploads_dir, exist_ok=True)
            
            # Verify write permissions by creating a test file
            test_file_path = os.path.join(self.uploads_dir, "test_write_permission.txt")
            with open(test_file_path, "w") as f:
                f.write("Test write permission")
            os.remove(test_file_path)
            
            logger.info(f"Uploads directory verified: {self.uploads_dir}")
            return True
        except Exception as e:
            logger.error(f"Error verifying uploads directory: {str(e)}")
            return False

    def generate_image_name(self, original_filename: str = None) -> str:
        """Generate a unique filename for an image"""
        # Generate a random UUID
        random_id = uuid.uuid4().hex
        
        # If original filename provided, get its extension
        extension = ".jpg"  # Default extension
        if original_filename:
            _, ext = os.path.splitext(original_filename)
            if ext:
                extension = ext
        
        return f"{random_id}{extension}"

    def save_image(self, image_file, filename: str = None) -> Optional[str]:
        """Save an image file and return the saved filename"""
        try:
            # Generate a unique name if none provided
            if not filename:
                filename = self.generate_image_name(getattr(image_file, 'filename', None))
            
            # Create the full path
            file_path = os.path.join(self.uploads_dir, filename)
            
            # Save the file
            with open(file_path, "wb") as f:
                # If it's a file-like object, read in chunks
                if hasattr(image_file, 'read'):
                    shutil.copyfileobj(image_file, f)
                # If it's bytes, write directly
                elif isinstance(image_file, bytes):
                    f.write(image_file)
                else:
                    logger.error(f"Unsupported image file type: {type(image_file)}")
                    return None
            
            logger.info(f"Image saved: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Error saving image: {str(e)}")
            return None

    def delete_image(self, filename: str) -> bool:
        """Delete an image file"""
        try:
            file_path = os.path.join(self.uploads_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Image deleted: {filename}")
                return True
            else:
                logger.warning(f"Image not found for deletion: {filename}")
                return False
        except Exception as e:
            logger.error(f"Error deleting image {filename}: {str(e)}")
            return False

    def get_image_path(self, filename: str) -> str:
        """Get the full path to an image"""
        return os.path.join(self.uploads_dir, filename)

    def check_image_exists(self, filename: str) -> bool:
        """Check if an image exists"""
        file_path = os.path.join(self.uploads_dir, filename)
        exists = os.path.exists(file_path)
        logger.info(f"Checking image {filename}: {'exists' if exists else 'not found'}")
        return exists

    def list_images(self) -> List[str]:
        """List all images in the uploads directory"""
        try:
            files = [f for f in os.listdir(self.uploads_dir) 
                    if os.path.isfile(os.path.join(self.uploads_dir, f))]
            return files
        except Exception as e:
            logger.error(f"Error listing images: {str(e)}")
            return []
