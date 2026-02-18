# 🛸 Bruno Kobi | Full Stack Developer & AI Systems Engineer 🛸

![Portfolio](portifolio.png)

<p align="center">

  <!-- Status -->
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-green?style=for-the-badge&logo=rocket&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

  <!-- Frontend -->
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />

  <!-- Backend -->
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/n8n-FF6D00?style=for-the-badge&logo=n8n&logoColor=white" />
  <img src="https://img.shields.io/badge/Deno-000000?style=for-the-badge&logo=deno&logoColor=white" />

  <!-- AI -->
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />

  <!-- GIS -->
  <img src="https://img.shields.io/badge/ArcGIS-FF2D20?style=for-the-badge&logo=esri&logoColor=white" />

  <!-- Arquitetura -->
  <img src="https://img.shields.io/badge/Architecture-Event--Driven-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-RLS%20Enabled-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Serverless-Edge%20Runtime-purple?style=for-the-badge" />

</p>

------------------------------------------------------------------------

## 🌌 Visão Estratégica

Este portfólio foi projetado como um **ecossistema digital
inteligente**, integrando:

-   ⚡ Engenharia Full Stack
-   🌍 Geoprocessamento (GIS)
-   🤖 Inteligência Artificial Conversacional
-   🔁 Arquitetura orientada a eventos
-   ♿ Acessibilidade extrema
-   🌐 Internacionalização avançada

Não é apenas uma interface visual --- é uma demonstração prática de
arquitetura moderna em produção.

------------------------------------------------------------------------

## 🧠 Arquitetura de Alto Nível

Princípios adotados:

-   Clean Architecture
-   Event-Driven Design
-   Backend-as-a-Service
-   Serverless First
-   Modularização por Domínio

```{=html}
<!-- -->
````

```
Client (React 18)
   ↓
Supabase (Auth + PostgreSQL + Edge Functions)
   ↓
Postgres Trigger
   ↓
Webhook
   ↓
n8n (Orquestração)
   ↓
Google Gemini AI
   ↓
Resend (Email)
```

---

## 🛠️ Stack Tecnológica

### 🎨 Frontend

* React 18 (Hooks + Context API)
* Chakra UI (Design System acessível)
* Framer Motion (Animações fluidas)
* React-Intl (9 idiomas)
* Web Speech API (Text-to-Speech)
* Lazy Loading + Code Splitting

### 🧠 Backend & Infraestrutura

**Supabase** - PostgreSQL - JWT Authentication - Row Level Security
(RLS) - Edge Functions (Deno Runtime) - Triggers automatizados

**n8n** - Workflows assíncronos - Integração com APIs externas -
Orquestração desacoplada do frontend - Pipeline inteligente

**Inteligência Artificial** - Google Gemini AI - Análise de sentimento -
Classificação automática de mensagens - Respostas inteligentes -
Fallback para atendimento humano

---

## 🌍 Módulo Geoespacial (GIS)

* ESRI ArcGIS API
* Mapas 3D interativos
* Geolocalização dinâmica
* Visualização espacial estratégica

---

## 🛰️ Fluxo de Comunicação (Uplink)

1. Validação e envio via Supabase SDK
2. Persistência na tabela `contato`
3. Trigger PostgreSQL ativa Edge Function
4. Webhook dispara fluxo no n8n
5. IA classifica mensagem
6. Notificação via Resend

---

## 🔐 Segurança

* JWT Authentication
* Row Level Security (RLS)
* Sanitização de inputs
* Rate limiting
* Variáveis de ambiente isoladas

---

## ⚙️ Execução Local

```bash
git clone https://github.com/brunokobi/projeto-portifolio.git
yarn install
cp .env.example .env.local
yarn start
```

---

## 🌐 Variáveis de Ambiente

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
GOOGLE_AI_KEY=
RESEND_API_KEY=
```

---

## 📈 Roadmap

* Sistema de fila inteligente com IA
* Dashboard administrativo
* Observabilidade (Sentry / OpenTelemetry)
* CI/CD automatizado
* Deploy multi-região

---

## 🧬 Diferenciais Técnicos

✔ Arquitetura orientada a eventos
✔ Serverless real
✔ Integração IA + Automação
✔ Geoprocessamento 3D
✔ Sistema multilíngue
✔ Acessibilidade com síntese de voz

---

## 🛸 Sobre Bruno Kobi

Full Stack Developer especializado em:

* Sistemas escaláveis
* Inteligência Artificial aplicada
* Automação inteligente
* Arquitetura moderna (Serverless & Event Driven)

Construindo sistemas que não apenas funcionam --- mas pensam,
automatizam e evoluem.
```
