import json, re, time, math, urllib.parse, urllib.request
from collections import Counter

P = 'src/data/venues.json'
UA = 'rock-paper-dinners-geocoder/1.0 (personal use)'
MELB = (-38.6, -37.2, 144.2, 145.9)
MAX_KM = 4.0  # reject a street match further than this from the suburb centroid

TYPES = (r'St|Street|Rd|Road|Ave|Avenue|Lane|Ln|Pl|Place|Pde|Parade|Way|Walk|Terrace|Tce|'
         r'Boulevard|Blvd|Drive|Dr|Court|Crescent|Cres|Highway|Hwy|Arcade|Mall|Square')
NUM = re.compile(r'''(?:(?:shop|unit|level|suite|g)\s*\d*[,/\ ]\s*)?
                     \d+[A-Za-z]?(?:[-–]\d+[A-Za-z]?)?(?:/\d+[A-Za-z]?)?\s+
                     (?:[A-Z][A-Za-z']+\s+){1,3}(?:''' + TYPES + r')\b', re.I | re.X)
STREET = re.compile(r"\b([A-Z][A-Za-z']+(?:\s+[A-Z][A-Za-z']+){0,2}\s+(?:" + TYPES + r"))\b")
SKIP_STREET = {'queen victoria market', 'madame brussels lane', 'main rd', 'main road', 'main st', 'main street'}

def km(a, b):
    R = 6371.0
    dlat = math.radians(b[0]-a[0]); dlon = math.radians(b[1]-a[1])
    h = math.sin(dlat/2)**2 + math.cos(math.radians(a[0]))*math.cos(math.radians(b[0]))*math.sin(dlon/2)**2
    return 2*R*math.asin(math.sqrt(h))

def geo(q):
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'format': 'json', 'limit': 1, 'countrycodes': 'au', 'q': q})
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.load(r)
    except Exception:
        data = []
    time.sleep(1.15)
    if not data:
        return None
    pt = (float(data[0]['lat']), float(data[0]['lon']))
    return pt if (MELB[0] <= pt[0] <= MELB[1] and MELB[2] <= pt[1] <= MELB[3]) else None

def locality(s):
    return 'Melbourne' if s in ('CBD', 'Melbourne CBD') else s

d = json.load(open(P))
sub = [v for v in d if v['geoPrecision'] == 'suburb']
print(f'{len(sub)} suburb-level venues to try (max {MAX_KM}km from suburb centroid)\n')

up_exact = up_street = rejected = 0
for v in sub:
    desc = v.get('description') or ''
    loc = locality(v['suburb'])
    origin = (v['lat'], v['lng'])  # current suburb centroid, for distance sanity check

    def accept(pt, prec, label, src):
        global up_exact, up_street
        dist = km(origin, pt)
        if dist > MAX_KM:
            print(f'  reject {v["name"][:22]:22} {src[:26]:26} {dist:5.1f}km away — kept suburb')
            return False
        v['lat'], v['lng'] = pt; v['geoPrecision'] = prec
        if prec == 'exact': up_exact += 1
        else: up_street += 1
        print(f'  {label} {v["name"][:22]:22} {src[:26]:26} {pt[0]:.5f},{pt[1]:.5f} ({dist:.1f}km)')
        return True

    nm = NUM.search(desc)
    if nm:
        addr = nm.group(0).strip()
        pt = geo(f'{addr}, {loc}, VIC, Australia') or geo(f'{addr}, Melbourne, VIC, Australia')
        if pt and accept(pt, 'exact', 'EXACT ', addr):
            continue
    st = next((m.group(1).strip() for m in STREET.finditer(desc)
               if m.group(1).strip().lower() not in SKIP_STREET), None)
    if st:
        pt = geo(f'{st}, {loc}, VIC, Australia')
        if pt and accept(pt, 'street', 'street', st):
            continue
    if not nm and not st:
        print(f'  ----   {v["name"][:22]:22} no address/street in description — kept suburb')

d.sort(key=lambda r: (r['suburb'], r['name']))
json.dump(d, open(P, 'w'), ensure_ascii=False, indent=1)
print(f'\nUpgraded: {up_exact} -> exact, {up_street} -> street.')
print('precision now:', dict(Counter(v['geoPrecision'] for v in d)))
