import React, { useState } from "react";
import { PointAddNew } from "../../components/Map/pointAddNew.jsx";
import { PointAdd } from "../../components/Map/pointAdd";

import {
  FormControl,
  Stack,
  Input,
  Button,
  Heading,
  Box,
  Image, 
} from "@chakra-ui/react";
import AnimatedStars from "../../components/AnimatedStars";
import esri from "../../assets/img/esri.png";
import falar from "../../components//TextAudio";
import {FaSearch,FaTrash} from "react-icons/fa";
import {Flex} from "@chakra-ui/react";
import { motion } from "framer-motion"; // Biblioteca para animações avançadas
import {useRef } from "react";




const locations = [
  {
    name: "Torre Eiffel",
    lat: 48.8584,
    lng: 2.2945,
    desc: "A Torre Eiffel é uma torre treliça de ferro do século XIX localizada no Champ de Mars, em Paris, que se tornou um ícone mundial da França. A torre, que é o edifício mais alto de Paris, é o monumento pago mais visitado do mundo, com milhões de pessoas subindo a torre a cada ano. Nomeada em homenagem ao seu projetista, o engenheiro Gustave Eiffel, foi construída como o arco de entrada da Exposição Universal de 1889.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg"
  },
  {
    name: "Estatua da Liberdade",
    lat: 40.6892,
    lng: -74.0445,
    desc: "A Estátua da Liberdade é um grande monumento neoclássico localizado na ilha da Liberdade, na foz do rio Hudson, no Oceano Atlântico, na cidade de Nova York, nos Estados Unidos. A estátua, projetada pelo escultor francês Frédéric Auguste Bartholdi, é um presente da França aos Estados Unidos em reconhecimento à amizade estabelecida entre os dois países durante a Revolução Americana.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.pGtOXR35MxtSXfUw1TUgcAHaFj%26pid%3DApi&f=1&ipt=ca48e3cd54e01d46835bdfdb89ee73649899b53ea34fb999420f4e8e25fedf56&ipo=images"
  },
  {
    name: "Taj Mahal",
    lat: 27.1751,
    lng: 78.0421,
    desc: "O Taj Mahal é um mausoléu de mármore branco localizado na cidade indiana de Agra. Foi encomendado em 1632 pelo imperador Mughal Shah Jahan para abrigar o túmulo de sua esposa favorita, Mumtaz Mahal; também abriga o túmulo de Shah Jahan. O Taj Mahal é o monumento mais conhecido da Índia e um dos mais famosos do mundo.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg"
  },
  {
    name: "Coliseu de Roma",
    lat: 41.8902,
    lng: 12.4922,
    desc: "O Coliseu ou Anfiteatro Flaviano é um anfiteatro oval localizado no centro da cidade de Roma, capital da Itália. Construído com concreto e areia, é o maior anfiteatro já construído e está situado a leste do Fórum Romano. É considerado uma das maiores obras da arquitetura e engenharia romanas.",
    img: "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F1.bp.blogspot.com%2F-2UOdNE7_4Yo%2FUQvWIm7inyI%2FAAAAAAAAZEU%2FlLRwdD60b3I%2Fs1600%2FColiseo%2Bde%2BRoma.jpg&f=1&nofb=1&ipt=5365e7a2557a4a738e95d1a72766c3732612a67e4aacebdea54d44bfd6b31077&ipo=images"
  },
  {
    name: "Pirâmides do Egito",
    lat: 29.9792,
    lng: 31.1342,
    desc: "As pirâmides do Egito são estruturas monumentais construídas durante o Antigo Império do Egito Antigo para abrigar os corpos dos faraós egípcios, que eram considerados deuses na Terra. As pirâmides eram construídas de acordo com o projeto de uma câmara mortuária, onde o corpo do faraó seria colocado, e uma câmara de culto, onde os rituais de adoração seriam realizados.",
    img: "https://static.todamateria.com.br/upload/pi/ra/piramidesdoegito-cke.jpg"
  },
  {
    name: "Monte Fuji",
    lat: 35.3606,
    lng: 138.7278,
    desc: "O Monte Fuji é um vulcão ativo que entrou em erupção pela última vez em 1707. Localizado na ilha de Honshū, é o ponto mais alto do Japão, com 3.776,24 metros. É também um dos vulcões mais conhecidos do mundo e um símbolo do Japão, sendo frequentemente retratado em obras de arte e fotografias, bem como visitado por turistas e alpinistas.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F23%2F36%2Fe2%2F2336e29eea04332945235eb55b57b2ff.jpg&f=1&nofb=1&ipt=251dec98878051f394177348c053f2b8886394d3368f71f6ebb5ac36bb7cb9f7&ipo=images"
  },
  {
    name: "Buda Ibiraçu",
    lat: -19.86565,
    lng: -40.38246,
    desc: "O Buda de Ibiraçu é uma estátua de Buda localizada no município de Ibiraçu, no estado brasileiro do Espírito Santo. Com 38 metros de altura, é a segunda maior estátua de Buda no Ocidente, atrás apenas do Buda da Felicidade, em Cotia, São Paulo. A estátua foi inaugurada em 2012, após 10 anos de construção.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.meionorte.com%2Fuploads%2Fimagens%2F2021%2F8%2F29%2Festatua-de-buda-inaugurada-no-brasil-e-a-segunda-maior-do-mundo-491b34ed-1ac9-4e07-a3e8-4bfc4181d0d2.jpg&f=1&nofb=1&ipt=809358137426ec61d5a2450c6b03678430d5a8b8408cc5c94c98a92da0737688&ipo=images"
  },
  {
    name: "Cristo Redentor",
    lat: -22.9519,
    lng: -43.2105,
    desc: "O Cristo Redentor é uma estátua art déco que retrata Jesus Cristo, localizada no topo do morro do Corcovado, a 709 metros acima do nível do mar, no Parque Nacional da Tijuca, com vista para a maior parte da cidade do Rio de Janeiro, Brasil. Uma símbolo do cristianismo em todo o mundo, a estátua se tornou um ícone cultural do Rio e do Brasil.",
    img: "https://rederiohoteis.com/wp-content/uploads/2017/09/2017-10-29-cristo-redentor-conheca-a-historia-dessa-maravilha-do-mundo-moderno2.jpg.webp"
  },
  {
    name: "Monte Everest",
    lat: 27.9881,
    lng: 86.9250,
    desc: "O Monte Everest é a montanha mais alta do mundo acima do nível do mar, com 8.848 metros de altura. Está localizado na cordilheira do Himalaia, na fronteira entre o Nepal e o Tibete, China. O seu pico está a 8.848 metros acima do nível do mar, sendo reconhecido como a montanha mais alta do mundo.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.factinate.com%2Fwp-content%2Fuploads%2F2018%2F01%2F17-37.jpg&f=1&nofb=1&ipt=11c451c54cc677cb172768f6b7a14bce36ff6f4f5c852a9d64d3b61d895fe293&ipo=images"
  },
  {
    name: "Machu Picchu",
    lat: -13.1631,
    lng: -72.5450,
    desc: "Machu Picchu é uma cidade inca construída no século XV, no topo de uma montanha, no vale do rio Urubamba, atual Peru. Foi construída em torno de 1450, sob as ordens de Pachacuti. O local é considerado Patrimônio Mundial da UNESCO desde 1983 e foi eleito em 2007 como uma das Novas Sete Maravilhas do Mundo Moderno.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.Xafpds6a0ICK6THxncjFUAHaE8%26pid%3DApi&f=1&ipt=a26e1134f59d690e75fa8d1cf3a339b634e05e7413c34465402488f3cb0da41e&ipo=images"
  },
  {
    name: "Pirâmide Azteca",
    lat: 19.6926,
    lng: -98.8456,
    desc: "Teotihuacán, foi um centro urbano da Mesoamérica pré-colombiana localizada na Bacia do México, 48 quilómetros a nordeste da atual Cidade do México, e que hoje é conhecida como o local de muitas das pirâmides mesoamericanas arquitetonicamente mais significativas construídas na América pré-colombiana. Além dos edifícios piramidais, Teotihuacan também é antropologicamente significativa por seus complexos residenciais multifamiliares, pela Avenida dos Mortos e por seus vibrantes murais que foram excepcionalmente bem preservados. Além disso, Teotihuacan exportou um estilo de cerâmica e finas ferramentas de obsidiana que conquistaram grande prestígio e utilização generalizada em toda a Mesoamérica.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvoyance-du-destin.fr%2Fwp-content%2Fuploads%2F2020%2F02%2F8-3.jpg&f=1&nofb=1&ipt=bcbbfcb4caf0a4bd443171a4a86cc62e1ab587bafb57540019876471c17fffec&ipo=images"
  },
  {
    name: "Convento da Penha",
    lat: -20.329444,
    lng: -40.287222,
    desc: "O Convento de Nossa Senhora da Penha é um convento católico localizado no município de Vila Velha, no estado brasileiro do Espírito Santo. Foi construído no século XVI, no alto de um penhasco, a 154 metros de altitude, sendo um dos principais pontos turísticos do estado.",
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.WRrcSaaxSQ5dYFt3sKQJIQHaE6%26pid%3DApi&f=1&ipt=fda12a240552e4dd4e0d47b133ee9e8d25f43ef71d50b3b8e94d38ae71f77978&ipo=images"
  }
];

