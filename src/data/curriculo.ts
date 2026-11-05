export interface ExperienceDetail {
  local?: string;
  atividades: string[];
}

export const CURRICULO = {
  headline: "IA & Automação | Full Stack Developer · React · TypeScript · Node.js · n8n | Mestrando em IA",
  resumo:
    "Desenvolvedor Full Stack com 6+ anos de experiência e especialização em IA aplicada e automação de processos. Constrói desde interfaces React/TypeScript até pipelines multi-agente com n8n, LangChain e LLMs (GPT-4o, Gemini, Claude), com foco em resultado de negócio: automações que eliminam trabalho manual, chatbots que atendem em produção e integrações que conectam sistemas de ponta a ponta. Atualmente na Vennx, à frente de projetos de IA & automação para clientes corporativos.",
  destaques: [
    "Chatbots e agentes de IA multi-agente com n8n, LangChain e LLMs (GPT-4o, Gemini, Claude)",
    "Aplicações full-stack de ponta a ponta com React, TypeScript, Node.js e Supabase",
    "Automação de processos e integração de sistemas/ERPs (HubSpot, Bling, Pagar.me)",
    "Redesenho de arquiteturas de automação com ganhos de até 68% em redução de complexidade",
    "Aplicações geoespaciais com Esri ArcGIS Maps SDK",
  ],
  competencias: {
    "IA & Automação": ["n8n", "LangChain", "OpenAI GPT", "Google Gemini", "Claude", "RAG"],
    Frontend: ["React", "TypeScript", "JavaScript", "Vite", "Tailwind CSS", "Three.js", "React Native", "Expo"],
    "Backend & APIs": ["Node.js", "Express", "Python", "Laravel", "PHP", "REST APIs"],
    "Dados & Infra": ["Supabase", "PostgreSQL (RLS)", "MySQL", "Docker", "Edge Functions", "Esri ArcGIS"],
    Metodologia: ["Scrum", "Arquitetura Multi-Agente", "Clean Code"],
  } as Record<string, string[]>,
  experiencias: {
    5: {
      local: "Espírito Santo, Brasil",
      atividades: [
        "Desenvolve aplicações web com React, TypeScript, Vite e Tailwind CSS para clientes corporativos",
        "Constrói chatbots e sistemas multi-agente com n8n, LangChain e OpenRouter/GPT-4o, incluindo canais como WhatsApp",
        "Automatiza processos e integra ERPs — HubSpot e Bling API v3 (OAuth, contas a receber, pedidos de venda) — e o gateway de pagamento Pagar.me",
        "Refatorou um pipeline de automação de análise de documentos de 76 para ~24 nós (-68%) com arquitetura multi-agente",
        "Implementa backend com Supabase (PostgreSQL + RLS + Edge Functions) e monitoramento de erros com Sentry",
      ],
    },
    4: {
      atividades: [
        "Desenvolveu aplicação web com React e TypeScript integrada a API própria e à API de mapas ArcGIS da Esri para recursos cartográficos avançados, com backend em Laravel PHP e PostgreSQL",
        "Atuou diretamente na implantação junto ao cliente, garantindo alinhamento entre necessidades e solução entregue, em metodologia ágil Scrum",
      ],
    },
    1: {
      local: "Vitória, Espírito Santo, Brasil",
      atividades: [
        "Desenvolvimento de aplicação web com React e TypeScript integrada a API, com uso da API de mapas ArcGIS da Esri para elementos cartográficos avançados, em metodologia ágil Scrum",
      ],
    },
    2: {
      local: "Vila Velha, Espírito Santo, Brasil",
      atividades: [
        "Desenvolveu API em Node.js com MySQL, aplicação web em React/TypeScript integrada à API e aplicativo mobile em React Native (Expo) com push notifications, em metodologia ágil Scrum",
      ],
    },
    3: {
      local: "Vitória, Brasil",
      atividades: [
        "Trabalho com Angular.js e PostgreSQL, criação de cadastros auxiliares e conversão de geoposição, uso de bibliotecas de mapas como Leaflet, em software de monitoramento da qualidade do ar",
      ],
    },
    6: {
      local: "Vila Velha e Região, Brasil",
      atividades: [
        "Desenvolvimento de módulos de controle de frotas e aluguel de materiais para sistema web de planos funerários, utilizando CodeIgniter e MySQL",
      ],
    },
  } as Record<number, ExperienceDetail>,
  formacao: [
    "2025 – 2026: Aluno Especial — Mestrado em Tecnologia da Informação, Programação de Computadores — UFES (Universidade Federal do Espírito Santo)",
    "2025: Pós-Graduação em Cultura Maker e Educação 4.0 — IFES (Instituto Federal do Espírito Santo)",
    "2022 – 2024: Mestrado em Computação Aplicada com Ênfase em Inteligência Artificial — IFES",
    "2017 – 2020: Bacharelado em Sistemas de Informação — UniSales (Centro Universitário Salesiano)",
    "2003 – 2005: Técnico em Informática — IFES",
  ],
  idiomas: ["Português — nativo", "Inglês — profissional (working proficiency)"],
  projetosDestaque: [
    "Presence Now — TCC da graduação: aferição de assiduidade por reconhecimento facial em tempo real (React/TypeScript, REST API, face-api.js/TensorFlow.js com CNNs)",
    "Guia Alimentar BR — app em React Native (Expo) com 51 telas, publicado na Google Play Store, para o TCC de Nutrição de Rafaela Soares Souza Kobi; premiado no XXVII Congresso Brasileiro de Nutrição",
    "Fullstack Invasion (Portfólio 3D: Alien Experience) — portfólio 3D gamificado com UFO controlável e física real (TypeScript, React, Three.js, Vite, Supabase) · github.com/brunokobi/brunobokigame",
    "Frota Realtime RJ — monitoramento GPS via WebGL, +4.000 pontos simultâneos (Node.js, MapLibre, Netlify Edge) · github.com/brunokobi/frotarealtime",
    "Arkon: A Fenda do Aglomerado — browser game multiplayer 2D estilo Tibia (React, Vite, Phaser 4, Supabase) · github.com/brunokobi/arkon-game",
    "BPF Check — PWA offline-first para auditoria de vistorias sanitárias (RDC 216) (React, TypeScript, Tailwind, Supabase) · github.com/brunokobi/bpfcheck",
    "JARVIS (chatBruno) — o assistente deste site: n8n self-hosted, NVIDIA Nemotron 3 Ultra via OpenRouter, responde só com este perfil",
  ],
  certificacoes: [
    "Fev/2025 — Análise Avançada de Imagens e Texto com IA na AWS (Nexa / DIO, 10h)",
    "Jan/2025 — Bootcamp BairesDev — Machine Learning Practitioner (DIO, 96h)",
    "Jul/2024 — Bootcamp Santander — Fundamentos de IA para Devs (DIO, 42h)",
    "2023 — Formação Machine Learning Avançada (Alura, 93h)",
    "2022 — Formação Machine Learning (Alura, 76h)",
    "Outras formações: NLW Journey – IA e ReactJS (Rocketseat, 2024), Engenharia de Software (Alura, 84h), Carreira QA: Processos e Automação de Testes (Alura, 60h), TypeScript (Alura, 31h)",
    "Certificações complementares (LinkedIn Learning / Microsoft): Deep Learning parte 1 — Keras, Fundamentos para Desenvolvimento de Software, Microsoft 365 para Educadores e Estudantes, Scrum: Agilidade em seu Projeto",
  ],
};
