const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.textContent = isOpen ? '×' : '☰';
  });
}

const rain = document.querySelector('.diamond-rain');
if (rain) {
  const diamondCount = window.innerWidth < 700 ? 22 : 42;
  for (let i = 0; i < diamondCount; i++) {
    const diamond = document.createElement('span');
    diamond.className = 'diamond';
    diamond.style.left = `${Math.random() * 100}%`;
    diamond.style.animationDuration = `${8 + Math.random() * 12}s`;
    diamond.style.animationDelay = `${Math.random() * -18}s`;
    diamond.style.width = `${5 + Math.random() * 7}px`;
    diamond.style.height = diamond.style.width;
    rain.appendChild(diamond);
  }
}

const revealItems = document.querySelectorAll('.section-reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

window.addEventListener('load', () => {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.background = 'linear-gradient(135deg, #fbf6ee, #ead8b7)';
      img.alt = 'Luxury jewellery image';
    });
  });
});

// Shopping bag and checkout system
const CART_KEY = 'solaraJewellyCart';
const formatMoney = (amount) => `$${Number(amount).toFixed(2).replace('.00', '')}`;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach((badge) => {
    badge.textContent = count;
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-id]');
    const product = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image
    };
    addToCart(product);
    button.textContent = 'Added ✓';
    button.classList.add('added');
    setTimeout(() => {
      button.textContent = 'Add to Bag';
      button.classList.remove('added');
    }, 1200);
  });
});

function renderCheckout() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;

  const cart = getCart();
  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-cart"><h3>Your bag is waiting.</h3><p>Add jewellery from the collection to see your checkout summary here.</p><a class="btn ghost" href="collections.html">Shop Collections</a></div>`;
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>${formatMoney(item.price)}</p>
          <div class="quantity-controls" aria-label="Quantity controls for ${item.name}">
            <button type="button" class="qty-minus">−</button>
            <span>${item.quantity}</span>
            <button type="button" class="qty-plus">+</button>
          </div>
        </div>
        <strong>${formatMoney(item.price * item.quantity)}</strong>
        <button type="button" class="remove-item" aria-label="Remove ${item.name}">×</button>
      </article>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.13;
  const total = subtotal + tax;
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
  if (taxEl) taxEl.textContent = formatMoney(tax);
  if (totalEl) totalEl.textContent = formatMoney(total);
}

document.addEventListener('click', (event) => {
  const row = event.target.closest('.cart-item');
  if (!row) return;
  const id = row.dataset.id;
  let cart = getCart();
  const item = cart.find((piece) => piece.id === id);
  if (!item) return;

  if (event.target.classList.contains('qty-plus')) {
    item.quantity += 1;
  }
  if (event.target.classList.contains('qty-minus')) {
    item.quantity -= 1;
    if (item.quantity <= 0) cart = cart.filter((piece) => piece.id !== id);
  }
  if (event.target.classList.contains('remove-item')) {
    cart = cart.filter((piece) => piece.id !== id);
  }
  saveCart(cart);
  renderCheckout();
});

const clearCartButton = document.querySelector('.clear-cart');
if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    saveCart([]);
    renderCheckout();
  });
}

const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.getElementById('form-message');
    if (getCart().length === 0) {
      message.textContent = 'Please add at least one piece to your bag before placing a checkout request.';
      message.className = 'form-message error';
      return;
    }
    message.textContent = 'Your checkout request has been prepared. Payment connection can be added when SolaraJewelly is ready to sell online.';
    message.className = 'form-message success';
    orderForm.reset();
  });
}

updateCartCount();
renderCheckout();
