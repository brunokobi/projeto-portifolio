import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, Badge, Link, Icon, HStack, VStack } from "@chakra-ui/react";
import { BsChevronLeft, BsChevronRight, BsArrowRight } from "react-icons/bs";
import type { Article, Feed, NewsCategory } from "../../types";
import { timeAgo } from "../../utils/rss";
import { useInView } from "../../hooks/useInView";
import { GREEN, GREEN_DIM } from "./newsConstants";
import { importanceLevel, heroScore } from "./newsFunctions";

// ── Interfaces ─────────────────────────────────────────────────────────────
interface MiniCardProps {
  title: string;
  link: string;
  img: string | null;
  date: Date | null;
  source: Feed;
  score?: number;
  revealDelay?: number;
}

interface CategoryCardProps extends MiniCardProps {
  desc?: string;
}

interface ScrollRowProps {
  articles: Array<Article & { score?: number }>;
  CardComponent: React.ComponentType<any>;
}

interface DrawerArticleRowProps {
  a: Article & { score?: number };
  accent: string;
}

interface CategoryDrawerProps {
  cat: (NewsCategory & { articles: Array<Article & { score?: number }> }) | null;
  onClose: () => void;
}

interface CategorySectionProps {
  title: string;
  desc: string;
  accent: string;
  articles: Array<Article & { score?: number }>;
  onOpenDrawer?: (cat: any) => void;
}

// ── Corners helper ─────────────────────────────────────────────────────────
const Corners = () => (
  <>
    <span className="nws-corner tl" />
    <span className="nws-corner tr" />
    <span className="nws-corner bl" />
    <span className="nws-corner br" />
  </>
);

// ── Mini Card ──────────────────────────────────────────────────────────────
function MiniCard({ title, link, img, date, source, score, revealDelay = 0 }: MiniCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [ref, inView] = useInView(0.1);
  const lvl = importanceLevel(score ?? 0);

  return (
    <div
      ref={ref}
      style={{
        flexShrink: 0,
        width: "200px",
        opacity: inView ? 1 : 0,
        animation: inView ? `nwsCardIn .45s ease ${revealDelay}ms both` : "none",
      }}
    >
      <Link href={link} isExternal _hover={{ textDecoration: "none" }} display="block" h="100%">
        <Box
          className="nws-card"
          borderRadius="8px"
          bg="#0f0f0f"
          border="1px solid rgba(255,255,255,0.08)"
          _hover={{ borderColor: `${source.color}77`, transform: "translateY(-3px)" }}
          transition="border-color .2s, transform .2s, box-shadow .2s"
          style={{ "--hover-shadow": `0 0 20px ${source.color}33` } as React.CSSProperties}
          h="100%"
        >
          <Corners />
          <Box h="110px" overflow="hidden" position="relative" bg="#111">
            <div className="nws-scanline" />
            {img && !imgErr ? (
              <img src={img} alt="" className="nws-img" onError={() => setImgErr(true)} />
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text fontSize="2xl">📰</Text>
              </Flex>
            )}
            {lvl && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="2px"
                bg={lvl.color}
                style={{ boxShadow: `0 0 6px ${lvl.color}` }}
              />
            )}
            <Box position="absolute" top={1} left={1}>
              <Badge
                fontSize="8px"
                fontFamily="heading"
                fontWeight="700"
                bg="rgba(0,0,0,0.85)"
                color={source.color}
                border={`1px solid ${source.color}33`}
                px={1}
                py="1px"
                borderRadius="full"
              >
                {source.flag}
              </Badge>
            </Box>
          </Box>
          <Box p={2}>
            {date && (
              <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" mb={1}>
                {timeAgo(date)} atrás
              </Text>
            )}
            <Text
              className="nws-title"
              fontSize="xs"
              fontWeight="700"
              color="whiteAlpha.900"
              fontFamily="heading"
              lineHeight="1.35"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </Text>
          </Box>
        </Box>
      </Link>
    </div>
  );
}

// ── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({
  title,
  link,
  img,
  date,
  source,
  score,
  desc,
  revealDelay = 0,
}: CategoryCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [ref, inView] = useInView(0.08);
  const lvl = importanceLevel(score ?? 0);

  return (
    <div
      ref={ref}
      style={{
        flexShrink: 0,
        width: "260px",
        opacity: inView ? 1 : 0,
        animation: inView ? `nwsCardIn .5s ease ${revealDelay}ms both` : "none",
      }}
    >
      <Link href={link} isExternal _hover={{ textDecoration: "none" }} display="block" h="100%">
        <Box
          className="nws-card"
          borderRadius="8px"
          bg="#0d0d0d"
          border="1px solid rgba(255,255,255,0.08)"
          _hover={{ borderColor: `${source.color}77`, transform: "translateY(-4px)" }}
          transition="border-color .2s, transform .25s, box-shadow .25s"
          h="100%"
          display="flex"
          flexDirection="column"
        >
          <Corners />
          {/* Image */}
          <Box h="140px" overflow="hidden" position="relative" bg="#111" flexShrink={0}>
            <div className="nws-scanline" />
            {img && !imgErr ? (
              <img src={img} alt="" className="nws-img" onError={() => setImgErr(true)} />
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text fontSize="3xl">🤖</Text>
              </Flex>
            )}
            {lvl && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="2px"
                bg={lvl.color}
                style={{ boxShadow: `0 0 8px ${lvl.color}` }}
              />
            )}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              h="50px"
              background="linear-gradient(to top, #0d0d0d, transparent)"
            />
            <Box position="absolute" top={2} left={2}>
              <Badge
                fontSize="8px"
                fontFamily="heading"
                fontWeight="700"
                bg="rgba(0,0,0,0.85)"
                color={source.color}
                border={`1px solid ${source.color}33`}
                px={1.5}
                py="1px"
                borderRadius="full"
              >
                {source.flag} {source.name}
              </Badge>
            </Box>
          </Box>

          {/* Content */}
          <Box p={3} flex={1}>
            {date && (
              <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" mb={1}>
                {timeAgo(date)} atrás
              </Text>
            )}
            <Text
              className="nws-title"
              fontSize="sm"
              fontWeight="700"
              color="whiteAlpha.900"
              fontFamily="heading"
              lineHeight="1.4"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </Text>
            {desc && (
              <Text
                fontSize="10px"
                color="whiteAlpha.500"
                fontFamily="heading"
                lineHeight="1.5"
                mt={1}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {desc}
              </Text>
            )}
            {lvl && (
              <Text
                fontSize="9px"
                fontFamily="heading"
                color={lvl.color}
                mt={2}
                style={{ animation: "nwsPulse 2s ease infinite" }}
              >
                {lvl.icon} {lvl.label}
              </Text>
            )}
          </Box>
        </Box>
      </Link>
    </div>
  );
}

