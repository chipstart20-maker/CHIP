(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const arrow = '<svg class="arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const byId = id => PRODUCTS.find(p => p.id === id);
  const waLink = msg => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`;
  const pickedColor = {}; // cor escolhida por produto (cards e página)

  /* ---------- Sacola ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem('lc-cart')) || []; } catch { return []; } };
  let cart = load();
  const save = () => { try { localStorage.setItem('lc-cart', JSON.stringify(cart)); } catch {} renderCart(); };

  function addToCart(id, color, storage, qty = 1) {
    const found = cart.find(i => i.id === id && i.color === color && i.storage === storage);
    found ? (found.qty += qty) : cart.push({ id, color, storage, qty });
    save();
    toast('Adicionado à sacola');
    bump();
  }

  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    $('#cartCount').textContent = count;
    const body = $('#cartBody');
    if (!cart.length) {
      body.innerHTML = `<div class="empty"><p>Sua sacola está vazia.</p><a href="#/categorias" class="btn" data-close-link>Ver produtos ${arrow}</a></div>`;
      return;
    }
    const total = cart.reduce((s, i) => s + (byId(i.id)?.price || 0) * i.qty, 0);
    body.innerHTML = `
      <ul class="cart__list">${cart.map((i, idx) => {
        const p = byId(i.id); if (!p) return '';
        return `<li class="cart__item">
          <img src="${p.img}" alt="">
          <div class="cart__info">
            <strong>${p.name}</strong>
            <small>${[i.color, i.storage].filter(Boolean).join(' · ')}</small>
            <span class="cart__price">${brl(p.price * i.qty)}</span>
            <div class="qty">
              <button data-qty="${idx}" data-d="-1" aria-label="Diminuir">−</button>
              <span>${i.qty}</span>
              <button data-qty="${idx}" data-d="1" aria-label="Aumentar">+</button>
            </div>
          </div>
          <button class="icon-btn cart__remove" data-remove="${idx}" aria-label="Remover"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        </li>`;
      }).join('')}</ul>
      <div class="cart__foot">
        <div class="cart__total"><span>Total</span><strong>${brl(total)}</strong></div>
        <a class="btn btn--block" target="_blank" rel="noopener" href="${waLink(checkoutMsg(total))}">Finalizar pelo WhatsApp ${arrow}</a>
      </div>`;
  }

  const checkoutMsg = total => `Olá, ${STORE.name}! Quero fazer um pedido:\n\n` +
    cart.map(i => `• ${i.qty}x ${byId(i.id).name}${i.color ? ' — ' + i.color : ''}${i.storage ? ' — ' + i.storage : ''}`).join('\n') +
    `\n\nTotal: ${brl(total)}`;

  $('#cartBody').addEventListener('click', e => {
    const q = e.target.closest('[data-qty]'), r = e.target.closest('[data-remove]');
    if (q) { const i = cart[+q.dataset.qty]; i.qty += +q.dataset.d; if (i.qty < 1) cart.splice(+q.dataset.qty, 1); save(); }
    if (r) { cart.splice(+r.dataset.remove, 1); save(); }
    if (e.target.closest('[data-close-link]')) closeAll();
  });

  function bump() { const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800); }

  /* ---------- Drawers / busca ---------- */
  const overlay = $('#overlay');
  function open(el) { closeAll(); el.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('lock'); }
  function closeAll() { $$('.drawer.open, .search.open').forEach(d => d.classList.remove('open')); overlay.classList.remove('show'); document.body.classList.remove('lock'); }
  $('#menuBtn').onclick = () => open($('#menuDrawer'));
  $('#cartBtn').onclick = () => open($('#cartDrawer'));
  $('#searchBtn').onclick = () => { open($('#search')); setTimeout(() => $('#searchInput').focus(), 150); doSearch(''); };
  overlay.onclick = closeAll;
  $$('[data-close]').forEach(b => b.onclick = closeAll);
  document.addEventListener('keydown', e => e.key === 'Escape' && closeAll());

  $('#menuLinks').innerHTML = `
    <a href="#/">Início</a>
    ${CATEGORIES.map(c => `<a href="#/categoria/${c.slug}"><img src="${c.img}" alt="">${c.name}</a>`).join('')}
    <a href="#/contato">Contato</a>
    <a href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener" class="drawer__wa">Falar no WhatsApp</a>`;
  $('#menuLinks').addEventListener('click', e => e.target.closest('a') && closeAll());

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function doSearch(q) {
    const n = norm(q.trim());
    const list = PRODUCTS.filter(p => !n || norm(p.name + ' ' + p.category + ' ' + p.desc).includes(n));
    $('#searchResults').innerHTML = list.length
      ? list.map(p => `<a href="#/produto/${p.id}" class="result"><img src="${p.img}" alt=""><span><strong>${p.name}</strong><small>${brl(p.price)}</small></span></a>`).join('')
      : `<p class="empty">Nenhum produto encontrado para “${q}”.</p>`;
  }
  $('#searchInput').addEventListener('input', e => doSearch(e.target.value));
  $('#searchResults').addEventListener('click', e => e.target.closest('a') && closeAll());

  /* ---------- Componentes ---------- */
  // nos cards nenhuma cor aparece marcada até o cliente escolher; na página do produto a 1ª vem marcada
  const swatches = (p, cls = '', def) => {
    const sel = pickedColor[p.id] ?? def;
    return `<div class="swatches ${cls}" role="radiogroup" aria-label="Cores">${p.colors.map((c, i) =>
      `<button class="swatch${sel === i ? ' on' : ''}" style="--c:${c.hex}" data-p="${p.id}" data-i="${i}" role="radio" aria-checked="${sel === i}" aria-label="${c.name}" title="${c.name}"></button>`).join('')}</div>`;
  };

  const card = (p, extra = '') => `
    <article class="card${extra}">
      <a href="#/produto/${p.id}" class="card__img"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
      <h3>${p.name}</h3>
      ${p.colors.length > 1 ? swatches(p) : `<p class="card__price">${brl(p.price)}</p>`}
      <a href="#/produto/${p.id}" class="btn btn--sm">Ver produto ${arrow}</a>
    </article>`;

  const categoriesRow = () => `
    <div class="cats">${CATEGORIES.map(c => `
      <a href="#/categoria/${c.slug}" class="cat"><span class="cat__img"><img src="${c.img}" alt="" loading="lazy"></span><span>${c.name}</span></a>`).join('')}
    </div>`;

  document.addEventListener('click', e => {
    const s = e.target.closest('.swatch'); if (!s) return;
    pickedColor[s.dataset.p] = +s.dataset.i;
    $$(`.swatch[data-p="${s.dataset.p}"]`).forEach(b => { const on = +b.dataset.i === +s.dataset.i; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const lbl = $('#colorName'); if (lbl) lbl.textContent = byId(s.dataset.p).colors[+s.dataset.i].name;
  });

  /* ---------- Páginas ---------- */
  let heroTimer;
  const views = {
    home() {
      return `
      <section class="hero" aria-roledescription="carrossel">
        <div class="hero__track" id="heroTrack">
          ${HERO_SLIDES.map((s, i) => `
          <div class="slide slide--${s.layout}" style="--bg:${s.bg}" aria-label="${i + 1} de ${HERO_SLIDES.length}">
            <img class="slide__img" src="${s.img}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
            <div class="slide__text">
              <h1>${s.title}</h1>
              <p>${s.text}</p>
              <a href="${s.href}" class="btn">${s.cta} ${arrow}</a>
            </div>
          </div>`).join('')}
        </div>
        <div class="dots" id="heroDots">${HERO_SLIDES.map((_, i) => `<button aria-label="Slide ${i + 1}" data-i="${i}"></button>`).join('')}</div>
      </section>

      <section class="section wrap">
        <h2 class="title">Encontre o que combina com você</h2>
        ${categoriesRow()}
      </section>

      <section class="section wrap">
        <h2 class="title">Destaques da loja</h2>
        <div class="grid">${PRODUCTS.filter(p => p.featured).map(p => card(p, p.featured === 'desktop' ? ' only-desktop' : '')).join('')}</div>
      </section>`;
    },
    categorias() {
      return `
      <section class="section wrap page">
        <h1 class="title">Categorias</h1>
        ${categoriesRow()}
      </section>
      <section class="section wrap">
        <h2 class="title">Todos os produtos</h2>
        <div class="grid">${PRODUCTS.map(p => card(p)).join('')}</div>
      </section>`;
    },
    categoria(slug) {
      const c = CATEGORIES.find(c => c.slug === slug);
      if (!c) return views.notfound();
      const list = PRODUCTS.filter(p => p.category === slug);
      return `
      <section class="section wrap page">
        <a href="#/categorias" class="back">← Categorias</a>
        <h1 class="title">${c.name}</h1>
        <div class="chips">${CATEGORIES.map(x => `<a href="#/categoria/${x.slug}" class="chip${x.slug === slug ? ' on' : ''}">${x.name}</a>`).join('')}</div>
        <div class="grid">${list.map(p => card(p)).join('') || '<p class="empty">Em breve.</p>'}</div>
      </section>`;
    },
    produto(id) {
      const p = byId(id);
      if (!p) return views.notfound();
      const ci = pickedColor[p.id] ?? 0;
      const cat = CATEGORIES.find(c => c.slug === p.category);
      return `
      <section class="section wrap page product">
        <a href="#/categoria/${p.category}" class="back">← ${cat.name}</a>
        <div class="product__grid">
          <div class="product__img"><img src="${p.img}" alt="${p.name}"></div>
          <div class="product__info">
            <h1>${p.name}</h1>
            <p class="product__price">${brl(p.price)}</p>
            <p class="product__install">ou 12x de ${brl(p.price / 12)} no cartão</p>
            <p class="product__desc">${p.desc}</p>
            <div class="opt"><span class="opt__label">Cor: <b id="colorName">${p.colors[ci].name}</b></span>${swatches(p, 'swatches--lg', 0)}</div>
            ${p.storage ? `<div class="opt"><span class="opt__label">Armazenamento</span><div class="chips" id="storage">${p.storage.map((s, i) => `<button class="chip${i ? '' : ' on'}" data-s="${s}">${s}</button>`).join('')}</div></div>` : ''}
            <div class="product__actions">
              <button class="btn btn--block" id="addBtn">Adicionar à sacola</button>
              <a class="btn btn--block btn--ghost" id="buyWa" target="_blank" rel="noopener">Comprar pelo WhatsApp ${arrow}</a>
            </div>
          </div>
        </div>
      </section>
      <section class="section wrap">
        <h2 class="title">Você também pode gostar</h2>
        <div class="grid">${PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map(p => card(p)).join('')}</div>
      </section>`;
    },
    contato() {
      return `
      <section class="section wrap page">
        <h1 class="title">Fale com a gente</h1>
        <p class="lead">Tire dúvidas, consulte estoque e faça seu pedido.</p>
        <div class="contact">
          <a class="contact__item" href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4V5Z"/></svg><span><strong>WhatsApp</strong><small>Resposta rápida</small></span>${arrow}</a>
          <a class="contact__item" href="https://instagram.com/${STORE.instagram}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/></svg><span><strong>Instagram</strong><small>@${STORE.instagram}</small></span>${arrow}</a>
          <div class="contact__item">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span><strong>Loja física</strong><small>${STORE.address}</small></span></div>
          <div class="contact__item">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg><span><strong>Horário</strong><small>${STORE.hours}</small></span></div>
        </div>
      </section>`;
    },
    notfound() {
      return `<section class="section wrap page"><h1 class="title">Página não encontrada</h1><a href="#/" class="btn">Voltar ao início ${arrow}</a></section>`;
    },
  };

  function initHero() {
    const track = $('#heroTrack'); if (!track) return;
    const dots = $$('#heroDots button'), slides = $$('.slide', track);
    let idx = 0;
    const set = i => {
      idx = i;
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      document.documentElement.style.setProperty('--head-bg', HERO_SLIDES[i].bg);
    };
    const go = i => track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    set(0);
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== idx) set(i);
    }, { passive: true });
    dots.forEach(d => d.onclick = () => { go(+d.dataset.i); restart(); });
    const restart = () => {
      clearInterval(heroTimer);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      heroTimer = setInterval(() => go((idx + 1) % slides.length), 5000);
    };
    track.addEventListener('pointerdown', restart);
    restart();
  }

  function initProduct(id) {
    const p = byId(id); if (!$('#addBtn')) return;
    const storage = () => $('#storage .chip.on')?.dataset.s;
    const color = () => p.colors[pickedColor[p.id] ?? 0].name;
    const updateWa = () => $('#buyWa').href = waLink(`Olá! Tenho interesse no ${p.name}${p.colors.length > 1 ? ' — ' + color() : ''}${storage() ? ' — ' + storage() : ''} (${brl(p.price)}).`);
    $('#storage')?.addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c) return;
      $$('#storage .chip').forEach(x => x.classList.toggle('on', x === c)); updateWa();
    });
    $$('.product .swatch').forEach(s => s.addEventListener('click', updateWa));
    $('#addBtn').onclick = () => addToCart(p.id, p.colors.length > 1 ? color() : '', storage() || '');
    updateWa();
  }

  /* ---------- Rotas ---------- */
  function route() {
    const [, name = '', param] = (location.hash || '#/').split('/');
    const view = name === '' ? 'home' : name;
    clearInterval(heroTimer);
    closeAll();
    app.innerHTML = (views[view] && view !== 'notfound' ? views[view] : views.notfound)(param && decodeURIComponent(param));
    document.body.dataset.view = view;
    if (view !== 'home') document.documentElement.style.removeProperty('--head-bg');
    const navKey = view === 'categoria' || view === 'produto' ? 'categorias' : view;
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey));
    window.scrollTo(0, 0);
    if (view === 'home') initHero();
    if (view === 'produto') initProduct(param);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', () => $('#header').classList.toggle('scrolled', scrollY > 8), { passive: true });
  renderCart();
  route();
})();
