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
```

## Personalizar

- **WhatsApp / Instagram / endereço / horário:** `STORE` em `assets/js/data.js` (o número atual é um placeholder).
- **Produtos e preços:** `PRODUCTS` em `assets/js/data.js` (preços atuais são exemplos).
- **Banner:** `HERO_SLIDES` em `assets/js/data.js`.
- A sacola fica salva no navegador e o pedido é finalizado pelo WhatsApp.
