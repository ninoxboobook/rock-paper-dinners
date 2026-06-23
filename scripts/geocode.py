#!/usr/bin/env python3
"""One-time geocoder: enrich venues with lat/lng for the map. Free OSM Nominatim."""
import json, re, time, os, sys, urllib.parse, urllib.request

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, 'source.json')
OUT = os.path.join(HERE, '..', 'src', 'data', 'venues.json')
CACHE = os.path.join(HERE, 'geocache.json')

REGIONAL = {'ballarat', 'connewarre', 'newcomb', 'geelong'}  # exclude regional VIC
UA = 'rock-paper-dinners-geocoder/1.0 (personal use)'
MELB_BBOX = (-38.6, -37.2, 144.2, 145.9)  # latmin, latmax, lngmin, lngmax (generous greater Melbourne)

ADDR_RE = re.compile(
    r'(\d+[A-Za-z]?(?:[-/]\d+[A-Za-z]?)?\s+'
    r'(?:[A-Z][A-Za-z]+\s+){1,3}'
    r'(?:St|Street|Rd|Road|Ave|Avenue|Lane|Ln|Pl|Place|Pde|Parade|Way|Walk|Terrace|Tce|Boulevard|Blvd|Drive|Dr|Court|Crescent|Highway|Hwy))\b'
)

def slug(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')

def cache_load():
    if os.path.exists(CACHE):
        return json.load(open(CACHE))
    return {}

def geocode(q, cache):
    if q in cache:
        return cache[q]
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'format': 'json', 'limit': 1, 'countrycodes': 'au', 'q': q})
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.load(r)
    except Exception as e:
        data = []
    time.sleep(1.15)  # Nominatim rate limit
    res = None
    if data:
        res = {'lat': float(data[0]['lat']), 'lng': float(data[0]['lon'])}
    cache[q] = res
    json.dump(cache, open(CACHE, 'w'))
    return res

def in_melb(pt):
    return pt and MELB_BBOX[0] <= pt['lat'] <= MELB_BBOX[1] and MELB_BBOX[2] <= pt['lng'] <= MELB_BBOX[3]

def main():
    o = json.load(open(SRC))
    vs = json.loads(o['result'])['venues']
    cache = cache_load()
    out = []
    total = 0
    for v in vs:
        if not v.get('confirmed'):
            continue
        suburb = (v.get('suburb') or '').strip()
        if suburb.lower() in REGIONAL:
            continue
        # also drop if notes explicitly say not metro Melbourne
        if re.search(r'not (?:metropolitan |metro )?melbourne|regional victoria', (v.get('notes') or ''), re.I):
            continue
        total += 1
        notes = v.get('notes') or ''
        m = ADDR_RE.search(notes)
        addr = m.group(1) if m else None
        pt = None
        precision = 'none'
        if addr:
            pt = geocode(f"{addr}, {suburb}, VIC, Australia", cache)
            if in_melb(pt):
                precision = 'exact'
            else:
                pt = None
        if not pt and suburb:
            pt = geocode(f"{suburb}, Victoria, Australia", cache)
            precision = 'suburb' if in_melb(pt) else 'none'
            if not in_melb(pt):
                pt = None
        handle = v.get('handle') or ''
        rec = {
            'id': slug(v['name'] + '-' + suburb),
            'name': v['name'],
            'cuisine': v.get('cuisine') or '',
            'suburb': suburb,
            'city': v.get('city') or 'Melbourne',
            'description': notes,
            'address': addr or '',
            'instagram': handle,
            'instagramUrl': ('https://instagram.com/' + handle) if handle else '',
            'mapsUrl': 'https://www.google.com/maps/search/?api=1&query=' +
                       urllib.parse.quote_plus(' '.join(x for x in [v['name'], suburb, 'Melbourne', 'Australia'] if x)),
            'lat': pt['lat'] if pt else None,
            'lng': pt['lng'] if pt else None,
            'geoPrecision': precision,
        }
        out.append(rec)
        print(f"[{total}] {rec['name'][:30]:30} {precision:7} {rec['lat']}", flush=True)
    # de-dup by id
    seen = {}
    dedup = []
    for r in out:
        if r['id'] in seen:
            continue
        seen[r['id']] = 1
        dedup.append(r)
    dedup.sort(key=lambda r: (r['suburb'], r['name']))
    json.dump(dedup, open(OUT, 'w'), ensure_ascii=False, indent=1)
    exact = sum(1 for r in dedup if r['geoPrecision'] == 'exact')
    sub = sum(1 for r in dedup if r['geoPrecision'] == 'suburb')
    none = sum(1 for r in dedup if r['geoPrecision'] == 'none')
    print(f"\nDONE: {len(dedup)} venues -> {OUT}")
    print(f"  exact={exact} suburb={sub} none={none}")

if __name__ == '__main__':
    main()
