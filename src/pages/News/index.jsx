import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Flex, Grid, Text, Badge, Link, Spinner,
  VStack, HStack, Icon, Divider,
} from "@chakra-ui/react";
import { BsBoxArrowUpRight, BsChevronLeft, BsChevronRight } from "react-icons/bs";

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";
const PROXY = "/.netlify/functions/news?url=";

const FEEDS = [
  { name: "SWEN.AI",      url: "https://swen.ai/feed/",                                                 flag: "🇧🇷", color: "#00c8ff" },
  { name: "AINEWS",       url: "https://ainews.com.br/feed/",                                           flag: "🇧🇷", color: "#00c8ff" },
  { name: "Exame IA",     url: "https://exame.com/inteligencia-artificial/feed/",                       flag: "🇧🇷", color: "#00c8ff" },
  { name: "AI Weekly",    url: "https://aiweekly.co/issues.rss",                                        flag: "🌎", color: GREEN },
  { name: "AI Insider",   url: "https://theaiinsider.tech/feed",                                        flag: "🌎", color: GREEN },
  { name: "MIT News",     url: "https://news.mit.edu/rss/topic/artificial-intelligence",                flag: "🌎", color: GREEN },
  { name: "AI News",      url: "https://www.artificialintelligence-news.com/feed/",                     flag: "🌎", color: GREEN },
  { name: "The Verge",    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",     flag: "🌎", color: GREEN },
  { name: "TechCrunch",   url: "https://techcrunch.com/category/artificial-intelligence/feed/",         flag: "🌎", color: GREEN },
  { name: "Wired AI",     url: "https://www.wired.com/feed/tag/artificial-intelligence/",               flag: "🌎", color: GREEN },
  { name: "MIT Tech Rev", url: "https://www.technologyreview.com/feed/",                                flag: "🌎", color: GREEN },
  { name: "Google Res.",  url: "https://research.google/blog/rss/",                                     flag: "🌎", color: "#4285f4" },
  { name: "HuggingFace",  url: "https://huggingface.co/blog/feed.xml",                                  flag: "🌎", color: "#ff9d00" },
  { name: "The Gradient", url: "https://thegradient.pub/rss/",                                          flag: "🌎", color: GREEN },
  { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",   flag: "🌎", color: "#00629b" },
  { name: "BAIR",         url: "https://bair.berkeley.edu/blog/feed.xml",                               flag: "🌎", color: "#ffa500" },
  { name: "KDnuggets",    url: "https://kdnuggets.com/feed",                                            flag: "🌎", color: GREEN },
];

function parseRSS(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  let items = Array.from(doc.querySelectorAll("item"));
  if (!items.length) items = Array.from(doc.querySelectorAll("entry"));

  return items.slice(0, 6).map((item) => {
    const getText = (sel) => item.querySelector(sel)?.textContent?.trim() ?? "";
    const getAttr = (sel, attr) => item.querySelector(sel)?.getAttribute(attr) ?? "";

    const title = getText("title");
    const link =
      getText("link") ||
      getAttr("link[rel='alternate']", "href") ||
      getAttr("link", "href");
    const date =
      getText("pubDate") || getText("published") || getText("updated") || getText("dc\\:date");

    const img =
      getAttr("media\\:thumbnail, thumbnail", "url") ||
      getAttr("media\\:content, content", "url") ||
      getAttr("enclosure[type^='image']", "url") ||
      (() => {
        const raw = getText("description") || getText("content\\:encoded") || getText("content");
        const match = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
        return match ? match[1] : "";
      })();

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

  return (
    <Box
      position="relative"
      w="100%"
      h={{ base: "300px", md: "440px" }}
      overflow="hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stacked background images with crossfade */}
      {articles.map((article, i) => (
        <Box
          key={i}
          position="absolute"
          inset={0}
          backgroundImage={article.img ? `url(${article.img})` : "none"}
          backgroundSize="cover"
          backgroundPosition="center"
          bg={article.img ? "transparent" : "#0a0a0a"}
          opacity={i === idx ? 1 : 0}
          transition="opacity 0.9s ease"
        />
      ))}

      {/* Gradient overlay */}
      <Box
        position="absolute"
        inset={0}
        background="linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)"
      />

      {/* Matrix scanline texture */}
      <Box
        position="absolute"
        inset={0}
        background="repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(66,201,32,0.025) 2px, rgba(66,201,32,0.025) 4px)"
        pointerEvents="none"
      />

      {/* Green left accent */}
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={GREEN}
        style={{ boxShadow: `0 0 16px ${GREEN}` }} />

      {/* Article content */}
      <Box position="absolute" bottom={0} left={0} right={0} p={{ base: 5, md: 10 }}>
        <HStack mb={2} spacing={2}>
          <Badge
            fontSize="10px"
            fontFamily="heading"
            fontWeight="700"
            bg={`${a.source.color}22`}
            color={a.source.color}
            border={`1px solid ${a.source.color}55`}
            px={2} py="2px" borderRadius="full"
            letterSpacing="0.05em"
          >
            {a.source.flag} {a.source.name}
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
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
          >
            {a.title}
          </Text>
        </Link>

        {/* Progress dots */}
        <HStack mt={4} spacing={2}>
          {articles.map((_, i) => (
            <Box
              key={i}
              as="button"
              onClick={() => setIdx(i)}
              w={i === idx ? "24px" : "6px"}
              h="5px"
              borderRadius="full"
              bg={i === idx ? GREEN : "rgba(255,255,255,0.25)"}
              transition="all 0.35s"
              style={i === idx ? { boxShadow: `0 0 8px ${GREEN}` } : {}}
            />
          ))}
        </HStack>
      </Box>

      {/* Arrow buttons */}
      {[
        { pos: { left: "12px" }, fn: prev, icon: BsChevronLeft },
        { pos: { right: "12px" }, fn: next, icon: BsChevronRight },
      ].map(({ pos, fn, icon }, i) => (
        <Box
          key={i}
          position="absolute"
          top="50%"
          transform="translateY(-50%)"
          {...pos}
        >
          <Box
            as="button"
            onClick={fn}
            w="36px" h="36px"
            display="flex" alignItems="center" justifyContent="center"
            bg="rgba(0,0,0,0.65)"
            border={`1px solid ${GREEN_DIM}`}
            borderRadius="full"
            color={GREEN}
            _hover={{ bg: GREEN, color: "#000", borderColor: GREEN }}
            transition="all 0.2s"
          >
            <Icon as={icon} boxSize="14px" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Destaque Card ──────────────────────────────────────────────────────────
function DestaqueCard({ title, link, img, date, source }) {
  return (
    <Link href={link} isExternal _hover={{ textDecoration: "none" }} h="100%" display="block">
      <Box
        borderRadius="8px"
        overflow="hidden"
        border={`1px solid ${GREEN_DIM}`}
        bg="#0a0a0a"
        _hover={{ borderColor: `${GREEN}88`, transform: "translateY(-3px)", boxShadow: `0 8px 32px rgba(66,201,32,0.12)` }}
        transition="all 0.25s"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        {/* Thumbnail */}
        <Box h="165px" overflow="hidden" position="relative" bg="rgba(66,201,32,0.04)" flexShrink={0}>
          {img ? (
            <img
              src={img}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.style.background = "rgba(66,201,32,0.07)";
              }}
            />
          ) : (
            <Flex h="100%" align="center" justify="center">
              <Text fontSize="4xl">🤖</Text>
            </Flex>
          )}
          {/* Bottom fade */}
          <Box
            position="absolute" bottom={0} left={0} right={0} h="50px"
            background="linear-gradient(to top, #0a0a0a, transparent)"
          />
          {/* Source badge on image */}
          <Box position="absolute" top={2} left={2}>
            <Badge
              fontSize="9px" fontFamily="heading" fontWeight="700"
              bg="rgba(0,0,0,0.8)" color={source.color}
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
            fontSize="sm"
            fontWeight="700"
            color="whiteAlpha.900"
            fontFamily="heading"
            lineHeight="1.45"
            noOfLines={3}
          >
            {title}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}

// ── Article Row (Latest) ───────────────────────────────────────────────────
function ArticleRow({ title, link, img, date, source }) {
  return (
    <Box borderBottom={`1px solid rgba(255,255,255,0.05)`}>
      <Link href={link} isExternal _hover={{ textDecoration: "none" }}>
        <HStack
          spacing={3} py={3} px={2}
          borderRadius="6px"
          _hover={{ bg: "rgba(66,201,32,0.04)" }}
          transition="background 0.2s"
          align="flex-start"
        >
          {/* Thumbnail */}
          <Box flexShrink={0} w="80px" h="56px" borderRadius="6px" overflow="hidden" bg="rgba(66,201,32,0.05)">
            {img ? (
              <img
                src={img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text fontSize="lg">📰</Text>
              </Flex>
            )}
          </Box>

          {/* Text */}
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
              fontSize="sm" fontWeight="600"
              color="whiteAlpha.800" fontFamily="heading"
              lineHeight="1.4" noOfLines={2}
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
      as="button"
      onClick={() => onClick(id)}
      px={3} py={1}
      borderRadius="full"
      fontSize="xs"
      fontFamily="heading"
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
      <Box w="3px" h="20px" bg={dim ? "whiteAlpha.300" : GREEN} borderRadius="full"
        style={dim ? {} : { boxShadow: `0 0 8px ${GREEN}` }} />
      <Text
        fontFamily="heading" fontSize="sm" fontWeight="800"
        color={dim ? "whiteAlpha.500" : GREEN}
        letterSpacing="0.12em"
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

  // Partition: hero (with images) → destaques (next 6) → latest (rest)
  const withImages = filtered.filter((a) => a.img);
  const heroArticles = withImages.slice(0, 6);
  const heroLinks = new Set(heroArticles.map((a) => a.link));

  const destaques = filtered.filter((a) => !heroLinks.has(a.link)).slice(0, 6);
  const destaqueLinks = new Set(destaques.map((a) => a.link));

  const latest = filtered.filter((a) => !heroLinks.has(a.link) && !destaqueLinks.has(a.link));

  return (
    <Box minH="100vh" bg="#050505" color="white" pb="120px" pt="44px">

      {/* ── Sticky header bar ── */}
      <Box
        bg="rgba(5,5,5,0.97)"
        borderBottom={`2px solid ${GREEN}`}
        px={{ base: 4, md: 8 }}
        py={3}
        position="sticky"
        top="44px"
        zIndex={100}
        backdropFilter="blur(10px)"
        style={{ boxShadow: `0 4px 24px rgba(66,201,32,0.12)` }}
      >
        <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
          <HStack spacing={3}>
            <Text fontSize="2xl" lineHeight={1}>🛸</Text>
            <Box>
              <Text
                fontFamily="heading" fontSize="xl" fontWeight="900" color={GREEN}
                lineHeight={1} letterSpacing="0.1em"
                style={{ textShadow: `0 0 14px ${GREEN}99` }}
              >
                IA NEWS
              </Text>
              <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" letterSpacing="0.18em">
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
        <Box maxW="1200px" mx="auto">

          {/* ── Hero Carousel ── */}
          <HeroCarousel articles={heroArticles.length ? heroArticles : filtered.slice(0, 6)} />

          <Box px={{ base: 4, md: 6 }}>

            {/* ── Destaques ── */}
            {destaques.length > 0 && (
              <Box mt={8}>
                <SectionTitle>DESTAQUES</SectionTitle>
                <Grid
                  templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
                  gap={4}
                >
                  {destaques.map((a, i) => (
                    <DestaqueCard key={`dest-${i}`} {...a} />
                  ))}
                </Grid>
              </Box>
            )}

            {/* ── Divider banner ── */}
            {destaques.length > 0 && latest.length > 0 && (
              <Box
                mt={8} mb={0} px={4} py={3}
                bg={GREEN_DIM}
                border={`1px solid ${GREEN_DIM}`}
                borderRadius="8px"
              >
                <Text fontSize="xs" fontFamily="heading" color={GREEN} letterSpacing="0.12em" fontWeight="700">
                  🤖 ÚLTIMAS NOTÍCIAS DE INTELIGÊNCIA ARTIFICIAL — ATUALIZADO A CADA 5 MINUTOS
                </Text>
              </Box>
            )}

            {/* ── Latest articles — two-column grid ── */}
            {latest.length > 0 && (
              <Box mt={6}>
                <SectionTitle dim>TODAS AS NOTÍCIAS</SectionTitle>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={0} columnGap={8}>
                  {latest.map((a, i) => (
                    <ArticleRow key={`latest-${i}`} {...a} />
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
