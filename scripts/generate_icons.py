"""
scripts/generate_icons.py

Renders the extension's toolbar icons at each required size (16/32/48/128).
Run once during development; the output PNGs are committed to icons/ like
any other static asset (regenerate with `python3 scripts/generate_icons.py`
if the mark ever changes).

The mark is the same aperture/iris motif used as the popup's signature
element: six overlapping blades forming a closed iris, echoing "focus".
"""

import math
import os

from PIL import Image, ImageDraw

BG = (27, 31, 42, 255)  # slate navy, matches --bg-dark
ACCENT = (245, 166, 35, 255)  # amber, matches --accent
ACCENT_DARK = (196, 128, 20, 255)  # shading for blade overlap depth
RING = (255, 255, 255, 40)

SIZE = 512  # master render size, downsampled for each output


def regular_polygon_points(cx, cy, r, sides, rotation_deg=0):
    points = []
    for i in range(sides):
        angle = math.radians(rotation_deg + (360 / sides) * i)
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return points


def draw_icon(size):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = SIZE / 2, SIZE / 2
    bg_radius = SIZE * 0.46

    # Rounded-square-ish background using a circle keeps it simple and legible at 16px.
    draw.ellipse([cx - bg_radius, cy - bg_radius, cx + bg_radius, cy + bg_radius], fill=BG)
    draw.ellipse(
        [cx - bg_radius, cy - bg_radius, cx + bg_radius, cy + bg_radius],
        outline=RING,
        width=int(SIZE * 0.012),
    )

    # Six overlapping "blades": triangles from center to two adjacent points on a hexagon,
    # alternating a slightly darker shade to suggest overlapping iris blades.
    blade_radius = SIZE * 0.30
    hex_points = regular_polygon_points(cx, cy, blade_radius, 6, rotation_deg=-90)
    for i in range(6):
        p1 = hex_points[i]
        p2 = hex_points[(i + 1) % 6]
        color = ACCENT if i % 2 == 0 else ACCENT_DARK
        draw.polygon([(cx, cy), p1, p2], fill=color)

    # Small center highlight = the focused point the blades close down to.
    dot_r = SIZE * 0.045
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=BG)

    return img.resize((size, size), Image.LANCZOS)


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "icons")
    os.makedirs(out_dir, exist_ok=True)
    for size in (16, 32, 48, 128):
        icon = draw_icon(size)
        path = os.path.join(out_dir, f"icon{size}.png")
        icon.save(path)
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
