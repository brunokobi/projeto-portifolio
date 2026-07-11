import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { loadModules, setDefaultOptions } from "esri-loader";

const citySlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const COUNTRY_ISO: Record<string, string> = {
  "Brasil": "br",
  "EUA": "us",
  "Reino Unido": "gb",
  "Japão": "jp",
  "Coreia do Sul": "kr",
  "Singapura": "sg",
  "China": "cn",
  "Índia": "in",
  "Alemanha": "de",
  "Israel": "il",
  "França": "fr",
  "Países Baixos": "nl",
  "Canadá": "ca",
  "Austrália": "au",
  "Suécia": "se",
  "Nigéria": "ng",
  "Quênia": "ke",
  "Egito": "eg",
  "África do Sul": "za",
  "EAU": "ae",
  "Arábia Saudita": "sa",
  "Indonésia": "id",
  "Malásia": "my",
  "Vietnã": "vn",
  "Taiwan": "tw",
  "Estônia": "ee",
  "Polônia": "pl",
  "Suíça": "ch",
  "México": "mx",
  "Argentina": "ar",
  "Colômbia": "co",
};

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
  // África
  { name: "Lagos",          lat:   6.5244, lon:   3.3792, country: "Nigéria",        desc: "Considerada a capital africana das startups, Lagos concentra o maior ecossistema de fintechs do continente, com empresas como Paystack e Flutterwave conquistando projeção global. É o epicentro da revolução digital na África Subsaariana, atraindo bilhões em venture capital e formando uma nova geração de empreendedores tech.", tags: ["Fintech", "Startups", "África"] },
  { name: "Nairóbi",        lat:  -1.2921, lon:  36.8219, country: "Quênia",         desc: "Apelidada de 'Silicon Savannah', Nairóbi é o berço do M-Pesa, sistema de pagamento móvel que revolucionou o acesso financeiro em toda a África. Seu ecossistema de startups voltadas para IA, agritech e mobile money cresce a ritmo acelerado, atraindo investidores de todo o mundo.", tags: ["Mobile Money", "IA", "Agritech"] },
  { name: "Cairo",          lat:  30.0444, lon:  31.2357, country: "Egito",          desc: "Com a maior população do mundo árabe e uma crescente força jovem altamente conectada, o Cairo desponta como o principal polo tech do Norte da África. A cidade abriga centenas de startups de e-commerce, edtech e healthtech, impulsionadas por forte investimento governamental e aceleradoras internacionais.", tags: ["E-commerce", "Edtech", "Healthtech"] },
  { name: "Cidade do Cabo", lat: -33.9249, lon:  18.4241, country: "África do Sul",  desc: "Principal hub de inovação da África Austral, Cidade do Cabo lidera em startups de energias renováveis, fintech e software para mercados emergentes. O ecossistema local combina talento criativo, infraestrutura de ponta e forte conexão com investidores europeus e americanos.", tags: ["Fintech", "Cleantech", "Software"] },
  // Oriente Médio
  { name: "Dubai",          lat:  25.2048, lon:  55.2708, country: "EAU",            desc: "Dubai se consolidou como o laboratório global de smart cities, implementando tecnologias de ponta em transporte autônomo, blockchain governamental e serviços públicos totalmente digitais. Com iniciativas como o Dubai Future Foundation, a cidade atrai startups e multinacionais de todo o mundo que buscam construir o futuro urbano.", tags: ["Smart City", "Blockchain", "IA"] },
  { name: "Riad",           lat:  24.7136, lon:  46.6753, country: "Arábia Saudita", desc: "Impulsionada pelo ambicioso plano Vision 2030, Riad investe dezenas de bilhões de dólares em diversificação econômica baseada em tecnologia, inteligência artificial e economia digital. A cidade atrai gigantes globais da tech e startups locais, tornando-se rapidamente um dos maiores mercados emergentes de inovação do Oriente Médio.", tags: ["IA", "Vision 2030", "Inovação"] },
  // Sudeste Asiático
  { name: "Jacarta",        lat:  -6.2088, lon: 106.8456, country: "Indonésia",      desc: "Como capital do maior arquipélago do mundo, Jacarta abriga o mais dinâmico ecossistema de startups do Sudeste Asiático, tendo gerado unicórnios como Gojek, Tokopedia e Bukalapak. A cidade lidera a transformação digital da Indonésia, aproveitando uma população de 270 milhões cada vez mais conectada e ávida por soluções digitais.", tags: ["Unicórnios", "E-commerce", "Logtech"] },
  { name: "Kuala Lumpur",   lat:   3.1390, lon: 101.6869, country: "Malásia",        desc: "Estrategicamente posicionada no coração do Sudeste Asiático, Kuala Lumpur é um hub de serviços financeiros digitais, cibersegurança e desenvolvimento de software regional. A cidade atrai multinacionais de tecnologia como base de operações e investe em formação de talentos digitais por meio do corredor MSC Malaysia.", tags: ["Fintech", "Cybersecurity", "Software"] },
  { name: "Ho Chi Minh",    lat:  10.8231, lon: 106.6297, country: "Vietnã",         desc: "Conhecida como o motor econômico do Vietnã, Ho Chi Minh City cresce como um dos principais destinos de nearshoring de software para empresas americanas e europeias, combinando custo competitivo e qualidade técnica elevada. Além disso, desenvolve uma vibrante cena local de startups em logtech, fintech e edtech, apoiada por uma população jovem e altamente qualificada.", tags: ["Software", "Outsourcing", "Fintech"] },
  { name: "Taipei",         lat:  25.0330, lon: 121.5654, country: "Taiwan",         desc: "Taipei é o coração estratégico da cadeia global de semicondutores, sendo sede da TSMC — a maior e mais avançada fabricante de chips do mundo — que produz processadores para Apple, NVIDIA e AMD. A cidade representa o elo mais crítico da supply chain de hardware global, combinando pesquisa de ponta com capacidade industrial sem precedentes.", tags: ["Semicondutores", "TSMC", "Hardware"] },
  // Europa Oriental e Central
  { name: "Tallinn",        lat:  59.4370, lon:  24.7536, country: "Estônia",        desc: "Tallinn é mundialmente reconhecida como o modelo mais avançado de governo digital, oferecendo quase 100% dos serviços públicos online e desenvolvendo o inovador conceito de e-Residência digital. É também o berço de empresas como Skype, Wise (TransferWise) e Pipedrive, consolidando-se como um polo desproporcional de startups para o tamanho de sua população.", tags: ["GovTech", "e-Residência", "Startups"] },
  { name: "Varsóvia",       lat:  52.2297, lon:  21.0122, country: "Polônia",        desc: "Varsóvia emerge como o maior hub tecnológico da Europa Central e Oriental, abrigando centros de P&D de multinacionais como Google, Microsoft e Samsung. A cidade combina forte tradição acadêmica em ciências da computação com custo de vida competitivo e uma força de trabalho tecnológica em crescimento acelerado.", tags: ["Software", "P&D", "Outsourcing"] },
  { name: "Zurique",        lat:  47.3769, lon:   8.5417, country: "Suíça",          desc: "Zurique é simultaneamente o principal centro financeiro da Europa e o coração do 'Crypto Valley' suíço, onde estão sediadas algumas das maiores organizações de blockchain e Web3 do mundo. A cidade abriga o ETH Zurich — uma das universidades de computação e IA mais renomadas do planeta — gerando fluxo constante de inovação acadêmica de alto impacto.", tags: ["Crypto", "Web3", "IA"] },
  // América do Norte
  { name: "Seattle",        lat:  47.6062, lon:-122.3321, country: "EUA",            desc: "Seattle é lar de duas das maiores empresas de tecnologia do planeta — Amazon e Microsoft — e um dos mais densos ecossistemas de engenharia de software do mundo. A cidade é referência global em computação em nuvem, tendo sido o berço do AWS e do Azure, e mantém uma cultura de inovação de décadas sustentada por investimentos massivos em pesquisa.", tags: ["Cloud", "Software", "Engenharia"] },
  { name: "Boston",         lat:  42.3601, lon: -71.0589, country: "EUA",            desc: "Boston é o maior polo mundial de biotech e ciências da vida, concentrando centenas de empresas farmacêuticas e de biotecnologia ao redor do MIT e de Harvard. A cidade também lidera em pesquisa de IA, robótica e computação quântica, com uma densidade de talento acadêmico sem paralelo em nenhuma outra cidade americana.", tags: ["Biotech", "IA", "Robótica"] },
  { name: "Miami",          lat:  25.7617, lon: -80.1918, country: "EUA",            desc: "Nos últimos anos Miami transformou-se no principal polo de cripto e Web3 dos Estados Unidos, atraindo fundos de venture capital, exchanges e projetos blockchain de todo o mundo. A cidade também emerge como hub de startups latinoamericanas que buscam o mercado americano, combinando infraestrutura de primeiro mundo com conexão cultural única com a América Latina.", tags: ["Cripto", "Web3", "VC"] },
  { name: "Cidade do México",lat: 19.4326, lon: -99.1332, country: "México",         desc: "A Cidade do México é o segundo maior ecossistema de startups da América Latina, com uma cena de fintechs, e-commerce e logtech em explosivo crescimento. Sua posição privilegiada como ponte entre os mercados americano e latinoamericano atrai investidores globais e multinacionais que buscam penetrar no mercado hispano.", tags: ["Fintech", "Startups", "LatAm"] },
  { name: "Vancouver",      lat:  49.2827, lon:-123.1207, country: "Canadá",         desc: "Vancouver é a capital mundial da produção de jogos eletrônicos e efeitos visuais (VFX), abrigando estúdios de empresas como EA, Ubisoft e Microsoft. A cidade também consolida-se como hub de inteligência artificial, atraindo centros de pesquisa de grandes corporações americanas pelo talento gerado na Universidade da British Columbia.", tags: ["Games", "VFX", "IA"] },
  // América do Sul
  { name: "Buenos Aires",   lat: -34.6037, lon: -58.3816, country: "Argentina",      desc: "Buenos Aires possui uma das comunidades de desenvolvedores mais qualificadas e produtivas da América Latina, reconhecida globalmente por sua expertise em software, design digital e inteligência artificial. A cidade é também um dos maiores centros de cripto e blockchain da região, com altíssima adoção de moedas digitais pela população como resposta às instabilidades econômicas históricas.", tags: ["Software", "Cripto", "IA"] },
  { name: "Bogotá",         lat:   4.7110, lon: -74.0721, country: "Colômbia",       desc: "Bogotá consolida-se como o terceiro maior polo de startups da América Latina, com crescimento acelerado em fintechs, logtech e soluções de saúde digital. A cidade se beneficia de um ecossistema maduro de aceleradoras, fundos de venture capital e políticas governamentais favoráveis à inovação, tornando-se destino preferido de investidores internacionais na região.", tags: ["Fintech", "Healthtech", "Startups"] },
  // Oceania
  { name: "Melbourne",      lat: -37.8136, lon: 144.9631, country: "Austrália",      desc: "Melbourne é o segundo maior polo tecnológico da Austrália, com forte presença em fintech, gaming e desenvolvimento de software empresarial de ponta. A cidade abriga um crescente ecossistema de startups de IA e saúde digital, impulsionado por universidades de pesquisa de renome e políticas de imigração que atraem talentos tecnológicos globais.", tags: ["Fintech", "Games", "IA"] },
];



interface UserLoc {
  name: string;
  lat: number;
  lon: number;
}

setDefaultOptions({ css: true });

const GlobeBackground = () => {
  const intl = useIntl();
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

            const isNightSaved = localStorage.getItem("globeNight") === "1";

            const dayLayer = new TileLayer({
              url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
              copyright: "Tiles © Esri",
              visible: true,
            });
            const nightLayer = new TileLayer({
              url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Earth_at_Night_WM/MapServer",
              copyright: "Earth at Night © Esri, NASA, NOAA",
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
