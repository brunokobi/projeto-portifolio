import { useEffect, useRef, useState } from "react";
import { loadModules, setDefaultOptions } from "esri-loader";

const CITIES = [
  // América do Sul
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Vitória-ES", lat: -20.3155, lon: -40.3128 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  // América do Norte
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  // Europa
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  // Ásia
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  // África
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  // Oceania
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Auckland", lat: -36.8485, lon: 174.7633 },
];

interface ClickInfo {
  x: number;
  y: number;
  text: string;
}

interface UserLoc {
  name: string;
  lat: number;
  lon: number;
}

const GlobeBackground = () => {
  setDefaultOptions({ css: true });
  const mountedRef = useRef(true);
  const viewRef = useRef<any>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userLocRef = useRef<UserLoc | null>(null);
  const userPtRef = useRef<any>(null);
  const [nightMode, setNightMode] = useState(false);
  const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);

  // Geolocalização do visitante → pin especial no globo
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "pt-BR,pt;q=0.9" } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Você";
          userLocRef.current = { name: city, lat: latitude, lon: longitude };
        } catch {
          userLocRef.current = { name: "Você", lat: latitude, lon: longitude };
        }
      },
      () => {
        // permissão negada — sem pin
      }
    );
  }, []);

  // Aplicar modo dia/noite na view já carregada
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    try {
      const env = view.environment.clone();
      const d = new Date();
      if (nightMode) d.setHours(d.getHours() + 12);
      env.lighting.date = d;
      view.environment = env;
    } catch {
      // view ainda não pronta
    }
  }, [nightMode]);

  useEffect(() => {
    mountedRef.current = true;

    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

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
      ])
        .then(
          ([
            esriConfig,
            Map,
            SceneView,
            TileLayer,
            Basemap,
            ElevationLayer,
            BaseElevationLayer,
            Graphic,
            Point,
            Mesh,
            watchUtils,
          ]) => {
            if (!mountedRef.current) return;

            esriConfig.apiKey = import.meta.env.VITE_ESRI_API_KEY;

            const R = 6358137;
            const offset = 300000;

            const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
              properties: { exaggerationTopography: null, exaggerationBathymetry: null },
              load() {
                this._elevation = new ElevationLayer({
                  url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer",
                });
                this.addResolvingPromise(this._elevation.load());
              },
              fetchTile(level: unknown, row: unknown, col: unknown) {
                return this._elevation
                  .fetchTile(level, row, col)
                  .then((data: { values: number[] }) => {
                    for (let i = 0; i < data.values.length; i++) {
                      data.values[i] =
                        data.values[i] >= 0
                          ? data.values[i] * this.exaggerationTopography
                          : data.values[i] * this.exaggerationBathymetry;
                    }
                    return data;
                  });
              },
            });

            const basemap = new Basemap({
              baseLayers: [
                new TileLayer({
                  url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
                  copyright: "Tiles © Esri",
                }),
              ],
            });

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
            });

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
                starsEnabled: true,
                atmosphereEnabled: true,
                atmosphere: { quality: "high" },
                lighting: {
                  directShadowsEnabled: false,
                  date: new Date(),
                },
              },
              constraints: {
                altitude: { min: 4000000, max: 25000000 },
              },
              ui: { components: [] },
            });

            viewRef.current = view;

            // Camada oceano
            const oceanMesh = Mesh.createSphere(new Point({ x: 0, y: -90, z: -(2 * R) }), {
              size: { width: 2 * R, depth: 2 * R, height: 2 * R },
              densificationFactor: 4,
              material: {
                color: [0, 140, 180, 1],
                metallic: 0.9,
                roughness: 0.8,
                doubleSided: false,
              },
            });
            view.graphics.add(
              new Graphic({
                geometry: oceanMesh,
                symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
              })
            );

            // Camada nuvens
            const cloudsMesh = Mesh.createSphere(
              new Point({ x: 0, y: -90, z: -(2 * R + offset) }),
              {
                size: 2 * (R + offset),
                densificationFactor: 3,
                material: {
                  colorTexture:
                    "https://raw.githubusercontent.com/RalucaNicola/the-globe-of-extremes/master/clouds-nasa.png",
                  doubleSided: false,
                },
              }
            );
            cloudsMesh.components[0].shading = "flat";
            view.graphics.add(
              new Graphic({
                geometry: cloudsMesh,
                symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
              })
            );

            // Rotação automática — pausa quando o usuário arrasta
            let userInteracting = false;
            let resumeTimer: ReturnType<typeof setTimeout> | null = null;

            view.on("drag", () => {
              userInteracting = true;
              clearTimeout(resumeTimer ?? undefined);
              resumeTimer = setTimeout(() => {
                userInteracting = false;
              }, 3000);
            });

            // Clique → coordenadas no mapa
            view.on("click", (evt: any) => {
              if (!evt.mapPoint) return;
              const lat = evt.mapPoint.latitude.toFixed(3);
              const lon = evt.mapPoint.longitude.toFixed(3);
              clearTimeout(clickTimerRef.current ?? undefined);
              setClickInfo({ x: evt.x, y: evt.y, text: `${lat}°, ${lon}°` });
              clickTimerRef.current = setTimeout(() => setClickInfo(null), 3500);
            });

            view.when(() => {
              watchUtils.whenFalseOnce(view, "updating", () => {
                // Loop de rotação
                const rotate = () => {
                  if (!mountedRef.current) return;
                  if (!userInteracting) {
                    const cam = view.camera.clone();
                    cam.position.longitude -= 0.15;
                    view.goTo(cam, { animate: false });
                  }
                  requestAnimationFrame(rotate);
                };
                rotate();

                // Canvas overlay — pins das cidades com pulso
                const canvas = document.getElementById(
                  "globeOverlay"
                ) as HTMLCanvasElement | null;
                if (!canvas) return;

                const dpr = window.devicePixelRatio || 1;
                const setupCanvas = () => {
                  canvas.width = window.innerWidth * dpr;
                  canvas.height = window.innerHeight * dpr;
                  const c = canvas.getContext("2d");
                  if (c) c.scale(dpr, dpr);
                };
                setupCanvas();

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const cityPoints = CITIES.map(
                  (c) => new Point({ longitude: c.lon, latitude: c.lat, z: 50000 })
                );

                let frame = 0;
                const drawPins = () => {
                  if (!mountedRef.current) return;
                  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

                  cityPoints.forEach((pt, i) => {
                    try {
                      const sp = view.toScreen(pt);
                      if (!sp) return;

                      const pulse = (Math.sin(frame * 0.04 + i * 2.1) + 1) / 2;

                      // Anel externo pulsante
                      ctx.beginPath();
                      ctx.arc(sp.x, sp.y, 6 + pulse * 10, 0, Math.PI * 2);
                      ctx.strokeStyle = `rgba(0,255,65,${0.5 - pulse * 0.38})`;
                      ctx.lineWidth = 1.5;
                      ctx.stroke();

                      // Anel interno fixo
                      ctx.beginPath();
                      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
                      ctx.strokeStyle = "rgba(0,255,65,0.7)";
                      ctx.lineWidth = 1;
                      ctx.stroke();

                      // Ponto central com glow
                      ctx.beginPath();
                      ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
                      ctx.fillStyle = "#00ff41";
                      ctx.shadowBlur = 7;
                      ctx.shadowColor = "#00ff41";
                      ctx.fill();
                      ctx.shadowBlur = 0;

                      // Label
                      ctx.font = "11px monospace";
                      ctx.fillStyle = "rgba(0,255,65,0.85)";
                      ctx.fillText(CITIES[i].name, sp.x + 9, sp.y + 4);
                    } catch {
                      // ponto fora do campo de visão
                    }
                  });

                  // Pin do visitante (geolocalização)
                  const userLoc = userLocRef.current;
                  if (userLoc) {
                    if (!userPtRef.current) {
                      userPtRef.current = new Point({
                        longitude: userLoc.lon,
                        latitude: userLoc.lat,
                        z: 50000,
                      });
                    }
                    try {
                      const sp = view.toScreen(userPtRef.current);
                      if (sp) {
                        const blink = (Math.sin(frame * 0.08) + 1) / 2;

                        // Anel pulsante amarelo
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 7 + blink * 9, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255,220,0,${0.55 - blink * 0.42})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Anel fixo
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
                        ctx.strokeStyle = "rgba(255,220,0,0.8)";
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Core
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = "#ffdc00";
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "#ffdc00";
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // Label
                        ctx.font = "bold 11px monospace";
                        ctx.fillStyle = "#ffdc00";
                        ctx.fillText(`📍 ${userLoc.name}`, sp.x + 10, sp.y + 4);
                      }
                    } catch {
                      // ponto fora do campo de visão
                    }
                  }

                  frame++;
                  requestAnimationFrame(drawPins);
                };
                drawPins();

                window.addEventListener("resize", () => {
                  setupCanvas();
                });
              });
            });
          }
        )
        .catch(console.error);
    }, 3000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      clearTimeout(clickTimerRef.current ?? undefined);
    };
  }, []);

  return (
    <>
      <div
        id="globeBgDiv"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          pointerEvents: "auto",
          opacity: 1,
        }}
      />

      {/* Canvas para pins das cidades */}
      <canvas
        id="globeOverlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Botão dia / noite */}
      <button
        onClick={() => setNightMode((p) => !p)}
        title={nightMode ? "Modo dia" : "Modo noite"}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 10,
          background: "rgba(0,0,0,0.8)",
          border: "1px solid #00ff41",
          borderRadius: "6px",
          color: "#00ff41",
          fontFamily: "monospace",
          fontSize: "12px",
          padding: "6px 12px",
          cursor: "pointer",
          letterSpacing: "1px",
        }}
      >
        {nightMode ? "☀ DIA" : "☾ NOITE"}
      </button>

      {/* Popup de coordenadas ao clicar */}
      {clickInfo && (
        <div
          style={{
            position: "fixed",
            left: Math.min(clickInfo.x + 14, window.innerWidth - 210),
            top: Math.max(clickInfo.y - 34, 8),
            zIndex: 20,
            background: "rgba(0,0,0,0.88)",
            border: "1px solid #00ff41",
            borderRadius: "4px",
            padding: "5px 10px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#00ff41",
            pointerEvents: "none",
            boxShadow: "0 0 10px rgba(0,255,65,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          📍 {clickInfo.text}
        </div>
      )}
    </>
  );
};

export default GlobeBackground;
