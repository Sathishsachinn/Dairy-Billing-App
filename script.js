const products = {
  Milk: {
    "Cow Milk": { "500ml": 31, "1L": 62 },
    "A2 Bufflo Milk": { "500ml": 50, "1L": 100 },
    "Savarguna Milk": { "130": 10, "500ml": 35, "1L": 70 },
    "Standard Milk": { "500ml": 25, "1L": 50 },
    "Toned Milk": { "165ml": 13, "500ml": 31, "1L": 62 },
    "Full Cream Milk": { "110ml": 10, "500ml": 41, "1L": 82 }
  },
  "Butter and Cheese": {
    "Table butter": { "100g": 60, "500g": 295 },
    "Cooking butter": { "200g": 120, "500g": 300 },
    "cheese slices": { "100g": 75, "200g": 135 },
    "cheese cube": { "200g": 150, "500g": 360 }
  },
  "Milk shakes": {
    "Straberry": { "110g": 15, "180g": 40, "165g": 25 },
    "Vanilla": { "110g": 35, "180g": 40, "165g": 25 },
    "Sweet lassi": { "165g": 25 },
    "Mango lassi": { "165g": 25 },
    "Whey gluco shakti": { "160g": 10 },
    "Spiced butter milk": { "180g": 15 },
    "Chocolate & carmel": { "180g": 25 },
    "Cookies": { "110g": 15 }
  },
  Curd: {
    "Plain Curd": { "125g": 10, "425g": 38, "500g": 50, "1kg": 98 },
    "Cup Curd": { "80g": 10, "180g": 25, "400g": 50, "1kg": 100 },
    "Tub Curd": { "500g": 55, "1kg": 110, "2kg": 215 },
    "Sampurna A2 Curd": { "1kg": 155 },
    "Curd Bucket": { "5kg": 400, "10kg": 800 },
    "Chef's Choice Curd": { "10kg": 720 },
    "Classic Yogurt": { "90g": 60, "1kg": 120 },
    "Blueberry Yogurt": { "90g": 70, "1kg": 140 },
    "mango Yogurt": { "90g": 70, "1kg": 140 }
  },
  Ghee: {
    "Cow Ghee": { "12ml": 10, "25ml": 20 },
    "Cow Ghee Pouch": { "500ml": 375, "1L": 745 },
    "Cow Ghee Jar": { "50ml": 50, "100ml": 90, "200ml": 155, "500ml": 405, "1L": 790 },
    "Cow Ghee Spout": { "500ml": 365, "750ml": 580, "1L": 735 },
    "Desi Dhandar Ghee": { "1L": 745 },
    "Special Ghee": { "500ml": 450, "1L": 745 }
  },
  "Dairy Sweets": {
    "Dood peda": { "200g": 100, "500g": 300 },
    "Besan laddu": { "180g": 125 },
    "Jowar laddu": { "180g": 125 },
    "Mixed millet laddu": { "180g": 125 },
    "Gulab jamun": { "500g": 155, "1kg": 285 },
    "Rasgulla": { "500g": 135, "1kg": 240 }
  },
  "Dairy drinkable": {
    "Livo badam (pp)": { "180ml": 30 },
    "Livo badam (glass)": { "200ml": 35 },
    "Rice badam": { "180ml": 40 },
    "Livo pista": { "180ml": 30 },
    "Livo strawberry": { "180ml": 30 },
    "Cold coffee tin": { "180ml": 30 },
    "Charge": { "180ml": 45 },
    "Vanilla drink": { "180ml": 30 },
    "Chocolate drink": { "180ml": 30 }
  }
};

// ─── State ────────────────────────────────────────────────
let bill = [];
let total = 0;
let soldProducts = [];    // session-only in-memory list
let billCounter = 1;
let billsFolderHandle = null;  // File System folder handle

