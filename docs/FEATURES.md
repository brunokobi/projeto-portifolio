# Features em Tempo Real

Todas as camadas do globo usam dados reais. Nenhuma camada usa dado simulado ou mockado.

Cada camada tem um botão ON/OFF na barra de cima (`WeatherBar`), que dispara um `CustomEvent` (`globe<Camada>Toggle`) e grava a escolha no `localStorage`. O loop de desenho fica em `src/components/GlobeBackground/index.tsx` (função `drawPins`); cada fonte de dados tem seu próprio arquivo na mesma pasta.

| Camada | Arquivo | Fonte | Atualização | Botão |
|---|---|---|---|---|
| Satélites | `satellites.ts` | CelesTrak (TLE) + SGP4 | Posição a cada 10s | 🛰️ |
| ISS | `iss.ts` | wheretheiss.at | 8s | 🛰 ISS |
| Cidades + AQI | `geo.ts`, `cities.ts` | Open-Meteo + OpenAQ | Clima com cache de 2h | — |
| Incêndios | `hazards.ts` | NASA VIIRS (ArcGIS Living Atlas) | Ao carregar a página | 🔥 |
| Alertas | `capAlerts.ts` | CAP Alerts Feed (ArcGIS Living Atlas) | Ao carregar a página | ⚠️ |
| Terremotos | `quakes.ts` | USGS | Ao carregar a página | 🌍 |
| Vulcões | `volcanoes.ts` | Smithsonian GVP | Ao carregar a página | 🌋 |
| Furacões | `hurricanes.ts` | Active Hurricanes (ArcGIS Living Atlas) | Ao carregar a página | 🌀 |
| Vento | `wind.ts` | Grade GFS (`firestorm-wind-data`) | Ao carregar a página | 💨 |

Desligadas: aviões (o OpenSky bloqueia CORS) e aurora boreal (removida do globo a pedido). Os loaders `aircraft.ts` e `aurora.ts` foram apagados em 02/11/2026.

---

## 🛰️ Satélites

**Arquivo:** `src/components/GlobeBackground/satellites.ts`  
**Fonte:** CelesTrak, grupos `gps-ops`, `galileo` e `weather` (`https://celestrak.org/NORAD/elements/gp.php?GROUP=<grupo>&FORMAT=tle`, CORS liberado)  
**Total:** cerca de 137 satélites (32 GPS, 32 Galileo, 73 meteorológicos em 02/11/2026)  
**Status:** ✅ Ativo

