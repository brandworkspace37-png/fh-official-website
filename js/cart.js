document.addEventListener('DOMContentLoaded', () => {
    const cartButton = document.querySelector('.cart-button');
    if (!cartButton) return;

    const getCart = () => JSON.parse(localStorage.getItem('fhCart') || '[]');
    const saveCart = cart => localStorage.setItem('fhCart', JSON.stringify(cart));

    const drawer = document.createElement('aside');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `<div class="cart-drawer-panel"><div class="cart-drawer-head"><div><span>FORM & HALO</span><h2>Tu carrito.</h2></div><button type="button" class="cart-close" aria-label="Cerrar carrito">×</button></div><div class="cart-items"></div><div class="cart-empty">Tu carrito está vacío.</div><div class="cart-drawer-foot"><div><span>SUBTOTAL</span><strong class="cart-total">—</strong></div><button type="button" class="cart-checkout" disabled>Continuar al checkout</button></div></div>`;
    document.body.appendChild(drawer);

    const itemsEl = drawer.querySelector('.cart-items');
    const emptyEl = drawer.querySelector('.cart-empty');
    const totalEl = drawer.querySelector('.cart-total');
    const checkout = drawer.querySelector('.cart-checkout');
    const countEl = cartButton.querySelector('.cart-count');

    const render = () => {
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = count;
        countEl.setAttribute('aria-label', `${count} productos`);
        itemsEl.innerHTML = cart.map((item, index) => `<div class="cart-item"><div><span>PRODUCTO 01</span><h3>${item.product}</h3><p>Tamaño: ${item.size}</p></div><div class="cart-item-controls"><button type="button" data-action="minus" data-index="${index}">−</button><b>${item.quantity}</b><button type="button" data-action="plus" data-index="${index}">+</button><button type="button" class="cart-remove" data-action="remove" data-index="${index}">Eliminar</button></div></div>`).join('');
        emptyEl.hidden = cart.length > 0;
        itemsEl.hidden = cart.length === 0;
        totalEl.textContent = 'Pendiente';
        checkout.disabled = true;
    };

    const open = () => { render(); drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('cart-open'); };
    const close = () => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('cart-open'); };
    window.FHCart = { open, close, render };

    cartButton.addEventListener('click', open);
    drawer.querySelector('.cart-close').addEventListener('click', close);
    drawer.addEventListener('click', event => {
        if (event.target === drawer) { close(); return; }
        const control = event.target.closest('[data-action]');
        if (!control) return;
        const index = Number(control.dataset.index);
        const cart = getCart();
        if (!cart[index]) return;
        if (control.dataset.action === 'plus') cart[index].quantity += 1;
        if (control.dataset.action === 'minus') cart[index].quantity -= 1;
        if (control.dataset.action === 'remove' || cart[index].quantity <= 0) cart.splice(index, 1);
        saveCart(cart); render(); window.dispatchEvent(new Event('fh:cart-updated'));
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
    window.addEventListener('storage', render);
    render();
});
