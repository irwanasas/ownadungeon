from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOM_DIR = os.path.join(ROOT, 'public', 'assets', 'room')
SHEET_PATH = os.path.join(ROOM_DIR, 'Room.png')
OUT_PATH = os.path.join(ROOM_DIR, 'room-bg.png')

SHEET = Image.open(SHEET_PATH).convert('RGBA')


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

CANVAS_W = 820
CANVAS_H = 220
FLOOR_LIP_Y = 178

canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))


def paste(img, x, y):
    canvas.paste(img, (int(x), int(y)), img)


def tile_wall():
    x = 0
    row = 0
    while x < CANVAS_W:
        tile = WALL_A if (x // WALL_A.width) % 2 == 0 else WALL_B
        y = 0
        while y < CANVAS_H:
            paste(tile, x, y)
            y += tile.height
        x += tile.width


def tile_floor_lip(x0, x1, y):
    x = x0
    while x < x1:
        remaining = x1 - x
        tile = SHELF if remaining >= SHELF.width else SHELF.crop((0, 0, remaining, SHELF.height))
        paste(tile, x, y)
        x += tile.width


tile_wall()

paste(CORNER, 0, 0)
paste(CORNER, CANVAS_W - CORNER.width, 0)

paste(BANNER_TAN, 22, 30)
paste(BANNER_TAN, 58, 30)

paste(DOOR_OPEN, 96, FLOOR_LIP_Y - DOOR_OPEN.height)
paste(CRATE_SMALL, 40, FLOOR_LIP_Y - CRATE_SMALL.height)
paste(CRATE_LARGE, 70, FLOOR_LIP_Y - CRATE_LARGE.height)
paste(POT_TALL, 165, FLOOR_LIP_Y - POT_TALL.height)

paste(PILLAR_STONE, 186, FLOOR_LIP_Y - PILLAR_STONE.height + 4)

TORCH_ANCHORS = []
TORCH_ANCHORS.append((230, FLOOR_LIP_Y - 78))

ledge_x0, ledge_x1 = 262, 434
ledge_top_y = 46
ledge_bottom_y = 168
tile_floor_lip(ledge_x0, ledge_x1, ledge_top_y)
tile_floor_lip(ledge_x0, ledge_x1, ledge_bottom_y)

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
paste(DOOR_CLOSED, door_x, FLOOR_LIP_Y - DOOR_CLOSED.height)

paste(CRATE_LARGE, ledge_x0 - 62, FLOOR_LIP_Y - CRATE_LARGE.height)
paste(CRATE_SMALL, ledge_x0 - 20, FLOOR_LIP_Y - CRATE_SMALL.height)

paste(PILLAR_STONE, ledge_x1 + 14, FLOOR_LIP_Y - PILLAR_STONE.height + 4)
paste(BANNER_RED, ledge_x1 + 54, 32)

TORCH_ANCHORS.append((ledge_x1 + 12, FLOOR_LIP_Y - 78))

right_pillar_x = ledge_x1 + 96
paste(PILLAR_WOOD, right_pillar_x, ledge_top_y)
paste(BANNER_RED, right_pillar_x + 40, 32)

paste(PILLAR_STONE, right_pillar_x + 82, FLOOR_LIP_Y - PILLAR_STONE.height + 4)
paste(BANNER_RED, right_pillar_x + 118, 32)

TORCH_ANCHORS.append((right_pillar_x + 150, FLOOR_LIP_Y - 78))

paste(POT_BIG, right_pillar_x + 158, FLOOR_LIP_Y - POT_BIG.height)
paste(CRATE_LARGE, right_pillar_x + 190, FLOOR_LIP_Y - CRATE_LARGE.height)

tile_floor_lip(0, CANVAS_W, FLOOR_LIP_Y)
tile_floor_lip(0, 40, FLOOR_LIP_Y + 14)
tile_floor_lip(CANVAS_W - 40, CANVAS_W, FLOOR_LIP_Y + 14)

canvas = canvas.crop((0, 0, CANVAS_W, FLOOR_LIP_Y + SHELF.height + 16))
canvas.save(OUT_PATH)
print('wrote', OUT_PATH, canvas.size)
print('torch anchors (px, relative to', canvas.size, '):', TORCH_ANCHORS)
