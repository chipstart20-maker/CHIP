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

  /* ---------- Favoritos ---------- */
  let favs = (() => { try { return JSON.parse(localStorage.getItem('lc-favs')) || []; } catch { return []; } })().filter(byId);
  const isFav = id => favs.includes(id);
  function toggleFav(id) {
    favs = isFav(id) ? favs.filter(x => x !== id) : [...favs, id];
    try { localStorage.setItem('lc-favs', JSON.stringify(favs)); } catch {}
    $$(`[data-fav="${id}"]`).forEach(b => { b.classList.toggle('on', isFav(id)); b.setAttribute('aria-pressed', isFav(id)); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
    if (isFav(id)) toast(`${icon('heart')} Salvo nos favoritos`);
    renderFavs();
  }
  function renderFavs() {
    $('#favCount').textContent = favs.length;
    $('#favCount').classList.toggle('show', favs.length > 0);
    $('#favBody').innerHTML = favs.length ? `<ul class="cart__list">${favs.map(id => { const p = byId(id); return `
      <li class="cart__item">
        <a href="#/produto/${p.id}" class="cart__thumb" data-close-link><img src="${p.img}" alt=""></a>
        <div class="cart__info"><strong>${p.name}</strong><small>${brl(p.price)} à vista</small>
          <div class="cart__row"><a href="#/produto/${p.id}" class="btn btn--sm" data-close-link>Comprar ${arrow}</a></div></div>
        <button class="icon-btn cart__remove" data-fav="${p.id}" aria-label="Remover dos favoritos">${icon('x')}</button>
      </li>`; }).join('')}</ul>`
      : `<div class="empty"><div class="empty__icon">${icon('heart')}</div><p><strong>Nenhum favorito ainda</strong><br>Toque no ♥ dos produtos para salvar aqui.</p><a href="#/ofertas" class="btn" data-close-link>Ver ofertas ${arrow}</a></div>`;
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]'); if (!f) return;
    e.preventDefault(); toggleFav(f.dataset.fav);
  });
  $('#favBody').addEventListener('click', e => e.target.closest('[data-close-link]') && closeAll());

  function bump() { const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  let toastT;
  function toast(html) { const t = $('#toast'); t.innerHTML = html; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000); }

  /* ---------- Drawers / busca ---------- */
  const overlay = $('#overlay');
  function open(el) { closeAll(); el.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('lock'); }
  function closeAll() { $$('.drawer.open, .search.open').forEach(d => d.classList.remove('open')); overlay.classList.remove('show'); setMenu(false); document.body.classList.remove('lock'); }
  function setMenu(on) {
    const btn = $('#menuBtn');
    document.body.classList.toggle('menu-open', on);
    btn.setAttribute('aria-expanded', on);
    btn.setAttribute('aria-label', on ? 'Fechar menu' : 'Abrir menu');
    $('#menu').setAttribute('aria-hidden', !on);
    if (on) { document.body.classList.add('lock'); $('#header').classList.remove('hide'); }
  }
  $('#menuBtn').onclick = () => { const on = !document.body.classList.contains('menu-open'); closeAll(); setMenu(on); };
  $('#cartBtn').onclick = () => open($('#cartDrawer'));
  $('#favBtn').onclick = () => open($('#favDrawer'));
  $('#navMenu').onclick = () => $('#menuBtn').click();
  $('#searchBtn').onclick = () => { open($('#search')); setTimeout(() => $('#searchInput').focus(), 150); doSearch($('#searchInput').value); };
  overlay.onclick = closeAll;
  $$('[data-close]').forEach(b => b.onclick = closeAll);
  document.addEventListener('keydown', e => e.key === 'Escape' && closeAll());

  // menu em tela cheia (celular)
  $('#menuLinks').innerHTML = `
    <span class="menu__label" style="--d:0">Categorias</span>
    <div class="menu__cats">${CATEGORIES.map((c, i) => `
      <a href="#/categoria/${c.slug}" class="menu__cat" style="--d:${i + 1}"><img src="${c.img}" alt=""><span>${c.name}</span>${arrow}</a>`).join('')}
    </div>
    <div class="menu__links">
      <a href="#/" style="--d:5">Início ${arrow}</a>
      <a href="#/categorias" style="--d:6">Todos os produtos ${arrow}</a>
      <a href="#/lancamentos" style="--d:7">Lançamentos <span class="tag tag--inline">Novo</span>${arrow}</a>
      <a href="#/ofertas" style="--d:8">Ofertas ${arrow}</a>
      <a href="#/contato" style="--d:8">Contato e endereço ${arrow}</a>
    </div>
    <div class="menu__cta" style="--d:9">
      <a href="${waLink('Olá! Vim pelo site.')}" target="_blank" rel="noopener" class="btn btn--block btn--wa">${icon('wa')} Falar no WhatsApp</a>
      <a href="https://instagram.com/${STORE.instagram}" target="_blank" rel="noopener" class="btn btn--block btn--ghost">${icon('insta')} @${STORE.instagram}</a>
    </div>
    <p class="menu__info" style="--d:10">${icon('clock')} ${STORE.hours}<br>${icon('pin')} ${STORE.address}</p>`;
  $('#menuLinks').addEventListener('click', e => e.target.closest('a') && closeAll());

  // mega menu (computador)
  $('#mega').innerHTML = `
    <div class="mega__cats">${CATEGORIES.map(c => `
      <a href="#/categoria/${c.slug}" class="mega__cat"><span class="mega__img"><img src="${c.img}" alt=""></span><strong>${c.name}</strong><small>${(n => `${n} ${n === 1 ? 'produto' : 'produtos'}`)(PRODUCTS.filter(p => p.category === c.slug).length)}</small></a>`).join('')}
    </div>
    <a href="#/produto/iphone-16" class="mega__feature">
      <span class="tag tag--inline">Novo</span>
      <strong>iPhone 16</strong><small>Chegou na Leandro</small>
      <img src="assets/img/iphone-16.png" alt="">
    </a>`;
  $('#mega').addEventListener('click', e => { if (e.target.closest('a')) { const d = $('.nav-drop'); d.classList.add('closed'); setTimeout(() => d.classList.remove('closed'), 400); } });

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

  const off = p => p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const favBtn = (p, cls = '') => `<button class="fav ${cls}${isFav(p.id) ? ' on' : ''}" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="Favoritar ${p.name}">${icon('heart')}</button>`;

  const card = (p, extra = '') => {
    const ci = pickedColor[p.id] ?? 0;
    return `
    <article class="card${extra}">
      ${p.oldPrice ? `<p class="card__off">Até ${brl(p.oldPrice - p.price).replace(',00', '')} OFF</p>` : p.badge ? `<p class="card__off card__off--new">${p.badge}</p>` : '<p class="card__off card__off--empty">&nbsp;</p>'}
      ${favBtn(p, 'card__fav')}
      <h3><a href="#/produto/${p.id}">${p.name}</a></h3>
      <a href="#/produto/${p.id}" class="card__img" aria-label="${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
      <p class="card__color" data-color-label="${p.id}">${p.colors[ci].name}</p>
      ${swatches(p, 'swatches--sq', 0)}
      <div class="card__prices">
        ${p.oldPrice ? `<p class="card__old"><s>${brl(p.oldPrice)}</s><b class="pct">-${off(p)}%</b></p>` : '<p class="card__old">&nbsp;</p>'}
        <p class="card__price"><strong>${brl(p.price)}</strong> à vista</p>
        <p class="card__parc">ou em até ${parcel(p)}</p>
      </div>
      <a href="#/produto/${p.id}" class="btn btn--block card__buy">Comprar</a>
    </article>`;
  };

  // card grande do carrossel de ofertas
  const offerCard = (o, i) => {
    const p = byId(o.id); if (!p) return '';
    const [inst, cents] = (p.price / STORE.installments).toFixed(2).split('.');
    return `
    <article class="offer" style="--g1:${o.glow[0]};--g2:${o.glow[1]}" data-i="${i}">
      <h3 class="offer__title">${o.title}</h3>
      <p class="offer__sub">${o.sub}</p>
      <a href="#/produto/${p.id}" class="offer__media" aria-label="${p.name}"><span class="offer__glow"></span><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
      ${favBtn(p, 'offer__fav')}
      <div class="offer__foot">
        <div class="offer__price">
          <span class="offer__name">${p.name}${p.oldPrice ? ` <b class="pct">-${off(p)}%</b>` : ''}</span>
          <span class="offer__inst"><small>${STORE.installments}x<br>R$</small><strong>${Number(inst).toLocaleString('pt-BR')}</strong><sup>,${cents}</sup></span>
          <span class="offer__total">ou ${brl(p.price)} à vista</span>
        </div>
        <div class="offer__cta">
          <span class="offer__coupon">${STORE.pixNote}</span>
          <a href="#/produto/${p.id}" class="btn btn--block">Comprar</a>
        </div>
      </div>
    </article>`;
  };

  const mini = p => `
    <a href="#/produto/${p.id}" class="mini">
      <span class="mini__img"><img src="${p.img}" alt="" loading="lazy"></span>
      <span class="mini__name">${p.name}</span>
      <span class="mini__price">${brl(p.price)}</span>
      <span class="mini__parc">ou ${parcel(p)}</span>
    </a>`;

  const categoriesRow = () => `
    <div class="cats">${CATEGORIES.map((c, i) => `
      <a href="#/categoria/${c.slug}" class="cat" style="--i:${i}"><span class="cat__img"><img src="${c.img}" alt="" loading="lazy"></span><span class="cat__name">${c.name}</span></a>`).join('')}
    </div>`;

  const perks = (cls = '') => `
    <div class="perks ${cls}">${PERKS.map(k => `
      <div class="perk"><span class="perk__icon">${icon(k.icon)}</span><span><strong>${k.title}</strong><small>${k.text}</small></span></div>`).join('')}
    </div>`;

  const P3D = PRODUCTS.find(p => p.model3d);
  const show3d = () => !P3D ? '' : `
      <section class="section wrap reveal">
        <div class="show3d">
          <div class="show3d__text">
            <span class="eyebrow">Experiência 3D</span>
            <h2>${P3D.name} em<br>todos os ângulos.</h2>
            <p>Arraste para girar e toque nas cores para ver cada acabamento.</p>
            <div class="show3d__colors" role="radiogroup" aria-label="Cor do modelo 3D">${P3D.colors.map((c, i) =>
              `<button class="swatch${i ? '' : ' on'}" style="--c:${c.hex}" data-3d="${i}" role="radio" aria-checked="${!i}" aria-label="${c.name}"></button>`).join('')}
              <span class="show3d__name" id="name3d">${P3D.colors[0].name}</span></div>
            <a href="#/produto/${P3D.id}" class="btn btn--light">Ver ${P3D.name} ${arrow}</a>
          </div>
          <div class="stage3d" id="stage3d">
            <img class="stage3d__fallback" src="${P3D.img}" alt="${P3D.name}">
            <span class="stage3d__hint"><svg viewBox="0 0 24 24"><path d="M7 9 3.5 12 7 15M17 9l3.5 3L17 15M4 12h16"/></svg>Arraste para girar</span>
          </div>
        </div>
      </section>`;

  // carrega o 3D (Three.js) só quando a área chega perto da tela
  let viewer3d = null;
  function load3d(stage, product, colorIndex = 0) {
    if (!stage || stage.dataset.loading) return;
    stage.dataset.loading = '1';
    const url = new URL('assets/js/phone3d.min.js', document.baseURI).href;
    import(url).then(m => {
      if (!stage.isConnected) return;
      const c = product.colors[colorIndex];
      viewer3d = m.mount(stage, { screen: product.model3d, color: c });
      stage.classList.add('ready');
    }).catch(() => stage.classList.add('failed'));
  }
  function watch3d(stage, product, colorIndex) {
    if (!stage) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); load3d(stage, product, colorIndex); } }, { rootMargin: '400px 0px' });
    io.observe(stage);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-3d]'); if (!b) return;
    const i = +b.dataset['3d'], c = P3D.colors[i];
    $$('[data-3d]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    $('#name3d').textContent = c.name;
    viewer3d?.setColor(c);
  });

  document.addEventListener('click', e => {
    const s = e.target.closest('.swatch'); if (!s) return;
    pickedColor[s.dataset.p] = +s.dataset.i;
    $$(`.swatch[data-p="${s.dataset.p}"]`).forEach(b => { const on = +b.dataset.i === +s.dataset.i; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const lbl = $('#colorName'); if (lbl) lbl.textContent = byId(s.dataset.p).colors[+s.dataset.i].name;
    $$(`[data-color-label="${s.dataset.p}"]`).forEach(l => l.textContent = byId(s.dataset.p).colors[+s.dataset.i].name);
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
          <div class="slide slide--${s.layout}" style="--bg:${s.bg};${s.glow ? `--glow:${s.glow}` : ''}" aria-label="${i + 1} de ${HERO_SLIDES.length}">
            <div class="slide__media">${s.items
              ? s.items.map((it, k) => `<img class="slide__item" src="${it.img}" alt="" style="right:${it.x}%;bottom:${it.y}%;height:${it.h}%;--r:${it.r}deg;--k:${k}">`).join('')
              : `<img class="slide__img" src="${s.img}"${s.srcset ? ` srcset="${s.srcset}" sizes="(min-width: 900px) 70vw, 100vw"` : ''} alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>`}</div>
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

      <section class="section offers-sec reveal">
        <div class="wrap section__head"><h2 class="title">Ofertas da semana</h2><a href="#/ofertas" class="link">Ver todas ${arrow}</a></div>
        <div class="offers" id="offers">${OFFERS.map(offerCard).join('')}</div>
        <div class="pager" id="offersPager">${OFFERS.map((_, i) => `<button aria-label="Oferta ${i + 1}" data-i="${i}"${i ? '' : ' class="on"'}></button>`).join('')}</div>
      </section>

      <section class="section wrap reveal">
        <h2 class="title">Destaques da loja</h2>
        <div class="grid">${PRODUCTS.filter(p => p.featured).map(p => card(p, p.featured === 'desktop' ? ' only-desktop' : '')).join('')}</div>
      </section>

      ${show3d()}

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
          <img class="promo__img" src="assets/img/iphone-15-pro.png" alt="" loading="lazy">
        </div>
      </section>

      <div class="marquee" aria-hidden="true">
        <div class="marquee__track">${Array(2).fill(MARQUEE.map(w => `<span>${w}</span><i>✦</i>`).join('')).join('')}</div>
      </div>

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
    ofertas() {
      const list = PRODUCTS.filter(p => p.oldPrice).sort((a, b) => off(b) - off(a));
      return `
      <section class="section wrap page">
        <span class="eyebrow">Preços especiais</span>
        <h1 class="title title--xl">Ofertas</h1>
        <p class="lead">Economize em iPhones e acessórios selecionados.</p>
        <div class="grid">${list.map(p => card(p)).join('')}</div>
      </section>`;
    },
    acessorios() {
      const list = PRODUCTS.filter(p => p.category !== 'iphones');
      return `
      <section class="section wrap page">
        <h1 class="title title--xl">Acessórios</h1>
        <div class="chips chips--scroll">${CATEGORIES.filter(c => c.slug !== 'iphones').map(x => `<a href="#/categoria/${x.slug}" class="chip">${x.name}</a>`).join('')}</div>
        <div class="grid">${list.map(p => card(p)).join('')}</div>
      </section>`;
    },
    lancamentos() {
      const list = PRODUCTS.filter(p => p.isNew);
      return `
      <section class="section wrap page">
        <span class="eyebrow">Novidades</span>
        <h1 class="title title--xl">Lançamentos</h1>
        <p class="lead">Os modelos mais recentes que chegaram na Leandro.</p>
        <div class="grid">${list.map(p => card(p)).join('')}</div>
      </section>
      ${show3d()}`;
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
          <div class="product__img${p.model3d ? ' has3d' : ''}" id="productMedia">
            ${p.badge ? `<span class="tag">${p.badge}</span>` : ''}
            <img src="${p.img}" alt="${p.name}">
            ${p.model3d ? `<div class="stage3d stage3d--product" id="productStage"><span class="stage3d__hint"><svg viewBox="0 0 24 24"><path d="M7 9 3.5 12 7 15M17 9l3.5 3L17 15M4 12h16"/></svg>Arraste para girar</span></div>
            <div class="view-toggle" role="tablist"><button class="on" data-view="photo" role="tab">Foto</button><button data-view="3d" role="tab"><b>3D</b> Girar</button><span class="view-toggle__pill"></span></div>` : ''}
          </div>
          <div class="product__info">
            <div class="product__title"><h1>${p.name}</h1>${favBtn(p, 'fav--lg')}</div>
            <p class="product__desc">${p.desc}</p>
            <div class="price-box">
              ${p.oldPrice ? `<p class="card__old"><s>${brl(p.oldPrice)}</s><b class="pct">-${off(p)}%</b></p>` : ''}
              <p class="product__price">${brl(p.price)} <small>à vista</small></p>
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

  function initOffers() {
    const track = $('#offers'); if (!track) return;
    const cards = $$('.offer', track), dots = $$('#offersPager button');
    const current = () => { const c = track.scrollLeft + track.clientWidth / 2; let best = 0, d = 1e9;
      cards.forEach((el, i) => { const m = Math.abs(el.offsetLeft + el.offsetWidth / 2 - c); if (m < d) { d = m; best = i; } }); return best; };
    const set = () => { const i = current(); dots.forEach((d, j) => d.classList.toggle('on', j === i)); cards.forEach((c, j) => c.classList.toggle('active', j === i)); };
    track.addEventListener('scroll', () => requestAnimationFrame(set), { passive: true });
    dots.forEach(d => d.onclick = () => { const c = cards[+d.dataset.i]; track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); });
    set();
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
    // alternar entre foto e 3D
    const media = $('#productMedia');
    $$('.view-toggle button').forEach(b => b.onclick = () => {
      const is3d = b.dataset.view === '3d';
      $$('.view-toggle button').forEach(x => x.classList.toggle('on', x === b));
      media.classList.toggle('show3d-on', is3d);
      if (is3d) load3d($('#productStage'), p, pickedColor[p.id] ?? 0);
    });
    if (p.model3d) $$('.product .swatch').forEach(s => s.addEventListener('click', () => viewer3d?.setColor(p.colors[+s.dataset.i])));
    const add = () => addToCart(p.id, p.colors.length > 1 ? color() : '', storage() || '');
    $('#addBtn').onclick = add;
    $('#addBtn2').onclick = add;
    updateWa();
    // barra de compra fixa aparece quando os botões principais saem da tela
    const bar = $('#buybar');
    new IntersectionObserver(([e]) => bar.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe($('#actions'));
  }

  // cards inclinam em 3D acompanhando o mouse, com reflexo de luz
  function initTilt() {
    if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.card, .mini__img, .perk').forEach(el => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
        el.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
        el.style.setProperty('--gx', `${x * 100}%`);
        el.style.setProperty('--gy', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  function splitTitles() {
    $$('.title:not(.split), .promo h2:not(.split), .show3d h2:not(.split)').forEach(t => {
      let i = 0;
      const walk = node => [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(w); return; }
            const o = document.createElement('span'); o.className = 'w';
            const inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--wi', i++);
            o.append(inner); frag.append(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
      walk(t); t.classList.add('split');
    });
  }

  function initReveal() {
    splitTitles();
    const els = $$('.reveal, .cats, .title.split, .promo h2, .show3d h2');
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
    viewer3d?.destroy(); viewer3d = null;
    closeAll();
    app.innerHTML = (views[view] && view !== 'notfound' ? views[view] : views.notfound)(param && decodeURIComponent(param));
    app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
    document.body.dataset.view = view;
    const prod = view === 'produto' && byId(param);
    const navKey = prod?.isNew || view === 'lancamentos' ? 'novidade' : view === 'categoria' || view === 'produto' ? 'categorias' : view;
    // item ativo na barra inferior
    const bottomKey = view === 'categoria' ? (param === 'iphones' ? 'iphones' : 'acessorios') : prod ? (prod.category === 'iphones' ? 'iphones' : 'acessorios') : view;
    $$('.header__nav [data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey));
    $$('.bottom-nav [data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === bottomKey));
    const p = view === 'produto' && byId(param);
    document.title = p ? `${p.name} — ${STORE.name}` : `${STORE.name} — iPhones e acessórios`;
    window.scrollTo({ top: 0, behavior: 'auto' });
    $('#header').classList.remove('hide');
    if (view === 'home') { initHero(); initOffers(); }
    if ($('#stage3d')) watch3d($('#stage3d'), P3D, 0);
    if (view === 'produto') initProduct(param);
    initReveal();
    initTilt();
  }

  window.addEventListener('hashchange', route);
  /* ---------- Cabeçalho ---------- */
  const header = $('#header'), progress = $('#progress');
  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 8);
    document.body.classList.toggle('show-top', y > innerHeight * 1.2);
    if (y > 40 && header.classList.contains('promo-open')) { header.classList.remove('promo-open'); $('#promoBtn').setAttribute('aria-expanded', false); }
    // esconde ao rolar para baixo, volta ao rolar para cima
    if (!document.body.classList.contains('lock')) {
      if (y > 140 && y - lastY > 6) header.classList.add('hide');
      else if (lastY - y > 6 || y < 140) header.classList.remove('hide');
    }
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    // parallax do banner e do iPhone da faixa de troca
    const hero = document.body.dataset.view === 'home' && $('.hero');
    if (hero && y < innerHeight * 1.3) hero.style.setProperty('--hp', Math.round(y));
    const promo = $('.promo');
    if (promo) { const r = promo.getBoundingClientRect(); promo.style.setProperty('--pp', Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height))).toFixed(3)); }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // barra de avisos girando
  $('#topbar').innerHTML = ANNOUNCEMENTS.map((m, i) => `<span class="topbar__item${i ? '' : ' on'}">${m.text}</span>`).join('');
  $('#promoPanel').innerHTML = `<div class="promobar__list">${ANNOUNCEMENTS.map(m => `<div class="promobar__row"><span class="perk__icon">${icon(m.icon)}</span><span><strong>${m.text}</strong><small>${m.detail}</small></span></div>`).join('')}</div>`;
  $('#promoBtn').onclick = () => {
    const on = !header.classList.contains('promo-open');
    header.classList.toggle('promo-open', on);
    $('#promoBtn').setAttribute('aria-expanded', on);
  };
  if (!reduced && ANNOUNCEMENTS.length > 1) {
    let ai = 0;
    setInterval(() => {
      const items = $$('.topbar__item');
      items[ai].classList.replace('on', 'out');
      const prev = items[ai];
      setTimeout(() => prev.classList.remove('out'), 600);
      ai = (ai + 1) % items.length;
      items[ai].classList.add('on');
    }, 3800);
  }

  // voltar ao topo
  $('#topFab').onclick = () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });

  // faixa de oferta
  const deal = $('#deal');
  let dealClosed = false; try { dealClosed = sessionStorage.getItem('lc-deal') === '1'; } catch {}
  $('#dealText').textContent = DEAL.text; $('#dealCta').textContent = DEAL.cta; $('#dealCta').href = waLink(DEAL.message);
  $('#dealClose').onclick = () => { deal.classList.remove('show'); document.body.classList.remove('has-deal'); try { sessionStorage.setItem('lc-deal', '1'); } catch {} dealClosed = true; };
  if (!dealClosed) setTimeout(() => { if (!dealClosed) { deal.classList.add('show'); document.body.classList.add('has-deal'); } }, 2500);

  $('#searchPill').onclick = () => $('#searchBtn').click();
  $('#headerWa').href = waLink('Olá! Vim pelo site da Leandro Celulares.');
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('#searchBtn').click(); }
  });
  renderCart();
  renderFavs();
  route();
})();
