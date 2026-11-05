import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import messages from "../../i18n/messages/pt.json";
import { skills } from "../../pages/About/skills";
import { CURRICULO } from "../../data/curriculo";
import { EXPERIENCE_ORDER, buildJarvisProfile, extractSkillLabels } from "../jarvisProfile";

const pt = messages as Record<string, string>;
const skillLabels = skills.map((skill) => skill.label);
const profile = buildJarvisProfile({ messages: pt, skills: skillLabels, curriculo: CURRICULO });

describe("buildJarvisProfile", () => {
  it("cobre todas as experiências do site, na ordem da página About", () => {
    const keys = Object.keys(pt)
      .map((key) => /^experiencia(\d+)t$/.exec(key)?.[1])
      .filter((n): n is string => n !== undefined)
      .map(Number);

    expect([...keys].sort()).toEqual([...EXPERIENCE_ORDER].sort());

    const positions = EXPERIENCE_ORDER.map((n) => {
      for (const suffix of ["t", "e", "d"]) {
        expect(profile).toContain(pt[`experiencia${n}${suffix}`].trim());
      }
      return profile.indexOf(pt[`experiencia${n}e`].trim());
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("marca só o emprego com período em aberto como atual", () => {
    const current = profile.split("\n").filter((line) => line.includes("(emprego atual)"));
    expect(current).toHaveLength(1);
    expect(current[0]).toContain(pt.experiencia5e);
  });

  it("detalha cada experiência com as atividades do currículo", () => {
    expect(Object.keys(CURRICULO.experiencias).map(Number).sort()).toEqual([...EXPERIENCE_ORDER].sort());
    for (const n of EXPERIENCE_ORDER) {
      for (const item of CURRICULO.experiencias[n].atividades) expect(profile).toContain(`  - ${item}`);
    }
  });

  it("inclui projetos, formação, competências, idiomas e certificações", () => {
    for (const key of Object.keys(pt).filter((k) => /^project\d+t$/.test(k))) {
      expect(profile).toContain(pt[key].trim());
    }
    for (const item of [...CURRICULO.formacao, ...CURRICULO.idiomas, ...CURRICULO.certificacoes]) {
      expect(profile).toContain(item);
    }
    expect(profile).toContain("Metodologia: Scrum");
    for (const label of skillLabels) expect(profile).toContain(label);
  });

  it("tem todas as seções e não expõe telefone", () => {
    for (const heading of ["## Quem é", "## Experiência profissional", "## Formação", "## Competências técnicas", "## Idiomas", "## Cursos e certificações", "## Contato"]) {
      expect(profile).toContain(heading);
    }
    expect(profile).not.toMatch(/telefone|\(\d{2}\)\s*\d{4,5}-?\d{4}/i);
  });
});

describe("extractSkillLabels", () => {
  it("lê do fonte de skills.ts os mesmos labels que o array exportado", () => {
    const source = readFileSync(resolve(__dirname, "../../pages/About/skills.ts"), "utf8");
    expect(extractSkillLabels(source)).toEqual(skillLabels);
  });
});
