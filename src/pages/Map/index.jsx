import React, { useState,useEffect } from 'react';
import { PointAdd } from '../../components/Map/pointAdd';
import './InputTextArea.css'


function Mapa() {
  const [latitudei, setLatitudei] = useState('');
  const [longitudei, setLongitudei] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  

  const handleSubmit = (e) => {
    e.preventDefault();
   setLatitude(latitudei);
    setLongitude(longitudei);
    

    // Lógica de manipulação dos dados do formulário
    // Aqui você pode realizar ações com os valores de latitude e longitude, como enviar para um servidor ou realizar cálculos

    // Exemplo de exibição dos valores no console
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
  
  };

  useEffect(() => { 
    let X = Math.floor(Math.random() * 5)
    if (X <= 1) {
      //Roma coliseu
      setLatitude(41.8902);
      setLongitude(12.4922);
    } else if (X <= 2) {
      //India Taj Mahal
      setLatitude(27.1751);
      setLongitude(78.0421);
    } else if (X <= 3) {
     // Grande Pirâmide de Gizé (Egito)
      setLatitude(29.9792);
      setLongitude(31.1342);
    } else if (X <= 4) {   
      //Paris torre eiffel
      setLatitude(48.8584);
      setLongitude(2.2945);
    }
  }, [])

  return (
    <>  
<form onSubmit={handleSubmit} className="flex flex-col items-center">
<h1>
  Mapa React ESRI</h1>
  <label  className="input-text">
    Latitude:
    <input
    style={{marginLeft: 10, border: '1px solid #42c920',borderRadius: '10px',padding: '5px',borderColor: '#42c920',borderWidth: '2'}}    
      type="text"
      value={latitudei }
      onChange={(e) => setLatitudei(e.target.value)}
    />
  </label>
  <label  className="input-text">
    Longitude:
    <input
     style={{marginLeft: 10, border: '1px solid #42c920',borderRadius: '10px',padding: '5px',borderColor: '#42c920',borderWidth: '2'}}   
      type="text"
      value={longitudei}
      onChange={(e) => setLongitudei(e.target.value)}
    />
  </label>
  <button className="button"  type="submit">Enviar</button>
</form>
    <br />
    <br />    
      <PointAdd
        name={'Local'}
        description={'teste de local mapa js '}
        latitude={latitude}
        longitude={longitude}
        zoom={18}
        duration={1500}
      />
    </>
  );
}

export default Mapa;
