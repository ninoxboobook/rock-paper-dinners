import {
  BowlSteam,
  BowlFood,
  Pizza,
  Hamburger,
  Coffee,
  Wine,
  Fish,
  Pepper,
  IceCream,
  Bread,
  ForkKnife,
  type Icon,
} from '@phosphor-icons/react'
import { cuisineGroup } from './cuisine'

// Cohesive Phosphor icon per cuisine group — replaces the OS emoji badges so the
// card / detail / map iconography matches the rest of the UI.
const GROUP_ICON: Record<string, Icon> = {
  Japanese: BowlSteam,
  Korean: BowlSteam,
  Chinese: BowlFood,
  Vietnamese: BowlSteam,
  Thai: Pepper,
  Malaysian: BowlFood,
  Indonesian: BowlFood,
  Indian: Pepper,
  'Sri Lankan': BowlFood,
  Burmese: BowlFood,
  Italian: Pizza,
  Burgers: Hamburger,
  'Steak & BBQ': ForkKnife,
  'Mexican & LatAm': Pepper,
  'Middle East & Greek': ForkKnife,
  Seafood: Fish,
  French: Wine,
  Bakery: Bread,
  'Cafe & Brunch': Coffee,
  Dessert: IceCream,
  'Bars & Wine': Wine,
  Other: ForkKnife,
}

export function cuisineIcon(cuisine: string): Icon {
  return GROUP_ICON[cuisineGroup(cuisine)] ?? ForkKnife
}
