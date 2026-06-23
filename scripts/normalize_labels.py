import json, re, sys
from collections import Counter

WRITE = '--write' in sys.argv

# Suburb canonicalisation (Chinatown is within the CBD)
SUBURB_MAP = {
    'Chinatown (CBD)': 'CBD',
    'CBD (Chinatown)': 'CBD',
}

# Explicit short cuisine labels for the awkward / long / mergeable cases.
CANON = {
    'All-you-can-eat Japanese izakaya / BBQ': 'Japanese izakaya',
    'Artisan sourdough bakery & cafe': 'Sourdough bakery',
    'Asian-influenced brunch & specialty coffee': 'Cafe & brunch',
    'Asian-inspired bingsu & dessert (Korean shaved ice, waffles)': 'Korean dessert',
    'Cantonese fine dining': 'Cantonese',
    'Chinese-French (chinoiserie) bistro': 'Chinese-French',
    'Chongqing Chinese noodles': 'Chongqing noodles',
    'Croissanterie & bakery': 'Bakery',
    'Filipino-inspired gelato & sorbet': 'Filipino gelato',
    'Fresh handmade Italian pasta shop': 'Italian pasta',
    'Halal Lanzhou hand-pulled beef noodles': 'Lanzhou noodles',
    'Indonesian sandwiches & coffee': 'Indonesian cafe',
    'Indonesian-influenced specialty coffee & sandwiches': 'Specialty coffee',
    'Italian wood-fired pizza & pasta': 'Pizza & pasta',
    'Japanese comfort food & specialty coffee': 'Japanese cafe',
    'Japanese omakase handroll': 'Japanese omakase',
    'Japanese sushi/sashimi & omakase': 'Sushi & omakase',
    'Japanese udon noodles': 'Japanese udon',
    'Japanese udon noodles (Sanuki-style)': 'Japanese udon',
    'Japanese-Korean brunch cafe': 'Japanese-Korean cafe',
    'Japanese-inspired brunch & specialty coffee': 'Japanese cafe',
    'Japanese-inspired cafe & desserts': 'Japanese cafe',
    'Japanese-inspired cafe / specialty coffee & brunch': 'Japanese cafe',
    'Japanese-style bakery & pastries': 'Japanese bakery',
    'Japanese-style poke salad bowls': 'Poke bowls',
    'Korean BBQ all-you-can-eat buffet': 'Korean BBQ',
    'Malaysian hawker cafe & brunch': 'Malaysian hawker',
    'Malaysian hawker food hall': 'Malaysian hawker',
    'Modern Australian fine dining': 'Modern Australian',
    'Modern Australian-Japanese / izakaya': 'Australian-Japanese',
    'Modern South African-inspired wine bar & restaurant': 'South African',
    'Modern Vietnamese cafe & brunch (banh mi croissant, pho, egg coffee)': 'Vietnamese cafe',
    'Scandinavian-Southeast Asian bakery ("Scandinasian")': 'Bakery',
    'Shanghai-style Chinese (dumplings, pan-fried buns, soy milk)': 'Shanghainese',
    'Shanxi knife-cut noodles (Northern Chinese)': 'Shanxi noodles',
    'Shanxi knife-sliced noodles': 'Shanxi noodles',
    'Specialty coffee roaster & cafe': 'Specialty coffee',
    'Taiwanese fusion cafe & brunch': 'Taiwanese cafe',
    'Traditional Japanese deli (Kyoto-style obanzai, veg-focused)': 'Japanese deli',
    # cross-variant merges & nicer labels
    'Cafe by day, wine bar / European share plates by night': 'Cafe & wine bar',
    'Modern Chinese fine dining': 'Modern Chinese',
    'Modern European fine dining': 'Modern European',
    'Public house / casual bar & diner (modern Australian)': 'Pub',
    'Pub / modern Australian (steaks, pub classics)': 'Pub',
    'Charcoal steak restaurant & cocktail bar': 'Steakhouse',
    'Steakhouse (Wagyu / Modern Australian)': 'Steakhouse',
    'Natural wine & snack bar': 'Natural wine bar',
    'Natural wine bar & modern Australian': 'Natural wine bar',
    'Mediterranean wine bar / eatery': 'Mediterranean',
    'Sustainable seafood (Mediterranean)': 'Seafood',
    'Seafood & wine bar': 'Seafood & wine',
    'Boutique cake shop / patisserie': 'Cakes & patisserie',
    'Crepe cake cafe & patisserie': 'Crepe cakes',
    'Italian dessert bar / self-serve tiramisu & gelato': 'Italian dessert',
    'Gelato & dessert (globally-inspired)': 'Gelato',
    'Roast meat rolls / sandwich shop': 'Roast meat rolls',
    'Steak sandwiches / Italian-style steak rolls': 'Steak sandwiches',
    'Schnitzel sandwiches / sandwich shop': 'Schnitzel rolls',
    'Deli & sandwiches': 'Deli',
    'Sandwiches, salads & coffee': 'Sandwiches',
    'Bagels & bakery cafe': 'Bagels',
    'Polish deli (pierogi, smallgoods, continental cakes)': 'Polish deli',
    'Greek souvlaki / gyros': 'Greek souvlaki',
    'Turkish kebabs & pide': 'Turkish',
    'Persian / Middle Eastern cafe & restaurant (brunch by day, banquets by night)': 'Persian',
    'Persian charcoal BBQ (halal, no pork/alcohol)': 'Persian BBQ',
    'Israeli / Mediterranean street food': 'Israeli',
    'Fish and chips (Pacific Islands / Tongan-Samoan influence)': 'Fish & chips',
    'Thai kopi coffee shop & desserts / Thai street food': 'Thai cafe',
    'Thai mookata hotpot & BBQ (Isaan)': 'Thai BBQ',
    'Thai-Japanese BBQ & hotpot (mookata)': 'Thai-Japanese BBQ',
    'Northeastern Thai / Isan street food': 'Isan Thai',
    'Northern Vietnamese (banh cuon)': 'Vietnamese',
    'Vietnamese (Central Vietnamese banh xeo)': 'Vietnamese',
    'Vietnamese (banh cuon specialist)': 'Vietnamese',
    'Vietnamese bakery (banh mi)': 'Banh mi',
    'Korean gomtang (slow-simmered Wagyu beef soup) house': 'Korean gomtang',
    'Korean gukbap (pork soup) specialist': 'Korean gukbap',
    'Korean cafe (kkwabaegi twisted doughnuts, corn dogs & Korean drinks)': 'Korean cafe',
    'Korean restaurant & bar': 'Korean',
    'Contemporary Korean': 'Modern Korean',
    'Korean (seasonal fermentation-led degustation)': 'Modern Korean',
    'Cantonese rice rolls (cheung fun)': 'Cheung fun',
    'Northern Chinese / Peking duck & yum cha': 'Peking duck',
    'Peking duck / Chinese': 'Peking duck',
    'Hong Kong Cantonese (dai pai dong style)': 'Hong Kong',
    'Singaporean Chinese / Cantonese yum cha': 'Singaporean',
    'Teochew / Chaozhou (Swatow) Chinese': 'Teochew',
    'Chaozhou (Teochew) & Malaysian Chinese': 'Teochew',
    'Hakka Chinese': 'Hakka',
    'Yunnan Chinese': 'Yunnan',
    'Balinese / Indonesian': 'Balinese',
    'Modern Indonesian / Bali grill': 'Modern Indonesian',
    'Indonesian (Manadonese / North Sulawesi)': 'Indonesian',
    'Indonesian martabak (sweet/savoury stuffed pancakes) & noodles; halal': 'Indonesian martabak',
    'New York-style pizza': 'Pizza',
    'Uyghur (halal hand-pulled noodles, lamb skewers, pilaf)': 'Uyghur',
    'Yemeni (Mandi)': 'Yemeni',
    'Mauritian (seafood, charcoal, natural wine)': 'Mauritian',
    'American diner / burgers & grill': 'American diner',
    'Matcha & specialty coffee': 'Matcha cafe',
}

