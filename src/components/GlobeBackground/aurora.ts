// Aurora Boreal em tempo real baseado em Kp-index do NOAA
// Fonte: NOAA Space Weather Prediction Center (dados públicos)

export interface Aurora {
  id: string;
  lat: number;
  lon: number;
  hemisphere: 'north' | 'south';
  kpIndex: number;
  intensity: number; // 0-1
  timestamp: number;
}

// Carrega Kp-index (atividade geomagnética) do NOAA
export async function loadAuroraData(): Promise<Aurora[]> {
  try {
    const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
    if (!response.ok) throw new Error('Failed to fetch Kp-index');

    const data = await response.json() as Array<{ time_tag: string; kp_index: number }>;
    if (!data || data.length === 0) return [];

    // Pega o último índice (mais recente)
    const latest = data[data.length - 1];
    let kpIndex = latest.kp_index;

    // TESTE: força Kp alto pra demonstração (comentar para dados reais)
    kpIndex = 7;

    // Kp < 4: sem aurora visível
    if (kpIndex < 4) return [];

    // Calcula intensidade (0-1)
    const intensity = Math.min(1, (kpIndex - 4) / 5); // Normaliza 4-9 para 0-1

    // Aurora ocorre em óvais ao redor dos polos
    // Quanto maior o Kp, mais pra baixo a latitude (visível de mais longe)
    const latitudeVariation = 90 - (70 - (kpIndex - 4) * 3); // 70° a 58° conforme Kp

    const auroraPoints: Aurora[] = [];

    // Hemisféri Norte (múltiplos pontos em um oval)
    for (let lon = 0; lon < 360; lon += 45) {
      auroraPoints.push({
        id: `aurora-north-${lon}`,
        lat: latitudeVariation,
        lon: lon,
        hemisphere: 'north',
        kpIndex: kpIndex,
        intensity: intensity,
        timestamp: Date.now(),
      });
    }

    // Hemisféri Sul (mesma lógica)
    for (let lon = 0; lon < 360; lon += 45) {
      auroraPoints.push({
        id: `aurora-south-${lon}`,
        lat: -latitudeVariation,
        lon: lon,
        hemisphere: 'south',
        kpIndex: kpIndex,
        intensity: intensity,
        timestamp: Date.now(),
      });
    }

    return auroraPoints;
  } catch (err) {
    console.warn('[Aurora] Erro ao carregar dados NOAA:', err);
    return [];
  }
}

// Cor da aurora baseado na intensidade
export function auroraColor(intensity: number): string {
  // Gradiente verde/roxo típico de Aurora
  if (intensity < 0.3) return 'rgba(100, 200, 100, 0.4)'; // Verde fraco
  if (intensity < 0.6) return 'rgba(0, 200, 150, 0.5)'; // Verde-ciano
  if (intensity < 0.8) return 'rgba(150, 100, 200, 0.6)'; // Roxo
  return 'rgba(200, 100, 255, 0.7)'; // Roxo-magenta forte
}

// Tamanho do ponto (maior quanto mais intenso)
export function auroraRadius(intensity: number): number {
  return 8 + intensity * 12; // 8-20px conforme intensidade
}
