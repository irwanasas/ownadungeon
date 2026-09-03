from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CROPPED = os.path.join(ROOT, 'public', 'assets', 'ui', 'cropped')
KING_DIR = os.path.join(ROOT, 'public', 'assets', 'king')

PALETTE = {
    'bg': (11, 14, 20),
    'panel': (19, 23, 34),
    'panel_raised': (27, 32, 46),
    'border': (42, 49, 66),
    'border_bright': (61, 72, 99),
    'bone': (232, 236, 245),
    'muted': (124, 133, 152),
    'accent_blue': (76, 127, 219),
    'accent_blue_bright': (111, 160, 245),
    'accent_purple': (107, 79, 160),
    'accent_purple_bright': (143, 111, 199),
    'ember': (209, 72, 63),
    'ember_bright': (240, 106, 82),
    'poison': (79, 157, 110),
    'poison_bright': (116, 192, 143),
    'gold': (224, 178, 74),
    'soul': (111, 184, 220),
    'outline': (5, 7, 10),
    'highlight': (244, 246, 250),
    'stone_dark': (24, 28, 40),
    'stone_mid': (34, 40, 56),
    'stone_light': (46, 53, 74),
}


def new_canvas(size):
    return Image.new('RGBA', (size, size), (0, 0, 0, 0))


def save_icon(img, out_path, final_size):
    small = img.resize((final_size, final_size), Image.NEAREST)
    small.save(out_path)
    print('wrote', out_path, small.size)


def draw_outline_fill(draw, points, fill, outline=PALETTE['outline'], width=4):
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=width, joint='curve')


def shade_bottom_right(draw, points, shade_color, cx, cy):
    shaded = [(x + 4 if x > cx else x, y + 4 if y > cy else y) for x, y in points]
    draw.polygon(shaded, fill=shade_color)


