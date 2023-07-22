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






function Mapa() {
  const [latitudei, setLatitudei] = useState('');
  const [longitudei, setLongitudei] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  

  const handleSubmit = (e) => {
    e.preventDefault();
   setLatitude(latitudei);
    setLongitude(longitudei);
  };

  // useEffect(() => { 
  //   let X = Math.floor(Math.random() * 5)
  //   if (X <= 1) {
  //     //Roma coliseu
  //     setLatitude(41.8902);
  //     setLongitude(12.4922);
  //   } else if (X <= 2) {
  //     //India Taj Mahal
  //     setLatitude(27.1751);
  //     setLongitude(78.0421);
  //   } else if (X <= 3) {
  //    // Grande Pirâmide de Gizé (Egito)
  //     setLatitude(29.9792);
  //     setLongitude(31.1342);
  //   } else if (X <= 4) {   
  //     //Paris torre eiffel
  //     setLatitude(48.8584);
  //     setLongitude(2.2945);
  //   }
  // }, [])

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
 
  >Localizar</Button>
  </Stack>
  <button onClick={() => { setLatitudei(48.8584); setLongitudei(2.2945); }}>
  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg" w={8} h={8} margin={'1'} borderRadius='full' title="Torre Eiffel" />
</button>

<button onClick={() => { setLatitudei(40.6892); setLongitudei(-74.0445); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.pGtOXR35MxtSXfUw1TUgcAHaFj%26pid%3DApi&f=1&ipt=ca48e3cd54e01d46835bdfdb89ee73649899b53ea34fb999420f4e8e25fedf56&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Estatua da Liberdade" />
</button>

<button onClick={() => { setLatitudei(27.1751); setLongitudei(78.0421); }}>
  <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg" w={8} h={8} margin={'1'} borderRadius='full' title="Taj Mahal" />
</button>

<button onClick={() => { setLatitudei(41.8902); setLongitudei(12.4922); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F1.bp.blogspot.com%2F-2UOdNE7_4Yo%2FUQvWIm7inyI%2FAAAAAAAAZEU%2FlLRwdD60b3I%2Fs1600%2FColiseo%2Bde%2BRoma.jpg&f=1&nofb=1&ipt=5365e7a2557a4a738e95d1a72766c3732612a67e4aacebdea54d44bfd6b31077&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Coliseu de Roma" />
</button>

<button onClick={() => { setLatitudei(29.9792); setLongitudei(31.1342); }}>
  <Image src="https://www.supermisterioso.com.br/wp-content/uploads/2021/03/piramides-do-egito-um-dos-fascinantes-misterios-da-humanidade.jpg" w={8} h={8} margin={'1'} borderRadius='full' title="Pirâmides do Egito" />
</button>

<button onClick={() => { setLatitudei(35.3606); setLongitudei(138.7278); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F23%2F36%2Fe2%2F2336e29eea04332945235eb55b57b2ff.jpg&f=1&nofb=1&ipt=251dec98878051f394177348c053f2b8886394d3368f71f6ebb5ac36bb7cb9f7&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Monte Fuji" />
</button>

<button onClick={() => { setLatitudei(35.6595); setLongitudei(139.7003); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.wp.com%2Ftokyoisours.com%2Fwp-content%2Fuploads%2F2019%2F10%2Fshibuya-crossing.jpg%3Ffit%3D1920%252C1440%26ssl%3D1&f=1&nofb=1&ipt=107057558ef6c8f6f1d658af9da0c5a0640c9a096439a36b3a71a06740637811&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Shibuya Crossing" />
</button>

<button onClick={() => { setLatitudei(-22.9519); setLongitudei(-43.2105); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fviajeros360.com%2Fwp-content%2Fuploads%2F2016%2F01%2FDSCN6042.jpg&f=1&nofb=1&ipt=a7fcb316b54ddcbb0613b508819a10543555c92051d7efabdab089b96979ef2a&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Cristo Redentor" />
</button>

<button onClick={() => { setLatitudei(27.9881); setLongitudei(86.9250); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.factinate.com%2Fwp-content%2Fuploads%2F2018%2F01%2F17-37.jpg&f=1&nofb=1&ipt=11c451c54cc677cb172768f6b7a14bce36ff6f4f5c852a9d64d3b61d895fe293&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Monte Everest" />
</button>

<button onClick={() => { setLatitudei(-13.1631); setLongitudei(-72.5450); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.Xafpds6a0ICK6THxncjFUAHaE8%26pid%3DApi&f=1&ipt=a26e1134f59d690e75fa8d1cf3a339b634e05e7413c34465402488f3cb0da41e&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Machu Picchu" />
</button>

<button onClick={() => { setLatitudei(19.6926); setLongitudei(-98.8456); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvoyance-du-destin.fr%2Fwp-content%2Fuploads%2F2020%2F02%2F8-3.jpg&f=1&nofb=1&ipt=bcbbfcb4caf0a4bd443171a4a86cc62e1ab587bafb57540019876471c17fffec&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Pirâmide Azteca" />
</button>

<button onClick={() => { setLatitudei(-20.329444); setLongitudei(-40.287222); }}>
  <Image src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.WRrcSaaxSQ5dYFt3sKQJIQHaE6%26pid%3DApi&f=1&ipt=fda12a240552e4dd4e0d47b133ee9e8d25f43ef71d50b3b8e94d38ae71f77978&ipo=images" w={8} h={8} margin={'1'} borderRadius='full' title="Convento da Penha" />
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
              name={'Local'}
              description={'teste de local mapa js'}
              latitude={latitude}
              longitude={longitude}
              zoom={18}
              duration={3000}
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
