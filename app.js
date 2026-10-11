(() => {
  'use strict';
  const products = window.LUMA_PRODUCTS || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const money = amount => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(amount);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  let cart = read('luma-cart', []);
  cart = Array.isArray(cart) ? cart.filter(item => item && products.some(p => p.id === item.id) && Number.isFinite(item.qty) && item.qty > 0).map(item => ({id:item.id,qty:Math.min(99,Math.floor(item.qty))})) : [];
  let wishlist = read('luma-wishlist', []);
  wishlist = Array.isArray(wishlist) ? [...new Set(wishlist.filter(id => products.some(p => p.id === id)))] : [];
  let shopState = {category:'All', sort:'featured', query:''};
  let toastTimer;

  function save() { try { localStorage.setItem('luma-cart', JSON.stringify(cart)); localStorage.setItem('luma-wishlist', JSON.stringify(wishlist)); } catch { /* The storefront remains usable when storage is unavailable. */ } updateBadges(); }
  function updateBadges() {
    $('.cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    $('.wishlist-count').textContent = wishlist.length;
  }
  function notify(message) { const box = $('.toast'); box.textContent = message; box.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('show'), 2400); }
  function productCard(product) {
    const saved = wishlist.includes(product.id);
    return `<article class="product-card"><div class="product-image-wrap"><a href="#/product/${product.id}" aria-label="View ${product.name}"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"></a><span class="product-tag">${product.tag}</span><button class="heart-button ${saved?'active':''}" data-action="wishlist" data-id="${product.id}" aria-label="${saved?'Remove from':'Add to'} wishlist: ${product.name}" aria-pressed="${saved}">${saved?'♥':'♡'}</button></div><div class="product-info"><div><a class="product-name" href="#/product/${product.id}">${product.name}</a><div class="product-meta">${product.color}</div></div><span class="product-price">${money(product.price)}</span></div><button class="quick-add" data-action="quick" data-id="${product.id}">Quick add +</button></article>`;
  }
  function productGrid(items) { return items.length ? `<div class="product-grid">${items.map(productCard).join('')}</div>` : `<div class="empty-state"><h2>Nothing here just yet.</h2><p>Try another search or take a look at everything we have.</p><a class="button" href="#/shop">Shop all</a></div>`; }
  function home() {
    const favorites = products.slice(0,4);
    return `<section class="hero"><img class="hero-image" src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=90" alt="A considered wardrobe in warm, natural tones"><div class="hero-content"><span class="eyebrow">A softer sort of everyday</span><h1>Find your<br>everyday.</h1><p>Good things, thoughtfully chosen. Meet the little details that make a day feel like yours.</p><a class="button light" href="#/shop">Shop the collection <span aria-hidden="true">→</span></a></div></section><section class="section"><div class="section-heading"><div><span class="eyebrow">The good things</span><h2>Little things, loved well.</h2><p>Our most reached-for pieces, for very good reason.</p></div><a class="underlined" href="#/shop">Shop all</a></div>${productGrid(favorites)}</section><div class="promise-strip"><div><strong>Thoughtfully chosen</strong><span>Fewer things, better made</span></div><div><strong>Made to be kept</strong><span>Everyday, and then some</span></div><div><strong>Sent with care</strong><span>Free shipping over $100</span></div></div><section class="editorial"><img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85" alt="A calm and considered living space" loading="lazy"><div class="editorial-copy"><span class="eyebrow">A little more intention</span><h2>Good design.<br>Good feeling.</h2><p>We believe the things around us should earn their place. Luma brings together small-batch makers and everyday objects with a little more thought behind them.</p><a class="button outline" href="#/about">Get to know us <span aria-hidden="true">→</span></a></div></section>`;
  }
  function shop() {
    const categories = ['All', ...new Set(products.map(p=>p.category))];
    let shown = products.filter(p => (shopState.category==='All' || p.category===shopState.category) && (!shopState.query || `${p.name} ${p.category} ${p.color} ${p.description}`.toLowerCase().includes(shopState.query.toLowerCase())));
    if(shopState.sort==='price-low') shown.sort((a,b)=>a.price-b.price);
    if(shopState.sort==='price-high') shown.sort((a,b)=>b.price-a.price);
    if(shopState.sort==='name') shown.sort((a,b)=>a.name.localeCompare(b.name));
    return `<div class="page-shell"><p class="breadcrumb"><a href="#/">Home</a> / Shop</p><span class="eyebrow">A good place to start</span><h1 class="page-heading">Shop all the good things.</h1><div class="filter-chips" aria-label="Filter by category">${categories.map(c=>`<button class="chip ${shopState.category===c?'active':''}" data-action="filter" data-category="${c}" aria-pressed="${shopState.category===c}">${c}</button>`).join('')}</div><div class="shop-toolbar"><span>${shown.length} considered ${shown.length===1?'thing':'things'}${shopState.query?` for “${shopState.query.replace(/[<>]/g,'')}”`:''}</span><div class="shop-controls"><label for="sort-products">Sort by</label><select id="sort-products"><option value="featured" ${shopState.sort==='featured'?'selected':''}>Featured</option><option value="price-low" ${shopState.sort==='price-low'?'selected':''}>Price: low to high</option><option value="price-high" ${shopState.sort==='price-high'?'selected':''}>Price: high to low</option><option value="name" ${shopState.sort==='name'?'selected':''}>Name</option></select></div></div>${productGrid(shown)}</div>`;
  }
  function productPage(id) {
    const p = products.find(item=>item.id===id);
    if(!p) return notFound();
    const saved = wishlist.includes(p.id);
    return `<div class="page-shell"><p class="breadcrumb"><a href="#/">Home</a> / <a href="#/shop">${p.category}</a> / ${p.name}</p><div class="product-layout"><div class="product-gallery"><img src="${p.image}" alt="${p.name}" fetchpriority="high"></div><section class="product-detail"><span class="eyebrow">${p.tag}</span><h1>${p.name}</h1><div class="detail-price">${money(p.price)}</div><p class="detail-description">${p.description}</p><div class="detail-label">Color</div><span class="variant-pill">${p.color}</span><div class="purchase-row"><div class="qty-control"><button data-action="detail-qty" data-step="-1" aria-label="Decrease quantity">−</button><input class="detail-qty" value="1" inputmode="numeric" aria-label="Quantity" min="1" max="99"><button data-action="detail-qty" data-step="1" aria-label="Increase quantity">+</button></div><button class="button" data-action="add" data-id="${p.id}">Add to bag — ${money(p.price)}</button></div><button class="text-button" style="margin-top:15px;padding:8px 0" data-action="wishlist" data-id="${p.id}" aria-pressed="${saved}">${saved?'♥ Saved to wishlist':'♡ Add to wishlist'}</button><div class="detail-label">A few good details</div><ul class="detail-list">${p.details.map(d=>`<li>${d}</li>`).join('')}</ul><p class="product-meta">A small note: free shipping on orders over $100.</p></section></div></div>`;
  }
  function cartPage() {
    if(!cart.length) return `<div class="page-shell"><p class="breadcrumb"><a href="#/">Home</a> / Your bag</p><div class="empty-state"><span class="eyebrow">Your bag</span><h2>Room for something good.</h2><p>Your bag is taking a little breather. Let's find it something lovely.</p><a class="button" href="#/shop">Explore the shop</a></div></div>`;
    const total = cart.reduce((sum,item)=>sum+item.qty*products.find(p=>p.id===item.id).price,0);
    return `<div class="page-shell"><p class="breadcrumb"><a href="#/">Home</a> / Your bag</p><span class="eyebrow">Nearly yours</span><h1 class="page-heading">Your bag.</h1><div class="cart-layout"><div class="cart-items">${cart.map(item=>{const p=products.find(x=>x.id===item.id);return `<article class="cart-item"><a href="#/product/${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a><div><h3><a href="#/product/${p.id}">${p.name}</a></h3><p>${p.color}</p><div class="qty-control"><button data-action="cart-qty" data-id="${p.id}" data-step="-1" aria-label="Decrease ${p.name} quantity">−</button><span style="padding:0 9px;font-size:11px" aria-label="Quantity ${item.qty}">${item.qty}</span><button data-action="cart-qty" data-id="${p.id}" data-step="1" aria-label="Increase ${p.name} quantity">+</button></div><button class="remove-button" data-action="remove" data-id="${p.id}">Remove</button></div><span class="product-price">${money(p.price*item.qty)}</span></article>`}).join('')}</div><aside class="cart-summary"><h2>A little summary</h2><div class="summary-row"><span>Subtotal</span><span>${money(total)}</span></div><div class="summary-row"><span>Shipping</span><span>${total>=100?'On us':'Calculated at checkout'}</span></div><div class="summary-row summary-total"><span>Total</span><span>${money(total)}</span></div><button class="button" data-action="checkout">Continue to checkout →</button><p class="summary-note">Taxes and shipping calculated at checkout.</p><a class="underlined" href="#/shop">Keep looking</a></aside></div></div>`;
  }
  function wishlistPage() {
    const saved = products.filter(p=>wishlist.includes(p.id));
    return `<div class="page-shell"><p class="breadcrumb"><a href="#/">Home</a> / Your wishlist</p><span class="eyebrow">Saved for later</span><h1 class="page-heading">Your good things.</h1>${productGrid(saved)}</div>`;
  }
  function about() { return `<section class="about-hero"><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85" alt="A warm, lived-in home"><div><span class="eyebrow">A note from us</span><h1>Less, but a little more lovely.</h1><p>For the things we use, keep, and come back to.</p></div></section><div class="about-copy"><span class="eyebrow">Hello, we're Luma</span><h2>Good things should feel good.</h2><p>We started Luma with a simple thought: the everyday deserves a little more care. So we look for small makers, considered materials, and useful pieces that feel just right — and we bring them together in one happy place.</p><p>We are a small independent shop, choosing each object as if it were going into our own home. Not more for the sake of more. Just the good things, made thoughtfully, for real life.</p><a class="button" href="#/shop">Find your everyday →</a><div id="shipping" style="padding-top:65px"><span class="eyebrow">The practical bits</span><h2>Shipping & returns</h2><p>We offer complimentary standard shipping on orders over $100. Orders are packed with care and usually leave us within two business days. Changed your mind? Unused items can be returned within 30 days. Write to <a href="mailto:hello@lumastore.example">hello@lumastore.example</a> and we'll help.</p></div><div id="faq"><h2>A few questions</h2><details class="faq-row"><summary>Where do you ship?</summary><p>This demo shop is a frontend concept. For a real order, we would confirm your delivery location at checkout.</p></details><details class="faq-row"><summary>How do I care for my new thing?</summary><p>Care notes are listed on each product page. If something is unclear, send us a note and we'll be glad to help.</p></details><details class="faq-row"><summary>Can I change or cancel an order?</summary><p>Reach out as soon as you can. We pack orders quickly and will do our best to catch yours in time.</p></details></div></div>`; }
  function notFound() { return `<div class="page-shell"><div class="empty-state"><span class="eyebrow">A little detour</span><h2>We can't find that thing.</h2><p>The page may have moved, but there are plenty of good things to discover.</p><a class="button" href="#/">Back to the good things</a></div></div>`; }
  function render() {
    const raw = location.hash.slice(1) || '/';
    const [route, queryString=''] = raw.split('?');
    const [path, routeAnchor] = route.split('#');
    const params = new URLSearchParams(queryString);
    const main = $('#main');
    if(path==='/') main.innerHTML=home();
    else if(path==='/shop') { if(params.has('category')) shopState.category=params.get('category'); if(params.has('q')) shopState.query=params.get('q'); main.innerHTML=shop(); }
    else if(path.startsWith('/product/')) main.innerHTML=productPage(decodeURIComponent(path.slice(9)));
    else if(path==='/cart') main.innerHTML=cartPage();
    else if(path==='/wishlist') main.innerHTML=wishlistPage();
    else if(path==='/about') main.innerHTML=about();
    else main.innerHTML=notFound();
    $('.mobile-nav').classList.remove('open'); $('.menu-toggle').setAttribute('aria-expanded','false');
    updateBadges(); window.scrollTo({top:0,behavior:'instant'});
    if(routeAnchor) setTimeout(()=>document.getElementById(routeAnchor)?.scrollIntoView(),80);
  }
  function addToCart(id, quantity=1) {
    const existing=cart.find(item=>item.id===id);
    if(existing) existing.qty=Math.min(99,existing.qty+quantity); else cart.push({id,qty:Math.min(99,quantity)});
    save(); notify(`${products.find(p=>p.id===id)?.name} added to your bag.`);
  }
  document.addEventListener('click', event => {
    const button=event.target.closest('[data-action]'); if(!button) return;
    const {action,id}=button.dataset;
    if(action==='wishlist') { wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id]; save(); render(); notify(wishlist.includes(id)?'Saved for later.':'Removed from your wishlist.'); }
    if(action==='add') addToCart(id,Math.max(1,Math.min(99,parseInt($('.detail-qty')?.value,10)||1)));
    if(action==='quick') { const p=products.find(x=>x.id===id); const dialog=$('.quick-dialog'); dialog.innerHTML=`<div class="quick-content"><button class="icon-button quick-close" aria-label="Close quick view">×</button><img src="${p.image}" alt="${p.name}"><div><span class="eyebrow">${p.tag}</span><h2 style="font:500 36px var(--serif);margin:12px 0">${p.name}</h2><span>${money(p.price)}</span><p class="detail-description">${p.description}</p><button class="button" data-action="quick-add" data-id="${id}">Add to bag</button><p><a class="underlined" href="#/product/${id}">View full details</a></p></div></div>`; dialog.showModal(); }
    if(action==='quick-add') { addToCart(id); $('.quick-dialog').close(); }
    if(action==='filter') { shopState.category=button.dataset.category; render(); }
    if(action==='cart-qty') { const item=cart.find(x=>x.id===id); item.qty=Math.max(1,Math.min(99,item.qty+Number(button.dataset.step))); save(); render(); }
    if(action==='remove') { cart=cart.filter(x=>x.id!==id); save(); render(); notify('Removed from your bag.'); }
    if(action==='detail-qty') { const input=$('.detail-qty'); input.value=Math.max(1,Math.min(99,(parseInt(input.value,10)||1)+Number(button.dataset.step))); }
    if(action==='checkout') notify('Thanks for exploring Luma — checkout is a demo in this frontend.');
  });
  document.addEventListener('change', event => { if(event.target.id==='sort-products') {shopState.sort=event.target.value;render();} });
  document.addEventListener('submit', event => {
    if(event.target.matches('.search-bar')) {event.preventDefault();const q=$('#site-search').value.trim();shopState.query=q;shopState.category='All';location.hash=`/shop${q?'?q='+encodeURIComponent(q):''}`;$('.search-bar').classList.remove('open');}
    if(event.target.matches('.newsletter-form')) {event.preventDefault();event.target.querySelector('.form-feedback').textContent='You’re on the list. Look out for a little hello from us.';event.target.reset();}
  });
  $('.menu-toggle').addEventListener('click',()=>{const nav=$('.mobile-nav');const open=nav.classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  $('.search-toggle').addEventListener('click',()=>{$('.search-bar').classList.toggle('open');if($('.search-bar').classList.contains('open'))$('#site-search').focus();});
  $('.search-close').addEventListener('click',()=>$('.search-bar').classList.remove('open'));
  $('.quick-dialog').addEventListener('click',event=>{if(event.target===event.currentTarget||event.target.closest('.quick-close'))event.currentTarget.close();});
  window.addEventListener('hashchange',render);
  $('#year').textContent=new Date().getFullYear();
  updateBadges(); render();
})();
