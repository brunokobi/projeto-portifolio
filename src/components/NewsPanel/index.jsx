import { useState, useCallback, useRef } from "react";
import {
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  Box, Flex, HStack, VStack, Text, Badge, Link, Spinner, Divider, Icon,
} from "@chakra-ui/react";
import { BsNewspaper, BsBoxArrowUpRight } from "react-icons/bs";

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";

const FEEDS = [
  // Brasil
  { name: "SWEN.AI",      url: "https://swen.ai/feed/",                                                  flag: "🇧🇷", color: "#00c8ff" },
  { name: "AINEWS",       url: "https://ainews.com.br/feed/",                                            flag: "🇧🇷", color: "#00c8ff" },
  { name: "Exame IA",     url: "https://exame.com/inteligencia-artificial/feed/",                        flag: "🇧🇷", color: "#00c8ff" },
  // Mundo
  { name: "The Verge",    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",     flag: "🌎", color: GREEN },
  { name: "TechCrunch",   url: "https://techcrunch.com/category/artificial-intelligence/feed/",         flag: "🌎", color: GREEN },
  { name: "Wired AI",     url: "https://www.wired.com/feed/tag/artificial-intelligence/",               flag: "🌎", color: GREEN },
  { name: "MIT Tech Rev", url: "https://www.technologyreview.com/feed/",                                flag: "🌎", color: GREEN },
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
    // link pode ser texto ou atributo href (Atom)
    const link =
      getText("link") ||
      getAttr("link[rel='alternate']", "href") ||
      getAttr("link", "href");
    const date =
      getText("pubDate") ||
      getText("published") ||
      getText("updated") ||
      getText("dc\\:date");

    return { title, link, date: date ? new Date(date) : null };
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

const ArticleCard = ({ title, link, date, source }) => (
  <Box
    borderLeft={`2px solid ${source.color}`}
    pl={3}
    py={2}
    borderRadius="0 4px 4px 0"
    _hover={{ bg: "rgba(255,255,255,0.03)" }}
    transition="background 0.2s"
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
      <Flex align="flex-start" gap={2} minW={0}>
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
    </Link>
  </Box>
);

// Cache in-memory para evitar refetch desnecessário
const cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export const NewsPanel = ({ isOpen, onClose }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all | br | world
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
        fetch(`${PROXY}${encodeURIComponent(feed.url)}`)
          .then((r) => r.text())
          .then((xml) =>
            parseRSS(xml).map((a) => ({ ...a, source: feed }))
          )
      )
    );

    const all = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

    cache.data = all;
    cache.ts = Date.now();
    setArticles(all);
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

  const filtered = articles.filter((a) => {
    if (filter === "br") return a.source.flag === "🇧🇷";
    if (filter === "world") return a.source.flag === "🌎";
    return true;
  });

  const FilterBtn = ({ id, label }) => (
    <Box
      as="button"
      onClick={() => setFilter(id)}
      px={3}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontFamily="heading"
      fontWeight={filter === id ? "700" : "400"}
      color={filter === id ? "#000" : "whiteAlpha.600"}
      bg={filter === id ? GREEN : "transparent"}
      border={`1px solid ${filter === id ? GREEN : "rgba(255,255,255,0.12)"}`}
      transition="all 0.2s"
      _hover={{ borderColor: GREEN, color: GREEN }}
      style={filter === id ? { boxShadow: `0 0 8px ${GREEN}88` } : {}}
    >
      {label}
    </Box>
  );

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
      <DrawerOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(4px)" />
      <DrawerContent
        bg="#0a0a0a"
        borderLeft={`1px solid ${GREEN_DIM}`}
        boxShadow={`-4px 0 32px rgba(0,0,0,0.8)`}
        w={{ base: "100vw", md: "420px" }}
        maxW="100vw"
      >
        <DrawerCloseButton
          color={GREEN}
          border={`1px solid ${GREEN_DIM}`}
          borderRadius="full"
          _hover={{ bg: GREEN, color: "#000" }}
          top={4}
          right={4}
        />

        <DrawerHeader borderBottom={`1px solid ${GREEN_DIM}`} pb={3}>
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

          <HStack mt={3} spacing={2}>
            <FilterBtn id="all"   label="Todos" />
            <FilterBtn id="world" label="🌎 Mundo" />
            <FilterBtn id="br"    label="🇧🇷 Brasil" />
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
              {filtered.length === 0 && (
                <Text fontSize="sm" color="whiteAlpha.400" textAlign="center" mt={8} fontFamily="heading">
                  Nenhuma notícia encontrada.
                </Text>
              )}
              {filtered.map((a, i) => (
                <Box key={`${a.source.name}-${i}`}>
                  <ArticleCard {...a} />
                  {i < filtered.length - 1 && (
                    <Divider borderColor="rgba(255,255,255,0.05)" mt={3} />
                  )}
                </Box>
              ))}
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