// ── Scroll Row ─────────────────────────────────────────────────────────────
function ScrollRow({ articles, CardComponent }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startX = useRef(0);
  const startLeft = useRef(0);

  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    dragging.current = true;
    didDrag.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    startLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 4) didDrag.current = true;
    ref.current.scrollLeft = startLeft.current - walk;
  };

  const stopDrag = () => {
    dragging.current = false;
    if (ref.current) ref.current.style.cursor = "grab";
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.stopPropagation();
      e.preventDefault();
      didDrag.current = false;
    }
  };

  if (!articles.length) return null;

  return (
    <Box position="relative">
      <Box
        position="absolute"
        left={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        display={{ base: "none", md: "block" }}
      >
        <Box
          as="button"
          onClick={() => scroll(-1)}
          w="32px"
          h="32px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0,0,0,0.85)"
          border={`1px solid ${GREEN_DIM}`}
          borderRadius="full"
          color={GREEN}
          _hover={{ bg: GREEN, color: "#000" }}
          transition="all .2s"
          ml={-4}
        >
          <Icon as={BsChevronLeft} boxSize="12px" />
        </Box>
      </Box>

      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onClickCapture={onClickCapture}
        style={
          {
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "8px",
            cursor: "grab",
            scrollbarWidth: "thin",
            scrollbarColor: `${GREEN_DIM} transparent`,
            WebkitOverflowScrolling: "touch",
            userSelect: "none",
          } as React.CSSProperties
        }
      >
        {articles.map((a, i) => (
          <CardComponent key={i} {...a} revealDelay={i * 60} />
        ))}
      </div>

      <Box
        position="absolute"
        right={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        display={{ base: "none", md: "block" }}
      >
        <Box
          as="button"
          onClick={() => scroll(1)}
          w="32px"
          h="32px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0,0,0,0.85)"
          border={`1px solid ${GREEN_DIM}`}
          borderRadius="full"
          color={GREEN}
          _hover={{ bg: GREEN, color: "#000" }}
          transition="all .2s"
          mr={-4}
        >
          <Icon as={BsChevronRight} boxSize="12px" />
        </Box>
      </Box>
    </Box>
  );
}

// ── Drawer Article Row ─────────────────────────────────────────────────────
function DrawerArticleRow({ a, accent }: DrawerArticleRowProps) {
  const [imgErr, setImgErr] = useState(false);
  const lvl = importanceLevel(a.score ?? 0);
  return (
    <Link href={a.link} isExternal _hover={{ textDecoration: "none" }}>
      <Flex
        px={5}
        py={4}
        gap={3}
        align="flex-start"
        borderBottom="1px solid rgba(255,255,255,0.05)"
        _hover={{ bg: "rgba(255,255,255,0.03)" }}
        transition="background .15s"
      >
        {a.img && !imgErr && (
          <Box flexShrink={0} w="80px" h="56px" borderRadius="6px" overflow="hidden" bg="#111">
            <Box
              as="img"
              src={a.img}
              w="100%"
              h="100%"
              style={{ objectFit: "cover", display: "block" }}
              onError={() => setImgErr(true)}
            />
          </Box>
        )}
        <Box flex={1} minW={0}>
          <HStack mb="4px" spacing={2} wrap="wrap">
            <Text
              fontSize="9px"
              fontFamily="heading"
              fontWeight="700"
              color={accent}
              flexShrink={0}
            >
              {a.source?.flag} {a.source?.name}
            </Text>
            {lvl && (
              <Text
                fontSize="8px"
                fontFamily="heading"
                fontWeight="700"
                color={lvl.color}
                flexShrink={0}
              >
                {lvl.icon} {lvl.label}
              </Text>
            )}
          </HStack>
          <Text
            fontSize="xs"
            fontFamily="heading"
            fontWeight="600"
            color="whiteAlpha.900"
            lineHeight="1.45"
            noOfLines={2}
            mb="4px"
          >
            {a.title}
          </Text>
          {a.date && (
            <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading">
              {timeAgo(a.date)} atrás
            </Text>
          )}
        </Box>
        <Icon as={BsArrowRight} color={accent} boxSize="12px" flexShrink={0} mt={1} opacity={0.6} />
      </Flex>
    </Link>
  );
}

// ── Category Drawer ────────────────────────────────────────────────────────
function CategoryDrawer({ cat, onClose }: CategoryDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!cat) return null;
  const sorted = [...cat.articles].sort((a, b) => heroScore(b) - heroScore(a));

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9998}
      display="flex"
      justifyContent="flex-end"
      bg="rgba(0,0,0,0.65)"
      style={{ animation: "nwsOverlayIn .2s ease both", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Box
        bg="#080808"
        w={{ base: "100vw", md: "50vw" }}
        h="100vh"
        display="flex"
        flexDirection="column"
        borderLeft={`1px solid ${cat.accent}33`}
        style={{
          animation: "nwsDrawerIn .25s ease both",
          boxShadow: "-12px 0 48px rgba(0,0,0,0.85)",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          px={5}
          py={4}
          flexShrink={0}
          borderBottom="1px solid rgba(255,255,255,0.07)"
          style={{ background: `linear-gradient(135deg, ${cat.accent}08 0%, transparent 60%)` }}
        >
          <VStack align="flex-start" spacing="2px">
            <HStack spacing={2}>
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={cat.accent}
                flexShrink={0}
                style={{ boxShadow: `0 0 8px ${cat.accent}` }}
              />
              <Text
                fontFamily="heading"
                fontWeight="800"
                fontSize="md"
                color="white"
                style={{ textShadow: `0 0 20px ${cat.accent}55` }}
              >
                {cat.title}
              </Text>
            </HStack>
            <Text fontSize="9px" color="whiteAlpha.400" fontFamily="heading" pl={5}>
              {sorted.length} artigos · ordenados por relevância
            </Text>
          </VStack>
          <Box
            as="button"
            onClick={onClose}
            aria-label="Fechar painel"
            color="whiteAlpha.400"
            _hover={{ color: "white" }}
            transition="color .15s"
            fontSize="lg"
            lineHeight={1}
            ml={4}
          >
            ✕
          </Box>
        </Flex>

        {/* Body */}
        <Box
          overflowY="auto"
          flex={1}
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { background: `${cat.accent}44`, borderRadius: "2px" },
          }}
        >
          {sorted.map((a, i) => (
            <DrawerArticleRow key={i} a={a} accent={cat.accent} />
          ))}
        </Box>

        {/* Footer */}
        <Flex justify="center" py={3} flexShrink={0} borderTop="1px solid rgba(255,255,255,0.05)">
          <Text fontSize="9px" color="whiteAlpha.300" fontFamily="heading">
            {cat.desc}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

// ── Category Section ───────────────────────────────────────────────────────
function CategorySection({ title, desc, accent, articles, onOpenDrawer }: CategorySectionProps) {
  const [ref, inView] = useInView(0.1);
  if (!articles.length) return null;

  const openDrawer = () => onOpenDrawer?.({ title, desc, accent, articles });

  return (
    <Box ref={ref} borderTop="1px solid rgba(255,255,255,0.06)">
      {/* ── Mobile: layout compacto igual ao "Mais Notícias" ── */}
      <Box display={{ base: "block", lg: "none" }} py={5}>
        <Flex
          align="center"
          gap={2}
          mb={3}
          style={{ animation: inView ? "nwsHeroTxt .5s ease .05s both" : "none" }}
        >
          <Box
            w="3px"
            h="16px"
            bg={accent}
            borderRadius="full"
            flexShrink={0}
            style={{ boxShadow: `0 0 8px ${accent}` }}
          />
          <Text
            fontFamily="heading"
            fontSize="xs"
            fontWeight="800"
            color="white"
            letterSpacing="0.08em"
          >
            {title}
          </Text>
          <Box
            as="button"
            onClick={openDrawer}
            ml="auto"
            flexShrink={0}
            _hover={{ opacity: 0.7 }}
            transition="opacity .15s"
          >
            <Text fontSize="9px" fontFamily="heading" color={accent} fontWeight="600">
              {articles.length} artigos →
            </Text>
          </Box>
        </Flex>
        <ScrollRow articles={articles} CardComponent={CategoryCard} />
      </Box>

      {/* ── Desktop: layout 2 colunas ── */}
      <Flex display={{ base: "none", lg: "flex" }} py={8} gap={8} align="flex-start">
        <Box
          flexShrink={0}
          w="220px"
          style={{ animation: inView ? "nwsHeroTxt .5s ease .05s both" : "none" }}
        >
          <Box
            w="32px"
            h="3px"
            bg={accent}
            borderRadius="full"
            mb={3}
            style={{
              boxShadow: `0 0 10px ${accent}`,
              animation: inView ? "nwsBarGrow .4s ease both" : "none",
            }}
          />
          <Text
            fontFamily="heading"
            fontSize="lg"
            fontWeight="800"
            color="white"
            lineHeight="1.2"
            mb={2}
          >
            {title}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500" fontFamily="heading" lineHeight="1.6">
            {desc}
          </Text>
          <Box
            as="button"
            onClick={openDrawer}
            mt={3}
            _hover={{ opacity: 0.7 }}
            transition="opacity .15s"
            display="block"
          >
            <Text
              fontSize="10px"
              fontFamily="heading"
              color={accent}
              fontWeight="700"
              style={{ textShadow: `0 0 8px ${accent}66` }}
            >
              {articles.length} artigos →
            </Text>
          </Box>
        </Box>
        <Box flex={1} minW={0} px={4}>
          <ScrollRow articles={articles} CardComponent={CategoryCard} />
        </Box>
      </Flex>
    </Box>
  );
}

export {
  Corners,
  MiniCard,
  CategoryCard,
  ScrollRow,
  DrawerArticleRow,
  CategoryDrawer,
  CategorySection,
};
export default CategorySection;
