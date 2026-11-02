# Componentes Principais

## `GlobeBackground`
**Arquivo:** `src/components/GlobeBackground/index.tsx`  
**Responsabilidade:** globo 3D (ArcGIS SceneView) e todas as camadas de dados em tempo real. Carregado com `lazy()` só na Home.

### Props
Nenhuma.

### Estado
- `hoverInfo` / `hoverCity` (useState) — tooltip e card de cidade
- `<camada>ScreenPosRef` — posições de tela para o hover (`satelliteScreenPosRef`, `issScreenPosRef`, `quakeScreenPosRef`, `volcanoScreenPosRef`, `hurricaneScreenPosRef`, `wildfireScreenPosRef`, `capAlertScreenPosRef`, `cityScreenPosRef`)
- `<camada>EnabledRef` — ON/OFF de cada camada, iniciado do `localStorage` (`globeSatellites`, `globeQuakes`, ...)

### Ciclo de Vida
1. Monta: listeners dos `CustomEvent` da `WeatherBar`; carrega satélites, AQI e incêndios; liga o polling dos satélites (10s).
2. Após 3s: carrega o ArcGIS SDK e cria o `SceneView`.
3. `view.when`: `markGlobeReady()`. Depois do primeiro carregamento: terremotos, ISS (8s), vulcões, furacões, alertas e rotação.
4. Loop `requestAnimationFrame`: vento + `drawPins()`.
5. Desmonta: limpa timers e intervals e chama `resetGlobeReady()`.

### Funções Chave
- `drawPins()` — desenha todas as camadas no canvas; tamanhos escalados por `iconScaleForAltitude(cam.z)` (`iconScale.ts`)
- `drawHurricaneIcon()` (`hurricanes.ts`) — espiral do furacão; recebe o tamanho da fonte da legenda
- Handler de `pointer-move` — hit test < 16px e tooltip

---

## `WeatherBar`
**Arquivo:** `src/components/WeatherBar/index.tsx`  
**Responsabilidade:** barra fixa no topo com clima local e os botões ON/OFF das camadas do globo.

### Props
| Prop | Tipo | Uso |
|---|---|---|
| `waitForGlobe` | `boolean` | `true` na Home (`App.tsx`): a barra só aparece depois de `markGlobeReady()` |

### Botões
| Ícone | Evento | `detail` |
|---|---|---|
| 🌙 / 🌞 | `globeNightToggle` | modo noite |
| 💨 | `globeWindToggle` | `windEnabled` |
| 🛰 ISS | `globeIssToggle` | `issEnabled` |
| 🌀 | `globeHurricanesToggle` | `hurricanesEnabled` |
| 🌍 | `globeQuakesToggle` | `quakesEnabled` |
| 🌋 | `globeVolcanoesToggle` | `volcanoesEnabled` |
| 🛰️ | `globeSatellitesToggle` | `satellitesEnabled` |
| 🔥 | `globeWildfiresToggle` | `wildfiresEnabled` |
| ⚠️ | `globeCapAlertsToggle` | `capAlertsEnabled` |
| 🌐 | `globeRotationToggle` | rotação do globo |

### Comportamento
- Cada botão grava a escolha no `localStorage` e dispara o `CustomEvent`; o globo atualiza o `EnabledRef` e o loop de desenho respeita.
- O clima não bloqueia a barra: temperatura e cidade aparecem quando o Open-Meteo responde e ficam ocultas se falhar.
- Localização: geolocalização do navegador (timeout 8s) com fallback para `ipapi.co`.
- Testes: `__tests__/WeatherBar.test.tsx` (inclui "botões aparecem mesmo com o clima falhando" e "na Home espera o globo").

---

## `DevBlog`
**Arquivo:** `src/pages/DevBlog/index.tsx`  
**Responsabilidade:** Página de blog com posts

### Sub-componentes
- `PostRenderer` — renderiza Block[] com markdown-lite
  - **bold:** `**text**` → `<span style="color: #42c920">`
  - **code:** `` `text` `` → `<code>` monospace
  - **italic:** `*text*` → `<em>`

### Estrutura
```typescript
interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  blocks: Block[];
}

type Block = 
  | { type: "heading"; level: 1|2|3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; lang: string; text: string }
  | { type: "hr" };
```

### Posts Existentes
- `oracle-vps-free-tier` — VPS recovery story (~8000 words)

---

## `About`
**Arquivo:** `src/pages/About/index.tsx`  
**Responsabilidade:** Página pessoal com AnimatedStars background

