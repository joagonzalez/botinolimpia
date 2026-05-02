import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Error: The 'Pillow' library is required to generate thumbnails.")
    print("Please run: pip install Pillow")
    sys.exit(1)

IMG_LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'img', 'logs')

def generate_thumbnails():
    if not os.path.exists(IMG_LOGS_DIR):
        print(f"Error: Directory {IMG_LOGS_DIR} not found.")
        return

    for img_name in os.listdir(IMG_LOGS_DIR):
        if img_name.lower().endswith('.jpg') and not img_name.startswith('thumb_'):
            full_path = os.path.join(IMG_LOGS_DIR, img_name)
            thumb_path = os.path.join(IMG_LOGS_DIR, f"thumb_{img_name}")
            
            if not os.path.exists(thumb_path):
                print(f"Generating thumbnail for {img_name}...")
                with Image.open(full_path) as img:
                    # Resize max 400x400 keeping aspect ratio
                    img.thumbnail((400, 400))
                    # Save optimized
                    img.save(thumb_path, "JPEG", quality=75, optimize=True)
                    print(f"Saved {thumb_path}")
            else:
                print(f"Thumbnail for {img_name} already exists.")

if __name__ == "__main__":
    print("Starting thumbnail generation...")
    generate_thumbnails()
    print("Done!")
