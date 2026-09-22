const products=[
  {id:"fone-pulse",name:"Fone Bluetooth Pulse",description:"Som envolvente, microfone integrado e encaixe confortável.",category:"eletronicos",label:"Eletrônicos",price:8990,stock:8,image:"assets/products/fone-pulse.png",tag:"Mais vendido"},
  {id:"caixa-mini-beat",name:"Caixa Mini Beat",description:"Compacta, sem fio e pronta para acompanhar o dia.",category:"eletronicos",label:"Eletrônicos",price:12990,stock:6,image:"assets/products/caixa-mini-beat.png",tag:"Novidade"},
  {id:"controle-neo",name:"Controle sem fio Neo",description:"Resposta precisa, pegada confortável e design marcante.",category:"acessorios",label:"Acessórios",price:15990,stock:5,image:"assets/products/controle-neo.png"},
  {id:"cabo-usbc",name:"Cabo USB-C reforçado",description:"1,5 metro, acabamento trançado e carregamento rápido.",category:"acessorios",label:"Acessórios",price:2990,stock:18,image:"assets/products/cabo-usbc.png"},
  {id:"carregador-turbo",name:"Carregador Turbo 20W",description:"Energia rápida em um formato compacto e seguro.",category:"acessorios",label:"Acessórios",price:7990,stock:11,image:"assets/products/carregador-turbo.png"},
  {id:"mini-geladeira",name:"Mini geladeira de brinquedo",description:"Acessórios coloridos para brincar e inventar histórias.",category:"brinquedos",label:"Brinquedos",price:9990,stock:4,image:"assets/products/mini-geladeira.png",tag:"Presente certeiro"},
  {id:"figure-hero",name:"Figure Herói Noturno",description:"Peça decorativa articulada para fãs e colecionadores.",category:"geek",label:"Geek",price:11990,stock:7,image:"assets/products/figure-hero.png"},
  {id:"camisa-brasil-retro",name:"Camisa Brasil Retrô",description:"Visual clássico, tecido leve e modelagem confortável.",category:"geek",label:"Camisas",price:13990,stock:9,image:"assets/products/camisa-brasil-retro.png",tag:"Edição especial"}
];

const money=value=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value/100);
const productById=new Map(products.map(product=>[product.id,product]));
let filter="todos";
let query="";
let cart={};
try{cart=JSON.parse(localStorage.getItem("virtual-lavras-cart")||"{}")||{}}catch{cart={}}

const grid=document.querySelector("#product-grid");
const emptyState=document.querySelector("#empty-state");
const cartDrawer=document.querySelector("#cart-drawer");
const drawerOverlay=document.querySelector("#drawer-overlay");
const cartItems=document.querySelector("#cart-items");
const cartFooter=document.querySelector("#cart-footer");
const checkout=document.querySelector("#checkout-dialog");
const toast=document.querySelector("#toast");
let toastTimer;

function showToast(message){toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2200)}
function saveCart(){localStorage.setItem("virtual-lavras-cart",JSON.stringify(cart));renderCart()}
function cartLines(){return products.filter(product=>cart[product.id]).map(product=>({product,quantity:cart[product.id]}))}
function cartTotal(){return cartLines().reduce((sum,line)=>sum+line.product.price*line.quantity,0)}

function renderProducts(){
  const normalized=query.trim().toLocaleLowerCase("pt-BR");
  const visible=products.filter(product=>(filter==="todos"||product.category===filter)&&`${product.name} ${product.description} ${product.label}`.toLocaleLowerCase("pt-BR").includes(normalized));
  grid.innerHTML=visible.map(product=>`<article class="product-card"><div class="product-visual">${product.tag?`<span class="product-tag">${product.tag}</span>`:""}<img src="${product.image}" alt="${product.name}" loading="lazy"><small class="visual-label">Virtual / ${product.label}</small></div><div class="product-info"><p class="product-category">${product.label}</p><h3>${product.name}</h3><p>${product.description}</p><div class="product-buy"><div class="product-price"><strong>${money(product.price)}</strong><small>em estoque</small></div><button class="add-button" data-add="${product.id}" aria-label="Adicionar ${product.name} à sacola"><span>＋</span> Adicionar</button></div></div></article>`).join("");
  emptyState.hidden=visible.length>0;
}

function changeQuantity(id,delta){const product=productById.get(id);if(!product)return;const next=Math.max(0,Math.min(product.stock,(cart[id]||0)+delta));if(next)cart[id]=next;else delete cart[id];saveCart()}
function addProduct(id){const product=productById.get(id);if(!product)return;changeQuantity(id,1);showToast(`${product.name} foi para a sacola`)}

