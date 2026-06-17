import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Flex, Grid, Text, Badge, Link, Spinner,
  VStack, HStack, Icon,
} from "@chakra-ui/react";
import { BsBoxArrowUpRight, BsChevronLeft, BsChevronRight } from "react-icons/bs";

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";
const PROXY = "/.netlify/functions/news?url=";

// Gradientes fallback por índice — usados quando o artigo não tem imagem
const FALLBACK_GRADIENTS = [
  `radial-gradient(ellipse at 20% 50%, rgba(66,201,32,0.18) 0%, transparent 60%), linear-gradient(135deg, #020c02 0%, #041204 100%)`,
  `radial-gradient(ellipse at 80% 30%, rgba(0,200,255,0.15) 0%, transparent 60%), linear-gradient(135deg, #020810 0%, #041020 100%)`,
  `radial-gradient(ellipse at 50% 80%, rgba(255,157,0,0.12) 0%, transparent 60%), linear-gradient(135deg, #0c0800 0%, #180f00 100%)`,
  `radial-gradient(ellipse at 30% 20%, rgba(179,27,27,0.15) 0%, transparent 60%), linear-gradient(135deg, #0c0202 0%, #180404 100%)`,
  `radial-gradient(ellipse at 70% 60%, rgba(66,133,244,0.15) 0%, transparent 60%), linear-gradient(135deg, #020510 0%, #040a1c 100%)`,
  `radial-gradient(ellipse at 40% 40%, rgba(66,201,32,0.12) 0%, transparent 50%), linear-gradient(135deg, #040404 0%, #0a0a0a 100%)`,
];

// Ícones fallback por fonte (quando sem imagem)
const SOURCE_ICONS = { "🇧🇷": "🤖", "🌎": "🧠" };

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

// Extrai imagem de um item RSS — tenta todos os padrões conhecidos
function extractImage(item) {
  // 1. getElementsByTagName lida com namespaces melhor que querySelector
  const tagNames = ["thumbnail", "content", "image"];
  for (const tag of tagNames) {
    // com e sem namespace
    for (const name of [`media:${tag}`, tag]) {
      const els = item.getElementsByTagName(name);
      for (let i = 0; i < els.length; i++) {
        const url = els[i].getAttribute("url");
        if (url && /^https?:\/\//i.test(url)) return url;
      }
    }
  }

  // 2. Enclosure com tipo imagem
  const enclosures = item.getElementsByTagName("enclosure");
  for (let i = 0; i < enclosures.length; i++) {
    const type = enclosures[i].getAttribute("type") || "";
    const url  = enclosures[i].getAttribute("url")  || "";
    if (url && (type.startsWith("image") || /\.(jpe?g|png|gif|webp)$/i.test(url))) return url;
  }

  // 3. Busca <img src="..."> dentro de description / content:encoded
  const textSels = ["description", "content", "summary", "content:encoded"];
  for (const sel of textSels) {
    const el = item.getElementsByTagName(sel)[0];
    if (!el) continue;
    const raw = el.textContent || el.innerHTML || "";
    const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m && /^https?:\/\//i.test(m[1])) return m[1];
    // URL direta no texto
    const mu = raw.match(/https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|gif|webp)/i);
    if (mu) return mu[0];
  }

  return null;
}

function parseRSS(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  let items = Array.from(doc.querySelectorAll("item"));
  if (!items.length) items = Array.from(doc.querySelectorAll("entry"));

  return items.slice(0, 6).map((item) => {
    const getText = (tag) => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";

    const title = getText("title");

    // Link: texto, ou atributo href em Atom
    let link = getText("link");
    if (!link) {
      const linkEl = item.querySelector("link[rel='alternate']") || item.querySelector("link");
      link = linkEl?.getAttribute("href") || linkEl?.textContent?.trim() || "";
    }

    const date =
      getText("pubDate") || getText("published") || getText("updated") || getText("dc:date");

    const img = extractImage(item);

    return { title, link, date: date ? new Date(date) : null, img: img || null };
  }).filter((a) => a.title && a.link);
}

