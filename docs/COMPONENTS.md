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
1. Monta: listeners dos `CustomEvent` da `WeatherBar`; carrega satélites e incêndios (o AQI da cidade é buscado no hover); liga o polling dos satélites (10s).
2. Na montagem: começa a baixar os módulos do ArcGIS SDK. Após 3s (fim da animação de abertura): cria o `SceneView`. Ao desmontar: `view.destroy()`.
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
**Responsabilidade:** Navegação principal (barra fixa embaixo)

- Só ícones; o nome aparece num tooltip verde ao passar o mouse (e é falado pelo `TextAudio`). O item da página atual vira uma pílula verde com o nome (o nome some no celular)
- Grupo 1, páginas do site: Home `/`, Sobre `/about`, Projetos `/projects`, Contato (abre o modal do `ContactForm`), Mapa `/map`, Notícias `/news`, Blog `/blog`
- Grupo 2, links externos (tooltip com "↗"): Portfolio 3D, Empresas GV, LinkedIn, GitHub
- Idioma: `LanguageMenu`, um botão com a bandeira atual que abre para cima a lista dos 9 idiomas. Na primeira visita o idioma vem do país (GeoIP), como antes
- `Item` (`Nav/Item/index.tsx`) recebe `url` (interno ou `http...`) ou `onClick`. A página ativa vem de `isActivePath` (`Nav/isActivePath.ts`): Home só na raiz, as demais também nas subrotas (`/blog/post` ativa Blog)
- Cabe sem rolagem a partir de 375px de largura

---

## `ChatWidget`
**Arquivo:** `src/components/ChatWidget/index.tsx`  
**Responsabilidade:** UI de chat com o agente n8n: cabeçalho com o JARVIS Core e o status, mensagens, sugestões, indicador de digitando, microfone e campo de texto

- Sem props. Ocupa 100% da altura do contêiner pai (Drawer do `ChatButton` ou página `/chat`)
- Estado local: `messages`, `inputValue`, `isLoading`, `isSpeaking`; o microfone usa `useWhisperRecorder` (Whisper da VPS) e cai para `useSpeechRecognition` quando o navegador não grava áudio
- `sendMessage(text)` serve para o campo, as sugestões e o microfone: adiciona a mensagem, liga o "digitando", chama `generateAIResponse` e fala a resposta
- `generateAIResponse(message)` (função de módulo) faz `POST /.netlify/functions/n8n-chat` com `{ chatInput, sessionId }`, lê `data.output` e remove a URL do site e "Vamos construir o futuro juntos!"
- `chatSessionId` é gerado uma vez por carregamento da página e mantém a memória de conversa no n8n
- Idioma fixo em pt-BR (o n8n é fixo em português)
- Respostas do assistente renderizadas por `formatMessage` (`formatMessage.tsx`); sugestões em `suggestions.ts`
- Testes: `__tests__/ChatWidget.test.tsx` (sugestões, digitando, formatação, microfone) e `__tests__/formatMessage.test.tsx`
- Detalhes do fluxo: [FEATURES.md](./FEATURES.md#-chat-ia-n8n)

## `JarvisCore`
**Arquivo:** `src/components/ChatWidget/JarvisCore.tsx`  
**Responsabilidade:** núcleo animado em canvas exibido no cabeçalho do `ChatWidget`

- Props: `state: 'idle' | 'thinking' | 'speaking' | 'listening'`, `size?: number` (padrão 72; o widget usa 56)
- Desenha com `requestAnimationFrame` direto no canvas; o estado atual é lido de um ref, então trocar de estado não reinicia a animação
- Com a voz do Piper as barras seguem o espectro real (`getPiperAnalyser()` de `piperTts.ts`); com a voz do navegador o espectro é animado
- Respeita `prefers-reduced-motion`

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
│   │   ├── hazards.ts       (incêndios, PM2.5 → AQI)
│   │   ├── capAlerts.ts
│   │   ├── quakes.ts
│   │   ├── volcanoes.ts
│   │   ├── hurricanes.ts
│   │   ├── wind.ts
│   │   ├── iconScale.ts     (tamanho dos ícones pelo zoom)
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
