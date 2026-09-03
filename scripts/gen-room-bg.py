from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOM_DIR = os.path.join(ROOT, 'public', 'assets', 'room')
SHEET_PATH = os.path.join(ROOM_DIR, 'Room.png')
TORCH_SHEET_PATH = os.path.join(ROOM_DIR, 'TorchAnimation.png')
CORRIDOR_OUT = os.path.join(ROOM_DIR, 'room-corridor.png')
THRONE_OUT = os.path.join(ROOM_DIR, 'room-throne.png')

SHEET = Image.open(SHEET_PATH).convert('RGBA')
TORCH_SHEET = Image.open(TORCH_SHEET_PATH).convert('RGBA')


def cut(box):
    return SHEET.crop(box)


CORNER = cut((5, 6, 123, 113))
SHELF = cut((37, 134, 123, 152))
WALL_A = cut((11, 163, 117, 284))
WALL_B = cut((11, 323, 117, 444))
PILLAR_STONE = cut((224, 171, 256, 352))
PILLAR_WOOD = cut((352, 161, 384, 352))
SHADOW_FILL = cut((480, 128, 544, 256))
DOOR_OPEN = cut((193, 372, 255, 459))
DOOR_CLOSED = cut((257, 372, 319, 459))
CRATE_LARGE = cut((322, 416, 382, 458))
CRATE_SMALL = cut((384, 432, 416, 457))
POT_TALL = cut((422, 423, 443, 457))
POT_ROUND = cut((450, 425, 476, 457))
POT_BIG = cut((481, 426, 512, 457))
BANNER_RED = cut((131, 480, 157, 543))
BANNER_TAN = cut((195, 480, 221, 543))
TORCH_STATIC = TORCH_SHEET.crop((0, 0, 32, 64))


def tile_floor_lip(target, x0, x1, y):
    x = x0
    while x < x1:
        remaining = x1 - x
        tile = SHELF if remaining >= SHELF.width else SHELF.crop((0, 0, remaining, SHELF.height))
        target.paste(tile, (int(x), int(y)), tile)
        x += tile.width


UNIT_W = WALL_A.width * 2
UNIT_H = 204
FLOOR_LIP_Y = 178


def base_unit(wall_tile):
    im = Image.new('RGBA', (UNIT_W, UNIT_H), (0, 0, 0, 0))
    x = 0
    while x < UNIT_W:
        y = 0
        while y < UNIT_H:
            im.paste(wall_tile, (x, y), wall_tile)
            y += wall_tile.height
        x += wall_tile.width
    tile_floor_lip(im, 0, UNIT_W, FLOOR_LIP_Y)
    return im


def unit_pillar_torch():
    im = base_unit(WALL_A)
    px = (UNIT_W - PILLAR_STONE.width) // 2
    im.paste(PILLAR_STONE, (px, FLOOR_LIP_Y - PILLAR_STONE.height + 6), PILLAR_STONE)
    tx = px - 46
    im.paste(TORCH_STATIC, (tx, FLOOR_LIP_Y - 74), TORCH_STATIC)
    return im


def unit_banner():
    im = base_unit(WALL_B)
    bx = UNIT_W // 2 - BANNER_RED.width - 10
    im.paste(BANNER_TAN, (bx, 24), BANNER_TAN)
    im.paste(BANNER_RED, (bx + BANNER_RED.width + 20, 24), BANNER_RED)
    im.paste(CRATE_SMALL, (18, FLOOR_LIP_Y - CRATE_SMALL.height), CRATE_SMALL)
    im.paste(POT_ROUND, (UNIT_W - 50, FLOOR_LIP_Y - POT_ROUND.height), POT_ROUND)
    return im


def unit_door():
    im = base_unit(WALL_A)
    dx = (UNIT_W - DOOR_CLOSED.width) // 2
    im.paste(DOOR_CLOSED, (dx, FLOOR_LIP_Y - DOOR_CLOSED.height), DOOR_CLOSED)
    im.paste(PILLAR_WOOD, (dx - 26, FLOOR_LIP_Y - PILLAR_WOOD.height + 14), PILLAR_WOOD)
    im.paste(PILLAR_WOOD, (dx + DOOR_CLOSED.width - 6, FLOOR_LIP_Y - PILLAR_WOOD.height + 14), PILLAR_WOOD)
    im.paste(POT_BIG, (24, FLOOR_LIP_Y - POT_BIG.height), POT_BIG)
    return im


def unit_archway():
    im = base_unit(WALL_B)
    ax = (UNIT_W - DOOR_OPEN.width) // 2
    im.paste(DOOR_OPEN, (ax, FLOOR_LIP_Y - DOOR_OPEN.height), DOOR_OPEN)
    tx = ax - 44
    im.paste(TORCH_STATIC, (tx, FLOOR_LIP_Y - 74), TORCH_STATIC)
    im.paste(CRATE_LARGE, (UNIT_W - 68, FLOOR_LIP_Y - CRATE_LARGE.height), CRATE_LARGE)
    return im


