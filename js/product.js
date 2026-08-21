document.addEventListener('DOMContentLoaded', () => {
    const productCard = document.querySelector('#producto .product-card:not(.product-placeholder)');
    const grid = document.querySelector('#producto .product-grid');
    if (!productCard || !grid) return;

    const mainImage = productCard.querySelector('.product-main img');
    const description = productCard.querySelector('.product-description');
    const imageBox = productCard.querySelector('.product-main');
    if (!mainImage || !description || !imageBox) return;

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
                    <div class="product-modal-main-image"><img src="assets/oficial%20principal.png" alt="Catrina Mexicana LED"></div>
                    <div class="product-modal-thumbs">
                        <button type="button" class="is-active"><img src="assets/oficial%20principal.png" alt="Vista principal"></button>
                        <button type="button"><img src="assets/la%20catrina%20oficial%201.png" alt="Vista 1"></button>
                        <button type="button"><img src="assets/la%20catrina%20oficial%202.png" alt="Vista 2"></button>
                        <button type="button"><img src="assets/oficial%20la%20catrina%20product%203.png" alt="Vista 3"></button>
                        <button type="button"><img src="assets/oficial%20la%20catrina%20product%204.png" alt="Vista 4"></button>
                    </div>
                </div>
                <div class="product-modal-info">
                    <span class="product-modal-eyebrow">PRODUCTO 01</span>
                    <h2 id="product-modal-title">Catrina Mexicana LED.</h2>
                    <p>Una pieza de colección donde la tradición mexicana se encuentra con la luz. Aquí podrás consultar todos los detalles del producto antes de elegirlo.</p>
                    <div class="product-specs">
                        <div class="product-spec"><span>Tamaño</span><span>Small · Medium · Large</span></div>
                        <div class="product-spec"><span>Colores</span><span>Disponible según configuración</span></div>
                        <div class="product-spec"><span>Tipo de LED</span><span>Información del modelo</span></div>
                        <div class="product-spec"><span>Material</span><span>Especificaciones del producto</span></div>
                    </div>
                    <div class="product-warning"><strong>Advertencias:</strong><br>Antes de instalar o conectar el producto, revisa las indicaciones técnicas y de seguridad correspondientes.</div>
                    <div class="product-manual"><span>Manual de instalación</span><small>Próximamente</small></div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);

    const modalImage = modal.querySelector('.product-modal-main-image img');
    const thumbnails = Array.from(modal.querySelectorAll('.product-modal-thumbs button'));
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
    modal.querySelector('.product-modal-close').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) close(); });

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const image = thumb.querySelector('img');
            modalImage.src = image.src;
            modalImage.alt = image.alt;
            thumbnails.forEach(item => item.classList.remove('is-active'));
            thumb.classList.add('is-active');
        });
    });

    document.querySelectorAll('.product-placeholder button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.blur();
        });
    });
});
