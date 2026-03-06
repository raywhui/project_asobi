import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getSavingThrowModifier(stat: number) {
  return Math.floor((stat - 10) / 2);
}

export function formatSavingThrow(stat: number, modifier: number[] = [0]) {
  const savingThrow =
    getSavingThrowModifier(stat) + modifier.reduce((acc, cur) => acc + cur);
  return savingThrow >= 0 ? `+${savingThrow}` : `${savingThrow}`;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

type Srd2014Record = Record<string, unknown>;
type Srd2014Collection = Record<string, Srd2014Record>;
export type Srd2014CollectionKey =
  | "ability-scores"
  | "alignments"
  | "backgrounds"
  | "classes"
  | "conditions"
  | "damage-types"
  | "equipment-categories"
  | "equipment"
  | "feats"
  | "features"
  | "languages"
  | "levels"
  | "magic-items"
  | "magic-schools"
  | "monsters"
  | "proficiencies"
  | "races"
  | "rule-sections"
  | "rules"
  | "skills"
  | "spells"
  | "subclasses"
  | "subraces"
  | "traits"
  | "weapon-properties";

const SRD_2014_COLLECTION_IMPORTERS: Record<
  Srd2014CollectionKey,
  () => Promise<{ default: Srd2014Collection }>
> = {
  "ability-scores": () => import("@/data/5e/2014/5e-SRD-Ability-Scores.json"),
  alignments: () => import("@/data/5e/2014/5e-SRD-Alignments.json"),
  backgrounds: () => import("@/data/5e/2014/5e-SRD-Backgrounds.json"),
  classes: () => import("@/data/5e/2014/5e-SRD-Classes.json"),
  conditions: () => import("@/data/5e/2014/5e-SRD-Conditions.json"),
  "damage-types": () => import("@/data/5e/2014/5e-SRD-Damage-Types.json"),
  "equipment-categories": () =>
    import("@/data/5e/2014/5e-SRD-Equipment-Categories.json"),
  equipment: () => import("@/data/5e/2014/5e-SRD-Equipment.json"),
  feats: () => import("@/data/5e/2014/5e-SRD-Feats.json"),
  features: () => import("@/data/5e/2014/5e-SRD-Features.json"),
  languages: () => import("@/data/5e/2014/5e-SRD-Languages.json"),
  levels: () => import("@/data/5e/2014/5e-SRD-Levels.json"),
  "magic-items": () => import("@/data/5e/2014/5e-SRD-Magic-Items.json"),
  "magic-schools": () => import("@/data/5e/2014/5e-SRD-Magic-Schools.json"),
  monsters: () => import("@/data/5e/2014/5e-SRD-Monsters.json"),
  proficiencies: () => import("@/data/5e/2014/5e-SRD-Proficiencies.json"),
  races: () => import("@/data/5e/2014/5e-SRD-Races.json"),
  "rule-sections": () => import("@/data/5e/2014/5e-SRD-Rule-Sections.json"),
  rules: () => import("@/data/5e/2014/5e-SRD-Rules.json"),
  skills: () => import("@/data/5e/2014/5e-SRD-Skills.json"),
  spells: () => import("@/data/5e/2014/5e-SRD-Spells.json"),
  subclasses: () => import("@/data/5e/2014/5e-SRD-Subclasses.json"),
  subraces: () => import("@/data/5e/2014/5e-SRD-Subraces.json"),
  traits: () => import("@/data/5e/2014/5e-SRD-Traits.json"),
  "weapon-properties": () =>
    import("@/data/5e/2014/5e-SRD-Weapon-Properties.json"),
};

const REFERENCE_KEY_TO_COLLECTION: Record<string, Srd2014CollectionKey> = {
  "ability-score": "ability-scores",
  "ability-scores": "ability-scores",
  alignment: "alignments",
  alignments: "alignments",
  background: "backgrounds",
  backgrounds: "backgrounds",
  class: "classes",
  classes: "classes",
  condition: "conditions",
  conditions: "conditions",
  "damage-type": "damage-types",
  "damage-types": "damage-types",
  "equipment-category": "equipment-categories",
  "equipment-categories": "equipment-categories",
  equipment: "equipment",
  feat: "feats",
  feats: "feats",
  feature: "features",
  features: "features",
  language: "languages",
  languages: "languages",
  level: "levels",
  levels: "levels",
  "magic-item": "magic-items",
  "magic-items": "magic-items",
  "magic-school": "magic-schools",
  "magic-schools": "magic-schools",
  monster: "monsters",
  monsters: "monsters",
  proficiency: "proficiencies",
  proficiencies: "proficiencies",
  race: "races",
  races: "races",
  "rule-section": "rule-sections",
  "rule-sections": "rule-sections",
  rule: "rules",
  rules: "rules",
  skill: "skills",
  skills: "skills",
  spell: "spells",
  spells: "spells",
  subclass: "subclasses",
  subclasses: "subclasses",
  subrace: "subraces",
  subraces: "subraces",
  trait: "traits",
  traits: "traits",
  "weapon-property": "weapon-properties",
  "weapon-properties": "weapon-properties",
};

const srd2014CollectionCache = new Map<
  Srd2014CollectionKey,
  Promise<Srd2014Collection>
>();

function normalizeLookupKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

async function loadSrd2014Collection(
  collection: Srd2014CollectionKey,
): Promise<Srd2014Collection> {
  const cached = srd2014CollectionCache.get(collection);
  if (cached) return cached;

  const loader = SRD_2014_COLLECTION_IMPORTERS[collection];
  const promise = loader().then((module) => module.default);
  srd2014CollectionCache.set(collection, promise);
  return promise;
}

export async function lookupSrd2014Index(
  index: string,
  options?: { referenceKey?: string; collection?: Srd2014CollectionKey },
): Promise<Srd2014Record | null> {
  const normalizedIndex = normalizeLookupKey(index);

  if (options?.collection) {
    const collection = await loadSrd2014Collection(options.collection);
    return (collection[normalizedIndex] as Srd2014Record | undefined) ?? null;
  }

  const referenceCollection = options?.referenceKey
    ? REFERENCE_KEY_TO_COLLECTION[normalizeLookupKey(options.referenceKey)]
    : undefined;

  if (referenceCollection) {
    const collection = await loadSrd2014Collection(referenceCollection);
    return (collection[normalizedIndex] as Srd2014Record | undefined) ?? null;
  }

  for (const collectionKey of Object.keys(
    SRD_2014_COLLECTION_IMPORTERS,
  ) as Srd2014CollectionKey[]) {
    const collection = await loadSrd2014Collection(collectionKey);
    const result = collection[normalizedIndex] as Srd2014Record | undefined;
    if (result) return result;
  }

  return null;
}

export async function lookupSrd2014Indexes(
  referenceKey: string,
  indexes: string[],
): Promise<Srd2014Record[]> {
  const results = await Promise.all(
    indexes.map((index) =>
      lookupSrd2014Index(index, { referenceKey }).then(
        (value) => value as Srd2014Record | null,
      ),
    ),
  );

  return results.filter((value): value is Srd2014Record => value !== null);
}

export type Srd2014SearchResult = {
  collection: Srd2014CollectionKey;
  index: string;
  data: Srd2014Record;
};

export async function searchSrd2014Indexes(
  query: string,
  limit = 10,
): Promise<Srd2014SearchResult[]> {
  const normalizedQuery = normalizeLookupKey(query);
  if (!normalizedQuery) return [];

  const aggregated: Srd2014SearchResult[] = [];
  const collectionKeys = Object.keys(
    SRD_2014_COLLECTION_IMPORTERS,
  ) as Srd2014CollectionKey[];

  for (const collectionKey of collectionKeys) {
    if (aggregated.length >= limit) break;

    const collection = await loadSrd2014Collection(collectionKey);
    const matchedIndexes = Object.keys(collection)
      .filter((index) => {
        const record = collection[index];
        const name = typeof record?.name === "string" ? record.name : "";
        return (
          normalizeLookupKey(index).includes(normalizedQuery) ||
          normalizeLookupKey(name).includes(normalizedQuery)
        );
      })
      .slice(0, Math.max(1, limit - aggregated.length));

    if (!matchedIndexes.length) continue;

    const records = await lookupSrd2014Indexes(collectionKey, matchedIndexes);
    records.forEach((data, idx) => {
      const index = matchedIndexes[idx];
      if (!index) return;
      aggregated.push({ collection: collectionKey, index, data });
    });
  }

  return aggregated.slice(0, limit);
}
