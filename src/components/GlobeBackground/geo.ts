// Dados e funções puras do globo 3D — extraído de index.tsx pra manter o
// componente focado só na integração com o ArcGIS SceneView. Nada aqui
// depende de React nem do esri-loader.

export const citySlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

export const COUNTRY_ISO: Record<string, string> = {
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
export const isFacing = (camLat: number, camLon: number, ptLat: number, ptLon: number): boolean => {
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
export const slerpPoint = (
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

export const HOME = { name: "Vitória-ES", lat: -20.3155, lon: -40.3128 };

// esri-loader carrega os módulos do ArcGIS em runtime (loadModules) — não há
// tipos estáticos disponíveis sem adicionar @arcgis/core como dependência só
// pra isso. Alias único e documentado no lugar de `any` espalhado pelo arquivo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EsriAny = any;

export interface ArcState {
  points: EsriAny[];
  fromName: string;
  fromLat: number;
  fromLon: number;
  progress: number;
  phase: "drawing" | "holding" | "fading";
  startTime: number;
  fadeStart: number;
  opacity: number;
}

export interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  desc: string;
  tags: string[];
  aqi?: number;
  temp?: number;
  weather_code?: number;
  timezone?: string;
  weather_cached_at?: number;
}

export const CITIES: City[] = [
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
  { name: "Joanesburgo",    lat: -26.2041, lon:  28.0473, country: "África do Sul",  desc: "Joanesburgo e a região de Gauteng, que inclui Pretória, Sandton e Midrand, formam um dos maiores polos de tecnologia e engenharia de software da África. A região concentra as sedes dos maiores bancos, operadoras de telecomunicações como MTN e Vodacom, mineradoras e consultorias do continente, com grande demanda por software corporativo, segurança da informação e engenharia de dados. Abriga também campi de startups como o 22 On Sloane e escritórios regionais de gigantes como Microsoft e Google.", tags: ["Software", "Telecom", "Fintech"] },
  // Oriente Médio
  { name: "Dubai",          lat:  25.2048, lon:  55.2708, country: "EAU",            desc: "Dubai se consolidou como o laboratório global de smart cities, implementando tecnologias de ponta em transporte autônomo, blockchain governamental e serviços públicos totalmente digitais. Com iniciativas como o Dubai Future Foundation, a cidade atrai startups e multinacionais de todo o mundo que buscam construir o futuro urbano.", tags: ["Smart City", "Blockchain", "IA"] },
  { name: "Riad",           lat:  24.7136, lon:  46.6753, country: "Arábia Saudita", desc: "Impulsionada pelo ambicioso plano Vision 2030, Riad investe dezenas de bilhões de dólares em diversificação econômica baseada em tecnologia, inteligência artificial e economia digital. A cidade atrai gigantes globais da tech e startups locais, tornando-se rapidamente um dos maiores mercados emergentes de inovação do Oriente Médio.", tags: ["IA", "Vision 2030", "Inovação"] },
  // Sudeste Asiático
  { name: "Jacarta",        lat:  -6.2088, lon: 106.8456, country: "Indonésia",      desc: "Como capital do maior arquipélago do mundo, Jacarta abriga o mais dinâmico ecossistema de startups do Sudeste Asiático, tendo gerado unicórnios como Gojek, Tokopedia e Bukalapak. A cidade lidera a transformação digital da Indonésia, aproveitando uma população de 270 milhões cada vez mais conectada e ávida por soluções digitais.", tags: ["Unicórnios", "E-commerce", "Logtech"] },
  { name: "Kuala Lumpur",   lat:   3.1390, lon: 101.6869, country: "Malásia",        desc: "Estrategicamente posicionada no coração do Sudeste Asiático, Kuala Lumpur é um hub de serviços financeiros digitais, cibersegurança e desenvolvimento de software regional. A cidade atrai multinacionais de tecnologia como base de operações e investe em formação de talentos digitais por meio do corredor MSC Malaysia.", tags: ["Fintech", "Cybersecurity", "Software"] },
  { name: "Ho Chi Minh",    lat:  10.8231, lon: 106.6297, country: "Vietnã",         desc: "Conhecida como o motor econômico do Vietnã, Ho Chi Minh City cresce como um dos principais destinos de nearshoring de software para empresas americanas e europeias, combinando custo competitivo e qualidade técnica elevada. Além disso, desenvolve uma vibrante cena local de startups em logtech, fintech e edtech, apoiada por uma população jovem e altamente qualificada.", tags: ["Software", "Outsourcing", "Fintech"] },
  { name: "Taipei",         lat:  25.0330, lon: 121.5654, country: "Taiwan",         desc: "Taipei é o coração estratégico da cadeia global de semicondutores, sendo sede da TSMC — a maior e mais avançada fabricante de chips do mundo — que produz processadores para Apple, NVIDIA e AMD. A cidade representa o elo mais crítico da supply chain de hardware global, combinando pesquisa de ponta com capacidade industrial sem precedentes.", tags: ["Semicondutores", "TSMC", "Hardware"] },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694, country: "China", desc: "Hong Kong é um dos maiores centros financeiros do mundo e um polo de fintech na Ásia, com parques como o Cyberport e o Hong Kong Science Park. A cidade conecta investidores globais ao mercado chinês.", tags: ["Finanças", "Fintech", "VC"] },
  { name: "Osaka", lat: 34.6937, lon: 135.5023, country: "Japão", desc: "Osaka é a segunda maior região metropolitana do Japão e sede de gigantes da eletrônica como a Panasonic. A cidade se destaca em manufatura avançada, robótica e ciências da vida e sediou a Expo 2025.", tags: ["Eletrônica", "Robótica", "Manufatura"] },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867, country: "Índia", desc: "Hyderabad abriga a HITEC City e alguns dos maiores campi de Microsoft, Google e Amazon fora dos EUA. A cidade é um dos principais polos de software, nuvem e indústria farmacêutica da Índia.", tags: ["Software", "Cloud", "Big Tech"] },
  { name: "Délhi", lat: 28.6139, lon: 77.209, country: "Índia", desc: "A região metropolitana de Délhi, com Gurugram e Noida, concentra centros de TI de multinacionais e startups como Zomato e Paytm. É um dos maiores ecossistemas de startups da Índia, forte em e-commerce, delivery e pagamentos.", tags: ["Startups", "Pagamentos", "TI"] },
  { name: "Mumbai", lat: 19.076, lon: 72.8777, country: "Índia", desc: "Mumbai é a capital financeira da Índia, sede das bolsas BSE e NSE e de grandes bancos e conglomerados. A cidade lidera em fintech, mídia digital e serviços financeiros para um mercado de mais de um bilhão de pessoas.", tags: ["Fintech", "Finanças", "Mídia"] },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018, country: "Tailândia", desc: "Bangkok é o centro da economia digital da Tailândia, com forte crescimento em e-commerce, pagamentos móveis e serviços digitais. O programa Thailand 4.0 atrai investimento em tecnologia e indústria inteligente.", tags: ["E-commerce", "Pagamentos", "Indústria 4.0"] },
  { name: "Manila", lat: 14.5995, lon: 120.9842, country: "Filipinas", desc: "A região de Manila é uma das maiores bases mundiais de BPO e serviços de TI terceirizados, com uma força de trabalho jovem e fluente em inglês. A cidade também cresce em fintech, com carteiras digitais como o GCash.", tags: ["BPO", "Outsourcing", "Fintech"] },
  // Europa Oriental e Central
  { name: "Tallinn",        lat:  59.4370, lon:  24.7536, country: "Estônia",        desc: "Tallinn é mundialmente reconhecida como o modelo mais avançado de governo digital, oferecendo quase 100% dos serviços públicos online e desenvolvendo o inovador conceito de e-Residência digital. É também o berço de empresas como Skype, Wise (TransferWise) e Pipedrive, consolidando-se como um polo desproporcional de startups para o tamanho de sua população.", tags: ["GovTech", "e-Residência", "Startups"] },
  { name: "Varsóvia",       lat:  52.2297, lon:  21.0122, country: "Polônia",        desc: "Varsóvia emerge como o maior hub tecnológico da Europa Central e Oriental, abrigando centros de P&D de multinacionais como Google, Microsoft e Samsung. A cidade combina forte tradição acadêmica em ciências da computação com custo de vida competitivo e uma força de trabalho tecnológica em crescimento acelerado.", tags: ["Software", "P&D", "Outsourcing"] },
  { name: "Zurique",        lat:  47.3769, lon:   8.5417, country: "Suíça",          desc: "Zurique é simultaneamente o principal centro financeiro da Europa e o coração do 'Crypto Valley' suíço, onde estão sediadas algumas das maiores organizações de blockchain e Web3 do mundo. A cidade abriga o ETH Zurich — uma das universidades de computação e IA mais renomadas do planeta — gerando fluxo constante de inovação acadêmica de alto impacto.", tags: ["Crypto", "Web3", "IA"] },
  { name: "Madri", lat: 40.4168, lon: -3.7038, country: "Espanha", desc: "Madri é sede da Telefónica e berço de empresas como a Cabify, com um ecossistema de startups em forte crescimento. A cidade concentra investimentos em fintech, mobilidade e transformação digital de grandes empresas.", tags: ["Telecom", "Mobilidade", "Fintech"] },
  { name: "Barcelona", lat: 41.3874, lon: 2.1686, country: "Espanha", desc: "Barcelona recebe todo ano o Mobile World Congress, maior feira de tecnologia móvel do mundo, e é berço de startups como Glovo e Wallapop. A cidade abriga o Barcelona Supercomputing Center e atrai talentos de toda a Europa.", tags: ["Mobile", "Startups", "Supercomputação"] },
  { name: "Dublin", lat: 53.3498, lon: -6.2603, country: "Irlanda", desc: "Dublin é a sede europeia de gigantes como Google, Meta, Microsoft e LinkedIn, e uma das sedes da Stripe. A cidade concentra operações de nuvem, dados e software para todo o continente.", tags: ["Big Tech", "Cloud", "Fintech"] },
  { name: "Milão", lat: 45.4642, lon: 9.19, country: "Itália", desc: "Milão é o centro financeiro da Itália e o principal polo de startups do país, com fintechs como a Satispay. O Politecnico di Milano forma engenheiros para a indústria 4.0, o design e a moda digital.", tags: ["Fintech", "Indústria 4.0", "Design"] },
  { name: "Istambul", lat: 41.0082, lon: 28.9784, country: "Turquia", desc: "Istambul tem o maior ecossistema de startups da região entre Europa e Ásia, com empresas como Trendyol, Getir e Peak Games. A cidade se destaca em e-commerce, delivery rápido e jogos para celular.", tags: ["E-commerce", "Games", "Startups"] },
  // América do Norte
  { name: "Seattle",        lat:  47.6062, lon:-122.3321, country: "EUA",            desc: "Seattle é lar de duas das maiores empresas de tecnologia do planeta — Amazon e Microsoft — e um dos mais densos ecossistemas de engenharia de software do mundo. A cidade é referência global em computação em nuvem, tendo sido o berço do AWS e do Azure, e mantém uma cultura de inovação de décadas sustentada por investimentos massivos em pesquisa.", tags: ["Cloud", "Software", "Engenharia"] },
  { name: "Boston",         lat:  42.3601, lon: -71.0589, country: "EUA",            desc: "Boston é o maior polo mundial de biotech e ciências da vida, concentrando centenas de empresas farmacêuticas e de biotecnologia ao redor do MIT e de Harvard. A cidade também lidera em pesquisa de IA, robótica e computação quântica, com uma densidade de talento acadêmico sem paralelo em nenhuma outra cidade americana.", tags: ["Biotech", "IA", "Robótica"] },
  { name: "Miami",          lat:  25.7617, lon: -80.1918, country: "EUA",            desc: "Nos últimos anos Miami transformou-se no principal polo de cripto e Web3 dos Estados Unidos, atraindo fundos de venture capital, exchanges e projetos blockchain de todo o mundo. A cidade também emerge como hub de startups latinoamericanas que buscam o mercado americano, combinando infraestrutura de primeiro mundo com conexão cultural única com a América Latina.", tags: ["Cripto", "Web3", "VC"] },
  { name: "Cidade do México",lat: 19.4326, lon: -99.1332, country: "México",         desc: "A Cidade do México é o segundo maior ecossistema de startups da América Latina, com uma cena de fintechs, e-commerce e logtech em explosivo crescimento. Sua posição privilegiada como ponte entre os mercados americano e latinoamericano atrai investidores globais e multinacionais que buscam penetrar no mercado hispano.", tags: ["Fintech", "Startups", "LatAm"] },
  { name: "Vancouver",      lat:  49.2827, lon:-123.1207, country: "Canadá",         desc: "Vancouver é a capital mundial da produção de jogos eletrônicos e efeitos visuais (VFX), abrigando estúdios de empresas como EA, Ubisoft e Microsoft. A cidade também consolida-se como hub de inteligência artificial, atraindo centros de pesquisa de grandes corporações americanas pelo talento gerado na Universidade da British Columbia.", tags: ["Games", "VFX", "IA"] },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, country: "EUA", desc: "Los Angeles combina a indústria do entretenimento com o polo de startups conhecido como Silicon Beach, onde nasceu a Snap. A região também abriga a SpaceX e é referência em games, streaming e tecnologia aeroespacial.", tags: ["Entretenimento", "Aeroespacial", "Startups"] },
  { name: "Chicago", lat: 41.8781, lon: -87.6298, country: "EUA", desc: "Chicago é um dos maiores centros financeiros dos EUA, sede do CME Group, com forte demanda por trading de alta frequência e fintech. A cidade também se destaca em logística, software corporativo e ciência de dados.", tags: ["Fintech", "Trading", "Logística"] },
  { name: "Montreal", lat: 45.5017, lon: -73.5673, country: "Canadá", desc: "Montreal é referência mundial em pesquisa de inteligência artificial, sede do instituto Mila, fundado por Yoshua Bengio. A cidade é também um dos maiores polos de games do mundo, com estúdios como a Ubisoft Montreal.", tags: ["IA", "Games", "Pesquisa"] },
  { name: "Atlanta", lat: 33.749, lon: -84.388, country: "EUA", desc: "Atlanta é conhecida como Transaction Alley, região por onde passa grande parte dos pagamentos com cartão dos EUA. A Georgia Tech forma talentos em engenharia, e a cidade cresce em fintech, segurança da informação e logística.", tags: ["Pagamentos", "Fintech", "Cybersecurity"] },
  { name: "Dallas", lat: 32.7767, lon: -96.797, country: "EUA", desc: "A região de Dallas abriga as sedes da AT&T e da Texas Instruments e um dos maiores mercados de data centers dos EUA. A cidade atrai empresas de telecom, semicondutores e serviços financeiros pelo custo competitivo.", tags: ["Telecom", "Semicondutores", "Data Centers"] },
  { name: "Monterrey", lat: 25.6866, lon: -100.3161, country: "México", desc: "Monterrey é o principal centro industrial do México e cresce como destino de nearshoring de software e manufatura para os EUA. O Tec de Monterrey forma engenheiros e alimenta um ecossistema de startups em expansão.", tags: ["Nearshoring", "Indústria 4.0", "Startups"] },
  { name: "Guadalajara", lat: 20.6597, lon: -103.3496, country: "México", desc: "Chamada de Vale do Silício mexicano, Guadalajara reúne centros de engenharia de empresas como Intel, Oracle e IBM. A cidade é um dos maiores polos de desenvolvimento de software e design de hardware da América Latina.", tags: ["Software", "Hardware", "Nearshoring"] },
  // América do Sul
  { name: "Buenos Aires",   lat: -34.6037, lon: -58.3816, country: "Argentina",      desc: "Buenos Aires possui uma das comunidades de desenvolvedores mais qualificadas e produtivas da América Latina, reconhecida globalmente por sua expertise em software, design digital e inteligência artificial. A cidade é também um dos maiores centros de cripto e blockchain da região, com altíssima adoção de moedas digitais pela população como resposta às instabilidades econômicas históricas.", tags: ["Software", "Cripto", "IA"] },
  { name: "Bogotá",         lat:   4.7110, lon: -74.0721, country: "Colômbia",       desc: "Bogotá consolida-se como o terceiro maior polo de startups da América Latina, com crescimento acelerado em fintechs, logtech e soluções de saúde digital. A cidade se beneficia de um ecossistema maduro de aceleradoras, fundos de venture capital e políticas governamentais favoráveis à inovação, tornando-se destino preferido de investidores internacionais na região.", tags: ["Fintech", "Healthtech", "Startups"] },
  { name: "Belo Horizonte", lat: -19.9167, lon: -43.9345, country: "Brasil", desc: "Belo Horizonte abriga o San Pedro Valley, uma das comunidades de startups mais conhecidas do Brasil, e é berço de empresas como Hotmart e Sympla. A UFMG forma talentos em computação e IA, e a cidade concentra empresas de software, automação e consultoria em tecnologia.", tags: ["Startups", "Software", "IA"] },
  { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, country: "Brasil", desc: "O Rio de Janeiro une grandes empresas de energia, mídia e finanças a um ecossistema crescente de startups. A demanda por tecnologia no setor de óleo e gás, centros de pesquisa como o IMPA e universidades fortes fazem da cidade um polo de dados, engenharia e inovação.", tags: ["Energia", "Mídia", "Dados"] },
  { name: "Florianópolis", lat: -27.5954, lon: -48.548, country: "Brasil", desc: "Chamada de Ilha do Silício, Florianópolis tem uma das maiores concentrações de empresas de tecnologia por habitante do Brasil. A associação ACATE reúne centenas de empresas, e a cidade é berço de SaaS como a RD Station.", tags: ["SaaS", "Startups", "Software"] },
  { name: "Recife", lat: -8.0476, lon: -34.877, country: "Brasil", desc: "Recife abriga o Porto Digital, um dos maiores parques tecnológicos do Brasil, instalado no bairro histórico do Recife Antigo. Centenas de empresas e o instituto CESAR fazem da cidade o principal polo de software do Nordeste.", tags: ["Software", "Parque Tecnológico", "P&D"] },
  { name: "Campinas", lat: -22.9099, lon: -47.0626, country: "Brasil", desc: "Campinas é um dos maiores centros de pesquisa da América Latina, com a Unicamp, o CPqD e o acelerador de partículas Sirius. A região é berço da Ci&T e reúne centros de P&D de multinacionais de tecnologia e telecom.", tags: ["P&D", "Telecom", "Software"] },
  { name: "Santiago", lat: -33.4489, lon: -70.6693, country: "Chile", desc: "Santiago é um dos ecossistemas de startups mais maduros da América Latina, impulsionado pelo programa Start-Up Chile. A cidade é berço de empresas como NotCo e Cornershop e se destaca em fintech e foodtech.", tags: ["Startups", "Fintech", "Foodtech"] },
  // Oceania
  { name: "Melbourne",      lat: -37.8136, lon: 144.9631, country: "Austrália",      desc: "Melbourne é o segundo maior polo tecnológico da Austrália, com forte presença em fintech, gaming e desenvolvimento de software empresarial de ponta. A cidade abriga um crescente ecossistema de startups de IA e saúde digital, impulsionado por universidades de pesquisa de renome e políticas de imigração que atraem talentos tecnológicos globais.", tags: ["Fintech", "Games", "IA"] },
  { name: "Auckland", lat: -36.8485, lon: 174.7633, country: "Nova Zelândia", desc: "Auckland é o principal polo tecnológico da Nova Zelândia, berço da Rocket Lab, empresa de lançamento de foguetes. A cidade se destaca em SaaS, games e tecnologia para cinema e efeitos visuais.", tags: ["Aeroespacial", "SaaS", "Games"] },
];

export interface UserLoc {
  name: string;
  lat: number;
  lon: number;
}