// ─── DOM refs ─────────────────────────────────────────────
const categorySection  = document.getElementById("categorySection");
const billTable        = document.getElementById("billTable");
const totalSpan        = document.getElementById("total");
const soldList         = document.getElementById("soldList");
const searchBar        = document.getElementById("searchBar");
const totalSalesSpan   = document.getElementById("totalSales");
const folderStatus     = document.getElementById("folderStatus");

renderSoldProducts();
updateTotalSales();

// ─── BILLS FOLDER SETUP ───────────────────────────────────

document.getElementById("selectFolderBtn").onclick = async () => {
  try {
    billsFolderHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    folderStatus.textContent = `✅ Folder: ${billsFolderHandle.name}`;
    folderStatus.style.color = "#155724";
    showNotification(`Bills folder set: "${billsFolderHandle.name}"`);
  } catch (err) {
    if (err.name !== "AbortError") {
      showNotification("Could not access folder: " + err.message, "warning");
    }
  }
};

// ─── SAVE BILL TO JSON FILE ───────────────────────────────

async function saveBillToFolder(billData) {
  if (!billsFolderHandle) {
    showNotification("⚠️ Please select a Bills Folder first!", "warning");
    return false;
  }

  try {
    // File name: Bill_001_2026-04-02_16-30.txt
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
    const num = String(billData.billNumber).padStart(3, "0");
    const fileName = `Bill_${num}_${dateStr}_${timeStr}.txt`;

    // Build readable text receipt
    const line = "─".repeat(40);
    let text = "";
    text += `        DAIRY BILLING APP\n`;
    text += `${line}\n`;
    text += `Bill No : #${billData.billNumber}\n`;
    text += `Date    : ${billData.date}\n`;
    text += `${line}\n`;
    text += `ITEM                  QTY     PRICE   QTY   TOTAL\n`;
    text += `${line}\n`;

    billData.items.forEach(item => {
      const name  = item.item.padEnd(22).slice(0, 22);
      const qty   = item.qty.padEnd(8).slice(0, 8);
      const price = ("₹" + item.price).padEnd(8);
      const count = String(item.count).padEnd(6);
      const total = "₹" + item.totalPrice;
      text += `${name}${qty}${price}${count}${total}\n`;
    });

    text += `${line}\n`;
    text += `TOTAL AMOUNT         :  ₹${billData.total}\n`;
    text += `${line}\n`;
    text += `       Thank you for your purchase!\n`;

    // Write .txt file into selected folder
    const fileHandle = await billsFolderHandle.getFileHandle(fileName, { create: true });
    const writable   = await fileHandle.createWritable();
    await writable.write(text);
    await writable.close();

    showNotification(`✅ Bill #${billData.billNumber} saved as ${fileName}`);
    return true;
  } catch (err) {
    showNotification("Error saving file: " + err.message, "warning");
    return false;
  }
}

// ─── NOTIFICATION TOAST ──────────────────────────────────

function showNotification(message, type = "success") {
  let notif = document.getElementById("bill-notif");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "bill-notif";
    document.body.appendChild(notif);
  }
  notif.className = `sheets-notif ${type}`;
  notif.innerHTML = message;
  notif.style.display = "block";
  setTimeout(() => { notif.style.display = "none"; }, 4000);
}

// ─── UI RENDERING ─────────────────────────────────────────

function renderCategories(filter = "") {
  categorySection.innerHTML = "";

  for (let category in products) {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const catTitle = document.createElement("h4");
    catTitle.innerText = category;
    catTitle.onclick = () => toggleProducts(catDiv);
    catDiv.appendChild(catTitle);

    const productContainer = document.createElement("div");
    productContainer.style.display = "none";

    for (let product in products[category]) {
      if (!product.toLowerCase().includes(filter.toLowerCase())) continue;

      const prodDiv = document.createElement("div");
      prodDiv.className = "product";
      prodDiv.innerText = product;
      prodDiv.onclick = () => toggleQuantity(prodDiv, category, product);

      productContainer.appendChild(prodDiv);
    }

    catDiv.appendChild(productContainer);
    categorySection.appendChild(catDiv);
  }
}

