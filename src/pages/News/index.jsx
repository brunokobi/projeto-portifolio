import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Flex, Grid, Text, Badge, Link, Spinner,
  VStack, HStack, Icon, Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { BsBoxArrowUpRight, BsChevronLeft, BsChevronRight, BsSortDown, BsClock, BsArrowLeft } from "react-icons/bs";

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";
const PROXY = "/.netlify/functions/news?url=";

// ── Importância ────────────────────────────────────────────────────────────

const SOURCE_PRESTIGE = {
  "MIT Tech Rev": 20, "MIT News": 20, "Google Res.": 18,
  "IEEE Spectrum": 16, "BAIR": 15, "The Gradient": 14,
  "Wired AI": 13, "The Verge": 13, "TechCrunch": 12,
  "HuggingFace": 11, "AI News": 10, "AI Insider": 10,
  "AI Weekly": 9, "Exame IA": 9, "KDnuggets": 8,
  "SWEN.AI": 8, "AINEWS": 8, "Synced": 7,
};

const KW_CRITICAL = [
  "agi", "artificial general intelligence", "superintelligence",
  "breakthrough", "ban", "regulation", "acquisition", "merger",
  "openai", "anthropic", "google deepmind", "deepmind",
];
const KW_HIGH = [
  "gpt", "claude", "gemini", "llama", "mistral", "nvidia", "sora",
  "release", "launch", "lança", "novo modelo", "new model",
  "meta ai", "microsoft", "apple intelligence",
];
const KW_MED = [
  "model", "machine learning", "neural", "research", "billion",
  "open source", "safety", "hallucination", "robot", "robô",
  "chatbot", "agent", "agente", "multimodal",
];

function scoreArticle(article) {
  let score = SOURCE_PRESTIGE[article.source?.name] || 5;

  if (article.date && !isNaN(article.date)) {
    const h = (Date.now() - article.date) / 3_600_000;
    if (h < 2)  score += 40;
    else if (h < 6)  score += 33;
    else if (h < 12) score += 25;
    else if (h < 24) score += 16;
    else if (h < 48) score += 8;
    else if (h < 96) score += 3;
  }

  const t = (article.title || "").toLowerCase();
  KW_CRITICAL.forEach((k) => { if (t.includes(k)) score += 18; });
  KW_HIGH.forEach((k)     => { if (t.includes(k)) score += 10; });
  KW_MED.forEach((k)      => { if (t.includes(k)) score += 4;  });

  if (article.img) score += 6;
  return score;
}

