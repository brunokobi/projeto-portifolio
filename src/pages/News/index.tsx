import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box, Flex, Text, Link, Spinner, VStack, HStack, Icon, Tooltip, Badge,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  BsSortDown, BsClock, BsQuestionCircle,
} from "react-icons/bs";
import { IoMdRocket } from "react-icons/io";
import { RiAliensFill } from "react-icons/ri";
import { FaReact, FaGlobe } from "react-icons/fa";
import { AiOutlineMail, AiOutlineLinkedin, AiOutlineGithub } from "react-icons/ai";
import { BiCube } from "react-icons/bi";
import brazilFlag from "../../assets/img/brazil.png";

import { parseRSS, translateArticles, PROXY, CACHE_TTL } from "../../utils/rss";
import {
  GREEN, GREEN_DIM, MATRIX_CSS, MCHARS, CATEGORIES, FEEDS,
} from "./newsConstants";
import { isSpam, isRelevant, scoreArticle, heroScore, MIXED_SOURCES } from "./newsFunctions";
import { HeroCarousel } from "./HeroCarousel";
import { ScrollRow, MiniCard, CategorySection, CategoryDrawer } from "./CategorySection";
import type { Article, NewsCategory } from "../../types";

type ScoredArticle = Article & { score: number };
type DrawerCat = NewsCategory & { articles: ScoredArticle[] };

// ── Cache in-memory ────────────────────────────────────────────────────────
const cache: { data: ScoredArticle[] | null; ts: number } = { data: null, ts: 0 };

// ── Matrix rain loader ─────────────────────────────────────────────────────
function MatrixLoader() {
  const drops = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      char:  MCHARS[(i * 7) % MCHARS.length],
      left:  `${(i / 60) * 100}%`,
      delay: (i * 83) % 1400,
      dur:   0.6 + (i % 5) * 0.18,
      top:   `${(i * 37) % 100}%`,
      op:    0.08 + (i % 4) * 0.07,
    })), []);

  return (
    <Flex h="70vh" align="center" justify="center" position="relative" overflow="hidden">
      {drops.map((d, i) => (
        <Text key={i} position="absolute" left={d.left} top={d.top}
          fontSize="xs" color={GREEN} fontFamily="monospace" userSelect="none"
          style={{ opacity: d.op, animation: `nwsMatrixFall ${d.dur}s ${d.delay}ms infinite` }}>
          {d.char}
        </Text>
      ))}
      <VStack spacing={4} zIndex={1}>
        <Spinner size="xl" color={GREEN} thickness="3px"
          style={{ animation: "nwsPulse 1.5s ease infinite" }} />
        <Text fontSize="sm" color={GREEN} fontFamily="monospace" letterSpacing="0.2em">
          CARREGANDO FEEDS...
        </Text>
        <Text fontSize="xs" color="whiteAlpha.300" fontFamily="monospace">
          {MCHARS.slice(0, 12).join(" ")}
        </Text>
      </VStack>
    </Flex>
  );
}

