import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Grid, Text, Badge, Link, Icon, HStack,
} from "@chakra-ui/react";
import { BsChevronLeft, BsChevronRight, BsArrowRight } from "react-icons/bs";
import type { Article } from "../../types";
import { timeAgo } from "../../utils/rss";
import { GREEN, SLIDE_INTERVAL } from "./newsConstants";
import { importanceLevel } from "./newsFunctions";

// ── Interfaces ─────────────────────────────────────────────────────────────
interface HeroSlideProps {
  article: Article & { score?: number };
}

interface HeroCarouselProps {
  articles: Array<Article & { score?: number }>;
}

// ── Hero Slide ─────────────────────────────────────────────────────────────
function HeroSlide({ article }: HeroSlideProps) {
  const [imgErr, setImgErr] = useState(false);
  const lvl = importanceLevel(article.score ?? 0);

  const badges = (
    <HStack spacing={2} flexWrap="wrap">
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
        <Text fontSize="10px" color="whiteAlpha.400" fontFamily="heading">
          {timeAgo(article.date)} atrás
        </Text>
      )}
    </HStack>
  );

  return (
    <Box h="100%">
      {/* ── Mobile: imagem full-cover + texto sobreposto ── */}
      <Flex display={{ base: "flex", md: "none" }} direction="column" justify="flex-end"
        h="100%" position="relative" overflow="hidden">
        {article.img && !imgErr
          ? <img src={article.img} alt="" onError={() => setImgErr(true)}
              className="nws-hero-img"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <Box position="absolute" inset={0} bg="#0d0d0d" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="6xl" style={{ animation: "nwsGlitch 3s ease infinite" }}>🤖</Text>
            </Box>
        }
        <Box position="absolute" inset={0}
          background="linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.15) 100%)" />
        <Box position="absolute" inset={0} pointerEvents="none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(66,201,32,0.018) 3px,rgba(66,201,32,0.018) 4px)" }} />
        <Flex direction="column" position="relative" zIndex={1} px={5} pb={5} pt={4} gap={2}>
          <div className="nws-hero-badge">{badges}</div>
          <div className="nws-hero-title">
            <Link href={article.link} isExternal _hover={{ textDecoration: "none" }}>
              <Text fontSize="lg" fontWeight="900" color="white" fontFamily="heading" lineHeight="1.25"
                _hover={{ color: GREEN }} transition="color .2s"
                style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {article.title}
              </Text>
            </Link>
          </div>
          <div className="nws-hero-btn">
            <Link href={article.link} isExternal _hover={{ textDecoration: "none" }} display="inline-flex">
              <Box display="flex" alignItems="center" gap={2}
                px={4} py="6px" borderRadius="full" bg={GREEN} color="#000"
                fontFamily="heading" fontSize="xs" fontWeight="700"
                _hover={{ bg: "white" }} transition="all .2s"
                style={{ boxShadow: `0 0 16px ${GREEN}66` }}>
                Saiba mais <Icon as={BsArrowRight} boxSize="11px" />
              </Box>
            </Link>
          </div>
        </Flex>
      </Flex>

      {/* ── Desktop: grid 2 colunas ── */}
      <Grid display={{ base: "none", md: "grid" }} templateColumns="1fr 1fr" h="100%">
        <Flex direction="column" justify="center" px={10} py={10}
          borderRight="1px solid rgba(255,255,255,0.06)">
          <div className="nws-hero-badge">
            <HStack mb={3} spacing={2} flexWrap="wrap">{badges.props.children}</HStack>
          </div>
          <div className="nws-hero-title">
            <Link href={article.link} isExternal _hover={{ textDecoration: "none" }}>
              <Text fontSize={{ md: "2xl", lg: "3xl" }} fontWeight="900" color="white" fontFamily="heading"
                lineHeight="1.2" _hover={{ color: GREEN }} transition="color .2s" mb={4}
                style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {article.title}
              </Text>
            </Link>
          </div>
          {article.desc && (
            <div className="nws-hero-desc">
              <Text fontSize="sm" color="whiteAlpha.600" fontFamily="heading" lineHeight="1.7" mb={5} noOfLines={2}>
                {article.desc}
              </Text>
            </div>
          )}
          <div className="nws-hero-btn">
            <Link href={article.link} isExternal _hover={{ textDecoration: "none" }} display="inline-flex" alignSelf="flex-start">
              <Box display="flex" alignItems="center" gap={2}
                px={4} py={2} borderRadius="full" bg={GREEN} color="#000"
                fontFamily="heading" fontSize="xs" fontWeight="700"
                _hover={{ bg: "white", transform: "translateY(-1px)" }} transition="all .2s"
                style={{ boxShadow: `0 0 20px ${GREEN}66` }}>
                Saiba mais <Icon as={BsArrowRight} boxSize="12px" />
              </Box>
            </Link>
          </div>
        </Flex>
        <Box position="relative" overflow="hidden" bg="#111">
          {article.img && !imgErr
            ? <img src={article.img} alt="" className="nws-hero-img" onError={() => setImgErr(true)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            : <Flex h="100%" align="center" justify="center" bg="#0d0d0d">
                <Text fontSize="6xl" style={{ animation: "nwsGlitch 3s ease infinite" }}>🤖</Text>
              </Flex>
          }
          <Box position="absolute" inset={0}
            background="linear-gradient(to right, #0a0a0a 0%, transparent 28%)" />
          <Box position="absolute" inset={0} pointerEvents="none"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(66,201,32,0.018) 3px,rgba(66,201,32,0.018) 4px)" }} />
        </Box>
      </Grid>
    </Box>
  );
}

