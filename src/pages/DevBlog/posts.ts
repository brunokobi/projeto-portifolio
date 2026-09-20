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
      { type: "hr" },
      {
        type: "paragraph",
        text:
          "*Todo esse processo — diagnóstico, tentativas de recuperação, migração cross-region e reconstrução do stack — foi conduzido com o Claude Code como par de investigação/automação, rodando os comandos da OCI CLI, escrevendo o código de migração e validando cada etapa.*",
      },
    ],
  },
];
