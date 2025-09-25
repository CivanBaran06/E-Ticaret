let products = [];
let cart = [];
let users = [];
let currentUser = null;

const productList = document.getElementById("productList");

// --- Fetch ürünler ---
fetch('https://dummyjson.com/products?limit=45')
  .then(res => res.json())
  .then(data => {
    products = data.products.map(p => ({
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

// --- Toast mesaj fonksiyonu ---
function showToast(message){
  const toast = document.createElement("div");
  toast.className = "custom-toast";
  toast.innerHTML = `
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `;
  document.body.appendChild(toast);

  // X butonuna tıklama
  toast.querySelector(".close-btn").onclick = () => toast.remove();

  // 3 saniye sonra otomatik kaybolsun
  setTimeout(() => {
    if (document.body.contains(toast)) toast.remove();
  }, 3000);
}

// --- Sepet işlemleri ---
function addToCart(id){
  const product = products.find(p=>p.id===id);
  cart.push(product);
  updateCart();
  showToast(`"${product.name}" sepete eklendi!`);
}
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
document.getElementById("cartBtn").onclick=()=>{ new bootstrap.Modal(document.getElementById("cartModal")).show(); };
document.getElementById("loginBtn").onclick=()=>{ new bootstrap.Modal(document.getElementById("loginModal")).show(); };

// --- Giriş & Kayıt Doğrulama --- 
function validateInput(input, condition, msg){
  let errorSpan = input.nextElementSibling;
  if(!errorSpan || !errorSpan.classList.contains("error-msg")){
    errorSpan = document.createElement("small");
    errorSpan.classList.add("error-msg","text-danger");
    input.insertAdjacentElement("afterend", errorSpan);
  }
  if(!condition){
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    errorSpan.textContent = msg;
    return false;
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    errorSpan.textContent = "";
    return true;
  }
}

// --- Kayıt Ol ---
document.getElementById("openRegister").onclick=()=>{
  bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
  new bootstrap.Modal(document.getElementById("registerModal")).show();
};
document.getElementById("doRegister").onclick=()=>{
  const u=document.getElementById("regUser");
  const p=document.getElementById("regPass");

  // Kullanıcı adı sadece harf ve boşluk
  const validUser = validateInput(
    u, 
    /^[A-Za-zÇçĞğİıÖöŞşÜü\s]+$/.test(u.value.trim()), 
    "Kullanıcı adı sadece harf olmalı"
  );
  // Şifre boş olamaz
  const validPass = validateInput(
    p, 
    p.value.trim()!=="", 
    "Şifre boş olamaz"
  );

  if(validUser && validPass){
    users.push({u:u.value.trim(), p:p.value.trim()});
    showToast("Kayıt başarılı!");
    bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
    new bootstrap.Modal(document.getElementById("loginModal")).show();
  }
};

// --- Giriş Yap ---
document.getElementById("doLogin").onclick=()=>{
  const u=document.getElementById("loginUser");
  const p=document.getElementById("loginPass");

  const validUser = validateInput(
    u, 
    /^[A-Za-zÇçĞğİıÖöŞşÜü\s]+$/.test(u.value.trim()), 
    "Kullanıcı adı sadece harf olmalı"
  );
  const validPass = validateInput(
    p, 
    p.value.trim()!=="", 
    "Şifre boş olamaz"
  );

  if(!(validUser && validPass)) return;

  const f=users.find(x=>x.u===u.value.trim() && x.p===p.value.trim());
  if(f){
    currentUser=f; 
    u.classList.add("is-valid"); 
    p.classList.add("is-valid");
    showToast(`Hoşgeldin ${u.value}!`);
    bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
  } else {
    u.classList.add("is-invalid");
    p.classList.add("is-invalid");
    let err = u.nextElementSibling;
    if(err) err.textContent = "Hatalı giriş!";
  }
};

// --- Satın alma ---
document.getElementById("checkoutBtn").onclick=()=>{
  if(!currentUser){ 
    showToast("Lütfen oturum açın!");
    new bootstrap.Modal(document.getElementById("loginModal")).show(); 
  }
  else new bootstrap.Modal(document.getElementById("paymentModal")).show();
};

// --- Ödeme Doğrulama + Otomatik Formatlama ---
const birthInput = document.getElementById("birthDate");
birthInput.addEventListener("input", ()=>{
  let v = birthInput.value.replace(/\D/g,"").slice(0,8);
  if(v.length>=5) v = v.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
  else if(v.length>=3) v = v.replace(/(\d{2})(\d{0,2})/, "$1/$2");
  birthInput.value = v;
});

const cardInput = document.getElementById("cardNumber");
cardInput.addEventListener("input", ()=>{
  cardInput.value = cardInput.value.replace(/\D/g,"").slice(0,16);
});

const cardDateInput = document.getElementById("cardDate");
cardDateInput.addEventListener("input", ()=>{
  let v = cardDateInput.value.replace(/\D/g,"").slice(0,4);
  if(v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
  cardDateInput.value = v;
});

const cvvInput = document.getElementById("cardCVV");
cvvInput.addEventListener("input", ()=>{
  cvvInput.value = cvvInput.value.replace(/\D/g,"").slice(0,3);
});

const nameInput = document.getElementById("fullName");
nameInput.addEventListener("input", ()=>{
  nameInput.value = nameInput.value.replace(/[^A-Za-zÇçĞğİıÖöŞşÜü\s]/g,"");
});

// --- Ödeme Tamamlama ---
document.getElementById("completePayment").onclick=()=>{
  const name=nameInput;
  const birth=birthInput;
  const card=cardInput;
  const date=cardDateInput;
  const cvv=cvvInput;
  const loc=document.getElementById("location");
  const accept=document.getElementById("acceptTerms");

  const validName = validateInput(name, name.value.trim()!=="", "İsim gerekli");
  const validBirth = validateInput(birth, /^\d{2}\/\d{2}\/\d{4}$/.test(birth.value), "Tarih gg/aa/yyyy formatında olmalı");
  const validCard = validateInput(card, /^\d{16}$/.test(card.value), "Kart numarası 16 haneli olmalı");
  const validDate = validateInput(date, /^\d{2}\/\d{2}$/.test(date.value), "Kart tarihi MM/YY formatında olmalı");
  const validCvv = validateInput(cvv, /^\d{3}$/.test(cvv.value), "CVV 3 haneli olmalı");
  const validLoc = validateInput(loc, loc.value.trim()!=="", "Adres gerekli");

  if(!(validName && validBirth && validCard && validDate && validCvv && validLoc && accept.checked)){
    if(!accept.checked) showToast("Şartları kabul etmelisiniz");
    return;
  }

  showToast("Ödeme başarıyla tamamlandı!");
  cart=[]; updateCart();
  bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
};
// --- Kullanıcı adı alanlarına sadece harf ve boşluk izin ver ---
["regUser","loginUser"].forEach(id=>{
  const inp = document.getElementById(id);
  inp.addEventListener("input", ()=>{
    inp.value = inp.value.replace(/[^A-Za-zÇçĞğİıÖöŞşÜü\s]/g,"");
  });
});
