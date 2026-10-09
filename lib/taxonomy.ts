export type PrepLevel = "HIGH" | "MID" | "LOW" | "NO_PREP" | "NON_COMPETITIVE";

export const PREP_LEVELS: PrepLevel[] = ["HIGH", "MID", "LOW", "NO_PREP", "NON_COMPETITIVE"];

export const PREP_META: Record<PrepLevel, { label: string; short: string; param: string; hint: string; text: string; bg: string; border: string }> = {
  HIGH: {
    label: "High prep",
    short: "High",
    param: "high",
    hint: "Released weeks ahead, judged on depth",
    text: "text-prep-high",
    bg: "bg-prep-high",
    border: "border-prep-high",
  },
  MID: {
    label: "Mid prep",
    short: "Mid",
    param: "mid",
    hint: "A few weeks of build time",
    text: "text-prep-mid",
    bg: "bg-prep-mid",
    border: "border-prep-mid",
  },
  LOW: {
    label: "Low prep",
    short: "Low",
    param: "low",
    hint: "Short build window",
    text: "text-prep-low",
    bg: "bg-prep-low",
    border: "border-prep-low",
  },
  NO_PREP: {
    label: "No prep",
    short: "No prep",
    param: "noprep",
    hint: "Solved on the spot at the meet",
    text: "text-prep-noprep",
    bg: "bg-prep-noprep",
    border: "border-prep-noprep",
  },
  NON_COMPETITIVE: {
    label: "Non-competitive",
    short: "Showcase",
    param: "nc",
    hint: "Conference and project showcases",
    text: "text-prep-nc",
    bg: "bg-prep-nc",
    border: "border-prep-nc",
  },
};

export const prepFromParam = (p: string): PrepLevel | undefined =>
  PREP_LEVELS.find((l) => PREP_META[l].param === p);

export const DOMAINS: Record<string, string> = {
  "ai-ml": "AI / ML",
  "computer-vision": "Computer vision",
  "nlp-genai": "NLP, GenAI and agents",
  robotics: "Robotics, drones and control",
  quant: "Quant and trading",
  optimization: "Optimization and logistics",
  space: "Aerospace, space and geospatial",
  hardware: "Embedded, VLSI and networks",
  security: "Cybersecurity",
  blockchain: "Blockchain",
  games: "Game development",
  mechanical: "Mechanical, automotive and energy",
  product: "Product, business and policy",
  "math-science": "Math and science",
  software: "Software and systems",
  healthcare: "Healthcare",
  sustainability: "Sustainability",
  research: "Research and showcase",
};

export const domainLabel = (id: string) => DOMAINS[id] ?? id;
