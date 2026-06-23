import json, time, urllib.parse, urllib.request
P='src/data/venues.json'
d=json.load(open(P))
UA='rock-paper-dinners-geocoder/1.0 (personal use)'
def geo(q):
    url='https://nominatim.openstreetmap.org/search?'+urllib.parse.urlencode({'format':'json','limit':1,'countrycodes':'au','q':q})
    req=urllib.request.Request(url,headers={'User-Agent':UA})
    try:
        with urllib.request.urlopen(req,timeout=20) as r: data=json.load(r)
    except Exception as e: data=[]
    time.sleep(1.2)
    return (float(data[0]['lat']),float(data[0]['lon'])) if data else None

# fixes: name -> (new_suburb or None, geocode_query)
fixes={
 'Rei': ('Fitzroy', 'Fitzroy, Victoria, Australia'),                       # pop-up @ Deeds taproom, Fitzroy
 'Publique Bakery': ('CBD', '91-93 Victoria Street, Melbourne, VIC, Australia'),
}
for v in d:
    if v['name'] in fixes:
        sub,q=fixes[v['name']]
        if sub: v['suburb']=sub
        pt=geo(q)
        if pt:
            v['lat'],v['lng']=pt
            v['geoPrecision']='exact' if 'Street' in q else 'suburb'
        print(f"{v['name']:18} suburb='{v['suburb']}' coords={v['lat']},{v['lng']} ({v['geoPrecision']})")

d.sort(key=lambda r:(r['suburb'], r['name']))
json.dump(d,open(P,'w'),ensure_ascii=False,indent=1)
nosub=sum(1 for v in d if not (v['suburb'] or '').strip())
nocoord=sum(1 for v in d if v['lat'] is None)
print(f"\nNow: {len(d)} venues | no-suburb={nosub} | no-coords={nocoord}")
