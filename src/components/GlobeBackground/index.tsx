import { useEffect, useRef, useState } from "react";
import { loadModules, setDefaultOptions } from "esri-loader";

// Checa se lat/lon está na metade visível do globo em relação à câmera
const isFacing = (camLat: number, camLon: number, ptLat: number, ptLon: number): boolean => {
  const r = Math.PI / 180;
  const cLat = camLat * r, cLon = camLon * r;
  const pLat = ptLat  * r, pLon = ptLon  * r;
  const dot =
    Math.cos(cLat) * Math.cos(cLon) * Math.cos(pLat) * Math.cos(pLon) +
    Math.cos(cLat) * Math.sin(cLon) * Math.cos(pLat) * Math.sin(pLon) +
    Math.sin(cLat) * Math.sin(pLat);
  return dot > 0.1; // margem para evitar flickering na borda
};

// Interpolação esférica entre dois pontos na superfície do globo
const slerpPoint = (
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  t: number
): { lat: number; lon: number } => {
  const r = Math.PI / 180;
  const φ1 = lat1 * r, λ1 = lon1 * r;
  const φ2 = lat2 * r, λ2 = lon2 * r;
  const x1 = Math.cos(φ1) * Math.cos(λ1), y1 = Math.cos(φ1) * Math.sin(λ1), z1 = Math.sin(φ1);
  const x2 = Math.cos(φ2) * Math.cos(λ2), y2 = Math.cos(φ2) * Math.sin(λ2), z2 = Math.sin(φ2);
  const dot = Math.max(-1, Math.min(1, x1*x2 + y1*y2 + z1*z2));
  const angle = Math.acos(dot);
  if (angle < 0.0001) return { lat: lat1, lon: lon1 };
  const s = Math.sin(angle);
  const w1 = Math.sin((1 - t) * angle) / s;
  const w2 = Math.sin(t * angle) / s;
  return {
    lat: Math.asin(Math.max(-1, Math.min(1, w1 * z1 + w2 * z2))) / r,
    lon: Math.atan2(w1 * y1 + w2 * y2, w1 * x1 + w2 * x2) / r,
  };
};

const HOME = { name: "Vitória-ES", lat: -20.3155, lon: -40.3128 };

interface ArcState {
  points: any[];
  fromName: string;
  fromLat: number;
  fromLon: number;
  progress: number;
  phase: "drawing" | "holding" | "fading";
  startTime: number;
  fadeStart: number;
  opacity: number;
}

interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  desc: string;
  tags: string[];
}

