// Maps a free-text cuisine string to a representative food emoji + a coarse group
// used for filtering. The slot-machine reels show these emojis.

const EMOJI_RULES: [RegExp, string][] = [
  [/ramen|udon|noodle|soba/i, '🍜'],
  [/sushi|sashimi|omakase|japanese|izakaya|kaiseki|donburi|katsu|tempura|oden|yakitori|robata/i, '🍱'],
  [/korean|bbq|barbecue|kbbq|gukbap|fried chicken/i, '🍗'],
  [/dumpling|dim sum|yum cha|wonton|bao|xiao long|baozi/i, '🥟'],
  [/chinese|cantonese|sichuan|szechuan|hunan|teochew|chaozhou|hakka|congee|hot ?pot/i, '🥢'],
  [/vietnam|pho|banh mi|bánh|com tam/i, '🍲'],
  [/thai|tom yum|pad thai|isaan|som tum/i, '🌶️'],
  [/malaysia|laksa|nasi lemak|hawker|ipoh|mamak/i, '🍛'],
  [/indonesia|sambal|warung|rendang|martabak|nasi/i, '🍚'],
  [/indian|masala|biryani|dosa|tandoor|curry/i, '🍛'],
  [/sri lanka|hopper|kottu/i, '🥥'],
  [/burmese|myanmar/i, '🫕'],
  [/pizza|napoli|neapolitan|pizzeria/i, '🍕'],
  [/pasta|italian|trattoria|osteria|risotto|gnocchi/i, '🍝'],
  [/burger|smash/i, '🍔'],
  [/steak|wagyu|grill|steakhouse|bbq|smoked|brisket|butcher/i, '🥩'],
  [/taco|burrito|mexican|torta|taqueria|latin/i, '🌮'],
  [/greek|souvlaki|gyros|yiros|hellenic/i, '🥙'],
  [/kebab|shawarma|falafel|lebanese|turkish|persian|afghan|middle eastern|armenian/i, '🥙'],
  [/seafood|oyster|fish|crab|lobster/i, '🦪'],
  [/french|bistro|brasserie|patisserie/i, '🥐'],
  [/bakery|bakehouse|baker|croissant|pastry|bagel|sourdough/i, '🥐'],
  [/coffee|cafe|brunch|espresso|café|kafé/i, '☕'],
  [/dessert|cake|gelato|ice cream|parfait|cheesecake|crepe|matcha|sweets|sorbet/i, '🍰'],
  [/wine|bar|cocktail|natural wine|pub|tavern|hotel/i, '🍷'],
  [/deli|sandwich|sub/i, '🥪'],
]

export function cuisineEmoji(cuisine: string): string {
  for (const [re, emoji] of EMOJI_RULES) if (re.test(cuisine)) return emoji
  return '🍽️'
}

// Coarse buckets for the filter chips, derived from the same keywords.
const GROUP_RULES: [RegExp, string][] = [
  [/japanese|ramen|udon|sushi|izakaya|kaiseki|donburi|katsu|tempura|oden|yakitori|robata|noodle/i, 'Japanese'],
  [/korean|kbbq|gukbap/i, 'Korean'],
  [/chinese|cantonese|sichuan|szechuan|teochew|chaozhou|hakka|congee|dumpling|dim sum|yum cha|hot ?pot/i, 'Chinese'],
  [/vietnam|pho|banh mi|bánh/i, 'Vietnamese'],
  [/thai/i, 'Thai'],
  [/malaysia|laksa|hawker|ipoh/i, 'Malaysian'],
  [/indonesia|sambal|warung|nasi/i, 'Indonesian'],
  [/indian|masala|biryani|dosa|tandoor|curry/i, 'Indian'],
  [/sri lanka|hopper|kottu/i, 'Sri Lankan'],
  [/burmese|myanmar/i, 'Burmese'],
  [/pizza|pasta|italian|trattoria|osteria/i, 'Italian'],
  [/burger|smash/i, 'Burgers'],
  [/steak|wagyu|steakhouse|bbq|barbecue|smoked|brisket|grill/i, 'Steak & BBQ'],
  [/taco|burrito|mexican|torta|taqueria|latin/i, 'Mexican & LatAm'],
  [/greek|souvlaki|kebab|shawarma|falafel|lebanese|turkish|persian|afghan|middle eastern|armenian|hellenic/i, 'Middle East & Greek'],
  [/seafood|oyster|fish|crab|lobster/i, 'Seafood'],
  [/french|bistro|brasserie/i, 'French'],
  [/bakery|bakehouse|baker|croissant|pastry|bagel/i, 'Bakery'],
  [/coffee|cafe|brunch|espresso|café|kafé/i, 'Cafe & Brunch'],
  [/dessert|cake|gelato|ice cream|parfait|cheesecake|crepe|sweets|sorbet/i, 'Dessert'],
  [/wine|cocktail|natural wine|pub|tavern|\bbar\b/i, 'Bars & Wine'],
]

export function cuisineGroup(cuisine: string): string {
  for (const [re, g] of GROUP_RULES) if (re.test(cuisine)) return g
  return 'Other'
}
