import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FormControl,
  Input,
  Button,
  Heading,
  Box,
  Image,
  Flex,
  Text,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import { FaSearch, FaTrash, FaMapMarkerAlt } from "react-icons/fa";

import conventoImg from "../../assets/img/convento_da_penha.jpg";
import tajImg from "../../assets/img/taj_mahal.jpg";
import eiffelImg from "../../assets/img/torre_eiffel.jpg";
import { PointAddNew } from "../../components/Map/pointAddNew.jsx";
import { PointAdd } from "../../components/Map/pointAdd";
import AnimatedStars from "../../components/AnimatedStars";
import StarmanOrbit from "../../components/StarmanOrbit";
import falar from "../../components/TextAudio";

const locations = [
  {
    name: "Torre Eiffel",
    lat: 48.8584,
    lng: 2.2945,
    desc: "A Torre Eiffel é uma torre treliça de ferro do século XIX localizada no Champ de Mars, em Paris, que se tornou um ícone mundial da França. A torre, que é o edifício mais alto de Paris, é o monumento pago mais visitado do mundo, com milhões de pessoas subindo a torre a cada ano. Nomeada em homenagem ao seu projetista, o engenheiro Gustave Eiffel, foi construída como o arco de entrada da Exposição Universal de 1889.",
    img: eiffelImg,
  },
  {
    name: "Estatua da Liberdade",
    lat: 40.6892,
    lng: -74.0445,
    desc: "A Estátua da Liberdade é um grande monumento neoclássico localizado na ilha da Liberdade, na foz do rio Hudson, no Oceano Atlântico, na cidade de Nova York, nos Estados Unidos. A estátua, projetada pelo escultor francês Frédéric Auguste Bartholdi, é um presente da França aos Estados Unidos em reconhecimento à amizade estabelecida entre os dois países durante a Revolução Americana.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.pGtOXR35MxtSXfUw1TUgcAHaFj%26pid%3DApi&f=1&ipt=ca48e3cd54e01d46835bdfdb89ee73649899b53ea34fb999420f4e8e25fedf56&ipo=images",
  },
  {
    name: "Taj Mahal",
    lat: 27.1751,
    lng: 78.0421,
    desc: "O Taj Mahal é um mausoléu de mármore branco localizado na cidade indiana de Agra. Foi encomendado em 1632 pelo imperador Mughal Shah Jahan para abrigar o túmulo de sua esposa favorita, Mumtaz Mahal; também abriga o túmulo de Shah Jahan. O Taj Mahal é o monumento mais conhecido da Índia e um dos mais famosos do mundo.",
    img: tajImg,
  },
  {
    name: "Coliseu de Roma",
    lat: 41.8902,
    lng: 12.4922,
    desc: "O Coliseu ou Anfiteatro Flaviano é um anfiteatro oval localizado no centro da cidade de Roma, capital da Itália. Construído com concreto e areia, é o maior anfiteatro já construído e está situado a leste do Fórum Romano. É considerado uma das maiores obras da arquitetura e engenharia romanas.",
    img: "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F1.bp.blogspot.com%2F-2UOdNE7_4Yo%2FUQvWIm7inyI%2FAAAAAAAAZEU%2FlLRwdD60b3I%2Fs1600%2FColiseo%2Bde%2BRoma.jpg&f=1&nofb=1&ipt=5365e7a2557a4a738e95d1a72766c3732612a67e4aacebdea54d44bfd6b31077&ipo=images",
  },
  {
    name: "Pirâmides do Egito",
    lat: 29.9792,
    lng: 31.1342,
    desc: "As pirâmides do Egito são estruturas monumentais construídas durante o Antigo Império do Egito Antigo para abrigar os corpos dos faraós egípcios, que eram considerados deuses na Terra. As pirâmides eram construídas de acordo com o projeto de uma câmara mortuária, onde o corpo do faraó seria colocado, e uma câmara de culto, onde os rituais de adoração seriam realizados.",
    img: "https://static.todamateria.com.br/upload/pi/ra/piramidesdoegito-cke.jpg",
  },
  {
    name: "Monte Fuji",
    lat: 35.3606,
    lng: 138.7278,
    desc: "O Monte Fuji é um vulcão ativo que entrou em erupção pela última vez em 1707. Localizado na ilha de Honshū, é o ponto mais alto do Japão, com 3.776,24 metros. É também um dos vulcões mais conhecidos do mundo e um símbolo do Japão, sendo frequentemente retratado em obras de arte e fotografias, bem como visitado por turistas e alpinistas.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F23%2F36%2Fe2%2F2336e29eea04332945235eb55b57b2ff.jpg&f=1&nofb=1&ipt=251dec98878051f394177348c053f2b8886394d3368f71f6ebb5ac36bb7cb9f7&ipo=images",
  },
  {
    name: "Buda Ibiraçu",
    lat: -19.86565,
    lng: -40.38246,
    desc: "O Buda de Ibiraçu é uma estátua de Buda localizada no município de Ibiraçu, no estado brasileiro do Espírito Santo. Com 38 metros de altura, é a segunda maior estátua de Buda no Ocidente, atrás apenas do Buda da Felicidade, em Cotia, São Paulo. A estátua foi inaugurada em 2012, após 10 anos de construção.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.meionorte.com%2Fuploads%2Fimagens%2F2021%2F8%2F29%2Festatua-de-buda-inaugurada-no-brasil-e-a-segunda-maior-do-mundo-491b34ed-1ac9-4e07-a3e8-4bfc4181d0d2.jpg&f=1&nofb=1&ipt=809358137426ec61d5a2450c6b03678430d5a8b8408cc5c94c98a92da0737688&ipo=images",
  },
  {
    name: "Cristo Redentor",
    lat: -22.9519,
    lng: -43.2105,
    desc: "O Cristo Redentor é uma estátua art déco que retrata Jesus Cristo, localizada no topo do morro do Corcovado, a 709 metros acima do nível do mar, no Parque Nacional da Tijuca, com vista para a maior parte da cidade do Rio de Janeiro, Brasil. Uma símbolo do cristianismo em todo o mundo, a estátua se tornou um ícone cultural do Rio e do Brasil.",
    img: "https://rederiohoteis.com/wp-content/uploads/2017/09/2017-10-29-cristo-redentor-conheca-a-historia-dessa-maravilha-do-mundo-moderno2.jpg.webp",
  },
  {
    name: "Monte Everest",
    lat: 27.9881,
    lng: 86.925,
    desc: "O Monte Everest é a montanha mais alta do mundo acima do nível do mar, com 8.848 metros de altura. Está localizado na cordilheira do Himalaia, na fronteira entre o Nepal e o Tibete, China. O seu pico está a 8.848 metros acima do nível do mar, sendo reconhecido como a montanha mais alta do mundo.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.factinate.com%2Fwp-content%2Fuploads%2F2018%2F01%2F17-37.jpg&f=1&nofb=1&ipt=11c451c54cc677cb172768f6b7a14bce36ff6f4f5c852a9d64d3b61d895fe293&ipo=images",
  },
  {
    name: "Machu Picchu",
    lat: -13.1631,
    lng: -72.545,
    desc: "Machu Picchu é uma cidade inca construída no século XV, no topo de uma montanha, no vale do rio Urubamba, atual Peru. Foi construída em torno de 1450, sob as ordens de Pachacuti. O local é considerado Patrimônio Mundial da UNESCO desde 1983 e foi eleito em 2007 como uma das Novas Sete Maravilhas do Mundo Moderno.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.Xafpds6a0ICK6THxncjFUAHaE8%26pid%3DApi&f=1&ipt=a26e1134f59d690e75fa8d1cf3a339b634e05e7413c34465402488f3cb0da41e&ipo=images",
  },
  {
    name: "Pirâmide Azteca",
    lat: 19.6926,
    lng: -98.8456,
    desc: "Teotihuacán, foi um centro urbano da Mesoamérica pré-colombiana localizada na Bacia do México, 48 quilómetros a nordeste da atual Cidade do México, e que hoje é conhecida como o local de muitas das pirâmides mesoamericanas arquitetonicamente mais significativas construídas na América pré-colombiana. Além dos edifícios piramidais, Teotihuacan também é antropologicamente significativa por seus complexos residenciais multifamiliares, pela Avenida dos Mortos e por seus vibrantes murais que foram excepcionalmente bem preservados. Além disso, Teotihuacan exportou um estilo de cerâmica e finas ferramentas de obsidiana que conquistaram grande prestígio e utilização generalizada em toda a Mesoamérica.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvoyance-du-destin.fr%2Fwp-content%2Fuploads%2F2020%2F02%2F8-3.jpg&f=1&nofb=1&ipt=bcbbfcb4caf0a4bd443171a4a86cc62e1ab587bafb57540019876471c17fffec&ipo=images",
  },
  {
    name: "Convento da Penha",
    lat: -20.329444,
    lng: -40.287222,
    desc: "O Convento de Nossa Senhora da Penha é um convento católico localizado no município de Vila Velha, no estado brasileiro do Espírito Santo. Foi construído no século XVI, no alto de um penhasco, a 154 metros de altitude, sendo um dos principais pontos turísticos do estado.",
    img: conventoImg,
  },
  {
    name: "Stonehenge",
    lat: 51.1789,
    lng: -1.8262,
    desc: "Stonehenge é um monumento pré-histórico localizado na planície de Salisbury, em Wiltshire, Inglaterra. Consiste em um anel de pedras verticais, cada uma com cerca de 4 metros de altura, 2,1 metros de largura e pesando cerca de 25 toneladas.",
    img: "https://cdn.britannica.com/17/94717-050-FE53BEC9/Sunlight-portion-stone-circle-Stonehenge-Eng-Wiltshire.jpg",
  },
  {
    name: "Área 51",
    lat: 37.2431,
    lng: -115.8111,
    desc: "A Área 51 é o nome comum de uma instalação militar da Força Aérea dos Estados Unidos altamente classificada, localizada no deserto de Nevada. O intenso sigilo que envolve a base a tornou o assunto frequente de teorias da conspiração e folclore sobre objetos voadores não identificados (OVNIs) e vida alienígena.",
    img: "https://conteudo.imguol.com.br/c/entretenimento/78/2022/04/08/area-51-nos-estados-unidos-1649464019179_v2_1x1.jpg",
  },
  {
    name: "Wycliffe Well",
    lat: -20.7816,
    lng: 134.2366,
    desc: "Wycliffe Well é uma localidade no Território do Norte, na Austrália, mundialmente famosa por ser considerada a 'Capital dos OVNIs' do país. Relatos de avistamentos de objetos voadores não identificados são frequentes na região desde a Segunda Guerra Mundial.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThPOdMLsYrnUr4QdtyY7erLC2WE02s2WT97g&s",
  },
];

