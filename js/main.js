/* =========================================
   FORM & HALO — GLOBAL UI
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        const closeMenu = () => {
            navLinks.classList.remove("is-open");
            navLinks.style.removeProperty("display");
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
        };
        menuToggle.addEventListener("click", () => {
            const isOpen = !navLinks.classList.contains("is-open");
            navLinks.classList.toggle("is-open", isOpen);
            if (window.matchMedia("(max-width: 640px)").matches) {
                navLinks.style.display = isOpen ? "flex" : "none";
                if (isOpen) Object.assign(navLinks.style,{position:"absolute",top:"76px",left:"14px",right:"14px",flexDirection:"column",alignItems:"stretch",gap:"0",padding:"8px",background:"rgba(16,16,15,.97)",border:"1px solid rgba(243,239,230,.14)",zIndex:"20"});
            }
            menuToggle.classList.toggle("is-open",isOpen);
            menuToggle.setAttribute("aria-expanded",isOpen?"true":"false");
            menuToggle.setAttribute("aria-label",isOpen?"Cerrar menú":"Abrir menú");
        });
        navLinks.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeMenu));
        window.addEventListener("resize",()=>{if(!window.matchMedia("(max-width:640px)").matches)closeMenu();});
    }

    /* =========================================
       STORE — 2 / 2 / 2 PRODUCT GRID
       ========================================= */
    const storeStyle=document.createElement("style");
    storeStyle.textContent=`
        .fh-shop-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:34px 22px !important;}
        .fh-product-card{min-width:0 !important;background:transparent !important;}
        .fh-product-image{aspect-ratio:1/1 !important;background:transparent !important;border:0 !important;box-shadow:none !important;overflow:hidden !important;}
        .fh-product-image img{width:100% !important;height:100% !important;object-fit:contain !important;display:block !important;}
        .fh-product-info{padding:14px 0 0 !important;}
        .fh-product-info h3{margin:8px 0 5px !important;font-size:18px !important;}
        .fh-product-info p{font-size:11px !important;max-width:420px !important;}
        .fh-product-action{margin-top:12px !important;}
        @media(max-width:640px){
            .fh-shop-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:28px 12px !important;}
            .fh-product-info h3{font-size:15px !important;line-height:1.15 !important;}
            .fh-product-info p{font-size:10px !important;line-height:1.4 !important;}
            .fh-product-action{font-size:8px !important;margin-top:10px !important;}
            .fh-product-meta{font-size:6.5px !important;letter-spacing:.11em !important;}
        }
    `;
    document.head.appendChild(storeStyle);

    const catrinaImage="assets/oficial%20principal.png";
    const catrinaProduct="html/catrina-led.html";
    const grid=document.querySelector(".fh-shop-grid");

    if(grid){
        const template=grid.querySelector(".fh-product-card");
        if(template){
            grid.innerHTML="";
            for(let i=1;i<=6;i++){
                const card=template.cloneNode(true);
                const image=card.querySelector(".fh-product-image");
                const title=card.querySelector(".fh-product-info h3");
                const description=card.querySelector(".fh-product-info p");
                const action=card.querySelector(".fh-product-action");
                const link=card.querySelector("a");
                const meta=card.querySelector(".fh-product-meta");
                if(image){image.classList.remove("fh-coming-image");image.innerHTML=`<img src="${catrinaImage}" alt="Catrina Mexicana LED — Form & Halo">`;}
                if(title)title.textContent="Catrina Mexicana LED";
                if(description)description.textContent="Pieza luminosa para espacios con identidad.";
                if(action){action.textContent="Ver producto →";action.href=catrinaProduct;}
                if(meta)meta.innerHTML=`<span>COLECCIÓN MEXICANA · 0${i}</span><span>$599</span>`;
                if(link)link.href=catrinaProduct;
                grid.appendChild(card);
            }
        }
    }

    /* Remove only the connected white background from the Catrina PNG.
       This keeps the white skull/details inside the artwork intact. */
    const removeWhiteBackground=(sourceImg)=>{
        if(!sourceImg.naturalWidth)return;
        const canvas=document.createElement("canvas");
        canvas.width=sourceImg.naturalWidth;canvas.height=sourceImg.naturalHeight;
        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        ctx.drawImage(sourceImg,0,0);
        const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
        const pixels=imageData.data,w=canvas.width,h=canvas.height;
        const visited=new Uint8Array(w*h),queue=[];
        const isWhite=(p)=>pixels[p]>238&&pixels[p+1]>238&&pixels[p+2]>238&&Math.max(pixels[p],pixels[p+1],pixels[p+2])-Math.min(pixels[p],pixels[p+1],pixels[p+2])<18;
        const add=(x,y)=>{if(x<0||y<0||x>=w||y>=h)return;const n=y*w+x;if(visited[n])return;const p=n*4;if(!isWhite(p))return;visited[n]=1;queue.push(n);};
        for(let x=0;x<w;x++){add(x,0);add(x,h-1);}for(let y=0;y<h;y++){add(0,y);add(w-1,y);}
        for(let i=0;i<queue.length;i++){const n=queue[i],x=n%w,y=(n-x)/w;pixels[n*4+3]=0;add(x+1,y);add(x-1,y);add(x,y+1);add(x,y-1);}
        ctx.putImageData(imageData,0,0);
        const transparentSrc=canvas.toDataURL("image/png");
        document.querySelectorAll(".fh-product-image img").forEach(img=>{img.src=transparentSrc;img.style.mixBlendMode="normal";});
    };
    const sourceImg=new Image();
    sourceImg.onload=()=>removeWhiteBackground(sourceImg);
    sourceImg.src=catrinaImage;

    const socialIcon=(type)=>type==="Instagram"
        ?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor"/></svg>'
        :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.9v8H14Z" fill="currentColor"/></svg>';
    document.querySelectorAll(".fh-footer-social a[aria-label]").forEach(link=>{link.innerHTML=socialIcon(link.getAttribute("aria-label"));link.style.fontSize="0";const svg=link.querySelector("svg");if(svg){svg.style.width="15px";svg.style.height="15px";}});
});