function renderCart(){
  const lines=cartLines();
  const count=lines.reduce((sum,line)=>sum+line.quantity,0);
  document.querySelector("#cart-count").textContent=count;
  document.querySelector("#cart-description").textContent=count?`${count} ${count===1?"item reservado":"itens reservados"} para você.`:"Sua sacola ainda está vazia.";
  cartItems.innerHTML=lines.length?lines.map(({product,quantity})=>`<article class="cart-item"><img src="${product.image}" alt=""><div><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity"><button data-minus="${product.id}" aria-label="Diminuir ${product.name}">−</button><strong>${quantity}</strong><button data-plus="${product.id}" aria-label="Aumentar ${product.name}">＋</button><button class="remove" data-remove="${product.id}">Remover</button></div></div><strong class="line-total">${money(product.price*quantity)}</strong></article>`).join(""):`<div class="empty-cart"><span>▢</span><h3>Comece pelo catálogo</h3><p>Escolha seus favoritos e volte aqui para finalizar.</p></div>`;
  cartFooter.hidden=!lines.length;
  document.querySelector("#cart-subtotal-small").textContent=money(cartTotal());
  document.querySelector("#cart-total").textContent=money(cartTotal());
}

function openCart(){drawerOverlay.hidden=false;requestAnimationFrame(()=>cartDrawer.classList.add("open"));cartDrawer.setAttribute("aria-hidden","false");document.body.classList.add("locked")}
function closeCart(){cartDrawer.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");setTimeout(()=>{drawerOverlay.hidden=true;if(!checkout.open)document.body.classList.remove("locked")},300)}

function renderSummary(){const lines=cartLines();document.querySelector("#summary-items").innerHTML=lines.map(({product,quantity})=>`<div class="summary-row"><span>${quantity}× ${product.name}</span><strong>${money(product.price*quantity)}</strong></div>`).join("");document.querySelector("#summary-total").textContent=money(cartTotal())}
function openCheckout(){closeCart();renderSummary();document.querySelector("#checkout-content").hidden=false;document.querySelector("#success-state").hidden=true;checkout.showModal();document.body.classList.add("locked")}
function closeCheckout(){checkout.close();document.body.classList.remove("locked")}

document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");if(add){addProduct(add.dataset.add);return}
  const minus=event.target.closest("[data-minus]");if(minus){changeQuantity(minus.dataset.minus,-1);return}
  const plus=event.target.closest("[data-plus]");if(plus){changeQuantity(plus.dataset.plus,1);return}
  const remove=event.target.closest("[data-remove]");if(remove){const id=remove.dataset.remove;changeQuantity(id,-(cart[id]||0));return}
});

document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>{filter=button.dataset.filter;document.querySelectorAll(".filter").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-selected",String(active))});renderProducts()}));
document.querySelector("#search-input").addEventListener("input",event=>{query=event.target.value;renderProducts()});
document.querySelector(".cart-trigger").addEventListener("click",openCart);
document.querySelector("#close-cart").addEventListener("click",closeCart);
drawerOverlay.addEventListener("click",closeCart);
document.querySelector("#checkout-button").addEventListener("click",openCheckout);
document.querySelector("#close-checkout").addEventListener("click",closeCheckout);
document.querySelector("#back-to-cart").addEventListener("click",()=>{closeCheckout();openCart()});
document.querySelectorAll("input[name=payment]").forEach(input=>input.addEventListener("change",()=>document.querySelectorAll(".payment-option").forEach(option=>option.classList.toggle("selected",option.querySelector("input").checked))));
checkout.addEventListener("click",event=>{if(event.target===checkout)closeCheckout()});
checkout.addEventListener("cancel",event=>{event.preventDefault();closeCheckout()});

document.querySelector("#checkout-form").addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const now=new Date();
  const orderNumber=`VL-${String(now.getDate()).padStart(2,"0")}${String(now.getMonth()+1).padStart(2,"0")}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const order={orderNumber,createdAt:now.toISOString(),customer:{name:data.get("name"),email:data.get("email"),phone:data.get("phone")},payment:data.get("payment"),items:cartLines().map(({product,quantity})=>({productId:product.id,name:product.name,quantity,unitPrice:product.price})),total:cartTotal()};
  const orders=JSON.parse(localStorage.getItem("virtual-lavras-orders")||"[]");orders.unshift(order);localStorage.setItem("virtual-lavras-orders",JSON.stringify(orders.slice(0,20)));
  document.querySelector("#order-number").textContent=orderNumber;
  document.querySelector("#checkout-content").hidden=true;
  document.querySelector("#success-state").hidden=false;
  cart={};saveCart();event.currentTarget.reset();
});

document.querySelector("#finish-order").addEventListener("click",closeCheckout);
renderProducts();renderCart();
