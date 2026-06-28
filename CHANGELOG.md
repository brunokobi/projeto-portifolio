# Changelog

Todas as mudanças notáveis deste projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Unreleased]

---

## [1.4.0] — 2026-06-28

### Added
- ESLint 9 flat config (`eslint.config.mjs`) com `typescript-eslint`, `react-hooks`, `react-refresh` e `eslint-config-prettier`
- Prettier com configuração padronizada (`printWidth: 100`, `endOfLine: lf`)
- Scripts npm: `lint`, `lint:fix`, `format`, `format:check`
- Step de lint no CI/CD

### Fixed
- 30 erros de lint corrigidos: branches duplicadas, `setState` em effects, imports não usados, `var` → `const`
- `Nav/Item`: substituído `useState + useEffect` por valor derivado `location.pathname === url`
- `NewsPanel`: acesso a ref durante render movido para `useEffect`

---

## [1.3.0] — 2026-06-27

### Added
- TypeScript `strict: true` — 108 erros corrigidos em 22 arquivos
- Tipos explícitos para todos os componentes, hooks e utilitários
- `PromiseFulfilledResult<T>` type predicate no feed de notícias

---

## [1.2.0] — 2026-06-26

### Added
- chatBruno: assistente Multi-Agente RAG com LangChain + Supabase pgvector + AWS EC2 (n8n)
- Seção de notícias de IA com 25+ feeds RSS internacionais
- Refatoração da página News em componentes menores (`HeroCarousel`, `CategorySection`, `ScrollRow`)
- Utilitários RSS compartilhados (`parseRSS`, `cleanDesc`, `timeAgo`, `translateArticles`)

---

## [1.1.0] — 2026-06-25

### Added
- Testes automatizados com Vitest + Testing Library (36 testes, 5 suítes)
- CI/CD com GitHub Actions: TypeScript check + testes + build
- Acessibilidade ARIA em formulário de contato e botões
- SEO: meta tags Open Graph, Twitter Card e `<title>` dinâmico
- Bundle otimizado com `manualChunks` (react-vendor, chakra, framer, supabase, intl)

---

## [1.0.0] — 2026-06-20

### Added
- Portfólio completo migrado para TypeScript
- Globo 3D interativo com ESRI ArcGIS + elevação exagerada e nuvens NASA
- WeatherBar em tempo real via Open-Meteo + geolocalização
- Suporte a 9 idiomas com detecção automática por IP (pt, en, es, fr, de, zh, ru, ar, kl)
- Síntese de voz (`TextAudio`) ativável por hover
- Formulário de contato com automação n8n via Netlify Function
- Contador de visitas em tempo real com Supabase Realtime
- Fundo animado com estrelas, ícones e globo ESRI
- Detecção de objetos via Hugging Face DETR
- Mapa interativo com pontos de interesse globais
