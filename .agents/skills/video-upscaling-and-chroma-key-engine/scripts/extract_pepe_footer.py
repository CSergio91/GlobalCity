#!/usr/bin/env python3
"""
Full Pepe Footer Chroma Key Extraction & Animated WebP Compilation
Part of Eklipse Video Upscaling and Chroma Key Engine Skill
"""

import sys
import os
import time
import cv2
from rembg import remove, new_session
from PIL import Image
import numpy as np


def process_pepe_video(
    input_path: str = "src/assets/video/footer.mp4",
    output_webp: str = "src/assets/images/pepe_footer.webp",
    step: int = 2,           # Step 2 = 12 fps from 24 fps video
    target_width: int = 580, # Clean retina resolution
    target_height: int = 500,
    quality: int = 82
):
    print("=" * 65)
    print("EKLIPSE PEPE FOOTER EXTRACTION (AI Salient ISNet + Alpha WebP)")
    print("=" * 65)
    print(f"Input Video:   {input_path}")
    print(f"Output WebP:   {output_webp}")
    print(f"Frame Step:    Every {step} frames (~12 fps)")
    print(f"Target Size:   {target_width}x{target_height}")
    print("-" * 65)

    if not os.path.exists(input_path):
        print(f"[ERROR] Input video not found: {input_path}")
        return False

    session = new_session("isnet-general-use")
    cap = cv2.VideoCapture(input_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 240

    frames = []
    start_time = time.time()
    read_idx = 0
    saved_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if read_idx % step == 0:
            rgb_in = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_im = Image.fromarray(rgb_in)
            # 1. AI Salient background removal
            out = remove(pil_im, session=session)
            arr = np.array(out)

            # 2. Separate channels
            rgb = arr[:, :, :3].astype(np.float32)
            alpha = arr[:, :, 3].astype(np.float32)

            # 3. Clean alpha haze (threshold cut at 40)
            alpha[alpha < 40] = 0

            # 4. Linear stretch remaining alpha
            alpha = np.where(alpha >= 40, (alpha - 40) / (230 - 40) * 255, 0)
            alpha = np.clip(alpha, 0, 255).astype(np.uint8)

            # 5. 1-pixel morphological erosion on alpha to strip green boundary
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            alpha = cv2.erode(alpha, kernel, iterations=1)

            # 6. Color Despill on edge pixels
            edge_mask = (alpha > 0) & (alpha < 250)
            r = rgb[:, :, 0]
            g = rgb[:, :, 1]
            b = rgb[:, :, 2]
            max_rb = np.maximum(r, b)
            excess = np.maximum(0, g - max_rb)
            g[edge_mask] = np.clip(g[edge_mask] - excess[edge_mask] * 1.0, 0, 255)
            rgb[:, :, 1] = g
            rgb = np.clip(rgb, 0, 255).astype(np.uint8)

            # 7. Assemble cleaned RGBA
            cleaned = np.dstack((rgb, alpha))
            pil_clean = Image.fromarray(cleaned, mode="RGBA")

            # 8. Crop Pepe bounding box (380, 20, 1620, 1080)
            cropped = pil_clean.crop((380, 20, 1620, 1080))
            # Resize with Lanczos
            resized = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
            frames.append(resized)
            saved_count += 1

            elapsed = time.time() - start_time
            expected_total = total_frames // step
            fps_proc = saved_count / elapsed if elapsed > 0 else 0
            sys.stdout.write(f"\rExtracted frame {saved_count}/{expected_total} (Video frame {read_idx}/{total_frames}) - {fps_proc:.2f} fps")
            sys.stdout.flush()

        read_idx += 1

    cap.release()
    sys.stdout.write("\n")

    if not frames:
        print("[ERROR] No frames extracted.")
        return False

    print("Compiling animated WebP with transparency loop...")
    os.makedirs(os.path.dirname(os.path.abspath(output_webp)), exist_ok=True)
    frames[0].save(
        output_webp,
        save_all=True,
        append_images=frames[1:],
        duration=int(1000 / (24 / step)), # e.g. 83ms for 12 fps
        loop=0,
        quality=quality,
        method=4
    )

    total_time = time.time() - start_time
    file_size_mb = os.path.getsize(output_webp) / (1024 * 1024)
    print("-" * 65)
    print(f"[SUCCESS] Pepe Footer Animated WebP generated successfully!")
    print(f"Total animation frames: {saved_count}")
    print(f"Elapsed time:           {total_time:.2f}s")
    print(f"Output file size:       {file_size_mb:.2f} MB")
    print(f"Saved at:               {output_webp}")
    print("=" * 65)
    return True

if __name__ == "__main__":
    process_pepe_video()
