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

export interface UserLoc {
  name: string;
  lat: number;
  lon: number;
}
