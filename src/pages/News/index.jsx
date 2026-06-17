import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Flex, Grid, Text, Badge, Link, Spinner,
  VStack, HStack, Icon, Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  BsBoxArrowUpRight, BsChevronLeft, BsChevronRight,
  BsSortDown, BsClock, BsArrowLeft, BsArrowRight,
} from "react-icons/bs";

const GREEN     = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";
const PROXY     = "/.netlify/functions/news?url=";

// ── Categorias ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "brasil",
    title: "🇧🇷 Brasil",
    desc: "Cobertura nacional sobre IA — startups, pesquisas e impacto no mercado brasileiro.",
    sources: ["SWEN.AI", "AINEWS", "Exame IA"],
    accent: "#00c8ff",
  },
  {
    id: "pesquisa",
    title: "🔬 Pesquisa & Ciência",
    desc: "Descobertas, papers e avanços de MIT, Google Research, IEEE, BAIR e The Gradient.",
    sources: ["MIT News", "MIT Tech Rev", "Google Res.", "BAIR", "The Gradient", "IEEE Spectrum"],
    accent: "#a855f7",
  },
  {
    id: "industria",
    title: "💼 Indústria & Tech",
    desc: "Lançamentos, empresas e tendências — TechCrunch, The Verge, Wired e AI News.",
    sources: ["The Verge", "TechCrunch", "Wired AI", "AI News", "AI Insider", "AI Weekly"],
    accent: GREEN,
  },
  {
    id: "ferramentas",
    title: "🛠️ Modelos & Ferramentas",
    desc: "Novos modelos, datasets e ferramentas para desenvolvedores de IA.",
    sources: ["HuggingFace", "KDnuggets", "MIRI", "Synced"],
    accent: "#ff9d00",
  },
];

// ── Importância ────────────────────────────────────────────────────────────
const SOURCE_PRESTIGE = {
  "MIT Tech Rev": 20, "MIT News": 20, "Google Res.": 18,
  "IEEE Spectrum": 16, "BAIR": 15, "The Gradient": 14,
  "Wired AI": 13, "The Verge": 13, "TechCrunch": 12,
  "HuggingFace": 11, "AI News": 10, "AI Insider": 10,
  "AI Weekly": 9, "Exame IA": 9, "KDnuggets": 8,
  "SWEN.AI": 8, "AINEWS": 8, "Synced": 7,
};
const KW_CRITICAL = ["agi","artificial general intelligence","superintelligence","breakthrough","ban","regulation","acquisition","merger","openai","anthropic","google deepmind","deepmind"];
const KW_HIGH     = ["gpt","claude","gemini","llama","mistral","nvidia","sora","release","launch","lança","novo modelo","new model","meta ai","microsoft","apple intelligence"];
const KW_MED      = ["model","machine learning","neural","research","billion","open source","safety","hallucination","robot","robô","chatbot","agent","agente","multimodal"];

function scoreArticle(a) {
  let s = SOURCE_PRESTIGE[a.source?.name] || 5;
  if (a.date && !isNaN(a.date)) {
    const h = (Date.now() - a.date) / 3_600_000;
    s += h < 2 ? 40 : h < 6 ? 33 : h < 12 ? 25 : h < 24 ? 16 : h < 48 ? 8 : h < 96 ? 3 : 0;
  }
  const t = (a.title || "").toLowerCase();
  KW_CRITICAL.forEach(k => { if (t.includes(k)) s += 18; });
  KW_HIGH.forEach(k     => { if (t.includes(k)) s += 10; });
  KW_MED.forEach(k      => { if (t.includes(k)) s += 4; });
  if (a.img) s += 6;
  return s;
}

function importanceLevel(score) {
  if (score >= 65) return { label: "URGENTE",   color: "#ff4444", icon: "🔥" };
  if (score >= 45) return { label: "DESTAQUE",  color: "#ffaa00", icon: "⚡" };
  if (score >= 28) return { label: "RELEVANTE", color: GREEN,     icon: "📌" };
  return null;
}