function Mapa() {
  const [latitudei, setLatitudei] = useState<number | string>("");
  const [longitudei, setLongitudei] = useState<number | string>("");
  const [latitude, setLatitude] = useState<number | string>("");
  const [longitude, setLongitude] = useState<number | string>("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLatitude(latitudei);
    setLongitude(longitudei);
  };

  const handleClear = () => {
    setLatitudei("");
    setLongitudei("");
    setLatitude("");
    setLongitude("");
    setNome("");
    setDescricao("");
    falar("Limpando campos");
  };

  return (
    <Flex
      w="100vw"
      h="100vh"
      align="center"
      justify="center"
      position="relative"
      bg="#050810" // Fundo global escuro
      overflow="hidden"
    >
      <AnimatedStars />
      <StarmanOrbit />

      {/* Main Container UI */}
      <Box
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        w={{ base: "95vw", lg: "85vw", xl: "75vw" }}
        h="85vh"
        bg="#0F172A" // Cor da interface (slate-900)
        borderRadius="xl"
        border="1px solid #42c920"
        zIndex={10}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        boxShadow="0px 0px 30px rgba(66, 201, 32, 0.15)"
      >
        {/* Header Bar */}
        <Flex
          w="100%"
          h="60px"
          align="center"
          justify="center"
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          position="relative"
          bg="#0B1120"
        >
          <Flex align="center" gap={2} color="#42c920">
            <FaMapMarkerAlt size={20} />
            <Heading as="h1" size="md" fontWeight="600">
              Mapa Global (Satélite) ESRI
            </Heading>
          </Flex>
        </Flex>

        {/* Content Area (Sidebar + Map) */}
        <Flex flex="1" overflow="hidden" flexDirection={{ base: "column", md: "row" }}>
          {/* SIDEBAR LEFT */}
          <Box
            w={{ base: "100%", md: "380px" }}
            h="100%"
            borderRight={{ base: "none", md: "1px solid" }}
            borderColor="whiteAlpha.200"
            bg="#0F172A"
            p={5}
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#42c920", borderRadius: "10px" },
            }}
          >
            {/* Box Inserir Coordenadas */}
            <Box borderWidth="1px" borderColor="#2D3748" borderRadius="md" p={4} mb={6}>
              <Text
                color="#42c920"
                fontSize="sm"
                fontWeight="bold"
                mb={3}
                textTransform="uppercase"
              >
                Inserir Coordenadas
              </Text>
              <form onSubmit={handleSubmit}>
                <FormControl>
                  <Flex gap={3} mb={3}>
                    <Input
                      type="text"
                      value={latitudei}
                      onChange={(e) => setLatitudei(e.target.value)}
                      placeholder="Latitude"
                      color="#42c920"
                      borderColor="#42c920"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "#42c920" }}
                      focusBorderColor="#42c920"
                    />
                    <Input
                      type="text"
                      value={longitudei}
                      onChange={(e) => setLongitudei(e.target.value)}
                      placeholder="Longitude"
                      color="#42c920"
                      borderColor="#42c920"
                      _placeholder={{ color: "gray.500" }}
                      _hover={{ borderColor: "#42c920" }}
                      focusBorderColor="#42c920"
                    />
                  </Flex>
                  <Flex gap={3}>
                    <Button
                      flex="1"
                      type="submit"
                      bg="#42c920"
                      color="black"
                      _hover={{ bg: "#36a319" }}
                      leftIcon={<FaSearch />}
                      onMouseEnter={() => falar("Localizar")}
                    >
                      Localizar
                    </Button>
                    <IconButton
                      aria-label="Limpar"
                      icon={<FaTrash />}
                      bg="#E53E3E"
                      color="white"
                      _hover={{ bg: "#C53030" }}
                      onClick={handleClear}
                      onMouseEnter={() => falar("Limpar")}
                    />
                  </Flex>
                </FormControl>
              </form>
            </Box>

            {/* Grid Pontos Turísticos */}
            <Text
              color="#42c920"
              fontSize="sm"
              fontWeight="bold"
              mb={4}
              textTransform="uppercase"
              textAlign="center"
            >
              Pontos Turísticos
            </Text>
            <SimpleGrid columns={3} spacing={5}>
              {locations.map((loc, index) => (
                <Flex
                  as="button"
                  key={index}
                  direction="column"
                  align="center"
                  onClick={() => {
                    setLatitudei(loc.lat);
                    setLongitudei(loc.lng);
                    setLatitude(loc.lat);
                    setLongitude(loc.lng);
                    setNome(loc.name);
                    setDescricao(loc.desc);
                    falar(loc.desc);
                  }}
                  onMouseEnter={() => falar(loc.name)}
                  role="group"
                >
                  <Box
                    w="60px"
                    h="60px"
                    borderRadius="full"
                    border="2px solid transparent"
                    _groupHover={{ borderColor: "#42c920", transform: "scale(1.1)" }}
                    transition="all 0.2s"
                    overflow="hidden"
                    mb={2}
                  >
                    <Image src={loc.img} alt={loc.name} w="100%" h="100%" objectFit="cover" />
                  </Box>
                  <Text
                    color="gray.300"
                    fontSize="xs"
                    textAlign="center"
                    lineHeight="tight"
                    _groupHover={{ color: "white" }}
                  >
                    {loc.name}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>

          {/* RIGHT AREA: MAP */}
          <Box flex="1" position="relative" bg="#000">
            {latitude !== "" && longitude !== "" ? (
              <PointAdd
                key={`${latitude}-${longitude}`}
                name={nome || "Novo Ponto"}
                description={descricao || "Ponto adicionado pelo usuário"}
                latitude={latitude}
                longitude={longitude}
                zoom={16}
                duration={6000}
              />
            ) : (
              <PointAddNew key="globo-inicial" />
            )}

            {/* Info Overlay Box (Bottom Left) */}
            {nome && (
              <Box
                position="absolute"
                bottom={6}
                left={6}
                right={6}
                bg="rgba(0, 0, 0, 0.75)"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="lg"
                p={4}
                zIndex={20} // Acima do mapa
                boxShadow="xl"
                borderLeft="4px solid #42c920"
              >
                <Heading as="h3" size="sm" color="#42c920" mb={1}>
                  {nome}
                </Heading>
                <Text color="gray.200" fontSize="sm" noOfLines={3}>
                  {descricao}
                </Text>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}

export default Mapa;
