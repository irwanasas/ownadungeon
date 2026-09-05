from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'forge')
os.makedirs(OUT, exist_ok=True)

INK = (10, 16, 15, 255)
STONE = (43, 59, 61, 255)
STONE_LIGHT = (61, 82, 84, 255)
MOSS = (63, 191, 158, 255)
EMBER = (224, 80, 60, 255)
EMBER_LIGHT = (250, 140, 90, 255)
VIOLET = (155, 107, 216, 255)
GOLD = (232, 185, 74, 255)
FROST = (127, 216, 232, 255)
BONE = (232, 236, 235, 255)
CLEAR = (0, 0, 0, 0)

def canvas(size=24):
    return Image.new('RGBA', (size, size), CLEAR)

def save(img, name, scale=4):
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    big.save(os.path.join(OUT, name))

def px(d, x, y, color, w=1, h=1):
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=color)

def gen_icon_gold():
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.ellipse([3, 3, 20, 20], fill=GOLD, outline=INK, width=2)
    d.ellipse([7, 7, 16, 16], outline=(180, 130, 40, 255), width=1)
    save(im, 'icon-gold.png')

def gen_icon_soul():
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.polygon([(12, 2), (20, 9), (17, 21), (7, 21), (4, 9)], fill=FROST, outline=INK)
    d.polygon([(12, 6), (16, 10), (14, 17), (10, 17), (8, 10)], outline=(90, 170, 190, 255))
    save(im, 'icon-soul.png')

def gen_icon_play():
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.ellipse([1, 1, 22, 22], fill=MOSS, outline=INK, width=2)
    d.polygon([(9, 6), (18, 12), (9, 18)], fill=INK)
    save(im, 'icon-play.png')

def gen_icon_build():
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.rectangle([4, 15, 20, 19], fill=STONE_LIGHT, outline=INK)
    d.polygon([(6, 15), (10, 4), (14, 4), (18, 15)], fill=STONE, outline=INK)
    d.rectangle([10, 8, 14, 11], fill=MOSS)
    save(im, 'icon-build.png')

def gen_icon_upgrade():
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.polygon([(12, 3), (21, 13), (15, 13), (15, 21), (9, 21), (9, 13), (3, 13)], fill=MOSS, outline=INK)
    save(im, 'icon-upgrade.png')

def gen_icon_king():
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.polygon([(4, 18), (4, 9), (9, 13), (12, 6), (15, 13), (20, 9), (20, 18)], fill=GOLD, outline=INK)
    d.rectangle([4, 18, 20, 20], fill=GOLD, outline=INK)
    d.ellipse([10, 9, 14, 13], fill=VIOLET)
    save(im, 'icon-king.png')

def gen_icon_door(open_=False):
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.rectangle([3, 2, 21, 22], fill=STONE, outline=INK, width=1)
    if open_:
        d.rectangle([5, 4, 12, 20], fill=INK)
        d.rectangle([13, 4, 19, 20], fill=(20, 26, 24, 255))
    else:
        d.rectangle([5, 4, 19, 20], fill=(60, 46, 34, 255), outline=INK)
        d.ellipse([15, 11, 17, 13], fill=GOLD)
    save(im, 'icon-door-open.png' if open_ else 'icon-door.png')

def gen_hero(name, color, shape='round'):
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.ellipse([6, 3, 18, 15], fill=(224, 200, 176, 255), outline=INK)  # head
    if shape == 'round':  # Paladin: broad shoulders, shield-like torso
        d.polygon([(4, 22), (4, 14), (12, 10), (20, 14), (20, 22)], fill=color, outline=INK)
        d.rectangle([10, 15, 14, 21], fill=BONE)
    elif shape == 'sharp':  # Trickster: slim, hooded, angular cloak
        d.polygon([(6, 22), (5, 13), (12, 9), (19, 13), (18, 22)], fill=color, outline=INK)
        d.polygon([(9, 6), (12, 1), (15, 6)], fill=color, outline=INK)
    else:  # Elementalist: robe + staff orb
        d.polygon([(5, 22), (6, 12), (12, 9), (18, 12), (19, 22)], fill=color, outline=INK)
        d.ellipse([16, 2, 21, 7], fill=color, outline=INK)
        d.line([17, 8, 19, 20], fill=STONE_LIGHT, width=1)
    save(im, 'hero-' + name + '.png')

