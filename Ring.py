# Draws 3 concentric rings, each divided into 16 coloured block sections.
# Each ring rotates the colour palette slightly for a pinwheel effect.

import tkinter as tk
import math

WINDOW   = 620
CENTER   = WINDOW // 2
SECTIONS = 16
GAP      = 2.5        # degrees of gap between blocks

# Inner radius, then each ring: (width, gap_after)
RINGS = [
    (90,  65, 12),   # (inner_radius, width, gap_to_next)
    (167, 65, 12),
    (244, 65,  0),
]

COLOURS = [
    "#FF3333", "#FF7700", "#FFBB00", "#FFE500",
    "#AAEE00", "#33CC33", "#00CC88", "#00BBDD",
    "#0088FF", "#3355FF", "#7722EE", "#CC00DD",
    "#FF00AA", "#FF0055", "#FF6600", "#00DDAA",
]

ARC_STEPS = 30   # polygon smoothness

def ring_block(canvas, cx, cy, r_in, r_out, a_start, a_end, colour):
    """Draw one annular sector as a filled polygon."""
    def arc(r, a0, a1, steps):
        pts = []
        for i in range(steps + 1):
            a = math.radians(a0 + (a1 - a0) * i / steps)
            pts.append((cx + r * math.cos(a), cy - r * math.sin(a)))
        return pts

    outer = arc(r_out, a_start, a_end, ARC_STEPS)
    inner = arc(r_in,  a_end, a_start, ARC_STEPS)   # reversed for closed shape
    pts   = [coord for pt in outer + inner for coord in pt]

    canvas.create_polygon(pts, fill=colour, outline="#111111", width=1.5)

root = tk.Tk()
root.title("Concentric Ring Blocks")
root.resizable(False, False)

canvas = tk.Canvas(root, width=WINDOW, height=WINDOW, bg="#111111", highlightthickness=0)
canvas.pack()

section_span = 360 / SECTIONS

for ring_idx, (r_in, width, _) in enumerate(RINGS):
    r_out = r_in + width
    rotation = ring_idx * (SECTIONS // 4)   # rotate palette per ring

    for s in range(SECTIONS):
        colour    = COLOURS[(s + rotation) % SECTIONS]
        a_start   = 90 + s * section_span + GAP / 2      # start at top
        a_end     = 90 + (s + 1) * section_span - GAP / 2
        ring_block(canvas, CENTER, CENTER, r_in, r_out, a_start, a_end, colour)

root.mainloop()
