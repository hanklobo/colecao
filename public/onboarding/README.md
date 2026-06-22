# Imagens do onboarding

A landing de boas-vindas (`src/components/LandingPage.tsx`) usa screenshots
reais do app quando presentes nesta pasta:

- `hero.png`
- `collect.png`
- `progress.png`
- `trade.png`

Se algum arquivo estiver ausente, a landing mostra automaticamente o mockup
visual embutido (SVG/CSS) no lugar — então nada quebra sem as imagens.

## Como gerar

Em um ambiente com navegador disponível:

```bash
npm run build && npm run preview        # serve em http://localhost:4173
npx playwright install chromium         # uma vez
npm run screenshots
```