def gen_trap_spike():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    base_y = 100
    for cx, h in [(32, 70), (64, 90), (96, 70)]:
        pts = [(cx, base_y - h), (cx - 22, base_y), (cx + 22, base_y)]
        d.polygon(pts, fill=PALETTE['ember'])
        d.polygon([(cx, base_y - h), (cx, base_y), (cx + 22, base_y)], fill=PALETTE['ember_bright'] if False else PALETTE['ember'])
        d.line(pts + [pts[0]], fill=PALETTE['outline'], width=5, joint='curve')
    d.polygon([(64, 30), (72, 42), (64, 54), (56, 42)], fill=PALETTE['highlight'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-spike.png'), 32)


def gen_trap_poison():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.ellipse([24, 20, 104, 90], fill=PALETTE['poison'], outline=PALETTE['outline'], width=5)
    d.rectangle([40, 78, 56, 100], fill=PALETTE['poison'], outline=PALETTE['outline'], width=4)
    d.rectangle([72, 78, 88, 100], fill=PALETTE['poison'], outline=PALETTE['outline'], width=4)
    d.ellipse([38, 42, 56, 60], fill=PALETTE['outline'])
    d.ellipse([72, 42, 90, 60], fill=PALETTE['outline'])
    d.polygon([(44, 68), (52, 68), (48, 76)], fill=PALETTE['outline'])
    d.polygon([(76, 68), (84, 68), (80, 76)], fill=PALETTE['outline'])
    d.ellipse([32, 26, 44, 38], fill=PALETTE['poison_bright'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-poison.png'), 32)


def gen_trap_net():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.rectangle([16, 16, 112, 112], outline=PALETTE['outline'], width=6)
    for i in range(1, 5):
        x = 16 + i * 19.2
        d.line([(x, 16), (x, 112)], fill=PALETTE['muted'], width=4)
        y = 16 + i * 19.2
        d.line([(16, y), (112, y)], fill=PALETTE['muted'], width=4)
    d.rectangle([16, 16, 112, 112], outline=PALETTE['outline'], width=6)
    d.ellipse([50, 50, 78, 78], fill=PALETTE['ember'], outline=PALETTE['outline'], width=4)
    save_icon(im, os.path.join(CROPPED, 'icon-entity-net.png'), 32)


def gen_trap_fire():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    outer = [(64, 16), (86, 50), (94, 76), (80, 104), (48, 104), (34, 76), (42, 46)]
    d.polygon(outer, fill=PALETTE['ember'])
    d.line(outer + [outer[0]], fill=PALETTE['outline'], width=5, joint='curve')
    inner = [(64, 42), (76, 64), (72, 86), (56, 86), (52, 64)]
    d.polygon(inner, fill=PALETTE['ember_bright'])
    d.ellipse([58, 66, 70, 78], fill=PALETTE['highlight'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-fire.png'), 32)


def gen_trap_frost():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    cx, cy, r = 64, 64, 42
    for angle in range(0, 360, 60):
        import math
        rad = math.radians(angle)
        x2 = cx + r * math.cos(rad)
        y2 = cy + r * math.sin(rad)
        d.line([(cx, cy), (x2, y2)], fill=PALETTE['soul'], width=8)
        bx = cx + r * 0.6 * math.cos(rad)
        by = cy + r * 0.6 * math.sin(rad)
        perp = math.radians(angle + 90)
        d.line([(bx - 10 * math.cos(perp), by - 10 * math.sin(perp)),
                (bx + 10 * math.cos(perp), by + 10 * math.sin(perp))], fill=PALETTE['soul'], width=6)
    d.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=PALETTE['accent_blue_bright'], outline=PALETTE['outline'], width=4)
    save_icon(im, os.path.join(CROPPED, 'icon-entity-frost.png'), 32)


def gen_monster_slime():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    body = [(24, 100), (24, 70), (36, 46), (64, 32), (92, 46), (104, 70), (104, 100)]
    d.polygon(body, fill=PALETTE['poison'])
    d.line(body + [body[0]], fill=PALETTE['outline'], width=5, joint='curve')
    d.line([(24, 100), (104, 100)], fill=PALETTE['outline'], width=5)
    d.ellipse([40, 58, 54, 72], fill=PALETTE['outline'])
    d.ellipse([74, 58, 88, 72], fill=PALETTE['outline'])
    d.ellipse([34, 40, 50, 56], fill=PALETTE['poison_bright'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-slime.png'), 32)


def gen_goblin(fname, accent_shape):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    head = [(40, 96), (34, 60), (48, 32), (80, 32), (94, 60), (88, 96)]
    d.polygon(head, fill=PALETTE['muted'])
    d.line(head + [head[0]], fill=PALETTE['outline'], width=5, joint='curve')
    d.polygon([(34, 60), (18, 44), (40, 52)], fill=PALETTE['muted'], outline=PALETTE['outline'])
    d.polygon([(94, 60), (110, 44), (88, 52)], fill=PALETTE['muted'], outline=PALETTE['outline'])
    d.ellipse([48, 58, 60, 70], fill=PALETTE['ember'])
    d.ellipse([68, 58, 80, 70], fill=PALETTE['ember'])
    accent_shape(d)
    save_icon(im, os.path.join(CROPPED, fname), 32)


def gen_orc():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    head = [(30, 100), (24, 58), (40, 26), (88, 26), (104, 58), (98, 100)]
    d.polygon(head, fill=PALETTE['poison'])
    d.line(head + [head[0]], fill=PALETTE['outline'], width=6, joint='curve')
    d.ellipse([44, 52, 58, 66], fill=PALETTE['ember_bright'])
    d.ellipse([70, 52, 84, 66], fill=PALETTE['ember_bright'])
    d.polygon([(48, 88), (56, 100), (60, 86)], fill=PALETTE['highlight'], outline=PALETTE['outline'])
    d.polygon([(80, 88), (72, 100), (68, 86)], fill=PALETTE['highlight'], outline=PALETTE['outline'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-orc.png'), 32)


def gen_hero_trickster(color):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.line([(28, 30), (100, 100)], fill=color, width=10)
    d.polygon([(94, 92), (108, 106), (96, 110), (86, 100)], fill=color, outline=PALETTE['outline'])
    d.line([(100, 30), (28, 100)], fill=color, width=10)
    d.polygon([(34, 92), (20, 106), (32, 110), (42, 100)], fill=color, outline=PALETTE['outline'])
    d.line([(28, 30), (100, 100)], fill=PALETTE['outline'], width=3)
    d.line([(100, 30), (28, 100)], fill=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(CROPPED, 'icon-entity-trickster.png'), 32)


def gen_hero_assassin(color):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.ellipse([30, 70, 78, 100], fill=PALETTE['outline'])
    d.line([(24, 24), (100, 100)], fill=color, width=12)
    d.polygon([(94, 92), (110, 108), (96, 112), (84, 100)], fill=color, outline=PALETTE['outline'])
    d.polygon([(18, 18), (34, 22), (24, 34)], fill=PALETTE['highlight'])
    d.line([(24, 24), (100, 100)], fill=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(CROPPED, 'icon-entity-assassin.png'), 32)


def gen_hero_berserker(color):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.rectangle([60, 30, 68, 100], fill=PALETTE['muted'], outline=PALETTE['outline'], width=4)
    d.polygon([(68, 26), (100, 40), (98, 60), (68, 56)], fill=color, outline=PALETTE['outline'], width=4)
    d.polygon([(60, 26), (28, 40), (30, 60), (60, 56)], fill=color, outline=PALETTE['outline'], width=4)
    d.ellipse([54, 84, 74, 104], fill=PALETTE['ember_bright'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-berserker.png'), 32)


def gen_hero_elementalist(color):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.line([(50, 100), (78, 24)], fill=PALETTE['muted'], width=8)
    d.ellipse([68, 14, 90, 36], fill=color, outline=PALETTE['outline'], width=4)
    d.polygon([(30, 70), (38, 54), (46, 70), (38, 86)], fill=color, outline=PALETTE['outline'], width=3)
    d.polygon([(90, 50), (98, 34), (106, 50), (98, 66)], fill=color, outline=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(CROPPED, 'icon-entity-elementalist.png'), 32)


def gen_hero_druid(color):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.line([(64, 108), (64, 34)], fill=PALETTE['muted'], width=8)
    d.ellipse([44, 12, 84, 46], fill=color, outline=PALETTE['outline'], width=4)
    d.polygon([(44, 30), (24, 20), (34, 44)], fill=color, outline=PALETTE['outline'], width=3)
    d.polygon([(84, 30), (104, 20), (94, 44)], fill=color, outline=PALETTE['outline'], width=3)
    d.ellipse([56, 22, 72, 38], fill=PALETTE['highlight'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-druid.png'), 32)


def gen_hero_paladin(color):
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.polygon([(64, 24), (100, 40), (100, 72), (64, 106), (28, 72), (28, 40)], fill=color, outline=PALETTE['outline'], width=5)
    d.rectangle([58, 40, 70, 88], fill=PALETTE['bone'])
    d.rectangle([40, 58, 88, 70], fill=PALETTE['bone'])
    save_icon(im, os.path.join(CROPPED, 'icon-entity-paladin.png'), 32)


def gen_treasure():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.rectangle([24, 60, 104, 100], fill=PALETTE['gold'], outline=PALETTE['outline'], width=5)
    d.chord([24, 36, 104, 84], 180, 360, fill=PALETTE['gold'], outline=PALETTE['outline'], width=5)
    d.rectangle([24, 66, 104, 74], fill=PALETTE['ember'])
    d.ellipse([58, 66, 70, 78], fill=PALETTE['ember_bright'], outline=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(CROPPED, 'icon-entity-treasure.png'), 32)


def gen_king():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    pts = [(24, 96), (24, 56), (44, 76), (64, 40), (84, 76), (104, 56), (104, 96)]
    d.polygon(pts, fill=PALETTE['gold'])
    d.line(pts + [pts[0]], fill=PALETTE['outline'], width=5, joint='curve')
    d.line([(24, 96), (104, 96)], fill=PALETTE['outline'], width=5)
    d.ellipse([20, 46, 32, 58], fill=PALETTE['accent_purple_bright'], outline=PALETTE['outline'], width=3)
    d.ellipse([58, 30, 70, 42], fill=PALETTE['accent_purple_bright'], outline=PALETTE['outline'], width=3)
    d.ellipse([96, 46, 108, 58], fill=PALETTE['accent_purple_bright'], outline=PALETTE['outline'], width=3)
    d.rectangle([40, 80, 88, 92], fill=PALETTE['accent_purple'], outline=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(KING_DIR, 'icon-king.png'), 32)


def gen_icon_battle():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.rectangle([16, 50, 40, 108], fill=PALETTE['stone_mid'], outline=PALETTE['outline'], width=5)
    d.rectangle([88, 50, 112, 108], fill=PALETTE['stone_mid'], outline=PALETTE['outline'], width=5)
    d.polygon([(16, 50), (64, 20), (112, 50)], fill=PALETTE['stone_light'], outline=PALETTE['outline'], width=5)
    d.line([(30, 40), (98, 96)], fill=PALETTE['accent_blue_bright'], width=9)
    d.line([(98, 40), (30, 96)], fill=PALETTE['accent_blue_bright'], width=9)
    d.line([(30, 40), (98, 96)], fill=PALETTE['outline'], width=3)
    d.line([(98, 40), (30, 96)], fill=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(CROPPED, 'icon-battle.png'), 32)


def gen_icon_stats():
    s = 64
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    bars = [(8, 40, 20, 56), (26, 26, 38, 56), (44, 14, 56, 56)]
    colors = [PALETTE['accent_blue'], PALETTE['accent_blue_bright'], PALETTE['soul']]
    for (x0, y0, x1, y1), c in zip(bars, colors):
        d.rectangle([x0, y0, x1, y1], fill=c, outline=PALETTE['outline'], width=3)
    save_icon(im, os.path.join(CROPPED, 'icon-stats.png'), 16)


def gen_icon_king_avatar_alias():
    pass


def gen_icon_door():
    s = 128
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    d.rectangle([28, 40, 100, 108], fill=PALETTE['stone_mid'], outline=PALETTE['outline'], width=5)
    d.chord([28, 8, 100, 72], 180, 360, fill=PALETTE['stone_mid'], outline=PALETTE['outline'], width=5)
    d.rectangle([44, 56, 84, 108], fill=PALETTE['outline'])
    d.chord([44, 40, 84, 72], 180, 360, fill=PALETTE['outline'])
    d.ellipse([70, 78, 78, 86], fill=PALETTE['gold'])
    save_icon(im, os.path.join(CROPPED, 'icon-door.png'), 32)


def gen_panel_stone():
    s = 256
    im = new_canvas(s)
    d = ImageDraw.Draw(im)
    base = PALETTE['stone_light']
    seam = tuple(min(255, c + 10) for c in base)
    d.rectangle([0, 0, s, s], fill=base)
    brick_w, brick_h = 64, 32
    for row in range(s // brick_h + 1):
        y = row * brick_h
        d.line([(0, y), (s, y)], fill=seam, width=1)
    for row in range(s // brick_h):
        offset = (row % 2) * (brick_w // 2)
        y0 = row * brick_h
        for col in range(-1, s // brick_w + 1):
            x = col * brick_w + offset
            d.line([(x, y0), (x, y0 + brick_h)], fill=seam, width=1)
    save_icon(im, os.path.join(CROPPED, 'panel-stone.png'), 64)


def gen_divider_rune():
    w, h = 128, 32
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.line([(0, 16), (48, 16)], fill=PALETTE['border_bright'], width=6)
    d.line([(80, 16), (w, 16)], fill=PALETTE['border_bright'], width=6)
    d.ellipse([54, 6, 74, 26], fill=PALETTE['accent_purple'], outline=PALETTE['outline'], width=3)
    d.ellipse([60, 12, 68, 20], fill=PALETTE['accent_purple_bright'])
    im.resize((32, 8), Image.NEAREST).save(os.path.join(CROPPED, 'divider-rune.png'))
    print('wrote divider-rune.png (32, 8)')


def luminance(rgb):
    r, g, b = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b


def palette_swap_pill(src_name, out_name, ramp):
    src_path = os.path.join(CROPPED, src_name)
    if not os.path.exists(src_path):
        print('skipped', out_name, '(source', src_name, 'no longer in repo)')
        return
    src = Image.open(src_path).convert('RGBA')
    colors = src.getcolors(maxcolors=99999)
    opaque = [(count, rgba) for count, rgba in colors if rgba[3] > 0]
    opaque.sort(key=lambda c: luminance(c[1][:3]))
    n = len(opaque)
    lut = {}
    for i, (count, rgba) in enumerate(opaque):
        rank = int(i * (len(ramp) - 1) / max(1, n - 1))
        new_rgb = ramp[rank]
        lut[rgba] = (new_rgb[0], new_rgb[1], new_rgb[2], rgba[3])
    px = src.load()
    out = Image.new('RGBA', src.size)
    opx = out.load()
    for y in range(src.height):
        for x in range(src.width):
            p = px[x, y]
            opx[x, y] = lut.get(p, p)
    out.save(os.path.join(CROPPED, out_name))
    print('wrote', out_name, out.size)


BLUE_RAMP = [
    (20, 24, 36),
    (35, 43, 66),
    (53, 80, 124),
    PALETTE['accent_blue'],
    PALETTE['accent_blue_bright'],
    (154, 194, 255),
]
BLUE_HOVER_RAMP = [
    (20, 24, 36),
    (46, 58, 92),
    PALETTE['accent_blue'],
    PALETTE['accent_blue_bright'],
    (143, 184, 255),
    (184, 212, 255),
]
EMBER_RAMP = [
    (20, 24, 36),
    (74, 36, 32),
    (122, 54, 46),
    PALETTE['ember'],
    PALETTE['ember_bright'],
    (255, 155, 133),
]
EMBER_HOVER_RAMP = [
    (20, 24, 36),
    (92, 44, 38),
    PALETTE['ember'],
    PALETTE['ember_bright'],
    (255, 155, 133),
    (255, 196, 181),
]


def main():
    os.makedirs(CROPPED, exist_ok=True)
    os.makedirs(KING_DIR, exist_ok=True)

    gen_trap_spike()
    gen_trap_poison()
    gen_trap_net()
    gen_trap_fire()
    gen_trap_frost()

    gen_monster_slime()
    gen_goblin('icon-entity-goblin_troop.png', lambda d: d.polygon([(88, 70), (110, 60), (108, 78)], fill=PALETTE['muted'], outline=PALETTE['outline']))
    gen_goblin('icon-entity-goblin_shaman.png', lambda d: (d.line([(96, 96), (110, 30)], fill=PALETTE['poison'], width=6), d.ellipse([104, 20, 118, 34], fill=PALETTE['soul'], outline=PALETTE['outline'], width=3)))
    gen_goblin('icon-entity-goblin_elite.png', lambda d: d.rectangle([40, 30, 88, 44], fill=PALETTE['border_bright'], outline=PALETTE['outline'], width=4))
    gen_orc()

    gen_hero_paladin((224, 178, 74))
    gen_hero_berserker((240, 106, 82))
    gen_hero_trickster((111, 184, 220))
    gen_hero_assassin((143, 111, 199))
    gen_hero_druid((116, 192, 143))
    gen_hero_elementalist((209, 72, 63))

    gen_treasure()
    gen_king()
    gen_icon_battle()
    gen_icon_stats()
    gen_icon_door()
    gen_panel_stone()
    gen_divider_rune()

    palette_swap_pill('pill-button.png', 'pill-stone-idle.png', BLUE_RAMP)
    palette_swap_pill('pill-button-hover.png', 'pill-stone-hover.png', BLUE_HOVER_RAMP)
    palette_swap_pill('pill-button.png', 'pill-danger-idle.png', EMBER_RAMP)
    palette_swap_pill('pill-button-hover.png', 'pill-danger-hover.png', EMBER_HOVER_RAMP)


if __name__ == '__main__':
    main()