// ── Filter Button ──────────────────────────────────────────────────────────
function FilterBtn({ id, label, active, onClick }: {
  id: string; label: string; active: boolean; onClick: (id: string) => void;
}) {
  return (
    <Box as="button" onClick={() => onClick(id)}
      aria-pressed={active}
      px={3} py={1} borderRadius="4px" fontSize="xs" fontFamily="heading"
      fontWeight={active ? "700" : "500"} color={active ? GREEN : "whiteAlpha.600"}
      bg={active ? `${GREEN}15` : "transparent"} transition="all .15s"
      _hover={{ color: GREEN, bg: `${GREEN}10` }} whiteSpace="nowrap"
      style={active ? { textShadow: `0 0 8px ${GREEN}88` } : {}}>
      {label}
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [articles, setArticles]       = useState<ScoredArticle[]>([]);
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState<"all" | "br" | "world">("all");
  const [sortBy, setSortBy]           = useState<"importance" | "date">("importance");
  const [showSources, setShowSources] = useState(false);
  const [drawerCat, setDrawerCat]     = useState<DrawerCat | null>(null);
  const fetchedRef = useRef(false);

  const fetchFeeds = useCallback(async () => {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) { setArticles(cache.data); return; }
    setLoading(true);
    const results = await Promise.allSettled(
      FEEDS.map(feed =>
        fetch(`${PROXY}${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(10000) })
          .then(r => r.text())
          .then(xml => parseRSS(xml).map(a => ({ ...a, source: feed })))
      )
    );
    const raw = results
      .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === "fulfilled")
      .flatMap(r => r.value)
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
    const translated = await translateArticles(raw);
    const scored: ScoredArticle[] = translated.map(a => ({ ...a, score: scoreArticle(a) }));
    cache.data = scored; cache.ts = Date.now();
    setArticles(scored); setLoading(false);
  }, []);

  useEffect(() => { if (!fetchedRef.current) { fetchedRef.current = true; fetchFeeds(); } }, [fetchFeeds]);

  // Impede scroll horizontal da página sem bloquear filhos com overflow-x: auto
  useEffect(() => {
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = prev; };
  }, []);

  const filtered = articles.filter(a => {
    if (isSpam(a)) return false;
    if (MIXED_SOURCES.has(a.source?.name) && !isRelevant(a)) return false;
    if (filter === "br")    return a.source.flag === "🇧🇷";
    if (filter === "world") return a.source.flag === "🌎";
    return true;
  });
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "importance"
      ? (b.score ?? 0) - (a.score ?? 0)
      : (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
  );

  const heroSlides  = [...filtered]
    .filter(a => a.img)
    .sort((a, b) => heroScore(b) - heroScore(a))
    .slice(0, 6);
  const heroLinks   = new Set(heroSlides.map(a => a.link));
  // mini-cards mostram próximos 10 (excluindo carrossel)
  const miniCards   = sorted.filter(a => !heroLinks.has(a.link)).slice(0, 10);
  // categorias excluem APENAS o carrossel, não os mini-cards (pool maior)
  const catArticles = sorted.filter(a => !heroLinks.has(a.link));
  const catSources  = CATEGORIES.flatMap(c => c.sources);

  return (
    <Box minH="100vh" w="100vw" bg="#050505" color="white">
      {/* Inject Matrix CSS once */}
      <style>{MATRIX_CSS}</style>

      {/* ── Header ── */}
      <Box className="nws-header"
        bg="rgba(5,5,5,0.98)" position="sticky" top={0} zIndex={200}
        backdropFilter="blur(14px)"
        style={{ boxShadow: `0 4px 30px rgba(66,201,32,0.2)`, borderBottom: `2px solid ${GREEN}` }}>

        {/* Linha 1 */}
        <Flex align="center" justify="space-between" gap={2}
          px={{ base: 3, md: 8 }} py={3} borderBottom="1px solid rgba(255,255,255,0.07)">
          <HStack spacing={3}>
            <Text fontSize="2xl" lineHeight={1} style={{ animation: "nwsGlitch 5s ease infinite" }}>🛸</Text>
            <Box>
              <HStack spacing={0} align="baseline">
                <Text fontFamily="heading" fontSize={{ base: "md", md: "xl" }} fontWeight="900"
                  color={GREEN} lineHeight={1} letterSpacing="0.1em"
                  style={{ textShadow: `0 0 18px ${GREEN}99` }}>IA NEWS</Text>
                <Text fontFamily="heading" fontSize={{ base: "md", md: "xl" }} fontWeight="900"
                  color="whiteAlpha.700" lineHeight={1} letterSpacing="0.1em" ml={2}>BRUNO KOBI</Text>
              </HStack>
              <Text fontSize="8px" color="whiteAlpha.350" fontFamily="heading" letterSpacing="0.22em">
                INTELIGÊNCIA ARTIFICIAL
              </Text>
            </Box>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label={sortBy === "importance" ? "Ordenado por importância" : "Ordenado por data"} hasArrow>
              <Box as="button"
                onClick={() => setSortBy(s => s === "importance" ? "date" : "importance")}
                px={3} py={1} borderRadius="full" fontSize="xs" fontFamily="heading"
                display="flex" alignItems="center" gap={1}
                color={sortBy === "importance" ? "#ffaa00" : "whiteAlpha.500"}
                bg={sortBy === "importance" ? "rgba(255,170,0,0.1)" : "transparent"}
                border={`1px solid ${sortBy === "importance" ? "#ffaa0055" : "rgba(255,255,255,0.12)"}`}
                transition="all .2s" _hover={{ borderColor: "#ffaa00", color: "#ffaa00" }}>
                <Icon as={sortBy === "importance" ? BsSortDown : BsClock} boxSize="11px" />
                <Text as="span" ml={1}>{sortBy === "importance" ? "Importância" : "Data"}</Text>
              </Box>
            </Tooltip>
            <Tooltip label={`${FEEDS.length} fontes ativas`} hasArrow>
              <Box as="button" onClick={() => setShowSources(true)}
                w="28px" h="28px" borderRadius="full" flexShrink={0}
                border="1px solid rgba(255,255,255,0.18)"
                display="flex" alignItems="center" justifyContent="center"
                color="whiteAlpha.500" transition="all .2s"
                _hover={{ borderColor: GREEN, color: GREEN, boxShadow: `0 0 10px ${GREEN}55` }}>
                <Icon as={BsQuestionCircle} boxSize="13px" />
              </Box>
            </Tooltip>
          </HStack>
        </Flex>

        {/* Linha 2 — nav */}
        <Box px={{ base: 2, md: 4 }} overflowX="auto"
          css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          <HStack spacing={0} py="8px" minW="max-content" justify="space-between" w="100%">
            <HStack spacing={0}>
              {[
                { label: "Home",         to: "/",                                       icon: IoMdRocket,        external: false },
                { label: "Sobre",        to: "/about",                                  icon: RiAliensFill,      external: false },
                { label: "Projetos",     to: "/projects",                               icon: FaReact,           external: false },
                { label: "Contato",      to: "/#contato",                               icon: AiOutlineMail,     external: false },
                { label: "Portfolio 3D", to: "https://brunokobi3d.netlify.app",         icon: BiCube,            external: true  },
                { label: "Mapa Esri",    to: "/map",                                    icon: FaGlobe,           external: false },
                { label: "Linkedin",     to: "https://www.linkedin.com/in/brunokobi/", icon: AiOutlineLinkedin, external: true  },
                { label: "Github",       to: "https://github.com/brunokobi",           icon: AiOutlineGithub,   external: true  },
              ].map((item, i) => {
                const inner = (
                  <HStack spacing={1} px={3} py={2} cursor="pointer"
                    color="whiteAlpha.600" borderRadius="4px"
                    _hover={{ color: GREEN, bg: `${GREEN}0d` }} transition="all .15s">
                    <Icon as={item.icon} boxSize="14px" />
                    <Text fontFamily="heading" fontSize="xs" fontWeight="500"
                      display={{ base: "none", md: "block" }} whiteSpace="nowrap">{item.label}</Text>
                  </HStack>
                );
                return item.external
                  ? <Link key={i} href={item.to} isExternal _hover={{ textDecoration: "none" }}>{inner}</Link>
                  : <Link key={i} as={RouterLink} to={item.to} _hover={{ textDecoration: "none" }}>{inner}</Link>;
              })}
            </HStack>

            <HStack spacing={0} flexShrink={0}>
              <Box w="1px" h="14px" bg="rgba(255,255,255,0.1)" mx={2} />
              <FilterBtn id="all"   label="Todos" active={filter === "all"}   onClick={(id) => setFilter(id as typeof filter)} />
              <FilterBtn id="world" label="🌎"    active={filter === "world"} onClick={(id) => setFilter(id as typeof filter)} />
              <Box as="button" onClick={() => setFilter("br")}
                px={2} py={1} borderRadius="4px"
                bg={filter === "br" ? `${GREEN}15` : "transparent"}
                transition="all .15s" _hover={{ bg: `${GREEN}10` }}
                display="flex" alignItems="center">
                <img src={brazilFlag} alt="Brasil"
                  style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    filter: filter === "br" ? `drop-shadow(0 0 4px ${GREEN})` : "none",
                    outline: filter === "br" ? `2px solid ${GREEN}88` : "none",
                    outlineOffset: "1px",
                  }} />
              </Box>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* ── Sources modal ── */}
      {showSources && (
        <Box position="fixed" inset={0} zIndex={9999} bg="rgba(0,0,0,0.88)"
          display="flex" alignItems="center" justifyContent="center"
          onClick={() => setShowSources(false)}
          style={{ backdropFilter: "blur(6px)" }}>
          <Box bg="#0a0a0a" border={`1px solid ${GREEN}44`} borderRadius="12px"
            maxW="640px" w="92vw" maxH="82vh"
            display="flex" flexDirection="column"
            style={{ boxShadow: `0 0 40px ${GREEN}22, 0 20px 60px rgba(0,0,0,0.8)` }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}>

            {/* Header */}
            <Flex align="center" justify="space-between" flexShrink={0}
              px={5} py={4} borderBottom="1px solid rgba(255,255,255,0.07)">
              <VStack align="flex-start" spacing={0}>
                <Text fontFamily="heading" fontWeight="800" fontSize="md" color={GREEN}
                  style={{ textShadow: `0 0 12px ${GREEN}88` }}>
                  Fontes de Feed
                </Text>
                <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">
                  {FEEDS.length} feeds ativos · atualizados a cada 5 min
                </Text>
              </VStack>
              <Box as="button" onClick={() => setShowSources(false)}
                aria-label="Fechar lista de fontes"
                color="whiteAlpha.400" _hover={{ color: "white" }} transition="color .15s"
                fontSize="lg" lineHeight={1}>✕</Box>
            </Flex>

            {/* Body */}
            <Box overflowY="auto" flex={1} px={5} py={4}
              css={{ "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: `${GREEN}44`, borderRadius: "2px" } }}>
              {CATEGORIES.map(cat => {
                const catFeeds = FEEDS.filter(f => cat.sources.includes(f.name));
                if (!catFeeds.length) return null;
                return (
                  <Box key={cat.id} mb={5}>
                    <HStack mb={2} spacing={2}>
                      <Box w="12px" h="12px" borderRadius="full" bg={cat.accent}
                        style={{ boxShadow: `0 0 6px ${cat.accent}` }} flexShrink={0} />
                      <Text fontFamily="heading" fontSize="xs" fontWeight="700" color={cat.accent}>
                        {cat.title}
                      </Text>
                      <Text fontSize="9px" color="whiteAlpha.300" fontFamily="heading">
                        {catFeeds.length} fontes
                      </Text>
                    </HStack>
                    {catFeeds.map(f => (
                      <Flex key={f.name} align="center" gap={3} py="6px"
                        borderBottom="1px solid rgba(255,255,255,0.04)">
                        <Text fontSize="11px" fontFamily="heading" fontWeight="600"
                          color="whiteAlpha.800" w="120px" flexShrink={0}>
                          {f.flag} {f.name}
                        </Text>
                        <Link href={f.url} isExternal flex={1}
                          fontSize="9px" color="whiteAlpha.350" fontFamily="monospace"
                          _hover={{ color: GREEN }} noOfLines={1} title={f.url}>
                          {f.url}
                        </Link>
                      </Flex>
                    ))}
                  </Box>
                );
              })}
              {/* Feeds fora das categorias */}
              {(() => {
                const used = new Set(CATEGORIES.flatMap(c => c.sources));
                const others = FEEDS.filter(f => !used.has(f.name));
                if (!others.length) return null;
                return (
                  <Box mb={5}>
                    <HStack mb={2} spacing={2}>
                      <Box w="12px" h="12px" borderRadius="full" bg="whiteAlpha.300" flexShrink={0} />
                      <Text fontFamily="heading" fontSize="xs" fontWeight="700" color="whiteAlpha.500">
                        🌐 Outras fontes
                      </Text>
                    </HStack>
                    {others.map(f => (
                      <Flex key={f.name} align="center" gap={3} py="6px"
                        borderBottom="1px solid rgba(255,255,255,0.04)">
                        <Text fontSize="11px" fontFamily="heading" fontWeight="600"
                          color="whiteAlpha.800" w="120px" flexShrink={0}>
                          {f.flag} {f.name}
                        </Text>
                        <Link href={f.url} isExternal flex={1}
                          fontSize="9px" color="whiteAlpha.350" fontFamily="monospace"
                          _hover={{ color: GREEN }} noOfLines={1} title={f.url}>
                          {f.url}
                        </Link>
                      </Flex>
                    ))}
                  </Box>
                );
              })()}
            </Box>
          </Box>
        </Box>
      )}

      {drawerCat && <CategoryDrawer cat={drawerCat} onClose={() => setDrawerCat(null)} />}

      {loading ? <MatrixLoader /> : (
        <Box pb="60px">
          {heroSlides.length > 0 && <HeroCarousel articles={heroSlides} />}

          {miniCards.length > 0 && (
            <Box px={{ base: 4, md: 8 }} pt={{ base: 8, md: 6 }} pb={6} bg="#080808" borderBottom="1px solid rgba(255,255,255,0.06)">
              <Text fontFamily="heading" fontSize="xs" fontWeight="700" color="whiteAlpha.600"
                letterSpacing="0.15em" mb={4}>MAIS NOTÍCIAS</Text>
              <ScrollRow articles={miniCards} CardComponent={MiniCard} />
            </Box>
          )}

          <Box px={{ base: 4, md: 8 }}>
            {CATEGORIES.map(cat => (
              <CategorySection key={cat.id} {...cat}
                articles={catArticles.filter(a => cat.sources.includes(a.source.name))}
                onOpenDrawer={setDrawerCat} />
            ))}
            {(() => {
              const remaining = catArticles.filter(a => !catSources.includes(a.source.name));
              if (!remaining.length) return null;
              return <CategorySection title="🌐 Outros" desc="Outras fontes de IA ao redor do mundo."
                accent="rgba(255,255,255,0.35)" articles={remaining}
                onOpenDrawer={setDrawerCat} />;
            })()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NewsPage;