- A posição é calculada no navegador com SGP4 (`satellite.js`) a partir dos TLEs.
- Os TLEs ficam em cache por 2h (`TLE_CACHE_TTL_MS`). Se o CelesTrak responder sem TLE ou falhar, o cache anterior é mantido.
- O globo chama `loadSatellites()` a cada 10s (`SATELLITE_POLL_INTERVAL_MS`). Dentro das 2h de cache isso só recalcula a posição, sem requisição nova, e os satélites se movem no globo.
- A ISS fica de fora: tem tracker próprio em `iss.ts`.
- Renderização: emoji 🛰️ com legenda curta ("Nav", "Weather") na cor do tipo. A legenda some quando o globo está afastado (ver [Tamanho dos ícones](#tamanho-dos-ícones-conforme-o-zoom)).
- Hover: nome do satélite e altitude em km.
- Teste: `__tests__/satellites.test.ts` (posição muda com o tempo usando uma única requisição).

---

## 🛰 ISS (International Space Station)

**Arquivo:** `src/components/GlobeBackground/iss.ts`  
**Fonte:** `https://api.wheretheiss.at/v1/satellites/25544`  
**Polling:** 8 segundos (`ISS_POLL_INTERVAL_MS`)  
**Status:** ✅ Ativo

- Renderização: anel azul pulsante, anel fixo e ponto central, com o texto "🛰 ISS".
- Hover: altitude (km) e velocidade (km/h).
- Teste: `__tests__/iss.test.ts`.

---

## 🏙️ Cidades e AQI

**Arquivos:** `src/components/GlobeBackground/geo.ts` (`CITIES`), `cities.ts`, `index.tsx`  
**Clima/hora local:** Open-Meteo (`timezone=auto`), cache de 2h  
**AQI:** OpenAQ PM2.5 via ArcGIS Living Atlas (`Air_Quality_PM25_Latest_Results`), estação a até 50 km da cidade, convertido para AQI (EPA)

- Cada cidade é um anel verde pulsante com o nome ao lado.
- O card de hover mostra hora local, temperatura, clima e AQI classificado (`getAQILabel`): Bom, Moderado, Insalubre (Sensíveis), Insalubre, Muito Insalubre, Perigoso.
- O card tem botão de fechar (×) e some quando o mouse sai do globo. Se o clima chega depois que o mouse já saiu da cidade, o card não abre (antes ficava preso na tela).
- O AQI não tem pontos próprios no mapa; aparece só no card da cidade. É buscado (`fetchCityAqi`) no primeiro hover de cada cidade; sem estação próxima, o card fica sem AQI. Até 02/11/2026 o card mostrava valores fixos no código, já removidos.

---

## 🔥 Incêndios

**Arquivo:** `src/components/GlobeBackground/hazards.ts` (`loadWildfires`)  
**Fonte:** NASA VIIRS via ArcGIS Living Atlas (`Satellite_VIIRS_Thermal_Hotspots_and_Fire_Activity`)  
**Filtro:** últimas 6h, confiança alta e FRP ≥ 10 (até 500 focos)  
**Status:** ✅ Ativo

- Sem o filtro vêm mais de 100 mil focos por dia no mundo, o que é inviável de desenhar.
- Renderização: emoji 🔥.
- Hover: satélite e potência do fogo (FRP) no nome, mais a confiança da detecção.

---

## ⚠️ Alertas de emergência (CAP)

**Arquivo:** `src/components/GlobeBackground/capAlerts.ts`  
**Fonte:** CAP Alerts Feed via ArcGIS Living Atlas (avisos oficiais de agências de vários países)  
**Status:** ✅ Ativo

- A área do alerta é um polígono; o globo plota o centroide (`returnCentroid`).
- Renderização: emoji ⚠️.
- Hover: evento, severidade, área e órgão emissor.

---

## 🌍 Terremotos

**Arquivo:** `src/components/GlobeBackground/quakes.ts`  
**Fonte:** USGS, magnitude 4.5+ das últimas 24h (`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson`)  
**Status:** ✅ Ativo

- Renderização: anel pulsante com raio pela magnitude (`quakeRadius`) e cor pela magnitude (`quakeColor`: amarelo → laranja → vermelho), com a magnitude escrita ao lado.
- Hover: magnitude, local e há quanto tempo ocorreu.
- Teste: `__tests__/quakes.test.ts`.

---

## 🌋 Vulcões

**Arquivo:** `src/components/GlobeBackground/volcanoes.ts`  
**Fonte:** Smithsonian GVP, via gist público do vasturiano (`world_volcanoes.json`, 425 vulcões)  
**Status:** ✅ Ativo

- Renderização: triângulo colorido pelo tipo (`volcanoColor`) e com tamanho pela elevação (`volcanoRadius`, reduzido em 20%).
- Hover: nome, país, tipo e elevação.
- Teste: `__tests__/volcanoes.test.ts`.

---

## 🌀 Furacões

**Arquivo:** `src/components/GlobeBackground/hurricanes.ts`  
**Fonte:** ArcGIS Living Atlas "Active Hurricanes, Cyclones and Typhoons" (`Active_Hurricanes_v1`), que junta NHC (Atlântico e Pacífico) e JTWC (demais bacias). Cobre o globo inteiro e libera CORS.  
**Status:** ✅ Ativo

- Carregado uma vez quando o globo monta. `HURRICANE_POLL_INTERVAL` existe em `hurricanes.ts`, mas o globo não faz polling.
- Renderização: espiral colorida pela categoria (`hurricaneColor`) e com raio pelo vento (`hurricaneRadius`), desenhada por `drawHurricaneIcon`.
- Hover: nome, categoria Saffir-Simpson, velocidade do vento (km/h) e pressão (mb).
- O RSS da NOAA deixou de ser usado em 08/10/2026; a função `noaa.ts` e a regra `/api/noaa/*` foram removidas em 02/11/2026.
- Teste: `__tests__/hurricanes.test.ts`.

---

## 💨 Vento

**Arquivo:** `src/components/GlobeBackground/wind.ts`  
**Fonte:** grade de vento de superfície do modelo GFS (1°), do repositório público `Deasus/firestorm-wind-data` (`current-wind-surface.json`, atualizado periodicamente pelo repositório)  
**Status:** ✅ Ativo

- 700 partículas (`WIND_PARTICLE_COUNT`) andam pelo campo de vento e deixam rastro que desbota, coloridas pela velocidade (`speedToColor`).
- O heatmap de vento foi removido; só as partículas ficaram.
- Teste: `__tests__/wind.test.ts`.

---

## Tamanho dos ícones conforme o zoom

**Arquivo:** `src/components/GlobeBackground/iconScale.ts`

- A cada quadro, `iconScaleForAltitude(cam.z)` calcula um fator pela altitude da câmera: 1 até 8.000 km e caindo aos poucos até 0,5 a partir de 22.000 km. O zoom do globo vai de 4.000 km a 25.000 km, e a visão inicial fica perto de 20.000 km.
- O fator multiplica raios, offsets e fontes de cidades, satélites, ISS, localização do visitante, incêndios, alertas, vulcões, furacões e terremotos. `scaledFontPx` não deixa fonte abaixo de 7px.
- Com fator abaixo de 0,75 (`SHORT_LABEL_MIN_SCALE`), as legendas curtas dos satélites somem. O nome continua no hover.
- As linhas de vento fazem o contrário e engrossam com a câmera perto: `windLineWidthForAltitude(cam.z)` vai de 3,5px a 4.000 km até 1,1px a partir de 22.000 km (~1,3px na visão inicial).
- Teste: `__tests__/iconScale.test.ts`.

---

## Barra de camadas (WeatherBar)

**Arquivo:** `src/components/WeatherBar/index.tsx`

- Na Home, a barra aparece quando o globo termina de carregar (`markGlobeReady()` em `view.when`, lido com `useGlobeReady()` de `src/utils/globeReady.ts`). Nas outras páginas aparece na hora.
- Os botões não dependem do clima. Temperatura e cidade aparecem quando o clima carrega e ficam ocultas se ele falhar.
- Localização: geolocalização do navegador com timeout de 8s; se negada ou sem resposta, cai para `ipapi.co`.

---

## Carregamento e erros

- Cada loader usa `AbortSignal.timeout` e devolve `[]` se falhar, sem derrubar as outras camadas.
- Satélites (10s) e ISS (8s) têm polling. As demais camadas carregam uma vez quando o globo monta.

---

## Minificação sem renomear identificadores

`build.minify: "esbuild"` com `esbuild.minifyIdentifiers: false` em `vite.config.ts` (desde 02/11/2026): minifica espaços e sintaxe, mas não renomeia identificadores. A renomeação causava `Cannot access X before initialization` em event handlers que liam objetos guardados em refs (foi o que desligou terremotos e o hover dos vulcões no passado). Não ligue `minifyIdentifiers` sem testar o hover no build de produção num navegador com GPU (o Chromium headless usa SwiftShader e o ArcGIS não renderiza o globo nele).

---

## 💬 Chat IA (n8n)

**Arquivos:** `src/components/ChatWidget/index.tsx`, `src/components/ChatWidget/JarvisCore.tsx`, `src/components/ChatButton/index.tsx`, `src/hooks/useChatWithAudio.ts`, `src/utils/generateGreeting.ts`, `src/utils/textToSpeech.ts`, `src/utils/jarvisProfile.ts`, `netlify/functions/n8n-chat.ts`  
**Backend:** workflow "chatBruno - JARVIS (perfil único)" no n8n (self-hosted em `n8n.brunokobi.tech`), acessado via proxy Netlify  
**Status:** ✅ Ativo

- **De onde vêm as respostas:** o build publica `/jarvis/perfil.md`, gerado por `buildJarvisProfile` (`src/utils/jarvisProfile.ts`) a partir das mesmas fontes do site: `sobre1-3`, `experienciaN*`, `educacao1` e `projectN*` do `src/i18n/messages/pt.json` e os labels de `src/pages/About/skills.ts`, mais contato fixo (GitHub, LinkedIn, e-mail; sem telefone). O plugin `jarvisProfile` em `vite.config.ts` emite o arquivo no build e o serve em `npm start`. Header em `netlify.toml` (`text/markdown`, CORS aberto, cache de 5 min)
- **Workflow n8n:** Chat Trigger → `Perfil` (HTTP Request que baixa `https://brunokobi.tech/jarvis/perfil.md`) → um único AI Agent `JARVIS` (modelo `nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter, credencial "OpenRouter (JARVIS)" no n8n, temperatura 0.2, Memória de Conversa de 10 mensagens pelo `sessionId`). O prompt manda responder só com o perfil, em terceira pessoa, e dizer que não tem a informação quando ela não estiver lá. Substituiu o desenho antigo (roteador + 7 agentes + busca vetorial no Supabase), que inventava experiência porque os agentes não tinham fatos no prompt e nem sempre chamavam a busca
- **Para mudar o que o JARVIS sabe:** edite o currículo/projetos no `pt.json` (ou as skills) e faça deploy; o workflow lê o perfil novo sozinho. Experiência nova precisa entrar também em `EXPERIENCE_ORDER` (o teste `jarvisProfile.test.ts` falha se faltar)
- **Modelo e cota:** saiu do Gemini porque a cota gratuita do projeto era de 20 pedidos/dia e derrubava o chat. Modelos `:free` do OpenRouter aceitam ~1.000 pedidos/dia em conta com créditos. Uma chamada ao LLM por pergunta; a resposta leva de 3 a 45 s (o proxy `n8n-chat.ts` corta em 55 s)

- Envio: `POST /.netlify/functions/n8n-chat` com `{ chatInput, sessionId }` (formato do Chat Trigger do n8n; o formato antigo `{ message, language }` faz o workflow retornar 500)
- Resposta: o texto vem em `data.output`; se vier vazio, o widget mostra mensagem de fallback; erro de rede/HTTP mostra mensagem de erro
- Pós-processamento (em `generateAIResponse`): o widget remove da resposta a URL `https://brunokobi.netlify.app` e a frase final "Vamos construir o futuro juntos!" (regex no cliente; o workflow n8n em si não foi alterado por este repositório)
- `sessionId`: UUID gerado uma vez por carregamento da página (variável de módulo `chatSessionId`, `crypto.randomUUID()` com fallback). Mantém a Memória de Conversa do n8n entre mensagens da mesma visita; recarregar a página inicia conversa nova
- Idioma: o seletor de idioma da UI **não tem efeito** no n8n (o workflow é fixo em português e o payload não leva idioma). Ele só afeta a voz do áudio (TTS)
- Config: variável `N8N_WEBHOOK_URL` no Netlify (obrigatória; ausente → function retorna 500)
- Aviso no Telegram: depois de cada resposta, `n8n-chat.ts` manda pergunta, resposta, local (header `x-nf-geo` da Netlify) e os 8 primeiros caracteres do `sessionId` para o Telegram do Bruno, pelo bot de avisos do `track.ts` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). Lógica em `netlify/lib/chatAlert.ts`: texto puro, corte em 1500 caracteres, limite de 30 avisos por conversa por hora (contador em memória da instância, zera em cold start) e timeout de 3s. Falha no Telegram só gera log; o chat responde normalmente. Se o n8n falhar, o aviso diz "JARVIS falhou" com o status. Testes em `netlify/__tests__/chatAlert.test.ts`
- Pontos de entrada: botão flutuante global (`ChatButton`, abre o widget num Drawer; oculto em `/news`) e rota `/chat`
- Identidade: o assistente se apresenta como **JARVIS** (título do widget "JARVIS")
- Saudação dinâmica: ao montar o widget, `generateGreeting()` (`src/utils/generateGreeting.ts`) pede geolocalização ao navegador, consulta Open-Meteo (temperatura e condição) e Nominatim (cidade) e monta: "{Bom dia|Boa tarde|Boa noite}! Eu sou o JARVIS, seu assistente virtual. Em {cidade} agora faz {temp}°C, com {condição}. Como posso ajudá-lo?". O período do dia usa a hora local do fuso retornado pelo Open-Meteo (5h–11h59 bom dia; 12h–17h59 boa tarde; demais boa noite). Sem geolocalização (negada/indisponível) ou se o clima falhar (timeout 5s por request), usa o texto fixo "Olá. Eu sou o JARVIS, seu assistente virtual. Como posso ajudá-lo?". A saudação substitui a primeira mensagem do chat e é falada se o áudio estiver ativo (o navegador pode bloquear a fala sem interação prévia do usuário)
- Voz: `speak()` em `textToSpeech.ts` usa primeiro o **Piper** (`piperTts.ts`): `GET https://tts.brunokobi.tech/tts.mp3?text=&lang=&speed=` na VPS, vozes masculinas `pt_BR-faber`, `en_US-ryan`, `es_ES-davefx`, `fr_FR-tom`, `de_DE-thorsten`, `ru_RU-dmitri` e `ar_JO-kareem` (todas medium). O texto perde markdown e links, "JARVIS" vira "Járvis" (o Piper pronunciava "Javier") e é dividido em trechos de até 400 caracteres, tocados em sequência com o próximo pré-carregado.
- Se o idioma não tem voz no Piper (chinês, groenlandês) ou nada chegou a tocar (serviço fora, rede, áudio bloqueado pelo navegador), cai para a Web Speech API, que prefere voz **masculina** de boa qualidade (David, Daniel, Paulo, "male"...).
- Servidor (repositório privado da VPS, `compose/vpsrafa-piper`): FastAPI + `piper-tts` 1.8, uma síntese por vez, limite de 1 CPU, 1.200 caracteres por pedido, 30 sínteses por minuto por IP (frases em cache não contam), CORS só para o site e resposta com cache de 30 dias.
- Velocidade de fala: `useChatWithAudio` (`respondWithAudio`) chama `speak()` com `rate: 1.4` (pitch 1, volume 1). O padrão de `speak()` continua `rate = 1` para quem chamar sem informar
- **JARVIS Core** (`JarvisCore`, no cabeçalho do chat, 56px): canvas com 24 barras radiais, anel externo e núcleo com glow, em verde da marca. Tem quatro estados, mostrados também em texto ao lado do título: `idle` ("Online", barras respirando devagar), `thinking` ("Pensando...", arcos girando enquanto o n8n responde), `speaking` ("Falando...", barras agitadas) e `listening` ("Ouvindo...", microfone ligado). O espectro é animado, **não** vem do áudio real do TTS (a Web Speech API não expõe o áudio). Desenha direto no canvas com `requestAnimationFrame`, sem re-render do React por quadro, e respeita `prefers-reduced-motion`
- `isSpeaking`: `respondWithAudio` liga `isSpeaking` e o desliga no fim da fala (`onend`), em erro (`onerror`, por exemplo quando o navegador bloqueia a fala automática sem interação) ou pelo botão de parar. Só a fala mais recente pode desligar o estado, para uma fala interrompida não apagar o status da nova
- Layout: o widget ocupa a altura do painel lateral (`ChatButton`, Drawer acima da barra de camadas e do menu) ou da página `/chat`; só a lista de mensagens rola
- Sugestões: enquanto o visitante não perguntou nada, aparecem botões com perguntas prontas (`suggestions.ts`), alinhadas às categorias do roteador do n8n (perfil, projetos, tecnologias, experiência, contato). Clicar envia a pergunta
- Indicador de digitando: enquanto o n8n responde, aparece um balão com três pontos animados e o núcleo fica em "Pensando..."
- Formatação: as respostas passam por `formatMessage` (`formatMessage.tsx`), que mostra **negrito**, *itálico*, `código`, listas com `-` ou `1.` e links clicáveis, sem os asteriscos. Monta elementos React, nunca injeta HTML da resposta
- Voz: botão de microfone (`useSpeechRecognition`, `src/hooks/useSpeechRecognition.ts`) usa o reconhecimento de voz do navegador em pt-BR. O texto parcial aparece na caixa de digitar e, quando o visitante para de falar, a pergunta é enviada. Ligar o microfone interrompe a fala do JARVIS. Só aparece em navegadores com a API (Chrome, Edge, Safari); no Firefox o botão não aparece. Se a permissão for negada, mostra um aviso pedindo para liberar o microfone
