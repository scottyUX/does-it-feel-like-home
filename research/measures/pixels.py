"""Screenshot measures shared by the study-site and Arena analyses.

All take an RGB screenshot (PIL image or PNG/JPEG bytes) of one viewport.
- colorfulness: Hasler & Suesstrunk (2003), the metric Reinecke et al. (2013) use.
- quadtree_blocks: space-based decomposition in the spirit of Reinecke et al. (2013): split a block into
  four while its luminance is not near-uniform (std >= 0.03) and it is larger than 8 px. More blocks = busier.
  This is our implementation, not Reinecke's code.
- edge_density, distinct_colors, background_share: simple complexity and white-space proxies (cf. AIM).
- hue shares: descriptive mix of colored pixels by hue family. Reported as a description, not as
  "cultural" colors.
"""
import io
import numpy as np
from PIL import Image

HUES = {"red": (345, 15), "orange": (15, 45), "yellow": (45, 70), "green": (70, 170), "blue": (170, 260), "purple": (260, 345)}


def _array(image):
    if isinstance(image, (bytes, bytearray)):
        image = Image.open(io.BytesIO(image))
    return np.asarray(image.convert("RGB")).astype(np.float32) / 255


def measure(image):
    a = _array(image)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = np.maximum(mx - mn, 1e-6)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    colored = (sat > 0.25) & (mx > 0.2)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    out = {}
    for name, (lo, hi) in HUES.items():
        band = (hue >= lo) | (hue < hi) if lo > hi else (hue >= lo) & (hue < hi)
        out[f"hue_{name}"] = float((colored & band).mean())
    out["colored_share"] = float(colored.mean())
    rg, yb = r - g, 0.5 * (r + g) - b
    out["colorfulness"] = float((np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)) * 100)
    out["brightness"] = float(lum.mean())
    lit = mx > 0.2
    out["saturation"] = float(sat[lit].mean()) if lit.any() else 0.0

    def blocks(x0, y0, w, h):
        part = lum[y0:y0 + h, x0:x0 + w]
        if w <= 8 or h <= 8 or part.std() < 0.03:
            return 1
        hw, hh = w // 2, h // 2
        return (blocks(x0, y0, hw, hh) + blocks(x0 + hw, y0, w - hw, hh)
                + blocks(x0, y0 + hh, hw, h - hh) + blocks(x0 + hw, y0 + hh, w - hw, h - hh))
    out["quadtree_blocks"] = blocks(0, 0, lum.shape[1], lum.shape[0])
    gx = np.abs(np.diff(lum, axis=1))[:-1, :]
    gy = np.abs(np.diff(lum, axis=0))[:, :-1]
    out["edge_density"] = float(((gx + gy) > 0.1).mean())
    q = (a * 255).astype(np.uint8) // 16
    key = q[..., 0].astype(np.int32) * 256 + q[..., 1].astype(np.int32) * 16 + q[..., 2]
    counts = np.bincount(key.ravel())
    out["background_share"] = float(counts.max() / key.size)
    out["distinct_colors"] = int((counts > key.size * 0.001).sum())
    # Large flat gray rectangles = image placeholders the model left empty (gray, low saturation, uniform).
    return out
