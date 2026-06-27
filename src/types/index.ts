// ── Feed & Article ────────────────────────────────────────────────────────
export interface Feed {
  name: string;
  url: string;
  flag: string;
  color: string;
  cat?: string;
}

export interface Article {
  title: string;
  link: string;
  date: Date | null;
  img: string | null;
  desc?: string;
  source: Feed;
  score?: number;
}

// ── GeoIP ─────────────────────────────────────────────────────────────────
export interface GeoIPData {
  ip?: string;
  country?: string;
  country_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

// ── Language Context ──────────────────────────────────────────────────────
export interface LanguageContextType {
  locale: string;
  setLanguage: (lang: string) => void;
}

// ── Map / Location ────────────────────────────────────────────────────────
export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  desc?: string;
  img?: string;
}

// ── Category (News Page) ──────────────────────────────────────────────────
export interface NewsCategory {
  id: string;
  title: string;
  desc: string;
  sources: string[];
  accent: string;
}

export interface NewsCategoryWithArticles extends NewsCategory {
  articles: Article[];
}

// ── Project Card ──────────────────────────────────────────────────────────
export interface Project {
  title: string;
  description: string;
  tags: string[];
  image?: string;
  liveUrl?: string;
  repoUrl?: string;
}

// ── Contact Form ──────────────────────────────────────────────────────────
export interface ContactFormData {
  nome: string;
  email: string;
  mensagem: string;
}

// ── Skill ─────────────────────────────────────────────────────────────────
export interface Skill {
  name: string;
  icon: string;
  color?: string;
  level?: number;
}
