import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { loadModules, setDefaultOptions } from "esri-loader";
import {
  citySlug,
  COUNTRY_ISO,
  isFacing,
  slerpPoint,
  HOME,
  CITIES,
  type City,
  type UserLoc,
  type ArcState,
  type EsriAny,
} from "./geo";
import {
  loadWindGrid,
  advanceParticle,
  createRandomParticle,
  sampleWind,
  windSpeed,
  speedToColor,
  type WindGrid,
  type WindParticle,
} from "./wind";
import {
  loadOceanGrid,
  createRandomOceanParticle,
  advanceOceanParticle,
  oceanSpeedToColor,
  type OceanParticle,
} from "./ocean";
import { loadQuakes, quakeColor, quakeRadius, type Quake } from "./quakes";
import { loadIssPosition, ISS_POLL_INTERVAL_MS, type IssPosition } from "./iss";
import { loadVolcanoes, volcanoColor, volcanoRadius, type Volcano } from "./volcanoes";
import { loadHurricanes, hurricaneColor, hurricaneRadius, drawHurricaneIcon, type Hurricane } from "./hurricanes";
import { loadSatellites, satelliteColor, type Satellite } from "./satellites";
import { loadAircraft, aircraftColor, type Aircraft } from "./aircraft";
import { TOP_CITIES, cityColor, cityRadius, type City as CityData } from "./cities";
import { loadAirQuality, loadWildfires, loadLightning, aqiColor, wildfireColor, lightningColor, type AirQuality, type Wildfire, type Lightning } from "./hazards";
import { loadTechHubs, techHubColor, type TechHub } from "./infrastructure";

setDefaultOptions({ css: true });

// Partículas suficientes pra dar sensação de correntes contínuas sem pesar
// demais no toScreen() (projeção 3D→2D) chamado por partícula a cada frame.
const WIND_PARTICLE_COUNT = 700;
const OCEAN_PARTICLE_COUNT = 400;
// Alpha do "destination-in" aplicado no canvas de vento a cada frame — abaixo
// de 1 multiplica a opacidade existente, criando o efeito de rastro que
// desbota (em vez de limpar tudo, como o canvas dos pins das cidades faz).
const WIND_TRAIL_FADE = 0.93;
// Acima disso (em pixels de tela) um salto entre frames é tratado como
// "partícula recém-nascida noutro lugar" e não desenha uma linha falsa
// ligando o ponto antigo ao novo.
const WIND_MAX_TRAIL_JUMP_PX = 80;

// Cache de clima: { "lat,lon": { temp, code, timestamp } }
const weatherCache = new Map<string, { temp: number; code: number; timezone: string; timestamp: number }>();

const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Limpo" },
  1: { icon: "🌤️", label: "Quase limpo" },
  2: { icon: "⛅", label: "Parcialmente nublado" },
  3: { icon: "☁️", label: "Nublado" },
  45: { icon: "🌫️", label: "Neblina" },
  48: { icon: "🌫️", label: "Geada" },
  51: { icon: "🌦️", label: "Garoa leve" },
  53: { icon: "🌦️", label: "Garoa" },
  55: { icon: "🌧️", label: "Garoa densa" },
  61: { icon: "🌧️", label: "Chuva leve" },
  63: { icon: "🌧️", label: "Chuva" },
  65: { icon: "🌧️", label: "Chuva forte" },
  71: { icon: "❄️", label: "Neve leve" },
  73: { icon: "❄️", label: "Neve" },
  75: { icon: "❄️", label: "Neve forte" },
  77: { icon: "❄️", label: "Granizo" },
  80: { icon: "🌦️", label: "Pancadas leves" },
  81: { icon: "🌧️", label: "Pancadas" },
  82: { icon: "⛈️", label: "Pancadas fortes" },
  85: { icon: "❄️", label: "Neve leve" },
  86: { icon: "❄️", label: "Neve forte" },
  95: { icon: "⛈️", label: "Tempestade" },
  96: { icon: "⛈️", label: "Tempestade c/ granizo" },
  99: { icon: "⛈️", label: "Tempestade c/ granizo" },
};

const fetchCityWeather = async (lat: number, lon: number): Promise<{ temp: number; code: number; timezone: string } | null> => {
  const key = `${lat},${lon}`;
  const cached = weatherCache.get(key);
  const now = Date.now();

  // Cache válido por 2h (7200000ms)
  if (cached && now - cached.timestamp < 7200000) {
    return { temp: cached.temp, code: cached.code, timezone: cached.timezone };
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const { temperature_2m, weather_code } = data.current ?? {};
    const { timezone } = data;

    if (temperature_2m == null || weather_code == null || !timezone) return null;

    const result = { temp: Math.round(temperature_2m), code: weather_code, timezone };
    weatherCache.set(key, { ...result, timestamp: now });
    return result;
  } catch {
    return null;
  }
};

