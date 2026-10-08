#!/usr/bin/env python3
"""
Chroma Key Extractor (Green Screen Removal with Green Despill & Smooth Alpha Feathering)
Part of Eklipse Video Upscaling and Chroma Key Engine Skill
"""

import sys
import os
import time
import argparse
import cv2
import numpy as np
from PIL import Image

def extract_chroma_key(
    input_path: str,
    output_dir: str,
    lower_h: int = 35,
    upper_h: int = 85,
    min_s: int = 50,
    min_v: int = 50,
    feather_radius: float = 1.2,
    despill: bool = True,
    target_width: int = 0,
    target_height: int = 0,
    webp_quality: int = 90
):
    if not os.path.exists(input_path):
        print(f"[ERROR] Input video not found: {input_path}")
        return False

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {input_path}")
        return False

    orig_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0

    out_w = target_width if target_width > 0 else orig_w
    out_h = target_height if target_height > 0 else orig_h

    print("=" * 65)
    print("EKLIPSE CHROMA KEY EXTRACTION ENGINE (Green Despill + Anti-Aliased Alpha)")
    print("=" * 65)
    print(f"Input:        {input_path}")
    print(f"Output Dir:   {output_dir}")
    print(f"Resolution:   {orig_w}x{orig_h} -> {out_w}x{out_h}")
    print(f"Total Frames: {total_frames} @ {fps:.1f} fps")
    print(f"HSV Green:    H=[{lower_h}, {upper_h}], S>={min_s}, V>={min_v}")
    print(f"Despill:      {despill}")
    print(f"Feathering:   {feather_radius} px")
    print("-" * 65)

    os.makedirs(output_dir, exist_ok=True)
    lower_green = np.array([lower_h, min_s, min_v], dtype=np.uint8)
    upper_green = np.array([upper_h, 255, 255], dtype=np.uint8)

    start_time = time.time()
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if target_width > 0 and target_height > 0 and (orig_w != out_w or orig_h != out_h):
            frame = cv2.resize(frame, (out_w, out_h), interpolation=cv2.INTER_LANCZOS4)

        # 1. Convert to HSV for robust color isolation
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # 2. Threshold to detect green background mask
        green_mask = cv2.inRange(hsv, lower_green, upper_green)

        # 3. Clean mask with morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel)
        green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel)

        # 4. Invert mask to get foreground alpha (255 = keep, 0 = transparent)
        alpha = cv2.bitwise_not(green_mask)

        # 5. Anti-aliasing / feathering on alpha channel
        if feather_radius > 0:
            alpha = cv2.GaussianBlur(alpha, (0, 0), feather_radius)

        # 6. Green Despill / Color Spill Suppression
        # Suppress reflected green hue on subject edges
        bgr = frame.astype(np.float32)
        if despill:
            b = bgr[:, :, 0]
            g = bgr[:, :, 1]
            r = bgr[:, :, 2]
            max_rb = np.maximum(r, b)
            excess_green = np.maximum(0, g - max_rb)
            # Neutralize excess green towards average of red and blue
            bgr[:, :, 1] = g - excess_green * 0.85
            bgr = np.clip(bgr, 0, 255).astype(np.uint8)
        else:
            bgr = frame

        # 7. Assemble RGBA 4-channel image
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        rgba = np.dstack((rgb, alpha))

        # 8. Save as crystal-clear transparent WebP
        pil_img = Image.fromarray(rgba, mode="RGBA")
        out_filename = os.path.join(output_dir, f"frame_{frame_idx:03d}.webp")
        pil_img.save(out_filename, "WEBP", quality=webp_quality, method=5)

        frame_idx += 1
        if frame_idx % 20 == 0 or frame_idx == total_frames:
            elapsed = time.time() - start_time
            fps_proc = frame_idx / elapsed if elapsed > 0 else 0
            pct = (frame_idx / total_frames * 100) if total_frames > 0 else 0
            sys.stdout.write(f"\rProcessing frame {frame_idx}/{total_frames} [{pct:5.1f}%] - {fps_proc:.1f} fps")
            sys.stdout.flush()

    sys.stdout.write("\n")
    cap.release()

    total_time = time.time() - start_time
    print("-" * 65)
    print(f"[SUCCESS] Chroma Key extraction complete!")
    print(f"Total transparent frames: {frame_idx}")
    print(f"Time elapsed:             {total_time:.2f}s")
    print(f"Saved in directory:       {output_dir}")
    print("=" * 65)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract green screen video with alpha transparency & despill")
    parser.add_argument("--input", required=True, help="Path to input green-screen video")
    parser.add_argument("--output", default="public/pepe-sequence", help="Directory for output WebP frames")
    parser.add_argument("--width", type=int, default=0, help="Target width (0 = keep original)")
    parser.add_argument("--height", type=int, default=0, help="Target height (0 = keep original)")
    parser.add_argument("--feather", type=float, default=1.2, help="Alpha feathering radius (default: 1.2)")
    parser.add_argument("--quality", type=int, default=90, help="WebP quality (default: 90)")
    args = parser.parse_args()

    extract_chroma_key(
        input_path=args.input,
        output_dir=args.output,
        target_width=args.width,
        target_height=args.height,
        feather_radius=args.feather,
        webp_quality=args.quality
    )
