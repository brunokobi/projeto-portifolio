import {useEffect} from 'react'
import {loadModules, setDefaultOptions} from 'esri-loader'


const PointAddNew = (props) => { 
  setDefaultOptions({css: true})
  const styles = {
    container: {
      height: '70vh',
    },
    mapDiv: {      
      margin: '10px',
      height: '69vh',     
      // background: 'radial-gradient(#91c7e3, #3d93bf)',     
      borderRadius: '10px',
    },
  }

  useEffect(() => {
    loadModules([
      "esri/config",
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/TileLayer",
        "esri/layers/GeoJSONLayer",
        "esri/Basemap",

        "esri/layers/ElevationLayer",
        "esri/layers/BaseElevationLayer",

        "esri/Graphic",
        "esri/geometry/Point",
        "esri/geometry/Mesh",

        "esri/core/watchUtils",

    ])
      .then(([esriConfig,
        Map,
        SceneView,
        TileLayer,
        GeoJSONLayer,
        Basemap,
        ElevationLayer,
        BaseElevationLayer,
        Graphic,
        Point,
        Mesh,
        watchUtils
      ]) => {
        esriConfig.apiKey = process.env.REACT_APP_ESRI_API_KEY

        const R = 6358137 // approximate radius of the Earth in m
        const offset = 300000 // offset from the ground used for the clouds

        const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
          properties: {
            exaggerationTopography: null,
            exaggerationBathymetry: null,
          },

          load: function() {
            this._elevation = new ElevationLayer({
              url:
                "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer",
            })
            this.addResolvingPromise(this._elevation.load())
          },

          fetchTile: function(level, row, col) {
            return this._elevation.fetchTile(level, row, col).then(
              function(data) {
                for (let i = 0; i < data.values.length; i++) {
                  if (data.values[i] >= 0) {
                    data.values[i] =
                      data.values[i] * this.exaggerationTopography
                  } else {
                    data.values[i] =
                      data.values[i] * this.exaggerationBathymetry
                  }
                }
                return data
              }.bind(this)
            )
          },
        })
        // criação do mapa
        const basemap = new Basemap({
          baseLayers: [
            new TileLayer({
              url:
                "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/terrain_with_heavy_bathymetry/MapServer",
              copyright:
                'Bathymetry, topography and satellite imagery from <a href="https://visibleearth.nasa.gov/view_cat.php?categoryID=1484" target="_blank">NASA Visible Earth</a> | <a href="http://www.aag.org/global_ecosystems" target="_blank">World Ecological Land Units, AAG</a> | Oceans, glaciers and water bodies from <a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a>',
            }),
          ],
        })

        // criação do mapa
        const map = new Map({
          basemap: basemap,
          ground: {
            layers: [
              new ExaggeratedElevationLayer({
                exaggerationBathymetry: 60,
                exaggerationTopography: 40,
              }),
            ],
          },
        })

        // criação da view
        const view = new SceneView({
          container: "viewDiv",
          map: map,
          alphaCompositingEnabled: true,
          qualityProfile: "high",
          camera: {
            position: [-55.03975781, 14.94826384, 19921223.30821],
            heading: 2.03,
            tilt: 0.13,
          },
          environment: {
            background: {
              type: "color",
              color: [255, 252, 244, 0],
            },
            starsEnabled: false,
            atmosphereEnabled: false,
            lighting: {
              directShadowsEnabled: false,
              date:
                "Sun Jun 23 2019 19:19:18 GMT+0200 (Central European Summer Time)",
            },
          },
          constraints: {
            altitude: {
              min: 10000000,
              max: 25000000,
            },
          },
          popup: {
            dockEnabled: true,
            dockOptions: {
              position: "top-right",
              breakpoint: false,
              buttonEnabled: false,
            },
            collapseEnabled: false,
          },
          highlightOptions: {
            color: [255, 255, 255],
            haloOpacity: 0.5,
          },
        })

        const origin = new Point({
          x: 0,
          y: -90,
          z: -(2 * R),
        })

        const oceanSurfaceMesh = Mesh.createSphere(origin, {
          size: {
            width: 2 * R,
            depth: 2 * R,
            height: 2 * R,
          },
          densificationFactor: 5,
          material: {
            color: [0, 210, 210, 0.8],
            metallic: 0.9,
            roughness: 0.8,
            doubleSided: false,
          },
        })

        const oceanSurface = new Graphic({
          geometry: oceanSurfaceMesh,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
              },
            ],
          },
        })

        view.graphics.add(oceanSurface)

        const cloudsSphere = Mesh.createSphere(
          new Point({
            x: 0,
            y: -90,
            z: -(2 * R + offset)
          }),
          {
            size: 2 * (R + offset),
            material: {
              colorTexture: "https://raw.githubusercontent.com/RalucaNicola/the-globe-of-extremes/master/clouds-nasa.png",
              doubleSided: false
            },
            densificationFactor: 4
          }
        );

        cloudsSphere.components[0].shading = "flat";

        const clouds = new Graphic({
          geometry: cloudsSphere,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [{ type: "fill" }]
          }
        });

        view.graphics.add(clouds);

        let isPlaying = true;

        view.when(function() {
          watchUtils.whenFalseOnce(view, "updating", rotate)
        });

        function rotate() {
          if (isPlaying) {
            const camera = view.camera.clone()
            camera.position.longitude -= 0.2
            view.goTo(camera, { animate: false })
            requestAnimationFrame(rotate)
          }
        }
    //      //visão inicial ir pra o ponto e zoom
    // let opts = {
    //   duration: 3000, // Duration of animation will be 5 seconds
    // };

    // //visão inicial ir pra o ponto e zoom
    // view.goTo(
    //   {
    //     target: [-40.29003, -20.31573],
    //     zoom: 16,
    //   },
    //   opts
    // );
  

    })
      
    


    .catch((err) => console.error(err))
    //eslint-disable-next-line
  }, [])



  return (
    <div style={styles.container}>
      <div id='viewDiv' style={styles.mapDiv}></div>{' '}
    </div>
  )
}

export {PointAddNew}
