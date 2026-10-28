"""Genera public/og.png (1200x630): emblema del cisne + «CISNE · poesía en español».

Uso (desde la raíz del repo):  python scripts/make-og.py
Necesita Pillow (`pip install pillow`) y haber hecho `npm install` (usa la
Cormorant Garamond de @fontsource). El emblema sale de brand/cisne-emblema.png.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
INK = (17, 17, 17)
GRIS = (118, 118, 118)
FONT = "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-{}-normal.woff"

img = Image.new("RGB", (W, H), "white")

# Emblema, recortado a su contenido y centrado en la mitad superior.
emblem = Image.open("brand/cisne-emblema.png").convert("RGBA")
bg = Image.new("RGBA", emblem.size, "white")
bg.alpha_composite(emblem)
gray = bg.convert("L").point(lambda v: 255 if v < 245 else 0)
emblem = bg.crop(gray.getbbox()).convert("RGB")
target_h = 300
emblem = emblem.resize((round(emblem.width * target_h / emblem.height), target_h), Image.LANCZOS)
img.paste(emblem, ((W - emblem.width) // 2, 70))

draw = ImageDraw.Draw(img)


def centered(text, font, y, fill, spacing=0):
    widths = [draw.textlength(c, font=font) + spacing for c in text]
    x = (W - (sum(widths) - spacing)) / 2
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=font, fill=fill)
        x += w


centered("CISNE", ImageFont.truetype(FONT.format("600"), 84), 395, INK, spacing=22)
centered("poesía en español", ImageFont.truetype(FONT.format("400"), 44), 510, GRIS, spacing=4)
img.save("public/og.png", optimize=True)
print("public/og.png", img.size)
