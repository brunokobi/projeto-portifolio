import type { NewsCategory, Feed } from "../../types";

export const GREEN     = "#42c920";
export const GREEN_DIM = "rgba(66,201,32,0.15)";

// ── CSS global Matrix ──────────────────────────────────────────────────────
export const MATRIX_CSS = `
@keyframes nwsEntry    { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
@keyframes nwsCardIn   { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes nwsHeroTxt  { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }
@keyframes nwsHeroImg  { from{opacity:0;transform:scale(1.07)} to{opacity:1;transform:scale(1)} }
@keyframes nwsScanline { 0%{top:-4%;opacity:.85} 100%{top:110%;opacity:0} }
@keyframes nwsBarGrow  { from{width:0} to{width:32px} }
@keyframes nwsMatrixFall { 0%{opacity:1;transform:translateY(-10px)} 100%{opacity:0;transform:translateY(100px)} }
@keyframes nwsGlitch {
  0%,87%,100%{transform:translate(0);filter:none}
  88%{transform:translate(-3px,0);filter:drop-shadow(3px 0 #00ffff) brightness(1.3)}
  90%{transform:translate(3px,0);filter:drop-shadow(-3px 0 #ff00cc) brightness(1.2)}
  92%{transform:translate(-1px,0);filter:none}
  94%{transform:translate(2px,0);filter:drop-shadow(2px 0 ${GREEN}) brightness(1.1)}
  96%{transform:translate(0);filter:none}
}
@keyframes nwsPulse {
  0%,100%{box-shadow:0 0 8px ${GREEN}33}
  50%{box-shadow:0 0 22px ${GREEN}88, 0 0 44px ${GREEN}33}
}
@keyframes nwsCornerAppear { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
@keyframes nwsBorderFlicker {
  0%,100%{border-color:${GREEN}88}
  50%{border-color:${GREEN}}
  75%{border-color:${GREEN}55}
}

/* card hover effects via classes */
.nws-card { position:relative; overflow:hidden; }
.nws-card .nws-scanline {
  position:absolute; left:0; right:0; height:2px; z-index:6;
  background:linear-gradient(to right, transparent, ${GREEN}, transparent);
  top:-4%; opacity:0; pointer-events:none;
}
.nws-card:hover .nws-scanline { animation: nwsScanline 0.55s ease forwards; }
.nws-card:hover .nws-img { filter:brightness(1.12) saturate(1.15); transform:scale(1.04); transition:all .4s ease; }
.nws-card .nws-img { transition:all .4s ease; width:100%; height:100%; object-fit:cover; display:block; }

.nws-corner { position:absolute; width:0; height:0; opacity:0; z-index:7; pointer-events:none;
  border-color:${GREEN}; border-style:solid; transition:all .22s ease; }
.nws-card:hover .nws-corner { width:14px; height:14px; opacity:1; animation: nwsCornerAppear .22s ease; }
.nws-corner.tl { top:5px; left:5px;  border-width:2px 0 0 2px; }
.nws-corner.tr { top:5px; right:5px; border-width:2px 2px 0 0; }
.nws-corner.bl { bottom:5px; left:5px;  border-width:0 0 2px 2px; }
.nws-corner.br { bottom:5px; right:5px; border-width:0 2px 2px 0; }

.nws-card:hover .nws-title { color:${GREEN}; animation: nwsGlitch 2s ease infinite; transition:color .2s; }
.nws-card:hover { animation: nwsBorderFlicker 1.5s ease infinite; }

.nws-hero-badge { animation: nwsHeroTxt .5s ease .05s both; }
.nws-hero-title { animation: nwsHeroTxt .55s ease .18s both; }
.nws-hero-desc  { animation: nwsHeroTxt .5s ease .32s both; }
.nws-hero-btn   { animation: nwsHeroTxt .5s ease .46s both; }
.nws-hero-img   { animation: nwsHeroImg .8s ease .1s both; }
.nws-header     { animation: nwsEntry .45s ease both; }

/* carousel */
@keyframes nwsProgress { from{width:0%} to{width:100%} }
.nws-carousel-slide { position:absolute; inset:0; transition:opacity .6s ease; }

/* category drawer */
@keyframes nwsDrawerIn  { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes nwsOverlayIn { from{opacity:0} to{opacity:1} }
`;

