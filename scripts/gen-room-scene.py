from PIL import Image
import os

SRC = os.path.join(os.path.dirname(__file__), '..', 'assets-src', 'room')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'forge')
os.makedirs(OUT, exist_ok=True)

room = Image.open(os.path.join(SRC, 'Room.png')).convert('RGBA')
torch = Image.open(os.path.join(SRC, 'TorchAnimation.png')).convert('RGBA')


def cut(box):
    return room.crop(box)


BRICK = cut((11, 163, 117, 284))
CEILING = cut((128, 103, 256, 160))
PILLAR_STONE_A = cut((224, 171, 256, 352))
PILLAR_STONE_B = cut((352, 161, 384, 352))
PILLAR_WOOD_A = cut((290, 171, 318, 352))
PILLAR_WOOD_B = cut((416, 161, 448, 352))
SHELF_NARROW = cut((128, 224, 192, 288))
SHELF_WIDE = cut((128, 384, 192, 448))
CRATE_BIG = cut((322, 416, 382, 458))
CRATE_SMALL = cut((384, 432, 416, 457))
URN_DARK = cut((422, 423, 443, 457))
URN_TAN = cut((450, 425, 476, 457))
URN_PALE = cut((481, 426, 512, 457))
BUSH = cut((576, 7, 640, 32))

BANNER_STRIP = cut((128, 480, 288, 543))
BANNER_RED_POINT = BANNER_STRIP.crop((0, 0, 32, 63))
BANNER_RED_TATTER = BANNER_STRIP.crop((32, 0, 64, 63))
BANNER_TAN = BANNER_STRIP.crop((64, 0, 96, 63))

UNIT_W = 128
UNIT_H = 240
FLOOR_Y = 232


def base_unit():
    im = Image.new('RGBA', (UNIT_W, UNIT_H), (6, 9, 14, 255))
    y = UNIT_H
    while y > 0:
        y -= BRICK.height
        x = 0
        while x < UNIT_W:
            im.paste(BRICK, (x, y), BRICK)
            x += BRICK.width
    im.paste(CEILING, (0, 0), CEILING)
    return im


def paste_bottom(im, tile, x):
    im.paste(tile, (x, FLOOR_Y - tile.height), tile)


def unit_pillar_torch(pillar, crate):
    im = base_unit()
    paste_bottom(im, pillar, 4)
    paste_bottom(im, crate, UNIT_W - crate.width - 10)
    return im


def unit_shelf(shelf, urn, pillar):
    im = base_unit()
    shelf_x = (UNIT_W - shelf.width) // 2
    shelf_y = 110
    im.paste(shelf, (shelf_x, shelf_y), shelf)
    im.paste(urn, (shelf_x + shelf.width // 2 - urn.width // 2, shelf_y - urn.height + 4), urn)
    paste_bottom(im, pillar, UNIT_W - pillar.width - 4)
    return im


def unit_banner(banner, floor_deco, bush=False):
    im = base_unit()
    im.paste(banner, ((UNIT_W - banner.width) // 2, CEILING.height + 2), banner)
    paste_bottom(im, floor_deco, 10)
    if bush:
        im.paste(BUSH, (UNIT_W - BUSH.width - 2, 2), BUSH)
    return im


SEQUENCE = [
    unit_pillar_torch(PILLAR_STONE_A, CRATE_BIG),
    unit_shelf(SHELF_WIDE, URN_PALE, PILLAR_WOOD_A),
    unit_banner(BANNER_RED_POINT, URN_DARK),
    unit_shelf(SHELF_NARROW, URN_TAN, PILLAR_STONE_B),
    unit_banner(BANNER_TAN, CRATE_SMALL, bush=True),
    unit_pillar_torch(PILLAR_WOOD_B, URN_TAN),
]

strip = Image.new('RGBA', (UNIT_W * len(SEQUENCE), UNIT_H), (0, 0, 0, 0))
for i, unit in enumerate(SEQUENCE):
    strip.paste(unit, (i * UNIT_W, 0), unit)

strip2x = strip.resize((strip.width * 2, strip.height * 2), Image.NEAREST)
strip2x.save(os.path.join(OUT, 'room-strip.png'))

door_open = cut((193, 372, 255, 459))
door_closed = cut((257, 372, 319, 459))
door_open.resize((door_open.width * 2, door_open.height * 2), Image.NEAREST).save(os.path.join(OUT, 'icon-door-open.png'))
door_closed.resize((door_closed.width * 2, door_closed.height * 2), Image.NEAREST).save(os.path.join(OUT, 'icon-door.png'))

torch.resize((torch.width * 2, torch.height * 2), Image.NEAREST).save(os.path.join(OUT, 'torch-sheet.png'))

CAP_W = 96

throne = Image.new('RGBA', (CAP_W, UNIT_H), (6, 9, 14, 255))
y = UNIT_H
while y > 0:
    y -= BRICK.height
    x = 0
    while x < CAP_W:
        throne.paste(BRICK, (x, y), BRICK)
        x += BRICK.width
ceiling_crop = CEILING.crop(((CEILING.width - CAP_W) // 2, 0, (CEILING.width - CAP_W) // 2 + CAP_W, CEILING.height))
throne.paste(ceiling_crop, (0, 0), ceiling_crop)
paste_bottom(throne, PILLAR_STONE_A, 2)
paste_bottom(throne, PILLAR_STONE_B, CAP_W - PILLAR_STONE_B.width - 2)
paste_bottom(throne, URN_PALE, (CAP_W - URN_PALE.width) // 2)

throne2x = throne.resize((throne.width * 2, throne.height * 2), Image.NEAREST)
throne2x.save(os.path.join(OUT, 'throne-strip.png'))

print('unit', UNIT_W, UNIT_H, '-> strip', strip2x.size, '-> throne', throne2x.size)
