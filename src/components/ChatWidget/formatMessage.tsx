import { Fragment, type ReactNode } from 'react';
import { Box, Code, Link, ListItem, OrderedList, Text, UnorderedList } from '@chakra-ui/react';

const GREEN = '#42c920';
const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|https?:\/\/[^\s)]+)/g;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <Text as="strong" key={i} color="white">{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <Text as="em" key={i}>{part.slice(1, -1)}</Text>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <Code key={i} fontSize="0.85em" bg="rgba(66, 201, 32, 0.12)" color={GREEN}>{part.slice(1, -1)}</Code>;
    }
    if (/^https?:\/\//.test(part)) {
      const url = part.replace(/[.,;:!?]+$/, '');
      const trailing = part.slice(url.length);
      return (
        <Fragment key={i}>
          <Link href={url} isExternal color={GREEN} textDecoration="underline" wordBreak="break-all">{url}</Link>
          {trailing}
        </Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

type Block = { kind: 'p'; lines: string[] } | { kind: 'ul' | 'ol'; items: string[] };

function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    const bullet = line.match(BULLET);
    const numbered = bullet ? null : line.match(NUMBERED);
    const last = blocks[blocks.length - 1];
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      const item = (bullet ?? numbered)![1];
      if (last && last.kind === kind) last.items.push(item);
      else blocks.push({ kind, items: [item] });
    } else if (line.trim() === '') {
      if (last && last.kind === 'p' && last.lines.length > 0) blocks.push({ kind: 'p', lines: [] });
    } else if (last && last.kind === 'p') {
      last.lines.push(line.replace(/^#+\s*/, ''));
    } else {
      blocks.push({ kind: 'p', lines: [line.replace(/^#+\s*/, '')] });
    }
  }
  return blocks.filter((b) => (b.kind === 'p' ? b.lines.length > 0 : b.items.length > 0));
}

export function formatMessage(text: string): ReactNode {
  return toBlocks(text).map((block, i) => {
    if (block.kind === 'p') {
      return (
        <Text key={i} mb={1}>
          {block.lines.map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {renderInline(line)}
            </Fragment>
          ))}
        </Text>
      );
    }
    const List = block.kind === 'ul' ? UnorderedList : OrderedList;
    return (
      <Box key={i} mb={1}>
        <List spacing={0.5} pl={1}>
          {block.items.map((item, j) => (
            <ListItem key={j}>{renderInline(item)}</ListItem>
          ))}
        </List>
      </Box>
    );
  });
}
