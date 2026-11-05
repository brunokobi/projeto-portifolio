import React from "react";
import { Box, HStack, Icon, Text, Tooltip, type BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { linkMotion } from "../animationsConfig";
import falar from "../../TextAudio";
import { isActivePath } from "../isActivePath";

const GREEN = "#42c920";

interface ItemProps {
  label: string;
  icon: React.ElementType;
  url?: string;
  onClick?: () => void;
}

const Item = ({ label, icon, url, onClick }: ItemProps) => {
  const { pathname } = useLocation();
  const isActive = isActivePath(pathname, url);
  const isExternal = Boolean(url?.startsWith("http"));

  const style: BoxProps = {
    "aria-label": label,
    "aria-current": isActive ? "page" : undefined,
    onMouseEnter: () => falar(label),
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    px: { base: 1, md: 3 },
    py: 2,
    rounded: "full",
    cursor: "pointer",
    color: isActive ? GREEN : "whiteAlpha.700",
    bg: isActive ? "rgba(66, 201, 32, 0.12)" : "transparent",
    border: "1px solid",
    borderColor: isActive ? "rgba(66, 201, 32, 0.5)" : "transparent",
    transition: "color 0.2s, background 0.2s",
    _hover: { color: GREEN },
    _focusVisible: { outline: `2px solid ${GREEN}`, outlineOffset: "2px" },
  };

  const content = (
    <HStack as={motion.span} spacing={2} initial="rest" whileHover="hover" animate="rest" variants={linkMotion}>
      <Icon as={icon} fontSize={{ base: 20, md: 22 }} />
      {isActive && (
        <Text as="span" fontFamily="heading" fontSize="sm" whiteSpace="nowrap" display={{ base: "none", md: "inline" }}>
          {label}
        </Text>
      )}
    </HStack>
  );

  return (
    <Tooltip
      label={isExternal ? `${label} ↗` : label}
      placement="top"
      hasArrow
      openDelay={150}
      bg="black"
      color={GREEN}
      border={`1px solid ${GREEN}`}
      fontFamily="mono"
      fontSize="xs"
      zIndex={1000000}
    >
      {onClick ? (
        <Box as="button" type="button" onClick={onClick} {...style}>
          {content}
        </Box>
      ) : isExternal ? (
        <Box as="a" href={url} target="_blank" rel="noopener noreferrer" {...style}>
          {content}
        </Box>
      ) : (
        <Box as={Link} to={url ?? "/"} state={{ prevPath: pathname }} {...style}>
          {content}
        </Box>
      )}
    </Tooltip>
  );
};

export default Item;
