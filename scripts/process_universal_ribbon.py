import os
import cv2
import numpy as np
from PIL import Image, ImageFilter

def process_universal_ribbon():
    assets_dir = 'public/assets'
    
    # 1. Identify input files
    f_file = None
    b_file = None
    for f in os.listdir(assets_dir):
        if 'ogoln' in f and 'front' in f and f.endswith('.png'):
            f_file = os.path.join(assets_dir, f)
        if 'ogoln' in f and 'back' in f and f.endswith('.png'):
            b_file = os.path.join(assets_dir, f)
            
    if not f_file or not b_file:
        raise FileNotFoundError(f"Could not find universal ribbon files in {assets_dir}")
        
    print(f"Loading files:\n  Front: {f_file}\n  Back:  {b_file}")
    
    f_img = Image.open(f_file).convert('RGBA')
    b_img = Image.open(b_file).convert('RGBA')
    
    f_arr = np.array(f_img)
    b_arr = np.array(b_img)
    w, h = f_img.size
    
    # --- PHASE 1: SEAM HEALING & OVERLAP DILATION ---
    print("\n--- Phase 1: Healing seam & dilating underlap ---")
    fa = f_arr[:, :, 3]
    ba = b_arr[:, :, 3]
    
    mask_f = fa > 10
    mask_b = ba > 10
    comb_mask = mask_f | mask_b
    
    # Fill hairline holes between front and back
    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    closed = cv2.morphologyEx(comb_mask.astype(np.uint8), cv2.MORPH_CLOSE, close_kernel) > 0
    holes = closed & (~comb_mask)
    print(f"Holes filled: {np.sum(holes)} pixels")
    
    # Build combined continuous ribbon texture
    comb = np.zeros_like(f_arr)
    comb[mask_f, :3] = f_arr[mask_f, :3]
    comb[mask_b & ~mask_f, :3] = b_arr[mask_b & ~mask_f, :3]
    
    if np.sum(holes) > 0:
        inpaint_mask = holes.astype(np.uint8) * 255
        comb_bgr = cv2.inpaint(cv2.cvtColor(comb[:, :, :3], cv2.COLOR_RGB2BGR), inpaint_mask, 7, cv2.INPAINT_TELEA)
        comb[:, :, :3] = cv2.cvtColor(comb_bgr, cv2.COLOR_BGR2RGB)
        
    # Dilate back mask by 35 pixels into front mask
    dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71))
    dilated_b = cv2.dilate(mask_b.astype(np.uint8), dilate_kernel) > 0
    extend_b_mask = (dilated_b & mask_f) | holes
    
    new_b = b_arr.copy()
    new_b[extend_b_mask, :3] = comb[extend_b_mask, :3]
    new_b[extend_b_mask, 3] = 255  # 100% solid opacity under front!
    
    # Clean any fringe pixels on front
    new_f = f_arr.copy()
    fringe_f = (fa > 0) & (fa < 235) & (f_arr[:, :, 0] > 195) & (f_arr[:, :, 1] > 195) & (f_arr[:, :, 2] > 195) & extend_b_mask
    new_f[fringe_f, :3] = comb[fringe_f, :3]
    print(f"Cleaned fringe pixels: {np.sum(fringe_f)}")
    
    out_f_webp = os.path.join(assets_dir, 'wstega-ogolna-front.webp')
    out_b_webp = os.path.join(assets_dir, 'wstega-ogolna-back.webp')
    
    pil_f = Image.fromarray(new_f)
    pil_b = Image.fromarray(new_b)
    
    pil_f.save(out_f_webp, format='WEBP', quality=95, method=6)
    pil_b.save(out_b_webp, format='WEBP', quality=95, method=6)
    print(f"Saved optimized front WebP: {out_f_webp} ({os.path.getsize(out_f_webp)} bytes)")
    print(f"Saved optimized back WebP:  {out_b_webp} ({os.path.getsize(out_b_webp)} bytes)")
    
    # --- PHASE 2: GENERATE FLOOR REFLECTION ---
    print("\n--- Phase 2: Generating floor reflection ---")
    arr_f_float = new_f.astype(np.float32)
    alpha_clean = new_f[:, :, 3]
    y_indices, _ = np.where(alpha_clean > 50)
    pivot_y = int(y_indices.max())
    print(f"Ribbon lowest contact point pivot_y = {pivot_y}")
    
    scale_y = 0.65
    reflect_arr = np.zeros_like(arr_f_float)
    
    for y in range(pivot_y, h):
        dist = (y - pivot_y)
        src_y = int(pivot_y - dist / scale_y)
        if src_y >= 0:
            decay = max(0.0, 1.0 - (dist / 190.0)) ** 1.6
            decay *= 0.65 # max reflection opacity 65%
            reflect_arr[y, :, :3] = arr_f_float[src_y, :, :3] * 0.90 # slight floor shadow tint
            reflect_arr[y, :, 3] = arr_f_float[src_y, :, 3] * decay
            
    reflect_img = Image.fromarray(reflect_arr.astype(np.uint8), mode='RGBA')
    reflect_blurred = reflect_img.filter(ImageFilter.GaussianBlur(radius=3))
    out_reflect_webp = os.path.join(assets_dir, 'wstega-ogolna-floor-reflect.webp')
    reflect_blurred.save(out_reflect_webp, format='WEBP', quality=95, method=6)
    print(f"Saved floor reflection WebP: {out_reflect_webp} ({os.path.getsize(out_reflect_webp)} bytes)")
    
    # --- PHASE 3: GENERATE ORGANIC FLOOR CAUSTICS ---
    print("\n--- Phase 3: Generating organic floor caustics ---")
    r, g, b, a = arr_f_float[:, :, 0], arr_f_float[:, :, 1], arr_f_float[:, :, 2], arr_f_float[:, :, 3]
    
    # Extract lower ribbon loop
    mask_y = np.clip((np.arange(h)[:, None] - 700) / 400.0, 0, 1)
    caustic_alpha = (a / 255.0) * mask_y
    
    # Compute brightness
    brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0
    intensity = caustic_alpha * np.power(brightness, 1.35)
    
    # Coordinate grid for hotspot softening
    x_grid, y_grid = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    spot1_dist = np.sqrt(((x_grid - 0.369) / 0.08)**2 + ((y_grid - 0.834) / 0.08)**2)
    spot2_dist = np.sqrt(((x_grid - 0.698) / 0.08)**2 + ((y_grid - 0.807) / 0.08)**2)
    damping = 1.0 - 0.35 * np.exp(-spot1_dist**2) - 0.35 * np.exp(-spot2_dist**2)
    intensity *= damping
    
    # Target peak brightness
    curr_peak = intensity.max()
    if curr_peak > 0:
        intensity = intensity * (175.0 / curr_peak)
        
    # Tone mapping matching universal ribbon's rich warm amber color
    # Mean ribbon color is approx [215, 145, 55] in highlight zones
    amber_tint = np.array([225.0 / 255.0, 155.0 / 255.0, 52.0 / 255.0], dtype=np.float32)
    
    caustic_rgb = np.clip(intensity[:, :, None] * amber_tint[None, None, :] * 1.3, 0, 255).astype(np.uint8)
    caustic_a = np.clip(intensity * 1.25, 0, 255).astype(np.uint8)
    
    caustic_raw = Image.fromarray(np.dstack([caustic_rgb, caustic_a]), mode='RGBA')
    caustic_blurred = caustic_raw.filter(ImageFilter.GaussianBlur(radius=28))
    caustic_core = caustic_raw.filter(ImageFilter.GaussianBlur(radius=10))
    caustic_final = Image.alpha_composite(caustic_blurred, caustic_core)
    
    out_caustics_webp = os.path.join(assets_dir, 'wstega-ogolna-caustics.webp')
    caustic_final.save(out_caustics_webp, format='WEBP', quality=95, method=6)
    print(f"Saved floor caustics WebP:   {out_caustics_webp} ({os.path.getsize(out_caustics_webp)} bytes)")
    
    print("\n[SUCCESS] All universal ribbon assets generated and optimized successfully!")

if __name__ == '__main__':
    process_universal_ribbon()
