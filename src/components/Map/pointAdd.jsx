import {useEffect} from 'react'
import {loadModules, setDefaultOptions} from 'esri-loader'

const PointAdd = (props) => {
  // console.log('props MAPA', props)
  setDefaultOptions({css: true})
  const styles = {
    container: {
      height: '70vh',
    },
    mapDiv: {
      height: '69vh',
      border: '3px solid #42c920',
      background: '#42c920',
      borderRadius: '10px',
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

        // criação do simbolo vermelho seta
        // const simboloPadrao = {
        //   type: 'simple-marker',
        //     path: 'M72 144a40 40 0 1 0-80 0v8a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8zM72 216h-8v40H40v16h16v24h16v-24h16v-16h-16v-40zm160-56a40 40 0 1 0-80 0v8a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8zM232 160h-8v40h-24v16h16v24h16v-24h16v-16h-16v-40z M112 344a16 16 0 1 0-32 0v96h32zM208 344a16 16 0 1 0-32 0v96h32z M56 280a8 8 0 0 0 8 8h96a8 8 0 0 0 8-8v-8H56zm168 0a8 8 0 0 0 8 8h96a8 8 0 0 0 8-8v-8H224z M120 368h64v16h-64zM152 232a8 8 0 0 0 8-8v-8h-32v8a8 8 0 0 0 8 8h16zm-40-56a8 8 0 0 0-8 8v16h32v-16a8 8 0 0 0-8-8h-16z M224 176a8 8 0 0 0 8-8v-8h-32v8a8 8 0 0 0 8 8h16zm-40-56a8 8 0 0 0-8 8v16h32v-16a8 8 0 0 0-8-8h-16z',
        //     color: 'red',
        //     size: 32,
        //   };

          const ovni = {
            type: 'picture-marker',
            url: 'https://media.tenor.com/j91H7eyBWEcAAAAi/flying-saucer-joypixels.gif',
            width: '40',
            height: '40',         
          }

        // const webStyleSymbol = new WebStyleSymbol({
        //   name: "push-pin-1",
        //   styleName: "Esri2DPointSymbolsStyle"
        // });

        // const webStyleSymbol2 = new WebStyleSymbol({
        //   name: "flag",
        //   styleName: "Esri2DPointSymbolsStyle"
        // });

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
    <div style={styles.container}>
      <div id='viewDiv' style={styles.mapDiv}></div>{' '}
    </div>
  )
}

export {PointAdd}
