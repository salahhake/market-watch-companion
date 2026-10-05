"""يولّد شعار فريق MWC (أيقونة + شاشة بداية) في مجلد assets/ - يعمل داخل GitHub Actions"""
import math
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path("assets"); OUT.mkdir(exist_ok=True)
TOP, BOTTOM = (59, 130, 214), (30, 79, 160)
SS = 2

def gradient(size, top=TOP, bot=BOTTOM):
    img = Image.new("RGB", (size, size)); d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return img

def stroke(d, pts, w, col):
    d.line(pts, fill=col, width=int(w), joint="curve")
    for x, y in pts:
        d.ellipse([x - w/2, y - w/2, x + w/2, y + w/2], fill=col)

def logo(size=1024, scale=1.0):
    """شعار MWO شفاف (حروف بيضاء + خط أزرق فاتح تحتها) داخل المنطقة الآمنة"""
    S = size * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    u = S / 1024 * scale
    cx, cy = S / 2, S / 2 - 10 * u
    W, H, G, sw = 160 * u, 230 * u, 78 * u, 44 * u
    total = 3 * W + 2 * G
    x0 = cx - total / 2; y0 = cy - H / 2
    white = (255, 255, 255, 255)
    # M
    mx = x0
    stroke(d, [(mx, y0 + H), (mx, y0), (mx + W/2, y0 + H*0.62), (mx + W, y0), (mx + W, y0 + H)], sw, white)
    # W
    wx = x0 + W + G
    stroke(d, [(wx, y0), (wx + W*0.25, y0 + H), (wx + W/2, y0 + H*0.38), (wx + W*0.75, y0 + H), (wx + W, y0)], sw, white)
    # O
    ox = x0 + 2*(W + G)
    d.arc([ox - sw/2, y0 - sw/2, ox + W + sw/2, y0 + H + sw/2], 45, 315, fill=white, width=int(sw))
    ecx, ecy = ox + W/2, y0 + H/2
    for a in (45, 315):
        ex, ey = ecx + (W/2) * math.cos(math.radians(a)), ecy + (H/2) * math.sin(math.radians(a))
        d.ellipse([ex - sw/2, ey - sw/2, ex + sw/2, ey + sw/2], fill=white)
    # خط سعر صاعد تحت الحروف
    ly = y0 + H + 70 * u
    stroke(d, [(x0, ly), (x0 + total*0.35, ly), (x0 + total*0.55, ly - 26*u), (x0 + total*0.75, ly + 10*u), (x0 + total, ly - 40*u)], 16*u, (191, 219, 254, 255))
    return img.resize((size, size), Image.LANCZOS)

fg = logo(1024)
fg.save(OUT / "icon-foreground.png")
Image.new("RGB", (1024, 1024), (36, 92, 176)).save(OUT / "icon-background.png")
only = gradient(1024).convert("RGBA"); only.alpha_composite(fg); only.convert("RGB").save(OUT / "icon-only.png")

for name, top, bot in (("splash.png", TOP, BOTTOM), ("splash-dark.png", (15, 32, 66), (7, 16, 38))):
    s = 2732
    bg = gradient(s, top, bot).convert("RGBA")
    L = 1700
    bg.alpha_composite(logo(L), ((s - L)//2, (s - L)//2))
    bg.convert("RGB").save(OUT / name)
print("done")
