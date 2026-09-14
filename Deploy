# Deploy — Operação 50K

Este projeto é HTML/CSS/JS puro: qualquer hospedagem de site estático funciona. Nenhum build é necessário — publique os arquivos como estão.

---

## Netlify (mais simples)

**Opção A — arrastar e soltar:**
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `operacao50k` inteira para a página
3. Pronto — a URL fica disponível em segundos

**Opção B — CLI:**
```bash
npm install -g netlify-cli
cd operacao50k
netlify deploy --prod
```

---

## Vercel

```bash
npm install -g vercel
cd operacao50k
vercel --prod
```
Quando perguntado o diretório de output, confirme a raiz (`.`) — não há etapa de build.

---

## Cloudflare Pages

1. No painel da Cloudflare, vá em **Pages → Create a project → Upload assets**
2. Envie a pasta `operacao50k`
3. Build command: deixe em branco. Output directory: `/`

Ou conectando um repositório Git: aponte para a pasta do projeto, sem build command.

---

## GitHub Pages

```bash
cd operacao50k
git init
git add .
git commit -m "Operação 50K — landing page"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```
Depois, no repositório: **Settings → Pages → Source: branch `main`, pasta `/ (root)`**. A URL fica em `https://<usuario>.github.io/<repositorio>/`.

Se preferir a branch `gh-pages` tradicional:
```bash
git checkout -b gh-pages
git push origin gh-pages
```
E configure **Settings → Pages → Source: branch `gh-pages`**.

---

## Amazon S3 (hospedagem como site estático)

1. Crie um bucket S3 com o nome do domínio (ou qualquer nome, se for usar CloudFront/domínio customizado depois)
2. Faça upload de todos os arquivos da pasta `operacao50k` mantendo a estrutura (`assets/` como subpasta)
3. Em **Properties → Static website hosting**, ative e defina `index.html` como documento de índice
4. Em **Permissions → Bucket Policy**, libere leitura pública para os objetos:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::SEU-BUCKET/*"
     }]
   }
   ```
5. (Recomendado) Coloque um CloudFront na frente do bucket para HTTPS e cache — S3 sozinho serve apenas HTTP.

---

## Firebase Hosting

```bash
npm install -g firebase-tools
cd operacao50k
firebase login
firebase init hosting
# Quando perguntado o diretório público, aponte para a raiz do projeto (.)
# Configure como single-page app: Não (não é necessário, não há rotas client-side)
firebase deploy
```

---

## Checklist pós-deploy

- [ ] Abrir a URL publicada em um celular real (não só no emulador do navegador) e testar o formulário do início ao fim
- [ ] Confirmar que `LEAD_SUBMIT_URL` em `app.js` está configurado com a URL real do webhook antes de rodar tráfego
- [ ] Remover ou ajustar a tag `<meta name="robots" content="noindex">` no `<head>` do `index.html` quando a página estiver pronta para ser indexada (ela está bloqueando indexação por padrão, intencionalmente, enquanto a página é uma versão de teste/MVP)
- [ ] Testar em conexão 3G simulada (DevTools → Network → Slow 3G) para confirmar a velocidade de carregamento
- [ ] Testar navegação completa por teclado (Tab, Shift+Tab, Enter) sem usar o mouse
