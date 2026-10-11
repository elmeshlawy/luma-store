# Luma Store

A responsive fashion, accessories, and lifestyle storefront made with HTML5, CSS3, and vanilla JavaScript (ES6+). Product catalog data is centralized in `products.js`; the shopping bag and wishlist use browser `localStorage`. No framework, backend, or database is required.

## Run locally

Open `index.html` directly in a modern browser, or serve this folder with any static web server. For example, from this folder run `python -m http.server 8000` and visit `http://localhost:8000`.

## Static deployment

Upload the contents of this folder to any static host, including GitHub Pages, Netlify, or Cloudflare Pages. Set the publish/root directory to this folder. The site uses hash routes (`#/shop`, `#/cart`, and so on), so it does not need server-side routing or rewrite rules. Keep `index.html`, `styles.css`, `products.js`, and `app.js` together in the published directory.

## Included

- Home, shop, product detail, cart, wishlist, about, and not-found views.
- Search across product names, categories, colors, and descriptions; category filters and sorting.
- Add-to-bag, quantity controls, removal, subtotal/shipping estimate, and local cart persistence.
- Wishlist controls and local persistence; responsive mobile navigation and quick product view.
- Newsletter form feedback, accessible labels and status messages, keyboard-friendly native controls, reduced-motion support, and a skip link.

Checkout and newsletter signup provide frontend demo feedback only. Connect them to a service before accepting orders or subscriptions. Product photography and web fonts load from Unsplash and Google Fonts.
