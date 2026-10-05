"""يولّد أيقونات وأشرطة بداية تطبيق سوقي في مجلد assets/ - يعمل داخل GitHub Actions"""
from pathlib import Path

from PIL import Image

OUT = Path("assets"); OUT.mkdir(exist_ok=True)
MASTER = Path("src/assets/icon-master.png")     # الأيقونة الكاملة بخلفية متدرجة
ARTWORK = Path("src/assets/icon-artwork.png")   # السلة والسهم على خلفية شفافة
TOP, BOTTOM = (59, 130, 214), (30, 79, 160)


def gradient(size, top=TOP, bot=BOTTOM):
    img = Image.new("RGB", (size, size)); d = ImageDraw = ImageDraw if False else None
    from PIL import ImageDraw as _D
    d = _D.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return img


def cropped(img: Image.Image) -> Image.Image:
    box = img.getbbox()
    return img.crop(box) if box else img


def centered(canvas: Image.Image, art: Image.Image, ratio: float) -> Image.Image:
    w = int(canvas.width * ratio)
    art = art.resize((w, int(art.height * w / art.width)), Image.LANCZOS)
    canvas.alpha_composite(art, ((canvas.width - art.width) // 2, (canvas.height - art.height) // 2))
    return canvas


master = Image.open(MASTER).convert("RGBA")
if master.width != 1024:
    master = master.resize((1024, 1024), Image.LANCZOS)
art = cropped(Image.open(ARTWORK).convert("RGBA"))

# أيقونة أمامية شفافة للنظام المتكيف — العمل داخل المنطقة الآمنة
fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
centered(fg, art, 0.66)
fg.save(OUT / "icon-foreground.png")

# لون خلفية الأيقونة مأخوذ من منتصف تدرج الأيقونة
mid = master.getpixel((512, 40))[:3]
Image.new("RGB", (1024, 1024), mid).save(OUT / "icon-background.png")

# الأيقونة الكاملة
master.convert("RGB").save(OUT / "icon-only.png")

# شاشتا البداية (فاتحة وداكنة)
for name, top, bot in (("splash.png", TOP, BOTTOM), ("splash-dark.png", (15, 32, 66), (7, 16, 38))):
    bg = gradient(2732, top, bot).convert("RGBA")
    centered(bg, art, 0.58)
    bg.convert("RGB").save(OUT / name)

print("done")
