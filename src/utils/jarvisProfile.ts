import type { CURRICULO } from "../data/curriculo";

export const EXPERIENCE_ORDER = [5, 4, 1, 2, 3, 6] as const;

export const JARVIS_PROFILE_PATH = "jarvis/perfil.md";

const CONTACT = [
  "- GitHub: https://github.com/brunokobi",
  "- LinkedIn: https://www.linkedin.com/in/brunokobi",
  "- E-mail: brunokobi2@hotmail.com",
  "- Formulário de contato aqui mesmo no site",
];

interface ProfileInput {
  messages: Record<string, string>;
  skills: string[];
  curriculo: typeof CURRICULO;
}

export function extractSkillLabels(skillsSource: string): string[] {
  return [...skillsSource.matchAll(/label:\s*"([^"]+)"/g)].map((match) => match[1]);
}

function numberedKeys(messages: Record<string, string>, pattern: RegExp): number[] {
  return Object.keys(messages)
    .map((key) => pattern.exec(key)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number)
    .sort((a, b) => a - b);
}

function experienceLines(messages: Record<string, string>, curriculo: typeof CURRICULO): string[] {
  return EXPERIENCE_ORDER.filter((n) => messages[`experiencia${n}t`]).flatMap((n) => {
    const role = messages[`experiencia${n}t`].trim();
    const company = messages[`experiencia${n}e`].trim();
    const period = messages[`experiencia${n}d`].trim();
    const current = /presente/i.test(period) ? " (emprego atual)" : "";
    const detail = curriculo.experiencias[n];
    const place = detail?.local ? `, ${detail.local}` : "";
    return [
      `- **${role}** — ${company} (${period}${place})${current}`,
      ...(detail?.atividades ?? []).map((item) => `  - ${item}`),
    ];
  });
}

const bullets = (items: string[]) => items.map((item) => `- ${item}`);

function projectLines(messages: Record<string, string>): string[] {
  return numberedKeys(messages, /^project(\d+)t$/).map((n) => {
    const title = messages[`project${n}t`].trim();
    const description = (messages[`project${n}d`] ?? "").trim();
    return description ? `- **${title}**: ${description}` : `- **${title}**`;
  });
}

export function buildJarvisProfile({ messages, skills, curriculo }: ProfileInput): string {
  const about = ["sobre1", "sobre2", "sobre3"].map((key) => messages[key]?.trim()).filter(Boolean);
  const competencias = Object.entries(curriculo.competencias).map(
    ([group, items]) => `- ${group}: ${items.join(", ")}`
  );

  return [
    "# Perfil de Bruno Kobi",
    "",
    "Nome completo: Bruno Kobi Valadares de Amorim",
    curriculo.headline,
    "",
    "## Quem é",
    ...about,
    "",
    "## Resumo profissional",
    curriculo.resumo,
    ...bullets(curriculo.destaques),
    "",
    "## Experiência profissional",
    ...experienceLines(messages, curriculo),
    "",
    "## Formação",
    ...bullets(curriculo.formacao),
    "",
    "## Competências técnicas",
    ...competencias,
    `- Outras tecnologias no portfólio: ${skills.join(", ")}`,
    "",
    "## Idiomas",
    ...bullets(curriculo.idiomas),
    "",
    "## Cursos e certificações",
    ...bullets(curriculo.certificacoes),
    "",
    "## Projetos em destaque (currículo)",
    ...bullets(curriculo.projetosDestaque),
    "",
    "## Todos os projetos do portfólio",
    ...projectLines(messages),
    "",
    "## Contato",
    ...CONTACT,
    "",
  ].join("\n");
}
