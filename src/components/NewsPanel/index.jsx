import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  Box, Flex, HStack, VStack, Text, Badge, Link, Spinner, Divider, Icon,
} from "@chakra-ui/react";
import { BsNewspaper, BsBoxArrowUpRight } from "react-icons/bs";
import falar from "../TextAudio";

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";

const FEEDS = [
  // Brasil
  { name: "SWEN.AI",      url: "https://swen.ai/feed/",                                                  flag: "🇧🇷", color: "#00c8ff" },
  { name: "AINEWS",       url: "https://ainews.com.br/feed/",                                            flag: "🇧🇷", color: "#00c8ff" },
  { name: "Exame IA",     url: "https://exame.com/inteligencia-artificial/feed/",                        flag: "🇧🇷", color: "#00c8ff" },
  // Mundo
  { name: "AI Weekly",    url: "https://aiweekly.co/issues.rss",                                         flag: "🌎", color: GREEN },
  { name: "AI Insider",   url: "https://theaiinsider.tech/feed",                                         flag: "🌎", color: GREEN },
  { name: "MIT News",     url: "https://news.mit.edu/rss/topic/artificial-intelligence",                 flag: "🌎", color: GREEN },
  { name: "AI News",      url: "https://www.artificialintelligence-news.com/feed/",                      flag: "🌎", color: GREEN },
  { name: "The Verge",    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",      flag: "🌎", color: GREEN },
  { name: "TechCrunch",   url: "https://techcrunch.com/category/artificial-intelligence/feed/",          flag: "🌎", color: GREEN },
  { name: "Wired AI",     url: "https://www.wired.com/feed/tag/artificial-intelligence/",                flag: "🌎", color: GREEN },
  { name: "MIT Tech Rev", url: "https://www.technologyreview.com/feed/",                                 flag: "🌎", color: GREEN },
  { name: "Google Res.",  url: "https://research.google/blog/rss/",                                      flag: "🌎", color: "#4285f4" },
  { name: "Stanford AI",  url: "https://ai.stanford.edu/feed",                                           flag: "🌎", color: "#8c1515" },
  { name: "BAIR",         url: "https://bair.berkeley.edu/blog/feed.xml",                                flag: "🌎", color: "#ffa500" },
  { name: "MIRI",         url: "https://intelligence.org/feed",                                          flag: "🌎", color: GREEN },
  { name: "Meta Eng.",    url: "https://engineering.fb.com/feed/",                                       flag: "🌎", color: "#0866ff" },
  { name: "HuggingFace",  url: "https://huggingface.co/blog/feed.xml",                                   flag: "🌎", color: "#ff9d00" },
  { name: "KDnuggets",    url: "https://kdnuggets.com/feed",                                             flag: "🌎", color: GREEN },
  { name: "arXiv AI",     url: "https://export.arxiv.org/rss/cs.AI",                                    flag: "🌎", color: "#b31b1b" },
  { name: "The Gradient", url: "https://thegradient.pub/rss/",                                           flag: "🌎", color: GREEN },
  { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",    flag: "🌎", color: "#00629b" },
  { name: "Import AI",    url: "https://jack-clark.net/feed",                                            flag: "🌎", color: GREEN },
  { name: "Synced",       url: "https://syncedreview.com/feed",                                         flag: "🌎", color: GREEN },
  { name: "Analytics V.", url: "https://www.analyticsvidhya.com/feed/",                                 flag: "🌎", color: GREEN },
];

const PROXY = "/.netlify/functions/news?url=";

function parseRSS(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  // RSS 2.0
  let items = Array.from(doc.querySelectorAll("item"));
  // Atom fallback
  if (!items.length) items = Array.from(doc.querySelectorAll("entry"));

  return items.slice(0, 6).map((item) => {
    const getText = (sel) =>
      item.querySelector(sel)?.textContent?.trim() ?? "";
    const getAttr = (sel, attr) =>
      item.querySelector(sel)?.getAttribute(attr) ?? "";

    const title = getText("title");
    const link =
      getText("link") ||
      getAttr("link[rel='alternate']", "href") ||
      getAttr("link", "href");
    const date =
      getText("pubDate") ||
      getText("published") ||
      getText("updated") ||
      getText("dc\\:date");

    // Extrai thumbnail: media:thumbnail → media:content → enclosure → <img> na descrição
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

const ArticleCard = ({ title, link, date, source, img }) => (
  <Box
    borderLeft={`2px solid ${source.color}`}
    pl={3}
    py={2}
    borderRadius="0 4px 4px 0"
    _hover={{ bg: "rgba(255,255,255,0.03)" }}
    transition="background 0.2s"
    onMouseEnter={() => falar(title)}
  >
    <HStack mb={1} spacing={2} flexWrap="wrap">
      <Badge
        fontSize="11px"
        fontFamily="heading"
        fontWeight="600"
        px={2}
        py="2px"
        borderRadius="full"
        bg={`${source.color}22`}
        color={source.color}
        border={`1px solid ${source.color}44`}
        letterSpacing="0.04em"
        textTransform="uppercase"
      >
        {source.flag} {source.name}
      </Badge>
      {date && (
        <Text fontSize="11px" fontFamily="heading" color="whiteAlpha.400">
          {timeAgo(date)}
        </Text>
      )}
    </HStack>

    <Link href={link} isExternal _hover={{ textDecoration: "none" }}>
      <Flex align="center" gap={3} minW={0}>
        {img && (
          <Box
            flexShrink={0}
            w="72px"
            h="52px"
            borderRadius="6px"
            overflow="hidden"
            bg="whiteAlpha.50"
          >
            <img
              src={img}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => { e.target.parentElement.style.display = "none"; }}
            />
          </Box>
        )}
        <Flex align="flex-start" gap={2} minW={0} flex={1}>
          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            fontFamily="heading"
            lineHeight="1.5"
            _hover={{ color: "white" }}
            transition="color 0.15s"
            flex={1}
            minW={0}
            noOfLines={3}
          >
            {title}
          </Text>
          <Icon
            as={BsBoxArrowUpRight}
            boxSize="11px"
            color="whiteAlpha.300"
            mt="4px"
            flexShrink={0}
          />
        </Flex>
      </Flex>
    </Link>
  </Box>
);

// Cache de traduções permanente por sessão
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

// Traduz apenas os primeiros 40 artigos internacionais para não sobrecarregar a API
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
        result[idx] = {
          ...result[idx],
          title: await translateTitle(result[idx].title),
        };
      })
    );
  }
  return result;
}

