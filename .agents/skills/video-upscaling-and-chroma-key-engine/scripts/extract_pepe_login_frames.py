#!/usr/bin/env python3
"""
Eklipse Funded - Pepe Interactive Login Frame Extractor (v3 - Native 1080p Zero-Artifacts)
Extracts 65 native 1080x1080 high-resolution WebP frames from loginpagepepe.mp4:
- Center (Neutral Forward)
- Left (Frames 00-15)
- Right (Frames 00-15)
- Up-Left (Frames 00-15, around frames 74-108)
- Up-Right (Frames 00-15, around frames 136-148)

ZERO hard thresholding is applied to preserve sub-pixel anti-aliasing and soft rim lighting.
"""

import os
import cv2
import numpy as np

VIDEO_PATH = 'src/assets/video/loginpagepepe.mp4'
OUT_DIR = 'public/pepe-login'
WEBP_QUALITY = 92

# Centered native 1080x1080 crop from 1920x1080
CROP_X1, CROP_X2 = 388, 1468
CROP_Y1, CROP_Y2 = 0, 1080

def main():
    if not os.path.exists(VIDEO_PATH):
        print(f"Error: Video not found at {VIDEO_PATH}")
        return

    os.makedirs(OUT_DIR, exist_ok=True)
    cap = cv2.VideoCapture(VIDEO_PATH)

    def get_native_frame(idx: int):
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            raise ValueError(f"Failed to read frame {idx}")
        # Native 1080x1080 crop, NO RESIZING, NO HARD THRESHOLDING
        return frame[CROP_Y1:CROP_Y2, CROP_X1:CROP_X2]

    # 1. Base Center Frame
    f_center = get_native_frame(0)
    cv2.imwrite(os.path.join(OUT_DIR, 'center.webp'), f_center, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])

    # 2. Left (16 frames)
    cv2.imwrite(os.path.join(OUT_DIR, 'left_00.webp'), f_center, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f_left_raw = [get_native_frame(int(idx)) for idx in np.linspace(10, 36, 15)]
    f01_l = (f_center.astype(float) * 0.7 + f_left_raw[0].astype(float) * 0.3).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'left_01.webp'), f01_l, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f02_l = (f_center.astype(float) * 0.35 + f_left_raw[1].astype(float) * 0.65).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'left_02.webp'), f02_l, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    for i in range(2, 15):
        cv2.imwrite(os.path.join(OUT_DIR, f'left_{i+1:02d}.webp'), f_left_raw[i], [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])

    # 3. Right (16 frames)
    cv2.imwrite(os.path.join(OUT_DIR, 'right_00.webp'), f_center, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f_right_raw = [get_native_frame(int(idx)) for idx in np.linspace(172, 198, 15)]
    f01_r = (f_center.astype(float) * 0.7 + f_right_raw[0].astype(float) * 0.3).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'right_01.webp'), f01_r, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f02_r = (f_center.astype(float) * 0.35 + f_right_raw[1].astype(float) * 0.65).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'right_02.webp'), f02_r, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    for i in range(2, 15):
        cv2.imwrite(os.path.join(OUT_DIR, f'right_{i+1:02d}.webp'), f_right_raw[i], [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])

    # 4. Up-Left (16 frames)
    cv2.imwrite(os.path.join(OUT_DIR, 'up_left_00.webp'), f_center, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f_ul_raw = [get_native_frame(int(idx)) for idx in np.linspace(74, 108, 15)]
    f01_ul = (f_center.astype(float) * 0.7 + f_ul_raw[0].astype(float) * 0.3).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'up_left_01.webp'), f01_ul, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f02_ul = (f_center.astype(float) * 0.35 + f_ul_raw[1].astype(float) * 0.65).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'up_left_02.webp'), f02_ul, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    for i in range(2, 15):
        cv2.imwrite(os.path.join(OUT_DIR, f'up_left_{i+1:02d}.webp'), f_ul_raw[i], [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])

    # 5. Up-Right (16 frames)
    cv2.imwrite(os.path.join(OUT_DIR, 'up_right_00.webp'), f_center, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f_ur_raw = [get_native_frame(int(idx)) for idx in np.linspace(136, 148, 15)]
    f01_ur = (f_center.astype(float) * 0.7 + f_ur_raw[0].astype(float) * 0.3).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'up_right_01.webp'), f01_ur, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    f02_ur = (f_center.astype(float) * 0.35 + f_ur_raw[1].astype(float) * 0.65).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT_DIR, 'up_right_02.webp'), f02_ur, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    for i in range(2, 15):
        cv2.imwrite(os.path.join(OUT_DIR, f'up_right_{i+1:02d}.webp'), f_ur_raw[i], [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])

    cap.release()
    print(f"Extracted all 65 native 1080x1080 seamless frames into {OUT_DIR}")

if __name__ == '__main__':
    main()
