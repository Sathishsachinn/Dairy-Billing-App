const products = {
  Milk: {
    "Cow Milk": { "500ml": 29, "500ml": 30, "500ml": 31, "1L": 62 },
    "A2 Bufflo Milk": { "500ml": 50, "1L": 100 },
    "Savarguna Milk": { "130": 10, "500ml": 35, "1L": 70 },
    "Standard Milk": { "500ml": 25, "1L": 50 },
    "Toned Milk": { "165ml": 13, "500ml": 31, "1L": 62 },
    "Full Cream Milk": {"110ml": 10, "500ml": 41, "1L": 82 }
  },
  "Butter and Cheese": {
    "Table butter": { "100g": 60, "500g": 295 },
    "Cooking butter": { "200g": 120, "500g": 300 },
    "cheese slices": { "100g": 75, "200g": 135 },
    "cheese cube": { "200g": 150, "500g": 360 }
  },
  "Milk shakes": {
    "Straberry": { "110g": 15, "180g": 40, "165g": 25, },
    "Vanilla": { "110g": 35, "180g": 40, "165g": 25, },
    "Sweet lassi": { "165g": 25, },
    "Mango lassi": { "165g": 25, },
    "Whey gluco shakti": { "160g": 10, },
    "Spiced butter milk": { "180g": 15, },
    "Chocolate & carmel": { "180g": 25, },
    "Cookies": { "110g": 15, }
  },
  Curd: {
    "Plain Curd": { "125g": 10, "425g": 38, "500g": 50, "1kg": 98 },
    "Cup Curd": { "80g": 10, "180g": 25, "400g": 50, "1kg": 100 },
    "Tub Curd": { "500g": 55, "1kg": 110, "2kg": 215 },
    "Sampurna A2 Curd": { "1kg": 155 },
    "Curd Bucket": { "5kg": 400, "10kg": 800 },
    "Chef's Choice Curd": { "10kg": 720, },
    "Classic Yogurt": { "90g": 60, "1kg": 120 },
    "Blueberry Yogurt": { "90g": 70, "1kg": 140 },
    "mango Yogurt": { "90g": 70, "1kg": 140 }
  },
  Ghee: {
    "Cow Ghee": { "12ml": 10, "25ml": 20, },
    "Cow Ghee Pouch": { "500ml": 375, "1L": 745 },
    "Cow Ghee Jar": { "50ml": 50, "100ml": 90, "200ml": 155, "500ml": 405, "1L": 790 },
    "Cow Ghee Spout": { "500ml": 365, "750ml": 580, "1L": 735 },
    "Desi Dhandar Ghee": { "1L": 745 },
    "Special Ghee": { "500ml": 450, "1L": 745 },
  },
  "Dairy Sweets": {
    "Dood peda": { "200g": 100, "500g": 300 },
    "Besan laddu": { "180g": 125, },
    "Jowar laddu": { "180g": 125, },
    "Mixed millet laddu": { "180g": 125, },
    "Gulab jamun": { "500g": 155, "1kg": 285 },
    "Rasgulla": { "500g": 135, "1kg": 240 },
  },
  "Dairy drinkable": {
    "Livo badam": { "180ml pp": 30, },
    "Livo badam": { "200ml glass": 35, },
    "Rice badam": { "180ml pp": 40, },
    "Livo pista": { "180ml pp": 30, },
    "Livo strawberry": { "180ml pp": 30, },
    "Cold coffee tin": { "180ml pp": 30, },
    "Charge": { "180ml pp": 45, },
    "Vanilla": { "180ml pp": 30, },
    "Chocolate": { "180ml pp": 30, }
  }
  };

let bill = [];
let total = 0;
let bills = JSON.parse(localStorage.getItem("bills")) || [];

const categorySection = document.getElementById("categorySection");
const billTable = document.getElementById("billTable");
const totalSpan = document.getElementById("total");

// Payment selection
document.querySelectorAll(".payment").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".payment").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  }
});

function renderCategories(){
  categorySection.innerHTML="";
  for(let cat in products){
    const div=document.createElement("div");
    div.className="category";
    const h=document.createElement("h4");
    h.innerText=cat;
    h.onclick=()=>toggleProducts(div);
    div.appendChild(h);

    const prodDiv=document.createElement("div");
    prodDiv.style.display="none";

    for(let p in products[cat]){
      const pDiv=document.createElement("div");
      pDiv.className="product";
      pDiv.innerText=p;
      pDiv.onclick=()=>toggleQty(pDiv,cat,p);
      prodDiv.appendChild(pDiv);
    }
    div.appendChild(prodDiv);
    categorySection.appendChild(div);
  }
}

function toggleProducts(div){
  const p=div.querySelector("div");
  p.style.display=p.style.display==="none"?"block":"none";
}

function toggleQty(prodDiv,cat,prod){
  const old=prodDiv.querySelector(".qty");
  if(old){old.remove();return;}
  const q=document.createElement("div");
  q.className="qty";
  for(let qt in products[cat][prod]){
    const price=products[cat][prod][qt];
    const d=document.createElement("div");
    d.className="quantity";
    d.innerText=`${qt} - ₹${price}`;
    d.onclick=()=>addToBill(prod,qt,price);
    q.appendChild(d);
  }
  prodDiv.appendChild(q);
}

function addToBill(item,qty,price){
  const found=bill.find(b=>b.item===item && b.qty===qty);
  if(found){
    found.count++;
    found.totalPrice=found.count*price;
  }else{
    bill.push({item,qty,price,count:1,totalPrice:price});
  }
  renderBill();
}

function renderBill(){
  billTable.innerHTML="";
  total=0;
  bill.forEach((b,i)=>{
    total+=b.totalPrice;
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${b.item}</td>
      <td>${b.qty}</td>
      <td>₹${b.price}</td>
      <td>
        <button onclick="dec(${i})">-</button>
        ${b.count}
        <button onclick="inc(${i})">+</button>
      </td>
      <td>₹${b.totalPrice}</td>
      <td><button onclick="removeItem(${i})">X</button></td>
    `;
    billTable.appendChild(tr);
  });
  totalSpan.innerText=total;
}

function inc(i){ bill[i].count++; bill[i].totalPrice=bill[i].count*bill[i].price; renderBill();}
function dec(i){
  if(bill[i].count>1){bill[i].count--; bill[i].totalPrice=bill[i].count*bill[i].price;}
  else bill.splice(i,1);
  renderBill();
}
function removeItem(i){ bill.splice(i,1); renderBill(); }

// Save Bill
document.getElementById("saveBill").onclick=()=>{
  const name=document.getElementById("customerName").value;
  const mobile=document.getElementById("customerMobile").value;
  const payment=document.querySelector(".payment.active");

  if(!bill.length) return alert("Add items");
  if(!name||!mobile) return alert("Enter customer details");
  if(!payment) return alert("Select payment method");

  bills.push({
    date:new Date().toLocaleString(),
    customerName:name,
    customerMobile:mobile,
    paymentMethod:payment.innerText,
    items:bill,
    total:total
  });

  localStorage.setItem("bills",JSON.stringify(bills));
  alert("Bill Saved");

  bill=[];
  renderBill();
  document.getElementById("customerName").value="";
  document.getElementById("customerMobile").value="";
};

renderCategories();
