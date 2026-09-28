import os
import cv2
import numpy as np
from PIL import Image

def heal_all():
    assets_dir = 'public/assets'
    os.makedirs(assets_dir, exist_ok=True)
    
    # 1. First, find spadziowy PNG files in assets_dir
    spad_f = None
    spad_b = None
    for f in os.listdir(assets_dir):
        if 'spad' in f and 'front' in f and f.endswith('.png'):
            spad_f = f
        if 'spad' in f and 'back' in f and f.endswith('.png'):
            spad_b = f
            
    print(f"Found spadziowy files: front='{spad_f}', back='{spad_b}'")
    
    varieties = [
        ('lipowy', 'wstega-lipowy-front.png', 'wstega-lipowy-back.png', 'wstega-lipowy'),
        ('akacjowy', 'akacjowy-front.png', 'akacjowy-back.png', 'akacjowy'),
        ('gryczany', 'gryczany-front.png', 'gryczany-back.png', 'gryczany'),
        ('rzepakowy', 'rzepakowy-front.png', 'rzepakowy-back.png', 'rzepakowy'),
        ('wrzosowy', 'wrzosowy-front.png', 'wrzosowy-back.png', 'wrzosowy'),
    ]
    if spad_f and spad_b:
        varieties.append(('spadziowy', spad_f, spad_b, 'spadziowy'))
    else:
        print("WARNING: Spadziowy source PNG files not found!")

    for var_id, f_file, b_file, out_prefix in varieties:
        print(f"\n--- Processing variety: {var_id} ---")
        f_path = os.path.join(assets_dir, f_file)
        b_path = os.path.join(assets_dir, b_file)
        
        f_img = Image.open(f_path).convert('RGBA')
        b_img = Image.open(b_path).convert('RGBA')
        
        f_arr = np.array(f_img)
        b_arr = np.array(b_img)
        
        # Unified healing algorithm for all varieties:
        fa = f_arr[:, :, 3]
        ba = b_arr[:, :, 3]
        
        mask_f = fa > 10
        mask_b = ba > 10
        comb_mask = mask_f | mask_b
        
        # 1. Fill hairline holes between front and back
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
            
        # 2. Dilate back mask by 35 pixels into front mask
        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71))
        dilated_b = cv2.dilate(mask_b.astype(np.uint8), dilate_kernel) > 0
        extend_b_mask = (dilated_b & mask_f) | holes
        
        new_b = b_arr.copy()
        new_b[extend_b_mask, :3] = comb[extend_b_mask, :3]
        new_b[extend_b_mask, 3] = 255 # 100% solid opacity under front!
        
        # 3. Clean any white fringe pixels on front
        new_f = f_arr.copy()
        fringe_f = (fa > 0) & (fa < 235) & (f_arr[:, :, 0] > 195) & (f_arr[:, :, 1] > 195) & (f_arr[:, :, 2] > 195) & extend_b_mask
        new_f[fringe_f, :3] = comb[fringe_f, :3]
        print(f"Cleaned fringe pixels: {np.sum(fringe_f)}")

        # Verification: compute composite over black background
        out_f_webp = os.path.join(assets_dir, f"{out_prefix}-front.webp")
        out_b_webp = os.path.join(assets_dir, f"{out_prefix}-back.webp")
        
        # Save high quality WebP
        pil_f = Image.fromarray(new_f)
        pil_b = Image.fromarray(new_b)
        
        pil_f.save(out_f_webp, format='WEBP', quality=95, method=4)
        pil_b.save(out_b_webp, format='WEBP', quality=95, method=4)
        print(f"Saved: {out_f_webp} ({os.path.getsize(out_f_webp)} bytes)")
        print(f"Saved: {out_b_webp} ({os.path.getsize(out_b_webp)} bytes)")
        
        # Check composite quality
        af_n = new_f[:, :, 3].astype(float) / 255.0
        ab_n = new_b[:, :, 3].astype(float) / 255.0
        aout = af_n + ab_n * (1.0 - af_n)
        
        # Check right seam (X: 1600..2100, Y: 950..1250)
        sub_aout_r = aout[950:1250, 1600:2100]
        sub_ribbon_r = (af_n[950:1250, 1600:2100] > 0.05) | (ab_n[950:1250, 1600:2100] > 0.05)
        # Check left seam (X: 350..550, Y: 600..800)
        sub_aout_l = aout[600:800, 350:550]
        sub_ribbon_l = (af_n[600:800, 350:550] > 0.05) | (ab_n[600:800, 350:550] > 0.05)
        
        # Right seam min alpha inside ribbon
        min_a_r = np.min(sub_aout_r[sub_ribbon_r]) if np.sum(sub_ribbon_r) > 0 else 1.0
        min_a_l = np.min(sub_aout_l[sub_ribbon_l]) if np.sum(sub_ribbon_l) > 0 else 1.0
        print(f"Quality Check: Right seam min alpha = {min_a_r:.4f}, Left seam min alpha = {min_a_l:.4f}")
        
    print("\nAll 6 variety ribbons healed and saved successfully!")

if __name__ == '__main__':
    heal_all()
