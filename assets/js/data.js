/* Dados da loja — edite aqui preços, produtos e contatos. */
const STORE = {
  name: 'Leandro Celulares',
  whatsapp: '5500000000000', // DDI + DDD + número, só dígitos
  instagram: 'leandrocelulares',
  address: 'Rua Exemplo, 123 — Centro',
  hours: 'Seg a Sáb, 9h às 19h',
};

const CATEGORIES = [
  { slug: 'iphones', name: 'iPhones', img: 'assets/img/cat-iphones.jpg' },
  { slug: 'fones', name: 'Fones', img: 'assets/img/cat-fones.jpg' },
  { slug: 'carregadores', name: 'Carregadores', img: 'assets/img/cat-carregadores.jpg' },
  { slug: 'capinhas', name: 'Capinhas', img: 'assets/img/cat-capinhas.jpg' },
];

// featured: true = aparece em "Destaques" sempre; 'desktop' = só em telas grandes
const PRODUCTS = [
  {
    id: 'iphone-15', name: 'iPhone 15', category: 'iphones', featured: true,
    img: 'assets/img/iphone-15.jpg', price: 4299,
    desc: 'Dynamic Island, câmera de 48 MP e USB‑C. Design em vidro colorido com acabamento fosco.',
    colors: [
      { name: 'Rosa', hex: '#f5cdd6' }, { name: 'Preto', hex: '#3a3a3c' },
      { name: 'Verde', hex: '#cfe3c8' }, { name: 'Amarelo', hex: '#f6ecb0' },
      { name: 'Azul', hex: '#c0d5ea' },
    ],
    storage: ['128 GB', '256 GB', '512 GB'],
  },
  {
    id: 'iphone-16', name: 'iPhone 16', category: 'iphones', featured: true,
    img: 'assets/img/iphone-16.jpg', price: 5499,
    desc: 'Chip A18, botão de Controle da Câmera e bateria que dura o dia todo.',
    colors: [
      { name: 'Ultramarino', hex: '#3d6be0' }, { name: 'Rosa', hex: '#e184b6' },
      { name: 'Preto', hex: '#3a3a3c' }, { name: 'Branco', hex: '#f4f4f4' },
    ],
    storage: ['128 GB', '256 GB', '512 GB'],
  },
  {
    id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'iphones', featured: 'desktop',
    img: 'assets/img/cat-iphones.jpg', price: 6199,
    desc: 'Estrutura em titânio, chip A17 Pro e sistema de câmeras Pro.',
    colors: [
      { name: 'Titânio natural', hex: '#bdb6aa' }, { name: 'Titânio preto', hex: '#3b3b3d' },
      { name: 'Titânio branco', hex: '#ecebe7' }, { name: 'Titânio azul', hex: '#3f4a5c' },
    ],
    storage: ['128 GB', '256 GB', '512 GB', '1 TB'],
  },
  {
    id: 'fone-jbl', name: 'Fone JBL Bluetooth', category: 'fones', featured: 'desktop',
    img: 'assets/img/cat-fones.jpg', price: 299,
    desc: 'Fone sem fio com estojo de carregamento, som JBL e conexão Bluetooth estável.',
    colors: [{ name: 'Branco', hex: '#f4f4f4' }],
  },
  {
    id: 'carregador-30w', name: 'Carregador USB‑C 30W', category: 'carregadores',
    img: 'assets/img/cat-carregadores.jpg', price: 149,
    desc: 'Carregamento rápido para iPhone e acessórios USB‑C.',
    colors: [{ name: 'Branco', hex: '#f4f4f4' }],
  },
  {
    id: 'capinha-transparente', name: 'Capinha Transparente', category: 'capinhas',
    img: 'assets/img/cat-capinhas.jpg', price: 59,
    desc: 'Proteção antiimpacto que mostra a cor original do seu iPhone.',
    colors: [{ name: 'Transparente', hex: '#e9eef3' }],
  },
];

const HERO_SLIDES = [
  {
    title: 'Tudo começa<br>com um novo<br>iPhone.', text: 'Encontre o seu na Leandro.',
    cta: 'Explorar iPhones', href: '#/categoria/iphones',
    img: 'assets/img/hero-iphone.jpg', bg: '#e4e8f3', layout: 'full',
  },
  {
    title: 'iPhone 16.<br>Chegou na<br>Leandro.', text: 'Em várias cores e capacidades.',
    cta: 'Ver iPhone 16', href: '#/produto/iphone-16',
    img: 'assets/img/iphone-16.jpg', bg: '#eeedfd', layout: 'side',
  },
  {
    title: 'Acessórios<br>que completam<br>seu iPhone.', text: 'Fones, carregadores e capinhas.',
    cta: 'Ver acessórios', href: '#/categorias',
    img: 'assets/img/cat-fones.jpg', bg: '#ffffff', layout: 'side',
  },
];
