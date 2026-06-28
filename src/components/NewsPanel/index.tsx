import { useState, useCallback, useRef, useEffect } from "react";
import type { Article } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Link,
  Spinner,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { BsNewspaper, BsBoxArrowUpRight } from "react-icons/bs";
import falar from "../TextAudio";
import { parseRSS, timeAgo, translateArticles, PROXY, CACHE_TTL } from "../../utils/rss";

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.15)";

const FEEDS = [
  // Pesquisa & Ciência
  {
    name: "MIT News",
    url: "https://news.mit.edu/rss/topic/artificial-intelligence",
    flag: "🌎",
    color: GREEN,
    cat: "research",
  },
  {
    name: "MIT Tech Rev",
    url: "https://www.technologyreview.com/feed/",
    flag: "🌎",
    color: GREEN,
    cat: "research",
  },
  {
    name: "Google Res.",
    url: "https://research.google/blog/rss/",
    flag: "🌎",
    color: "#4285f4",
    cat: "research",
  },
  {
    name: "Stanford AI",
    url: "https://ai.stanford.edu/feed",
    flag: "🌎",
    color: "#8c1515",
    cat: "research",
  },
  {
    name: "BAIR",
    url: "https://bair.berkeley.edu/blog/feed.xml",
    flag: "🌎",
    color: "#ffa500",
    cat: "research",
  },
  { name: "MIRI", url: "https://intelligence.org/feed", flag: "🌎", color: GREEN, cat: "research" },
  {
    name: "arXiv AI",
    url: "https://export.arxiv.org/rss/cs.AI",
    flag: "🌎",
    color: "#b31b1b",
    cat: "research",
  },
  {
    name: "The Gradient",
    url: "https://thegradient.pub/rss/",
    flag: "🌎",
    color: GREEN,
    cat: "research",
  },
  {
    name: "Import AI",
    url: "https://jack-clark.net/feed",
    flag: "🌎",
    color: GREEN,
    cat: "research",
  },
  // Pesquisa Asiática & China
  {
    name: "Synced",
    url: "https://syncedreview.com/feed",
    flag: "🌏",
    color: "#e63946",
    cat: "asia",
  },
  // Modelos & Ferramentas
  {
    name: "HuggingFace",
    url: "https://huggingface.co/blog/feed.xml",
    flag: "🌎",
    color: "#ff9d00",
    cat: "models",
  },
  {
    name: "AI Weekly",
    url: "https://aiweekly.co/issues.rss",
    flag: "🌎",
    color: GREEN,
    cat: "models",
  },
  {
    name: "AI Insider",
    url: "https://theaiinsider.tech/feed",
    flag: "🌎",
    color: GREEN,
    cat: "models",
  },
  {
    name: "Analytics V.",
    url: "https://www.analyticsvidhya.com/feed/",
    flag: "🌎",
    color: GREEN,
    cat: "models",
  },
  // Engenharia & Dev
  {
    name: "Meta Eng.",
    url: "https://engineering.fb.com/feed/",
    flag: "🌎",
    color: "#0866ff",
    cat: "dev",
  },
  {
    name: "IEEE Spectrum",
    url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",
    flag: "🌎",
    color: "#00629b",
    cat: "dev",
  },
  { name: "KDnuggets", url: "https://kdnuggets.com/feed", flag: "🌎", color: GREEN, cat: "dev" },
  // Brasil
  { name: "SWEN.AI", url: "https://swen.ai/feed/", flag: "🇧🇷", color: "#00c8ff", cat: "brasil" },
  {
    name: "AINEWS",
    url: "https://ainews.com.br/feed/",
    flag: "🇧🇷",
    color: "#00c8ff",
    cat: "brasil",
  },
  {
    name: "Exame IA",
    url: "https://exame.com/inteligencia-artificial/feed/",
    flag: "🇧🇷",
    color: "#00c8ff",
    cat: "brasil",
  },
  // Indústria & Tech
  {
    name: "The Verge",
    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    flag: "🌎",
    color: GREEN,
    cat: "industry",
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    flag: "🌎",
    color: GREEN,
    cat: "industry",
  },
  {
    name: "Wired AI",
    url: "https://www.wired.com/feed/tag/artificial-intelligence/",
    flag: "🌎",
    color: GREEN,
    cat: "industry",
  },
  {
    name: "AI News",
    url: "https://www.artificialintelligence-news.com/feed/",
    flag: "🌎",
    color: GREEN,
    cat: "industry",
  },
];

