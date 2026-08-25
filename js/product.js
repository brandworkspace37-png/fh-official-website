document.addEventListener('DOMContentLoaded', () => {
    const productCard = document.querySelector('#tienda .product-card:not(.product-placeholder)') || document.querySelector('#producto .product-card:not(.product-placeholder)');
    const grid = document.querySelector('#tienda .product-grid') || document.querySelector('#producto .product-grid');
    if (!productCard || !grid) return;

    const imageBox = productCard.querySelector('.product-main');
    const description = productCard.querySelector('.product-description');
    if (!imageBox || !description) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'product-details-button';
    button.textContent = 'Explorar pieza';
    description.appendChild(button);

    const modal = document.createElement('div');
    modal.className = 'product-modal fh-product-experience';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="product-modal-panel" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <button class="product-modal-close" type="button" aria-label="Cerrar">×</button>
            <div class="product-modal-content">
                <div class="product-modal-gallery">
                    <div class="product-gallery-label"><span>FORM &amp; HALO / OBJECT 01</span><span>3:4 VISUAL ARCHIVE</span></div>
                    <div class="product-modal-main-image"><img src="assets/oficial%20principal.png" alt="Catrina Mexicana LED"></div>
                    <div class="product-modal-thumbs">
                        <button type="button" class="is-active"><img src="assets/oficial%20principal.png" alt="Vista frontal"></button>
                        <button type="button"><img src="assets/la%20catrina%20oficial%201.png" alt="Vista luminosa"></button>
                        <button type="button"><img src="assets/la%20catrina%20oficial%202.png" alt="Vista ambiente"></button>
                        <button type="button"><img src="assets/oficial%20la%20catrina%20product%203.png" alt="Vista instalada"></button>
                        <button type="button"><img src="assets/oficial%20la%20catrina%20product%204.png" alt="Vista detalle"></button>
                    </div>
                    <p class="product-view-note">Selecciona una imagen para cambiar la escena.</p>
                </div>
                <div class="product-modal-info">
                    <span class="product-modal-eyebrow">COLECCIÓN MEXICANA · 01</span>
                    <h2 id="product-modal-title">Catrina Mexicana <span>LED.</span></h2>
                    <p class="product-modal-lead">Una pieza creada para convertir una pared en parte de la experiencia. La tradición mexicana toma forma, color y luz.</p>
                    <div class="product-led-swatches"><i></i><i></i><i></i><span>Paleta LED disponible</span></div>
                    <div class="product-choice-block">
                        <span class="product-choice-label">ELIGE TU TAMAÑO</span>
                        <div class="product-size-options" role="group" aria-label="Seleccionar tamaño"><button type="button" data-size="Small">Small</button><button type="button" data-size="Medium" class="is-selected">Medium</button><button type="button" data-size="Large">Large</button></div>
                        <small class="product-selection-status">Medium seleccionado</small>
                    </div>
                    <div class="product-specs">
                        <div class="product-spec"><span>Construcción</span><span>Acrílico + iluminación LED</span></div>
                        <div class="product-spec"><span>Medidas</span><span class="size-dimensions">75 × 60 cm</span></div>
                        <div class="product-spec"><span>Conexión</span><span>Alimentación LED / consultar ficha</span></div>
                        <div class="product-spec"><span>Instalación</span><span>Interior / montaje mural</span></div>
                        <div class="product-spec"><span>Precio</span><span class="size-price">$599</span></div>
                    </div>
                    <div class="product-warning"><strong>Antes de instalar.</strong><br>Revisa voltaje, alimentación, fijación y las indicaciones de seguridad antes de conectar la pieza.</div>
                    <div class="product-manual"><div><span>Ficha técnica</span><small>Precauciones · conexión · instalación</small></div><b>PRÓXIMAMENTE</b></div>
                    <button type="button" class="product-add-cart">Añadir al carrito <span>→</span></button>
                    <p class="product-cart-note">La disponibilidad, medidas y especificaciones finales se confirman antes de producción.</p>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector('.product-modal-main-image img');
    const thumbnails = [...modal.querySelectorAll('.product-modal-thumbs button')];
    const sizeButtons = [...modal.querySelectorAll('.product-size-options button')];
    const status = modal.querySelector('.product-selection-status');
    const addCart = modal.querySelector('.product-add-cart');
    const dimensions = modal.querySelector('.size-dimensions');
    const price = modal.querySelector('.size-price');
    const sizes = {
        Small: { dimensions: '60 × 50 cm', price: 399 },
        Medium: { dimensions: '75 × 60 cm', price: 599 },
        Large: { dimensions: '90 × 75 cm', price: 829 }
    };
    let selectedSize = 'Medium';

    const getCart = () => JSON.parse(localStorage.getItem('fhCart') || '[]');
    const alreadyInCart = () => getCart().some(item => item.product === 'Catrina Mexicana LED' && item.size === selectedSize);
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
    const updateSize = () => {
        const data = sizes[selectedSize];
        dimensions.textContent = data.dimensions;
        price.textContent = `$${data.price}`;
        status.textContent = `${selectedSize} seleccionado`;
        setCartLinkState();
    };
    const close = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('product-modal-open');
    };
    const open = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('product-modal-open');
    };

    button.addEventListener('click', open);
    imageBox.style.cursor = 'pointer';
    imageBox.addEventListener('click', open);
    imageBox.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    imageBox.setAttribute('tabindex', '0');
    modal.querySelector('.product-modal-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
    thumbnails.forEach(thumb => thumb.addEventListener('click', () => {
        const img = thumb.querySelector('img');
        modalImage.src = img.src;
        modalImage.alt = img.alt;
        thumbnails.forEach(x => x.classList.remove('is-active'));
        thumb.classList.add('is-active');
    }));
    sizeButtons.forEach(btn => btn.addEventListener('click', () => {
        selectedSize = btn.dataset.size;
        sizeButtons.forEach(x => x.classList.toggle('is-selected', x === btn));
        updateSize();
    }));
    addCart.addEventListener('click', () => {
        if (addCart.dataset.cartLink === 'true') { window.location.href = 'carrito.html'; return; }
        const cart = getCart();
        const existing = cart.find(item => item.product === 'Catrina Mexicana LED' && item.size === selectedSize);
        if (existing) existing.quantity += 1;
        else cart.push({ product: 'Catrina Mexicana LED', size: selectedSize, quantity: 1, price: sizes[selectedSize].price, dimensions: sizes[selectedSize].dimensions });
        localStorage.setItem('fhCart', JSON.stringify(cart));
        window.dispatchEvent(new Event('fh:cart-updated'));
        setCartLinkState();
    });
    window.addEventListener('fh:cart-updated', setCartLinkState);
    window.addEventListener('storage', setCartLinkState);
    updateSize();
});