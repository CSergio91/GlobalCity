import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
base = Image.new('RGB', (W, H), (6, 7, 11))

# Ambient glows
glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

for r in range(350, 20, -10):
    alpha = int(55 * (1 - r / 350))
    glow_draw.ellipse([270 - r, 315 - r, 270 + r, 315 + r], fill=(245, 158, 11, alpha))

for r in range(400, 20, -15):
    alpha = int(35 * (1 - r / 400))
    glow_draw.ellipse([980 - r, 220 - r, 980 + r, 220 + r], fill=(139, 92, 246, alpha))

base = Image.alpha_composite(base.convert('RGBA'), glow_layer)

# Institutional double Border
border_draw = ImageDraw.Draw(base)
border_draw.rectangle([14, 14, W - 15, H - 15], outline=(255, 255, 255, 20), width=1)
border_draw.rectangle([16, 16, W - 17, H - 17], outline=(245, 158, 11, 45), width=1)

# Paste logo
logo_raw = Image.open('src/assets/images/logoEklipse.png').convert('RGBA')
lw, lh = logo_raw.size
target_h = 420
target_w = int(lw * (target_h / lh))
logo_resized = logo_raw.resize((target_w, target_h), Image.Resampling.LANCZOS)
base.paste(logo_resized, (55, (H - target_h) // 2), logo_resized)

# Typography
draw = ImageDraw.Draw(base)
text_x = 520

font_badge = ImageFont.truetype('C:\\Windows\\Fonts\\segoeuib.ttf', 13)
font_title = ImageFont.truetype('C:\\Windows\\Fonts\\segoeuib.ttf', 54)
font_sub = ImageFont.truetype('C:\\Windows\\Fonts\\segoeui.ttf', 21)
font_card_title = ImageFont.truetype('C:\\Windows\\Fonts\\segoeuib.ttf', 16)
font_desc = ImageFont.truetype('C:\\Windows\\Fonts\\segoeui.ttf', 14)
font_url = ImageFont.truetype('C:\\Windows\\Fonts\\segoeuib.ttf', 16)

# Badge Pill
badge_text = 'OFFICIAL PROPRIETARY TRADING FIRM'
badge_w = int(font_badge.getlength(badge_text)) + 26
badge_h = 28
badge_y = 82
draw.rounded_rectangle([text_x, badge_y, text_x + badge_w, badge_y + badge_h], radius=14, fill=(245, 158, 11, 30), outline=(245, 158, 11, 110), width=1)
draw.text((text_x + 13, badge_y + 5), badge_text, font=font_badge, fill=(251, 191, 36))

# Main Title: EKLIPSE FUNDED
title_y = 124
draw.text((text_x, title_y), 'EKLIPSE', font=font_title, fill=(255, 255, 255))
title_eklipse_w = int(font_title.getlength('EKLIPSE '))
draw.text((text_x + title_eklipse_w, title_y), 'FUNDED', font=font_title, fill=(245, 158, 11))

# Subtitle
sub_y = 202
draw.text((text_x, sub_y), 'Operate Real Capital with Institutional Execution', font=font_sub, fill=(203, 213, 225))

# 3 Feature Pills
pills = [
    ('INSTANT FUNDING', 'Accounts from $1,000 to $100,000 with Instant Activation', (99, 102, 241)),
    ('UP TO 90% PROFIT SPLIT', 'Keep the Lion Share of your Profits · Bi-Weekly Payouts', (245, 158, 11)),
    ('60 FPS GPU TERMINAL', 'Binance, Bybit & OKX Direct DMA · Zero Slippage', (168, 85, 247))
]

pill_y = 256
for title, desc, color in pills:
    box_w = 615
    box_h = 66
    draw.rounded_rectangle([text_x, pill_y, text_x + box_w, pill_y + box_h], radius=12, fill=(15, 20, 32, 210), outline=(color[0], color[1], color[2], 85), width=1)
    draw.rounded_rectangle([text_x + 16, pill_y + 16, text_x + 20, pill_y + 50], radius=2, fill=color)
    draw.text((text_x + 34, pill_y + 12), title, font=font_card_title, fill=(255, 255, 255))
    draw.text((text_x + 34, pill_y + 36), desc, font=font_desc, fill=(148, 163, 184))
    pill_y += 80

# Footer URL
footer_y = 525
draw.text((text_x, footer_y), 'https://eklipsefunded.com', font=font_url, fill=(245, 158, 11))
draw.text((text_x + 235, footer_y), '· No Time Limits · Web, Desktop & Mobile', font=font_desc, fill=(100, 116, 139))

final_rgb = base.convert('RGB')
os.makedirs('public', exist_ok=True)
final_rgb.save('public/og-image.jpg', 'JPEG', quality=95)
final_rgb.save('public/og-image.webp', 'WEBP', quality=95)
print('SUCCESS: Generated master public/og-image.jpg and public/og-image.webp')
