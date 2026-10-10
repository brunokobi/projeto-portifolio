# Componentes Principais

## `GlobeBackground` 
**Arquivo:** `src/components/GlobeBackground/index.tsx`  
**Responsabilidade:** Renderização do globo 3D + overlays

### Props
```typescript
// Nenhuma (self-contained)
```

### Estado
- `hoverInfo: { title: string; lines: string[]; x: number; y: number } | null`
- Refs: `sceneViewRef`, `quakeScreenPosRef`, `issScreenPosRef`, `volcanoScreenPosRef`
- Refs: `quakesEnabledRef`, `issEnabledRef`, `volcanoesEnabledRef`

### Ciclo de Vida
1. **useEffect (setup):** ArcGIS init, event listeners
2. **useEffect (data):** Load quakes/ISS/volcanoes in parallel
3. **useEffect (render loop):** requestAnimationFrame → draw particles + pins
4. **Cleanup:** AbortController, event listener removal

### Métodos Chave
- `drawPins()` — renderiza circles/ellipses/triangles pra todos os pontos
- `drawParticles()` — wind canvas layer com advection
- `handlePointerMove()` — hit detection pra hover tooltips

### Estrutura JSX
```jsx
<div ref={mapContainer}>
  <canvas ref={canvasRef} /> {/* Partículas */}
  {hoverInfo && <Tooltip />}
</div>
```

---

## `WeatherBar`
**Arquivo:** `src/components/WeatherBar/index.tsx`  
**Responsabilidade:** Toggles pra features do globo

### Buttons
| Emoji | Label | Event | Estado Ref |
|-------|-------|-------|-----------|
| 🛰 | ISS | globeIssToggle | issEnabledRef |
| 🌋 | VULCÕES | globoVolcanoesToggle | volcanoesEnabledRef |

O botão de terremotos (SISMOS) foi removido; o listener `globeQuakesToggle` ainda existe em `GlobeBackground`, mas nada o dispara.

### Behavior
- Dispara CustomEvent com `detail: { enabled: boolean }`
- Listener em GlobeBackground atualiza os Refs
- Render loop só desenha se enabled

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
│   │   ├── index.tsx
│   │   ├── quakes.ts
│   │   ├── iss.ts
│   │   ├── ocean.ts (legado, sem uso)
│   │   ├── volcanoes.ts
│   │   ├── wind.ts (empty after removal)
│   │   └── __tests__/
│   ├── ChatWidget/
│   │   ├── index.tsx
│   │   └── JarvisCore.tsx (hook em src/hooks/useChatWithAudio.ts, saudação em src/utils/generateGreeting.ts)
│   ├── WeatherBar/
│   ├── Nav/
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── DevBlog/
│   │   ├── index.tsx
│   │   ├── PostRenderer.tsx
│   │   └── posts.ts
│   └── ...
└── routes/
    └── index.tsx
```