// ── Hero Carousel ──────────────────────────────────────────────────────────
function HeroCarousel({ articles }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const total = articles.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % total), SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused, total]);

  const go = useCallback((dir: number) => {
    setCurrent(c => (c + dir + total) % total);
  }, [total]);

  if (!total) return null;

  return (
    <Box bg="#0a0a0a" borderBottom="1px solid rgba(255,255,255,0.07)"
      position="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>

      {/* Slides stack */}
      <Box position="relative" minH={{ base: "300px", md: "420px" }}>
        {articles.map((article, i) => (
          <Box key={article.link} className="nws-carousel-slide"
            opacity={current === i ? 1 : 0}
            zIndex={current === i ? 1 : 0}
            pointerEvents={current === i ? "auto" : "none"}
            top={0} left={0} right={0} bottom={0}>
            <HeroSlide article={article} />
          </Box>
        ))}

        {/* Arrow left */}
        {total > 1 && (
          <Box as="button" onClick={() => go(-1)}
            position="absolute" left={{ base: 2, md: 4 }} top="50%" transform="translateY(-50%)" zIndex={10}
            w={{ base: "32px", md: "40px" }} h={{ base: "32px", md: "40px" }}
            display="flex" alignItems="center" justifyContent="center"
            bg="rgba(0,0,0,0.75)" border={`1px solid ${GREEN}55`} borderRadius="full"
            color={GREEN} _hover={{ bg: GREEN, color: "#000", borderColor: GREEN }}
            transition="all .2s"
            style={{ boxShadow: `0 0 12px ${GREEN}44` }}>
            <Icon as={BsChevronLeft} boxSize="14px" />
          </Box>
        )}

        {/* Arrow right */}
        {total > 1 && (
          <Box as="button" onClick={() => go(1)}
            position="absolute" right={{ base: 2, md: 4 }} top="50%" transform="translateY(-50%)" zIndex={10}
            w={{ base: "32px", md: "40px" }} h={{ base: "32px", md: "40px" }}
            display="flex" alignItems="center" justifyContent="center"
            bg="rgba(0,0,0,0.75)" border={`1px solid ${GREEN}55`} borderRadius="full"
            color={GREEN} _hover={{ bg: GREEN, color: "#000", borderColor: GREEN }}
            transition="all .2s"
            style={{ boxShadow: `0 0 12px ${GREEN}44` }}>
            <Icon as={BsChevronRight} boxSize="14px" />
          </Box>
        )}
      </Box>

      {/* Progress bar */}
      <Box h="2px" bg="rgba(255,255,255,0.07)" position="relative" overflow="hidden">
        <Box key={`${current}-prog`} position="absolute" left={0} top={0} h="100%"
          bg={GREEN} style={{
            animation: paused ? "none" : `nwsProgress ${SLIDE_INTERVAL}ms linear forwards`,
            boxShadow: `0 0 8px ${GREEN}`,
          }} />
      </Box>

      {/* Dot indicators */}
      {total > 1 && (
        <Flex justify="center" gap={2} py={3}>
          {articles.map((_, i) => (
            <Box key={i} as="button" onClick={() => setCurrent(i)}
              w={current === i ? "20px" : "6px"} h="6px" borderRadius="full"
              bg={current === i ? GREEN : "rgba(255,255,255,0.25)"}
              transition="all .3s ease"
              style={current === i ? { boxShadow: `0 0 8px ${GREEN}` } : {}}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}

export { HeroSlide, HeroCarousel };
export default HeroCarousel;
