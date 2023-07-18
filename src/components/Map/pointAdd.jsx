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
      .then(([Map, MapView, Graphic]) => {
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
        const simboloPadrao = {
          type: 'simple-marker',
          path: 'M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z',
          color: 'red',
          size: 24,
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
          symbol: simboloPadrao,
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
