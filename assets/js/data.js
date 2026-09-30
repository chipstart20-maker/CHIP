/* Dados da loja — edite aqui preços, produtos e contatos. */
const STORE = {
  name: 'Leandro Celulares',
  whatsapp: '5500000000000', // DDI + DDD + número, só dígitos
  instagram: 'leandrocelulares',
  address: 'Rua Exemplo, 123 — Centro',
  city: 'Sua cidade — UF',
  hours: 'Seg a Sáb, 9h às 19h',
  installments: 12, // parcelas no cartão
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
    desc: 'Dynamic Island, câmera principal de 48 MP e conector USB‑C. Vidro colorido com acabamento fosco.',
    colors: [
      { name: 'Rosa', hex: '#f5cdd6' }, { name: 'Preto', hex: '#3a3a3c' },
      { name: 'Verde', hex: '#cfe3c8' }, { name: 'Amarelo', hex: '#f6ecb0' },
      { name: 'Azul', hex: '#c0d5ea' },
    ],
    storage: ['128 GB', '256 GB', '512 GB'],
    specs: [['Tela', '6,1" Super Retina XDR'], ['Chip', 'A16 Bionic'], ['Câmera', '48 MP + 12 MP'], ['Conector', 'USB‑C']],
  },
  {
    id: 'iphone-16', name: 'iPhone 16', category: 'iphones', featured: true, badge: 'Novo',
    img: 'assets/img/iphone-16.jpg', price: 5499,
    desc: 'Chip A18, botão Controle da Câmera e bateria que acompanha o seu dia inteiro.',
    colors: [
      { name: 'Ultramarino', hex: '#3d6be0', back: '#6f84ec', frame: '#4f63d2' },
      { name: 'Rosa', hex: '#e184b6', back: '#f2a9d0', frame: '#e27fb6' },
      { name: 'Preto', hex: '#3a3a3c', back: '#3b3c41', frame: '#2c2d31' },
      { name: 'Branco', hex: '#f4f4f4', back: '#f1f1ee', frame: '#d8d8d4' },
    ],
    model3d: 'assets/img/screen-iphone16.jpg', // tela usada no iPhone em 3D
    storage: ['128 GB', '256 GB', '512 GB'],
    specs: [['Tela', '6,1" Super Retina XDR'], ['Chip', 'A18'], ['Câmera', '48 MP Fusion + 12 MP'], ['Conector', 'USB‑C']],
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
    specs: [['Tela', '6,1" ProMotion'], ['Chip', 'A17 Pro'], ['Câmera', '48 MP + ultra-angular + teleobjetiva'], ['Estrutura', 'Titânio']],
  },
  {
    id: 'fone-jbl', name: 'Fone JBL Bluetooth', category: 'fones', featured: 'desktop',
    img: 'assets/img/cat-fones.jpg', price: 299,
    desc: 'Fone sem fio com estojo de carregamento, som JBL e conexão Bluetooth estável.',
    colors: [{ name: 'Branco', hex: '#f4f4f4' }],
    specs: [['Conexão', 'Bluetooth'], ['Estojo', 'Com carregamento'], ['Uso', 'Chamadas e música']],
  },
  {
    id: 'carregador-30w', name: 'Carregador USB‑C 30W', category: 'carregadores',
    img: 'assets/img/cat-carregadores.jpg', price: 149,
    desc: 'Carregamento rápido para iPhone e acessórios USB‑C.',
    colors: [{ name: 'Branco', hex: '#f4f4f4' }],
    specs: [['Potência', '30W'], ['Saída', 'USB‑C'], ['Compatível', 'iPhone 8 ou superior']],
  },
  {
    id: 'capinha-transparente', name: 'Capinha Transparente', category: 'capinhas',
    img: 'assets/img/cat-capinhas.jpg', price: 59,
    desc: 'Proteção anti-impacto que mostra a cor original do seu iPhone.',
    colors: [{ name: 'Transparente', hex: '#e9eef3' }],
    specs: [['Material', 'TPU flexível'], ['Proteção', 'Cantos reforçados'], ['Acabamento', 'Transparente']],
  },
];

const HERO_SLIDES = [
  {
    title: 'Tudo começa<br>com um novo<br>iPhone.', text: 'Encontre o seu na Leandro.',
    cta: 'Explorar iPhones', href: '#/categoria/iphones',
    img: 'assets/img/hero-iphone.jpg', srcset: 'assets/img/hero-iphone.jpg 1080w, assets/img/hero-iphone-hd.jpg 1920w',
    bg: '#e4e8f3', layout: 'full',
  },
  {
    title: 'iPhone 16.<br>Chegou na<br>Leandro.', text: 'Em várias cores e capacidades.',
    cta: 'Ver iPhone 16', href: '#/produto/iphone-16',
    img: 'assets/img/iphone-16.jpg', bg: '#eeedfd', layout: 'side',
  },
  {
    title: 'Acessórios<br>que completam<br>seu iPhone.', text: 'Fones, carregadores e capinhas.',
    cta: 'Ver acessórios', href: '#/categorias',
    img: 'assets/img/cat-fones.jpg', bg: '#f4f4f6', layout: 'side',
  },
];

// Diferenciais exibidos na home e na página do produto
const PERKS = [
  { icon: 'shield', title: 'Garantia', text: 'Aparelhos com garantia e nota fiscal' },
  { icon: 'card', title: `Até ${STORE.installments}x no cartão`, text: 'Ou desconto no Pix' },
  { icon: 'swap', title: 'Aceitamos seu usado', text: 'Avaliação na hora para troca' },
  { icon: 'truck', title: 'Entrega ou retirada', text: 'Receba rápido ou retire na loja' },
];

// Avisos que giram na barra preta do topo
const ANNOUNCEMENTS = [
  { icon: 'card', text: `Parcele em até ${STORE.installments}x no cartão` },
  { icon: 'swap', text: 'Aceitamos seu iPhone usado na troca' },
  { icon: 'wa', text: 'Atendimento rápido pelo WhatsApp' },
];

// Faixa animada da home
const MARQUEE = ['iPhones', 'Fones', 'Carregadores', 'Capinhas', 'Garantia', `Até ${STORE.installments}x`, 'Troca de usado'];