function importanceLevel(score) {
  if (score >= 65) return { label: "URGENTE", color: "#ff4444", icon: "🔥", glow: "#ff444488" };
  if (score >= 45) return { label: "DESTAQUE", color: "#ffaa00", icon: "⚡", glow: "#ffaa0066" };
  if (score >= 28) return { label: "RELEVANTE", color: GREEN, icon: "📌", glow: `${GREEN}66` };
  return { label: "NORMAL", color: "rgba(255,255,255,0.35)", icon: "📰", glow: "transparent" };
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
  for (const tag of ["thumbnail", "content", "image"]) {
    for (const name of [`media:${tag}`, tag]) {
      const els = item.getElementsByTagName(name);
      for (let i = 0; i < els.length; i++) {
        const url = els[i].getAttribute("url");
        if (url && /^https?:\/\//i.test(url)) return url;
      }
    }
  }
  const enclosures = item.getElementsByTagName("enclosure");
  for (let i = 0; i < enclosures.length; i++) {
    const type = enclosures[i].getAttribute("type") || "";
    const url  = enclosures[i].getAttribute("url")  || "";
    if (url && (type.startsWith("image") || /\.(jpe?g|png|gif|webp)$/i.test(url))) return url;
  }
  for (const sel of ["description", "content", "summary", "content:encoded"]) {
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

  return items.slice(0, 6).map((item) => {
    const getText = (tag) => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
    const title = getText("title");
    let link = getText("link");
    if (!link) {
      const el = item.querySelector("link[rel='alternate']") || item.querySelector("link");
      link = el?.getAttribute("href") || el?.textContent?.trim() || "";
    }
    const date = getText("pubDate") || getText("published") || getText("updated") || getText("dc:date");
    const img  = extractImage(item);
    return { title, link, date: date ? new Date(date) : null, img: img || null };
  }).filter((a) => a.title && a.link);
}

function timeAgo(date) {
  if (!date || isNaN(date)) return "";
  const diff = (Date.now() - date) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

// ── Tradução ───────────────────────────────────────────────────────────────

const translationCache = new Map();
async function translateTitle(text) {
  if (translationCache.has(text)) return translationCache.get(text);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=` + encodeURIComponent(text);
    const res  = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const out  = data[0]?.map((d) => d[0]).join("") || text;
    translationCache.set(text, out);
    return out;
  } catch { return text; }
}

async function translateArticles(articles) {
  const result  = articles.map((a) => ({ ...a }));
  const idxs    = result.map((a, i) => (a.source.flag === "🌎" ? i : -1)).filter((i) => i >= 0).slice(0, 40);
  for (let b = 0; b < idxs.length; b += 5) {
    await Promise.all(idxs.slice(b, b + 5).map(async (idx) => {
      result[idx] = { ...result[idx], title: await translateTitle(result[idx].title) };
    }));
  }
  return result;
}

const cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000;

// ── Importance Badge ───────────────────────────────────────────────────────

function ImportanceBadge({ score }) {
  const lvl = importanceLevel(score);
  if (lvl.label === "NORMAL") return null;
  return (
    <Tooltip label={`Score: ${score}`} placement="top" hasArrow>
      <Badge
        fontSize="9px" fontFamily="heading" fontWeight="800"
        bg={`${lvl.color}18`} color={lvl.color}
        border={`1px solid ${lvl.color}44`}
        px={1.5} py="1px" borderRadius="full" letterSpacing="0.06em"
        style={{ boxShadow: `0 0 6px ${lvl.glow}` }}
        cursor="default"
      >
        {lvl.icon} {lvl.label}
      </Badge>
    </Tooltip>
  );
}

// ── Hero Carousel (somente artigos COM imagem) ─────────────────────────────

function HeroCarousel({ articles }) {
  const [idx, setIdx]       = useState(0);
  const [imgErr, setImgErr] = useState({});
  const [paused, setPaused] = useState(false);

  // Filtra de novo os que ainda têm img válida (após possível erro de load)
  const valid = articles.filter((_, i) => !imgErr[i]);
  const total = valid.length;

  useEffect(() => {
    setIdx(0);
  }, [articles.length]);

  useEffect(() => {
    if (paused || total === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 6500);
    return () => clearInterval(t);
  }, [paused, total]);

  if (!total) return null;

  const a   = valid[idx % total];
  const lvl = importanceLevel(a.score ?? 0);

  return (
    <Box
      position="relative" w="100%"
      h={{ base: "340px", md: "500px" }}
      overflow="hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {articles.map((article, i) => (
        <Box
          key={i}
          position="absolute" inset={0}
          opacity={valid[idx % total]?.link === article.link ? 1 : 0}
          transition="opacity 0.9s ease"
        >
          <img
            src={article.img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => setImgErr((e) => ({ ...e, [i]: true }))}
          />
        </Box>
      ))}

      {/* Gradiente */}
      <Box position="absolute" inset={0}
        background="linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.1) 100%)"
      />

      {/* Scanlines */}
      <Box position="absolute" inset={0} pointerEvents="none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(66,201,32,0.02) 2px,rgba(66,201,32,0.02) 4px)" }}
      />

      {/* Barra lateral colorida por importância */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px"
        bg={lvl.label !== "NORMAL" ? lvl.color : GREEN}
        style={{ boxShadow: `0 0 18px ${lvl.label !== "NORMAL" ? lvl.color : GREEN}` }}
      />

      {/* Conteúdo */}
      <Box position="absolute" bottom={0} left={0} right={0} px={{ base: 5, md: 10 }} pb={{ base: 5, md: 8 }}>
        <HStack mb={2} spacing={2} flexWrap="wrap">
          <Badge
            fontSize="10px" fontFamily="heading" fontWeight="700"
            bg={`${a.source?.color || GREEN}22`} color={a.source?.color || GREEN}
            border={`1px solid ${a.source?.color || GREEN}55`}
            px={2} py="2px" borderRadius="full"
          >
            {a.source?.flag} {a.source?.name}
          </Badge>
          <ImportanceBadge score={a.score ?? 0} />
          {a.date && <Text fontSize="11px" color="whiteAlpha.500" fontFamily="heading">{timeAgo(a.date)}</Text>}
        </HStack>

        <Link href={a.link} isExternal _hover={{ textDecoration: "none" }}>
          <Text
            fontSize={{ base: "xl", md: "3xl" }} fontWeight="800"
            color="white" fontFamily="heading" lineHeight="1.25" noOfLines={3}
            _hover={{ color: GREEN }} transition="color 0.2s"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.95)" }}
          >
            {a.title}
          </Text>
        </Link>

        {/* Dots */}
        <HStack mt={4} spacing="6px">
          {valid.map((_, i) => (
            <Box key={i} as="button" onClick={() => setIdx(i)}
              h="4px" w={i === idx % total ? "28px" : "6px"} borderRadius="full"
              bg={i === idx % total ? (a.source?.color || GREEN) : "rgba(255,255,255,0.22)"}
              transition="all 0.35s"
              style={i === idx % total ? { boxShadow: `0 0 8px ${a.source?.color || GREEN}` } : {}}
            />
          ))}
        </HStack>
      </Box>

      {/* Setas */}
      {[{ side: { left: "14px" }, fn: () => setIdx((i) => (i - 1 + total) % total), Ic: BsChevronLeft },
        { side: { right: "14px" }, fn: () => setIdx((i) => (i + 1) % total), Ic: BsChevronRight },
      ].map(({ side, fn, Ic }, i) => (
        <Box key={i} position="absolute" top="50%" transform="translateY(-50%)" {...side}>
          <Box as="button" onClick={fn}
            w="38px" h="38px" display="flex" alignItems="center" justifyContent="center"
            bg="rgba(0,0,0,0.7)" border={`1px solid ${GREEN_DIM}`} borderRadius="full"
            color={GREEN} _hover={{ bg: GREEN, color: "#000" }} transition="all 0.2s"
          >
            <Icon as={Ic} boxSize="14px" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Destaque Card ──────────────────────────────────────────────────────────

function DestaqueCard({ title, link, img, date, source, score }) {
  const [imgErr, setImgErr] = useState(false);
  const lvl = importanceLevel(score ?? 0);

  return (
    <Link href={link} isExternal _hover={{ textDecoration: "none" }} h="100%" display="block">
      <Box
        borderRadius="8px" overflow="hidden"
        border={`1px solid ${GREEN_DIM}`} bg="#0a0a0a"
        _hover={{ borderColor: `${source.color}88`, transform: "translateY(-3px)", boxShadow: `0 8px 32px rgba(66,201,32,0.12)` }}
        transition="all 0.25s" h="100%" display="flex" flexDirection="column"
      >
        <Box h="160px" overflow="hidden" position="relative" flexShrink={0} bg="#111">
          {img && !imgErr ? (
            <img src={img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <Flex h="100%" align="center" justify="center">
              <Text fontSize="4xl">🤖</Text>
            </Flex>
          )}
          <Box position="absolute" bottom={0} left={0} right={0} h="40px"
            background="linear-gradient(to top, #0a0a0a, transparent)" />
          <Box position="absolute" top={2} left={2}>
            <Badge fontSize="9px" fontFamily="heading" fontWeight="700"
              bg="rgba(0,0,0,0.82)" color={source.color}
              border={`1px solid ${source.color}44`} px={1.5} py="1px" borderRadius="full"
            >
              {source.flag} {source.name}
            </Badge>
          </Box>
          {/* Barra de importância no topo */}
          {lvl.label !== "NORMAL" && (
            <Box position="absolute" top={0} left={0} right={0} h="2px"
              bg={lvl.color} style={{ boxShadow: `0 0 8px ${lvl.color}` }} />
          )}
        </Box>

        <Box p={3} flex={1}>
          <HStack mb={1.5} spacing={2} flexWrap="wrap">
            <ImportanceBadge score={score ?? 0} />
            {date && <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">{timeAgo(date)}</Text>}
          </HStack>
          <Text fontSize="sm" fontWeight="700" color="whiteAlpha.900"
            fontFamily="heading" lineHeight="1.45" noOfLines={3}>
            {title}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}

// ── Article Row ────────────────────────────────────────────────────────────

function ArticleRow({ title, link, img, date, source, score }) {
  const [imgErr, setImgErr] = useState(false);
  const lvl = importanceLevel(score ?? 0);

  return (
    <Box borderBottom="1px solid rgba(255,255,255,0.05)"
      borderLeft={lvl.label !== "NORMAL" ? `2px solid ${lvl.color}` : "2px solid transparent"}
      style={lvl.label !== "NORMAL" ? { boxShadow: `inset 3px 0 8px ${lvl.glow}` } : {}}
    >
      <Link href={link} isExternal _hover={{ textDecoration: "none" }}>
        <HStack spacing={3} py={3} px={2} borderRadius="0 6px 6px 0"
          _hover={{ bg: "rgba(66,201,32,0.04)" }} transition="background 0.2s" align="flex-start"
        >
          <Box flexShrink={0} w="80px" h="56px" borderRadius="6px" overflow="hidden" bg="#111">
            {img && !imgErr ? (
              <img src={img} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={() => setImgErr(true)}
              />
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text fontSize="lg">📰</Text>
              </Flex>
            )}
          </Box>

          <Box flex={1} minW={0}>
            <HStack mb={1} spacing={2} flexWrap="wrap">
              <Badge fontSize="9px" fontFamily="heading" fontWeight="700"
                bg={`${source.color}22`} color={source.color}
                border={`1px solid ${source.color}44`} px={1.5} py="1px" borderRadius="full"
              >
                {source.flag} {source.name}
              </Badge>
              <ImportanceBadge score={score ?? 0} />
              {date && <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">{timeAgo(date)}</Text>}
            </HStack>
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800"
              fontFamily="heading" lineHeight="1.4" noOfLines={2}
              _hover={{ color: "white" }} transition="color 0.15s"
            >
              {title}
            </Text>
          </Box>

          <Icon as={BsBoxArrowUpRight} boxSize="10px" color="whiteAlpha.300" mt={1} flexShrink={0} />
        </HStack>
      </Link>
    </Box>
  );
}

// ── Helpers UI ─────────────────────────────────────────────────────────────

function FilterBtn({ id, label, active, onClick }) {
  return (
    <Box as="button" onClick={() => onClick(id)}
      px={3} py={1} borderRadius="full" fontSize="xs" fontFamily="heading"
      fontWeight={active ? "700" : "400"}
      color={active ? "#000" : "whiteAlpha.600"}
      bg={active ? GREEN : "transparent"}
      border={`1px solid ${active ? GREEN : "rgba(255,255,255,0.15)"}`}
      transition="all 0.2s"
      _hover={{ borderColor: GREEN, color: active ? "#000" : GREEN }}
      style={active ? { boxShadow: `0 0 10px ${GREEN}66` } : {}}
    >
      {label}
    </Box>
  );
}

function SectionTitle({ children, dim }) {
  return (
    <HStack mb={4} spacing={3} align="center">
      <Box w="3px" h="20px" borderRadius="full"
        bg={dim ? "rgba(255,255,255,0.2)" : GREEN}
        style={dim ? {} : { boxShadow: `0 0 8px ${GREEN}` }}
      />
      <Text fontFamily="heading" fontSize="xs" fontWeight="800" letterSpacing="0.15em"
        color={dim ? "whiteAlpha.400" : GREEN}>
        {children}
      </Text>
    </HStack>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("all");
  const [sortBy, setSortBy]     = useState("importance"); // "importance" | "date"
  const fetchedRef = useRef(false);

  const fetchFeeds = useCallback(async () => {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      setArticles(cache.data);
      return;
    }
    setLoading(true);

    const results = await Promise.allSettled(
      FEEDS.map((feed) =>
        fetch(`${PROXY}${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(10000) })
          .then((r) => r.text())
          .then((xml) => parseRSS(xml).map((a) => ({ ...a, source: feed })))
      )
    );

    const raw = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

    const translated = await translateArticles(raw);
    // Calcula score após tradução (título já em pt-BR)
    const scored = translated.map((a) => ({ ...a, score: scoreArticle(a) }));

    cache.data = scored;
    cache.ts   = Date.now();
    setArticles(scored);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) { fetchedRef.current = true; fetchFeeds(); }
  }, [fetchFeeds]);

  // Filtro região
  const filtered = articles.filter((a) => {
    if (filter === "br")    return a.source.flag === "🇧🇷";
    if (filter === "world") return a.source.flag === "🌎";
    return true;
  });

  // Ordenação
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "importance"
      ? (b.score ?? 0) - (a.score ?? 0)
      : (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
  );

  // Carousel: APENAS artigos com imagem
  const carouselArticles = sorted.filter((a) => a.img).slice(0, 8);
  const carouselLinks    = new Set(carouselArticles.map((a) => a.link));

  // Destaques: top 6 do restante (por score)
  const afterCarousel = sorted.filter((a) => !carouselLinks.has(a.link));
  const destaques     = afterCarousel.slice(0, 6);
  const destaqueLinks = new Set(destaques.map((a) => a.link));

  const latest = sorted.filter((a) => !carouselLinks.has(a.link) && !destaqueLinks.has(a.link));

  return (
    <Box minH="100vh" w="100vw" bg="#050505" color="white" pb="80px" overflowX="hidden">

      {/* ── Header próprio do news site ── */}
      <Box
        bg="rgba(5,5,5,0.98)"
        position="sticky" top={0} zIndex={200}
        backdropFilter="blur(14px)"
        style={{ boxShadow: `0 4px 30px rgba(66,201,32,0.18)` }}
      >
        {/* Linha 1: branding + sort */}
        <Flex
          align="center" justify="space-between" gap={2}
          px={{ base: 3, md: 8 }} py={3}
          borderBottom={`1px solid rgba(255,255,255,0.07)`}
        >
          {/* Branding */}
          <HStack spacing={3}>
            <Text fontSize="2xl" lineHeight={1}>🛸</Text>
            <Box>
              <HStack spacing={0} align="baseline">
                <Text fontFamily="heading" fontSize={{ base: "md", md: "xl" }} fontWeight="900"
                  color={GREEN} lineHeight={1} letterSpacing="0.1em"
                  style={{ textShadow: `0 0 18px ${GREEN}99` }}
                >
                  IA NEWS
                </Text>
                <Text fontFamily="heading" fontSize={{ base: "md", md: "xl" }} fontWeight="900"
                  color="whiteAlpha.700" lineHeight={1} letterSpacing="0.1em" ml={2}
                >
                  BRUNO KOBI
                </Text>
              </HStack>
              <Text fontSize="8px" color="whiteAlpha.350" fontFamily="heading" letterSpacing="0.22em">
                INTELIGÊNCIA ARTIFICIAL
              </Text>
            </Box>
          </HStack>

          {/* Sort toggle */}
          <Tooltip label={sortBy === "importance" ? "Ordenado por importância" : "Ordenado por data"} hasArrow>
            <Box
              as="button"
              onClick={() => setSortBy((s) => s === "importance" ? "date" : "importance")}
              px={3} py={1} borderRadius="full" fontSize="xs" fontFamily="heading"
              display="flex" alignItems="center" gap={1}
              color={sortBy === "importance" ? "#ffaa00" : "whiteAlpha.500"}
              bg={sortBy === "importance" ? "rgba(255,170,0,0.1)" : "transparent"}
              border={`1px solid ${sortBy === "importance" ? "#ffaa0055" : "rgba(255,255,255,0.12)"}`}
              transition="all 0.2s"
              _hover={{ borderColor: "#ffaa00", color: "#ffaa00" }}
            >
              <Icon as={sortBy === "importance" ? BsSortDown : BsClock} boxSize="11px" />
              <Text as="span" ml={1}>{sortBy === "importance" ? "Importância" : "Data"}</Text>
            </Box>
          </Tooltip>
        </Flex>

        {/* Linha 2: nav do portfólio no estilo news */}
        <Box
          borderBottom={`2px solid ${GREEN}`}
          px={{ base: 2, md: 8 }}
          overflowX="auto"
          css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
        >
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
                {i > 0 && (
                  <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={1} flexShrink={0} />
                )}
                <Link
                  as={RouterLink} to={item.to}
                  px={3} py={1}
                  fontFamily="heading" fontSize="xs" fontWeight={item.accent ? "700" : "500"}
                  color={item.accent ? GREEN : "whiteAlpha.600"}
                  letterSpacing="0.06em"
                  borderRadius="4px"
                  whiteSpace="nowrap"
                  _hover={{
                    color: item.accent ? GREEN : "white",
                    bg: item.accent ? `${GREEN}15` : "rgba(255,255,255,0.05)",
                    textDecoration: "none",
                  }}
                  transition="all 0.15s"
                  style={item.accent ? { textShadow: `0 0 8px ${GREEN}88` } : {}}
                >
                  {item.label}
                </Link>
              </HStack>
            ))}

            {/* Separador antes dos filtros */}
            <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={3} flexShrink={0} />

            {/* Filtros de região inline no mesmo menu */}
            {[
              { id: "all",   label: "Todos" },
              { id: "world", label: "🌎 Mundo" },
              { id: "br",    label: "🇧🇷 Brasil" },
            ].map((f) => (
              <Box
                key={f.id}
                as="button" onClick={() => setFilter(f.id)}
                px={3} py={1} borderRadius="4px"
                fontFamily="heading" fontSize="xs" fontWeight={filter === f.id ? "700" : "500"}
                color={filter === f.id ? GREEN : "whiteAlpha.500"}
                bg={filter === f.id ? `${GREEN}15` : "transparent"}
                transition="all 0.15s"
                _hover={{ color: GREEN, bg: `${GREEN}10` }}
                whiteSpace="nowrap"
              >
                {f.label}
              </Box>
            ))}

            {/* Legenda importância */}
            <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={3} flexShrink={0} />
            {[
              { label: "URGENTE",   color: "#ff4444", icon: "🔥" },
              { label: "DESTAQUE",  color: "#ffaa00", icon: "⚡" },
              { label: "RELEVANTE", color: GREEN,     icon: "📌" },
            ].map((l) => (
              <HStack key={l.label} spacing={1} px={2} flexShrink={0}>
                <Text fontSize="9px">{l.icon}</Text>
                <Text fontSize="9px" fontFamily="heading" color={l.color} letterSpacing="0.06em" display={{ base: "none", md: "block" }}>
                  {l.label}
                </Text>
              </HStack>
            ))}
          </HStack>
        </Box>
      </Box>

      {loading ? (
        <Flex h="60vh" align="center" justify="center">
          <VStack spacing={4}>
            <Spinner size="xl" color={GREEN} thickness="3px" />
            <Text fontSize="sm" color="whiteAlpha.500" fontFamily="heading">
              Buscando e classificando notícias...
            </Text>
          </VStack>
        </Flex>
      ) : (
        <Box>
          {/* ── Carousel (só com imagem) ── */}
          {carouselArticles.length > 0 && <HeroCarousel articles={carouselArticles} />}

          <Box px={{ base: 4, md: 8 }}>
            {/* ── Destaques ── */}
            {destaques.length > 0 && (
              <Box mt={8}>
                <SectionTitle>
                  {sortBy === "importance" ? "🔥 MAIS IMPORTANTES" : "📅 MAIS RECENTES"}
                </SectionTitle>
                <Grid
                  templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                  gap={4}
                >
                  {destaques.map((a, i) => <DestaqueCard key={`dest-${i}`} {...a} />)}
                </Grid>
              </Box>
            )}

            {/* ── Banner ── */}
            {latest.length > 0 && (
              <Box mt={8} px={4} py={3} bg={GREEN_DIM} border={`1px solid ${GREEN_DIM}`} borderRadius="8px">
                <Text fontSize="xs" fontFamily="heading" color={GREEN} letterSpacing="0.1em" fontWeight="700">
                  🤖 TODAS AS NOTÍCIAS — ATUALIZADO A CADA 5 MINUTOS
                </Text>
              </Box>
            )}

            {/* ── Lista completa ── */}
            {latest.length > 0 && (
              <Box mt={6}>
                <SectionTitle dim>TODAS AS NOTÍCIAS</SectionTitle>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={0} columnGap={8}>
                  {latest.map((a, i) => <ArticleRow key={`latest-${i}`} {...a} />)}
                </Grid>
              </Box>
            )}

            {!loading && filtered.length === 0 && (
              <Flex h="40vh" align="center" justify="center">
                <Text fontSize="sm" color="whiteAlpha.400" fontFamily="heading">
                  Nenhuma notícia encontrada.
                </Text>
              </Flex>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NewsPage;
