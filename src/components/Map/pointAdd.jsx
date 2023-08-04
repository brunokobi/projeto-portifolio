import {useEffect} from 'react'
import {loadModules, setDefaultOptions} from 'esri-loader'
import LoadingGlobo from '../Loading/index.jsx'

const PointAdd = (props) => { 
  setDefaultOptions({css: true})
  const styles = {
    container: {
      height: '70vh',
    },
    mapDiv: {
      height: '69vh',
      border: '1px solid #42c920',
      background: 'transparent',
      borderRadius: '5px',
    },
  }

  useEffect(() => {
    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/Graphic',
      'esri/symbols/WebStyleSymbol',
      'esri/widgets/Legend',
      'esri/WebMap',

    ])
      .then(([Map, MapView, Graphic,WebStyleSymbol]) => {
        // criação do mapa
        const map = new Map({basemap: 'hybrid'})

        // criação da view
        const view = new MapView({
          container: 'viewDiv',
          map: map,
          zoom: 4,
          center: [0, 0],
        })

        //posição do ponto recebido
        const point = {
          type: 'point', // autocasts as new Polygon()
          longitude: props.longitude,
          latitude: props.latitude,
        }
      

          const ovni = {
            type: 'picture-marker',
            url: 'https://media.tenor.com/j91H7eyBWEcAAAAi/flying-saucer-joypixels.gif',
            width: '40',
            height: '40',         
          }

       

        const popupTemplate = {
          title: '{Name}',
          content: '{Description}',
        }
        const attributes = {
          Name: props.name ? 'Local: ' + props.name : 'Novo Ponto',
          Description:
            props.description +
            '<br><br>' +
            'Latitude: ' +
            props.latitude +
            '<br>' +
            ' Longitude: ' +
            props.longitude,
        }

        // Add the geometry and symbol to a new graphic
        const graphic = new Graphic({
          geometry: point,
          symbol: ovni,
          attributes: attributes,
          popupTemplate: popupTemplate,
        })

        //visão inicial ir pra o ponto e zoom
        let opts = {
          duration: props.duration ? props.duration : 2000, // Duration of animation will be 5 seconds
        }

        if (props.longitude !== 0 && props.latitude !== 0 && props.name) {
          view.graphics.add(graphic)
          view.goTo(
            {
              target: graphic,
              zoom: props.zoom ? props.zoom : 16,
            },
            opts
          )
        }
      })

      .catch((err) => console.error(err))
    //eslint-disable-next-line
  }, [props.longitude, props.latitude, props.name, props.description, props.zoom, props.duration])

 

  return (
    <>
   
    <div style={styles.container}>
    <LoadingGlobo />
      <div id='viewDiv' style={styles.mapDiv}></div>{' '}
    </div>     
      </>
  )
}

export {PointAdd}
