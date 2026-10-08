#!/usr/bin/env python3
"""
Video Upscaler 4K / 2.5K with Lanczos-4 and Adaptive Unsharp Masking
Part of Eklipse Video Upscaling and Chroma Key Engine Skill
"""

import sys
import os
import time
import argparse
import cv2
import numpy as np

def upscale_video(
    input_path: str,
    output_path: str,
    target_width: int = 3840,
    target_height: int = 2160,
    sharpness_amount: float = 0.35,
    gaussian_sigma: float = 1.4,
    fourcc_str: str = "mp4v"
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
    print("EKLIPSE 4K VIDEO UPSCALER ENGINE (Lanczos-4 + Unsharp Mask)")
    print("=" * 65)
    print(f"Input:       {input_path}")
    print(f"Output:      {output_path}")
    print(f"Original:    {orig_w}x{orig_h} @ {fps:.1f} fps ({total_frames} frames)")
    print(f"Target:      {target_width}x{target_height} UHD")
    print(f"Algorithm:   cv2.INTER_LANCZOS4 + USM (amount={sharpness_amount}, sigma={gaussian_sigma})")
    print("-" * 65)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*fourcc_str)
    out = cv2.VideoWriter(output_path, fourcc, fps, (target_width, target_height))

    if not out.isOpened():
        print(f"[ERROR] Could not initialize VideoWriter for {output_path}")
        cap.release()
        return False

    start_time = time.time()
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 1. High fidelity Lanczos-4 spatial resampling
        upscaled = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_LANCZOS4)

        # 2. Adaptive unsharp masking for edge & micro-contrast enhancement
        if sharpness_amount > 0:
            blur = cv2.GaussianBlur(upscaled, (0, 0), gaussian_sigma)
            # Sharpened = Original * (1 + amount) - Blurred * amount
            enhanced = cv2.addWeighted(upscaled, 1.0 + sharpness_amount, blur, -sharpness_amount, 0)
        else:
            enhanced = upscaled

        out.write(enhanced)
        frame_idx += 1

        if frame_idx % 20 == 0 or frame_idx == total_frames:
            elapsed = time.time() - start_time
            fps_proc = frame_idx / elapsed if elapsed > 0 else 0
            pct = (frame_idx / total_frames * 100) if total_frames > 0 else 0
            sys.stdout.write(f"\rProcessing frame {frame_idx}/{total_frames} [{pct:5.1f}%] - {fps_proc:.1f} fps")
            sys.stdout.flush()

    sys.stdout.write("\n")
    cap.release()
    out.release()

    total_time = time.time() - start_time
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print("-" * 65)
    print(f"[SUCCESS] 4K Video successfully generated!")
    print(f"Frames processed: {frame_idx}")
    print(f"Total time:       {total_time:.2f}s")
    print(f"Output file size: {file_size_mb:.2f} MB")
    print(f"Saved at:         {output_path}")
    print("=" * 65)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upscale video to 4K UHD with Lanczos-4 & Unsharp Masking")
    parser.add_argument("--input", default="src/assets/video/hero.mp4", help="Path to input video")
    parser.add_argument("--output", default="src/assets/video/hero_4k.mp4", help="Path to output video")
    parser.add_argument("--width", type=int, default=3840, help="Target width (default: 3840)")
    parser.add_argument("--height", type=int, default=2160, help="Target height (default: 2160)")
    parser.add_argument("--sharpness", type=float, default=0.35, help="Sharpness amount (default: 0.35)")
    args = parser.parse_args()

    upscale_video(
        input_path=args.input,
        output_path=args.output,
        target_width=args.width,
        target_height=args.height,
        sharpness_amount=args.sharpness
    )