// ── Matrix chars ──────────────────────────────────────────────────────────
export const MCHARS = "アイウエオカキクケコサシスセソ0123456789ABCDEF</>{}[]ΩΨΞ".split("");

// ── Slide interval (ms) ───────────────────────────────────────────────────
export const SLIDE_INTERVAL = 5500;

// ── Categorias ─────────────────────────────────────────────────────────────
export const CATEGORIES: NewsCategory[] = [
  { id: "pesquisa",    title: "🔬 Pesquisa & Ciência",          desc: "Descobertas, papers e avanços de MIT, ETH Zurich, TUM, Google Research, IEEE, BAIR, arXiv, DeepMind, Stanford e Apple ML.", sources: ["MIT News", "MIT Tech Rev", "Google Res.", "BAIR", "The Gradient", "IEEE Spectrum", "IEEE TV AI", "DeepMind", "arXiv AI", "Apple ML", "Stanford AI", "ScienceDaily", "ETH Zurich", "TUM"],                   accent: "#a855f7" },
  { id: "asia",        title: "🌏 Pesquisa Asiática & China",    desc: "Inovação em IA da Ásia — AI Singapore, RIKEN, Synced Review, ChinAI Newsletter e SCMP Tech.",                             sources: ["AI Singapore", "RIKEN AIP", "Synced", "ChinAI", "SCMP Tech"],                                                                                                                                                 accent: "#00d4ff" },
  { id: "ferramentas", title: "🛠️ Modelos & Ferramentas",       desc: "Novos modelos, datasets e ferramentas — HuggingFace, fast.ai, TensorFlow, KDnuggets, LangChain e Towards AI.",             sources: ["HuggingFace", "KDnuggets", "fast.ai", "TensorFlow", "Towards AI", "LangChain"],                                                                                                                                 accent: "#ff9d00" },
  { id: "engenharia",  title: "💻 Engenharia & Dev",             desc: "Arquitetura de software, boas práticas e bastidores técnicos — Pragmatic Engineer, Martin Fowler, Netflix, n8n e Supabase.", sources: ["Pragmatic Eng.", "Martin Fowler", "Netflix Tech", "n8n Blog", "Supabase"],                                                                                                                                    accent: "#f472b6" },
  { id: "brasil",      title: "🇧🇷 Brasil",                     desc: "Cobertura nacional sobre IA, tecnologia e mercado digital — portais e revistas brasileiras.",                               sources: ["SWEN.AI", "AINEWS", "Exame IA", "TabNews", "Manual Usuário", "MIT Tech BR", "Tecnoblog", "Brazil Journal", "NeoFeed", "Olhar Digital"],                                                                         accent: "#00c8ff" },
  { id: "industria",   title: "💼 Indústria & Tech",             desc: "Lançamentos e tendências do setor — OpenAI, NVIDIA, TechCrunch, The Verge, Wired, AWS, MarkTechPost e Reuters Institute.",  sources: ["The Verge", "TechCrunch", "Wired AI", "AI News", "AI Insider", "AI Weekly", "OpenAI", "NVIDIA Blog", "MarkTechPost", "AWS ML", "Reuters Inst."],                                                             accent: GREEN },
];