const CITIES: City[] = [
  { name: "Vitória-ES",     lat: -20.3155, lon: -40.3128, country: "Brasil",         desc: "",                                                                                                                                            tags: [] },
  { name: "San Francisco",  lat:  37.7749, lon:-122.4194, country: "EUA",            desc: "Principal epicentro mundial de inovação, liderando em investimentos de risco, inteligência artificial e ecossistema de startups.",           tags: ["IA", "Startups", "VC"] },
  { name: "Nova York",      lat:  40.7128, lon: -74.006,  country: "EUA",            desc: "Capital financeira global, destacando-se fortemente no setor de fintechs e expansão rápida de inteligência artificial.",                    tags: ["Fintech", "IA", "Finanças"] },
  { name: "Londres",        lat:  51.5074, lon:  -0.1278, country: "Reino Unido",    desc: "Principal ecossistema tecnológico da Europa, reconhecida por liderar a regulação de IA, fintechs e finanças descentralizadas.",             tags: ["Fintech", "IA", "DeFi"] },
  { name: "Tóquio",         lat:  35.6762, lon: 139.6503, country: "Japão",          desc: "Centro tecnológico asiático pioneiro em robótica, automação, mobilidade inteligente e infraestrutura urbana de internet.",                   tags: ["Robótica", "IoT", "Mobilidade"] },
  { name: "Seul",           lat:  37.5665, lon: 126.978,  country: "Coreia do Sul",  desc: "Conhecida como cidade do futuro, destaca-se em conectividade 5G, hardware, IoT e serviços públicos digitais.",                             tags: ["5G", "Hardware", "IoT"] },
  { name: "Singapura",      lat:   1.3521, lon: 103.8198, country: "Singapura",      desc: "Líder asiática em cidades inteligentes, investimento em Inteligência Artificial e forte atração de talentos internacionais.",               tags: ["Smart City", "IA", "Talentos"] },
  { name: "Shenzhen",       lat:  22.5431, lon: 114.0579, country: "China",          desc: "O 'Vale do Silício do Hardware', principal polo mundial de fabricação, prototipagem rápida e inovação industrial.",                          tags: ["Hardware", "Manufatura", "IoT"] },
  { name: "Bangalore",      lat:  12.9716, lon:  77.5946, country: "Índia",          desc: "Vale do Silício da Índia, concentra a maior força de trabalho global em terceirização de TI e serviços de software.",                      tags: ["TI", "Software", "Outsourcing"] },
  { name: "Berlim",         lat:  52.52,   lon:  13.405,  country: "Alemanha",       desc: "Um dos maiores polos de startups na Europa, com foco em e-commerce, software e cultura tecnológica aberta.",                               tags: ["Startups", "E-commerce", "Software"] },
  { name: "São Paulo",      lat: -23.5505, lon: -46.6333, country: "Brasil",         desc: "Principal motor de inovação e tecnologia da América Latina, abrigando a maior concentração de fintechs e unicórnios da região.",            tags: ["Fintech", "Unicórnios", "LatAm"] },
  { name: "Tel Aviv",       lat:  32.0853, lon:  34.7818, country: "Israel",         desc: "Silicon Wadi, líder global em segurança digital, defesa e inteligência artificial profunda.",                                               tags: ["Cybersecurity", "IA", "Defesa"] },
  { name: "Paris",          lat:  48.8566, lon:   2.3522, country: "França",         desc: "Grande polo europeu em forte ascensão, destacando-se em pesquisas avançadas de IA e investimentos governamentais no setor.",                tags: ["IA", "Pesquisa", "Inovação"] },
  { name: "Amsterdã",       lat:  52.3676, lon:   4.9041, country: "Países Baixos",  desc: "Hub estratégico na Europa para semicondutores, logística inteligente, computação em nuvem e tecnologia verde.",                            tags: ["Semicondutores", "Cloud", "Cleantech"] },
  { name: "Toronto",        lat:  43.6532, lon: -79.3832, country: "Canadá",         desc: "Terceiro maior centro de tecnologia da América do Norte, reconhecido pela pesquisa pioneira em redes neurais e IA.",                        tags: ["IA", "Redes Neurais", "Academia"] },
  { name: "Sydney",         lat: -33.8688, lon: 151.2093, country: "Austrália",      desc: "Principal motor tecnológico da Oceania, concentrando unicórnios de software corporativo, design digital e fintechs.",                       tags: ["Software", "Fintech", "Design"] },
  { name: "Xangai",         lat:  31.2304, lon: 121.4737, country: "China",          desc: "Gigante asiático focado em semicondutores, veículos elétricos autônomos, e-commerce e supercomputação.",                                   tags: ["Semicondutores", "IA", "EVs"] },
  { name: "Austin",         lat:  30.2672, lon: -97.7431, country: "EUA",            desc: "Silicon Hills, atrai gigantes de hardware e software pelo custo competitivo e forte cultura de inovação.",                                  tags: ["Hardware", "Software", "Inovação"] },
  { name: "Estocolmo",      lat:  59.3293, lon:  18.0686, country: "Suécia",         desc: "Fábrica de unicórnios europeia, famosa por criar gigantes de streaming, jogos eletrônicos e pagamentos digitais.",                          tags: ["Streaming", "Games", "Pagamentos"] },
  { name: "Pequim",         lat:  39.9042, lon: 116.4074, country: "China",          desc: "Centro acadêmico que abriga as sedes das maiores empresas de internet da China e investimentos massivos em IA e computação quântica.",       tags: ["IA", "Internet", "Quantum"] },
  { name: "Munique",        lat:  48.1351, lon:  11.582,  country: "Alemanha",       desc: "Polo de tecnologia industrial avançada, liderando em engenharia automotiva digital, IIoT e aeroespacial.",                                  tags: ["Automotivo", "IIoT", "Aeroespacial"] },
];



interface UserLoc {
  name: string;
  lat: number;
  lon: number;
}

setDefaultOptions({ css: true });

