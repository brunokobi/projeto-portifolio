import { BreadcrumbItem, BreadcrumbLink, Stack, Text, Icon } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { linkMotion, iconMotion } from "../animationsConfig";
import { Link, useLocation } from "react-router-dom";
import falar from "../../../components/TextAudio";

const Item = ({ label, url, icon }) => {
  const navLink = useRef(null);
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (location.pathname === url) {
      return setIsActive(true);
    }
    setIsActive(false);
  }, [location.pathname, url]);

 

  return (
    <BreadcrumbItem
      as={motion.div}
      initial="rest"
      whileHover="hover"
      animate="rest"
      mx={{ base: 2, md: 4 }}
      variants={linkMotion}
    >
      {url.includes("http") ? (
        <BreadcrumbLink
          href={url}
          target="_blank"
          state={{ prevPath: location.pathname }}
          ref={navLink}
          rounded="md"
          _hover={{ color: "#42c920" }}
          style={{
            ...(isActive ? { color: "#42c920" } : ""),
          }}        
        >
          <Stack
            align="center"
            direction={{ base: "row ", md: "column" , sm: "column", lg: "row"}}
            px={{ base: 1, md: 0, sm: 0}}
          >
            <div as={motion.div} variants={iconMotion}>
              <Icon as={icon} fontSize={24} color="white.500" rounded="full" />
            </div>
            <div>
              <Text fontFamily="heading" fontSize={{ base: "sm" }}
              onMouseOver={() => falar(label)}
              >
                {label}
              </Text>
            </div>
          </Stack>
        </BreadcrumbLink>
      ) : (
        <BreadcrumbLink
          as={Link}
          to={url}
          state={{ prevPath: location.pathname }}
          ref={navLink}
          rounded="md"
          _hover={{ color: "#42c920" }}
          style={{
            ...(isActive ? { color: "#42c920" } : ""),
          }}
        >
          <Stack
            align="center"
            direction={{ base: "row ", md: "column" , sm: "column", lg: "row"}}
            px={{ base: 1, md: 5 }}
          >
            <div as={motion.div} variants={iconMotion}>
              <Icon as={icon} fontSize={24} color="white.500" rounded="full" />
            </div>
            <div>
              <Text fontFamily="heading" fontSize={{ base: "sm" }}
               onMouseOver={() => falar(label)}
              >
                {label}
              </Text>
            </div>
          </Stack>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  );
};

export default Item;
