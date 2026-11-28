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
- Celular (abaixo do breakpoint `md`): a cidade some, as camadas ficam num botão "🗺️ Camadas N/9" que abre um popover com o modo noite e uma grade 2×N de botões de 44px (`aria-pressed`). As camadas só aparecem na Home (`waitForGlobe`); nas outras páginas fica só o clima, e sem clima a barra não é renderizada. No desktop a barra continua igual.
- Testes: `__tests__/WeatherBar.test.tsx` (inclui "botões aparecem mesmo com o clima falhando", "na Home espera o globo" e o bloco "no celular"). O `matchMedia` do jsdom é simulado em `src/test/setup.ts`.

---

## `DevBlog`
**Arquivo:** `src/pages/DevBlog/index.tsx`  
**Responsabilidade:** Página de blog com posts

### Sub-componentes
- `PostRenderer` — renderiza Block[] com markdown-lite
  - **bold:** `**text**` → `<span style="color: #42c920">`
  - **code:** `` `text` `` → `<code>` monospace
  - **italic:** `*text*` → `<em>`
  - Blocos: `heading`, `paragraph`, `list`, `code`, `hr` e `image` (`src`, `alt`, `caption` opcional; imagens em `public/blog/<post>/`, em WebP)
- `formatPostDate` — data do post sem voltar um dia pelo fuso

### Estrutura
```typescript
interface Post {
  slug: string;
  title: string;
  date: string;      // "AAAA-MM-DD", mostrado por formatPostDate
  tags: string[];
  excerpt: string;
  blocks: Block[];
}

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; language?: string; code: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "hr" };
```

A lista do blog segue a ordem do array `posts`, então post novo entra na posição certa pela data (mais novo primeiro).

### Posts existentes
| Slug | Data | Assunto |
|---|---|---|
| `jarvis-whisper-piper` | 14/11/2026 | Voz do JARVIS com Whisper e Piper na VPS |
| `grande-vitoria-empresas` | 11/11/2026 | Dataset de empresas da Grande Vitória: crescimento da base, atualizações e dificuldades (imagens em `public/blog/grande-vitoria/`) |
| `copa-aspirador` | 07/11/2026 | O jogo Copa Aspirador, em Python no navegador (imagens em `public/blog/copa-aspirador/`) |
| `globo-tempo-real` | 31/10/2026 | Todas as fontes do globo e as APIs que não deram certo |
| `oracle-vps-free-tier` | 20/09/2026 | VPS da Oracle reclamada por ociosidade |

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
- Grupo 1, páginas do site: Home `/`, Sobre `/about`, Projetos `/projects`, JARVIS (abre o chat pelo evento `jarvis:open`; sem `ChatButton` na página, vai para `/chat`), Contato (abre o modal do `ContactForm`), Mapa `/map`, Notícias `/news`, Blog `/blog`
- Grupo 2, links externos (tooltip com "↗"): Portfolio 3D, Empresas GV, LinkedIn, GitHub. No celular ficam no menu "Mais" (`ExternalLinksMenu`, ícone ⋯), para os itens do site caberem na barra com alvos de toque de 38px
- Respeita a área segura do iPhone (`env(safe-area-inset-bottom)`)
- Idioma: `LanguageMenu`, um botão com a bandeira atual que abre para cima a lista dos 9 idiomas. Na primeira visita o idioma vem do país (GeoIP), como antes
- `Item` (`Nav/Item/index.tsx`) recebe `url` (interno ou `http...`) ou `onClick`. A página ativa vem de `isActivePath` (`Nav/isActivePath.ts`): Home só na raiz, as demais também nas subrotas (`/blog/post` ativa Blog)
- Cabe sem rolagem a partir de 375px de largura

---

## `ChatWidget`
**Arquivo:** `src/components/ChatWidget/index.tsx`  
**Responsabilidade:** UI de chat com o agente n8n: cabeçalho com o JARVIS Core e o status, mensagens, sugestões, indicador de digitando, microfone e campo de texto

- Sem props. Ocupa 100% da altura do contêiner pai (Drawer do `ChatButton` ou página `/chat`)
- Estado local: `messages`, `inputValue`, `isLoading`, `isSpeaking`; o microfone usa `useWhisperRecorder` (Whisper da VPS) e cai para `useSpeechRecognition` quando o navegador não grava áudio; `voiceConversationRef` faz o microfone reabrir depois da resposta a uma pergunta falada
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
- Renderizado em `App.tsx` em todas as páginas, exceto `/news`; fica oculto em `/chat`, onde o chat já está aberto na página
- No celular tem 48px e fica a 12px da borda, logo acima do menu; o ícone vem de `/int-icon.png` do próprio site
- O `ChatWidget` também é usado standalone na rota `/chat` (`src/pages/Chat.tsx`)
- Escuta o evento `jarvis:open` em `window` (disparado por `openJarvisChat()`, `ChatButton/openJarvisChat.ts`) e abre a gaveta; é o que o item JARVIS do menu usa

---

## `Home`
**Arquivo:** `src/pages/Home/index.tsx`  
**Responsabilidade:** apresentação com o globo ao fundo e as frases digitadas

- As frases vêm de `PHRASE_IDS` (`frase_1` a `frase_10` dos arquivos de idioma), na ordem de exibição; o texto de cada uma está nos 9 idiomas
- `useTypewriter(strings, { speed, deleteSpeed, pauseMs, gapMs, paused })` (`src/hooks/useTypewriter.ts`) devolve `{ text, index }`: digita a 70 ms por letra, segura a frase inteira 3,8 s, apaga a 40 ms por letra e deixa a linha vazia 0,6 s antes da próxima. Com `paused` (mouse em cima das frases) a frase não é apagada. A animação só reinicia quando o texto das frases muda (troca de idioma)
- Cursor verde piscando (`keyframes` do Emotion, 1 s)
- Voz: ao abrir, fala o nome e só a primeira frase; o hover nas frases fala a frase da tela

## `Projects`
**Arquivo:** `src/pages/Projects/index.tsx`  
**Responsabilidade:** cards dos projetos (`ProjectCard`) e o `ServiceStatus` no topo

- Cada card tem título e descrição nos arquivos de idioma (`projectNt`/`projectNd`), imagem em `src/assets/img/`, demo, código e tags
- Ordem atual: Dataset Grande Vitória (`project16`), JARVIS (`project14`), Copa Aspirador (`project19`), Tabela ACFDV, Letrinhas Mágicas, Frota Realtime, Arkon, Mega-Sena IA, BPF Check, Portfólio 3D e os projetos da faculdade
- O perfil do JARVIS lista todos os `projectNt`/`projectNd`, então card novo ou alterado entra no que ele sabe no próximo deploy

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
│   ├── DevBlog/ (index.tsx, PostRenderer.tsx, formatPostDate.ts, posts.ts; imagens dos posts em public/blog/)
│   └── ...
├── hooks/useChatWithAudio.ts
├── utils/
│   ├── globeReady.ts        (sinal "globo pronto" para a WeatherBar)
│   ├── generateGreeting.ts, textToSpeech.ts, geoip.ts, ...
└── routes/index.tsx
```
