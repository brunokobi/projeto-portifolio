import { Box, Heading, Text, UnorderedList, OrderedList, ListItem } from "@chakra-ui/react";
import { Fragment, type ReactNode } from "react";
import type { Block } from "./posts";

// Parser "markdown-lite" só pra **negrito**, `código inline` e *itálico* —
// suficiente pro conteúdo dos posts, sem trazer uma lib de markdown pra isso.
const INLINE_TOKEN = /\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_TOKEN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    const [, bold, code, italic] = match;
    if (bold !== undefined) {
      nodes.push(
        <Text as="b" color="#42c920" key={key++}>
          {bold}
        </Text>
      );
    } else if (code !== undefined) {
      nodes.push(
        <Text
          as="code"
          key={key++}
          fontFamily="monospace"
          bg="rgba(66,201,32,0.12)"
          color="#7dffa0"
          px="4px"
          borderRadius="3px"
          fontSize="0.9em"
        >
          {code}
        </Text>
      );
    } else if (italic !== undefined) {
      nodes.push(
        <Text as="i" key={key++}>
          {italic}
        </Text>
      );
    }
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const PostRenderer = ({ blocks }: { blocks: Block[] }) => (
  <Fragment>
    {blocks.map((block, i) => {
      switch (block.type) {
        case "heading":
          return (
            <Heading
              key={i}
              as={block.level === 2 ? "h2" : "h3"}
              fontSize={block.level === 2 ? { base: "lg", md: "xl" } : "md"}
              color="#42c920"
              textShadow="0 0 8px rgba(66,201,32,0.5)"
              mt={8}
              mb={3}
            >
              {block.text}
            </Heading>
          );
        case "paragraph":
          return (
            <Text key={i} fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" mb={4} color="whiteAlpha.900">
              {renderInline(block.text)}
            </Text>
          );
        case "list": {
          const ListTag = block.ordered ? OrderedList : UnorderedList;
          return (
            <ListTag key={i} spacing={2} mb={4} pl={4} fontSize={{ base: "sm", md: "md" }} color="whiteAlpha.900">
              {block.items.map((item, j) => (
                <ListItem key={j} lineHeight="1.7">
                  {renderInline(item)}
                </ListItem>
              ))}
            </ListTag>
          );
        }
        case "code":
          return (
            <Box
              key={i}
              as="pre"
              overflowX="auto"
              bg="rgba(0,20,5,0.6)"
              border="1px solid rgba(66,201,32,0.25)"
              borderRadius="8px"
              p={4}
              mb={4}
              fontSize={{ base: "xs", md: "sm" }}
              fontFamily="monospace"
              color="#b6ffcf"
              boxShadow="inset 0 0 20px rgba(66,201,32,0.05)"
            >
              <code>{block.code}</code>
            </Box>
          );
        case "hr":
          return <Box key={i} h="1px" bg="rgba(66,201,32,0.25)" my={8} />;
        default:
          return null;
      }
    })}
  </Fragment>
);

export default PostRenderer;
