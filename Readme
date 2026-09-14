# Operação 50K — Instituto Bulhões

Landing page de aplicação (funil de qualificação) em HTML/CSS/JS puro, sem frameworks e sem dependências externas.

## Como abrir localmente

Duas opções:

1. **Direto** — dê duplo clique em `index.html`. Funciona, mas alguns navegadores restringem `sessionStorage` em arquivos `file://`; se a persistência não funcionar, use a opção 2.
2. **Servidor local** (recomendado):
   ```bash
   npx serve .
   # ou
   python3 -m http.server 8000
   ```
   Depois acesse `http://localhost:8000` (ou a porta indicada).

## Estrutura de arquivos

```
index.html   → conteúdo da página (todas as 13 seções de copy) + container do funil
styles.css   → estilos não-críticos (o crítico já está inline no <head> do index.html)
flow.js      → CONFIGURAÇÃO do formulário: etapas, perguntas, tipos de campo, validação
app.js       → MOTOR do funil: renderização, validação, navegação, persistência, tracking
assets/      → logo do Instituto Bulhões
```

## Como personalizar

### Textos e copy
Edite diretamente as seções em `index.html`. Cada seção é um `<section>` comentado (`<!-- 1. HERO -->`, `<!-- 2. IDENTIFICAÇÃO -->`, etc.) na mesma ordem da estrutura estratégica do briefing.

### Perguntas do formulário
Edite **apenas `flow.js`**. Você não precisa tocar em `app.js` para:
- Adicionar, remover ou reordenar perguntas (edite o array `steps`)
- Mudar tipo de campo (`text`, `tel`, `email`, `select`, `radio`, `textarea`)
- Mudar opções de select/radio
- Mudar textos da tela de sucesso (`successScreen`)

Cada `step` pode ter um ou mais `fields`. A ordem dos steps já segue a lógica obrigatória de funil de aplicação: **engajamento → qualificação → tela de confiança → dados pessoais**. Mantenha essa ordem ao editar.

### Cores e tipografia
No topo de `styles.css` (e replicado no `<style>` inline do `<head>` do `index.html`), estão as variáveis CSS:

```css
--color-bg: #EFEFED;        /* fundo off-white */
--color-accent: #A18B6C;    /* dourado-taupe, uso decorativo */
--color-accent-strong: #6B5A3E; /* usado em botões/CTAs — mais escuro para garantir contraste */
--color-beige: #CCBCA6;
--color-ink: #211D17;       /* texto principal */
```

**Sobre as fontes da marca (Roylles/Fahkwang):** esta V1 usa uma stack de *system fonts* (nenhum arquivo externo) para manter a página extremamente rápida. Se quiser usar as fontes reais da marca, providencie os arquivos `.woff2` do Roylles e do Fahkwang e eu integro via `@font-face` self-hosted (sem CDN externa) — isso adiciona ~30–60KB ao carregamento.

### Logo
Troque o arquivo em `assets/logo-bulhoes-opt.png` mantendo o mesmo nome, ou atualize o `src` no `<img>` do hero em `index.html`.

## Como configurar o destino do lead (webhook)

Abra `app.js` e edite a constante no topo do arquivo:

```javascript
const LEAD_SUBMIT_URL = ''; // Cole aqui a URL do webhook do GoHighLevel (ou Zapier/Make)
```

Enquanto estiver vazia, o payload final é apenas exibido no console do navegador (`F12` → aba Console) — útil para testar sem enviar dados de verdade. Quando você tiver a URL do webhook do GHL, cole ali e o formulário passa a enviar via `fetch` (método POST, JSON) automaticamente.

O payload enviado contém todas as respostas do formulário (chaves = `id` de cada campo em `flow.js`) mais:
- `utm` — parâmetros de UTM capturados da URL (utm_source, utm_medium, utm_campaign, utm_content, utm_term), se presentes
- `submitted_at` — timestamp ISO do envio
- `page_url` — URL completa de onde veio o envio

## Como adicionar tracking (GA4, Meta Pixel)

No topo de `app.js`:

```javascript
const TRACKING_CONFIG = {
  ga4_id: '',           // Ex: 'G-XXXXXXXXXX' — requer o snippet do gtag.js também instalado na página
  meta_pixel_id: '',    // Ex: '1234567890' — requer o snippet do Pixel também instalado na página
  custom_webhook: ''    // Espelho opcional de todos os eventos, via navigator.sendBeacon
};
```

Todos os eventos (`page_view`, `funnel_start`, `step_view`, `step_complete`, `field_error`, `step_back`, `funnel_complete`, `funnel_abandon`) já disparam e aparecem no console mesmo sem nenhum ID configurado — isso facilita testar a instrumentação antes de conectar ferramentas de verdade.

**Importante:** os snippets do GA4/Meta Pixel em si (as tags `<script>` que carregam `gtag.js` / `fbevents.js`) não estão incluídos neste projeto, pois adicionar essas tags fere a regra de "zero dependências externas" que mantém a página rápida. Adicione-os manualmente no `<head>` do `index.html` somente se o time decidir que o ganho de mensuração compensa o impacto de performance.

## Decisões registradas no código

- **Qualificação sem bloqueio automático**: o briefing (seção 17) instrui a não automatizar rejeições nesta V1. A tela de desqualificação já está estruturada em `flow.js` (`disqualifyScreen`, com `enabled: false`) para ser ativada quando os critérios de pontuação forem definidos com o time comercial.
- **Sem menção a garantia**: conforme decidido, nenhuma garantia é comunicada nesta versão.
- **Prova social**: onde o briefing não fornece dados reais (cases, depoimentos, números), o código usa comentários `<!-- PLACEHOLDER: ... -->` visíveis apenas no código-fonte, nunca inventando conteúdo.