// Cache in-memory para evitar refetch desnecessário
const cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export const NewsPanel = ({ isOpen, onClose }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchFeeds = useCallback(async () => {
    // usa cache se ainda válido
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      setArticles(cache.data);
      return;
    }
    setLoading(true);
    const results = await Promise.allSettled(
      FEEDS.map((feed) =>
        fetch(`${PROXY}${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(10000) })
          .then((r) => r.text())
          .then((xml) =>
            parseRSS(xml).map((a) => ({ ...a, source: feed }))
          )
      )
    );

    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const raw = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((a) => a.date && !isNaN(a.date) && a.date.getTime() >= oneYearAgo)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

    const translated = await translateArticles(raw);
    cache.data = translated;
    cache.ts = Date.now();
    setArticles(translated);
    setLoading(false);
  }, []);

  // Busca só na primeira abertura
  const handleOpen = useCallback(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchFeeds();
    }
  }, [fetchFeeds]);

  if (isOpen && !fetchedRef.current) handleOpen();

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(4px)" />
      <DrawerContent
        bg="#0a0a0a"
        borderLeft={`1px solid ${GREEN_DIM}`}
        boxShadow={`-4px 0 32px rgba(0,0,0,0.8)`}
        w={{ base: "100%", md: "50vw" }}
        maxW={{ base: "100%", md: "50vw" }}
      >
        <DrawerCloseButton
          color={GREEN}
          border={`1px solid ${GREEN_DIM}`}
          borderRadius="full"
          _hover={{ bg: GREEN, color: "#000" }}
          top="44px"
          right={4}
        />

        <DrawerHeader borderBottom={`1px solid ${GREEN_DIM}`} pt="44px" pb={3}>
          <HStack spacing={2}>
            <Text fontSize="lg" lineHeight={1}>📰</Text>
            <Text
              fontFamily="heading"
              fontSize="md"
              fontWeight="700"
              color={GREEN}
              style={{ textShadow: `0 0 8px ${GREEN}88` }}
            >
              Notícias de IA
            </Text>
          </HStack>

        </DrawerHeader>

        <DrawerBody px={4} pt={4} pb={6} overflowY="auto"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { background: GREEN_DIM, borderRadius: "8px" },
          }}
        >
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <VStack spacing={3}>
                <Spinner size="md" color={GREEN} thickness="2px" />
                <Text fontSize="xs" color="whiteAlpha.500" fontFamily="heading">
                  Buscando notícias...
                </Text>
              </VStack>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {articles.length === 0 && (
                <Text fontSize="sm" color="whiteAlpha.400" textAlign="center" mt={8} fontFamily="heading">
                  Nenhuma notícia encontrada.
                </Text>
              )}
              <AnimatePresence>
                {articles.map((a, i) => (
                  <motion.div
                    key={`${a.source.name}-${i}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                  >
                    <ArticleCard {...a} />
                    {i < articles.length - 1 && (
                      <Divider borderColor="rgba(255,255,255,0.05)" mt={3} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// Botão flutuante de atalho (usado no Nav)
export const NewsPanelButton = ({ onClick }) => (
  <Box
    as="button"
    onClick={onClick}
    display="inline-flex"
    alignItems="center"
    gap={1}
    px={2}
    py={1}
    color="whiteAlpha.700"
    _hover={{ color: GREEN }}
    transition="color 0.2s"
    title="Notícias de IA"
  >
    <BsNewspaper size={16} />
    <Text fontSize="xs" fontFamily="heading" display={{ base: "none", lg: "block" }}>
      Notícias IA
    </Text>
  </Box>
);

export default NewsPanel;