function timeAgo(date) {
  if (!date || isNaN(date)) return "";
  const diff = (Date.now() - date) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

const translationCache = new Map();
async function translateTitle(text) {
  if (translationCache.has(text)) return translationCache.get(text);
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=` +
      encodeURIComponent(text);
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const translated = data[0]?.map((d) => d[0]).join("") || text;
    translationCache.set(text, translated);
    return translated;
  } catch {
    return text;
  }
}

async function translateArticles(articles) {
  const result = articles.map((a) => ({ ...a }));
  const intlIdxs = result
    .map((a, i) => (a.source.flag === "🌎" ? i : -1))
    .filter((i) => i >= 0)
    .slice(0, 40);

  const BATCH = 5;
  for (let b = 0; b < intlIdxs.length; b += BATCH) {
    await Promise.all(
      intlIdxs.slice(b, b + BATCH).map(async (idx) => {
        result[idx] = { ...result[idx], title: await translateTitle(result[idx].title) };
      })
    );
  }
  return result;
}

const cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000;

// ── Hero Carousel ──────────────────────────────────────────────────────────
function HeroCarousel({ articles }) {
  const [idx, setIdx] = useState(0);
  const [imgError, setImgError] = useState({});
  const [paused, setPaused] = useState(false);
  const total = articles.length;

  useEffect(() => {
    if (paused || total === 0) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % total), 6000);
    return () => clearInterval(timer);
  }, [paused, total]);

  const next = () => setIdx((i) => (i + 1) % total);
  const prev = () => setIdx((i) => (i - 1 + total) % total);

  if (!total) return null;
  const a = articles[idx];
  const hasImg = a.img && !imgError[idx];
  const fallbackBg = FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];

  return (
    <Box
      position="relative"
      w="100%"
      h={{ base: "360px", md: "520px" }}
      overflow="hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide backgrounds — one per article */}
      {articles.map((article, i) => {
        const ok = article.img && !imgError[i];
        return (
          <Box
            key={i}
            position="absolute"
            inset={0}
            opacity={i === idx ? 1 : 0}
            transition="opacity 0.9s ease"
          >
            {ok ? (
              <img
                src={article.img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={() => setImgError((e) => ({ ...e, [i]: true }))}
              />
            ) : (
              <Box
                w="100%" h="100%"
                style={{ background: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length] }}
              >
                {/* Circuit-board dot pattern */}
                <Box
                  position="absolute" inset={0}
                  style={{
                    backgroundImage: `radial-gradient(circle, ${article.source?.color || GREEN}22 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* Big centered icon */}
                <Flex position="absolute" inset={0} align="center" justify="center" pb={16}>
                  <Text fontSize="6xl" style={{ filter: "drop-shadow(0 0 32px rgba(66,201,32,0.5))" }}>
                    {SOURCE_ICONS[article.source?.flag] || "🤖"}
                  </Text>
                </Flex>
              </Box>
            )}
          </Box>
        );
      })}

      {/* Gradient overlay sempre presente */}
      <Box
        position="absolute" inset={0}
        background={
          hasImg
            ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)"
        }
      />

      {/* Matrix scanlines */}
      <Box
        position="absolute" inset={0} pointerEvents="none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(66,201,32,0.022) 2px, rgba(66,201,32,0.022) 4px)",
        }}
      />

      {/* Accent left bar */}
      <Box position="absolute" left={0} top={0} bottom={0} w="4px"
        bg={a.source?.color || GREEN}
        style={{ boxShadow: `0 0 20px ${a.source?.color || GREEN}` }}
      />

      {/* Article content */}
      <Box position="absolute" bottom={0} left={0} right={0} px={{ base: 5, md: 10 }} pb={{ base: 5, md: 8 }}>
        <HStack mb={2} spacing={2}>
          <Badge
            fontSize="10px" fontFamily="heading" fontWeight="700"
            bg={`${a.source?.color || GREEN}22`} color={a.source?.color || GREEN}
            border={`1px solid ${a.source?.color || GREEN}55`}
            px={2} py="2px" borderRadius="full" letterSpacing="0.05em"
          >
            {a.source?.flag} {a.source?.name}
          </Badge>
          {a.date && (
            <Text fontSize="11px" color="whiteAlpha.500" fontFamily="heading">
              {timeAgo(a.date)}
            </Text>
          )}
        </HStack>

        <Link href={a.link} isExternal _hover={{ textDecoration: "none" }}>
          <Text
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="800"
            color="white"
            fontFamily="heading"
            lineHeight="1.25"
            noOfLines={3}
            _hover={{ color: GREEN }}
            transition="color 0.2s"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.95)" }}
          >
            {a.title}
          </Text>
        </Link>

        {/* Dots */}
        <HStack mt={4} spacing="6px">
          {articles.map((_, i) => (
            <Box
              key={i}
              as="button"
              onClick={() => setIdx(i)}
              h="4px"
              w={i === idx ? "28px" : "6px"}
              borderRadius="full"
              bg={i === idx ? (a.source?.color || GREEN) : "rgba(255,255,255,0.22)"}
              transition="all 0.35s"
              style={i === idx ? { boxShadow: `0 0 8px ${a.source?.color || GREEN}` } : {}}
            />
          ))}
        </HStack>
      </Box>

      {/* Arrows */}
      {[{ side: { left: "14px" }, fn: prev, Icon: BsChevronLeft },
        { side: { right: "14px" }, fn: next, Icon: BsChevronRight }
      ].map(({ side, fn, Icon: Ic }, i) => (
        <Box key={i} position="absolute" top="50%" transform="translateY(-50%)" {...side}>
          <Box
            as="button" onClick={fn}
            w="38px" h="38px"
            display="flex" alignItems="center" justifyContent="center"
            bg="rgba(0,0,0,0.7)"
            border={`1px solid ${GREEN_DIM}`}
            borderRadius="full"
            color={GREEN}
            _hover={{ bg: GREEN, color: "#000", borderColor: GREEN }}
            transition="all 0.2s"
          >
            <Icon as={Ic} boxSize="14px" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Destaque Card ──────────────────────────────────────────────────────────
function DestaqueCard({ title, link, img, date, source, fallbackIdx }) {
  const [imgErr, setImgErr] = useState(false);
  const hasImg = img && !imgErr;

  return (
    <Link href={link} isExternal _hover={{ textDecoration: "none" }} h="100%" display="block">
      <Box
        borderRadius="8px" overflow="hidden"
        border={`1px solid ${GREEN_DIM}`} bg="#0a0a0a"
        _hover={{ borderColor: `${source.color}88`, transform: "translateY(-3px)", boxShadow: `0 8px 32px rgba(66,201,32,0.12)` }}
        transition="all 0.25s"
        h="100%" display="flex" flexDirection="column"
      >
        {/* Thumbnail */}
        <Box h="160px" overflow="hidden" position="relative" flexShrink={0}>
          {hasImg ? (
            <img
              src={img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <Box
              w="100%" h="100%" position="relative"
              style={{ background: FALLBACK_GRADIENTS[fallbackIdx % FALLBACK_GRADIENTS.length] }}
            >
              <Box
                position="absolute" inset={0}
                style={{
                  backgroundImage: `radial-gradient(circle, ${source.color}22 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />
              <Flex position="absolute" inset={0} align="center" justify="center">
                <Text fontSize="4xl">{SOURCE_ICONS[source.flag] || "🤖"}</Text>
              </Flex>
            </Box>
          )}

          {/* Bottom fade */}
          <Box position="absolute" bottom={0} left={0} right={0} h="40px"
            background="linear-gradient(to top, #0a0a0a, transparent)" />

          {/* Source badge */}
          <Box position="absolute" top={2} left={2}>
            <Badge
              fontSize="9px" fontFamily="heading" fontWeight="700"
              bg="rgba(0,0,0,0.82)" color={source.color}
              border={`1px solid ${source.color}44`}
              px={1.5} py="1px" borderRadius="full"
            >
              {source.flag} {source.name}
            </Badge>
          </Box>
        </Box>

        {/* Content */}
        <Box p={3} flex={1}>
          {date && (
            <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading" mb={1.5}>
              {timeAgo(date)}
            </Text>
          )}
          <Text
            fontSize="sm" fontWeight="700" color="whiteAlpha.900"
            fontFamily="heading" lineHeight="1.45" noOfLines={3}
          >
            {title}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}

// ── Article Row ────────────────────────────────────────────────────────────
function ArticleRow({ title, link, img, date, source, fallbackIdx }) {
  const [imgErr, setImgErr] = useState(false);
  const hasImg = img && !imgErr;

  return (
    <Box borderBottom="1px solid rgba(255,255,255,0.05)">
      <Link href={link} isExternal _hover={{ textDecoration: "none" }}>
        <HStack
          spacing={3} py={3} px={2} borderRadius="6px"
          _hover={{ bg: "rgba(66,201,32,0.04)" }}
          transition="background 0.2s"
          align="flex-start"
        >
          {/* Thumbnail */}
          <Box flexShrink={0} w="80px" h="56px" borderRadius="6px" overflow="hidden" position="relative">
            {hasImg ? (
              <img
                src={img} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={() => setImgErr(true)}
              />
            ) : (
              <Box
                w="100%" h="100%"
                style={{ background: FALLBACK_GRADIENTS[fallbackIdx % FALLBACK_GRADIENTS.length] }}
              >
                <Box
                  position="absolute" inset={0}
                  style={{
                    backgroundImage: `radial-gradient(circle, ${source.color}33 1px, transparent 1px)`,
                    backgroundSize: "14px 14px",
                  }}
                />
                <Flex position="absolute" inset={0} align="center" justify="center">
                  <Text fontSize="lg">{SOURCE_ICONS[source.flag] || "📰"}</Text>
                </Flex>
              </Box>
            )}
          </Box>

          <Box flex={1} minW={0}>
            <HStack mb={1} spacing={2} flexWrap="wrap">
              <Badge
                fontSize="9px" fontFamily="heading" fontWeight="700"
                bg={`${source.color}22`} color={source.color}
                border={`1px solid ${source.color}44`}
                px={1.5} py="1px" borderRadius="full"
              >
                {source.flag} {source.name}
              </Badge>
              {date && (
                <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">
                  {timeAgo(date)}
                </Text>
              )}
            </HStack>
            <Text
              fontSize="sm" fontWeight="600" color="whiteAlpha.800"
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

// ── Filter Button ──────────────────────────────────────────────────────────
function FilterBtn({ id, label, active, onClick }) {
  return (
    <Box
      as="button" onClick={() => onClick(id)}
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

// ── Section Title ──────────────────────────────────────────────────────────
function SectionTitle({ children, dim }) {
  return (
    <HStack mb={4} spacing={3} align="center">
      <Box
        w="3px" h="20px" borderRadius="full"
        bg={dim ? "rgba(255,255,255,0.2)" : GREEN}
        style={dim ? {} : { boxShadow: `0 0 8px ${GREEN}` }}
      />
      <Text
        fontFamily="heading" fontSize="xs" fontWeight="800" letterSpacing="0.15em"
        color={dim ? "whiteAlpha.400" : GREEN}
      >
        {children}
      </Text>
    </HStack>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
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
    cache.data = translated;
    cache.ts = Date.now();
    setArticles(translated);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchFeeds();
    }
  }, [fetchFeeds]);

  const filtered = articles.filter((a) => {
    if (filter === "br") return a.source.flag === "🇧🇷";
    if (filter === "world") return a.source.flag === "🌎";
    return true;
  });

  // Carousel: prioriza artigos com imagem, complementa com os sem imagem
  const withImg = filtered.filter((a) => a.img);
  const withoutImg = filtered.filter((a) => !a.img);
  const heroArticles = [...withImg.slice(0, 6), ...withoutImg.slice(0, Math.max(0, 6 - withImg.length))].slice(0, 6);
  const heroLinks = new Set(heroArticles.map((a) => a.link));

  const destaques = filtered.filter((a) => !heroLinks.has(a.link)).slice(0, 6);
  const destaqueLinks = new Set(destaques.map((a) => a.link));

  const latest = filtered.filter((a) => !heroLinks.has(a.link) && !destaqueLinks.has(a.link));

  return (
    <Box minH="100vh" w="100vw" bg="#050505" color="white" pb="100px" pt="44px" overflowX="hidden">

      {/* ── Sticky header ── */}
      <Box
        bg="rgba(5,5,5,0.97)"
        borderBottom={`2px solid ${GREEN}`}
        px={{ base: 4, md: 8 }}
        py={3}
        position="sticky"
        top="44px"
        zIndex={100}
        backdropFilter="blur(12px)"
        style={{ boxShadow: `0 4px 30px rgba(66,201,32,0.15)` }}
      >
        <Flex align="center" justify="space-between">
          <HStack spacing={3}>
            <Text fontSize="2xl" lineHeight={1}>🛸</Text>
            <Box>
              <Text
                fontFamily="heading" fontSize="xl" fontWeight="900" color={GREEN}
                lineHeight={1} letterSpacing="0.12em"
                style={{ textShadow: `0 0 16px ${GREEN}99` }}
              >
                IA NEWS
              </Text>
              <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" letterSpacing="0.2em">
                INTELIGÊNCIA ARTIFICIAL
              </Text>
            </Box>
          </HStack>

          <HStack spacing={2}>
            <FilterBtn id="all"   label="Todos"     active={filter === "all"}   onClick={setFilter} />
            <FilterBtn id="world" label="🌎 Mundo"  active={filter === "world"} onClick={setFilter} />
            <FilterBtn id="br"    label="🇧🇷 Brasil" active={filter === "br"}    onClick={setFilter} />
          </HStack>
        </Flex>
      </Box>

      {loading ? (
        <Flex h="60vh" align="center" justify="center">
          <VStack spacing={4}>
            <Spinner size="xl" color={GREEN} thickness="3px" />
            <Text fontSize="sm" color="whiteAlpha.500" fontFamily="heading">
              Buscando notícias de IA...
            </Text>
          </VStack>
        </Flex>
      ) : (
        <Box>
          {/* ── Hero Carousel — full width ── */}
          <HeroCarousel articles={heroArticles} />

          <Box px={{ base: 4, md: 8 }}>
            {/* ── Destaques ── */}
            {destaques.length > 0 && (
              <Box mt={8}>
                <SectionTitle>DESTAQUES</SectionTitle>
                <Grid
                  templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                  gap={4}
                >
                  {destaques.map((a, i) => (
                    <DestaqueCard key={`dest-${i}`} {...a} fallbackIdx={i + 6} />
                  ))}
                </Grid>
              </Box>
            )}

            {/* ── Banner ── */}
            {destaques.length > 0 && latest.length > 0 && (
              <Box mt={8} px={4} py={3} bg={GREEN_DIM} border={`1px solid ${GREEN_DIM}`} borderRadius="8px">
                <Text fontSize="xs" fontFamily="heading" color={GREEN} letterSpacing="0.1em" fontWeight="700">
                  🤖 TODAS AS NOTÍCIAS — ATUALIZADO A CADA 5 MINUTOS
                </Text>
              </Box>
            )}

            {/* ── Latest — 2 colunas ── */}
            {latest.length > 0 && (
              <Box mt={6}>
                <SectionTitle dim>ÚLTIMAS NOTÍCIAS</SectionTitle>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={0} columnGap={8}>
                  {latest.map((a, i) => (
                    <ArticleRow key={`latest-${i}`} {...a} fallbackIdx={i + 12} />
                  ))}
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