const CATEGORIES = [
  { id: "top", label: "📡 MAIS NOTÍCIAS", color: GREEN },
  { id: "research", label: "🔬 Pesquisa & Ciência", color: "#4285f4" },
  { id: "asia", label: "🌏 Pesquisa Asiática & China", color: "#e63946" },
  { id: "models", label: "🤖 Modelos & Ferramentas", color: "#ff9d00" },
  { id: "dev", label: "⚙️ Engenharia & Dev", color: "#0866ff" },
  { id: "brasil", label: "🇧🇷 Brasil", color: "#00c8ff" },
  { id: "industry", label: "🏭 Indústria & Tech", color: GREEN },
];

const SectionHeader = ({ label, color }: { label: string; color: string }) => (
  <Box pt={4} pb={2}>
    <HStack spacing={2} align="center">
      <Box flex={1} h="1px" bg={`${color}33`} />
      <Text
        fontSize="10px"
        fontFamily="'Courier New', monospace"
        fontWeight="900"
        letterSpacing="0.18em"
        color={color}
        textTransform="uppercase"
        style={{ textShadow: `0 0 6px ${color}66` }}
        flexShrink={0}
      >
        {label}
      </Text>
      <Box flex={1} h="1px" bg={`${color}33`} />
    </HStack>
  </Box>
);

const ArticleCard = ({
  title,
  link,
  date,
  source,
  img,
}: Pick<Article, "title" | "link" | "date" | "source" | "img">) => (
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
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
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

// Cache in-memory para evitar refetch desnecessário
const cache: { data: Article[] | null; ts: number } = { data: null, ts: 0 };

interface NewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsPanel = ({ isOpen, onClose }: NewsPanelProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
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
          .then((xml) => parseRSS(xml).map((a) => ({ ...a, source: feed }) as Article))
      )
    );

    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const raw = results
      .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((a) => a.date && !isNaN(a.date as any) && a.date.getTime() >= oneYearAgo)
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

  useEffect(() => {
    if (isOpen) handleOpen();
  }, [isOpen, handleOpen]);

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
            <Text fontSize="lg" lineHeight={1}>
              📰
            </Text>
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

        <DrawerBody
          px={4}
          pt={4}
          pb={6}
          overflowY="auto"
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
          ) : articles.length === 0 ? (
            <Text
              fontSize="sm"
              color="whiteAlpha.400"
              textAlign="center"
              mt={8}
              fontFamily="heading"
            >
              Nenhuma notícia encontrada.
            </Text>
          ) : (
            <AnimatePresence>
              {CATEGORIES.map((cat) => {
                const items =
                  cat.id === "top"
                    ? articles.slice(0, 8)
                    : articles.filter((a) => a.source.cat === cat.id);
                if (!items.length) return null;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <SectionHeader label={cat.label} color={cat.color} />
                    <VStack spacing={0} align="stretch">
                      {items.map((a, i) => (
                        <Box key={`${cat.id}-${a.source.name}-${i}`}>
                          <ArticleCard {...a} />
                          {i < items.length - 1 && (
                            <Divider borderColor="rgba(255,255,255,0.04)" my={2} />
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// Botão flutuante de atalho (usado no Nav)
export const NewsPanelButton = ({ onClick }: { onClick: () => void }) => (
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
