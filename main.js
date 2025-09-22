function loadComponent(targetId, filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
            if (callback) callback();
        });
}

document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header', 'components/header.html');
    loadComponent('hero', 'components/hero.html');
    loadComponent('products-section', 'components/products-section.html');
    // loadComponent('footer', 'components/footer.html');

});

(function whenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
})(function init() {
  // ===== Classe e utilitários =====
  class Product {
    constructor({ id, name, category, price, oldPrice = null, rating = 0, image }) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.price = price;
      this.oldPrice = oldPrice;
      this.rating = rating;
      this.image = image;
    }
  }

  const toBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const stars = (n) => {
    const r = Math.max(0, Math.min(5, Math.round(n)));
    return `<span class="text-yellow-400">${'★'.repeat(r)}</span><span class="text-gray-300">${'☆'.repeat(5 - r)}</span>`;
  };

  // ===== Mock =====
  const MOCK = [
    new Product({ id: 1, name: 'Acer Aspire 5', category: 'Básico',   price: 2999, oldPrice: 3499, rating: 4.3, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' }),
    new Product({ id: 2, name: 'Lenovo IdeaPad 3', category: 'Básico',  price: 2799, oldPrice: 3199, rating: 4.1, image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&q=80' }),
    new Product({ id: 3, name: 'Dell XPS 13',     category: 'Ultrabook',price: 8999, oldPrice: 9999, rating: 4.8, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' }),
    new Product({ id: 4, name: 'MacBook Air M2',  category: 'Ultrabook',price:10999, oldPrice:11999, rating: 4.9, image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80' }),
    new Product({ id: 5, name: 'Asus TUF F15',    category: 'Gamer',    price: 6499, oldPrice: 6999, rating: 4.6, image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&q=80' }),
    new Product({ id: 6, name: 'Lenovo Legion 5', category: 'Gamer',    price: 7999, oldPrice: 8999, rating: 4.7, image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=800&q=80' }),
    new Product({ id: 7, name: 'Samsung Book Pro',category: 'Ultrabook',price: 5299,                  rating: 4.2, image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&q=80' }),
    new Product({ id: 8, name: 'HP Pavilion 15',  category: 'Básico',   price: 3199,                  rating: 4.0, image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80' }),
    new Product({ id: 9, name: 'Acer Nitro 5',    category: 'Gamer',    price: 5799,                  rating: 4.5, image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=800&q=80' }),
  ];

  // ===== Estado e refs =====
  let state = { search: '', category: 'all', sort: 'relevance' };

  const $grid     = document.getElementById('grid');
  const $info     = document.getElementById('result-info');
  const $search   = document.getElementById('search');
  const $category = document.getElementById('category');
  const $sort     = document.getElementById('sort');
  const $clear    = document.getElementById('clear-filters');

  // ===== Render =====
  function renderProducts(list) {
    if ($grid) {
      $grid.innerHTML = list.map(p => `
        <article class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
          <div class="relative aspect-[4/3] overflow-hidden">
            <img src="${p.image}" alt="${p.name}"
                 class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105">
            ${p.oldPrice ? `<span class="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">Promo</span>` : ''}
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-base font-semibold text-gray-900">${p.name}</h3>
              <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">${p.category}</span>
            </div>
            <div class="mt-1 text-sm text-yellow-500">${stars(p.rating)} <span class="ml-1 text-xs text-gray-500 align-middle">${p.rating.toFixed(1)}</span></div>
            <div class="mt-3 flex items-center gap-2">
              <span class="text-lg font-bold text-gray-900">${toBRL(p.price)}</span>
              ${p.oldPrice ? `<span class="text-sm text-gray-400 line-through">${toBRL(p.oldPrice)}</span>` : ''}
            </div>
            <button class="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-500 transition">
              Adicionar ao carrinho
            </button>
          </div>
        </article>
      `).join('');
    }
    if ($info) {
      $info.innerHTML = `Exibindo <span class="font-semibold">${list.length}</span> produto${list.length !== 1 ? 's' : ''}`;
    }
  }

  function getVisible() {
    let list = [...MOCK];
    if (state.search.trim()) {
      const q = state.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (state.category !== 'all') {
      list = list.filter(p => p.category === state.category);
    }
    switch (state.sort) {
      case 'price-asc':   list.sort((a,b) => a.price - b.price); break;
      case 'price-desc':  list.sort((a,b) => b.price - a.price); break;
      case 'name-asc':    list.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'rating-desc': list.sort((a,b) => b.rating - a.rating); break;
      default: break; // relevância = ordem original
    }
    return list;
  }

  // ===== Listeners (só se existir) =====
  if ($search)   $search.addEventListener('input',  (e) => { state.search  = e.target.value;  renderProducts(getVisible()); });
  if ($category) $category.addEventListener('change', (e) => { state.category = e.target.value; renderProducts(getVisible()); });
  if ($sort)     $sort.addEventListener('change', (e) => { state.sort    = e.target.value;   renderProducts(getVisible()); });
  if ($clear)    $clear.addEventListener('click',  () => {
    state = { search: '', category: 'all', sort: 'relevance' };
    if ($search)   $search.value   = '';
    if ($category) $category.value = 'all';
    if ($sort)     $sort.value     = 'relevance';
    renderProducts(getVisible());
  });

  // Primeira renderização
  renderProducts(getVisible());
});
