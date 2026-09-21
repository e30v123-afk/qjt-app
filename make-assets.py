# -*- coding: utf-8 -*-
"""توليد أيقونة التطبيق وشاشة الإقلاع من شعار قافلة الجزيرة."""
import os
import sys

from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding='utf-8')

SRC = os.path.expanduser('~/Pictures/شعار قافلة الجزيرة.jpeg')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resources')
os.makedirs(OUT, exist_ok=True)

logo = Image.open(SRC).convert('RGB')


def cut_white(im, thr=243):
    """يقصّ الهوامش البيضاء حول الشعار ويعيده بقناة شفافة."""
    g = im.convert('L')
    mask = g.point(lambda p: 255 if p < thr else 0)
    box = mask.getbbox()
    im = im.crop(box)
    g = im.convert('L')
    alpha = g.point(lambda p: 0 if p >= thr else 255)
    rgba = im.convert('RGBA')
    rgba.putalpha(alpha.filter(__import__('PIL.ImageFilter', fromlist=['x']).SMOOTH))
    return rgba


art = cut_white(logo)
print('الشعار بعد القصّ:', art.size)

# ---------- الأيقونة 1024 ----------
S = 1024
icon = Image.new('RGB', (S, S), (16, 20, 24))
d = ImageDraw.Draw(icon)
for y in range(S):                       # تدرّج داكن أنيق يبرز الذهبي
    t = y / S
    d.line([(0, y), (S, y)], fill=(int(22 - 8 * t), int(27 - 10 * t), int(33 - 12 * t)))

fit = int(S * 0.76)
w, h = art.size
sc = min(fit / w, fit / h)
small = art.resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.LANCZOS)
icon.paste(small, ((S - small.width) // 2, (S - small.height) // 2), small)
icon.save(os.path.join(OUT, 'icon.png'))
print('الأيقونة  :', os.path.join(OUT, 'icon.png'), icon.size)

# ---------- شاشة الإقلاع 2732 ----------
P = 2732
sp = Image.new('RGB', (P, P), (16, 20, 24))
d = ImageDraw.Draw(sp)
cx = cy = P // 2
for r in range(P // 2, 0, -6):           # توهّج خفيف خلف الشعار
    t = r / (P / 2)
    c = (int(16 + 16 * (1 - t)), int(20 + 16 * (1 - t)), int(24 + 14 * (1 - t)))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

fit = int(P * 0.30)
sc = min(fit / w, fit / h)
big = art.resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.LANCZOS)
sp.paste(big, ((P - big.width) // 2, (P - big.height) // 2), big)
sp.save(os.path.join(OUT, 'splash.png'))
sp.save(os.path.join(OUT, 'splash-dark.png'))
print('شاشة الإقلاع:', os.path.join(OUT, 'splash.png'), sp.size)
