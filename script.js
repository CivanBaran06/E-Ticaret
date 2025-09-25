let products = []; // Artık boş, API'den gelecek
let cart = [];
let users = [];
let currentUser = null;

const productList = document.getElementById("productList");

// --- Fetch ile ürünleri çek ---
fetch('https://dummyjson.com/products?limit=45')
  .then(res => res.json())
  .then(data => {
    products = data.products.map((p, i) => ({
      id: p.id,
      name: p.title,
      price: p.price,
      img: p.thumbnail || null
    }));
    displayProducts();
  })
  .catch(err => console.error("API hatası:", err));

// --- Ürünleri ekrana bas ---
function displayProducts(){
  productList.innerHTML = "";
  products.forEach(p => {
    productList.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="card p-3 text-center">
          ${p.img ? `<img src="${p.img}" class="card-img-top mb-2" style="height:150px; object-fit:cover;">` : ""}
          <h5>${p.name}</h5>
          <p>${p.price} ₺</p>
          <button class="btn btn-primary" onclick="addToCart(${p.id})">Sepete Ekle</button>
        </div>
      </div>`;
  });
}

// --- Sepete ekle ---
function addToCart(id){
  const product = products.find(p=>p.id===id);
  cart.push(product);
  updateCart();
  alert(product.name + " sepete eklendi!");
}

// --- Sepeti güncelle ---
function updateCart(){
  document.getElementById("cartCount").textContent = cart.length;
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartItems.innerHTML="";
  let total=0;
  cart.forEach((item,index)=>{
    total+=item.price;
    cartItems.innerHTML+=`
      <li class="list-group-item d-flex justify-content-between">
        ${item.name} - ${item.price} ₺
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Sil</button>
      </li>`;
  });
  cartTotal.textContent = total;
}

function removeFromCart(i){ cart.splice(i,1); updateCart(); }
document.getElementById("clearCart").onclick=()=>{cart=[];updateCart();};

// --- Modal açmalar ---
document.getElementById("cartBtn").onclick=()=>{
  new bootstrap.Modal(document.getElementById("cartModal")).show();
};
document.getElementById("loginBtn").onclick=()=>{
  new bootstrap.Modal(document.getElementById("loginModal")).show();
};

// --- Giriş & Kayıt ---
document.getElementById("openRegister").onclick=()=>{
  bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
  new bootstrap.Modal(document.getElementById("registerModal")).show();
};
document.getElementById("doRegister").onclick=()=>{
  const u=document.getElementById("regUser").value;
  const p=document.getElementById("regPass").value;
  if(u && p){ users.push({u,p}); alert("Kayıt başarılı!"); 
    bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
    new bootstrap.Modal(document.getElementById("loginModal")).show();
  }
};
document.getElementById("doLogin").onclick=()=>{
  const u=document.getElementById("loginUser").value;
  const p=document.getElementById("loginPass").value;
  const f=users.find(x=>x.u===u && x.p===p);
  if(f){ currentUser=f; alert("Hoşgeldin "+u); bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();}
  else alert("Hatalı giriş!");
};

// --- Satın alma ---
document.getElementById("checkoutBtn").onclick=()=>{
  if(!currentUser){ alert("Lütfen oturum açın!"); new bootstrap.Modal(document.getElementById("loginModal")).show(); }
  else new bootstrap.Modal(document.getElementById("paymentModal")).show();
};

// --- Ödeme doğrulama ---
document.getElementById("completePayment").onclick=()=>{
  const name=document.getElementById("fullName").value.trim();
  const birth=document.getElementById("birthDate").value.trim();
  const card=document.getElementById("cardNumber").value.trim();
  const date=document.getElementById("cardDate").value.trim();
  const cvv=document.getElementById("cardCVV").value.trim();
  const loc=document.getElementById("location").value.trim();
  const accept=document.getElementById("acceptTerms").checked;

  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(birth)) return alert("Doğum tarihi sayı olmalı (gg/aa/yyyy)");
  if(!/^\d{16}$/.test(card)) return alert("Kart numarası 16 haneli olmalı");
  if(!/^\d{2}\/\d{2}$/.test(date)) return alert("Kart tarihi (AA/YY) şeklinde olmalı");
  if(!/^\d{3,5}$/.test(cvv)) return alert("CVV 3-5 haneli olmalı");
  if(!loc) return alert("Lütfen adresinizi giriniz");
  if(!accept) return alert("Şartları kabul etmelisiniz");

  alert("Ödeme başarıyla tamamlandı!");
  cart=[]; updateCart();
  bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
};
