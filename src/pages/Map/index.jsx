import React, { useState } from 'react';
import { PointAddNew } from '../../components/Map/pointAddNew.jsx';
import { PointAdd } from '../../components/Map/pointAdd';

import {
  FormControl,
  Stack,
  Input,
  Button,
  Heading,
  Box,
  Image,
} from '@chakra-ui/react'
import AnimatedStars from "../../components/AnimatedStars";
import esri from "../../assets/img/esri.png";
import falar from "../../components//TextAudio";
import {FaSearch,FaTrash} from "react-icons/fa";




function Mapa() {
  const [latitudei, setLatitudei] = useState('');
  const [longitudei, setLongitudei] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  

  const handleSubmit = (e) => {
    e.preventDefault();
   setLatitude(latitudei);
    setLongitude(longitudei);
  };


  return (
      <>
        <Stack
      spacing={4} // Espaçamento entre os elementos dentro do Stack
      align="center" // Centraliza horizontalmente os elementos no Stack
      justify="center" // Centraliza verticalmente os elementos no Stack
      direction="column" // Alinha os elementos em uma coluna (verticalmente)
    >
    <Box maxW='lg' borderWidth='1px' borderRadius='lg' m={4}  borderColor = {'#42c920'} overflow='hidden' mt={2}
       >
<form onSubmit={handleSubmit} className="flex flex-col items-center">

  <FormControl>
   
    <Stack  direction='row'm={2}  align="center" // Centraliza horizontalmente os elementos no Stack
      justify="center" // Centraliza verticalmente os elementos no Stack>
      position={'relative'}
      >
    <Heading color={'#42c920'} as='h2' size='lg' my={2} >  
      Mapa React ESRI   
      </Heading>   
      <Image src={esri} w={12} margin={'1'} />
      </Stack>
   
  <Stack spacing={4} direction='row'm={4}>
 
  <Input htmlSize={20} width='auto' 
   type="text"
   value={latitudei }
   onChange={(e) => setLatitudei(e.target.value)}
   color={'#42c920'}  
    placeholder='Latitude'
    _placeholder={{ color: 'inherit' }}
    borderColor = {'#42c920'}
    />
  
  <Input htmlSize={20} width='auto'
  type="text"
  value={longitudei}
  onChange={(e) => setLongitudei(e.target.value)}
  color={'#42c920'} 
  placeholder='Longitude'
  _placeholder={{ color: 'inherit' }} 
  borderColor = {'#42c920'}
  />
  <Button  width='auto' color={'#000'} backgroundColor={'#42c920'} type="submit" 
  onMouseOver={() => falar('Localizar')}
  >
  <FaSearch size={30} title='Localizar' />
  </Button>
 
  <Button  width='auto' color={'#000'} backgroundColor={'red'} 
  onClick={() => { 
    setLatitudei('');
     setLongitudei(''); 
     setLatitude(''); 
     setLongitude('');
     setNome('');
     setDescricao('');
      falar('Limpando campos');
     }} 
  onMouseOver={() => falar('Limpar')}
  >
    <FaTrash size={30}  title='Limpar'/>
  </Button>
  </Stack>
  <button onClick={() => { setLatitudei(48.8584); setLongitudei(2.2945);
  setNome('Torre Eiffel');
  setDescricao('A Torre Eiffel é uma torre treliça de ferro do século XIX localizada no Champ de Mars, em Paris, que se tornou um ícone mundial da França. A torre, que é o edifício mais alto de Paris, é o monumento pago mais visitado do mundo, com milhões de pessoas subindo a torre a cada ano. Nomeada em homenagem ao seu projetista, o engenheiro Gustave Eiffel, foi construída como o arco de entrada da Exposição Universal de 1889.');
  falar('A Torre Eiffel é uma torre treliça de ferro do século XIX localizada no Champ de Mars, em Paris, que se tornou um ícone mundial da França. A torre, que é o edifício mais alto de Paris, é o monumento pago mais visitado do mundo, com milhões de pessoas subindo a torre a cada ano. Nomeada em homenagem ao seu projetista, o engenheiro Gustave Eiffel, foi construída como o arco de entrada da Exposição Universal de 1889.');
  }}>
  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg" w={8} h={8} margin={'1'} borderRadius='full' title="Torre Eiffel" 
  
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Torre Eiffel')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
 
  />
</button>

<button onClick={() => { setLatitudei(40.6892); setLongitudei(-74.0445);
setNome('Estatua da Liberdade');
setDescricao('A Estátua da Liberdade é um grande monumento neoclássico localizado na ilha da Liberdade, na foz do rio Hudson, no Oceano Atlântico, na cidade de Nova York, nos Estados Unidos. A estátua, projetada pelo escultor francês Frédéric Auguste Bartholdi, é um presente da França aos Estados Unidos em reconhecimento à amizade estabelecida entre os dois países durante a Revolução Americana.');
falar('A Estátua da Liberdade é um grande monumento neoclássico localizado na ilha da Liberdade, na foz do rio Hudson, no Oceano Atlântico, na cidade de Nova York, nos Estados Unidos. A estátua, projetada pelo escultor francês Frédéric Auguste Bartholdi, é um presente da França aos Estados Unidos em reconhecimento à amizade estabelecida entre os dois países durante a Revolução Americana.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.pGtOXR35MxtSXfUw1TUgcAHaFj%26pid%3DApi&f=1&ipt=ca48e3cd54e01d46835bdfdb89ee73649899b53ea34fb999420f4e8e25fedf56&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Estatua da Liberdade" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Estatua da Liberdade')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}

  />
</button>

<button onClick={() => { setLatitudei(27.1751); setLongitudei(78.0421);
setNome('Taj Mahal');
setDescricao('O Taj Mahal é um mausoléu de mármore branco localizado na cidade indiana de Agra. Foi encomendado em 1632 pelo imperador Mughal Shah Jahan para abrigar o túmulo de sua esposa favorita, Mumtaz Mahal; também abriga o túmulo de Shah Jahan. O Taj Mahal é o monumento mais conhecido da Índia e um dos mais famosos do mundo.');
falar('O Taj Mahal é um mausoléu de mármore branco localizado na cidade indiana de Agra. Foi encomendado em 1632 pelo imperador Mughal Shah Jahan para abrigar o túmulo de sua esposa favorita, Mumtaz Mahal; também abriga o túmulo de Shah Jahan. O Taj Mahal é o monumento mais conhecido da Índia e um dos mais famosos do mundo.');
}}>
  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg" w={8} h={8} margin={'1'} borderRadius='full' title="Taj Mahal" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Taj Mahal')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
  />
</button>

<button onClick={() => { setLatitudei(41.8902); setLongitudei(12.4922);
setNome('Coliseu de Roma');
setDescricao('O Coliseu ou Anfiteatro Flaviano é um anfiteatro oval localizado no centro da cidade de Roma, capital da Itália. Construído com concreto e areia, é o maior anfiteatro já construído e está situado a leste do Fórum Romano. É considerado uma das maiores obras da arquitetura e engenharia romanas.');
falar('O Coliseu ou Anfiteatro Flaviano é um anfiteatro oval localizado no centro da cidade de Roma, capital da Itália. Construído com concreto e areia, é o maior anfiteatro já construído e está situado a leste do Fórum Romano. É considerado uma das maiores obras da arquitetura e engenharia romanas.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F1.bp.blogspot.com%2F-2UOdNE7_4Yo%2FUQvWIm7inyI%2FAAAAAAAAZEU%2FlLRwdD60b3I%2Fs1600%2FColiseo%2Bde%2BRoma.jpg&f=1&nofb=1&ipt=5365e7a2557a4a738e95d1a72766c3732612a67e4aacebdea54d44bfd6b31077&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Coliseu de Roma" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Coliseu de Roma')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
  />
</button>

<button onClick={() => { setLatitudei(29.9792); setLongitudei(31.1342);
setNome('Pirâmides do Egito');
setDescricao('As pirâmides do Egito são estruturas monumentais construídas durante o Antigo Império do Egito Antigo para abrigar os corpos dos faraós egípcios, que eram considerados deuses na Terra. As pirâmides eram construídas de acordo com o projeto de uma câmara mortuária, onde o corpo do faraó seria colocado, e uma câmara de culto, onde os rituais de adoração seriam realizados.');
falar('As pirâmides do Egito são estruturas monumentais construídas durante o Antigo Império do Egito Antigo para abrigar os corpos dos faraós egípcios, que eram considerados deuses na Terra. As pirâmides eram construídas de acordo com o projeto de uma câmara mortuária, onde o corpo do faraó seria colocado, e uma câmara de culto, onde os rituais de adoração seriam realizados.');
}}>
  <Image src="https://www.supermisterioso.com.br/wp-content/uploads/2021/03/piramides-do-egito-um-dos-fascinantes-misterios-da-humanidade.jpg" w={8} h={8} margin={'1'} borderRadius='full' title="Pirâmides do Egito" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Pirâmides do Egito')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
    />
</button>

<button onClick={() => { setLatitudei(35.3606); setLongitudei(138.7278);
setNome('Monte Fuji');
setDescricao('O Monte Fuji é um vulcão ativo que entrou em erupção pela última vez em 1707. Localizado na ilha de Honshū, é o ponto mais alto do Japão, com 3.776,24 metros. É também um dos vulcões mais conhecidos do mundo e um símbolo do Japão, sendo frequentemente retratado em obras de arte e fotografias, bem como visitado por turistas e alpinistas.');
falar('O Monte Fuji é um vulcão ativo que entrou em erupção pela última vez em 1707. Localizado na ilha de Honshū, é o ponto mais alto do Japão, com 3.776,24 metros. É também um dos vulcões mais conhecidos do mundo e um símbolo do Japão, sendo frequentemente retratado em obras de arte e fotografias, bem como visitado por turistas e alpinistas.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F23%2F36%2Fe2%2F2336e29eea04332945235eb55b57b2ff.jpg&f=1&nofb=1&ipt=251dec98878051f394177348c053f2b8886394d3368f71f6ebb5ac36bb7cb9f7&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Monte Fuji" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Monte Fuji')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}

  />
</button>

<button onClick={() => { setLatitudei(-19.86565); setLongitudei(-40.38246);
setNome('Buda Ibiraçu');
setDescricao('O Buda de Ibiraçu é uma estátua de Buda localizada no município de Ibiraçu, no estado brasileiro do Espírito Santo. Com 38 metros de altura, é a segunda maior estátua de Buda no Ocidente, atrás apenas do Buda da Felicidade, em Cotia, São Paulo. A estátua foi inaugurada em 2012, após 10 anos de construção.');
falar('O Buda de Ibiraçu é uma estátua de Buda localizada no município de Ibiraçu, no estado brasileiro do Espírito Santo. Com 38 metros de altura, é a segunda maior estátua de Buda no Ocidente, atrás apenas do Buda da Felicidade, em Cotia, São Paulo. A estátua foi inaugurada em 2012, após 10 anos de construção.');

}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.meionorte.com%2Fuploads%2Fimagens%2F2021%2F8%2F29%2Festatua-de-buda-inaugurada-no-brasil-e-a-segunda-maior-do-mundo-491b34ed-1ac9-4e07-a3e8-4bfc4181d0d2.jpg&f=1&nofb=1&ipt=809358137426ec61d5a2450c6b03678430d5a8b8408cc5c94c98a92da0737688&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Buda Ibiraçu" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Buda Ibiraçu')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
  />
</button>

<button onClick={() => { setLatitudei(-22.9519); setLongitudei(-43.2105);
setNome('Cristo Redentor');
setDescricao('O Cristo Redentor é uma estátua art déco que retrata Jesus Cristo, localizada no topo do morro do Corcovado, a 709 metros acima do nível do mar, no Parque Nacional da Tijuca, com vista para a maior parte da cidade do Rio de Janeiro, Brasil. Uma símbolo do cristianismo em todo o mundo, a estátua se tornou um ícone cultural do Rio e do Brasil.');
falar('O Cristo Redentor é uma estátua art déco que retrata Jesus Cristo, localizada no topo do morro do Corcovado, a 709 metros acima do nível do mar, no Parque Nacional da Tijuca, com vista para a maior parte da cidade do Rio de Janeiro, Brasil. Uma símbolo do cristianismo em todo o mundo, a estátua se tornou um ícone cultural do Rio e do Brasil.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fviajeros360.com%2Fwp-content%2Fuploads%2F2016%2F01%2FDSCN6042.jpg&f=1&nofb=1&ipt=a7fcb316b54ddcbb0613b508819a10543555c92051d7efabdab089b96979ef2a&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Cristo Redentor" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Cristo Redentor')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
  />
</button>

<button onClick={() => { setLatitudei(27.9881); setLongitudei(86.9250);
setNome('Monte Everest');
setDescricao('O Monte Everest é a montanha mais alta do mundo acima do nível do mar, com 8.848 metros de altura. Está localizado na cordilheira do Himalaia, na fronteira entre o Nepal e o Tibete, China. O seu pico está a 8.848 metros acima do nível do mar, sendo reconhecido como a montanha mais alta do mundo.');
falar('O Monte Everest é a montanha mais alta do mundo acima do nível do mar, com 8.848 metros de altura. Está localizado na cordilheira do Himalaia, na fronteira entre o Nepal e o Tibete, China. O seu pico está a 8.848 metros acima do nível do mar, sendo reconhecido como a montanha mais alta do mundo.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.factinate.com%2Fwp-content%2Fuploads%2F2018%2F01%2F17-37.jpg&f=1&nofb=1&ipt=11c451c54cc677cb172768f6b7a14bce36ff6f4f5c852a9d64d3b61d895fe293&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Monte Everest" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Monte Everest')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
  />
</button>

<button onClick={() => { setLatitudei(-13.1631); setLongitudei(-72.5450);
setNome('Machu Picchu');
setDescricao('Machu Picchu é uma cidade inca construída no século XV, no topo de uma montanha, no vale do rio Urubamba, atual Peru. Foi construída em torno de 1450, sob as ordens de Pachacuti. O local é considerado Patrimônio Mundial da UNESCO desde 1983 e foi eleito em 2007 como uma das Novas Sete Maravilhas do Mundo Moderno.');
falar('Machu Picchu é uma cidade inca construída no século XV, no topo de uma montanha, no vale do rio Urubamba, atual Peru. Foi construída em torno de 1450, sob as ordens de Pachacuti. O local é considerado Patrimônio Mundial da UNESCO desde 1983 e foi eleito em 2007 como uma das Novas Sete Maravilhas do Mundo Moderno.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.Xafpds6a0ICK6THxncjFUAHaE8%26pid%3DApi&f=1&ipt=a26e1134f59d690e75fa8d1cf3a339b634e05e7413c34465402488f3cb0da41e&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Machu Picchu" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Machu Picchu')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}

  />
</button>

<button onClick={() => { 
  setLatitudei(19.6926);
   setLongitudei(-98.8456);
   setNome('Pirâmide Azteca');
    setDescricao('Teotihuacán, foi um centro urbano da Mesoamérica pré-colombiana localizada na Bacia do México, 48 quilómetros a nordeste da atual Cidade do México, e que hoje é conhecida como o local de muitas das pirâmides mesoamericanas arquitetonicamente mais significativas construídas na América pré-colombiana. Além dos edifícios piramidais, Teotihuacan também é antropologicamente significativa por seus complexos residenciais multifamiliares, pela Avenida dos Mortos e por seus vibrantes murais que foram excepcionalmente bem preservados. Além disso, Teotihuacan exportou um estilo de cerâmica e finas ferramentas de obsidiana que conquistaram grande prestígio e utilização generalizada em toda a Mesoamérica.');
    falar('Teotihuacán, foi um centro urbano da Mesoamérica pré-colombiana localizada na Bacia do México, 48 quilómetros a nordeste da atual Cidade do México, e que hoje é conhecida como o local de muitas das pirâmides mesoamericanas arquitetonicamente mais significativas construídas na América pré-colombiana. Além dos edifícios piramidais, Teotihuacan também é antropologicamente significativa por seus complexos residenciais multifamiliares, pela Avenida dos Mortos e por seus vibrantes murais que foram excepcionalmente bem preservados. Além disso, Teotihuacan exportou um estilo de cerâmica e finas ferramentas de obsidiana que conquistaram grande prestígio e utilização generalizada em toda a Mesoamérica.');
    }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvoyance-du-destin.fr%2Fwp-content%2Fuploads%2F2020%2F02%2F8-3.jpg&f=1&nofb=1&ipt=bcbbfcb4caf0a4bd443171a4a86cc62e1ab587bafb57540019876471c17fffec&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Pirâmide Azteca"
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Pirâmide Azteca')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}

  />
</button>

<button onClick={() => { setLatitudei(-20.329444); setLongitudei(-40.287222);
setNome('Convento da Penha');
setDescricao('O Convento de Nossa Senhora da Penha é um convento católico localizado no município de Vila Velha, no estado brasileiro do Espírito Santo. Foi construído no século XVI, no alto de um penhasco, a 154 metros de altitude, sendo um dos principais pontos turísticos do estado.');
falar('O Convento de Nossa Senhora da Penha é um convento católico localizado no município de Vila Velha, no estado brasileiro do Espírito Santo. Foi construído no século XVI, no alto de um penhasco, a 154 metros de altitude, sendo um dos principais pontos turísticos do estado.');
}}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.WRrcSaaxSQ5dYFt3sKQJIQHaE6%26pid%3DApi&f=1&ipt=fda12a240552e4dd4e0d47b133ee9e8d25f43ef71d50b3b8e94d38ae71f77978&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Convento da Penha" 
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'scale(2)'
    falar('Convento da Penha')
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';  // Retornar à escala original
  }}
  />
</button>
</FormControl>
  
 
</form>
</Box>  
{/* <Box maxW='100%' borderWidth='1px'  borderRadius='lg' m={2}
backgroundColor={'#42c920'}
borderColor = {'#42c920'} 
overflow='hidden'>   */}



     
    {/* </Box> */}
   
        <AnimatedStars />
       

        <Box w={'80%'} h={'70%'} mt={5}>
        {latitude !== '' && longitude !== '' ? (
            <PointAdd
              name={nome||'Novo Ponto'}
              description={descricao||'Ponto adicionado pelo usuário'}
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
</>
 
  );
}

export default Mapa;
