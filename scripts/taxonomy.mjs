// Normalization rules used by sync-data.mjs.
// Edit these and re-run `npm run sync` — never hand-edit data/problems.json.

// Raw tag substring (lowercase) -> domain bucket id. A tag can map to several buckets.
export const DOMAIN_RULES = {
  "ai-ml": ["machine learning", "artificial intelligence", "ai/ml", "deep learning", "data science", "data analysis", "statistic", "causal inference", "time series", "data processing", "data extraction", "document processing", "social media analysis"],
  "computer-vision": ["computer vision", "image processing", "facial", "video classification", "image editing", "surveillance"],
  "nlp-genai": ["natural language", "nlp", "generative", "language model", "retrieval augmented", "agentic", "question answering", "sentiment", "text analysis", "text generation", "conversational", "vision-language", "information retrieval", "speech", "tool selection"],
  robotics: ["robot", "drone", "uav", "ugv", "slam", "navigation", "path planning", "autonomous", "control systems", "sensor fusion", "multi-agent", "pid", "obstacle avoidance", "warehouse automation"],
  quant: ["trading", "quantitative", "finance", "financial", "backtest", "fintech", "cryptocurrency"],
  optimization: ["optimization", "optimisation", "operations research", "route planning", "logistics", "supply chain", "algorithms", "clustering", "data structures", "inventory management"],
  space: ["space science", "astronomy", "remote sensing", "satellite", "aerospace", "gis", "mapping", "urban planning"],
  hardware: ["embedded", "vlsi", "asic", "semiconductor", "hdl", "risc-v", "iot", "internet of things", "signal processing", "dsp", "electrical", "wireless", "wifi", "telecommunications", "network optimization", "radio resource", "network protocols", "communication protocols", "computer architecture", "analog to digital"],
  security: ["cyber", "security", "cryptograph", "hacking", "exploit", "vulnerab", "auditing"],
  blockchain: ["blockchain", "smart contract"],
  games: ["game"],
  mechanical: ["mechanical", "automotive", "thermodynamics", "hvac", "electric vehicles", "energy", "materials science", "product design", "aerodynamics", "fluid dynamics", "stol", "wing design", "powered lift", "suspension", "thermal management", "matlab/simulink"],
  product: ["business", "product management", "product development", "entrepreneurship", "market linkages", "product marketing", "case study", "policy", "ui/ux", "ux design", "economics", "governance", "customer research", "metaverse", "edtech", "no-code", "social entrepreneurship", "rural development", "virtual reality", "project management", "digital economy"],
  "math-science": ["mathematics", "physics", "optics", "problem solving", "topological"],
  software: ["web development", "mobile development", "mobile app", "software", "system design", "cloud", "database", "python", "rust", "json", "real-time data", "streaming", "visualization", "programming", "scalability", "digital transformation", "healthcare it"],
  healthcare: ["healthcare"],
  sustainability: ["sustainab", "climate", "environmental", "waste management", "circular economy", "renewable"],
  research: ["academic research", "conference", "innovation", "r&d", "intellectual property", "prototyp"],
};

// Normalized sponsor key -> canonical display name.
// Key = lowercase name with everything except a-z0-9 removed.
export const SPONSOR_ALIASES = {
  dronaaviation: "Drona Aviation",
  jaguarlandrover: "Jaguar Land Rover",
  quantinsti: "QuantInsti",
  consensys: "ConsenSys",
  certin: "CERT-In",
  mathbowl: "Math Bowl",
  stemvibemathbowl: "Math Bowl",
  drdo: "DRDO",
  drdodrge: "DRDO",
  isro: "ISRO",
  isrogeonli: "ISRO",
  isroasicdevelopment: "ISRO",
  solinas: "SOLINAS",
  dream11: "Dream11",
  igdc: "IGDC",
  devrev: "DevRev",
  paradimeio: "paradime.io",
  observeai: "Observe.AI",
  gameconnectgdai: "Game Connect",
  studentsacademicconference: "Students' Academic Conference",
  engineersconclave: "Engineers' Conclave",
};

// Track label for sponsors that ran more than one PS in a year (lowercased source name).
export const TRACKS = {
  "isro (geonli)": "GeoNLI",
  "isro (asic development)": "ASIC Development",
  "stemvibe (math bowl)": "STEMvibe",
  "drdo drge": "DRGE",
  "game connect (gdai)": "GDAI",
};

// Non-competitive events, regardless of which prep heading they sit under.
export const NON_COMPETITIVE = new Set(["Students' Academic Conference", "Engineers' Conclave"]);
