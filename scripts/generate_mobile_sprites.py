import os
import sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

SPRITE_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'sprites')

FILES_TO_PROCESS = [
    ('lipowy-v5.webp', 'lipowy-v5-mobile.webp'),
    ('gryczany-v3.webp', 'gryczany-v3-mobile.webp'),
    ('spadziowy-v2.webp', 'spadziowy-v2-mobile.webp'),
    ('wrzosowy-v2.webp', 'wrzosowy-v2-mobile.webp'),
    ('rzepakowy-v2.webp', 'rzepakowy-v2-mobile.webp'),
    ('akacja-v2.webp', 'akacja-v2-mobile.webp'),
]

def process_sprite(item):
    src_name, dst_name = item
    src_path = os.path.join(SPRITE_DIR, src_name)
    dst_path = os.path.join(SPRITE_DIR, dst_name)
    
    if not os.path.exists(src_path):
        print(f"[ERROR] Missing source: {src_path}")
        return
        
    print(f"[START] Processing {src_name} -> {dst_name}...")
    with Image.open(src_path) as im:
        orig_w, orig_h = im.size
        target_w = orig_w // 2
        target_h = orig_h // 2
        
        # High-quality Lanczos downsampling
        mobile_im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Save as optimized WebP with quality 80 and method 6
        mobile_im.save(dst_path, 'WEBP', quality=80, method=6)
        
    orig_sz = os.path.getsize(src_path)
    dst_sz = os.path.getsize(dst_path)
    reduction = (1 - dst_sz / orig_sz) * 100
    print(f"[DONE] {dst_name}: {dst_sz / (1024*1024):.2f} MB (was {orig_sz / (1024*1024):.2f} MB, -{reduction:.1f}%)")

def main():
    print(f"Target directory: {SPRITE_DIR}")
    with ProcessPoolExecutor() as executor:
        list(executor.map(process_sprite, FILES_TO_PROCESS))
    print("All mobile sprites generated successfully!")

if __name__ == '__main__':
    main()
