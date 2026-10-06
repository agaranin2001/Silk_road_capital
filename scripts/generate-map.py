#!/usr/bin/env python3
"""One-off generator for assets/img/map.svg (market access section background).

Same approach as the Silk Road Travel map (../scripts/generate-map.py): Natural Earth
1:110m country shapes (public domain, world-atlas npm package) in an equirectangular
projection. The crop window lives in src/content/markets.json ("map") so the city
points and routes drawn by the site use exactly the same projection.

    python3 scripts/generate-map.py
"""
import json, os, urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
OUT = os.path.join(ROOT, "assets", "img", "map.svg")
CFG = json.load(open(os.path.join(ROOT, "src", "content", "markets.json")))["map"]
LON0, LON1, LAT0, LAT1, W, H = (CFG[k] for k in ("lon0", "lon1", "lat0", "lat1", "width", "height"))


def project(lon, lat):
    return (lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H


def main():
    topo = json.load(urllib.request.urlopen(SRC))
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(idx):
        pts = []
        for i in idx:
            a = arcs[i] if i >= 0 else arcs[~i][::-1]
            pts.extend(a if not pts else a[1:])
        return pts

    paths = []
    for geom in topo["objects"]["countries"]["geometries"]:
        polys = geom.get("arcs", [])
        if geom["type"] == "Polygon":
            polys = [polys]
        d = []
        for poly in polys:
            for r in poly:
                pts = ring(r)
                lons = [p[0] for p in pts]
                lats = [p[1] for p in pts]
                if max(lons) < LON0 - 10 or min(lons) > LON1 + 10 or max(lats) < LAT0 - 10 or min(lats) > LAT1 + 10:
                    continue
                xy = [project(*p) for p in pts]
                d.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in xy) + "Z")
        if d:
            paths.append("".join(d))

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'
        '<g fill="#10282f" stroke="#1f3d45" stroke-width="0.8" stroke-linejoin="round">'
        + "".join(f'<path d="{d}"/>' for d in paths)
        + "</g></svg>"
    )
    with open(OUT, "w") as f:
        f.write(svg)
    print(f"wrote {OUT} ({len(svg)//1024} KB, {len(paths)} shapes)")


if __name__ == "__main__":
    main()