DROP_TRAIL = {'restaurant','shop','house','eatery','takeaway','express','store',
              'specialist','buffet','bar','grill','diner','bakehouse'}

def shorten(c):
    if c in CANON: return CANON[c]
    s = re.sub(r'\s*\([^)]*\)', '', c).strip()
    s = re.split(r',', s)[0]
    s = re.split(r' by day| by night', s)[0]
    s = re.split(r' / | – | - | with ', s)[0]
    if ' & ' in s and len(s.split()) > 3:
        s = s.split(' & ')[0]
    s = re.sub(r'\s+', ' ', s).strip()
    words = s.split()
    while len(words) > 2 and words[-1].lower().strip('.,') in DROP_TRAIL:
        words.pop()
    if len(words) > 3:
        words = words[:3]
    return ' '.join(words)

d = json.load(open('src/data/venues.json'))
for v in d:
    v['cuisineShort'] = shorten(v['cuisine'])
    v['suburb'] = SUBURB_MAP.get(v['suburb'], v['suburb'])

shorts = Counter(v['cuisineShort'] for v in d)
print('distinct short labels: %d' % len(shorts))
maxlen = max(len(s) for s in shorts)
print('longest label: %d chars' % maxlen)
print('\n=== labels with >=4 words or >20 chars (should be none) ===')
bad = [s for s in shorts if len(s.split()) >= 4 or len(s) > 20]
for s in sorted(bad): print('  ', repr(s))
if not bad: print('  (none)')
print('\n=== CBD suburb count now: %d ===' % sum(1 for v in d if v['suburb']=='CBD'))
print('Chinatown variants remaining:', [v['suburb'] for v in d if 'hinatown' in v['suburb']])

if WRITE:
    json.dump(d, open('src/data/venues.json','w'), ensure_ascii=False, indent=1)
    print('\n*** WROTE venues.json ***')
else:
    print('\n(review only — re-run with --write to apply)')
