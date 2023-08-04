import React from 'react';
import { Spinner } from '@chakra-ui/react';
import globo from "./globo.gif";

const LoadingGlobo = () => {


  


  return (
    <>
  
  <div
      style={{
        position: 'fixed',   
        alignItems: 'center',
        justifyContent: 'center',
        top: "25%",
        left: "25%",
        width: '50%',
        height: '50%',
        display: 'flex',
        flexDirection: 'column',  // Alterando o eixo de alinhamento para coluna      
       
      }}
    >
     
      
      <img src={globo}
       alt="ovni"
        width={250}
        style={{borderRadius: '50%',marginBottom:'20px'}}
        />

<Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="#42c920"
        size="xl"
      />
       <h1 style={{ color: '#fff', marginTop: '10px',marginBottom:'20px' }}>Carregando...</h1> 
      
    
     
    </div>
  
    </>
  );
};

export default LoadingGlobo;
