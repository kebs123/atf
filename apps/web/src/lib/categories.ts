export const CATEGORIES = [
  { id: "personal-care", label: "Personal care", short: "Care" },
  { id: "food-alcoholic-drinks", label: "Food, alcoholic & drinks", short: "Food & drinks" },
  { id: "construction-materials", label: "Construction materials", short: "Build" },
  { id: "automotive-parts", label: "Automotive parts", short: "Auto" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
