"""Favicon set from the icon's bat-and-moon: a pixel bat (from bat-mask.js) over a coral moon.

    uv run --with pillow python tools/icons.py
Writes favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180), icon-192.png, icon-512.png.
"""
import base64, io, os, re
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, '..')
src = open(os.path.join(SITE, 'bat-mask.js')).read()
B = {k: v for k, v in re.findall(r'(\w+):(-?[\d.]+)', src.split('b:')[0])}
W, H = int(B['w']), int(B['h'])
x0, y0, x1, y1 = (float(B[k]) for k in ('x0', 'y0', 'x1', 'y1'))
bits = base64.b64decode(re.search(r'b:"([^"]+)"', src).group(1))
mask = [[(bits[(r * W + c) >> 3] >> (7 - ((r * W + c) & 7))) & 1 for c in range(W)] for r in range(H)]

F = 6  # one favicon pixel = 6x6 mask pixels
GW, GH = W // F, H // F
grid = [[sum(mask[r * F + i][c * F + j] for i in range(F) for j in range(F)) * 2 > F * F for c in range(GW)] for r in range(GH)]

# 64-unit canvas: aubergine tile, coral moon, pixel bat.
CX, CY, R = 32.0, 31.0, 17.0
bx, by = CX + x0 * R, CY + y0 * R
cw, ch = (x1 - x0) * R / GW, (y1 - y0) * R / GH

runs = []
for r, row in enumerate(grid):
    c = 0
    while c < GW:
        if row[c]:
            s = c
            while c < GW and row[c]:
                c += 1
            runs.append((r, s, c - s))
        else:
            c += 1
path = ''.join('M%.2f %.2fh%.2fv%.2fh-%.2fz' % (bx + s * cw, by + r * ch, n * cw, ch, n * cw) for r, s, n in runs)
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
       '<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef514f"/><stop offset="1" stop-color="#ce2b39"/></linearGradient></defs>'
       '<rect width="64" height="64" rx="14" fill="#290922"/>'
       '<circle cx="%g" cy="%g" r="%g" fill="url(#m)"/>'
       '<path d="%s" fill="#000"/></svg>\n') % (CX, CY, R, path)
open(os.path.join(SITE, 'favicon.svg'), 'w').write(svg)


def render(size, tile=True):
    S = 16  # supersample
    n = size * S
    k = n / 64
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if tile:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=14 * k, fill='#290922')
    for y in range(int((CY - R) * k), int((CY + R) * k) + 1):
        t = (y / k - (CY - R)) / (2 * R)
        col = tuple(round(a + (b - a) * t) for a, b in zip((0xef, 0x51, 0x4f), (0xce, 0x2b, 0x39)))
        dy = y / k - CY
        if abs(dy) <= R:
            dx = (R * R - dy * dy) ** 0.5
            d.line([((CX - dx) * k, y), ((CX + dx) * k, y)], fill=col)
    for r, s, m in runs:
        d.rectangle([(bx + s * cw) * k, (by + r * ch) * k, (bx + (s + m) * cw) * k - 1, (by + (r + 1) * ch) * k - 1], fill='#000')
    return im.resize((size, size), Image.LANCZOS)


render(180).save(os.path.join(SITE, 'apple-touch-icon.png'), optimize=True)
render(192).save(os.path.join(SITE, 'icon-192.png'), optimize=True)
render(512).save(os.path.join(SITE, 'icon-512.png'), optimize=True)
render(48).save(os.path.join(SITE, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('icons:', len(runs), 'runs,', len(svg), 'bytes svg')