// ── Feeds ──────────────────────────────────────────────────────────────────
const FEEDS = [
  { name: "SWEN.AI",       url: "https://swen.ai/feed/",                                                 flag: "🇧🇷", color: "#00c8ff" },
  { name: "AINEWS",        url: "https://ainews.com.br/feed/",                                           flag: "🇧🇷", color: "#00c8ff" },
  { name: "Exame IA",      url: "https://exame.com/inteligencia-artificial/feed/",                       flag: "🇧🇷", color: "#00c8ff" },
  { name: "AI Weekly",     url: "https://aiweekly.co/issues.rss",                                        flag: "🌎", color: GREEN },
  { name: "AI Insider",    url: "https://theaiinsider.tech/feed",                                        flag: "🌎", color: GREEN },
  { name: "MIT News",      url: "https://news.mit.edu/rss/topic/artificial-intelligence",                flag: "🌎", color: GREEN },
  { name: "AI News",       url: "https://www.artificialintelligence-news.com/feed/",                     flag: "🌎", color: GREEN },
  { name: "The Verge",     url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",     flag: "🌎", color: GREEN },
  { name: "TechCrunch",    url: "https://techcrunch.com/category/artificial-intelligence/feed/",         flag: "🌎", color: GREEN },
  { name: "Wired AI",      url: "https://www.wired.com/feed/tag/artificial-intelligence/",               flag: "🌎", color: GREEN },
  { name: "MIT Tech Rev",  url: "https://www.technologyreview.com/feed/",                                flag: "🌎", color: GREEN },
  { name: "Google Res.",   url: "https://research.google/blog/rss/",                                     flag: "🌎", color: "#4285f4" },
  { name: "HuggingFace",   url: "https://huggingface.co/blog/feed.xml",                                  flag: "🌎", color: "#ff9d00" },
  { name: "The Gradient",  url: "https://thegradient.pub/rss/",                                          flag: "🌎", color: GREEN },
  { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",    flag: "🌎", color: "#00629b" },
  { name: "BAIR",          url: "https://bair.berkeley.edu/blog/feed.xml",                               flag: "🌎", color: "#ffa500" },
  { name: "KDnuggets",     url: "https://kdnuggets.com/feed",                                            flag: "🌎", color: GREEN },
];

// ── RSS parsing ────────────────────────────────────────────────────────────
function extractImage(item) {
  for (const tag of ["thumbnail","content","image"]) {
    for (const name of [`media:${tag}`, tag]) {
      const els = item.getElementsByTagName(name);
      for (let i = 0; i < els.length; i++) {
        const url = els[i].getAttribute("url");
        if (url && /^https?:\/\//i.test(url)) return url;
      }
    }
  }
  const enc = item.getElementsByTagName("enclosure");
  for (let i = 0; i < enc.length; i++) {
    const t = enc[i].getAttribute("type") || "";
    const u = enc[i].getAttribute("url")  || "";
    if (u && (t.startsWith("image") || /\.(jpe?g|png|gif|webp)$/i.test(u))) return u;
  }
  for (const sel of ["description","content","summary","content:encoded"]) {
    const el = item.getElementsByTagName(sel)[0];
    if (!el) continue;
    const raw = el.textContent || "";
    const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m && /^https?:\/\//i.test(m[1])) return m[1];
    const mu = raw.match(/https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|gif|webp)/i);
    if (mu) return mu[0];
  }
  return null;
}

function parseRSS(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  let items = Array.from(doc.querySelectorAll("item"));
  if (!items.length) items = Array.from(doc.querySelectorAll("entry"));

  return items.slice(0, 8).map((item) => {
    const getText = (tag) => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
    const title = getText("title");
    let link = getText("link");
    if (!link) {
      const el = item.querySelector("link[rel='alternate']") || item.querySelector("link");
      link = el?.getAttribute("href") || el?.textContent?.trim() || "";
    }
    const date = getText("pubDate") || getText("published") || getText("updated") || getText("dc:date");
    const img  = extractImage(item);
    const rawDesc = getText("description") || getText("summary") || getText("content");
    const desc = rawDesc.replace(/<[^>]+>/g, "").trim().slice(0, 180) || "";
    return { title, link, date: date ? new Date(date) : null, img: img || null, desc };
  }).filter((a) => a.title && a.link);
}

function timeAgo(date) {
  if (!date || isNaN(date)) return "";
  const d = (Date.now() - date) / 1000;
  if (d < 3600)   return `${Math.floor(d / 60)}min`;
  if (d < 86400)  return `${Math.floor(d / 3600)}h`;
  if (d < 604800) return `${Math.floor(d / 86400)}d`;
  return date.toLocaleDateString("pt-BR");
}

// ── Tradução ───────────────────────────────────────────────────────────────
const translationCache = new Map();
async function translateTitle(text) {
  if (translationCache.has(text)) return translationCache.get(text);
  try {
    const url  = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=` + encodeURIComponent(text);
    const res  = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const out  = data[0]?.map((d) => d[0]).join("") || text;
    translationCache.set(text, out);
    return out;
  } catch { return text; }
}
async function translateArticles(articles) {
  const result = articles.map((a) => ({ ...a }));
  const idxs   = result.map((a, i) => (a.source.flag === "🌎" ? i : -1)).filter((i) => i >= 0).slice(0, 40);
  for (let b = 0; b < idxs.length; b += 5) {
    await Promise.all(idxs.slice(b, b + 5).map(async (idx) => {
      result[idx] = { ...result[idx], title: await translateTitle(result[idx].title) };
    }));
  }
  return result;
}

const cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000;

// ── Hero Feature ───────────────────────────────────────────────────────────
function HeroFeature({ article }) {
  const [imgErr, setImgErr] = useState(false);
  if (!article) return null;
  const lvl = importanceLevel(article.score ?? 0);

  return (
    <Box bg="#0a0a0a" borderBottom={`1px solid rgba(255,255,255,0.07)`}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} minH={{ base: "auto", md: "420px" }}>
        {/* Left — text */}
        <Flex direction="column" justify="center" px={{ base: 5, md: 10 }} py={{ base: 6, md: 10 }}
          borderRight={{ md: "1px solid rgba(255,255,255,0.06)" }}>
          <HStack mb={3} spacing={2} flexWrap="wrap">
            <Badge fontSize="9px" fontFamily="heading" fontWeight="700"
              bg={`${article.source.color}22`} color={article.source.color}
              border={`1px solid ${article.source.color}44`} px={2} py="2px" borderRadius="full">
              {article.source.flag} {article.source.name}
            </Badge>
            {lvl && (
              <Badge fontSize="9px" fontFamily="heading" fontWeight="800"
                bg={`${lvl.color}18`} color={lvl.color}
                border={`1px solid ${lvl.color}44`} px={2} py="2px" borderRadius="full">
                {lvl.icon} {lvl.label}
              </Badge>
            )}
            {article.date && (
              <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">{timeAgo(article.date)} atrás</Text>
            )}
          </HStack>

          <Link href={article.link} isExternal _hover={{ textDecoration: "none" }}>
            <Text fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} fontWeight="900"
              color="white" fontFamily="heading" lineHeight="1.2"
              _hover={{ color: GREEN }} transition="color 0.2s" mb={4}>
              {article.title}
            </Text>
          </Link>

          {article.desc && (
            <Text fontSize="sm" color="whiteAlpha.600" fontFamily="heading" lineHeight="1.7" mb={5} noOfLines={3}>
              {article.desc}
            </Text>
          )}

          <Link href={article.link} isExternal _hover={{ textDecoration: "none" }} display="inline-flex" alignSelf="flex-start">
            <Box
              display="flex" alignItems="center" gap={2}
              px={4} py={2} borderRadius="full"
              bg={GREEN} color="#000"
              fontFamily="heading" fontSize="xs" fontWeight="700"
              _hover={{ bg: "white" }} transition="all 0.2s"
              style={{ boxShadow: `0 0 16px ${GREEN}66` }}
            >
              Saiba mais <Icon as={BsArrowRight} boxSize="12px" />
            </Box>
          </Link>
        </Flex>

        {/* Right — image */}
        <Box position="relative" minH={{ base: "220px", md: "auto" }} overflow="hidden" bg="#111">
          {article.img && !imgErr ? (
            <img src={article.img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <Flex h="100%" minH="220px" align="center" justify="center" bg="#0d0d0d">
              <Text fontSize="6xl">🤖</Text>
            </Flex>
          )}
          {/* Left gradient blend */}
          <Box position="absolute" inset={0} display={{ base: "none", md: "block" }}
            background="linear-gradient(to right, #0a0a0a 0%, transparent 30%)" />
        </Box>
      </Grid>
    </Box>
  );
}

// ── Mini Card (abaixo do hero) ─────────────────────────────────────────────
function MiniCard({ title, link, img, date, source, score }) {
  const [imgErr, setImgErr] = useState(false);
  const lvl = importanceLevel(score ?? 0);

  return (
    <Link href={link} isExternal _hover={{ textDecoration: "none" }} flexShrink={0} w={{ base: "160px", md: "200px" }}>
      <Box
        borderRadius="8px" overflow="hidden" bg="#0f0f0f"
        border="1px solid rgba(255,255,255,0.07)"
        _hover={{ borderColor: `${source.color}66`, transform: "translateY(-2px)" }}
        transition="all 0.2s" h="100%"
      >
        <Box h="110px" overflow="hidden" position="relative" bg="#111">
          {img && !imgErr ? (
            <img src={img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <Flex h="100%" align="center" justify="center">
              <Text fontSize="2xl">📰</Text>
            </Flex>
          )}
          {lvl && (
            <Box position="absolute" top={0} left={0} right={0} h="2px"
              bg={lvl.color} style={{ boxShadow: `0 0 6px ${lvl.color}` }} />
          )}
          <Box position="absolute" top={1} left={1}>
            <Badge fontSize="8px" fontFamily="heading" fontWeight="700"
              bg="rgba(0,0,0,0.82)" color={source.color}
              border={`1px solid ${source.color}33`} px={1} py="1px" borderRadius="full">
              {source.flag}
            </Badge>
          </Box>
        </Box>
        <Box p={2}>
          {date && <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" mb={1}>{timeAgo(date)} atrás</Text>}
          <Text fontSize="xs" fontWeight="700" color="whiteAlpha.900"
            fontFamily="heading" lineHeight="1.35" noOfLines={3}
            _hover={{ color: GREEN }}>
            {title}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}

// ── Category Card (dentro das seções) ─────────────────────────────────────
function CategoryCard({ title, link, img, date, source, score, desc }) {
  const [imgErr, setImgErr] = useState(false);
  const lvl = importanceLevel(score ?? 0);

  return (
    <Link href={link} isExternal _hover={{ textDecoration: "none" }} flexShrink={0} w={{ base: "220px", md: "260px" }}>
      <Box
        borderRadius="8px" overflow="hidden" bg="#0d0d0d"
        border="1px solid rgba(255,255,255,0.07)"
        _hover={{ borderColor: `${source.color}66`, transform: "translateY(-3px)", boxShadow: `0 8px 24px rgba(0,0,0,0.4)` }}
        transition="all 0.25s" h="100%"
      >
        <Box h="140px" overflow="hidden" position="relative" bg="#111" flexShrink={0}>
          {img && !imgErr ? (
            <img src={img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <Flex h="100%" align="center" justify="center">
              <Text fontSize="3xl">🤖</Text>
            </Flex>
          )}
          {lvl && (
            <Box position="absolute" top={0} left={0} right={0} h="2px"
              bg={lvl.color} style={{ boxShadow: `0 0 8px ${lvl.color}` }} />
          )}
          <Box position="absolute" bottom={0} left={0} right={0} h="50px"
            background="linear-gradient(to top, #0d0d0d, transparent)" />
          <Box position="absolute" top={2} left={2}>
            <Badge fontSize="8px" fontFamily="heading" fontWeight="700"
              bg="rgba(0,0,0,0.85)" color={source.color}
              border={`1px solid ${source.color}33`} px={1.5} py="1px" borderRadius="full">
              {source.flag} {source.name}
            </Badge>
          </Box>
        </Box>

        <Box p={3}>
          {date && <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" mb={1}>{timeAgo(date)} atrás</Text>}
          <Text fontSize="sm" fontWeight="700" color="whiteAlpha.900"
            fontFamily="heading" lineHeight="1.4" noOfLines={3} mb={desc ? 1 : 0}
            _hover={{ color: GREEN }}>
            {title}
          </Text>
          {desc && (
            <Text fontSize="10px" color="whiteAlpha.500" fontFamily="heading" lineHeight="1.5" noOfLines={2} mt={1}>
              {desc}
            </Text>
          )}
          {lvl && (
            <HStack mt={2}>
              <Text fontSize="9px" fontFamily="heading" color={lvl.color}>{lvl.icon} {lvl.label}</Text>
            </HStack>
          )}
        </Box>
      </Box>
    </Link>
  );
}

// ── Scroll Row com setas ───────────────────────────────────────────────────
function ScrollRow({ articles, CardComponent }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (!articles.length) return null;

  return (
    <Box position="relative">
      {/* Seta esquerda */}
      <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" zIndex={2}
        display={{ base: "none", md: "block" }}>
        <Box as="button" onClick={() => scroll(-1)}
          w="32px" h="32px" display="flex" alignItems="center" justifyContent="center"
          bg="rgba(0,0,0,0.85)" border={`1px solid ${GREEN_DIM}`} borderRadius="full"
          color={GREEN} _hover={{ bg: GREEN, color: "#000" }} transition="all 0.2s"
          ml={-4}>
          <Icon as={BsChevronLeft} boxSize="12px" />
        </Box>
      </Box>

      {/* Cards */}
      <Box
        ref={ref}
        display="flex" flexDirection="row" gap={3}
        overflowX="auto" pb={2}
        css={{
          "&::-webkit-scrollbar": { height: "3px" },
          "&::-webkit-scrollbar-thumb": { background: GREEN_DIM, borderRadius: "8px" },
          scrollbarWidth: "thin",
          scrollbarColor: `${GREEN_DIM} transparent`,
        }}
      >
        {articles.map((a, i) => (
          <CardComponent key={i} {...a} />
        ))}
      </Box>

      {/* Seta direita */}
      <Box position="absolute" right={0} top="50%" transform="translateY(-50%)" zIndex={2}
        display={{ base: "none", md: "block" }}>
        <Box as="button" onClick={() => scroll(1)}
          w="32px" h="32px" display="flex" alignItems="center" justifyContent="center"
          bg="rgba(0,0,0,0.85)" border={`1px solid ${GREEN_DIM}`} borderRadius="full"
          color={GREEN} _hover={{ bg: GREEN, color: "#000" }} transition="all 0.2s"
          mr={-4}>
          <Icon as={BsChevronRight} boxSize="12px" />
        </Box>
      </Box>
    </Box>
  );
}

// ── Category Section ───────────────────────────────────────────────────────
function CategorySection({ title, desc, accent, articles }) {
  if (!articles.length) return null;

  return (
    <Box py={8} borderTop="1px solid rgba(255,255,255,0.06)">
      <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 8 }} align="flex-start">

        {/* Left — title + desc */}
        <Box flexShrink={0} w={{ base: "100%", lg: "220px" }}>
          <Box w="32px" h="3px" bg={accent} borderRadius="full" mb={3}
            style={{ boxShadow: `0 0 10px ${accent}` }} />
          <Text fontFamily="heading" fontSize="lg" fontWeight="800" color="white"
            lineHeight="1.2" mb={2} letterSpacing="-0.01em">
            {title}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500" fontFamily="heading" lineHeight="1.6">
            {desc}
          </Text>
          <HStack mt={3} spacing={1} color={accent} fontSize="xs" fontFamily="heading" fontWeight="600">
            <Text>{articles.length} artigos</Text>
          </HStack>
        </Box>

        {/* Right — scroll row */}
        <Box flex={1} minW={0} overflow="hidden" px={{ base: 0, md: 4 }}>
          <ScrollRow articles={articles} CardComponent={CategoryCard} />
        </Box>
      </Flex>
    </Box>
  );
}

// ── Filter / Sort buttons ──────────────────────────────────────────────────
function FilterBtn({ id, label, active, onClick }) {
  return (
    <Box as="button" onClick={() => onClick(id)}
      px={3} py={1} borderRadius="4px" fontSize="xs" fontFamily="heading"
      fontWeight={active ? "700" : "500"}
      color={active ? GREEN : "whiteAlpha.600"}
      bg={active ? `${GREEN}15` : "transparent"}
      transition="all 0.15s"
      _hover={{ color: GREEN, bg: `${GREEN}10` }}
      whiteSpace="nowrap">
      {label}
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("all");
  const [sortBy, setSortBy]     = useState("importance");
  const fetchedRef = useRef(false);

  const fetchFeeds = useCallback(async () => {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) { setArticles(cache.data); return; }
    setLoading(true);
    const results = await Promise.allSettled(
      FEEDS.map((feed) =>
        fetch(`${PROXY}${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(10000) })
          .then((r) => r.text())
          .then((xml) => parseRSS(xml).map((a) => ({ ...a, source: feed })))
      )
    );
    const raw = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
    const translated = await translateArticles(raw);
    const scored = translated.map((a) => ({ ...a, score: scoreArticle(a) }));
    cache.data = scored; cache.ts = Date.now();
    setArticles(scored); setLoading(false);
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) { fetchedRef.current = true; fetchFeeds(); }
  }, [fetchFeeds]);

  const filtered = articles.filter((a) => {
    if (filter === "br")    return a.source.flag === "🇧🇷";
    if (filter === "world") return a.source.flag === "🌎";
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "importance"
      ? (b.score ?? 0) - (a.score ?? 0)
      : (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
  );

  // Hero: maior score com imagem
  const heroArticle = sorted.find((a) => a.img) || sorted[0];
  const heroLink    = heroArticle?.link;

  // Mini-cards abaixo do hero
  const miniCards = sorted.filter((a) => a.link !== heroLink).slice(0, 10);
  const usedLinks = new Set([heroLink, ...miniCards.map((a) => a.link)]);

  // Seções por categoria
  const catArticles = sorted.filter((a) => !usedLinks.has(a.link));

  return (
    <Box minH="100vh" w="100vw" bg="#050505" color="white" overflowX="hidden">

      {/* ── Header ── */}
      <Box
        bg="rgba(5,5,5,0.98)" position="sticky" top={0} zIndex={200}
        backdropFilter="blur(14px)"
        style={{ boxShadow: `0 4px 30px rgba(66,201,32,0.18)` }}
      >
        {/* Linha 1: branding + sort */}
        <Flex align="center" justify="space-between" gap={2}
          px={{ base: 3, md: 8 }} py={3}
          borderBottom="1px solid rgba(255,255,255,0.07)">
          <HStack spacing={3}>
            <Text fontSize="2xl" lineHeight={1}>🛸</Text>
            <Box>
              <HStack spacing={0} align="baseline">
                <Text fontFamily="heading" fontSize={{ base: "md", md: "xl" }} fontWeight="900"
                  color={GREEN} lineHeight={1} letterSpacing="0.1em"
                  style={{ textShadow: `0 0 18px ${GREEN}99` }}>
                  IA NEWS
                </Text>
                <Text fontFamily="heading" fontSize={{ base: "md", md: "xl" }} fontWeight="900"
                  color="whiteAlpha.700" lineHeight={1} letterSpacing="0.1em" ml={2}>
                  BRUNO KOBI
                </Text>
              </HStack>
              <Text fontSize="8px" color="whiteAlpha.350" fontFamily="heading" letterSpacing="0.22em">
                INTELIGÊNCIA ARTIFICIAL
              </Text>
            </Box>
          </HStack>

          <Tooltip label={sortBy === "importance" ? "Ordenado por importância" : "Ordenado por data"} hasArrow>
            <Box as="button"
              onClick={() => setSortBy((s) => s === "importance" ? "date" : "importance")}
              px={3} py={1} borderRadius="full" fontSize="xs" fontFamily="heading"
              display="flex" alignItems="center" gap={1}
              color={sortBy === "importance" ? "#ffaa00" : "whiteAlpha.500"}
              bg={sortBy === "importance" ? "rgba(255,170,0,0.1)" : "transparent"}
              border={`1px solid ${sortBy === "importance" ? "#ffaa0055" : "rgba(255,255,255,0.12)"}`}
              transition="all 0.2s" _hover={{ borderColor: "#ffaa00", color: "#ffaa00" }}>
              <Icon as={sortBy === "importance" ? BsSortDown : BsClock} boxSize="11px" />
              <Text as="span" ml={1}>{sortBy === "importance" ? "Importância" : "Data"}</Text>
            </Box>
          </Tooltip>
        </Flex>

        {/* Linha 2: nav + filtros */}
        <Box borderBottom={`2px solid ${GREEN}`} px={{ base: 2, md: 8 }}
          overflowX="auto"
          css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          <HStack spacing={0} py="10px" minW="max-content">
            {[
              { label: "← Voltar", to: "/", accent: true },
              { label: "Home",      to: "/" },
              { label: "Sobre",     to: "/about" },
              { label: "Projetos",  to: "/projects" },
              { label: "Chat IA",   to: "/chat" },
              { label: "Mapa",      to: "/map" },
              { label: "Currículo", to: "/curriculo" },
            ].map((item, i) => (
              <HStack key={i} spacing={0}>
                {i > 0 && <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={1} flexShrink={0} />}
                <Link as={RouterLink} to={item.to}
                  px={3} py={1} fontFamily="heading" fontSize="xs"
                  fontWeight={item.accent ? "700" : "500"}
                  color={item.accent ? GREEN : "whiteAlpha.600"}
                  borderRadius="4px" whiteSpace="nowrap"
                  _hover={{ color: "white", bg: "rgba(255,255,255,0.05)", textDecoration: "none" }}
                  transition="all 0.15s"
                  style={item.accent ? { textShadow: `0 0 8px ${GREEN}88` } : {}}>
                  {item.label}
                </Link>
              </HStack>
            ))}

            <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={3} flexShrink={0} />

            <FilterBtn id="all"   label="Todos"     active={filter === "all"}   onClick={setFilter} />
            <FilterBtn id="world" label="🌎 Mundo"  active={filter === "world"} onClick={setFilter} />
            <FilterBtn id="br"    label="🇧🇷 Brasil" active={filter === "br"}    onClick={setFilter} />

            <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={3} flexShrink={0} />
            {[
              { label: "URGENTE",   color: "#ff4444", icon: "🔥" },
              { label: "DESTAQUE",  color: "#ffaa00", icon: "⚡" },
              { label: "RELEVANTE", color: GREEN,     icon: "📌" },
            ].map((l) => (
              <HStack key={l.label} spacing={1} px={2} flexShrink={0}>
                <Text fontSize="9px">{l.icon}</Text>
                <Text fontSize="9px" fontFamily="heading" color={l.color} letterSpacing="0.06em"
                  display={{ base: "none", md: "block" }}>{l.label}</Text>
              </HStack>
            ))}
          </HStack>
        </Box>
      </Box>

      {loading ? (
        <Flex h="70vh" align="center" justify="center">
          <VStack spacing={4}>
            <Spinner size="xl" color={GREEN} thickness="3px" />
            <Text fontSize="sm" color="whiteAlpha.500" fontFamily="heading">
              Buscando e classificando notícias...
            </Text>
          </VStack>
        </Flex>
      ) : (
        <Box pb="60px">
          {/* ── Hero feature ── */}
          {heroArticle && <HeroFeature article={heroArticle} />}

          {/* ── Mini cards ── */}
          {miniCards.length > 0 && (
            <Box px={{ base: 4, md: 8 }} py={6} bg="#080808" borderBottom="1px solid rgba(255,255,255,0.06)">
              <Text fontFamily="heading" fontSize="xs" fontWeight="700" color="whiteAlpha.400"
                letterSpacing="0.15em" mb={4}>
                MAIS NOTÍCIAS
              </Text>
              <ScrollRow articles={miniCards} CardComponent={MiniCard} />
            </Box>
          )}

          {/* ── Category sections ── */}
          <Box px={{ base: 4, md: 8 }}>
            {CATEGORIES.map((cat) => {
              const arts = catArticles.filter((a) => cat.sources.includes(a.source.name));
              return (
                <CategorySection
                  key={cat.id}
                  title={cat.title}
                  desc={cat.desc}
                  accent={cat.accent}
                  articles={arts}
                />
              );
            })}

            {/* Artigos não categorizados */}
            {(() => {
              const catSources = CATEGORIES.flatMap((c) => c.sources);
              const remaining = catArticles.filter((a) => !catSources.includes(a.source.name));
              if (!remaining.length) return null;
              return (
                <CategorySection
                  title="🌐 Outros"
                  desc="Notícias de outras fontes de IA ao redor do mundo."
                  accent="rgba(255,255,255,0.4)"
                  articles={remaining}
                />
              );
            })()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NewsPage;
