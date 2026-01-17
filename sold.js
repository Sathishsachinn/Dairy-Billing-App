let bills = JSON.parse(localStorage.getItem("bills")) || [];

const soldBody = document.getElementById("soldBody");
const todaySale = document.getElementById("todaySale");
const weekSale = document.getElementById("weekSale");
const monthSale = document.getElementById("monthSale");

// Remove data older than 30 days
function cleanupOldBills() {
  const now = new Date();
  bills = bills.filter(bill => {
    const billDate = new Date(bill.date);
    const diff = (now - billDate) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  });
  localStorage.setItem("bills", JSON.stringify(bills));
}

cleanupOldBills();

function loadSoldProducts() {
  soldBody.innerHTML = "";

  bills.forEach((bill, index) => {
    const mainRow = document.createElement("tr");
    mainRow.innerHTML = `
      <td>${index + 1}</td>
      <td>${bill.date}</td>
      <td>${bill.customerName}</td>
      <td>${bill.customerMobile}</td>
      <td>${bill.paymentMethod}</td>
      <td>₹${bill.total}</td>
      <td><button onclick="toggleDetails(${index})">View</button></td>
    `;
    soldBody.appendChild(mainRow);

    const detailRow = document.createElement("tr");
    detailRow.style.display = "none";
    detailRow.id = `details-${index}`;

    let itemHTML = `
      <table style="width:100%; background:#f9fbff;">
        <tr>
          <th>Item</th>
          <th>Qty Type</th>
          <th>Price</th>
          <th>Count</th>
          <th>Total</th>
        </tr>
    `;

    bill.items.forEach(item => {
      itemHTML += `
        <tr>
          <td>${item.item}</td>
          <td>${item.qty}</td>
          <td>₹${item.price}</td>
          <td>${item.count}</td>
          <td>₹${item.totalPrice}</td>
        </tr>
      `;
    });

    itemHTML += `</table>`;

    detailRow.innerHTML = `
      <td colspan="7">${itemHTML}</td>
    `;

    soldBody.appendChild(detailRow);
  });
}

function toggleDetails(index) {
  const row = document.getElementById(`details-${index}`);
  row.style.display = row.style.display === "none" ? "table-row" : "none";
}

function calculateSales() {
  let today = 0, week = 0, month = 0;
  const now = new Date();

  bills.forEach(bill => {
    const billDate = new Date(bill.date);
    const diffDays = (now - billDate) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) today += bill.total;
    if (diffDays <= 7) week += bill.total;
    if (diffDays <= 30) month += bill.total;
  });

  todaySale.innerText = "₹" + today;
  weekSale.innerText = "₹" + week;
  monthSale.innerText = "₹" + month;
}

loadSoldProducts();
calculateSales();
