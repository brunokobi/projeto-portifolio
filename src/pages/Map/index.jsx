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