// ── Feeds ──────────────────────────────────────────────────────────────────
export const FEEDS: Feed[] = [
  { name: "SWEN.AI",        url: "https://swen.ai/feed/",                                                  flag: "🇧🇷", color: "#00c8ff" },
  { name: "AINEWS",         url: "https://ainews.com.br/feed/",                                            flag: "🇧🇷", color: "#00c8ff" },
  { name: "Exame IA",       url: "https://exame.com/inteligencia-artificial/feed/",                        flag: "🇧🇷", color: "#00c8ff" },
  { name: "AI Weekly",      url: "https://aiweekly.co/issues.rss",                                         flag: "🌎",  color: GREEN },
  { name: "AI Insider",     url: "https://theaiinsider.tech/feed",                                         flag: "🌎",  color: GREEN },
  { name: "MIT News",       url: "https://news.mit.edu/rss/topic/artificial-intelligence",                 flag: "🌎",  color: GREEN },
  { name: "AI News",        url: "https://www.artificialintelligence-news.com/feed/",                      flag: "🌎",  color: GREEN },
  { name: "The Verge",      url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",      flag: "🌎",  color: GREEN },
  { name: "TechCrunch",     url: "https://techcrunch.com/category/artificial-intelligence/feed/",          flag: "🌎",  color: GREEN },
  { name: "Wired AI",       url: "https://www.wired.com/feed/tag/artificial-intelligence/",                flag: "🌎",  color: GREEN },
  { name: "MIT Tech Rev",   url: "https://www.technologyreview.com/feed/",                                 flag: "🌎",  color: GREEN },
  { name: "Google Res.",    url: "https://research.google/blog/rss/",                                      flag: "🌎",  color: "#4285f4" },
  { name: "HuggingFace",    url: "https://huggingface.co/blog/feed.xml",                                   flag: "🌎",  color: "#ff9d00" },
  { name: "The Gradient",   url: "https://thegradient.pub/rss/",                                           flag: "🌎",  color: GREEN },
  { name: "IEEE Spectrum",  url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",      flag: "🌎",  color: "#00629b" },
  { name: "IEEE TV AI",     url: "https://ieeetv.ieee.org/channel_rss/ai/rss",                             flag: "🌎",  color: "#00629b" },
  { name: "BAIR",           url: "https://bair.berkeley.edu/blog/feed.xml",                                flag: "🌎",  color: "#ffa500" },
  { name: "KDnuggets",      url: "https://kdnuggets.com/feed",                                             flag: "🌎",  color: GREEN },
  { name: "OpenAI",         url: "https://openai.com/blog/rss.xml",                                        flag: "🌎",  color: "#10a37f" },
  { name: "DeepMind",       url: "https://www.deepmind.com/blog/rss.xml",                                  flag: "🌎",  color: "#4285f4" },
  { name: "arXiv AI",       url: "https://rss.arxiv.org/rss/cs.AI",                                       flag: "🌎",  color: "#b31b1b" },
  { name: "NVIDIA Blog",    url: "https://blogs.nvidia.com/blog/category/deep-learning/feed/",             flag: "🌎",  color: "#76b900" },
  { name: "Apple ML",       url: "https://machinelearning.apple.com/rss.xml",                              flag: "🌎",  color: "#aaa" },
  { name: "Stanford AI",    url: "https://ai.stanford.edu/blog/feed.xml",                                  flag: "🌎",  color: "#8c1515" },
  { name: "ETH Zurich",     url: "https://www.ethz.ch/en/news-und-veranstaltungen/eth-news/news/_jcr_content.feed.html", flag: "🌎", color: "#1565c0" },
  { name: "TUM",            url: "https://www.tum.de/en/news.rss",                                        flag: "🌎",  color: "#3070b3" },
  { name: "Reuters Inst.",  url: "https://podcasts.ox.ac.uk/feeds/e00174e6-4fa2-405d-a58c-17cbcff4ab65/audio.xml", flag: "🌎", color: "#7c3aed" },
  { name: "MarkTechPost",   url: "https://www.marktechpost.com/feed/",                                     flag: "🌎",  color: GREEN },
  { name: "fast.ai",        url: "https://www.fast.ai/index.xml",                                          flag: "🌎",  color: "#009fdf" },
  { name: "ScienceDaily",   url: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml", flag: "🌎", color: "#0077cc" },
  { name: "AWS ML",         url: "https://aws.amazon.com/blogs/machine-learning/feed/",                    flag: "🌎",  color: "#ff9900" },
  { name: "TensorFlow",     url: "https://blog.tensorflow.org/feeds/posts/default",                        flag: "🌎",  color: "#ff6f00" },
  { name: "Towards AI",     url: "https://towardsai.net/ai/artificial-intelligence/feed",                  flag: "🌎",  color: "#7c3aed" },
  { name: "Synced",         url: "https://syncedreview.com/feed/",                                         flag: "🌏",  color: "#00d4ff" },
  { name: "AI Singapore",   url: "https://aisingapore.org/feed/",                                          flag: "🌏",  color: "#ef4444" },
  { name: "RIKEN AIP",      url: "https://aip.riken.jp/feed/",                                             flag: "🌏",  color: "#e11d48" },
  { name: "ChinAI",         url: "https://feeds.type3.audio/chinai-newsletter.rss",                        flag: "🌏",  color: "#ef4444" },
  { name: "SCMP Tech",      url: "https://www.scmp.com/rss/320663/feed/",                                  flag: "🌏",  color: "#d4a017" },
  { name: "TabNews",        url: "https://www.tabnews.com.br/recentes/rss",                                flag: "🇧🇷", color: "#00c8ff" },
  { name: "Manual Usuário", url: "https://manualdousuario.net/feed/",                                      flag: "🇧🇷", color: "#00c8ff" },
  { name: "MIT Tech BR",    url: "https://mittechreview.com.br/feed/",                                     flag: "🇧🇷", color: "#00c8ff" },
  { name: "Tecnoblog",      url: "https://tecnoblog.net/feed/",                                            flag: "🇧🇷", color: "#00c8ff" },
  { name: "Brazil Journal", url: "https://braziljournal.com/feed/",                                        flag: "🇧🇷", color: "#00c8ff" },
  { name: "NeoFeed",        url: "https://neofeed.com.br/feed/",                                           flag: "🇧🇷", color: "#00c8ff" },
  { name: "Olhar Digital",  url: "https://olhardigital.com.br/rss/",                                       flag: "🇧🇷", color: "#00c8ff" },
  { name: "Pragmatic Eng.", url: "https://blog.pragmaticengineer.com/rss/",                                flag: "🌎",  color: "#f472b6" },
  { name: "Martin Fowler",  url: "https://martinfowler.com/feed.atom",                                     flag: "🌎",  color: "#f472b6" },
  { name: "Netflix Tech",   url: "https://netflixtechblog.medium.com/feed",                                flag: "🌎",  color: "#e50914" },
  { name: "n8n Blog",       url: "https://blog.n8n.io/rss/",                                               flag: "🌎",  color: "#ea4b71" },
  { name: "Supabase",       url: "https://supabase.com/rss.xml",                                           flag: "🌎",  color: "#3ecf8e" },
  { name: "LangChain",      url: "https://blog.langchain.dev/rss.xml",                                     flag: "🌎",  color: "#1c7ed6" },
];

// ── Score de prestígio por fonte ──────────────────────────────────────────
export const SOURCE_PRESTIGE: Record<string, number> = {
  "MIT Tech Rev": 20, "MIT News": 20, "Google Res.": 18, "IEEE Spectrum": 16,
  "ETH Zurich": 16, "BAIR": 15, "TUM": 15, "The Gradient": 14, "Reuters Inst.": 13,
  "Wired AI": 13, "The Verge": 13, "TechCrunch": 12, "HuggingFace": 11,
  "AI News": 10, "AI Insider": 10, "ChinAI": 10, "Pragmatic Eng.": 10,
  "Martin Fowler": 10, "AI Weekly": 9, "Exame IA": 9, "MIT Tech BR": 9,
  "IEEE TV AI": 9, "SCMP Tech": 9, "KDnuggets": 8, "SWEN.AI": 8, "AINEWS": 8,
  "Synced": 7, "Tecnoblog": 7, "Brazil Journal": 7, "TabNews": 6,
  "Netflix Tech": 8, "Supabase": 7, "n8n Blog": 6, "Manual Usuário": 6,
};

// ── Keywords por importância ──────────────────────────────────────────────
export const KW_CRITICAL = [
  "agi", "artificial general intelligence", "superintelligence", "breakthrough",
  "ban", "regulation", "acquisition", "merger", "openai", "anthropic",
  "google deepmind", "deepmind",
];
export const KW_HIGH = [
  "gpt", "claude", "gemini", "llama", "mistral", "nvidia", "sora", "release",
  "launch", "lança", "novo modelo", "new model", "meta ai", "microsoft", "apple intelligence",
];
export const KW_MED = [
  "model", "machine learning", "neural", "research", "billion", "open source",
  "safety", "hallucination", "robot", "robô", "chatbot", "agent", "agente", "multimodal",
];

// ── Palavras de spam (promoções/consumo irrelevante) ──────────────────────
export const SPAM_WORDS = [
  // promoções
  "promoção", "oferta", "desconto", "mais barato", "menor preço", "preço caiu",
  "cupom", "cashback", "oportunidade:", "sai por r$", "sai com", "aproveite",
  // celulares consumidor
  "iphone 1", "iphone 2", "iphone se", "galaxy s2", "galaxy a", "galaxy m",
  "moto g", "moto e", "motorola edge", "motorola razr", "motorola moto",
  "xiaomi redmi", "realme", "poco x", "oneplus nord", "tecno", "infinix",
  "melhor celular", "top celular", "celular bom", "celular custo", "celular barato",
  // TV / home
  "smart tv", "televisão", "televisao", " tv 4k", " tv 8k", "qled", "oled tv",
  "monitor gamer", "soundbar", "home theater", "caixa de som bluetooth",
  // periféricos consumidor
  "fone de ouvido", "headphone", "earphone", "earbuds", "airpods", "tws fone",
  "smartwatch", "relógio inteligente", "wearable fitness",
  // câmeras
  "câmera fotográfica", "camera mirrorless", "câmera dslr", "action cam", "gopro",
  // games de consumo
  "playstation 5", "ps5", "xbox series", "nintendo switch", "jogo para",
  // eletrodomésticos
  "geladeira", "fogão", "micro-ondas", "ar-condicionado", "purificador de água",
  // reviews e propaganda de produtos
  "vale a pena comprar", "devo comprar o", "devo comprar a",
  "melhor notebook", "melhor laptop", "melhor tablet", "melhor impressora",
  "melhor câmera", "melhor roteador", "melhor monitor",
  "unboxing do", "unboxing da", "unboxing:",
  "testamos o novo", "testamos a nova", "avaliamos o novo", "avaliamos a nova",
  "primeiras impressões do", "primeiras impressões da",
];

// ── Fontes de conteúdo misto (exigem keywords de IA/dev) ─────────────────
export const MIXED_SOURCES = new Set([
  "Tecnoblog", "Olhar Digital", "NeoFeed", "Brazil Journal",
  "MIT Tech Rev", "Manual Usuário", "TabNews", "KDnuggets",
  "ETH Zurich", "TUM", "Reuters Inst.", "SCMP Tech",
]);

// ── Keywords de IA/dev para filtrar fontes mistas ─────────────────────────
export const AI_DEV_KEYWORDS = [
  // IA/ML PT
  "inteligência artificial", "aprendizado de máquina", "machine learning",
  "deep learning", "rede neural", "modelo de linguagem", "ia generativa",
  "agente de ia", "chatbot", "llm",
  // modelos e empresas IA
  "gpt-", "chatgpt", "claude", "gemini", "llama", "mistral", "copilot", "sora",
  "dall-e", "midjourney", "stable diffusion", "grok", "openai", "anthropic",
  "deepmind", "hugging face", "huggingface", "meta ai",
  // termos técnicos ML/AI
  "fine-tuning", "embeddings", "transformer", "prompt engineer", "retrieval-augmented",
  "computer vision", "processamento de linguagem", "reconhecimento de voz",
  // dev/software
  "código aberto", "open source", "framework", "kubernetes", "docker",
  "devops", "computação em nuvem", "cloud native", "serverless",
  "github", "python", "javascript", "typescript", "rust", "golang", "kotlin",
  "banco de dados", "microsserviços", "api rest", "graphql", "backend",
  // segurança digital
  "cibersegurança", "ransomware", "phishing", "malware", "vazamento de dados",
  "zero-day", "ataque hacker", "brecha de segurança",
  // EN
  "artificial intelligence", "machine learning", "deep learning", "language model",
  "neural network", "generative ai", "ai model", "ai agent", "ai safety",
  "open source", "cloud computing", "cybersecurity", "data breach",
  "software engineering", "developer", "programming", "kubernetes", "docker",
];

// ── Fontes científicas/internacionais com bônus extra no carrossel ────────
export const HERO_SCIENCE_BOOST = new Set([
  "MIT News", "MIT Tech Rev", "Google Res.", "ETH Zurich", "TUM",
  "BAIR", "The Gradient", "IEEE Spectrum", "IEEE TV AI", "DeepMind",
  "Stanford AI", "arXiv AI", "Apple ML", "ScienceDaily", "Reuters Inst.",
  "RIKEN AIP", "AI Singapore", "HuggingFace", "OpenAI", "NVIDIA Blog",
  "ChinAI", "SCMP Tech", "Synced", "AI News",
]);
