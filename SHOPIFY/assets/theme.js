/**
 * Bloemen van De Gier - Shopify Theme
 * Layout & mobile menu & trust bar slideshow
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu
  const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mobileMenu.hidden;
      mobileMenu.hidden = !isOpen;
      mobileMenu.setAttribute('data-open', isOpen ? 'true' : 'false');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Trust bar slideshow (mobile)
  const slideshow = document.querySelector('[data-trust-bar-slideshow]');
  if (slideshow) {
    const track = slideshow.querySelector('.trust-bar__track');
    const slides = slideshow.querySelectorAll('.trust-bar__slide');
    const dotsContainer = slideshow.querySelector('[data-trust-bar-dots]');

    if (slides.length && dotsContainer) {
      let currentIndex = 0;

      slides.forEach(function(_, i) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'trust-bar__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Ga naar slide ' + (i + 1));
        dot.addEventListener('click', function() {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      });

      function goToSlide(index) {
        currentIndex = index;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
        dotsContainer.querySelectorAll('.trust-bar__dot').forEach(function(d, i) {
          d.classList.toggle('active', i === index);
        });
      }

      setInterval(function() {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
      }, 3000);
    }
  }

  // Product page thumbnail switcher
  document.querySelectorAll('.product-page__thumb').forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      var src = this.getAttribute('data-src');
      var mainImg = document.getElementById('ProductImage');
      if (src && mainImg) {
        mainImg.src = src;
        document.querySelectorAll('.product-page__thumb').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
      }
    });
  });

  // Cart drawer
  (function() {
    var drawer = document.getElementById('cart-drawer');
    var headerCount = document.querySelector('[data-header-cart-count]');

    function formatMoney(cents) {
      return (cents / 100).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
    }

    function updateHeaderCount(count) {
      if (headerCount) {
        headerCount.textContent = count > 0 ? count : '';
        headerCount.classList.toggle('header__cart-count--empty', count === 0);
      }
    }

    function renderCart(cart) {
      var itemsEl = document.getElementById('cart-drawer-items');
      var emptyEl = document.getElementById('cart-drawer-empty');
      var footerEl = document.getElementById('cart-drawer-footer');
      var countEl = document.getElementById('cart-drawer-count');
      var totalEl = document.getElementById('cart-drawer-total');

      if (!itemsEl) return;

      countEl.textContent = cart.item_count;
      totalEl.textContent = formatMoney(cart.total_price);
      updateHeaderCount(cart.item_count);

      if (cart.item_count === 0) {
        emptyEl.hidden = false;
        footerEl.hidden = true;
        itemsEl.innerHTML = '';
        return;
      }

      emptyEl.hidden = true;
      footerEl.hidden = false;

      var html = '';
      cart.items.forEach(function(item) {
        var imgSrc = item.image || '';
        var propsHtml = '';
        if (item.properties && Object.keys(item.properties).length) {
          for (var k in item.properties) {
            if (k.charAt(0) === '_') continue;
            var v = item.properties[k];
            if (v && v.length > 30) v = v.substring(0, 30) + '…';
            propsHtml += '<div class="cart-drawer-item__properties"><span class="cart-drawer-item__property-label">' + k + ':</span> ' + (v || '') + '</div>';
          }
        }
        html += '<div class="cart-drawer-item" data-key="' + item.key + '">';
        html += '<a href="' + item.url + '" class="cart-drawer-item__image">' + (imgSrc ? '<img src="' + imgSrc + '" alt="">' : '<div style="width:100%;height:100%;background:#f3f4f6"></div>') + '</a>';
        html += '<div class="cart-drawer-item__info">';
        html += '<a href="' + item.url + '" class="cart-drawer-item__title">' + item.product_title + '</a>';
        html += '<p class="cart-drawer-item__price">' + formatMoney(item.final_price) + '</p>' + propsHtml;
        html += '<div class="cart-drawer-item__actions" style="display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem">';
        html += '<div class="cart-drawer-item__qty"><button type="button" class="cart-drawer-item__qty-btn" data-drawer-minus data-key="' + item.key + '">−</button><span class="cart-drawer-item__qty-num">' + item.quantity + '</span><button type="button" class="cart-drawer-item__qty-btn" data-drawer-plus data-key="' + item.key + '">+</button></div>';
        html += '<button type="button" class="cart-drawer-item__remove" data-drawer-remove data-key="' + item.key + '" aria-label="Verwijderen"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>';
        html += '</div></div>';
        html += '<div class="cart-drawer-item__subtotal">' + formatMoney(item.final_line_price) + '</div></div>';
      });
      itemsEl.innerHTML = html;

      itemsEl.querySelectorAll('[data-drawer-minus]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var key = this.getAttribute('data-key');
          var row = itemsEl.querySelector('[data-key="' + key + '"]');
          var span = row ? row.querySelector('.cart-drawer-item__qty-num') : null;
          if (!span) return;
          var qty = parseInt(span.textContent, 10) || 1;
          var newQty = Math.max(0, qty - 1);
          fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, quantity: newQty }) })
            .then(function(r) { return r.json(); })
            .then(function(cart) { renderCart(cart); })
            .catch(function() { location.reload(); });
        });
      });

      itemsEl.querySelectorAll('[data-drawer-plus]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var key = this.getAttribute('data-key');
          var row = itemsEl.querySelector('[data-key="' + key + '"]');
          var span = row ? row.querySelector('.cart-drawer-item__qty-num') : null;
          if (!span) return;
          var qty = parseInt(span.textContent, 10) || 0;
          var newQty = Math.min(99, qty + 1);
          fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, quantity: newQty }) })
            .then(function(r) { return r.json(); })
            .then(function(cart) { renderCart(cart); })
            .catch(function() { location.reload(); });
        });
      });

      itemsEl.querySelectorAll('[data-drawer-remove]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var key = this.getAttribute('data-key');
          fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: key, quantity: 0 }) })
            .then(function(r) { return r.json(); })
            .then(function(cart) { renderCart(cart); })
            .catch(function() { location.reload(); });
        });
      });
    }

    function openDrawer() {
      if (!drawer) return;
      fetch('/cart.js').then(function(r) { return r.json(); }).then(function(cart) {
        renderCart(cart);
        drawer.setAttribute('data-open', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.setAttribute('data-open', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-cart-drawer-toggle]')) { e.preventDefault(); openDrawer(); }
      if (e.target.closest('[data-cart-drawer-close]')) closeDrawer();
    });
    var backdrop = drawer ? drawer.querySelector('.cart-drawer__backdrop') : null;
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && drawer && drawer.getAttribute('data-open') === 'true') closeDrawer();
    });

    if (drawer) window.bloemenCartDrawer = { open: openDrawer, close: closeDrawer };
  })();

});