function toggleProducts(catDiv) {
  const productsDiv = catDiv.querySelector("div");
  productsDiv.style.display =
    productsDiv.style.display === "none" ? "block" : "none";
}

function toggleQuantity(prodDiv, category, product) {
  const oldQty = prodDiv.querySelector(".quantity-container");
  if (oldQty) { oldQty.remove(); return; }

  const qtyContainer = document.createElement("div");
  qtyContainer.className = "quantity-container";

  for (let qty in products[category][product]) {
    const price = products[category][product][qty];
    const qtyDiv = document.createElement("div");
    qtyDiv.className = "quantity";
    qtyDiv.innerText = `${qty} - ₹${price}`;
    qtyDiv.onclick = () => addToBill(product, qty, price);
    qtyContainer.appendChild(qtyDiv);
  }

  prodDiv.appendChild(qtyContainer);
}

// ─── BILLING ──────────────────────────────────────────────

function addToBill(item, qty, price) {
  const existing = bill.find(b => b.item === item && b.qty === qty);
  if (existing) {
    existing.count++;
    existing.totalPrice = existing.count * price;
  } else {
    bill.push({ item, qty, price, count: 1, totalPrice: price });
  }
  calculateTotal();
  renderBill();
}

function calculateTotal() {
  total = bill.reduce((sum, b) => sum + b.totalPrice, 0);
  totalSpan.innerText = total;
}

function renderBill() {
  billTable.innerHTML = "";
  bill.forEach((b, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.item}</td>
      <td>${b.qty}</td>
      <td>₹${b.price}</td>
      <td>
        <button onclick="decreaseQty(${i})">-</button>
        ${b.count}
        <button onclick="increaseQty(${i})">+</button>
      </td>
      <td>₹${b.totalPrice}</td>
      <td><button onclick="removeItem(${i})">Remove</button></td>
    `;
    billTable.appendChild(tr);
  });
}

function increaseQty(index) {
  bill[index].count++;
  bill[index].totalPrice = bill[index].count * bill[index].price;
  calculateTotal(); renderBill();
}

function decreaseQty(index) {
  if (bill[index].count > 1) {
    bill[index].count--;
    bill[index].totalPrice = bill[index].count * bill[index].price;
  } else {
    bill.splice(index, 1);
  }
  calculateTotal(); renderBill();
}

function removeItem(index) {
  bill.splice(index, 1);
  calculateTotal(); renderBill();
}

// ─── SAVE BILL ────────────────────────────────────────────

document.getElementById("saveBill").onclick = async () => {
  if (bill.length === 0) return alert("No items in bill!");

  const date = new Date().toLocaleString();
  const newBill = {
    billNumber: billCounter,
    date,
    items: [...bill],
    total
  };

  const saved = await saveBillToFolder(newBill);

  if (saved) {
    billCounter++;
    soldProducts.push(newBill);
    renderSoldProducts();
    updateTotalSales();

    bill = [];
    total = 0;
    renderBill();
    totalSpan.innerText = 0;
  }
};

// ─── SOLD PRODUCTS ────────────────────────────────────────

function renderSoldProducts() {
  soldList.innerHTML = "";
  soldProducts.forEach(s => {
    const li = document.createElement("li");
    li.innerText = `Bill #${s.billNumber} — ${s.date} — ₹${s.total}`;
    soldList.appendChild(li);
  });
}

function updateTotalSales() {
  const totalSales = soldProducts.reduce((sum, s) => sum + s.total, 0);
  totalSalesSpan.innerText = totalSales;
}

// ─── SEARCH ───────────────────────────────────────────────

searchBar.addEventListener("input", e => {
  renderCategories(e.target.value);
});

// ─── INIT ─────────────────────────────────────────────────
renderCategories();