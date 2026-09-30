# Leandro Celulares — site

Site estático (HTML + CSS + JS puro, sem build). Abra `index.html` ou sirva a pasta:

```
python3 -m http.server 8000
```

## Estrutura

```
index.html            cabeçalho, navegação inferior, menu, sacola e busca
assets/css/style.css  layout mobile-first + versão desktop (≥900px)
assets/js/data.js     loja, categorias, produtos, preços e slides do banner  ← edite aqui
assets/js/app.js      rotas (#/, #/categorias, #/categoria/:slug, #/produto/:id, #/contato), sacola, busca
assets/img/           imagens
assets/js/phone3d.min.js  iPhone 3D (Three.js), carregado só quando a seção aparece
src/3d/phone3d.js     código-fonte do iPhone 3D
```

## Personalizar

- **WhatsApp / Instagram / endereço / horário:** `STORE` em `assets/js/data.js` (o número atual é um placeholder).
- **Produtos e preços:** `PRODUCTS` em `assets/js/data.js` (preços atuais são exemplos).
- **Banner:** `HERO_SLIDES` em `assets/js/data.js`.
- A sacola fica salva no navegador e o pedido é finalizado pelo WhatsApp.

## iPhone 3D

O modelo é montado em código (sem arquivo .glb) em `src/3d/phone3d.js`. Depois de editar, gere o arquivo final:

```
npm i esbuild three
npx esbuild src/3d/phone3d.js --bundle --minify --format=esm --outfile=assets/js/phone3d.min.js
```

As cores do 3D ficam em `PRODUCTS` → iPhone 16 → `colors` (`back` = traseira, `frame` = laterais).
