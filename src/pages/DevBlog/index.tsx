import { Box, Flex, Heading, Text, Stack, Wrap, WrapItem, Badge } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BsChevronDoubleUp, BsArrowLeft } from "react-icons/bs";
import AnimatedStars from "../../components/AnimatedStars";
import { track } from "../../utils/track";
import { posts } from "./posts";
import PostRenderer from "./PostRenderer";

const GREEN = "#42c920";

const DevBlog = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = posts.find((p) => p.slug === selectedSlug) ?? null;

  useEffect(() => {
    track({ event: "pageview", page: selected ? `/blog/${selected.slug}` : "/blog" });
  }, [selected]);

  return (
    <AnimatePresence>
      <Box as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Flex
          h="100vh"
          w="100%"
          overflowY="auto"
          overflowX="hidden"
          py={24}
          px={{ base: 4, md: 0 }}
          flexDirection="column"
          align="center"
          position="relative"
          scrollBehavior="smooth"
          css={{
            "&::-webkit-scrollbar": { width: "5px", height: "10px" },
            "&::-webkit-scrollbar-track": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { background: GREEN, borderRadius: "24px" },
          }}
        >
          <Box id="top" maxW={{ base: "100%", md: "700px" }} w="100%">
            {selected ? (
              <>
                <Box
                  as="button"
                  onClick={() => setSelectedSlug(null)}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color={GREEN}
                  fontSize="sm"
                  mb={6}
                  _hover={{ opacity: 0.7 }}
                >
                  <BsArrowLeft /> voltar pros posts
                </Box>

                <Heading
                  fontSize={{ base: "2xl", md: "3xl" }}
                  color={GREEN}
                  textShadow={`0px 0px 10px ${GREEN}`}
                  mb={2}
                >
                  {selected.title}
                </Heading>
                <Text fontSize="xs" color="whiteAlpha.500" mb={4}>
                  {new Date(selected.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <Wrap mb={8}>
                  {selected.tags.map((tag) => (
                    <WrapItem key={tag}>
                      <Badge
                        bg="rgba(66,201,32,0.12)"
                        color={GREEN}
                        border="1px solid rgba(66,201,32,0.4)"
                        borderRadius="full"
                        px={3}
                        py="2px"
                        fontSize="0.65rem"
                      >
                        {tag}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>

                <PostRenderer blocks={selected.blocks} />
              </>
            ) : (
              <>
                <Heading
                  fontSize={{ base: "2xl", md: "3xl" }}
                  color={GREEN}
                  textShadow={`0px 0px 10px ${GREEN}`}
                  mb={2}
                  textAlign="center"
                >
                  Blog Dev
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.700" mb={10} textAlign="center">
                  Bastidores técnicos — o que eu construí, o que quebrou e como resolvi.
                </Text>

                <Stack spacing={5}>
                  {posts.map((post) => (
                    <Box
                      key={post.slug}
                      as="button"
                      onClick={() => setSelectedSlug(post.slug)}
                      textAlign="left"
                      bg="rgba(0,20,5,0.4)"
                      border="1px solid rgba(66,201,32,0.25)"
                      borderRadius="10px"
                      p={5}
                      transition="all 0.2s"
                      _hover={{ borderColor: GREEN, boxShadow: `0 0 16px rgba(66,201,32,0.25)` }}
                    >
                      <Text fontSize="xs" color="whiteAlpha.500" mb={1}>
                        {new Date(post.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                      <Heading fontSize={{ base: "md", md: "lg" }} color={GREEN} mb={2}>
                        {post.title}
                      </Heading>
                      <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                        {post.excerpt}
                      </Text>
                      <Wrap>
                        {post.tags.map((tag) => (
                          <WrapItem key={tag}>
                            <Badge
                              bg="rgba(66,201,32,0.12)"
                              color={GREEN}
                              border="1px solid rgba(66,201,32,0.4)"
                              borderRadius="full"
                              px={3}
                              py="2px"
                              fontSize="0.65rem"
                            >
                              {tag}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Box>

          <Box
            as="a"
            href="#top"
            position="fixed"
            bottom="70px"
            right="20px"
            zIndex={10}
            bg="black"
            border={`1px solid ${GREEN}`}
            borderRadius="full"
            p={2}
            color={GREEN}
            _hover={{ boxShadow: `0 0 10px ${GREEN}` }}
          >
            <BsChevronDoubleUp />
          </Box>
          <AnimatedStars />
        </Flex>
      </Box>
    </AnimatePresence>
  );
};

export default DevBlog;
