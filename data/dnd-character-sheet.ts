import { type RecursiveListItem } from "@/components/recursive-list";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type CharacterSheetState = {
  character: {
    name: string;
    class: string;
    level: number;
    background: string;
    race: string;
    alignment: string;
    experiencePoints: string;
  };
  ap: {
    str: { base: number; modifier: number };
    dex: { base: number; modifier: number };
    con: { base: number; modifier: number };
    int: { base: number; modifier: number };
    wis: { base: number; modifier: number };
    cha: { base: number; modifier: number };
  };
  combat: {
    armorClass: number;
    initiative: number;
    speed: string;
    currentHp: number;
    maxHp: number;
    tempHp: number;
    hitDice: {
      diceType: string;
      amount: number;
    };
    deathSavesSuccesses: number;
    deathSavesFailures: number;
  };
  skills: {
    acrobatics: { baseApType: AbilityKey; modifier: number };
    animalHandling: { baseApType: AbilityKey; modifier: number };
    arcana: { baseApType: AbilityKey; modifier: number };
    athletics: { baseApType: AbilityKey; modifier: number };
    deception: { baseApType: AbilityKey; modifier: number };
    history: { baseApType: AbilityKey; modifier: number };
    insight: { baseApType: AbilityKey; modifier: number };
    intimidation: { baseApType: AbilityKey; modifier: number };
    investigation: { baseApType: AbilityKey; modifier: number };
    medicine: { baseApType: AbilityKey; modifier: number };
    nature: { baseApType: AbilityKey; modifier: number };
    perception: { baseApType: AbilityKey; modifier: number };
    performance: { baseApType: AbilityKey; modifier: number };
    persuasion: { baseApType: AbilityKey; modifier: number };
    religion: { baseApType: AbilityKey; modifier: number };
    sleightOfHand: { baseApType: AbilityKey; modifier: number };
    stealth: { baseApType: AbilityKey; modifier: number };
    survival: { baseApType: AbilityKey; modifier: number };
  };
  equipment: RecursiveListItem[];
  featuresAndTraits: RecursiveListItem[];
  spells: RecursiveListItem[];
  backstory: string;
};

export const initialCharacterSheetState: CharacterSheetState = {
  character: {
    name: "Stiriacus Exspiravit",
    class: "Blood Hunter",
    level: 3,
    background: "Entertainer",
    race: "Dragonborn",
    alignment: "Neutral",
    experiencePoints: "6500",
  },
  ap: {
    str: {
      base: 17,
      modifier: 2,
    },
    dex: {
      base: 20,
      modifier: 0,
    },
    con: {
      base: 15,
      modifier: 0,
    },
    int: {
      base: 12,
      modifier: 0,
    },
    wis: {
      base: 15,
      modifier: 1,
    },
    cha: {
      base: 20,
      modifier: 0,
    },
  },
  combat: {
    armorClass: 15,
    initiative: +3,
    speed: "30 ft",
    currentHp: 34,
    maxHp: 34,
    tempHp: 0,
    hitDice: {
      diceType: "d8",
      amount: 5,
    },
    deathSavesSuccesses: 0,
    deathSavesFailures: 0,
  },
  skills: {
    acrobatics: { baseApType: "dex", modifier: 0 },
    animalHandling: { baseApType: "wis", modifier: 0 },
    arcana: { baseApType: "int", modifier: 0 },
    athletics: { baseApType: "str", modifier: 0 },
    deception: { baseApType: "cha", modifier: 0 },
    history: { baseApType: "int", modifier: 0 },
    insight: { baseApType: "wis", modifier: 0 },
    intimidation: { baseApType: "cha", modifier: 0 },
    investigation: { baseApType: "int", modifier: 0 },
    medicine: { baseApType: "wis", modifier: 0 },
    nature: { baseApType: "int", modifier: 0 },
    perception: { baseApType: "wis", modifier: 0 },
    performance: { baseApType: "cha", modifier: 0 },
    persuasion: { baseApType: "cha", modifier: 0 },
    religion: { baseApType: "int", modifier: 0 },
    sleightOfHand: { baseApType: "dex", modifier: 0 },
    stealth: { baseApType: "dex", modifier: 0 },
    survival: { baseApType: "wis", modifier: 0 },
  },
  equipment: [
    {
      title: "Weapons",
      description: "Primary combat gear carried by the character.",
      children: [
        { title: "Rapier", description: "Finesse melee weapon.", children: [] },
        {
          title: "Dagger",
          description: "Light thrown melee weapon.",
          children: [],
        },
      ],
    },
    {
      title: "Adventuring Gear",
      description: "Utility and travel supplies.",
      children: [
        {
          title: "Lute",
          description: "Instrument focus and performance tool.",
          children: [],
        },
        {
          title: "Explorer's Pack",
          description: "Standard travel supplies for dungeon delving.",
          children: [],
        },
      ],
    },
    {
      title: "Currency",
      description: "Current carried funds.",
      children: [{ title: "45 gp", description: "Gold pieces.", children: [] }],
    },
  ],
  featuresAndTraits: [
    {
      title: "Bardic Inspiration",
      description: "Grant allies a bonus die to checks, attacks, or saves.",
      children: [
        {
          title: "Die Size: d8",
          description: "Current inspiration die.",
          children: [],
        },
      ],
    },
    {
      title: "Jack of All Trades",
      description: "Add half proficiency to checks without proficiency.",
      children: [],
    },
    {
      title: "Expertise",
      description: "Double proficiency bonus in selected skills.",
      children: [
        { title: "Performance", description: "Expertise skill.", children: [] },
        { title: "Persuasion", description: "Expertise skill.", children: [] },
      ],
    },
  ],
  spells: [
    {
      title: "Cantrips",
      description: "Spells cast at will without consuming spell slots.",
      children: [
        {
          title: "Vicious Mockery",
          description:
            "Deal psychic damage and give disadvantage on next attack.",
          children: [],
        },
        {
          title: "Mage Hand",
          description: "Summon a spectral hand to manipulate small objects.",
          children: [],
        },
        {
          title: "Minor Illusion",
          description: "Create a simple sound or image illusion.",
          children: [],
        },
      ],
    },
    {
      title: "1st-Level",
      description: "Prepared 1st-level spells.",
      children: [
        {
          title: "Healing Word",
          description: "Bonus action healing at range.",
          children: [],
        },
        {
          title: "Dissonant Whispers",
          description: "Psychic damage that can force movement.",
          children: [],
        },
      ],
    },
    {
      title: "2nd-Level",
      description: "Prepared 2nd-level spells.",
      children: [
        {
          title: "Suggestion",
          description: "Compel a creature to follow a reasonable command.",
          children: [],
        },
        {
          title: "Invisibility",
          description: "Turn a creature invisible for up to one hour.",
          children: [],
        },
      ],
    },
    {
      title: "3rd-Level",
      description: "Prepared 3rd-level spells.",
      children: [
        {
          title: "Hypnotic Pattern",
          description: "Incapacitate creatures in a dazzling area.",
          children: [],
        },
      ],
    },
  ],
  backstory:
    "I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face. I have to eat face",
};