SEQUENCE = [unit_pillar_torch(), unit_door(), unit_banner(), unit_pillar_torch(), unit_archway(), unit_banner()]

corridor = Image.new('RGBA', (UNIT_W * len(SEQUENCE), UNIT_H), (0, 0, 0, 0))
for i, unit in enumerate(SEQUENCE):
    corridor.paste(unit, (i * UNIT_W, 0), unit)
corridor.save(CORRIDOR_OUT)
print('wrote', CORRIDOR_OUT, corridor.size, '(tileable, unit width', UNIT_W, ')')


def build_throne_scene():
    canvas_w = 820
    canvas_h = 220
    floor_lip_y = 178
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

    def paste(img, x, y):
        canvas.paste(img, (int(x), int(y)), img)

    x = 0
    while x < canvas_w:
        tile = WALL_A if (x // WALL_A.width) % 2 == 0 else WALL_B
        y = 0
        while y < canvas_h:
            paste(tile, x, y)
            y += tile.height
        x += tile.width

    paste(CORNER, 0, 0)
    paste(CORNER, canvas_w - CORNER.width, 0)

    paste(BANNER_TAN, 22, 30)
    paste(BANNER_TAN, 58, 30)
    paste(DOOR_OPEN, 96, floor_lip_y - DOOR_OPEN.height)
    paste(CRATE_SMALL, 40, floor_lip_y - CRATE_SMALL.height)
    paste(CRATE_LARGE, 70, floor_lip_y - CRATE_LARGE.height)
    paste(POT_TALL, 165, floor_lip_y - POT_TALL.height)
    paste(PILLAR_STONE, 186, floor_lip_y - PILLAR_STONE.height + 4)

    ledge_x0, ledge_x1 = 262, 434
    ledge_top_y = 46
    ledge_bottom_y = 168
    tile_floor_lip(canvas, ledge_x0, ledge_x1, ledge_top_y)
    tile_floor_lip(canvas, ledge_x0, ledge_x1, ledge_bottom_y)

    for layer_y in range(ledge_top_y + SHELF.height, ledge_bottom_y, SHADOW_FILL.height):
        sx = ledge_x0
        while sx < ledge_x1:
            crop_h = min(SHADOW_FILL.height, ledge_bottom_y - layer_y)
            paste(SHADOW_FILL.crop((0, 0, SHADOW_FILL.width, crop_h)), sx, layer_y)
            sx += SHADOW_FILL.width

    paste(PILLAR_WOOD, ledge_x0 - 6, ledge_top_y)
    paste(PILLAR_WOOD, ledge_x1 - PILLAR_WOOD.width + 6, ledge_top_y)
    paste(POT_ROUND, ledge_x0 + 14, ledge_top_y - POT_ROUND.height + 4)
    paste(POT_BIG, ledge_x1 - 40, ledge_top_y - POT_BIG.height + 4)

    door_x = (ledge_x0 + ledge_x1) // 2 - DOOR_CLOSED.width // 2
    paste(DOOR_CLOSED, door_x, floor_lip_y - DOOR_CLOSED.height)
    paste(CRATE_LARGE, ledge_x0 - 62, floor_lip_y - CRATE_LARGE.height)
    paste(CRATE_SMALL, ledge_x0 - 20, floor_lip_y - CRATE_SMALL.height)

    paste(PILLAR_STONE, ledge_x1 + 14, floor_lip_y - PILLAR_STONE.height + 4)
    paste(BANNER_RED, ledge_x1 + 54, 32)

    right_pillar_x = ledge_x1 + 96
    paste(PILLAR_WOOD, right_pillar_x, ledge_top_y)
    paste(BANNER_RED, right_pillar_x + 40, 32)
    paste(PILLAR_STONE, right_pillar_x + 82, floor_lip_y - PILLAR_STONE.height + 4)
    paste(BANNER_RED, right_pillar_x + 118, 32)
    paste(POT_BIG, right_pillar_x + 158, floor_lip_y - POT_BIG.height)
    paste(CRATE_LARGE, right_pillar_x + 190, floor_lip_y - CRATE_LARGE.height)

    tile_floor_lip(canvas, 0, canvas_w, floor_lip_y)
    tile_floor_lip(canvas, 0, 40, floor_lip_y + 14)
    tile_floor_lip(canvas, canvas_w - 40, canvas_w, floor_lip_y + 14)

    return canvas.crop((0, 0, canvas_w, floor_lip_y + SHELF.height + 16))


throne = build_throne_scene()
throne.save(THRONE_OUT)
print('wrote', THRONE_OUT, throne.size)
