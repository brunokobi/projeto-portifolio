// Carrossel de certificados — extraído de index.tsx (seção "qualifications").
// Auto-contido: gerencia seu próprio índice, não recebe nem expõe props.
import { Box, Button, HStack, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import falar from "../../components/TextAudio";

import kenzie from "../../assets/img/certificadoKenzie.jpg";
import certf_1 from "../../assets/img/certificado_1.png";
import certf_2 from "../../assets/img/certificado_2.png";
import certf_3 from "../../assets/img/certificado_3.png";
import certf_4 from "../../assets/img/certificado_4.png";
import certf_5 from "../../assets/img/certificado_5.png";
import certf_9 from "../../assets/img/certificado_6.png";
import certf_10 from "../../assets/img/certificado_7.png";
import certf_8 from "../../assets/img//cert_form_mla.jpg";
import certf_6 from "../../assets/img//cert_form_qa.jpg";
import certf_7 from "../../assets/img/cert_form_npl.jpg";

const CertificateCarousel = () => {
  const intl = useIntl();
  const [certIdx, setCertIdx] = useState(0);

  // Lista de certificados
  const certifications = useMemo(() => {
    return [
      kenzie,
      certf_1,
      certf_2,
      certf_3,
      certf_4,
      certf_5,
      certf_6,
      certf_7,
      certf_8,
      certf_9,
      certf_10,
    ];
  }, []);

  return (
    <Stack
      justify="space-between"
      alignItems="center"
      w="100%"
      maxW={{ base: "350px", md: "700px" }}
      id="qualifications"
      spacing={12}
    >
      <div>
        <Heading
          fontSize={{ base: "3xl", lg: "4xl" }}
          textShadow="0px 0px 10px #42c920"
          textAlign="center"
          onMouseOver={() => falar(intl.formatMessage({ id: "quali" }))}
        >
          {intl.formatMessage({ id: "quali" })}
        </Heading>
      </div>
      <Box position="relative" w="100%" maxW="500px" mx="auto">
        <Image
          src={certifications[certIdx]}
          alt={`Certificado ${certIdx + 1}`}
          w="100%"
          borderRadius="md"
          border="1px solid"
          borderColor="whiteAlpha.200"
          loading="lazy"
        />
        <HStack position="absolute" bottom={2} left={0} right={0} justify="center" spacing={2}>
          {certifications.map((_, i) => (
            <Box
              key={i}
              as="button"
              w={certIdx === i ? "20px" : "8px"}
              h="8px"
              borderRadius="full"
              bg={certIdx === i ? "#42c920" : "whiteAlpha.400"}
              transition="all 0.2s"
              onClick={() => setCertIdx(i)}
            />
          ))}
        </HStack>
        <HStack justify="space-between" mt={2}>
          <Button
            size="sm"
            variant="ghost"
            color="#42c920"
            _hover={{ bg: "whiteAlpha.100" }}
            onClick={() => setCertIdx((i) => (i - 1 + certifications.length) % certifications.length)}
          >
            ← Anterior
          </Button>
          <Text fontSize="xs" color="whiteAlpha.600">
            {certIdx + 1} / {certifications.length}
          </Text>
          <Button
            size="sm"
            variant="ghost"
            color="#42c920"
            _hover={{ bg: "whiteAlpha.100" }}
            onClick={() => setCertIdx((i) => (i + 1) % certifications.length)}
          >
            Próximo →
          </Button>
        </HStack>
      </Box>
    </Stack>
  );
};

export default CertificateCarousel;
