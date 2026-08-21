document.addEventListener('DOMContentLoaded', () => {
    const productCard = document.querySelector('#producto .product-card:not(.product-placeholder)');
    const grid = document.querySelector('#producto .product-grid');
    if (!productCard || !grid) return;

    const imageBox = productCard.querySelector('.product-main');
    const description = productCard.querySelector('.product-description');
    if (!imageBox || !description) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'product-details-button';
    button.textContent = 'Ver detalles';
    description.appendChild(button);

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="product-modal-panel" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <button class="product-modal-close" type="button" aria-label="Cerrar">×</button>
            <div class="product-modal-content">
                <div class="product-modal-gallery">
                    <div class="product-gallery-label"><span>FORM & HALO</span><span>PRODUCTO 01</span></div>
                    <div class="product-modal-main-image"><img src="assets/oficial%20principal.png" alt="Catrina Mexicana LED"></div>
                    <div class="product-modal-thumbs">
                        <button type="button" class="is-active"><img src="assets/oficial%20principal.png" alt="Vista principal"></button>
                        <button type="button"><img src="assets/la%20catrina%20oficial%201.png" alt="Vista 1"></button>
                        <button type="button"><img src="assets/la%20catrina%20oficial%202.png" alt="Vista 2"></button>
                        <button type="button"><img src="assets/oficial%20la%20catrina%20product%203.png" alt="Vista 3"></button>
                        <button type="button"><img src="assets/oficial%20la%20catrina%20product%204.png" alt="Vista 4"></button>
                    </div>
                    <p class="product-view-note">Desliza o selecciona una imagen para explorar la pieza.</p>
                </div>
                <div class="product-modal-info">
                    <span class="product-modal-eyebrow">COLECCIÓN MEXICANA · 01</span>
                    <h2 id="product-modal-title">Catrina Mexicana <span>LED.</span></h2>
                    <p class="product-modal-lead">Una pieza creada para convertir una pared en parte de la experiencia. La tradición mexicana toma forma y se encuentra con la luz.</p>
                    <div class="product-choice-block">
                        <span class="product-choice-label">ELIGE TU TAMAÑO</span>
                        <div class="product-size-options" role="group" aria-label="Seleccionar tamaño">
                            <button type="button" data-size="Small">Small</button><button type="button" data-size="Medium" class="is-selected">Medium</button><button type="button" data-size="Large">Large</button>
                        </div>
                        <small class="product-selection-status">Medium seleccionado</small>
                    </div>
                    <div class="product-specs">
                        <div class="product-spec"><span>Diseño</span><span>Catrina Mexicana</span></div><div class="product-spec"><span>Construcción</span><span>Acrílico + iluminación LED</span></div><div class="product-spec"><span>Color</span><span>Diseño multicolor</span></div><div class="product-spec"><span>Medidas</span><span>Se definirán por tamaño</span></div>
                    </div>
                    <div class="product-warning"><strong>Antes de instalar.</strong><br>Revisa las indicaciones técnicas y de seguridad correspondientes al producto. No conectes ni instales la pieza hasta confirmar las especificaciones.</div>
                    <div class="product-manual"><div><span>Manual de instalación</span><small>Guía paso a paso</small></div><b>PRÓXIMAMENTE</b></div>
                    <button type="button" class="product-add-cart">Añadir al carrito <span>→</span></button>
                    <p class="product-cart-note">El precio y las medidas finales se configurarán próximamente.</p>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector('.product-modal-main-image img');
    const thumbnails = Array.from(modal.querySelectorAll('.product-modal-thumbs button'));
    const sizeButtons = Array.from(modal.querySelectorAll('.product-size-options button'));
    const status = modal.querySelector('.product-selection-status');
    const addCart = modal.querySelector('.product-add-cart');

    const close = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('product-modal-open'); };
    const open = () => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('product-modal-open'); };
    const openCart = () => { if (window.FHCart && typeof window.FHCart.open === 'function') window.FHCart.open(); };

    button.addEventListener('click', open);
    imageBox.style.cursor = 'pointer';
    imageBox.setAttribute('role', 'button');
    imageBox.setAttribute('tabindex', '0');
    imageBox.setAttribute('aria-label', 'Ver detalles de Catrina Mexicana LED');
    imageBox.addEventListener('click', open);
    imageBox.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
    modal.querySelector('.product-modal-close').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) close(); });

    thumbnails.forEach(thumb => { thumb.addEventListener('click', () => { const image = thumb.querySelector('img'); modalImage.src = image.src; modalImage.alt = image.alt; thumbnails.forEach(item => item.classList.remove('is-active')); thumb.classList.add('is-active'); }); });

    let selectedSize = 'Medium';
    sizeButtons.forEach(sizeButton => { sizeButton.addEventListener('click', () => { selectedSize = sizeButton.dataset.size; sizeButtons.forEach(item => item.classList.toggle('is-selected', item === sizeButton)); status.textContent = `${selectedSize} seleccionado`; }); });

    const alreadyInCart = () => {
        const cart = JSON.parse(localStorage.getItem('fhCart') || '[]');
        return cart.some(item => item.product === 'Catrina Mexicana LED' && item.size === selectedSize);
    };

    const setCartLinkState = () => {
        if (alreadyInCart()) {
            addCart.classList.add('is-cart-link');
            addCart.innerHTML = 'Ir al carrito <span>→</span>';
            addCart.dataset.cartLink = 'true';
        } else {
            addCart.classList.remove('is-cart-link');
            addCart.innerHTML = 'Añadir al carrito <span>→</span>';
            delete addCart.dataset.cartLink;
        }
    };

    addCart.addEventListener('click', () => {
        if (addCart.dataset.cartLink === 'true') {
            close();
            openCart();
            return;
        }
        const cart = JSON.parse(localStorage.getItem('fhCart') || '[]');
        const existing = cart.find(item => item.product === 'Catrina Mexicana LED' && item.size === selectedSize);
        if (existing) existing.quantity += 1;
        else cart.push({ product: 'Catrina Mexicana LED', size: selectedSize, quantity: 1 });
        localStorage.setItem('fhCart', JSON.stringify(cart));
        window.dispatchEvent(new Event('fh:cart-updated'));
        addCart.classList.add('is-cart-link');
        addCart.dataset.cartLink = 'true';
        addCart.innerHTML = 'Ir al carrito <span>→</span>';
    });

    sizeButtons.forEach(sizeButton => sizeButton.addEventListener('click', setCartLinkState));
    window.addEventListener('fh:cart-updated', setCartLinkState);
    window.addEventListener('storage', setCartLinkState);
    setCartLinkState();

    document.querySelectorAll('.product-placeholder button').forEach(btn => { btn.addEventListener('click', () => btn.blur()); });
});
