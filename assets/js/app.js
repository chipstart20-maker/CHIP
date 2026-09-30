(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const icon = (name, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const arrow = icon('arrow', 'arrow');
  const byId = id => PRODUCTS.find(p => p.id === id);
  const waLink = msg => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`;
  const parcel = p => `${STORE.installments}x de ${brl(p.price / STORE.installments)}`;
  const pickedColor = {}; // cor escolhida por produto (cards e página)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sacola ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem('lc-cart')) || []; } catch { return []; } };
  let cart = load().filter(i => byId(i.id));
  const save = () => { try { localStorage.setItem('lc-cart', JSON.stringify(cart)); } catch {} renderCart(); };

  function addToCart(id, color, storage, qty = 1) {
    const found = cart.find(i => i.id === id && i.color === color && i.storage === storage);
    found ? (found.qty += qty) : cart.push({ id, color, storage, qty });
    save();
    toast(`${icon('check')} Adicionado à sacola`);
    bump();
  }

  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    $('#cartCount').textContent = count;
    const body = $('#cartBody');
    if (!cart.length) {
      body.innerHTML = `<div class="empty">
        <div class="empty__icon"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg></div>
        <p><strong>Sua sacola está vazia</strong><br>Que tal começar por um iPhone novo?</p>
        <a href="#/categoria/iphones" class="btn" data-close-link>Ver iPhones ${arrow}</a></div>`;
      return;
    }
    const total = cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    body.innerHTML = `
      <ul class="cart__list">${cart.map((i, idx) => {
        const p = byId(i.id);
        return `<li class="cart__item">
          <a href="#/produto/${p.id}" class="cart__thumb" data-close-link><img src="${p.img}" alt=""></a>
          <div class="cart__info">
            <strong>${p.name}</strong>
            <small>${[i.color, i.storage].filter(Boolean).join(' · ')}</small>
            <div class="cart__row">
              <div class="qty">
                <button data-qty="${idx}" data-d="-1" aria-label="Diminuir">−</button>
                <span>${i.qty}</span>
                <button data-qty="${idx}" data-d="1" aria-label="Aumentar">+</button>
              </div>
              <span class="cart__price">${brl(p.price * i.qty)}</span>
            </div>
          </div>
          <button class="icon-btn cart__remove" data-remove="${idx}" aria-label="Remover">${icon('x')}</button>
        </li>`;
      }).join('')}</ul>
      <div class="cart__foot">
        <div class="cart__total"><span>Total</span><strong>${brl(total)}</strong></div>
        <small class="cart__note">ou ${STORE.installments}x de ${brl(total / STORE.installments)} no cartão</small>
        <a class="btn btn--block btn--wa" target="_blank" rel="noopener" href="${waLink(checkoutMsg(total))}">${icon('wa')} Finalizar pelo WhatsApp</a>
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
  function toast(html) { const t = $('#toast'); t.innerHTML = html; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000); }

  /* ---------- Drawers / busca ---------- */
  const overlay = $('#overlay');
  function open(el) { closeAll(); el.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('lock'); }
  function closeAll() { $$('.drawer.open, .search.open').forEach(d => d.classList.remove('open')); overlay.classList.remove('show'); document.body.classList.remove('lock'); }
  $('#menuBtn').onclick = () => open($('#menuDrawer'));
  $('#cartBtn').onclick = () => open($('#cartDrawer'));
  $('#searchBtn').onclick = () => { open($('#search')); setTimeout(() => $('#searchInput').focus(), 150); doSearch($('#searchInput').value); };
  overlay.onclick = closeAll;
  $$('[data-close]').forEach(b => b.onclick = closeAll);
  document.addEventListener('keydown', e => e.key === 'Escape' && closeAll());

  $('#menuLinks').innerHTML = `
    <a href="#/">Início ${arrow}</a>
    <span class="drawer__label">Categorias</span>
    ${CATEGORIES.map(c => `<a href="#/categoria/${c.slug}"><img src="${c.img}" alt="">${c.name}${arrow}</a>`).join('')}
    <span class="drawer__label">Atendimento</span>
    <a href="#/contato">Contato e endereço ${arrow}</a>
    <a href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener" class="btn btn--block btn--wa drawer__wa">${icon('wa')} Falar no WhatsApp</a>`;
  $('#menuLinks').addEventListener('click', e => e.target.closest('a') && closeAll());

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function doSearch(q) {
    const n = norm(q.trim());
    const list = PRODUCTS.filter(p => !n || norm(p.name + ' ' + p.category + ' ' + p.desc).includes(n));
    $('#searchResults').innerHTML = (n ? '' : '<span class="search__label">Sugestões</span>') + (list.length
      ? list.map(p => `<a href="#/produto/${p.id}" class="result"><img src="${p.img}" alt=""><span><strong>${p.name}</strong><small>${brl(p.price)}</small></span>${arrow}</a>`).join('')
      : `<p class="empty">Nenhum produto encontrado para “${q}”.<br><a href="${waLink('Olá! Vocês têm ' + q + '?')}" target="_blank" rel="noopener">Pergunte no WhatsApp</a></p>`);
  }
  $('#searchInput').addEventListener('input', e => doSearch(e.target.value));
  $('#searchResults').addEventListener('click', e => e.target.closest('a[href^="#"]') && closeAll());

  $('#waFab').href = waLink('Olá! Vim pelo site da Leandro Celulares.');

  /* ---------- Componentes ---------- */
  // nos cards nenhuma cor aparece marcada até o cliente escolher; na página do produto a 1ª vem marcada
  const swatches = (p, cls = '', def) => {
    const sel = pickedColor[p.id] ?? def;
    return `<div class="swatches ${cls}" role="radiogroup" aria-label="Cores">${p.colors.map((c, i) =>
      `<button class="swatch${sel === i ? ' on' : ''}" style="--c:${c.hex}" data-p="${p.id}" data-i="${i}" role="radio" aria-checked="${sel === i}" aria-label="${c.name}" title="${c.name}"></button>`).join('')}</div>`;
  };

  const card = (p, extra = '') => `
    <article class="card${extra}">
      ${p.badge ? `<span class="tag">${p.badge}</span>` : ''}
      <a href="#/produto/${p.id}" class="card__img" aria-label="${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
      <h3><a href="#/produto/${p.id}">${p.name}</a></h3>
      ${p.colors.length > 1 ? swatches(p) : '<div class="swatches-gap"></div>'}
      <p class="card__price"><span>a partir de</span> ${brl(p.price)}</p>
      <a href="#/produto/${p.id}" class="btn btn--sm">Ver produto ${arrow}</a>
    </article>`;

  const mini = p => `
    <a href="#/produto/${p.id}" class="mini">
      <span class="mini__img"><img src="${p.img}" alt="" loading="lazy"></span>
      <span class="mini__name">${p.name}</span>
      <span class="mini__price">${brl(p.price)}</span>
      <span class="mini__parc">ou ${parcel(p)}</span>
    </a>`;

  const categoriesRow = () => `
    <div class="cats">${CATEGORIES.map(c => `
      <a href="#/categoria/${c.slug}" class="cat"><span class="cat__img"><img src="${c.img}" alt="" loading="lazy"></span><span>${c.name}</span></a>`).join('')}
    </div>`;

  const perks = (cls = '') => `
    <div class="perks ${cls}">${PERKS.map(k => `
      <div class="perk"><span class="perk__icon">${icon(k.icon)}</span><span><strong>${k.title}</strong><small>${k.text}</small></span></div>`).join('')}
    </div>`;

  document.addEventListener('click', e => {
    const s = e.target.closest('.swatch'); if (!s) return;
    pickedColor[s.dataset.p] = +s.dataset.i;
    $$(`.swatch[data-p="${s.dataset.p}"]`).forEach(b => { const on = +b.dataset.i === +s.dataset.i; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const lbl = $('#colorName'); if (lbl) lbl.textContent = byId(s.dataset.p).colors[+s.dataset.i].name;
  });

  /* ---------- Rodapé ---------- */
  $('#footer').innerHTML = `
    <div class="wrap footer__grid">
      <div class="footer__brand">
        <img src="assets/img/logo.png" alt="Leandro Celulares">
        <p>iPhones e acessórios com procedência, garantia e atendimento de verdade.</p>
        <div class="footer__social">
          <a href="https://instagram.com/${STORE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('insta')}</a>
          <a href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a>
        </div>
      </div>
      <div class="footer__col">
        <h4>Loja</h4>
        ${CATEGORIES.map(c => `<a href="#/categoria/${c.slug}">${c.name}</a>`).join('')}
      </div>
      <div class="footer__col">
        <h4>Atendimento</h4>
        <a href="#/contato">Contato</a>
        <span>${STORE.hours}</span>
        <span>${STORE.address}</span>
      </div>
    </div>
    <div class="wrap footer__bottom">
      <span>© ${new Date().getFullYear()} ${STORE.name}. Todos os direitos reservados.</span>
      <span class="footer__pay"><b>Pix</b><b>Crédito</b><b>Débito</b></span>
    </div>`;

  /* ---------- Páginas ---------- */
  let heroTimer;
  const views = {
    home() {
      return `
      <section class="hero" aria-roledescription="carrossel">
        <div class="hero__track" id="heroTrack">
          ${HERO_SLIDES.map((s, i) => `
          <div class="slide slide--${s.layout}" style="--bg:${s.bg}" aria-label="${i + 1} de ${HERO_SLIDES.length}">
            <div class="slide__media"><img class="slide__img" src="${s.img}"${s.srcset ? ` srcset="${s.srcset}" sizes="(min-width: 900px) 70vw, 100vw"` : ''} alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>
            <div class="slide__text">
              <h1>${s.title}</h1>
              <p>${s.text}</p>
              <a href="${s.href}" class="btn">${s.cta} ${arrow}</a>
            </div>
          </div>`).join('')}
        </div>
        <div class="dots" id="heroDots">${HERO_SLIDES.map((_, i) => `<button aria-label="Slide ${i + 1}" data-i="${i}"></button>`).join('')}</div>
      </section>

      <section class="section wrap reveal">
        <h2 class="title">Encontre o que combina com você</h2>
        ${categoriesRow()}
      </section>

      <section class="section wrap reveal">
        <h2 class="title">Destaques da loja</h2>
        <div class="grid">${PRODUCTS.filter(p => p.featured).map(p => card(p, p.featured === 'desktop' ? ' only-desktop' : '')).join('')}</div>
      </section>

      <section class="section wrap reveal">
        ${perks()}
      </section>

      <section class="section reveal">
        <div class="wrap section__head">
          <h2 class="title">Mais procurados</h2>
          <a href="#/categorias" class="link">Ver tudo ${arrow}</a>
        </div>
        <div class="rail">${PRODUCTS.map(mini).join('')}</div>
      </section>

      <section class="section wrap reveal">
        <div class="promo">
          <div class="promo__text">
            <span class="eyebrow">Troca facilitada</span>
            <h2>Seu iPhone usado<br>vale desconto.</h2>
            <p>Traga seu aparelho, avaliamos na hora e o valor entra como parte do pagamento do novo.</p>
            <a href="${waLink('Olá! Quero avaliar meu iPhone usado para troca.')}" target="_blank" rel="noopener" class="btn btn--light">Avaliar meu iPhone ${arrow}</a>
          </div>
          <img class="promo__img" src="assets/img/promo-iphone.png" alt="" loading="lazy">
        </div>
      </section>

      <section class="section wrap reveal">
        <div class="visit">
          <div>
            <span class="eyebrow eyebrow--dark">Loja física</span>
            <h2 class="title">Venha conhecer a Leandro</h2>
            <ul class="visit__list">
              <li>${icon('pin')}<span><strong>${STORE.address}</strong><small>${STORE.city}</small></span></li>
              <li>${icon('clock')}<span><strong>${STORE.hours}</strong><small>Atendimento também pelo WhatsApp</small></span></li>
            </ul>
          </div>
          <div class="visit__actions">
            <a class="btn btn--block btn--wa" href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener">${icon('wa')} Chamar no WhatsApp</a>
            <a class="btn btn--block btn--ghost" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.address + ' ' + STORE.city)}" target="_blank" rel="noopener">Como chegar ${arrow}</a>
          </div>
        </div>
      </section>`;
    },
    categorias() {
      return `
      <section class="section wrap page">
        <h1 class="title title--xl">Categorias</h1>
        ${categoriesRow()}
      </section>
      <section class="section wrap reveal">
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
        <h1 class="title title--xl">${c.name}</h1>
        <div class="chips chips--scroll">${CATEGORIES.map(x => `<a href="#/categoria/${x.slug}" class="chip${x.slug === slug ? ' on' : ''}">${x.name}</a>`).join('')}</div>
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
        <nav class="crumbs"><a href="#/">Início</a><span>/</span><a href="#/categoria/${p.category}">${cat.name}</a><span>/</span><b>${p.name}</b></nav>
        <div class="product__grid">
          <div class="product__img">
            ${p.badge ? `<span class="tag">${p.badge}</span>` : ''}
            <img src="${p.img}" alt="${p.name}">
          </div>
          <div class="product__info">
            <h1>${p.name}</h1>
            <p class="product__desc">${p.desc}</p>
            <div class="price-box">
              <p class="product__price">${brl(p.price)}</p>
              <p class="product__install">ou ${parcel(p)} no cartão</p>
            </div>
            <div class="opt"><span class="opt__label">Cor: <b id="colorName">${p.colors[ci].name}</b></span>${swatches(p, 'swatches--lg', 0)}</div>
            ${p.storage ? `<div class="opt"><span class="opt__label">Armazenamento</span><div class="chips" id="storage">${p.storage.map((s, i) => `<button class="chip${i ? '' : ' on'}" data-s="${s}">${s}</button>`).join('')}</div></div>` : ''}
            <div class="product__actions" id="actions">
              <button class="btn btn--block" id="addBtn">Adicionar à sacola</button>
              <a class="btn btn--block btn--wa" id="buyWa" target="_blank" rel="noopener">${icon('wa')} Comprar pelo WhatsApp</a>
            </div>
            ${perks('perks--list')}
            ${p.specs ? `<details class="specs" open><summary>Especificações</summary><dl>${p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></details>` : ''}
          </div>
        </div>
      </section>
      <section class="section reveal">
        <div class="wrap section__head"><h2 class="title">Você também pode gostar</h2></div>
        <div class="rail">${PRODUCTS.filter(x => x.id !== p.id).map(mini).join('')}</div>
      </section>
      <div class="buybar" id="buybar">
        <div><strong>${brl(p.price)}</strong><small>ou ${parcel(p)}</small></div>
        <button class="btn" id="addBtn2">Adicionar à sacola</button>
      </div>`;
    },
    contato() {
      return `
      <section class="section wrap page">
        <h1 class="title title--xl">Fale com a gente</h1>
        <p class="lead">Tire dúvidas, consulte estoque e faça seu pedido. Respondemos rapidinho.</p>
        <div class="contact">
          <a class="contact__item contact__item--wa" href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener">
            <span class="contact__icon">${icon('wa')}</span><span><strong>WhatsApp</strong><small>Resposta rápida</small></span>${arrow}</a>
          <a class="contact__item" href="https://instagram.com/${STORE.instagram}" target="_blank" rel="noopener">
            <span class="contact__icon">${icon('insta')}</span><span><strong>Instagram</strong><small>@${STORE.instagram}</small></span>${arrow}</a>
          <a class="contact__item" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.address + ' ' + STORE.city)}" target="_blank" rel="noopener">
            <span class="contact__icon">${icon('pin')}</span><span><strong>Loja física</strong><small>${STORE.address} · ${STORE.city}</small></span>${arrow}</a>
          <div class="contact__item">
            <span class="contact__icon">${icon('clock')}</span><span><strong>Horário</strong><small>${STORE.hours}</small></span></div>
        </div>
      </section>
      <section class="section wrap reveal">${perks()}</section>`;
    },
    notfound() {
      return `<section class="section wrap page"><h1 class="title title--xl">Página não encontrada</h1><p class="lead">O link pode estar errado ou o produto saiu do catálogo.</p><a href="#/" class="btn">Voltar ao início ${arrow}</a></section>`;
    },
  };

  function initHero() {
    const track = $('#heroTrack'); if (!track) return;
    const dots = $$('#heroDots button'), slides = $$('.slide', track);
    let idx = -1;
    const set = i => {
      if (i === idx) return;
      idx = i;
      dots.forEach((d, j) => d.classList.toggle('on', j === i));
      slides.forEach((s, j) => s.classList.toggle('active', j === i));
      document.documentElement.style.setProperty('--head-bg', HERO_SLIDES[i].bg);
    };
    const go = i => track.scrollTo({ left: slides[i].offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    set(0);
    track.addEventListener('scroll', () => set(Math.round(track.scrollLeft / track.clientWidth)), { passive: true });
    dots.forEach(d => d.onclick = () => { go(+d.dataset.i); restart(); });
    const restart = () => {
      clearInterval(heroTimer);
      if (reduced) return;
      heroTimer = setInterval(() => document.visibilityState === 'visible' && go((idx + 1) % slides.length), 5500);
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
    const add = () => addToCart(p.id, p.colors.length > 1 ? color() : '', storage() || '');
    $('#addBtn').onclick = add;
    $('#addBtn2').onclick = add;
    updateWa();
    // barra de compra fixa aparece quando os botões principais saem da tela
    const bar = $('#buybar');
    new IntersectionObserver(([e]) => bar.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe($('#actions'));
  }

  function initReveal() {
    const els = $$('.reveal');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Rotas ---------- */
  function route() {
    const [, name = '', param] = (location.hash || '#/').split('/');
    const view = name === '' ? 'home' : name;
    clearInterval(heroTimer);
    closeAll();
    app.innerHTML = (views[view] && view !== 'notfound' ? views[view] : views.notfound)(param && decodeURIComponent(param));
    app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
    document.body.dataset.view = view;
    if (view !== 'home') document.documentElement.style.removeProperty('--head-bg');
    const navKey = view === 'categoria' || view === 'produto' ? 'categorias' : view;
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey));
    const p = view === 'produto' && byId(param);
    document.title = p ? `${p.name} — ${STORE.name}` : `${STORE.name} — iPhones e acessórios`;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (view === 'home') initHero();
    if (view === 'produto') initProduct(param);
    initReveal();
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', () => $('#header').classList.toggle('scrolled', scrollY > 8), { passive: true });
  renderCart();
  route();
})();
