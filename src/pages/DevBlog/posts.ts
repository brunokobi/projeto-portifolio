// Conteúdo dos posts do blog dev — array simples versionado no git, sem CMS.
// Formato "markdown-lite": **negrito**, `código inline`, *itálico* dentro de
// paragraph/list são renderizados pelo PostRenderer (ver renderInline).
// Nunca colocar IP/chave/dado sensível real aqui — sempre placeholder.

export type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; language?: string; code: string }
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