function Mapa() {
  const [latitudei, setLatitudei] = useState("");
  const [longitudei, setLongitudei] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const wrapperRef = useRef(null); // Referência para o container principal

  

  const handleSubmit = (e) => {
    e.preventDefault();
   setLatitude(latitudei);
    setLongitude(longitudei);
  };


  return (
    <Box
    as={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
     <Flex
             gap={5}
             h="100vh"
             w="100%"
             align="center"
             overflowY="auto"
             py={24}
             overflowX="hidden"
             flexDirection="column"
             position="relative"
             scrollBehavior="smooth"
             ref={wrapperRef}
             css={{
               "&::-webkit-scrollbar": {
                 width: "5px", // Customização da barra de rolagem
                 height: "10px",
               },
               "&::-webkit-scrollbar-track": {
                 width: "6px",
               },
               "&::-webkit-scrollbar-thumb": {
                 background: "#42c920",
                 borderRadius: "24px",
               },
             }}
           >
    <Stack w={{ base: "90%", md: "100%", lg: "100%", sm: "100%" }}
      spacing={4} // Espaçamento entre os elementos dentro do Stack
      align="center" // Centraliza horizontalmente os elementos no Stack
      justify="center" // Centraliza verticalmente os elementos no Stack
      direction="column" // Alinha os elementos em uma coluna (verticalmente)
      
    >
    <Box maxW="lg" borderWidth="1px" borderRadius="lg" m={4}  borderColor = {"#42c920"} overflow="visible" mt={2}>
<form onSubmit={handleSubmit} className="flex flex-col items-center">

  <FormControl>
   
    <Stack  direction="row"m={2}  align="center" // Centraliza horizontalmente os elementos no Stack
      justify="center" // Centraliza verticalmente os elementos no Stack>
      position={"relative"}
      >
    <Heading color={"#42c920"} as="h2" size="lg" my={2} >  
      Mapa React ESRI   
      </Heading>   
      <Image src={esri} w={12} margin={"1"} />
      </Stack>
   
  <Stack spacing={4} direction="row"m={4}>
 
  <Input htmlSize={20} width="auto" 
   type="text"
   value={latitudei }
   onChange={(e) => setLatitudei(e.target.value)}
   color={"#42c920"}  
    placeholder="Latitude"
    _placeholder={{ color: "inherit" }}
    borderColor = {"#42c920"}
    />
  
  <Input htmlSize={20} width="auto"
  type="text"
  value={longitudei}
  onChange={(e) => setLongitudei(e.target.value)}
  color={"#42c920"} 
  placeholder="Longitude"
  _placeholder={{ color: "inherit" }} 
  borderColor = {"#42c920"}
  />
  <Button  width="auto" color={"#000"} backgroundColor={"#42c920"} type="submit" 
  onMouseOver={() => falar("Localizar")}
  >
  <FaSearch size={30} title="Localizar" />
  </Button>
 
  <Button  width="auto" color={"#000"} backgroundColor={"red"} 
  onClick={() => { 
    setLatitudei("");
     setLongitudei(""); 
     setLatitude(""); 
     setLongitude("");
     setNome("");
     setDescricao("");
      falar("Limpando campos");
     }} 
  onMouseOver={() => falar("Limpar")}
  >
    <FaTrash size={30}  title="Limpar"/>
  </Button>
  </Stack>
  <Flex wrap="wrap" justify="center" gap={2} mt={2} mb={4}>
  {locations.map((loc, index) => (
    <button
      key={index}
      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
      onClick={() => {
        setLatitudei(loc.lat);
        setLongitudei(loc.lng);
        setNome(loc.name);
        setDescricao(loc.desc);
        falar(loc.desc);
      }}
    >
      <Image
        src={loc.img}
        w={8} h={8} margin={"1"} borderRadius="full" title={loc.name}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(2)";
          falar(loc.name);
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)"; // Retornar à escala original
        }}
        transition="transform 0.2s ease-in-out"
      />
    </button>
  ))}
</Flex>
</FormControl>
  
 
</form>
</Box>  
{/* <Box maxW="100%" borderWidth="1px"  borderRadius="lg" m={2}
backgroundColor={"#42c920"}
borderColor = {"#42c920"} 
overflow="hidden">   */}



     
    {/* </Box> */}
   
        <AnimatedStars />
       

        <Box w={"90%"} h={"100%"} mt={5}        
        overflow={"auto"}
        style={{"-webkit-overflow-scrolling": "touch", "scrollbar-width": "none", "msOverflowStyle": "none"}}
        >
        {latitude !== "" && longitude !== "" ? (
            <PointAdd
              name={nome||"Novo Ponto"}
              description={descricao||"Ponto adicionado pelo usuário"}
              latitude={latitude}
              longitude={longitude}
              zoom={16}
              duration={6000}
            />
          ) : (
            <PointAddNew />
        )}
        </Box>
</Stack>
</Flex>

</Box>

 
  );
}

export default Mapa;