const GlobeBackground = () => {
  const intl = useIntl();
  const mountedRef = useRef(true);

  const userLocRef = useRef<UserLoc | null>(null);
  const userPtRef = useRef<EsriAny>(null);
  const activeArcRef = useRef<ArcState | null>(null);
  const cityScreenPosRef = useRef<Array<{ x: number; y: number } | null>>(
    new Array(CITIES.length).fill(null)
  );
  const quakeScreenPosRef = useRef<Array<{ x: number; y: number; mag: number; place: string; time: number } | null>>(
    []
  );
  const issScreenPosRef = useRef<{ x: number; y: number; lat: number; lon: number; altitude?: number; velocity?: number } | null>(
    null
  );
  const volcanoScreenPosRef = useRef<
    Array<{ x: number; y: number; name: string; country: string; type: string; elevation: number } | null>
  >([]);
  const hurricaneScreenPosRef = useRef<
    Array<{ x: number; y: number; name: string; windSpeed: number; pressure: number; category: number } | null>
  >([]);
  const satelliteScreenPosRef = useRef<Array<{ x: number; y: number; name: string; altitude: number } | null>>([]);
  const aircraftScreenPosRef = useRef<Array<{ x: number; y: number; callsign: string; altitude: number } | null>>([]);
  const cityScreenPosRef2 = useRef<Array<{ x: number; y: number; name: string; population: number } | null>>([]);
  const airQualityScreenPosRef = useRef<Array<{ x: number; y: number; name: string; aqi: number } | null>>([]);
  const wildfireScreenPosRef = useRef<Array<{ x: number; y: number; name: string; confidence: number } | null>>([]);
  const lightningScreenPosRef = useRef<Array<{ x: number; y: number } | null>>([]);
  const techHubScreenPosRef = useRef<Array<{ x: number; y: number; name: string; sector: string } | null>>([]);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; lines: string[] } | null>(null);
  const dayLayerRef = useRef<EsriAny>(null);
  const nightLayerRef = useRef<EsriAny>(null);
  const windEnabledRef = useRef(localStorage.getItem("globeWind") !== "0");
  const oceanEnabledRef = useRef(localStorage.getItem("globeOcean") !== "0");
  const quakesEnabledRef = useRef(localStorage.getItem("globeQuakes") !== "0");
  const issEnabledRef = useRef(localStorage.getItem("globeIss") !== "0");
  const volcanoesEnabledRef = useRef(localStorage.getItem("globeVolcanoes") !== "0");
  const hurricanesEnabledRef = useRef(localStorage.getItem("globeHurricanes") !== "0");
  const satellitesEnabledRef = useRef(localStorage.getItem("globeSatellites") !== "0");
  const aircraftEnabledRef = useRef(localStorage.getItem("globeAircraft") !== "0");
  const citiesEnabledRef = useRef(localStorage.getItem("globeCities") !== "0");
  const airQualityEnabledRef = useRef(localStorage.getItem("globeAirQuality") !== "0");
  const wildfiresEnabledRef = useRef(localStorage.getItem("globeWildfires") !== "0");
  const lightningEnabledRef = useRef(localStorage.getItem("globeLightning") !== "0");
  const techHubsEnabledRef = useRef(localStorage.getItem("globeTechHubs") !== "0");
  const rotationEnabledRef = useRef(localStorage.getItem("globeRotation") !== "0");
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

  // Vento e correntes marítimas desenham no mesmo canvas (mesmo efeito de
  // rastro que desbota) — só limpa de vez quando os DOIS ficam desligados;
  // se só um for desligado, o rastro dele desbota naturalmente no fade do
  // outro, sem precisar de um clear abrupto.
  const clearWindCanvasIfBothOff = () => {
    if (windEnabledRef.current || oceanEnabledRef.current) return;
    const wc = document.getElementById("globeWindOverlay") as HTMLCanvasElement | null;
    const wctx = wc?.getContext("2d");
    wctx?.clearRect(0, 0, wc?.width ?? 0, wc?.height ?? 0);
  };

  // Escuta evento globeWindToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      windEnabledRef.current = (e as CustomEvent).detail.windEnabled as boolean;
      clearWindCanvasIfBothOff();
    };
    window.addEventListener("globeWindToggle", handler);
    return () => window.removeEventListener("globeWindToggle", handler);
  }, []);

  // Escuta evento globeOceanToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      oceanEnabledRef.current = (e as CustomEvent).detail.oceanEnabled as boolean;
      clearWindCanvasIfBothOff();
    };
    window.addEventListener("globeOceanToggle", handler);
    return () => window.removeEventListener("globeOceanToggle", handler);
  }, []);

  // Escuta evento globeQuakesToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      quakesEnabledRef.current = (e as CustomEvent).detail.quakesEnabled as boolean;
    };
    window.addEventListener("globeQuakesToggle", handler);
    return () => window.removeEventListener("globeQuakesToggle", handler);
  }, []);

  // Escuta evento globeIssToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      issEnabledRef.current = (e as CustomEvent).detail.issEnabled as boolean;
    };
    window.addEventListener("globeIssToggle", handler);
    return () => window.removeEventListener("globeIssToggle", handler);
  }, []);

  // Escuta evento globeRotationToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      rotationEnabledRef.current = (e as CustomEvent).detail.rotationEnabled as boolean;
    };
    window.addEventListener("globeRotationToggle", handler);
    return () => window.removeEventListener("globeRotationToggle", handler);
  }, []);

  // Escuta evento globoVolcanoesToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      volcanoesEnabledRef.current = (e as CustomEvent).detail.volcanoesEnabled as boolean;
    };
    window.addEventListener("globoVolcanoesToggle", handler);
    return () => window.removeEventListener("globoVolcanoesToggle", handler);
  }, []);

  // Escuta eventos de toggle disparados pelo WeatherBar
  useEffect(() => {
    const handlers = {
      globeHurricanesToggle: (e: Event) => {
        hurricanesEnabledRef.current = (e as CustomEvent).detail.hurricanesEnabled as boolean;
      },
      globeSatellitesToggle: (e: Event) => {
        satellitesEnabledRef.current = (e as CustomEvent).detail.satellitesEnabled as boolean;
      },
      globeAircraftToggle: (e: Event) => {
        aircraftEnabledRef.current = (e as CustomEvent).detail.aircraftEnabled as boolean;
      },
      globeCitiesToggle: (e: Event) => {
        citiesEnabledRef.current = (e as CustomEvent).detail.citiesEnabled as boolean;
      },
      globeAirQualityToggle: (e: Event) => {
        airQualityEnabledRef.current = (e as CustomEvent).detail.airQualityEnabled as boolean;
      },
      globeWildfiresToggle: (e: Event) => {
        wildfiresEnabledRef.current = (e as CustomEvent).detail.wildfiresEnabled as boolean;
      },
      globeLightningToggle: (e: Event) => {
        lightningEnabledRef.current = (e as CustomEvent).detail.lightningEnabled as boolean;
      },
      globeTechHubsToggle: (e: Event) => {
        techHubsEnabledRef.current = (e as CustomEvent).detail.techHubsEnabled as boolean;
      },
    };
    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler);
    });
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cleanupResize = () => {};
    let issIntervalId: ReturnType<typeof setInterval> | null = null;

    // 8 Novas features — variáveis no escopo do useEffect pra acessibilidade
    let satellites: Satellite[] = [];
    let aircraft: Aircraft[] = [];
    const cities: CityData[] = TOP_CITIES;
    let airQuality: AirQuality[] = [];
    let wildfires: Wildfire[] = [];
    let lightning: Lightning[] = [];
    let techHubs: TechHub[] = [];

    // Carrega dados
    Promise.all([
      loadSatellites().then((d) => { satellites = d; }),
      loadAircraft().then((d) => { aircraft = d; }),
      loadAirQuality().then((d) => { airQuality = d; }),
      loadWildfires().then((d) => { wildfires = d; }),
      loadLightning().then((d) => { lightning = d; }),
      loadTechHubs().then((d) => { techHubs = d; }),
    ]).catch(() => {});

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
            const NightLayer = BaseTileLayer.createSubclass({
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
                    const id = ctx.getImageData(0, 0, w, h);
                    const d = id.data;
                    for (let i = 0; i < d.length; i += 4) {
                      const b = d[i] / 255;
                      if (b < 0.11) {
                        // preto puro — elimina marrom de pixels oceânicos com brilho residual
                        d[i] = d[i+1] = d[i+2] = 0;
                      } else {
                        const t = (b - 0.11) / 0.89;
                        const e = Math.pow(t, 0.5);
                        d[i]   = Math.min(255, e * 255);
                        d[i+1] = Math.min(255, Math.pow(e, 1.8) * 210);
                        d[i+2] = Math.min(255, Math.pow(e, 5.5) * 80);
                      }
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
            const nightLayer = new NightLayer({
              copyright: "NASA Black Marble — VIIRS / NASA GIBS",
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
            view.on("click", (evt: { x: number; y: number }) => {
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

            // Cursor pointer e hover modal/legenda ao passar sobre um pin
            view.on("pointer-move", (evt: { x: number; y: number }) => {
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
                    // Buscar clima se não tiver em cache
                    if (!city.temp || !city.weather_code) {
                      fetchCityWeather(city.lat, city.lon).then((weather) => {
                        if (weather && mountedRef.current) {
                          city.temp = weather.temp;
                          city.weather_code = weather.code;
                          city.timezone = weather.timezone;
                          setHoverCity({ city, x: evt.x, y: evt.y });
                        }
                      });
                    } else {
                      setHoverCity({ city, x: evt.x, y: evt.y });
                    }
                    setHoverInfo(null);
                  }
                  isHoveringRef.current = true;
                  break;
                }
              }

              if (!over) {
                // Terremotos
                const quakePositions = quakeScreenPosRef.current;
                for (let i = 0; i < quakePositions.length; i++) {
                  const qp = quakePositions[i];
                  if (!qp) continue;
                  const dx = evt.x - qp.x, dy = evt.y - qp.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    const key = `quake-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const hoursAgo = Math.max(0, (Date.now() - qp.time) / 3600000);
                      const when = hoursAgo < 1 ? "há menos de 1h" : `há ${Math.round(hoursAgo)}h`;
                      const lines = [
                        "🌋 Terremoto",
                        `M${qp.mag.toFixed(1)} (escala Richter) — ${qp.place}`,
                        when,
                      ];
                      const nearbyAqi = findNearbyAQI(qp.x, qp.y);
                      if (nearbyAqi) {
                        lines.push(`💨 AQI: ${nearbyAqi.aqi}`);
                      }
                      setHoverInfo({
                        x: evt.x,
                        y: evt.y,
                        lines,
                      });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // ISS
                const ip = issScreenPosRef.current;
                if (ip) {
                  const dx = evt.x - ip.x, dy = evt.y - ip.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    if (hoveredNameRef.current !== "iss") {
                      hoveredNameRef.current = "iss";
                      const lines = ["🛰 ISS — Estação Espacial Internacional"];
                      if (ip.altitude != null) lines.push(`Altitude: ${Math.round(ip.altitude)} km`);
                      if (ip.velocity != null) lines.push(`Velocidade: ${Math.round(ip.velocity)} km/h`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                  }
                }
              }

              if (!over) {
                // Vulcões
                const volcanoPositions = volcanoScreenPosRef.current;
                for (let i = 0; i < volcanoPositions.length; i++) {
                  const vp = volcanoPositions[i];
                  if (!vp) continue;
                  const dx = evt.x - vp.x, dy = evt.y - vp.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    const key = `volcano-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["🌋 Vulcão"];
                      if (vp.name) lines.push(`${vp.name}`);
                      if (vp.country) lines.push(`${vp.country}`);
                      if (vp.type) lines.push(`Tipo: ${vp.type}`);
                      if (vp.elevation) lines.push(`Elevação: ${vp.elevation} m`);
                      const nearbyAqi = findNearbyAQI(vp.x, vp.y);
                      if (nearbyAqi) {
                        lines.push(`💨 AQI: ${nearbyAqi.aqi}`);
                      }
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Furacões
                const hurricanePositions = hurricaneScreenPosRef.current;
                for (let i = 0; i < hurricanePositions.length; i++) {
                  const hp = hurricanePositions[i];
                  if (!hp) continue;
                  const dx = evt.x - hp.x, dy = evt.y - hp.y;
                  if (dx * dx + dy * dy < 24 * 24) {
                    over = true;
                    const key = `hurricane-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["🌀 Furacão"];
                      if (hp.name) lines.push(`${hp.name}`);
                      lines.push(`Categoria: ${hp.category}`);
                      if (hp.windSpeed) lines.push(`Velocidade: ${hp.windSpeed} km/h`);
                      if (hp.pressure) lines.push(`Pressão: ${hp.pressure} mb`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Satélites
                const satellitePositions = satelliteScreenPosRef.current;
                for (let i = 0; i < satellitePositions.length; i++) {
                  const sp = satellitePositions[i];
                  if (!sp) continue;
                  const dx = evt.x - sp.x, dy = evt.y - sp.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    const key = `satellite-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["🛰️ Satélite"];
                      if (sp.name) lines.push(`${sp.name}`);
                      if (sp.altitude) lines.push(`Altitude: ${sp.altitude} km`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Aviões
                const aircraftPositions = aircraftScreenPosRef.current;
                for (let i = 0; i < aircraftPositions.length; i++) {
                  const ap = aircraftPositions[i];
                  if (!ap) continue;
                  const dx = evt.x - ap.x, dy = evt.y - ap.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    const key = `aircraft-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["✈️ Voo"];
                      if (ap.callsign) lines.push(`${ap.callsign}`);
                      if (ap.altitude) lines.push(`Altitude: ${Math.round(ap.altitude / 1000)} km`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Cidades (novas)
                const cityPositions = cityScreenPosRef2.current;
                for (let i = 0; i < cityPositions.length; i++) {
                  const cp = cityPositions[i];
                  if (!cp) continue;
                  const dx = evt.x - cp.x, dy = evt.y - cp.y;
                  if (dx * dx + dy * dy < 20 * 20) {
                    over = true;
                    const key = `city-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["🌆 Cidade"];
                      if (cp.name) lines.push(`${cp.name}`);
                      if (cp.population) lines.push(`População: ${(cp.population / 1000000).toFixed(1)}M`);
                      // AQI da cidade (se existir) ou buscar AQI próximo
                      const city = cities[i];
                      if (city?.aqi) {
                        lines.push(`💨 AQI: ${city.aqi}`);
                      } else {
                        const nearbyAqi = findNearbyAQI(cp.x, cp.y);
                        if (nearbyAqi) {
                          lines.push(`💨 AQI: ${nearbyAqi.aqi}`);
                        }
                      }
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              // Função helper: detectar AQI próximo a um ponto
              const findNearbyAQI = (x: number, y: number) => {
                const aqiPositions = airQualityScreenPosRef.current;
                for (let i = 0; i < aqiPositions.length; i++) {
                  const aqip = aqiPositions[i];
                  if (!aqip) continue;
                  const dx = x - aqip.x, dy = y - aqip.y;
                  if (dx * dx + dy * dy < 30 * 30) {
                    return aqip;
                  }
                }
                return null;
              };

              if (!over) {
                // Qualidade do Ar
                const aqiPositions = airQualityScreenPosRef.current;
                for (let i = 0; i < aqiPositions.length; i++) {
                  const aqip = aqiPositions[i];
                  if (!aqip) continue;
                  const dx = evt.x - aqip.x, dy = evt.y - aqip.y;
                  if (dx * dx + dy * dy < 14 * 14) {
                    over = true;
                    const key = `aqi-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["💨 Qualidade do Ar"];
                      if (aqip.name) lines.push(`${aqip.name}`);
                      if (aqip.aqi) lines.push(`AQI: ${aqip.aqi}`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Incêndios
                const wildfirePositions = wildfireScreenPosRef.current;
                for (let i = 0; i < wildfirePositions.length; i++) {
                  const wp = wildfirePositions[i];
                  if (!wp) continue;
                  const dx = evt.x - wp.x, dy = evt.y - wp.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    const key = `wildfire-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["🔥 Incêndio"];
                      if (wp.name) lines.push(`${wp.name}`);
                      if (wp.confidence) lines.push(`Confiança: ${wp.confidence}%`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Raios
                const lightningPositions = lightningScreenPosRef.current;
                for (let i = 0; i < lightningPositions.length; i++) {
                  const lp = lightningPositions[i];
                  if (!lp) continue;
                  const dx = evt.x - lp.x, dy = evt.y - lp.y;
                  if (dx * dx + dy * dy < 12 * 12) {
                    over = true;
                    const key = `lightning-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["⚡ Descarga Elétrica"];
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over) {
                // Tech Hubs
                const techHubPositions = techHubScreenPosRef.current;
                for (let i = 0; i < techHubPositions.length; i++) {
                  const tp = techHubPositions[i];
                  if (!tp) continue;
                  const dx = evt.x - tp.x, dy = evt.y - tp.y;
                  if (dx * dx + dy * dy < 16 * 16) {
                    over = true;
                    const key = `techub-${i}`;
                    if (hoveredNameRef.current !== key) {
                      hoveredNameRef.current = key;
                      const lines: string[] = ["💻 Tech Hub"];
                      if (tp.name) lines.push(`${tp.name}`);
                      if (tp.sector) lines.push(`Setor: ${tp.sector}`);
                      setHoverInfo({ x: evt.x, y: evt.y, lines });
                      setHoverCity(null);
                    }
                    isHoveringRef.current = true;
                    break;
                  }
                }
              }

              if (!over && isHoveringRef.current) {
                isHoveringRef.current = false;
                hoveredNameRef.current = null;
                setHoverCity(null);
                setHoverInfo(null);
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
                    const arc = activeArcRef.current;
                    const arcActive = arc && (arc.phase === "drawing" || arc.phase === "holding");
                    if (arcActive || rotationEnabledRef.current) {
                      const cam = view.camera.clone();
                      if (arcActive) {
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

                // Canvas dedicado às correntes de vento — separado do canvas
                // dos pins porque usa "destination-in" pra desbotar o rastro
                // em vez de limpar tudo a cada frame (os pins precisam de
                // clearRect puro, senão o pulso deixaria rastro também).
                const windCanvas = document.getElementById(
                  "globeWindOverlay"
                ) as HTMLCanvasElement | null;
                const windCtx = windCanvas?.getContext("2d") ?? null;

                const dpr = window.devicePixelRatio || 1;
                const setupCanvas = () => {
                  canvas.width = window.innerWidth * dpr;
                  canvas.height = window.innerHeight * dpr;
                  const c = canvas.getContext("2d");
                  if (c) c.scale(dpr, dpr);
                  if (windCanvas) {
                    windCanvas.width = window.innerWidth * dpr;
                    windCanvas.height = window.innerHeight * dpr;
                    windCtx?.scale(dpr, dpr);
                  }
                };
                setupCanvas();

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const cityPoints = CITIES.map(
                  (c) => new Point({ longitude: c.lon, latitude: c.lat, z: 50000 })
                );

                // Vento real (GFS via firestorm-wind-data) e correntes
                // marítimas reais (Open-Meteo Marine) — carregam em
                // paralelo, sem bloquear o resto do setup.
                let windGrid: WindGrid | null = null;
                let windParticles: WindParticle[] = [];
                let windPrevScreen: Array<{ x: number; y: number } | null> = [];
                loadWindGrid().then((grid) => {
                  if (!mountedRef.current || !grid) return;
                  windGrid = grid;
                  windParticles = Array.from({ length: WIND_PARTICLE_COUNT }, createRandomParticle);
                  windPrevScreen = new Array(WIND_PARTICLE_COUNT).fill(null);
                });

                let oceanGrid: WindGrid | null = null;
                let oceanParticles: OceanParticle[] = [];
                let oceanPrevScreen: Array<{ x: number; y: number } | null> = [];
                loadOceanGrid().then((grid) => {
                  if (!mountedRef.current || !grid) return;
                  oceanGrid = grid;
                  oceanParticles = Array.from({ length: OCEAN_PARTICLE_COUNT }, createRandomOceanParticle);
                  oceanPrevScreen = new Array(OCEAN_PARTICLE_COUNT).fill(null);
                });

                // Terremotos reais (USGS) — carrega uma vez; a lista de
                // sismos de M4.5+ nas últimas 24h não muda tão rápido que
                // precise de polling.
                let quakes: Quake[] = [];
                loadQuakes().then((data) => {
                  if (!mountedRef.current) return;
                  quakes = data;
                });

                // Posição real da ISS — se move rápido, precisa de polling.
                let issPos: IssPosition | null = null;
                const pollIss = () => {
                  loadIssPosition().then((pos) => {
                    if (!mountedRef.current || !pos) return;
                    issPos = pos;
                  });
                };
                pollIss();
                issIntervalId = setInterval(pollIss, ISS_POLL_INTERVAL_MS);

                // Vulcões reais (425 vulcões, lista estática)
                let volcanoes: Volcano[] = [];
                loadVolcanoes().then((data) => {
                  if (!mountedRef.current) return;
                  volcanoes = data;
                });

                // Furacões e tempestades tropicais (carrega ao entrar na página)
                let hurricanes: Hurricane[] = [];
                loadHurricanes().then((data) => {
                  if (!mountedRef.current) return;
                  hurricanes = data;
                });


                // lon 0–360 (formato da grade) → -180..180 (formato do ArcGIS Point)
                const toArcgisLon = (lon: number) => (lon > 180 ? lon - 360 : lon);

                let frame = 0;
                const drawPins = () => {
                  if (!mountedRef.current) return;
                  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

                  const cam = view.camera.position;

                  // Correntes de vento e marítimas — cada partícula deixa uma
                  // linha curta da posição anterior pra atual, colorida pela
                  // velocidade; o canvas nunca é limpo de verdade, só
                  // desbotado (destination-in), dando a impressão de fluxo
                  // contínuo. As duas compartilham o mesmo canvas/fade.
                  const showWind = windEnabledRef.current && !!windGrid;
                  const showOcean = oceanEnabledRef.current && !!oceanGrid;
                  if ((showWind || showOcean) && windCtx && windCanvas) {
                    windCtx.save();
                    windCtx.globalCompositeOperation = "destination-in";
                    windCtx.fillStyle = `rgba(0,0,0,${WIND_TRAIL_FADE})`;
                    windCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                    windCtx.globalCompositeOperation = "source-over";
                    windCtx.lineCap = "round";

                    if (showWind && windGrid) {
                      windCtx.lineWidth = 1.3;
                      windCtx.setLineDash([]);
                      for (let i = 0; i < windParticles.length; i++) {
                        const prevScreen = windPrevScreen[i];
                        windParticles[i] = advanceParticle(windParticles[i], windGrid);
                        const p = windParticles[i];
                        if (!isFacing(cam.latitude, cam.longitude, p.lat, toArcgisLon(p.lon))) {
                          windPrevScreen[i] = null;
                          continue;
                        }
                        try {
                          const sp = view.toScreen(
                            new Point({ longitude: toArcgisLon(p.lon), latitude: p.lat, z: 40000 })
                          );
                          if (!sp) { windPrevScreen[i] = null; continue; }
                          if (prevScreen) {
                            const dx = sp.x - prevScreen.x, dy = sp.y - prevScreen.y;
                            if (dx * dx + dy * dy < WIND_MAX_TRAIL_JUMP_PX * WIND_MAX_TRAIL_JUMP_PX) {
                              const { u, v } = sampleWind(windGrid, p.lat, p.lon);
                              windCtx.strokeStyle = speedToColor(windSpeed(u, v));
                              windCtx.beginPath();
                              windCtx.moveTo(prevScreen.x, prevScreen.y);
                              windCtx.lineTo(sp.x, sp.y);
                              windCtx.stroke();
                            }
                          }
                          windPrevScreen[i] = { x: sp.x, y: sp.y };
                        } catch {
                          windPrevScreen[i] = null;
                        }
                      }
                    }

                    if (showOcean && oceanGrid) {
                      windCtx.lineWidth = 1.8;
                      // tracejado — leitura visual diferente do vento (que é
                      // sólido), convenção comum em mapas pra corrente marítima.
                      windCtx.setLineDash([3, 4]);
                      for (let i = 0; i < oceanParticles.length; i++) {
                        const prevScreen = oceanPrevScreen[i];
                        oceanParticles[i] = advanceOceanParticle(oceanParticles[i], oceanGrid);
                        const p = oceanParticles[i];
                        if (!isFacing(cam.latitude, cam.longitude, p.lat, toArcgisLon(p.lon))) {
                          oceanPrevScreen[i] = null;
                          continue;
                        }
                        try {
                          const sp = view.toScreen(
                            new Point({ longitude: toArcgisLon(p.lon), latitude: p.lat, z: 40000 })
                          );
                          if (!sp) { oceanPrevScreen[i] = null; continue; }
                          if (prevScreen) {
                            const dx = sp.x - prevScreen.x, dy = sp.y - prevScreen.y;
                            if (dx * dx + dy * dy < WIND_MAX_TRAIL_JUMP_PX * WIND_MAX_TRAIL_JUMP_PX) {
                              const { u, v } = sampleWind(oceanGrid, p.lat, p.lon);
                              windCtx.strokeStyle = oceanSpeedToColor(windSpeed(u, v));
                              windCtx.beginPath();
                              windCtx.moveTo(prevScreen.x, prevScreen.y);
                              windCtx.lineTo(sp.x, sp.y);
                              windCtx.stroke();
                            }
                          }
                          oceanPrevScreen[i] = { x: sp.x, y: sp.y };
                        } catch {
                          oceanPrevScreen[i] = null;
                        }
                      }
                    }

                    windCtx.restore();
                  }

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

                  // Terremotos reais (USGS, M4.5+ nas últimas 24h) — anel
                  // pulsante colorido/dimensionado pela magnitude.
                  if (quakeScreenPosRef.current.length !== quakes.length) {
                    quakeScreenPosRef.current = new Array(quakes.length).fill(null);
                  }
                  if (quakesEnabledRef.current) {
                    for (let i = 0; i < quakes.length; i++) {
                      quakeScreenPosRef.current[i] = null;
                      const q = quakes[i];
                      if (!isFacing(cam.latitude, cam.longitude, q.lat, q.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: q.lon, latitude: q.lat, z: 40000 })
                        );
                        if (!sp) continue;
                        quakeScreenPosRef.current[i] = { x: sp.x, y: sp.y, mag: q.mag, place: q.place, time: q.time };
                        const color = quakeColor(q.mag);
                        const radius = quakeRadius(q.mag);
                        const pulse = (Math.sin(frame * 0.05 + i * 1.7) + 1) / 2;

                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, radius + pulse * 8, 0, Math.PI * 2);
                        ctx.strokeStyle = color;
                        ctx.globalAlpha = 0.55 - pulse * 0.35;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.globalAlpha = 1;

                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = color;
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        ctx.font = "bold 10px monospace";
                        ctx.fillStyle = color;
                        ctx.fillText(`M${q.mag.toFixed(1)}`, sp.x + radius + 6, sp.y + 3);
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    quakeScreenPosRef.current.fill(null);
                  }

                  // Posição real da ISS — ponto azul pulsante com anel
                  issScreenPosRef.current = null;
                  if (issEnabledRef.current && issPos) {
                    if (isFacing(cam.latitude, cam.longitude, issPos.lat, issPos.lon)) {
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: issPos.lon, latitude: issPos.lat, z: 400000 })
                        );
                        if (sp) {
                          issScreenPosRef.current = {
                            x: sp.x,
                            y: sp.y,
                            lat: issPos.lat,
                            lon: issPos.lon,
                            altitude: issPos.altitude,
                            velocity: issPos.velocity,
                          };
                          const pulse = (Math.sin(frame * 0.08) + 1) / 2;

                          // Anel pulsante azul (2x maior)
                          ctx.beginPath();
                          ctx.arc(sp.x, sp.y, 16 + pulse * 20, 0, Math.PI * 2);
                          ctx.strokeStyle = `rgba(100,200,255,${0.5 - pulse * 0.35})`;
                          ctx.lineWidth = 2;
                          ctx.stroke();

                          // Anel fixo (2x maior)
                          ctx.beginPath();
                          ctx.arc(sp.x, sp.y, 10, 0, Math.PI * 2);
                          ctx.strokeStyle = "rgba(100,200,255,0.7)";
                          ctx.lineWidth = 1;
                          ctx.stroke();

                          // Ponto central azul escuro (2x maior)
                          ctx.beginPath();
                          ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
                          ctx.fillStyle = "#0066ff";
                          ctx.shadowBlur = 8;
                          ctx.shadowColor = "#0066ff";
                          ctx.fill();
                          ctx.shadowBlur = 0;

                          // Texto "ISS"
                          ctx.font = "bold 10px monospace";
                          ctx.fillStyle = "#0066ff";
                          ctx.fillText("🛰 ISS", sp.x + 14, sp.y - 4);
                        }
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  }

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

                  // Vulcões — pins triangulares coloridos pela elevação
                  if (volcanoScreenPosRef.current.length !== volcanoes.length) {
                    volcanoScreenPosRef.current = new Array(volcanoes.length).fill(null);
                  }
                  if (volcanoesEnabledRef.current) {
                    for (let i = 0; i < volcanoes.length; i++) {
                      volcanoScreenPosRef.current[i] = null;
                      const v = volcanoes[i];
                      if (!isFacing(cam.latitude, cam.longitude, v.lat, v.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: v.lon, latitude: v.lat, z: 50000 })
                        );
                        if (!sp) continue;
                        volcanoScreenPosRef.current[i] = { x: sp.x, y: sp.y, name: v.name, country: v.country, type: v.type, elevation: v.elevation };

                        const color = volcanoColor(v.type);
                        const radius = volcanoRadius(v.elevation);

                        // Triângulo (pico vulcânico)
                        ctx.beginPath();
                        ctx.moveTo(sp.x, sp.y - radius);
                        ctx.lineTo(sp.x + radius, sp.y + radius / 2);
                        ctx.lineTo(sp.x - radius, sp.y + radius / 2);
                        ctx.closePath();
                        ctx.fillStyle = color;
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = color;
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // Borda
                        ctx.strokeStyle = `rgba(255,255,255,0.6)`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    volcanoScreenPosRef.current.fill(null);
                  }

                  // Furacões — ícones de espiral coloridos pela categoria
                  if (hurricaneScreenPosRef.current.length !== hurricanes.length) {
                    hurricaneScreenPosRef.current = new Array(hurricanes.length).fill(null);
                  }
                  if (hurricanesEnabledRef.current) {
                    for (let i = 0; i < hurricanes.length; i++) {
                      hurricaneScreenPosRef.current[i] = null;
                      const h = hurricanes[i];
                      if (!isFacing(cam.latitude, cam.longitude, h.lat, h.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: h.lon, latitude: h.lat, z: 100000 })
                        );
                        if (!sp) continue;
                        hurricaneScreenPosRef.current[i] = { x: sp.x, y: sp.y, name: h.name, windSpeed: h.windSpeed, pressure: h.pressure, category: h.category };

                        const color = hurricaneColor(h.category);
                        const radius = hurricaneRadius(h.windSpeed);

                        // Renderiza ícone de furacão
                        drawHurricaneIcon(ctx, sp.x, sp.y, radius, color, h.name);
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    hurricaneScreenPosRef.current.fill(null);
                  }

                  // Satélites
                  if (satelliteScreenPosRef.current.length !== satellites.length) {
                    satelliteScreenPosRef.current = new Array(satellites.length).fill(null);
                  }
                  if (satellitesEnabledRef.current) {
                    for (let i = 0; i < satellites.length; i++) {
                      satelliteScreenPosRef.current[i] = null;
                      const s = satellites[i];
                      if (!isFacing(cam.latitude, cam.longitude, s.lat, s.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: s.lon, latitude: s.lat, z: 60000 })
                        );
                        if (!sp) continue;
                        satelliteScreenPosRef.current[i] = { x: sp.x, y: sp.y, name: s.name, altitude: s.altitude };
                        ctx.font = "bold 12px Arial";
                        ctx.fillText("🛰️", sp.x - 6, sp.y + 6);
                        ctx.font = "bold 9px monospace";
                        ctx.fillStyle = satelliteColor(s.type);
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = satelliteColor(s.type);
                        ctx.fillText(s.name, sp.x + 12, sp.y + 4);
                        ctx.shadowBlur = 0;
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    satelliteScreenPosRef.current.fill(null);
                  }

                  // Aviões
                  if (aircraftScreenPosRef.current.length !== aircraft.length) {
                    aircraftScreenPosRef.current = new Array(aircraft.length).fill(null);
                  }
                  if (aircraftEnabledRef.current) {
                    for (let i = 0; i < aircraft.length; i++) {
                      aircraftScreenPosRef.current[i] = null;
                      const a = aircraft[i];
                      if (!isFacing(cam.latitude, cam.longitude, a.lat, a.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: a.lon, latitude: a.lat, z: 60000 })
                        );
                        if (!sp) continue;
                        aircraftScreenPosRef.current[i] = { x: sp.x, y: sp.y, callsign: a.callsign, altitude: a.altitude };
                        ctx.font = "bold 12px Arial";
                        ctx.fillText("✈️", sp.x - 6, sp.y + 6);
                        ctx.font = "bold 9px monospace";
                        ctx.fillStyle = aircraftColor(a.altitude);
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = aircraftColor(a.altitude);
                        ctx.fillText(a.callsign, sp.x + 12, sp.y + 4);
                        ctx.shadowBlur = 0;
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    aircraftScreenPosRef.current.fill(null);
                  }

                  // Cidades
                  if (cityScreenPosRef2.current.length !== cities.length) {
                    cityScreenPosRef2.current = new Array(cities.length).fill(null);
                  }
                  if (citiesEnabledRef.current) {
                    for (let i = 0; i < cities.length; i++) {
                      cityScreenPosRef2.current[i] = null;
                      const c = cities[i];
                      if (!isFacing(cam.latitude, cam.longitude, c.lat, c.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: c.lon, latitude: c.lat, z: 50000 })
                        );
                        if (!sp) continue;
                        cityScreenPosRef2.current[i] = { x: sp.x, y: sp.y, name: c.name, population: c.population };
                        ctx.fillStyle = cityColor(c.type);
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, cityRadius(c.population), 0, Math.PI * 2);
                        ctx.fill();
                        ctx.font = "bold 10px monospace";
                        ctx.fillStyle = cityColor(c.type);
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = cityColor(c.type);
                        ctx.fillText(c.name, sp.x + 12, sp.y + 4);
                        ctx.shadowBlur = 0;
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    cityScreenPosRef2.current.fill(null);
                  }

                  // Qualidade do Ar
                  if (airQualityScreenPosRef.current.length !== airQuality.length) {
                    airQualityScreenPosRef.current = new Array(airQuality.length).fill(null);
                  }
                  if (airQualityEnabledRef.current) {
                    for (let i = 0; i < airQuality.length; i++) {
                      airQualityScreenPosRef.current[i] = null;
                      const a = airQuality[i];
                      if (!isFacing(cam.latitude, cam.longitude, a.lat, a.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: a.lon, latitude: a.lat, z: 50000 })
                        );
                        if (!sp) continue;
                        airQualityScreenPosRef.current[i] = { x: sp.x, y: sp.y, name: a.name, aqi: a.aqi };
                        ctx.fillStyle = aqiColor(a.aqi);
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.font = "bold 12px Arial";
                        ctx.fillText("💨", sp.x - 6, sp.y + 6);
                        ctx.font = "bold 9px monospace";
                        ctx.fillStyle = aqiColor(a.aqi);
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = aqiColor(a.aqi);
                        ctx.fillText(`AQI:${a.aqi}`, sp.x + 12, sp.y + 4);
                        ctx.shadowBlur = 0;
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    airQualityScreenPosRef.current.fill(null);
                  }

                  // Incêndios
                  if (wildfireScreenPosRef.current.length !== wildfires.length) {
                    wildfireScreenPosRef.current = new Array(wildfires.length).fill(null);
                  }
                  if (wildfiresEnabledRef.current) {
                    for (let i = 0; i < wildfires.length; i++) {
                      wildfireScreenPosRef.current[i] = null;
                      const w = wildfires[i];
                      if (!isFacing(cam.latitude, cam.longitude, w.lat, w.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: w.lon, latitude: w.lat, z: 50000 })
                        );
                        if (!sp) continue;
                        wildfireScreenPosRef.current[i] = { x: sp.x, y: sp.y, name: w.name, confidence: w.confidence };
                        ctx.font = "bold 14px Arial";
                        ctx.fillText("🔥", sp.x - 7, sp.y + 7);
                        ctx.font = "bold 10px monospace";
                        ctx.fillStyle = wildfireColor(w.confidence);
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = wildfireColor(w.confidence);
                        ctx.fillText(`${w.name}`, sp.x + 14, sp.y + 4);
                        ctx.shadowBlur = 0;
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    wildfireScreenPosRef.current.fill(null);
                  }

                  // Raios
                  if (lightningScreenPosRef.current.length !== lightning.length) {
                    lightningScreenPosRef.current = new Array(lightning.length).fill(null);
                  }
                  if (lightningEnabledRef.current) {
                    for (let i = 0; i < lightning.length; i++) {
                      lightningScreenPosRef.current[i] = null;
                      const l = lightning[i];
                      if (!isFacing(cam.latitude, cam.longitude, l.lat, l.lon)) continue;
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: l.lon, latitude: l.lat, z: 50000 })
                        );
                        if (!sp) continue;
                        lightningScreenPosRef.current[i] = { x: sp.x, y: sp.y };
                        ctx.font = "bold 14px Arial";
                        ctx.globalAlpha = 0.8;
                        ctx.fillText("⚡", sp.x - 7, sp.y + 7);
                        ctx.globalAlpha = 1;
                        ctx.font = "bold 9px monospace";
                        ctx.fillStyle = lightningColor();
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = lightningColor();
                        ctx.fillText(`RAIO #${i + 1}`, sp.x + 12, sp.y + 4);
                        ctx.shadowBlur = 0;
                      } catch {
                        // ponto fora do campo de visão
                      }
                    }
                  } else {
                    lightningScreenPosRef.current.fill(null);
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
      if (issIntervalId) clearInterval(issIntervalId);
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

      {/* Canvas das correntes de vento — próprio pra poder desbotar o rastro
          em vez de limpar tudo a cada frame */}
      <canvas
        id="globeWindOverlay"
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

      {/* Canvas para pins das cidades */}
      <canvas
        id="globeOverlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {hoverInfo && (
        <div
          style={{
            position: "fixed",
            left: Math.min(hoverInfo.x + 18, window.innerWidth - 280),
            top: Math.max(hoverInfo.y - 50, 8),
            zIndex: 20,
            maxWidth: "260px",
            background: "rgba(0, 10, 2, 0.96)",
            border: "1px solid #00ff41",
            borderRadius: "6px",
            padding: "8px 12px",
            fontFamily: "monospace",
            pointerEvents: "none",
            boxShadow: "0 0 24px rgba(0,255,65,0.25), inset 0 0 30px rgba(0,255,65,0.04)",
          }}
        >
          {hoverInfo.lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: i === 0 ? "11px" : "10px",
                color: i === 0 ? "#42ff6b" : "#00e055",
                fontWeight: i === 0 ? "bold" : "normal",
                lineHeight: 1.5,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

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
            {COUNTRY_ISO[hoverCity.city.country] ? (
              <img
                src={`https://flagcdn.com/20x15/${COUNTRY_ISO[hoverCity.city.country]}.png`}
                alt={hoverCity.city.country}
                title={hoverCity.city.country}
                style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 2, verticalAlign: "middle" }}
              />
            ) : (
              <span style={{ fontSize: "10px", color: "#00cc33" }}>{hoverCity.city.country}</span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#00e055", lineHeight: "1.6" }}>
            {intl.formatMessage(
              { id: `city_${citySlug(hoverCity.city.name)}_desc`, defaultMessage: hoverCity.city.desc }
            )}
          </div>
          {hoverCity.city.temp != null && hoverCity.city.weather_code != null && (
            <div style={{ marginTop: "8px", fontSize: "11px", color: "#00e055" }}>
              {hoverCity.city.timezone && (
                <div style={{ marginBottom: "4px" }}>
                  🕐 {new Intl.DateTimeFormat("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: hoverCity.city.timezone,
                  }).format(new Date())}
                </div>
              )}
              {WMO[hoverCity.city.weather_code]?.icon || "❓"} {hoverCity.city.temp}°C
            </div>
          )}
          {(hoverCity.city.tags.length > 0 || hoverCity.city.aqi) && (
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
              {hoverCity.city.aqi && (
                <span
                  style={{
                    background: "rgba(255,165,0,0.15)",
                    border: "1px solid rgba(255,165,0,0.5)",
                    borderRadius: "3px",
                    padding: "2px 7px",
                    fontSize: "10px",
                    color: "#ffa500",
                  }}
                >
                  💨 AQI: {hoverCity.city.aqi}
                </span>
              )}
            </div>
          )}
        </div>
      )}

    </>
  );
};

export default GlobeBackground;