const GlobeBackground = () => {
  const mountedRef = useRef(true);

  const userLocRef = useRef<UserLoc | null>(null);
  const userPtRef = useRef<any>(null);
  const activeArcRef = useRef<ArcState | null>(null);
  const cityScreenPosRef = useRef<Array<{ x: number; y: number } | null>>(
    new Array(CITIES.length).fill(null)
  );
  const dayLayerRef = useRef<any>(null);
  const nightLayerRef = useRef<any>(null);
  const isHoveringRef = useRef(false);
  const hoveredNameRef = useRef<string | null>(null);
  const [hoverCity, setHoverCity] = useState<{ city: City; x: number; y: number } | null>(null);

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

  // Escuta evento globeNightToggle disparado pelo WeatherBar
  useEffect(() => {
    const applyNight = (isNight: boolean) => {
      const dayL = dayLayerRef.current;
      const nightL = nightLayerRef.current;
      if (dayL && nightL) {
        dayL.visible = !isNight;
        nightL.visible = isNight;
      }
      const el = document.getElementById("globeBgDiv");
      if (el) el.style.filter = isNight ? "brightness(0.6)" : "";
    };

    const handler = (e: Event) => applyNight((e as CustomEvent).detail.nightMode);
    window.addEventListener("globeNightToggle", handler);
    return () => window.removeEventListener("globeNightToggle", handler);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cleanupResize = () => {};

    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

      loadModules([
        "esri/config",
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/TileLayer",
        "esri/layers/BaseTileLayer",
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
            BaseTileLayer,
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

            const isNightSaved = localStorage.getItem("globeNight") === "1";

            const dayLayer = new TileLayer({
              url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
              copyright: "Tiles © Esri",
              visible: true,
            });
            // BaseTileLayer personalizado: coloriza cada tile via Canvas 2D
            // antes do ESRI renderizar — só afeta os tiles, não estrelas/atmosfera
            const GoldenNightLayer = BaseTileLayer.createSubclass({
              fetchTile(level: number, row: number, col: number) {
                const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/${level}/${row}/${col}.png`;
                return new Promise<HTMLCanvasElement>((resolve) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  const sz = 256;
                  img.onload = () => {
                    const w = img.width || sz, h = img.height || sz;
                    const canvas = document.createElement("canvas");
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) { resolve(canvas); return; }
                    ctx.drawImage(img, 0, 0);

                    // Mapeamento pixel a pixel: transforma cinza em paleta de luzes quentes
                    // preto → preto | baixo brilho → âmbar | alto brilho → ouro/branco-dourado
                    const id = ctx.getImageData(0, 0, w, h);
                    const d = id.data;
                    for (let i = 0; i < d.length; i += 4) {
                      const b = d[i] / 255;              // brightness 0–1 (grayscale)
                      const e = Math.pow(b, 0.65);       // realça midtones
                      d[i]   = Math.min(255, e * 255);               // R: pleno
                      d[i+1] = Math.min(255, e * e * 230);           // G: quadrático → âmbar/ouro
                      d[i+2] = Math.min(255, Math.pow(e, 3.5) * 120); // B: cúbico → toque azul só no núcleo
                    }
                    ctx.putImageData(id, 0, 0);
                    resolve(canvas);
                  };
                  img.onerror = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = sz; canvas.height = sz;
                    resolve(canvas);
                  };
                  img.src = url;
                });
              },
            });

            const nightLayer = new GoldenNightLayer({
              copyright: "NASA Black Marble — VIIRS 2016 / NASA GIBS",
              visible: false,
            });
            dayLayerRef.current = dayLayer;
            nightLayerRef.current = nightLayer;

            const basemap = new Basemap({
              baseLayers: [dayLayer, nightLayer],
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
                position: [-55.03975781, 14.94826384, 65000000],
                heading: 0,
                tilt: 0,
              },
              environment: {
                background: { type: "color", color: [0, 0, 0, 0] },
                starsEnabled: false,
                atmosphereEnabled: false,
                lighting: { type: "virtual" },
              },
              constraints: {
                altitude: { min: 4000000, max: 70000000 },
              },
              ui: { components: [] },
            });

            // Override CSS do ESRI que pode opacificar o container
            const esriOverride = document.createElement("style");
            esriOverride.id = "esri-bg-override";
            esriOverride.textContent =
              "#globeBgDiv,#globeBgDiv .esri-view,#globeBgDiv .esri-view-root," +
              "#globeBgDiv .esri-view-surface,#globeBgDiv .esri-display-object" +
              "{background:transparent!important;background-color:transparent!important;}";
            document.head.appendChild(esriOverride);

            if (isNightSaved) {
              dayLayer.visible = false;
              nightLayer.visible = true;
              const el = document.getElementById("globeBgDiv");
              if (el) el.style.filter = "brightness(0.6)";
            }

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

            // Clique → arco de voo para Vitória-ES
            view.on("click", (evt: any) => {
              const RADIUS = 18;
              const positions = cityScreenPosRef.current;
              for (let i = 0; i < positions.length; i++) {
                const cp = positions[i];
                if (!cp) continue;
                const dx = evt.x - cp.x, dy = evt.y - cp.y;
                if (Math.sqrt(dx * dx + dy * dy) < RADIUS) {
                  const city = CITIES[i];
                  if (city.name === HOME.name) return;
                  const N = 80;
                  const arcPts = Array.from({ length: N + 1 }, (_, j) => {
                    const t = j / N;
                    const mid = slerpPoint(city.lat, city.lon, HOME.lat, HOME.lon, t);
                    const alt = Math.sin(t * Math.PI) * 1200000;
                    return new Point({ longitude: mid.lon, latitude: mid.lat, z: alt });
                  });
                  activeArcRef.current = {
                    points: arcPts,
                    fromName: city.name,
                    fromLat: city.lat,
                    fromLon: city.lon,
                    progress: 0,
                    phase: "drawing",
                    startTime: performance.now(),
                    fadeStart: 0,
                    opacity: 1,
                  };
                  return;
                }
              }
            });

            // Cursor pointer e hover modal ao passar sobre um pin
            view.on("pointer-move", (evt: any) => {
              const positions = cityScreenPosRef.current;
              let over = false;
              for (let i = 0; i < positions.length; i++) {
                const cp = positions[i];
                if (!cp) continue;
                const dx = evt.x - cp.x, dy = evt.y - cp.y;
                if (dx * dx + dy * dy < 18 * 18) {
                  over = true;
                  const city = CITIES[i];
                  if (hoveredNameRef.current !== city.name) {
                    hoveredNameRef.current = city.name;
                    setHoverCity({ city, x: evt.x, y: evt.y });
                  }
                  isHoveringRef.current = true;
                  break;
                }
              }
              if (!over && isHoveringRef.current) {
                isHoveringRef.current = false;
                hoveredNameRef.current = null;
                setHoverCity(null);
              }
              const el = document.getElementById("globeBgDiv");
              if (el) el.style.cursor = over ? "pointer" : "default";
            });

            view.when(() => {
              watchUtils.whenFalseOnce(view, "updating", () => {
                // Loop de rotação — só inicia após a animação de entrada
                const rotate = () => {
                  if (!mountedRef.current) return;
                  if (!userInteracting && !isHoveringRef.current) {
                    const cam = view.camera.clone();
                    const arc = activeArcRef.current;
                    if (arc && (arc.phase === "drawing" || arc.phase === "holding")) {
                      const t = arc.phase === "drawing" ? arc.progress : 1;
                      const tip = slerpPoint(arc.fromLat, arc.fromLon, HOME.lat, HOME.lon, t);
                      const diff = ((tip.lon - cam.position.longitude + 540) % 360) - 180;
                      cam.position.longitude += diff * 0.025;
                      cam.position.latitude += (tip.lat - cam.position.latitude) * 0.015;
                    } else {
                      cam.position.longitude -= 0.15;
                    }
                    view.goTo(cam, { animate: false });
                  }
                  requestAnimationFrame(rotate);
                };

                // Animação de entrada: zoom dramático do espaço até posição final
                view
                  .goTo(
                    {
                      position: { longitude: -55.03975781, latitude: 14.94826384, z: 19921223.30821 },
                      heading: 2.03,
                      tilt: 0.13,
                    },
                    { animate: true, duration: 4000, easing: "out-expo" }
                  )
                  .then(() => {
                    if (!mountedRef.current) return;
                    view.constraints.altitude.max = 25000000;
                    rotate();
                  })
                  .catch(() => {
                    if (mountedRef.current) {
                      view.constraints.altitude.max = 25000000;
                      rotate();
                    }
                  });

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

                  const cam = view.camera.position;
                  cityPoints.forEach((pt, i) => {
                    cityScreenPosRef.current[i] = null;
                    try {
                      if (!isFacing(cam.latitude, cam.longitude, CITIES[i].lat, CITIES[i].lon)) return;
                      const sp = view.toScreen(pt);
                      if (!sp) return;
                      cityScreenPosRef.current[i] = { x: sp.x, y: sp.y };

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
                  if (userLoc && isFacing(cam.latitude, cam.longitude, userLoc.lat, userLoc.lon)) {
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

                  // Arco de voo animado
                  const arc = activeArcRef.current;
                  if (arc) {
                    const now = performance.now();
                    const elapsed = now - arc.startTime;
                    const DRAW_MS = 2800, HOLD_MS = 1800, FADE_MS = 900;

                    if (arc.phase === "drawing") {
                      arc.progress = Math.min(1, elapsed / DRAW_MS);
                      if (arc.progress >= 1) arc.phase = "holding";
                    } else if (arc.phase === "holding") {
                      if (elapsed - DRAW_MS > HOLD_MS) { arc.phase = "fading"; arc.fadeStart = now; }
                    } else {
                      arc.opacity = Math.max(0, 1 - (now - arc.fadeStart) / FADE_MS);
                      if (arc.opacity <= 0) { activeArcRef.current = null; }
                    }

                    if (arc.opacity > 0) {
                      const count = Math.floor(arc.progress * arc.points.length);
                      const spts: Array<{ x: number; y: number }> = [];
                      for (let j = 0; j <= count && j < arc.points.length; j++) {
                        try {
                          const sp = view.toScreen(arc.points[j]);
                          if (sp) spts.push({ x: sp.x, y: sp.y });
                        } catch { /* fora do campo */ }
                      }

                      if (spts.length > 1) {
                        ctx.save();
                        ctx.globalAlpha = arc.opacity;
                        ctx.strokeStyle = "#ff9900";
                        ctx.lineWidth = 2;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "#ff9900";
                        ctx.beginPath();
                        ctx.moveTo(spts[0].x, spts[0].y);
                        for (let j = 1; j < spts.length; j++) ctx.lineTo(spts[j].x, spts[j].y);
                        ctx.stroke();
                        ctx.shadowBlur = 0;

                        // Ponta do "avião"
                        const tip = spts[spts.length - 1];
                        ctx.beginPath();
                        ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
                        ctx.fillStyle = "#ff9900";
                        ctx.shadowBlur = 12;
                        ctx.shadowColor = "#ff9900";
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // Label no meio do arco
                        const mid = spts[Math.floor(spts.length / 2)];
                        if (mid) {
                          ctx.font = "bold 11px monospace";
                          ctx.fillStyle = "#ff9900";
                          ctx.fillText(`✈ ${arc.fromName} → Vitória-ES`, mid.x + 10, mid.y - 8);
                        }
                        ctx.restore();
                      }
                    }
                  }

                  frame++;
                  requestAnimationFrame(drawPins);
                };
                drawPins();

                const onResize = () => setupCanvas();
                window.addEventListener("resize", onResize);
                cleanupResize = () => window.removeEventListener("resize", onResize);
              });
            });
          }
        )
        .catch(console.error);
    }, 3000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      cleanupResize();
      document.getElementById("esri-bg-override")?.remove();
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
          zIndex: 2,
          pointerEvents: "auto",
          opacity: 1,
          background: "transparent",
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
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {hoverCity && hoverCity.city.desc && (
        <div
          style={{
            position: "fixed",
            left: Math.min(hoverCity.x + 22, window.innerWidth - 310),
            top: Math.max(hoverCity.y - 120, 8),
            zIndex: 20,
            width: "290px",
            background: "rgba(0, 10, 2, 0.96)",
            border: "1px solid #00ff41",
            borderRadius: "6px",
            padding: "12px 14px",
            fontFamily: "monospace",
            pointerEvents: "none",
            boxShadow: "0 0 24px rgba(0,255,65,0.25), inset 0 0 30px rgba(0,255,65,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", borderBottom: "1px solid rgba(0,255,65,0.25)", paddingBottom: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#42ff6b" }}>
              {hoverCity.city.name}
            </span>
            <span style={{ fontSize: "10px", color: "#00cc33" }}>
              {hoverCity.city.country}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#00e055", lineHeight: "1.6" }}>
            {hoverCity.city.desc}
          </div>
          {hoverCity.city.tags.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {hoverCity.city.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(0,255,65,0.1)",
                    border: "1px solid rgba(0,255,65,0.35)",
                    borderRadius: "3px",
                    padding: "2px 7px",
                    fontSize: "10px",
                    color: "#00ff41",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

    </>
  );
};

export default GlobeBackground;
