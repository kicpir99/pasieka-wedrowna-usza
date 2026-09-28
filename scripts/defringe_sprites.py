import os
import time
import cv2
import numpy as np
from PIL import Image

def defringe_sprite(file_path: str, backup_dir: str):
    base_name = os.path.basename(file_path)
    backup_path = os.path.join(backup_dir, base_name)
    
    # Keep original backup intact
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(file_path, backup_path)
        print(f"Backed up {file_path} -> {backup_path}")
    
    t0 = time.time()
    # Always read from clean original backup to prevent double erosion
    img = Image.open(backup_path).convert('RGBA')
    arr = np.array(img)
    w, h = img.size
    print(f"\nProcessing {base_name} ({w}x{h})...")
    
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]
    mask = (alpha > 50).astype(np.uint8)
    
    # 1. Morphological erosion by 1 pixel to detect contaminated outer border
    k3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    eroded = cv2.erode(mask, k3)
    b1 = (mask == 1) & (eroded == 0)
    
    # 2. Inpaint contaminated boundary pixels from clean interior
    # (replaces black studio background residue with authentic glass/honey/cloth colors)
    inpaint_mask = b1.astype(np.uint8) * 255
    rgb_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    clean_bgr = cv2.inpaint(rgb_bgr, inpaint_mask, 3, cv2.INPAINT_TELEA)
    clean_rgb = cv2.cvtColor(clean_bgr, cv2.COLOR_BGR2RGB)
    
    # 3. Silky-smooth subpixel anti-aliased alpha edge (Gaussian feathering)
    # Eliminates hard stair-stepped aliasing and black outlines on light ribbons
    blurred_alpha = cv2.GaussianBlur(eroded.astype(np.float32), (5, 5), 0.9)
    smooth_alpha = np.clip(blurred_alpha * (255.0 / 0.85), 0, 255).astype(np.uint8)
    
    # Assemble cleaned RGBA image
    res = np.dstack([clean_rgb, smooth_alpha])
    out_img = Image.fromarray(res)
    
    t1 = time.time()
    # Save optimized WebP with full alpha quality
    out_img.save(file_path, format='WEBP', quality=95, method=4, alpha_quality=100)
    t2 = time.time()
    
    print(f"Defringed {base_name} in {t1-t0:.2f}s, saved in {t2-t1:.2f}s (Total: {t2-t0:.2f}s)")

def main():
    sprites_dir = 'public/sprites'
    backup_dir = os.path.join(sprites_dir, 'backup')
    os.makedirs(backup_dir, exist_ok=True)
    
    target_sprites = [
        'rzepakowy-v2.webp',
        'akacja-v2.webp',
        'lipowy-v5.webp',
        'gryczany-v3.webp',
        'spadziowy-v2.webp',
        'wrzosowy-v2.webp',
        'rzepakowy.webp',
        'akacja.webp',
        'lipowy.webp',
        'gryczany.webp',
        'spadziowy.webp',
        'wrzosowy.webp',
    ]
    
    print(f"Starting defringing pipeline for {len(target_sprites)} sprite sheets...")
    for s in target_sprites:
        p = os.path.join(sprites_dir, s)
        if os.path.exists(p):
            defringe_sprite(p, backup_dir)
        else:
            print(f"File not found: {p}")
            
    print("\nAll sprite sheets successfully defringed and smoothed!")

if __name__ == '__main__':
    main()
