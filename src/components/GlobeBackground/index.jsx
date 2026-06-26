import { useEffect, useRef } from 'react'
import { loadModules, setDefaultOptions } from 'esri-loader'

const GlobeBackground = () => {
  setDefaultOptions({ css: true })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // Adia 3s para não bloquear o render inicial da Home
    const timer = setTimeout(() => {
      if (!mountedRef.current) return

      loadModules([
        "esri/config",
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/TileLayer",
        "esri/Basemap",
        "esri/layers/ElevationLayer",
        "esri/layers/BaseElevationLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/geometry/Mesh",
        "esri/core/watchUtils",
      ]).then(([
        esriConfig, Map, SceneView, TileLayer, Basemap,
        ElevationLayer, BaseElevationLayer, Graphic, Point, Mesh, watchUtils
      ]) => {
        if (!mountedRef.current) return

        esriConfig.apiKey = import.meta.env.VITE_ESRI_API_KEY

        const R = 6358137
        const offset = 300000

        const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
          properties: { exaggerationTopography: null, exaggerationBathymetry: null },
          load() {
            this._elevation = new ElevationLayer({
              url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer",
            })
            this.addResolvingPromise(this._elevation.load())
          },
          fetchTile(level, row, col) {
            return this._elevation.fetchTile(level, row, col).then(data => {
              for (let i = 0; i < data.values.length; i++) {
                data.values[i] = data.values[i] >= 0
                  ? data.values[i] * this.exaggerationTopography
                  : data.values[i] * this.exaggerationBathymetry
              }
              return data
            })
          },
        })

        const basemap = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
              copyright: "Tiles © Esri",
            }),
          ],
        })

        const map = new Map({
          basemap,
          ground: {
            layers: [
              new ExaggeratedElevationLayer({
                exaggerationBathymetry: 60,
                exaggerationTopography: 40,
              }),
            ],
          },
        })

        const view = new SceneView({
          container: "globeBgDiv",
          map,
          alphaCompositingEnabled: true,
          qualityProfile: "medium",
          camera: {
            position: [-55.03975781, 14.94826384, 19921223.30821],
            heading: 2.03,
            tilt: 0.13,
          },
          environment: {
            background: { type: "color", color: [0, 0, 0, 0] },
            starsEnabled: false,
            atmosphereEnabled: false,
            lighting: {
              directShadowsEnabled: false,
              date: "Sun Jun 23 2019 19:19:18 GMT+0200 (Central European Summer Time)",
            },
          },
          constraints: {
            altitude: { min: 10000000, max: 25000000 },
          },
          ui: { components: [] }, // Remove todos os controles de UI
        })

        // Camada oceano
        const oceanMesh = Mesh.createSphere(
          new Point({ x: 0, y: -90, z: -(2 * R) }),
          {
            size: { width: 2 * R, depth: 2 * R, height: 2 * R },
            densificationFactor: 4,
            material: { color: [0, 140, 180, 0.6], metallic: 0.9, roughness: 0.8, doubleSided: false },
          }
        )
        view.graphics.add(new Graphic({
          geometry: oceanMesh,
          symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
        }))

        // Camada nuvens
        const cloudsMesh = Mesh.createSphere(
          new Point({ x: 0, y: -90, z: -(2 * R + offset) }),
          {
            size: 2 * (R + offset),
            densificationFactor: 3,
            material: {
              colorTexture: "https://raw.githubusercontent.com/RalucaNicola/the-globe-of-extremes/master/clouds-nasa.png",
              doubleSided: false,
            },
          }
        )
        cloudsMesh.components[0].shading = "flat"
        view.graphics.add(new Graphic({
          geometry: cloudsMesh,
          symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
        }))

        // Rotação automática — pausa quando o usuário arrasta
        let userInteracting = false
        let resumeTimer = null

        view.on("drag", () => {
          userInteracting = true
          clearTimeout(resumeTimer)
          resumeTimer = setTimeout(() => { userInteracting = false }, 3000)
        })

        view.when(() => {
          watchUtils.whenFalseOnce(view, "updating", () => {
            const rotate = () => {
              if (!mountedRef.current) return
              if (!userInteracting) {
                const cam = view.camera.clone()
                cam.position.longitude -= 0.15
                view.goTo(cam, { animate: false })
              }
              requestAnimationFrame(rotate)
            }
            rotate()
          })
        })

      }).catch(console.error)
    }, 3000)

    return () => {
      mountedRef.current = false
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      id="globeBgDiv"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 1,
        pointerEvents: 'auto',
        opacity: 0.45,
      }}
    />
  )
}

export default GlobeBackground
