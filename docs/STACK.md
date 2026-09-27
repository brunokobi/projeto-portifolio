# Stack Técnico

## Frontend

### Runtime & Build
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Chakra UI | 2.x | Component library |

### Mapas & Visualização
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| ArcGIS JS SDK | 4.x | Globo 3D (SceneView) |
| Canvas API | Nativo | Renderização de partículas |
| WebGL | Nativo | Rendering backend (ArcGIS) |

### Roteamento
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React Router | 6.x | SPA routing |

### Utilitários
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Framer Motion | 10.x | Animações (ScaleFade, AnimatedStars) |
| React Icons | 5.x | Ícones (FaBlog, FaMap, etc) |

### Testing
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Vitest | 1.x | Unit tests |
| @testing-library/react | 14.x | Component testing |

---

## Backend & Deploy

### Hospedagem
| Tecnologia | Uso |
|-----------|-----|
| Netlify | Deploy + serverless (site estático + functions) |
| GitHub Pages | Alternativa (não usada atualmente) |

### CI/CD
| Tecnologia | Uso |
|-----------|-----|
| GitHub Actions | Build automation (compilar + deploy) |

### DNS & CDN
| Tecnologia | Uso |
|-----------|-----|
| Cloudflare | DNS + SSL/TLS |
| DuckDNS | DNS dinâmico (infraestrutura pessoal) |

---

## Dependências Chave (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@chakra-ui/react": "^2.x",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x",
    "framer-motion": "^10.x",
    "react-icons": "^5.x",
    "arcgis-js-api": "^4.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x"
  }
}
```

---

## Ambiente Local

### Pré-requisitos
- Node.js 18+ (recomendado: 20 LTS)
- npm ou yarn
- Git

### Dev Server
```bash
npm run dev
# Vite dev server em http://localhost:5173
```

### Build Production
```bash
npm run build
# Output em ./dist/
```

### Testing
```bash
npm run test
# Vitest no modo watch
```

---

## Design System

### Paleta de Cores
| Variável | Hex | Uso |
|----------|-----|-----|
| `greenAccent` | #42c920 | Brand primary (titulo, highlights) |
| `surfaceDark` | #0a0a0a | Background escuro |
| `inkLight` | #f5f5f5 | Texto em fundo escuro |
| `terminalGreen` | #00ff00 | Monospace/HUD labels |

### Tipografia
| Familia | Peso | Uso |
|---------|------|-----|
| Poppins | 400, 600, 700 | Body text + headings |
| Monospace | 400 | Code, HUD labels |

### Spacing
- Base: 4px
- Escala: 4, 8, 16, 24, 32, 48, 64

### Border Radius
- Small: 4px
- Medium: 8px
- Large: 16px

### Shadows & Glow
- Text glow: `text-shadow: 0 0 10px rgba(66, 201, 32, 0.5)`
- Box shadow: `0 0 20px rgba(66, 201, 32, 0.3)`

---

## Performance Targets

### Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Globo 3D
- FPS: 60 (requestAnimationFrame)
- Memory: < 500MB (dados + render)
- Initial load: < 3s

---

## Versioning & Releases

### Versionamento
- Major.Minor.Patch (semver)
- No `package.json` version
- Tags no Git: `v1.0.0`, etc.

### Release Process
1. Update version tag
2. Push to main
3. GitHub Actions build + deploy to Netlify
4. Site live em brunokobi.tech

---

## Monitoramento Local

### Ferramentas de Dev
- **Browser DevTools:** Chrome/Firefox
- **Vite Inspector:** Alt+Shift+D
- **React DevTools:** Browser extension

### Logging
- Console.log para debug
- Nenhum logger persistente (local dev)

---

## Alternativas Consideradas

| Tecnologia | Por que NÃO |
|-----------|------------|
| Three.js | Overkill pra globo; ArcGIS já tem 3D nativo |
| D3.js | Demais overhead; ArcGIS é mais direto pra geo |
| Vue | Team preference: React + TS |
| Angular | Muito pesado pra SPA simples |
| Svelte | Menos ecosystem; React mais consolidado |
| TailwindCSS | Chakra oferece components + accessibility |
