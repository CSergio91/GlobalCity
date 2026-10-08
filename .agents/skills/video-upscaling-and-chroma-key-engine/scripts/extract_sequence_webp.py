#!/usr/bin/env python3
"""
WebP Frame Sequence Generator with Lanczos-4 & Unsharp Masking
Part of Eklipse Video Upscaling and Chroma Key Engine Skill
"""

import sys
import os
import time
import argparse
import cv2
from PIL import Image

def extract_webp_sequence(
    input_path: str,
    output_dir: str = "public/eklipse-sequence",
    target_width: int = 3840,
    target_height: int = 2160,
    sharpness_amount: float = 0.35,
    gaussian_sigma: float = 1.4,
    webp_quality: int = 82,
    webp_method: int = 5
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

    print("=" * 65)
    print("EKLIPSE 4K WEBP SEQUENCE EXTRACTOR (Lanczos-4 + Unsharp Mask)")
    print("=" * 65)
    print(f"Input Video:  {input_path}")
    print(f"Output Dir:   {output_dir}")
    print(f"Original:     {orig_w}x{orig_h} ({total_frames} frames)")
    print(f"Target Frame: {target_width}x{target_height} UHD")
    print(f"WebP Config:  Quality={webp_quality}, Method={webp_method}")
    print("-" * 65)

    os.makedirs(output_dir, exist_ok=True)
    start_time = time.time()
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 1. Lanczos-4 Spatial Upsampling
        upscaled = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_LANCZOS4)

        # 2. Adaptive Unsharp Masking
        if sharpness_amount > 0:
            blur = cv2.GaussianBlur(upscaled, (0, 0), gaussian_sigma)
            enhanced = cv2.addWeighted(upscaled, 1.0 + sharpness_amount, blur, -sharpness_amount, 0)
        else:
            enhanced = upscaled

        # 3. Save as WebP
        rgb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        out_filename = os.path.join(output_dir, f"frame_{frame_idx:03d}.webp")
        pil_img.save(out_filename, "WEBP", quality=webp_quality, method=webp_method)

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
    print(f"[SUCCESS] Sequence successfully extracted!")
    print(f"Total WebP frames: {frame_idx}")
    print(f"Elapsed time:      {total_time:.2f}s")
    print(f"Directory:         {output_dir}")
    print("=" * 65)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract 4K WebP sequence with Lanczos-4 & USM")
    parser.add_argument("--input", default="src/assets/video/hero.mp4", help="Path to input video")
    parser.add_argument("--output", default="public/eklipse-sequence", help="Output directory")
    parser.add_argument("--width", type=int, default=3840, help="Target width (default: 3840)")
    parser.add_argument("--height", type=int, default=2160, help="Target height (default: 2160)")
    parser.add_argument("--sharpness", type=float, default=0.35, help="Sharpness amount (default: 0.35)")
    parser.add_argument("--quality", type=int, default=82, help="WebP quality (default: 82)")
    args = parser.parse_args()

    extract_webp_sequence(
        input_path=args.input,
        output_dir=args.output,
        target_width=args.width,
        target_height=args.height,
        sharpness_amount=args.sharpness,
        webp_quality=args.quality
    )