### Styling Template
DevBlog copia esse design:
- AnimatedStars background
- ScaleFade animations
- GREEN (#42c920) accent color
- text-shadow glow effect

---

## `Nav`
**Arquivo:** `src/components/Nav/index.tsx`  
**Responsabilidade:** Navegação principal

### Links
- `/` (Home)
- `/about` (About)
- `/blog` (DevBlog) ← adicionado recentemente

---

## `ChatWidget`
**Arquivo:** `src/components/ChatWidget/index.tsx`  
**Responsabilidade:** UI de chat com o agente n8n (mensagens, seletor de idioma, toggle de áudio/TTS)

- Sem props. Estado local: `messages`, `inputValue`, `isLoading`, `selectedLanguage`, `audioEnabled`, `isSpeaking`
- `generateAIResponse(message)` (função de módulo) faz `POST /.netlify/functions/n8n-chat` com `{ chatInput, sessionId }` e lê a resposta em `data.output`
- `chatSessionId` é gerado uma vez por carregamento da página e mantém a memória de conversa no n8n
- `selectedLanguage` **não é enviado ao n8n** (workflow fixo em português); só alimenta o áudio via `useChatWithAudio`
- Título "JARVIS"; ao montar, `generateGreeting()` (`src/utils/generateGreeting.ts`) gera a saudação dinâmica (bom dia/boa tarde/boa noite + cidade, clima e temperatura; texto fixo se não houver geolocalização) e ela vira a primeira mensagem; `generateAIResponse` remove da resposta do n8n a URL do site e "Vamos construir o futuro juntos!"
- Áudio via `useChatWithAudio` (`src/hooks/useChatWithAudio.ts`), que fala com `rate: 1.4`
- Renderiza `<JarvisCore isActive={isSpeaking} greeting={greetingText} />` abaixo do card do chat
- Detalhes do fluxo: [FEATURES.md](./FEATURES.md#-chat-ia-n8n)

## `JarvisCore`
**Arquivo:** `src/components/ChatWidget/JarvisCore.tsx`  
**Responsabilidade:** visualizador em canvas (anéis concêntricos, núcleo com glow e 16 barras de espectro) exibido no `ChatWidget`

- Props: `isActive: boolean` (true enquanto o widget está falando), `greeting: string` (texto exibido num box abaixo do canvas)
- Estado: `spectrum` (16 valores); um `useEffect` o atualiza a cada frame (`requestAnimationFrame`) com valores aleatórios suavizados enquanto `isActive`; outro `useEffect` redesenha o canvas a cada mudança de `spectrum`/`isActive`
- O espectro é simulado, não analisa o áudio real
- Cor: verde da marca `#42c920`
- Inativo: sem animação, opacidade 0.5 e ícone de play central (decorativo)

## `ChatButton`
**Arquivo:** `src/components/ChatButton/index.tsx`  
**Responsabilidade:** botão flutuante (canto inferior direito) que abre o `ChatWidget` num Drawer do Chakra

- Sem props; controla abertura com `useDisclosure`
- Renderizado em `App.tsx` em todas as páginas, exceto `/news`
- O `ChatWidget` também é usado standalone na rota `/chat` (`src/pages/Chat.tsx`)

---

## Componentes UI (Chakra)

### Used Throughout
- `Button` — toggles, CTAs
- `Box` — layout containers
- `VStack`, `HStack` — flex layouts
- `Text` — typography
- `Link` — routing

### Custom Colors
- `greenAccent: #42c920` — brand primary
- Tema light/dark via Chakra provider

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── GlobeBackground/
│   │   ├── index.tsx        (globo + drawPins + hover)
│   │   ├── satellites.ts    (CelesTrak + SGP4)
│   │   ├── iss.ts
│   │   ├── cities.ts, geo.ts
│   │   ├── hazards.ts       (incêndios, AQI)
│   │   ├── capAlerts.ts
│   │   ├── quakes.ts
│   │   ├── volcanoes.ts
│   │   ├── hurricanes.ts
│   │   ├── wind.ts
│   │   ├── iconScale.ts     (tamanho dos ícones pelo zoom)
│   │   ├── aircraft.ts, aurora.ts, infrastructure.ts, ocean.ts (sem uso no globo)
│   │   └── __tests__/
│   ├── ChatWidget/
│   │   ├── index.tsx
│   │   └── JarvisCore.tsx
│   ├── WeatherBar/
│   ├── Nav/
│   └── ...
├── pages/
│   ├── Home/index.tsx
│   ├── About/
│   ├── DevBlog/ (index.tsx, PostRenderer.tsx, posts.ts)
│   └── ...
├── hooks/useChatWithAudio.ts
├── utils/
│   ├── globeReady.ts        (sinal "globo pronto" para a WeatherBar)
│   ├── generateGreeting.ts, textToSpeech.ts, geoip.ts, ...
└── routes/index.tsx
```
