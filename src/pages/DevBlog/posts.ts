// Conteúdo dos posts do blog dev — array simples versionado no git, sem CMS.
// Formato "markdown-lite": **negrito**, `código inline`, *itálico* dentro de
// paragraph/list são renderizados pelo PostRenderer (ver renderInline).
// Nunca colocar IP/chave/dado sensível real aqui — sempre placeholder.

export type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; language?: string; code: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "hr" };

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  blocks: Block[];
}

export const posts: Post[] = [
  {
    slug: "jarvis-whisper-piper",
    title: "Dando voz ao JARVIS: Whisper e Piper rodando na minha VPS",
    date: "2026-11-14",
    tags: ["IA", "Voz", "Whisper", "Piper", "n8n", "React"],
    excerpt:
      "O assistente do portfólio agora ouve e fala com modelos de voz self-hosted: Whisper transcreve o microfone, Piper gera a fala e o n8n responde. Como montei, o que deu errado e os ajustes de pronúncia, cache e CORS.",
    blocks: [
      {
        type: "paragraph",
        text:
          "O JARVIS é o assistente do meu portfólio: você pergunta sobre a minha carreira, projetos ou como falar comigo, e ele responde. Até pouco tempo ele usava a voz e o reconhecimento de fala do navegador, que mudam muito de um aparelho para outro (no Firefox o microfone nem existia). Decidi trazer as duas pontas para a minha VPS: o **Whisper** para transformar fala em texto e o **Piper** para transformar texto em fala. Este post conta como ficou e o que aprendi no caminho.",
      },
      { type: "heading", level: 2, text: "TL;DR" },
      {
        type: "list",
        items: [
          "Microfone → **Whisper** (whisper.cpp, modelo base) → texto → agente no **n8n** → resposta → **Piper** (voz `pt_BR-faber-medium`) → áudio.",
          "Tudo roda numa VPS ARM gratuita da Oracle, atrás da Cloudflare e do Traefik, cada serviço num container.",
          "Um **prompt de vocabulário** no Whisper fez \"Bruno Cove trabalha na Vênix\" virar \"Bruno Kobi trabalha na Vennx\".",
          "Um **dicionário de pronúncia** no front faz o Piper falar \"Cóbi\" e \"Vénix\" do jeito certo.",
          "O áudio do Piper fica em **cache na Cloudflare por 30 dias**, então uma frase já falada antes sai na hora.",
          "Se algo falhar, o site volta para a voz e o reconhecimento do navegador sem o visitante perceber.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "1. A arquitetura" },
      {
        type: "code",
        language: "text",
        code:
          "Microfone (MediaRecorder)\n   → POST whisper.brunokobi.tech/inference   (whisper.cpp + gateway FastAPI)\n   ← { text }\n   → n8n (agente JARVIS, memória por sessão)\n   ← resposta em texto\n   → GET tts.brunokobi.tech/tts.mp3?text=...&lang=pt   (Piper + FastAPI)\n   ← MP3 (cacheado na Cloudflare)\n   → <audio> + AnalyserNode (animação do núcleo do JARVIS)",
      },
      {
        type: "paragraph",
        text:
          "O front é React com TypeScript, hospedado na Netlify. A Netlify não faz proxy de áudio: o navegador fala direto com os dois serviços da VPS, cada um num subdomínio próprio, com HTTPS na Cloudflare e roteamento pelo Traefik.",
      },
      { type: "heading", level: 2, text: "2. Ouvindo: Whisper self-hosted" },
      {
        type: "paragraph",
        text:
          "Usei o **whisper.cpp**, que roda bem em CPU ARM sem GPU. Com o modelo base, uma pergunta curta leva de 2 a 5 segundos para ser transcrita. Na frente dele coloquei um gateway pequeno em FastAPI, que libera CORS só para o meu site e repassa os campos para o servidor do whisper.cpp.",
      },
      { type: "heading", level: 3, text: "Gravar e saber quando parar" },
      {
        type: "paragraph",
        text:
          "No navegador, o hook `useWhisperRecorder` grava com `MediaRecorder` e mede o volume com um `AnalyserNode` da Web Audio API. Assim ele sabe quando a pessoa parou de falar, sem precisar de botão de parar:",
      },
      {
        type: "list",
        items: [
          "Para depois de **1,5s de silêncio** quando já houve fala.",
          "Desiste depois de **8s sem fala nenhuma**.",
          "Corta em **30s** no máximo.",
        ],
      },
      {
        type: "paragraph",
        text:
          "O áudio vai como `multipart/form-data` com `language=pt`. Na volta, removo marcas que o Whisper inventa em trechos sem fala, como `[BLANK_AUDIO]` e `(música)`.",
      },
      { type: "heading", level: 3, text: "O truque do prompt de vocabulário" },
      {
        type: "paragraph",
        text:
          "O primeiro teste foi engraçado: eu dizia \"Bruno Kobi trabalha na Vennx\" e o Whisper escrevia \"Bruno Cove trabalha na Vênix\". Nomes próprios e marcas não estão no vocabulário comum do modelo. O whisper.cpp aceita um campo `prompt`, que funciona como um texto anterior à fala e puxa o modelo para essas palavras:",
      },
      {
        type: "code",
        language: "ts",
        code:
          "export const WHISPER_PROMPT =\n  'Conversa com o JARVIS sobre Bruno Kobi, da Vennx: React, TypeScript, Node.js, n8n, Supabase, LangChain, GitHub, LinkedIn.';\n\nform.append('language', 'pt');\nform.append('prompt', WHISPER_PROMPT);",
      },
      {
        type: "paragraph",
        text:
          "Com isso, a mesma frase passou a sair certa. Foi a melhoria com melhor custo-benefício do projeto inteiro: uma linha de código.",
      },
      { type: "heading", level: 2, text: "3. Falando: Piper TTS" },
      {
        type: "paragraph",
        text:
          "O **Piper** é um sintetizador de voz neural leve, feito para rodar em CPU. Em português uso a voz `pt_BR-faber-medium`, e há vozes para inglês, espanhol, francês, alemão, russo e árabe, acompanhando os idiomas do site.",
      },
      {
        type: "paragraph",
        text:
          "Embrulhei o Piper numa API FastAPI com um único endpoint, `GET /tts.mp3?text=...&lang=...&speed=...`, que devolve MP3. Ser **GET** foi uma escolha de propósito: a mesma frase gera sempre a mesma URL, e a Cloudflare guarda a resposta por 30 dias. O serviço também limita 1.200 caracteres por pedido e 30 sínteses por minuto por IP.",
      },
      { type: "heading", level: 3, text: "Começar a falar rápido" },
      {
        type: "paragraph",
        text:
          "Respostas longas demoram para sintetizar inteiras. Por isso o front tira o markdown, quebra o texto em trechos (o primeiro com até 120 caracteres, os outros com até 400) e toca um `<audio>` por trecho. Enquanto um trecho toca, o próximo já está sendo baixado. Assim o JARVIS começa a falar logo depois do primeiro trecho, sem esperar a resposta inteira.",
      },
      { type: "heading", level: 3, text: "Ensinando a pronunciar" },
      {
        type: "paragraph",
        text:
          "O Piper lê o que recebe ao pé da letra. \"Kobi\" saía errado, \"JARVIS\" virava sigla, e um link como `github.com/brunokobi` era soletrado inteiro. A solução foi um dicionário de pronúncia aplicado só no texto que vai para a voz (o texto na tela continua igual):",
      },
      {
        type: "code",
        language: "ts",
        code:
          "const PRONUNCIATION = {\n  pt: [\n    [/\\bJARVIS\\b/gi, 'Járvis'],\n    [/\\bGithub\\b/gi, 'Git Hub'],\n    [/\\bKobi\\b/gi, 'Cóbi'],\n    [/\\bVennx\\b/gi, 'Vénix'],\n  ],\n};",
      },
      {
        type: "paragraph",
        text:
          "Links com caminho são lidos só pelo último pedaço (\"bruno cóbi\"), e-mails viram \"usuário arroba domínio ponto com\". Além disso, ajustei o prompt do agente no n8n para, ao falar de contato, indicar os caminhos (LinkedIn, formulário do site, GitHub) em vez de ditar endereços.",
      },
      {
        type: "paragraph",
        text:
          "Para conferir a pronúncia sem ficar ouvindo dezenas de áudios, usei os dois serviços juntos: gerava o áudio no Piper e mandava para o Whisper transcrever. Se o Whisper entendia a palavra certa, uma pessoa também entenderia.",
      },
      { type: "heading", level: 2, text: "4. O núcleo que pulsa com a voz" },
      {
        type: "paragraph",
        text:
          "O JARVIS tem um núcleo animado com barras. Antes elas se mexiam de forma aleatória; agora mostram o espectro real da voz. O `<audio>` do Piper é ligado a um `AnalyserNode` com `createMediaElementSource`, e a cada quadro o componente lê `getByteFrequencyData` e espelha as frequências nas barras.",
      },
      {
        type: "paragraph",
        text:
          "Aqui apareceram duas pegadinhas. A primeira: para ler o espectro de um áudio de outro domínio, o `<audio>` precisa de `crossOrigin=\"anonymous\"` e o servidor precisa mandar o cabeçalho de CORS. A segunda é de cache: se o servidor devolve CORS só para a origem que pediu, com `Vary: Origin`, a Cloudflare pode servir para o navegador uma cópia guardada sem o cabeçalho, e o áudio toca **mudo**. Como o áudio é público, a solução foi o Piper responder sempre `Access-Control-Allow-Origin: *`, sem `Vary`, e acrescentar um parâmetro de versão na URL (`v=2`) para descartar as cópias antigas do cache.",
      },
      {
        type: "paragraph",
        text:
          "Também só ligo o analisador quando o `AudioContext` está em estado `running`. Se o navegador ainda não liberou áudio (antes de o visitante clicar em algo), o elemento ligado ao contexto suspenso também ficaria mudo.",
      },
      { type: "heading", level: 2, text: "5. Conversa por voz" },
      {
        type: "paragraph",
        text:
          "Com as duas pontas funcionando, ficou natural fechar o ciclo: quando a pergunta veio pelo microfone, o JARVIS volta a ouvir sozinho assim que termina de responder. Se ninguém falar em 6 segundos, o microfone fecha em silêncio. Digitar uma pergunta, clicar numa sugestão ou parar a fala encerra o modo de conversa.",
      },
      { type: "heading", level: 2, text: "6. Plano B sempre ligado" },
      {
        type: "paragraph",
        text:
          "Serviço self-hosted numa VPS gratuita pode cair, então nada depende só dele. Se o Piper falhar antes de tocar (erro, limite por IP, rede), o texto é lido pela voz do navegador (Web Speech API). Se o navegador não grava áudio, o microfone usa o reconhecimento de fala do próprio navegador. O visitante continua conversando, só com outra voz.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "Principais lições" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Modelos pequenos dão conta**: whisper.cpp no modelo base e Piper em CPU ARM respondem rápido o bastante para uma conversa.",
          "**O prompt do Whisper resolve nomes próprios** com uma linha, sem treinar nada.",
          "**TTS por GET + CDN** transforma frases repetidas em arquivos estáticos.",
          "**CORS e cache precisam combinar**: cabeçalho que varia por origem, atrás de CDN, pode deixar o áudio mudo.",
          "**Teste a voz com o próprio Whisper**: Piper → Whisper é um verificador automático de pronúncia.",
          "**Tenha sempre um plano B** quando a infraestrutura é sua e gratuita.",
        ],
      },
    ],
  },
  {
    slug: "grande-vitoria-empresas",
    title: "Dataset de Empresas da Grande Vitória: de 344 mil para 367 mil CNPJs, com processos, sócios e riscos",
    date: "2026-11-11",
    tags: ["Dados Abertos", "Python", "ETL", "SQLite", "Due Diligence", "Mapas"],
    excerpt: "Como a base aberta de empresas da Grande Vitória cresceu para 366.995 empresas e mais de 25 fontes oficiais: o que foi adicionado, o que funciona hoje, quanto tempo cada atualização leva e as dificuldades, do bloqueio do CNJ a um cron que passou meses sem baixar nada.",
    blocks: [
      {
        type: "paragraph",
        text: "O **Dataset de Empresas da Grande Vitória** é o maior projeto de dados que mantenho: uma base aberta com todas as empresas ativas dos 7 municípios da região metropolitana do Espírito Santo, cruzadas com dezenas de fontes públicas oficiais. Começou em julho com o cadastro da Receita; hoje tem sócios, processos judiciais, dívida ativa, sanções, contratos públicos, riscos ambientais, due diligence dos sócios e uma nota de integridade por empresa. Este post conta o que mudou, o que funciona hoje, quanto tempo cada atualização leva e o que deu trabalho.",
      },
      {
        type: "list",
        items: [
          "**Painel:** empresas.brunokobi.tech",
          "**API REST:** empresas.brunokobi.tech/docs",
          "**Código e dataset:** github.com/brunokobi/projeto_grande_vitoria_empresas",
        ],
      },
      { type: "heading", level: 2, text: "TL;DR" },
      {
        type: "list",
        items: [
          "De **344.130** empresas em julho para **366.995** hoje (base de outubro/2026 da Receita), com **242.897 sócios**.",
          "**100% das empresas no mapa**: no começo eram menos de 3 mil com coordenadas.",
          "**4,61 milhões** de registros de processos judiciais, com todas as empresas e sócios já consultados.",
          "Mais de 25 fontes oficiais cruzadas: Receita, PGFN, CGU, TCEES, IBAMA, MTE, TSE, PNCP, INPI, Banco Central, CVM, OFAC, ONU, Offshore Leaks e outras.",
          "O dataset publicado atualiza **a cada 2 horas**; o cadastro e as fontes mensais rodam **todo dia 1º**; os processos rodam à parte, por dias, numa máquina de casa.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "1. O crescimento da base" },
      {
        type: "image",
        src: "/blog/grande-vitoria/dashboard-jul-2026.webp",
        alt: "Painel nos primeiros meses, com 344.130 empresas e 2.951 geolocalizadas",
        caption: "Nos primeiros meses: 344.130 empresas, mas só 2.951 com coordenadas no mapa.",
      },
      {
        type: "image",
        src: "/blog/grande-vitoria/dashboard-nov-2026.webp",
        alt: "Painel em novembro de 2026, com 366.995 empresas, todas geolocalizadas, e as abas de camadas do mapa",
        caption: "Hoje: 366.995 empresas, todas no mapa, e as camadas de crime, bairros, unidades de conservação, ambiental e risco geológico.",
      },
      {
        type: "paragraph",
        text: "A contagem de empresas acompanha a base que a Receita Federal publica uma vez por mês:",
      },
      {
        type: "list",
        items: [
          "**Julho/2026:** 344.130 empresas ativas na primeira carga.",
          "**Setembro/2026:** 351.824, já pela atualização mensal automática.",
          "**Novembro/2026:** 366.995, com a base de outubro.",
        ],
      },
      {
        type: "paragraph",
        text: "O salto de setembro para novembro esconde um bug. A atualização mensal rodava todo dia 1º sem erro nenhum, mas os arquivos baixados tinham nome fixo, e o script achava que já tinha o download do mês. Na prática, ele reaproveitava os arquivos de julho todo mês. Quando percebi, em 7 de novembro, corrigi o script para apagar o cache e os checkpoints antes de cada execução e recarreguei todas as fontes do zero entre 6 e 7 de novembro. Foi aí que a base chegou a 366.995 empresas e a dívida ativa passou a ser a do 3º trimestre de 2026.",
      },
      {
        type: "paragraph",
        text: "Lição: um job que \"roda sem erro\" não é o mesmo que um job que \"traz dado novo\". Hoje o README mostra a data da base da Receita ao lado do total.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "2. O que foi adicionado" },
      { type: "heading", level: 3, text: "Mapa com todas as empresas" },
      {
        type: "paragraph",
        text: "Cada endereço foi geocodificado pelo **OpenStreetMap (Nominatim)**, que permite cerca de 1 consulta por segundo. Para mais de 360 mil empresas isso levou dias, rodando direto na VPS até esvaziar a fila. Hoje está em 100%, e as empresas novas de cada mês entram no cron mensal. Se uma empresa ainda não tem coordenada, o mapa a localiza na hora pelo endereço.",
      },
      {
        type: "paragraph",
        text: "Em cima dos pontos entraram camadas geográficas, todas cruzadas por localização (ponto dentro do polígono ou distância):",
      },
      {
        type: "list",
        items: [
          "**Unidades de conservação e zonas de amortecimento** (MMA e IEMA-ES): 10.771 empresas dentro delas.",
          "**Proximidade ambiental** (fiscalização, barragens e outorgas de água): 86.572 empresas a até 500 m de um ponto.",
          "**Risco geológico e de inundação** (Defesa Civil-ES, CPRM e prefeituras): 18.277 empresas dentro de um setor de risco.",
        ],
      },
      { type: "heading", level: 3, text: "Situação jurídico-fiscal" },
      {
        type: "list",
        items: [
          "**Dívida ativa da União (PGFN):** 201.098 inscrições em 39.586 empresas, somando R$ 41,7 bilhões.",
          "**Sanções** federais (CEIS, CNEP, CEPIM, acordos de leniência) e estaduais (TCEES).",
          "**Infrações ambientais** do IBAMA e a **Lista Suja do trabalho escravo** do MTE.",
          "**Contratos públicos** pelo PNCP (municipais, estaduais e federais) e pelo Portal da Transparência.",
          "**Benefícios fiscais** federais e o incentivo de ICMS estadual (COMPETE-ES), **marcas** no INPI e **vínculo político** dos sócios pelo TSE.",
        ],
      },
      { type: "heading", level: 3, text: "Processos judiciais" },
      {
        type: "paragraph",
        text: "Foram **4,61 milhões** de registros, com todas as empresas e sócios consultados; 96.403 empresas aparecem como ré em processo próprio. Ao abrir um processo no painel, o sistema busca na hora o assunto, as instâncias, as movimentações e as publicações, e confere se a empresa consta mesmo entre os destinatários oficiais.",
      },
      { type: "heading", level: 3, text: "Due diligence dos sócios" },
      {
        type: "paragraph",
        text: "A novidade de novembro: cada sócio é cruzado com dívida ativa em nome próprio, servidores federais, expulsões do serviço público, Bolsa Família, embargos do IBAMA, inabilitados do Banco Central, processos da CVM, sanções da OFAC, da ONU e do Reino Unido e o **Offshore Leaks** do ICIJ. A dívida ativa da União do próprio sócio, por exemplo, aparece em mais de 24 mil empresas.",
      },
      {
        type: "paragraph",
        text: "Como a Receita publica o CPF mascarado, o cruzamento usa os **6 dígitos do meio do CPF mais o nome completo**, e o resultado é sempre mostrado como *possível correspondência*, com o critério usado.",
      },
      { type: "heading", level: 3, text: "Grupo econômico, risco-país e nota de integridade" },
      {
        type: "list",
        items: [
          "**Grupo econômico:** a partir da base nacional de sócios da Receita, o painel mostra em que outras empresas do Brasil os mesmos sócios aparecem.",
          "**Risco-país:** sócios estrangeiros cruzados com as listas do GAFI e o Índice de Percepção da Corrupção.",
          "**Nota de integridade:** Baixo, Moderado, Alto ou Crítico, com fatores, pesos e tetos documentados. É pré-calculada para todas as empresas antes de cada publicação e vira filtro no painel.",
          "**Menções na mídia:** Google Notícias e GDELT, com destaque para manchetes com termos como fraude ou operação.",
        ],
      },
      { type: "heading", level: 3, text: "Dossiê com IA e pesquisa de mestrado" },
      {
        type: "paragraph",
        text: "Um botão gera um dossiê de due diligence: um score de risco de um modelo XGBoost treinado no próprio dataset, a rede de sócios e endereços em comum num grafo Neo4j e um parecer escrito por um LLM só em cima dos dados já consultados. O grafo vem da minha pesquisa de mestrado, que compara modelos tabulares e redes neurais de grafo para prever risco a partir das conexões entre empresas. O preprint está publicado no Zenodo (DOI 10.5281/zenodo.21961063).",
      },
      { type: "heading", level: 3, text: "Acesso por API e MCP" },
      {
        type: "paragraph",
        text: "Tudo que o painel mostra também sai pela **API REST** (FastAPI), por exportação em Excel e PDF e por um **servidor MCP**, que deixa assistentes de IA consultarem a base direto: buscar empresas, buscar por raio a partir de um endereço, abrir a visão 360º e o ranking de doações eleitorais.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "3. Quanto tempo leva cada atualização" },
      {
        type: "list",
        items: [
          "**A cada 2 horas:** a VPS tira um snapshot consistente do banco, comprime e publica como Release no GitHub. Meia hora depois, o painel confere se o arquivo mudou e troca o banco de forma atômica, sem derrubar o serviço.",
          "**Todo dia 1º, às 3h:** a atualização mensal roda em sequência cadastro, geocodificação das novas, camadas geográficas, sócios, JUCEES, sanções, TCEES, IBAMA, TSE, PNCP, INPI, COMPETE-ES, PEP e due diligence. Enquanto ela roda, a publicação de 2 em 2 horas fica parada por uma trava, para não publicar um banco pela metade.",
          "**Geocodificação:** cerca de 1 empresa por segundo; a base inteira levou dias. Hoje só as empresas novas do mês passam por ela.",
          "**Processos judiciais:** cerca de 1 consulta por segundo e mais de meio milhão de nomes entre empresas e sócios, o que dá dias de execução contínua. Roda com checkpoint, então pode parar e continuar.",
          "**PEP:** uma consulta por sócio distinto, cerca de 142 mil nomes, horas de execução.",
          "**Dossiê com IA:** de 30 a 90 segundos por empresa, sob demanda.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "4. As dificuldades" },
      { type: "heading", level: 3, text: "O CNJ bloqueou a VPS" },
      {
        type: "paragraph",
        text: "A busca de processos começou como um serviço 24 horas na VPS, até a API do CNJ passar a responder **403** só para ela. Testei a mesma consulta de dois lugares: da VPS dava 403, de uma conexão residencial dava 200. É um bloqueio comum de sistemas de governo contra faixas de IP de provedores de nuvem. A solução foi rodar essa etapa na máquina de casa e mesclar o resultado no banco da VPS antes de publicar, sem sobrescrever o que a VPS já tinha processado.",
      },
      { type: "heading", level: 3, text: "O DataJud não diz quem são as partes" },
      {
        type: "paragraph",
        text: "A API pública do DataJud parecia a fonte óbvia para processos, mas ela **não expõe as partes** (CPF ou CNPJ): é impossível achar os processos de uma empresa por ela. A busca foi feita pelo **DJEN**, o diário de comunicações do CNJ, que permite procurar pelo nome da parte. O DataJud voltou depois, só para detalhar um processo já encontrado, pelo número.",
      },
      { type: "heading", level: 3, text: "Uma regressão no dataset público" },
      {
        type: "paragraph",
        text: "No fim de julho, o dataset público regrediu: uma publicação subiu um banco sem parte do progresso que já estava publicado. Desde então, cada publicação de 2 horas primeiro mescla o que já está publicado e só depois sobe a versão nova.",
      },
      { type: "heading", level: 3, text: "Fontes que mudam, escondem ou mentem em silêncio" },
      {
        type: "list",
        items: [
          "A Receita trocou o servidor de download, e a URL antiga passou a dar 404. O código agora resolve o link a cada execução.",
          "A Lista Suja do trabalho escravo é um **PDF** atrás de um firewall instável, com URL que muda a cada semestre.",
          "A API do PNCP devolve **vazio, sem erro**, quando a janela de datas passa de um ano. O histórico é varrido em fatias de 365 dias.",
          "O TSE publica o CPF do candidato anonimizado, mas o do doador não. O cruzamento útil foi o **sócio como doador**: doação de empresa é proibida desde 2015.",
          "Ler a prestação de contas eleitoral do ES inteira em memória estourou o container com 3 GB, e foi preciso subir para 6 GB.",
          "Arquivos com codificações diferentes: Receita, PGFN e CGU em latin-1, IBAMA em UTF-8.",
        ],
      },
      { type: "heading", level: 3, text: "Fontes que não deram certo" },
      {
        type: "paragraph",
        text: "O repositório de extração mantém uma lista das fontes testadas e descartadas, com o motivo, para ninguém testar de novo:",
      },
      {
        type: "list",
        items: [
          "**Interpol:** bloqueia acesso automatizado. A parte Interpol–ONU vem pela lista da ONU.",
          "**Sanções da União Europeia e lista do Banco Mundial:** exigem cadastro ou chave.",
          "**BNDES, RAIS e CAGED:** sem CNPJ nos dados abertos.",
          "**Conselhos de classe** (CREA, CRM, OAB): só consulta individual, inviável para 360 mil empresas.",
          "**Querido Diário:** não respondeu para as 7 cidades no teste.",
          "**TCU (inabilitados):** o serviço estava fora do ar na implantação.",
        ],
      },
      { type: "heading", level: 3, text: "Banco que é lido e escrito ao mesmo tempo" },
      {
        type: "paragraph",
        text: "O SQLite é lido pelo painel enquanto as etapas escrevem. O banco usa WAL e espera de bloqueio, cada etapa grava em lotes com checkpoint e a publicação usa o backup nativo do SQLite, que tira uma cópia consistente mesmo com o pipeline rodando.",
      },
      { type: "heading", level: 3, text: "LGPD" },
      {
        type: "paragraph",
        text: "Os dados são públicos, mas o dataset junta dados de pessoas: nomes de sócios, CPF mascarado e endereços. Os cruzamentos por pessoa sempre aparecem como possível correspondência, e o projeto pede uso responsável conforme a LGPD.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "Principais lições" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Confira o dado, não só o status do job.** O cron mensal passou meses \"funcionando\" sem baixar nada novo.",
          "**Fontes públicas falham em silêncio:** resposta vazia, URL que muda, PDF no lugar de CSV.",
          "**IP de nuvem pode ser bloqueado** por sistemas de governo. Tenha um plano para rodar a etapa em outro lugar.",
          "**Checkpoint em tudo que demora dias.** Geocodificação e processos sobreviveram a quedas e reinícios sem perder trabalho.",
          "**Publicação também precisa de proteção:** mesclar antes de subir e usar trava contra execuções simultâneas.",
          "**Documente o que não funcionou.** A lista de fontes descartadas economiza semanas.",
        ],
      },
      {
        type: "paragraph",
        text: "Para explorar a base, acesse **empresas.brunokobi.tech**. Se o projeto for útil, uma estrela no GitHub ajuda a dar visibilidade.",
      },
    ],
  },
  {
    slug: "copa-aspirador",
    title: "Copa Aspirador: um jogo de futebol de robôs aspiradores feito em Python que roda no navegador",
    date: "2026-11-07",
    tags: ["Python", "pygame", "WebAssembly", "Game Dev", "Pixel Art"],
    excerpt: "Futebol arcade de robôs aspiradores com campanha, carreira, torcida e narrador, 100% em Python e rodando no navegador com pygbag. O que o jogo faz hoje e os desafios de desempenho, áudio, deploy, balanceamento e saves.",
    blocks: [
      {
        type: "paragraph",
        text: "**Copa Aspirador** é um jogo que eu fiz: futebol arcade 5 contra 5 em que os jogadores são robôs aspiradores. Ele é escrito **100% em Python** com pygame e roda direto no navegador, sem instalar nada, em **copaaspirador.brunokobi.tech**. Começou como um futebol simples e virou um RPG de robôs com campanha, carreira de clubes, torcida que canta e narrador. Este post mostra o que o jogo faz hoje e os desafios para chegar até aqui.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/menu.webp",
        alt: "Menu principal do Copa Aspirador com os seis modos de jogo",
        caption: "O menu: amistosos, carreira, Modo Robôs e a campanha. O slogan resume o jogo.",
      },
      { type: "heading", level: 2, text: "TL;DR" },
      {
        type: "list",
        items: [
          "Python + pygame compilado para **WebAssembly** com o **pygbag**: o mesmo código roda no desktop e no navegador.",
          "Seis modos: amistoso contra a CPU ou a dois no mesmo teclado, carreira de clubes, Modo Robôs e uma campanha com história em três atos.",
          "**Nenhuma imagem externa**: robôs, torcida, 128 escudos, personagens e cenários em pixel art são desenhados por código.",
          "Cerca de **32 mil linhas de jogo e 22 mil de testes**, em pouco mais de um mês.",
          "Os maiores desafios: desempenho no navegador, áudio, cache do deploy, balanceamento e saves que não podem se perder.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "1. O jogo hoje" },
      { type: "heading", level: 3, text: "Partidas de robôs" },
      {
        type: "paragraph",
        text: "Cada robô tem um de 6 chassis (Disco, Tanque, Velocista, Goleiro, Orbital e Titã) e 8 atributos: velocidade, aceleração, chute, controle (sucção), defesa, visão, bateria e QI. Eles mudam de verdade o comportamento em campo: a bateria gasta ao correr e chutar e recarrega parado, e robô com bateria baixa solta faísca e fumaça. Há 5 formações, de RETRANCA a PRESSÃO, que mudam onde cada robô fica e para onde volta.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/partida-estadio-gol.webp",
        alt: "Partida na câmera de estádio, com a torcida comemorando o gol e o narrador na faixa de TV",
        caption: "Câmera de estádio: torcida nas cores dos times, faixas na grade, \"GOOOOL!\" e o narrador Tonho na faixa de TV.",
      },
      {
        type: "paragraph",
        text: "Em volta do campo fica uma **torcida** de até cerca de 520 pessoas, cada uma com pele, cabelo, chapéu, camisa e cachecol sorteados. Ela reage a gol, chance, defesa e trave, faz ola e mosaico e puxa cânticos nas pausas. O piso muda a cada partida: arena neon ou um piso de casa, como cozinha em xadrez ou taco de madeira, afinal são aspiradores jogando dentro de casa. O narrador **Tonho** e a comentarista **Cleide** comentam lance a lance com o nome dos robôs.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/partida-perto.webp",
        alt: "Robôs personalizados em campo na câmera aproximada",
        caption: "Câmera PERTO: robôs com peças visíveis, anel de LED, barra de bateria e cosméticos.",
      },
      { type: "heading", level: 3, text: "A campanha: A Garagem do Vô" },
      {
        type: "paragraph",
        text: "O modo história segue o **Téo**, que acha na garagem do avô o **Zé Poeira**: um Aspiradex Turbo 74 remendado com fita crepe, com uma rodinha que cai sozinha e um chinelo preso (\"o chinelo é estrutural\"). Com ele, Téo tenta salvar o clube de robótica da escola e acaba enfrentando a corporação **Limpex** e seu dono alérgico a pó, da Copa Interclasses ao Mundial de Aspiradores em Neo-Tóquio.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/campanha-dialogo.webp",
        alt: "Diálogo da campanha com personagens em pixel art",
        caption: "Diálogos com personagens em pixel art que piscam, mexem a boca e mudam de expressão.",
      },
      {
        type: "paragraph",
        text: "São 3 atos e 13 capítulos, com torneios de copa, liga e série de duelos, 14 missões secundárias, escolhas que mudam aliados e adversários e **3 finais**, um deles secreto. Depois do final abrem a **Turnê Lendária** (novo jogo+) e a **Torre do Pó**, com 40 andares e modificadores de arena como goleiro gigante e bola pesada.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/campanha-mapa.webp",
        alt: "Mapa da campanha com os capítulos da escola ao Mundial",
        caption: "O mapa do Ato 1, da escola ao Mundial, com o escudo do chefe de cada capítulo.",
      },
      { type: "heading", level: 3, text: "Garagem, peças e habilidades" },
      {
        type: "paragraph",
        text: "No Modo Robôs e na campanha você monta e evolui a equipe: 8 slots de peças por robô, sets, relíquias, peças Míticas, 16 habilidades numa árvore de Ataque, Controle e Defesa, itens de partida e cosméticos como antena, adesivo e rastro. Cada peça mostra o antes e o depois nos atributos.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/garagem-bancada.webp",
        alt: "Garagem com a bancada de oito slots de peças",
        caption: "A garagem: 8 slots, sets e relíquias, com o efeito de cada peça.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/habilidades.webp",
        alt: "Árvore de habilidades dos robôs",
        caption: "A árvore de habilidades e a tática do time.",
      },
      { type: "heading", level: 3, text: "Carreira de clubes" },
      {
        type: "paragraph",
        text: "Na carreira, no estilo Elifoot, você é o técnico: 24 clubes em 3 divisões, mercado de transferências, finanças, promoção e rebaixamento. Os jogadores são robôs com nome de robô (\"Zumbido\", \"Faísca\", \"Turbo Mk2\"...), tirados de um catálogo de cerca de 4,7 mil nomes. No lugar da idade, eles têm **horas de uso**: amaciando, auge, desgaste e fim de vida, quando vão para a reciclagem. Dá para mandar um robô para a revisão e ganhar mais uma temporada dele.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/carreira-elenco.webp",
        alt: "Elenco da carreira com robôs, horas de uso e revisão",
        caption: "O elenco: horas de uso coloridas pela fase e o botão de REVISÃO.",
      },
      { type: "heading", level: 3, text: "128 escudos sem nenhuma imagem" },
      {
        type: "paragraph",
        text: "Todos os 128 times têm escudo em pixel art, gerado por código a partir do nome: formato, padrão nas cores do time, um símbolo de 15×15 pixels (tubarão, dragão, coroa, aspirador-robô, pão, vassoura...) e as iniciais. O mesmo nome gera sempre o mesmo escudo, e os chefes da campanha ganham coroa, estrelas e louros.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/escudos.webp",
        alt: "Grade com os 128 escudos dos times",
        caption: "Os 128 escudos, todos desenhados por código.",
      },
      {
        type: "image",
        src: "/blog/copa-aspirador/melhor-do-jogo.webp",
        alt: "Cartão de melhor do jogo com as estatísticas da partida",
        caption: "Fim de partida: estatísticas, nota de cada robô e o MELHOR DO JOGO.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "2. Os desafios da implementação" },
      { type: "heading", level: 3, text: "Python no navegador" },
      {
        type: "paragraph",
        text: "O **pygbag** empacota o código e os recursos num arquivo `game.apk` e roda o Python compilado para WebAssembly dentro da página. Funciona muito bem, mas tem regras próprias:",
      },
      {
        type: "list",
        items: [
          "O loop principal precisa ser **assíncrono**, devolvendo o controle ao navegador a cada quadro.",
          "O pygbag só descobre as dependências lendo o `main.py`, então o `import pygame` precisa estar explícito ali.",
          "O navegador só libera áudio depois de um clique. A tela de carregamento, feita com um template próprio, pede esse clique antes de iniciar o jogo.",
          "Não existe disco: os saves vão para o `localStorage` no navegador e para um arquivo na pasta do usuário no desktop, pelo mesmo módulo `store.py`.",
          "A tela ficava espremida em algumas janelas; o template passou a guardar a proporção de 1100×700.",
        ],
      },
      { type: "heading", level: 3, text: "Desempenho: zero Surface por quadro" },
      {
        type: "paragraph",
        text: "No WebAssembly o pygame é bem mais lento que no desktop, e uma torcida de centenas de pessoas animadas a cada quadro derrubaria o jogo. A regra do projeto virou lei e tem teste: **nenhuma `pygame.Surface` nova é criada durante o desenho de um quadro**. Tudo é pré-renderizado: torcedores num atlas, escudos e robôs em cache, e o desenho só copia pedaços prontos. A torcida tem 3 níveis de detalhe automáticos e some na velocidade MAX.",
      },
      {
        type: "paragraph",
        text: "O orçamento é de até 1,5 ms de desenho por quadro no desktop (cerca de 3 ms estimados no navegador). Uma ferramenta de medição roda o desenho em modo sem tela e compara com a medida anterior a cada mudança grande.",
      },
      { type: "heading", level: 3, text: "Áudio: síntese, gravações e um bug de taxa" },
      {
        type: "paragraph",
        text: "O som começou **100% sintetizado por código**: efeitos e músicas chiptune gerados com `math` e `array`. Depois entraram gravações reais de torcida, apito, \"acabou!\" e até uma caixa registradora, e a síntese virou o plano B se algum arquivo faltar. Para não travar o menu, a geração é feita aos poucos: no navegador leva cerca de 1,2 s de CPU, espalhados em quase 2 s, com o menu respondendo.",
      },
      {
        type: "list",
        items: [
          "Cada reação da torcida tem de 3 a 9 variações, sorteadas em **saco embaralhado**: toca todas antes de repetir. Parte das variações é derivada em tempo de execução (outro tom, outro trecho) para o pacote não crescer.",
          "Os áudios passam por um script com ffmpeg que corta silêncio e nivela o volume em LUFS. As fontes caíram de 14,4 MB para 7,5 MB, e o `game.apk` de 10,3 MB para 7,2 MB.",
          "Um bug curioso: com o mixer a 22.050 Hz, o pygame no desktop carregava algumas gravações de 44,1 kHz **vazias**, sem erro. A solução foi abrir o mixer a 44,1 kHz, a mesma taxa do navegador.",
          "A torcida de fundo é um loop de 24 s feito com as 3 gravações misturadas e uma emenda sem corte audível.",
        ],
      },
      { type: "heading", level: 3, text: "Deploy sem cache velho" },
      {
        type: "paragraph",
        text: "Depois de publicar uma versão nova, alguns navegadores continuavam abrindo o pacote antigo. Um script agora acrescenta ao `index.html` do build um parâmetro com o hash do pacote:",
      },
      {
        type: "code",
        language: "text",
        code: "game.apk?v=<sha256 curto do game.apk>",
      },
      {
        type: "paragraph",
        text: "Cada deploy muda a URL do pacote, e nenhum cache serve a versão anterior. Outro detalhe: o pygbag converte os áudios e só refaz a conversão quando a cópia não existe, então trocar um `.ogg` exige apagar a cópia antiga, senão o som velho vai para o pacote.",
      },
      { type: "heading", level: 3, text: "Balanceamento medido, não chutado" },
      {
        type: "paragraph",
        text: "Partidas que você assiste rodam no motor real; as que você manda **SIMULAR** usam um modelo estatístico, muito mais rápido. Os dois precisam dar resultados parecidos, senão simular vira trapaça. Para isso há scripts que jogam centenas de partidas no motor real e ajustam o simulador. A campanha inteira é jogada por simulação centenas de vezes para conferir a chance de vencer cada treino, jogo, semifinal e chefe.",
      },
      {
        type: "paragraph",
        text: "E para mudanças no motor não alterarem partidas sem querer, existem os **goldens**: 80 placares gravados que precisam sair idênticos depois de qualquer mudança. Todo recurso novo do motor fica atrás de uma opção desligada por padrão, para os 80 placares continuarem iguais.",
      },
      { type: "heading", level: 3, text: "Saves que nunca se perdem" },
      {
        type: "paragraph",
        text: "O jogo cresceu muito depois de publicado, então os saves mudaram de formato várias vezes: da campanha de um ato para três, de jogadores com nome de pessoa e idade para robôs com horas de uso. Cada save tem versão e uma migração que só acrescenta. Um save inválido nunca é sobrescrito sem confirmação, e um build antigo que encontra um save novo o trata como desconhecido em vez de apagar. Os testes usam 4 saves reais do capítulo 5 para garantir a migração.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "3. Em números" },
      {
        type: "list",
        items: [
          "6 modos de jogo, 6 chassis, 8 atributos, 5 formações e 16 habilidades.",
          "3 atos, 13 capítulos, 14 missões secundárias, 3 finais e uma torre de 40 andares.",
          "128 times com escudo e cerca de 4,7 mil nomes de robôs.",
          "Cerca de 32 mil linhas de jogo e 22 mil de testes, com mais de 30 arquivos de teste.",
          "Pouco mais de 100 commits entre o começo de outubro e o começo de novembro de 2026.",
        ],
      },
      { type: "heading", level: 2, text: "4. O que vem por aí" },
      {
        type: "list",
        items: [
          "**Editor de firmware**: programar a IA dos robôs com regras em blocos.",
          "**Publicação no CrazyGames**: em estudo, com tradução para inglês, o SDK do portal e a revisão dos direitos dos áudios.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "Principais lições" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Python roda no navegador de verdade.** O pygbag torna isso viável, desde que o loop seja assíncrono e você respeite o navegador.",
          "**Uma regra de desempenho com teste vale mais que otimizar no fim.** \"Zero Surface por quadro\" segurou o desempenho enquanto torcida, efeitos e telas novas entravam.",
          "**Gerar arte por código escala.** 128 escudos e dezenas de personagens sem desenhar uma imagem sequer.",
          "**Balanceamento é medição.** Simulação em massa e placares de referência evitam que o jogo fique fácil ou impossível sem você perceber.",
          "**Respeite o save do jogador.** Versão, migração e nunca apagar.",
        ],
      },
      {
        type: "paragraph",
        text: "Quer ver tudo isso funcionando? Jogue em **copaaspirador.brunokobi.tech**. O código está no GitHub em **github.com/brunokobi/soccerrobo**.",
      },
    ],
  },
  {
    slug: "globo-tempo-real",
    title: "O globo do meu portfólio: todas as fontes de dados em tempo real (e as que não deram certo)",
    date: "2026-10-31",
    tags: ["ArcGIS", "Dados Abertos", "NASA", "APIs", "React", "3D"],
    excerpt: "Satélites, ISS, terremotos, incêndios, furacões, vento e alertas: cada camada do globo 3D da home, de onde vem o dado, o que dá para ver, e as APIs que ficaram pelo caminho (aviões, Starlink, nuvens, correntes marítimas, aurora).",
    blocks: [
      {
        type: "paragraph",
        text: "O fundo da home do meu portfólio é um globo 3D que mostra o planeta agora: satélites, a Estação Espacial, terremotos, incêndios, furacões, vento, alertas de emergência e mais. Nada ali é simulado: cada ponto vem de uma fonte pública consultada pelo navegador. Este post detalha cada camada, de onde vem o dado, o que dá para ver, e também as APIs e ideias que não deram certo no caminho, que foram muitas.",
      },
      { type: "heading", level: 2, text: "TL;DR" },
      {
        type: "list",
        items: [
          "O globo é um **SceneView do ArcGIS Maps SDK for JavaScript**, com imagem de satélite de dia e luzes noturnas da NASA à noite.",
          "Por cima dele, um **canvas 2D** desenha os pontos a cada quadro, projetando latitude e longitude na tela com `view.toScreen`.",
          "Fontes ativas: **CelesTrak**, **wheretheiss.at**, **USGS**, **Smithsonian (vulcões)**, **ArcGIS Living Atlas** (incêndios VIIRS, alertas CAP, furacões, qualidade do ar), **Open-Meteo** e uma **grade de vento GFS**.",
          "Ficaram pelo caminho: aviões (OpenSky bloqueia CORS), Starlink (403), nuvens ao vivo (pedem autenticação), correntes marítimas (limite de requisições), aurora boreal e uma base histórica de ciclones sem dados reais.",
          "Regra do projeto: **nenhum dado falso**. Quando uma fonte real não funcionou, a camada saiu do globo em vez de ganhar dado inventado.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "1. A base: o globo em si" },
      {
        type: "paragraph",
        text: "O globo usa o **ArcGIS Maps SDK for JavaScript** (`SceneView`). Ele já resolve câmera, zoom, rotação e relevo, e me deixa focar nas camadas de dados. A base tem quatro peças:",
      },
      {
        type: "list",
        items: [
          "**De dia:** `World_Imagery` da Esri, imagem de satélite do planeta inteiro.",
          "**Relevo:** `WorldElevation3D/TopoBathy3D`, com montanhas e o fundo do oceano.",
          "**À noite:** **NASA Black Marble** (VIIRS), servido pelo NASA GIBS. As cidades acesas são as manchas de luz que você vê no modo noturno.",
          "**Nuvens:** uma esfera um pouco maior que a Terra com uma textura de nuvens da NASA. É uma imagem fixa, não nuvem ao vivo (mais sobre isso na seção do que não deu certo).",
        ],
      },
      { type: "heading", level: 3, text: "Colorindo as luzes da noite" },
      {
        type: "paragraph",
        text: "Os tiles do Black Marble vêm em tons de cinza azulado, e o oceano ficava marrom-escuro com o brilho residual. Criei uma camada própria (`BaseTileLayer`) que baixa cada tile, passa pixel por pixel num canvas e aplica uma paleta: abaixo de um limiar vira preto puro; acima, uma curva leva o brilho para amarelo e laranja, como lâmpadas de sódio.",
      },
      {
        type: "code",
        language: "ts",
        code: "const b = d[i] / 255;\nif (b < 0.11) {\n  d[i] = d[i + 1] = d[i + 2] = 0; // oceano preto\n} else {\n  const e = Math.pow((b - 0.11) / 0.89, 0.5);\n  d[i] = e * 255;                    // vermelho\n  d[i + 1] = Math.pow(e, 1.8) * 210; // verde\n  d[i + 2] = Math.pow(e, 5.5) * 80;  // azul\n}",
      },
      {
        type: "paragraph",
        text: "Antes de chegar nisso, testei duas alternativas no mesmo dia e voltei atrás: uma textura 8K estática das luzes da Terra e a camada oficial *Earth at Night* do ArcGIS. Nas duas voltei atrás e fiquei com o Black Marble e a paleta ajustada.",
      },
      { type: "heading", level: 3, text: "Pontos que acompanham o globo" },
      {
        type: "paragraph",
        text: "Os ícones não são gráficos do ArcGIS: um `<canvas>` transparente fica por cima do globo e é redesenhado a cada quadro. Para cada ponto, o código confere se ele está no lado da Terra virado para a câmera (produto escalar entre a posição da câmera e a do ponto) e projeta a coordenada na tela com `view.toScreen`. Os ícones diminuem quando a câmera se afasta, e as linhas de vento fazem o contrário, engrossando de perto.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "2. As camadas ativas" },
      { type: "heading", level: 3, text: "🛰️ Satélites: CelesTrak + SGP4" },
      {
        type: "paragraph",
        text: "O **CelesTrak** publica os elementos orbitais (TLE) de grupos de satélites. Uso três: GPS, Galileo e meteorológicos, cerca de 137 satélites. O navegador calcula a posição de cada um com o modelo **SGP4** (biblioteca `satellite.js`) e recalcula a cada 10 segundos, então você vê os satélites andando.",
      },
      {
        type: "paragraph",
        text: "O CelesTrak pede para não ser consultado mais de uma vez a cada duas horas por grupo, então o TLE fica em cache por 2h. Às vezes ele responde 200 com uma mensagem de texto no lugar do TLE; nesse caso o globo mantém o cache anterior. No hover aparecem o nome e a altitude.",
      },
      { type: "heading", level: 3, text: "🛰 Estação Espacial Internacional: wheretheiss.at" },
      {
        type: "paragraph",
        text: "A ISS tem um anel azul próprio, atualizado a cada 8 segundos pela API pública **wheretheiss.at**. O hover mostra altitude (cerca de 400 km) e velocidade (cerca de 27.600 km/h).",
      },
      { type: "heading", level: 3, text: "🌍 Terremotos: USGS" },
      {
        type: "paragraph",
        text: "O feed GeoJSON do **USGS** traz os terremotos de magnitude 4.5 ou mais das últimas 24 horas. Cada um vira um anel pulsante com tamanho e cor pela magnitude (amarelo, laranja, vermelho), com a magnitude escrita ao lado. O hover mostra o local e há quanto tempo aconteceu.",
      },
      { type: "heading", level: 3, text: "🌋 Vulcões: Smithsonian" },
      {
        type: "paragraph",
        text: "São 425 vulcões do catálogo do **Smithsonian Global Volcanism Program**, num JSON público. Triângulos coloridos pelo tipo (escudo, estratovulcão, caldeira...) e com tamanho pela altitude. Esse dado não é ao vivo: é o catálogo de vulcões, não as erupções do dia.",
      },
      { type: "heading", level: 3, text: "🔥 Incêndios: NASA VIIRS" },
      {
        type: "paragraph",
        text: "Os focos de calor vêm dos satélites **VIIRS da NASA**, pelo **ArcGIS Living Atlas**. Sem filtro são mais de 100 mil focos por dia no mundo, impossível de desenhar. Filtro as últimas 6 horas, confiança alta e potência do fogo (FRP) de pelo menos 10 MW, até 500 focos.",
      },
      {
        type: "code",
        language: "sql",
        code: "hours_old <= 6 AND confidence = 'high' AND frp >= 10",
      },
      { type: "heading", level: 3, text: "⚠️ Alertas de emergência: CAP" },
      {
        type: "paragraph",
        text: "O **CAP Alerts Feed** do Living Atlas junta avisos oficiais de agências de vários países no formato CAP (Common Alerting Protocol): tempestades, enchentes, calor extremo. A área de cada alerta é um polígono; peço ao serviço o centroide (`returnCentroid`) e desenho um ⚠️ ali. O hover mostra evento, severidade, área e órgão emissor.",
      },
      { type: "heading", level: 3, text: "🌀 Furacões, ciclones e tufões" },
      {
        type: "paragraph",
        text: "A camada **Active Hurricanes** do Living Atlas junta o **NHC** (Atlântico e Pacífico Leste) e o **JTWC** (demais bacias), então cobre o planeta inteiro. Cada tempestade vira uma espiral colorida pela categoria Saffir-Simpson, com vento em km/h e pressão em mb no hover. Foi a terceira fonte que testei para isso (veja mais abaixo).",
      },
      { type: "heading", level: 3, text: "💨 Vento: modelo GFS" },
      {
        type: "paragraph",
        text: "O vento vem de uma grade do modelo **GFS** (NOAA) com resolução de 1°: duas matrizes de 360×181 com os componentes leste-oeste e norte-sul do vento na superfície, no mesmo formato usado pelo *earth.nullschool*. O arquivo fica num repositório público do GitHub atualizado periodicamente.",
      },
      {
        type: "paragraph",
        text: "Em cima dessa grade, 700 partículas andam pelo campo de vento, com a velocidade interpolada entre os pontos da grade, e deixam um rastro que desbota, colorido pela velocidade. É o efeito de \"rios de vento\" que aparece quando você liga a camada 💨.",
      },
      { type: "heading", level: 3, text: "🏙️ Cidades, clima e qualidade do ar" },
      {
        type: "paragraph",
        text: "Os anéis verdes são polos de tecnologia pelo mundo, de San Francisco a Joanesburgo. Ao passar o mouse, o card busca na hora:",
      },
      {
        type: "list",
        items: [
          "**Hora local, temperatura e clima** pelo **Open-Meteo** (com `timezone=auto`), em cache de 2 horas.",
          "**Qualidade do ar (AQI)** pela estação **OpenAQ** de PM2.5 mais próxima, até 50 km, também pelo Living Atlas. Sem estação perto, o card fica sem AQI em vez de mostrar um número inventado.",
        ],
      },
      {
        type: "paragraph",
        text: "Clicar num pin desenha um arco laranja animado até Vitória-ES, onde moro, seguindo o grande círculo da Terra (interpolação esférica).",
      },
      { type: "heading", level: 3, text: "📍 Você no mapa" },
      {
        type: "paragraph",
        text: "Se você permitir a localização, aparece um pin amarelo onde você está, com o nome da cidade vindo do **Nominatim** (OpenStreetMap). Se negar, a barra de cima usa a localização aproximada pelo IP (`ipapi.co`) só para mostrar a temperatura.",
      },
      { type: "heading", level: 3, text: "A barra de camadas" },
      {
        type: "paragraph",
        text: "Cada camada tem um botão ON/OFF na barra do topo. O botão dispara um `CustomEvent` que o globo escuta, e a escolha fica salva no navegador. Cada fonte tem seu próprio arquivo, usa `AbortSignal.timeout` e devolve lista vazia se falhar: uma API fora do ar apaga só a sua camada, nunca o globo inteiro.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "3. O que não deu certo" },
      {
        type: "paragraph",
        text: "Essa é a parte que mais ensina. Cada item abaixo chegou a ter código, e alguns ficaram dias no ar antes de sair.",
      },
      { type: "heading", level: 3, text: "✈️ Aviões em tempo real (OpenSky)" },
      {
        type: "paragraph",
        text: "A ideia era mostrar os aviões no ar pela **OpenSky Network**. A API funciona, mas não libera CORS para o navegador. Contornar exigiria um proxy no servidor só para isso, e a camada saiu.",
      },
      { type: "heading", level: 3, text: "🛰️ Starlink" },
      {
        type: "paragraph",
        text: "O grupo `starlink` do CelesTrak tem milhares de satélites e seria lindo no globo, mas passou a responder **403**. Ficaram só GPS, Galileo e meteorológicos.",
      },
      { type: "heading", level: 3, text: "☁️ Nuvens ao vivo (NOAA GOES)" },
      {
        type: "paragraph",
        text: "Tentei trocar a textura fixa de nuvens por imagens recentes dos satélites **GOES** da NOAA. O serviço que eu encontrei pedia autenticação, e o primeiro ID de camada que usei nem existia. Voltei para a textura estática, que continua lá como enfeite, não como dado.",
      },
      { type: "heading", level: 3, text: "🌊 Correntes marítimas (Open-Meteo Marine)" },
      {
        type: "paragraph",
        text: "Cheguei a ter correntes oceânicas reais, tracejadas para diferenciar do vento, vindas do **Open-Meteo Marine**. Para cobrir o planeta eram muitas consultas, e o limite gratuito de requisições estourava. Aumentar o cache para 24 horas não resolveu, e a camada saiu.",
      },
      { type: "heading", level: 3, text: "🌀 Furacões: três tentativas" },
      {
        type: "list",
        items: [
          "**OpenWeatherMap:** a primeira versão, que não ficou.",
          "**RSS da NOAA:** funcionava, mas só cobre Atlântico e Pacífico, não libera CORS (precisou de uma função de proxy na Netlify) e alguns feeds retornavam 404.",
          "**IBTrACS:** tentei servir essa base histórica de ciclones pela minha VPS, mas sem um feed atual de verdade o que chegava ao globo eram dados de exemplo. Removi por completo.",
          "**ArcGIS Living Atlas (Active Hurricanes):** a versão atual, global e com CORS liberado.",
        ],
      },
      { type: "heading", level: 3, text: "🌌 Aurora boreal" },
      {
        type: "paragraph",
        text: "Fiz a aurora com o **índice Kp** real da NOAA (atividade geomagnética). O problema é que, na maior parte do tempo, o Kp é baixo e não há nada para mostrar. Para demonstrar, cheguei a forçar um Kp alto, mas isso é dado falso e reverti no mesmo dia. Depois decidi tirar a camada do globo.",
      },
      { type: "heading", level: 3, text: "🧪 Dados de exemplo que viraram dados reais" },
      {
        type: "paragraph",
        text: "Nas primeiras versões, qualidade do ar, incêndios, satélites e até raios eram amostras fixas no código. Uma a uma foram trocadas por fonte real (OpenAQ, VIIRS, CelesTrak + SGP4) e os raios simulados saíram do globo. Hoje vale a regra: se não existe dado real, a camada não existe.",
      },
      { type: "heading", level: 3, text: "🐛 O bug que desligou terremotos e vulcões" },
      {
        type: "paragraph",
        text: "Esse foi o mais chato. Em produção, o hover dos terremotos e dos vulcões quebrava com `Cannot access X before initialization`, e em desenvolvimento funcionava. Passei um dia desligando partes, renomeando propriedades e comentando código, e cheguei a remover as duas camadas.",
      },
      {
        type: "paragraph",
        text: "A causa estava no build: o minificador renomeava variáveis, e nomes curtos colidiam dentro dos event handlers que liam objetos guardados em `useRef`. A solução foi manter a minificação, mas sem renomear identificadores:",
      },
      {
        type: "code",
        language: "ts",
        code: "// vite.config.ts\nbuild: { minify: \"esbuild\" },\nesbuild: { minifyIdentifiers: false },",
      },
      {
        type: "paragraph",
        text: "O bundle fica um pouco maior, e terremotos e vulcões voltaram. Detalhe importante para testar: o Chromium headless (usado em testes automatizados) renderiza sem GPU e o ArcGIS não desenha o globo nele, então esse tipo de bug só aparece num navegador de verdade.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "Principais lições" },
      {
        type: "list",
        ordered: true,
        items: [
          "**CORS decide o que dá para fazer no navegador.** Muitas APIs públicas não liberam, e um proxy traz custo e regras de uso. O Living Atlas da Esri, com CORS liberado, virou a fonte de quatro camadas.",
          "**Respeite os limites das fontes gratuitas.** Cache de 2 horas no CelesTrak e no clima, filtros fortes nos incêndios.",
          "**Calcular no cliente economiza API:** com SGP4, uma consulta a cada 2 horas move os satélites o tempo todo.",
          "**Cada camada falha sozinha.** Timeout e lista vazia em cada loader mantêm o globo de pé quando uma fonte cai.",
          "**Prefira tirar uma camada a mostrar dado falso.** O globo ficou com menos camadas do que planejei, mas tudo o que aparece é real.",
          "**Teste o build de produção num navegador com GPU.** Minificação pode quebrar o que funciona em desenvolvimento.",
        ],
      },
    ],
  },
  {
    slug: "oracle-vps-free-tier",
    title: "Como a Oracle \"comeu\" minha VPS de graça",
    date: "2026-09-20",
    tags: ["Oracle Cloud", "DevOps", "Infra", "LLM"],
    excerpt:
      "Uma mensagem simples — \"a vps caiu\" — virou uma investigação de várias horas: escassez global de capacidade ARM, migração pra outra região, reconstrução de um pipeline do zero e troca de um LLM local por uma API gratuita.",
    blocks: [
      {
        type: "paragraph",
        text:
          "Esse é o relato técnico (mas sem enrolação) de um incidente que começou com \"a vps caiu\" e virou uma tarde inteira de detetive de infraestrutura: escassez global de capacidade em nuvem, migração cross-region, um pipeline de dados reconstruído do zero e a troca de um LLM local por uma API externa gratuita. Se você roda algo em produção no Always Free tier da Oracle Cloud (ARM Ampere A1), guarda esse post.",
      },
      { type: "heading", level: 2, text: "TL;DR" },
      {
        type: "list",
        items: [
          "Uma VM Always Free (ARM Ampere A1) na Oracle Cloud foi **reclamada automaticamente por ociosidade** — o compute sumiu da conta, mas o **boot volume sobreviveu**.",
          "Tentar recriar a instância no mesmo lugar esbarrou em **\"Out of host capacity\"** — um problema crônico e bem documentado pela comunidade pra ARM free tier em regiões populares (`us-ashburn-1`).",
          "A saída dentro do free tier foi **criar uma segunda conta em outra região** (Frankfurt) — lá a capacidade ARM estava livre na hora.",
          "Como os dados \"presos\" na conta antiga dependiam de artefatos publicados externamente (GitHub Releases), foi possível **reconstruir o stack inteiro do zero** na conta nova — inclusive uma feature de IA que antes dependia de um LLM local (Ollama), trocado por uma API externa gratuita (OpenRouter).",
          "Pra evitar que a *nova* instância sofra o mesmo destino, configurei um **monitor de uptime externo** batendo no serviço a cada 5 minutos — gera carga real, não é só ping vazio.",
        ],
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "1. O incidente: \"a vps caiu\"" },
      {
        type: "paragraph",
        text:
          "Tudo começou com uma VPS Oracle Cloud (ARM Ampere A1, Ubuntu 24.04) rodando havia meses: Coolify gerenciando um n8n, Directus, Chatwoot, Evolution API, Typebot, Open WebUI e um Neo4j — a pilha inteira de uma automação pessoal. De repente, SSH parou de responder. Nem ping.",
      },
      {
        type: "paragraph",
        text:
          "A primeira suspeita nunca deveria ser \"a nuvem caiu\" — geralmente é configuração, IP errado ou firewall. Então o primeiro passo foi diagnóstico, não pânico:",
      },
      {
        type: "code",
        language: "bash",
        code:
          "ping -c 4 <ip-da-vps>          # timeout total\nnc -zv -w 5 <ip-da-vps> 22      # timeout\nnc -zv -w 5 <ip-da-vps> 443     # timeout",
      },
      {
        type: "paragraph",
        text:
          "Timeout em **todas** as portas, incluindo ICMP, é um sinal forte de que o problema não é um serviço específico — é a máquina inteira, ou a rede em volta dela.",
      },
      { type: "heading", level: 2, text: "2. Diagnosticando sem acesso à VM: a OCI CLI" },
      {
        type: "paragraph",
        text:
          "Sem SSH, a única forma de investigar é pela API da nuvem. Instalei a OCI CLI localmente e configurei uma API Key (gerada em *User Settings → API Keys* no console — nunca a senha da conta):",
      },
      {
        type: "code",
        language: "bash",
        code:
          'bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)" -- --accept-all-defaults\noci setup config   # ou configurar ~/.oci/config manualmente com o "Configuration File Preview" do console',
      },
      {
        type: "paragraph",
        text:
          "**Gotcha #1**: logo após gerar uma API Key nova, `oci iam region list` pode devolver `401 NotAuthenticated` mesmo com tudo certo — é propagação, não erro de configuração. Esperar ~1 minuto resolve.",
      },
      {
        type: "paragraph",
        text: "Com a CLI funcionando, o primeiro comando que importa depois de uma instância sumir:",
      },
      {
        type: "code",
        language: "bash",
        code: "oci compute instance list --compartment-id <tenancy-ocid> --all",
      },
      {
        type: "paragraph",
        text:
          "Resultado: **vazio**. Nem em estado `RUNNING`, nem `STOPPED`, nem sequer `TERMINATED`. A instância não existia mais — de verdade, não estava só desligada.",
      },
      { type: "heading", level: 2, text: "3. A causa: reclamação por ociosidade" },
      {
        type: "paragraph",
        text:
          "Esse é o comportamento documentado (mas pouco divulgado) da Oracle para o Always Free tier: instâncias ARM Ampere A1 com uso de CPU/rede/memória consistentemente baixo por um período (a Oracle avisa por e-mail antes) podem ser **recuperadas automaticamente** — o compute é apagado, liberando a vaga pra outro cliente.",
      },
      {
        type: "paragraph",
        text:
          "A boa notícia: block storage (boot volumes) segue uma política separada e mais generosa. Confirmei rodando:",
      },
      {
        type: "code",
        language: "bash",
        code: "oci bv boot-volume list --compartment-id <tenancy-ocid> --availability-domain <ad>",
      },
      {
        type: "paragraph",
        text:
          'E lá estava: um boot volume de 200GB, `AVAILABLE`, com a tag de sistema `"free-tier-retained": "true"`. **Todos os dados sobreviveram** — Docker volumes, configs, tudo — só a VM em si tinha sumido.',
      },
      { type: "heading", level: 2, text: "4. Tentativa 1: recriar a instância no boot volume original" },
      {
        type: "paragraph",
        text:
          "O caminho óbvio: lançar uma instância nova usando o boot volume existente como origem (não uma imagem nova):",
      },
      {
        type: "code",
        language: "bash",
        code:
          'oci compute instance launch \\\n  --compartment-id <tenancy-ocid> \\\n  --availability-domain <ad> \\\n  --shape "VM.Standard.A1.Flex" \\\n  --shape-config \'{"ocpus": 2, "memoryInGBs": 12}\' \\\n  --source-details \'{"sourceType": "bootVolume", "bootVolumeId": "<boot-vol-ocid>"}\' \\\n  --subnet-id <subnet-ocid> \\\n  --assign-public-ip true',
      },
      { type: "paragraph", text: "Resultado: `InternalError: Out of host capacity.`" },
      {
        type: "paragraph",
        text:
          "**Gotcha #2** (importante pra quem for automatizar isso): por padrão, o SDK da Oracle faz *retry automático* internamente quando recebe certos erros — isso faz cada chamada de `launch` (mesmo falhando) levar **~108 segundos**, inviabilizando qualquer script de retry rápido. A flag que resolve:",
      },
      { type: "code", language: "bash", code: "oci compute instance launch ... --no-retry" },
      {
        type: "paragraph",
        text: "Com isso, cada tentativa cai pra ~2 segundos, permitindo um loop de retry de verdade.",
      },
      { type: "heading", level: 2, text: "5. \"Out of host capacity\": o problema não é seu" },
      {
        type: "paragraph",
        text: "Esse erro é um clássico da comunidade Oracle Cloud. Pesquisando, alguns fatos relevantes:",
      },
      {
        type: "list",
        items: [
          "Regiões populares como `us-ashburn-1` (Leste dos EUA) ficam sem capacidade ARM Ampere livre por **horas a semanas** — é a região mais disputada do free tier.",
          "Regiões menos populares (Frankfurt, Singapura, Tóquio) costumam ter capacidade disponível **na hora**.",
          "Scripts de retry automático da comunidade (existem vários projetos open-source só pra isso) relatam que conseguir uma vaga pode levar **de 1 a 3 meses** de tentativas contínuas, dependendo da região.",
          "Uma região com 3 Availability Domains multiplica as chances se você rotacionar entre eles — mas isso exige ter o boot volume disponível em cada um, e o limite de armazenamento do free tier (**200GB no total**) não permite ter cópias em dois ao mesmo tempo.",
        ],
      },
      {
        type: "paragraph",
        text:
          "Montei um retry automático (usando backup/restore do boot volume pra rotacionar entre availability domains) que rodou por muitas horas, sem sucesso — confirmando a escala do problema na prática, não só na teoria.",
      },
      { type: "heading", level: 3, text: "O que eu tentei e não deu certo (documentando pra economizar seu tempo)" },
      {
        type: "list",
        items: [
          "**Extrair os dados via uma instância x86 temporária** (o shape `VM.Standard.E2.1.Micro` sempre tem capacidade livre): esbarra no limite de 200GB — o volume restaurado já ocupa a cota inteira, não sobra espaço nem pro disco mínimo da instância auxiliar.",
          '**Virar conta "Pay As You Go"** (relatos de comunidade sugerem que isso libera um pool de capacidade separado, sem custo se você ficar dentro do Always Free): o cartão foi recusado pelo banco no meio do processo. E mesmo se tivesse sido aprovado, isso não é garantia documentada oficialmente pela Oracle — é só relato de comunidade.',
        ],
      },
      { type: "heading", level: 2, text: "6. A virada: uma conta nova, em outra região" },
      {
        type: "paragraph",
        text:
          "Com o negócio parado, a decisão pragmática foi criar uma segunda conta Oracle Cloud (Always Free permite, mas atenção: a Oracle proíbe múltiplas contas Always Free pela mesma pessoa/cartão/telefone — é risco real de suspensão, avalie com cuidado) escolhendo **Frankfurt** (`eu-frankfurt-1`) como home region.",
      },
      {
        type: "paragraph",
        text:
          "Resultado: a instância ARM subiu **na primeira tentativa**, sem nenhum erro de capacidade. Confirma o padrão relatado pela comunidade sobre distribuição desigual de capacidade entre regiões.",
      },
      { type: "heading", level: 2, text: "7. Reconstruindo do zero — mas nem tudo precisava do disco antigo" },
      {
        type: "paragraph",
        text:
          "Aqui está o ponto mais importante do post: **nem todo dado \"perdido\" está realmente preso**. Alguns dos serviços que rodavam na VPS antiga restauravam o próprio estado a partir de **artefatos publicados externamente** (GitHub Releases), não do disco local:",
      },
      {
        type: "code",
        language: "python",
        code:
          '# padrão usado: checkpoint/dataset publicado como GitHub Release,\n# baixado e restaurado em qualquer máquina nova\nr = requests.get(f"{API}/repos/{REPO}/releases/tags/{TAG}", headers=_headers())\n# ...\ncom tarfile.open(tar_path) as tar:\n    tar.extractall(...)',
      },
      {
        type: "paragraph",
        text:
          "Isso significou que um pipeline de ETL inteiro (rodando 24/7, cron jobs incluídos) e um dashboard público com **351 mil registros** puderam ser recriados do zero na conta nova em minutos, sem depender da Oracle liberar capacidade na conta antiga.",
      },
      {
        type: "paragraph",
        text:
          "**Lição de arquitetura**: se seu sistema tem estado importante, pergunte-se — esse estado sobrevive se a VM inteira sumir amanhã? Publicar checkpoints/datasets como artefatos versionados (Release do GitHub, objeto em bucket, etc.) é muito mais resiliente do que confiar só no disco de uma única VM.",
      },
      { type: "heading", level: 2, text: "8. Trocando um LLM local por uma API gratuita externa" },
      {
        type: "paragraph",
        text:
          "Um dos serviços mais divertidos de recriar foi um gerador de **dossiê de due diligence via IA** — cruza dados de Postgres + grafo Neo4j + um modelo preditivo (score de risco), e usa um LLM pra redigir o parecer final. Na VPS antiga isso rodava via **n8n orquestrando uma chamada pro Ollama local** (`llama3.1:8b`).",
      },
      {
        type: "paragraph",
        text:
          "Como n8n e Ollama também estavam presos na conta antiga, a solução foi **cortar a orquestração via n8n e chamar um LLM externo direto do backend**:",
      },
      {
        type: "code",
        language: "python",
        code:
          'resp = requests.post(\n    "https://openrouter.ai/api/v1/chat/completions",\n    headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},\n    json={"model": OPENROUTER_MODEL, "messages": [...], "stream": False},\n    timeout=120,\n)',
      },
      {
        type: "paragraph",
        text:
          "**Gotcha #3**: modelos `:free` do OpenRouter têm um pool compartilhado que também sofre de \"capacidade cheia\" — o mesmo problema da Oracle, só que em escala de minutos, não meses. Um modelo pode devolver `429 rate-limited upstream` mesmo com a key correta. A saída: ter uma lista de 2-3 modelos free alternativos e trocar quando um estiver saturado (a lista muda com o tempo — sempre confira `GET /api/v1/models` antes de fixar um nome de modelo no código).",
      },
      {
        type: "paragraph",
        text:
          "**Gotcha #4**: modelos de \"raciocínio\" (reasoning models) devolvem um campo `reasoning` gigante além do `content` final — não é erro, é o chain-of-thought interno. Extraia só `choices[0].message.content`.",
      },
      { type: "heading", level: 2, text: "9. Cloudflare + servidor sem certificado válido = erro 521" },
      {
        type: "paragraph",
        text:
          "Ao reapontar o DNS pro novo servidor, o site voltava com `521 - Web server is down` mesmo com o Nginx respondendo normalmente na porta 80. Causa: o modo de proxy do Cloudflare (nuvem laranja) tenta alcançar a origem também via **HTTPS na porta 443** dependendo do modo de SSL/TLS configurado na zona — e o servidor novo só tinha HTTP.",
      },
      {
        type: "paragraph",
        text:
          'Fix rápido (suficiente pro modo "Full", que não valida a cadeia do certificado, só exige que a porta responda TLS):',
      },
      {
        type: "code",
        language: "bash",
        code:
          'sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \\\n  -keyout /etc/ssl/private/selfsigned.key \\\n  -out /etc/ssl/certs/selfsigned.crt \\\n  -subj "/CN=seu-dominio.com"\n# + bloco server { listen 443 ssl; ... } no Nginx',
      },
      { type: "heading", level: 2, text: "10. Prevenindo que a história se repita" },
      {
        type: "paragraph",
        text:
          "Como tudo começou com uma instância marcada como \"ociosa\", a última peça foi garantir que a VPS **nova** não caia na mesma armadilha. A tática (a mesma lógica de scripts de \"keepalive\" que muita gente já usa pra evitar auto-pause de bancos free tier, tipo Supabase):",
      },
      {
        type: "paragraph",
        text:
          "Configurar um **monitor de uptime externo** (UptimeRobot, cron-job.org, etc.) batendo num endpoint real da API a cada 5 minutos. A diferença pra um \"ping vazio\": isso força o processo a acordar, consultar banco, responder — **carga real de CPU e rede**, exatamente as métricas que a Oracle audita pra decidir o que é \"ocioso\". E de brinde, você ganha alerta de verdade se o serviço cair.",
      },
      { type: "hr" },
      { type: "heading", level: 2, text: "Principais lições" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Diagnostique pela API antes de assumir o pior** — `ping`/`SSH` falhando não significa dado perdido; confira o estado real dos recursos (volumes, backups) antes de entrar em pânico.",
          "**Free tier tem letras miúdas** — reclamação por ociosidade é real e a Oracle avisa por e-mail antes; não ignore esses avisos.",
          '**"Out of host capacity" não é bug seu** — é escassez real, documentada pela comunidade, e a distribuição entre regiões é bem desigual.',
          "**Arquitete pra sobreviver à perda da VM** — se dados críticos só existem no disco de uma única máquina, você está a um evento de distância de um problema como esse. Publicar snapshots/checkpoints externos é barato e salva o dia.",
          '**APIs gratuitas de LLM têm o mesmo problema de "capacidade cheia" que clouds de compute** — tenha sempre um plano B de modelo.',
          "**Cloudflare + origem sem HTTPS = 521** — se for usar proxy laranja, a origem precisa responder TLS na 443 também.",
          '**Monitoramento de uptime não é só sobre alerta** — pode ser, de fato, a diferença entre uma instância free tier considerada "em uso" ou "ociosa".',
        ],
      },
    ],
  },
];
