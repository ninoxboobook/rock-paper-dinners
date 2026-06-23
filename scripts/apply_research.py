import json, sys

out = json.load(open(sys.argv[1]))
payload = out.get('result') or out
if isinstance(payload, str):
    payload = json.loads(payload)
byid = {r['id']: r for r in payload['results']}

P = 'src/data/venues.json'
d = json.load(open(P))
dropped = []; kept = []
for v in d:
    r = byid.get(v['id'])
    if r:
        if r.get('cuisine'): v['cuisine'] = r['cuisine'].strip()
        if r.get('cuisineShort'): v['cuisineShort'] = r['cuisineShort'].strip()
        if r.get('description'): v['description'] = r['description'].strip()
        v['address'] = (r.get('address') or '').strip()
        v.pop('open', None)  # don't keep the flag; we drop closed instead
        if r.get('open', True) is False:
            dropped.append(v['name']); continue
    kept.append(v)

kept.sort(key=lambda r: (r['suburb'], r['name']))
json.dump(kept, open(P, 'w'), ensure_ascii=False, indent=1)
print(f'kept {len(kept)} | dropped {len(dropped)}: {", ".join(dropped)}')