def gen_monster(name, color):
    im = canvas(24)
    d = ImageDraw.Draw(im)
    if name == 'brute':
        d.polygon([(3, 21), (3, 10), (12, 4), (21, 10), (21, 21)], fill=color, outline=INK)
        d.rectangle([7, 12, 9, 14], fill=INK)
        d.rectangle([15, 12, 17, 14], fill=INK)
        d.rectangle([9, 17, 15, 19], fill=(20, 10, 8, 255))
    elif name == 'swarm':
        for ox, oy in [(3, 12), (10, 6), (15, 13)]:
            d.ellipse([ox, oy, ox + 7, oy + 7], fill=color, outline=INK)
            d.point([(ox + 2, oy + 3), (ox + 5, oy + 3)], fill=INK)
    else:  # shaman
        d.polygon([(5, 21), (5, 11), (12, 5), (19, 11), (19, 21)], fill=color, outline=INK)
        d.ellipse([9, 2, 15, 8], fill=VIOLET, outline=INK)
        d.line([12, 10, 12, 20], fill=GOLD, width=2)
    save(im, 'monster-' + name + '.png')

def gen_trap(name, color):
    im = canvas(24)
    d = ImageDraw.Draw(im)
    d.rectangle([2, 17, 22, 21], fill=STONE, outline=INK)
    if name == 'spike':
        for x in [4, 9, 14, 19]:
            d.polygon([(x, 17), (x + 2, 6), (x + 4, 17)], fill=color, outline=INK)
    elif name == 'poison':
        d.ellipse([6, 8, 18, 18], fill=color, outline=INK)
        d.ellipse([9, 3, 13, 7], fill=color, outline=INK)
        d.ellipse([14, 5, 17, 8], fill=color, outline=INK)
    else:  # frost
        for ang in range(6):
            import math
            cx, cy = 12, 12
            x2 = cx + 9 * math.cos(ang * math.pi / 3)
            y2 = cy + 9 * math.sin(ang * math.pi / 3)
            d.line([cx, cy, x2, y2], fill=color, width=2)
        d.ellipse([9, 9, 15, 15], fill=color, outline=INK)
    save(im, 'trap-' + name + '.png')

def gen_tile_floor():
    im = canvas(16)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 15, 15], fill=STONE)
    for (x, y) in [(2, 2), (9, 5), (5, 11), (12, 12)]:
        d.point((x, y), fill=STONE_LIGHT)
    d.line([0, 8, 15, 8], fill=(35, 48, 50, 255))
    save(im, 'tile-floor.png', scale=3)

def gen_tile_wall():
    im = canvas(16)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 15, 15], fill=(30, 41, 42, 255))
    for y in [0, 8]:
        for x in range(0, 16, 8):
            d.rectangle([x, y, x + 7, y + 7], outline=(20, 28, 29, 255))
    save(im, 'tile-wall.png', scale=3)

def gen_torch_sheet():
    frames = []
    for i in range(4):
        im = canvas(16)
        d = ImageDraw.Draw(im)
        d.rectangle([6, 10, 9, 15], fill=(70, 50, 34, 255))
        flick = [
            [(6, 9), (10, 9), (8, 2)],
            [(5, 9), (9, 9), (7, 1), (11, 4)],
            [(7, 9), (11, 9), (9, 2)],
            [(6, 9), (10, 9), (8, 1), (5, 5)],
        ][i]
        d.polygon(flick, fill=EMBER_LIGHT if i % 2 == 0 else EMBER)
        d.ellipse([6, 7, 9, 10], fill=GOLD)
        frames.append(im)
    sheet = Image.new('RGBA', (16 * 4, 16), CLEAR)
    for i, f in enumerate(frames):
        sheet.paste(f, (i * 16, 0))
    save(sheet, 'torch-sheet.png', scale=3)

def main():
    gen_icon_gold()
    gen_icon_soul()
    gen_icon_play()
    gen_icon_build()
    gen_icon_upgrade()
    gen_icon_king()
    gen_icon_door(False)
    gen_icon_door(True)

    gen_hero('paladin', MOSS, 'round')
    gen_hero('trickster', VIOLET, 'sharp')
    gen_hero('elementalist', EMBER, 'staff')

    gen_monster('brute', (110, 70, 60, 255))
    gen_monster('swarm', (90, 130, 70, 255))
    gen_monster('shaman', (80, 60, 100, 255))

    gen_trap('spike', BONE)
    gen_trap('poison', (100, 170, 90, 255))
    gen_trap('frost', FROST)

    gen_tile_floor()
    gen_tile_wall()
    gen_torch_sheet()
    print('done ->', OUT)

if __name__ == '__main__':
    main()
