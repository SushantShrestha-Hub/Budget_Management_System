// Get the table-part element and the transaction-table
const tablePart = document.querySelector(".table-part");
const transactionTable = document.getElementById("transaction-table");

// Function to check the number of entries and apply scrollbar if needed
function checkTableScroll() {
  const rowCount = transactionTable.rows.length - 1; // Exclude the header row
  const maxRowCount = 10; // Set the desired maximum number of entries

  if (rowCount > maxRowCount) {
    tablePart.classList.add("scrollable");
  } else {
    tablePart.classList.remove("scrollable");
  }
}

// Call the function initially and whenever there is a change in the table
checkTableScroll();

// Add an observer to watch for changes in the table
const observer = new MutationObserver(checkTableScroll);
observer.observe(transactionTable, {
  childList: true,
  subtree: true,
});

// Initialize an empty array to store the transactions
let transactions = [];
let editedTransaction = null; // Current transaction being edited

// Function to add a new transaction
function addTransaction() {
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const chosenDate = new Date(dateInput.value);

  // Clear the input fields
  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = "";

  // Validate the input
  if (description.trim() === "" || isNaN(amount) || isNaN(chosenDate)) {
    alert("Please provide valid input.");
    return;
  }

  const transaction = {
    primeId: chosenDate.getTime(),
    description,
    amount,
    type,
  };

  transactions.push(transaction);
  updateBalance();
  updateTransactionTable();
}

// Function to delete a transaction
function deleteTransaction(primeId) {
  transactions = transactions.filter((transaction) => transaction.primeId !== primeId);
  updateBalance();
  updateTransactionTable();
}

// Function to edit a transaction
function editTransaction(primeId) {
  const transaction = transactions.find((t) => t.primeId === primeId);
  if (!transaction) return;

  document.getElementById("description").value = transaction.description;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("type").value = transaction.type;

  const dateInput = document.getElementById("date");
  dateInput.value = formatDate(new Date(transaction.primeId));

  editedTransaction = transaction;

  document.getElementById("add-transaction-btn").style.display = "none";
  document.getElementById("save-transaction-btn").style.display = "inline-block";
}

// Function to save the edited transaction
function saveTransaction() {
  if (!editedTransaction) return;

  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const chosenDate = new Date(dateInput.value);

  if (description.trim() === "" || isNaN(amount) || isNaN(chosenDate)) {
    alert("Please provide valid input.");
    return;
  }

  editedTransaction.description = description;
  editedTransaction.amount = amount;
  editedTransaction.type = type;
  editedTransaction.primeId = chosenDate.getTime();

  editedTransaction = null;

  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";

  document.getElementById("add-transaction-btn").style.display = "inline-block";
  document.getElementById("save-transaction-btn").style.display = "none";

  updateBalance();
  updateTransactionTable();
}

// Function to update the balance
function updateBalance() {
  const balanceElement = document.getElementById("balance");
  const currencySelect = document.getElementById("currency");
  const currencyCode = currencySelect.value;

  let balance = transactions.reduce((acc, t) => {
    return t.type === "income" ? acc + t.amount : acc - t.amount;
  }, 0);

  balanceElement.textContent = formatCurrency(balance, currencyCode);
  balanceElement.className = balance < 0 ? "negative-balance" : "positive-balance";
}

// Function to format currency
function formatCurrency(amount, currencyCode) {
  const currencySymbols = { USD: "$", EUR: "€", INR: "₹", GBP: "£" };
  const symbol = currencySymbols[currencyCode] || "";
  return `${symbol}${amount.toFixed(2)}`;
}

// Function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Function to update the transaction table
function updateTransactionTable() {
  const transactionTable = document.getElementById("transaction-table");

  while (transactionTable.rows.length > 1) {
    transactionTable.deleteRow(1);
  }

  transactions.forEach((transaction) => {
    const row = transactionTable.insertRow();

    row.insertCell().textContent = formatDate(new Date(transaction.primeId));
    row.insertCell().textContent = transaction.description;
    row.insertCell().textContent = formatCurrency(transaction.amount, document.getElementById("currency").value);
    row.insertCell().textContent = transaction.type;

    const actionCell = row.insertCell();
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.style.backgroundColor="red";
    editButton.style.color="white";
    editButton.style.borderRadius="5px";
    editButton.style.margin="5px";
    editButton.style.height="35px"
    editButton.style.width="60px";
    editButton.style.borderWidth="0px";
    editButton.onclick = () => editTransaction(transaction.primeId);
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.backgroundColor="red";
    deleteButton.style.color="white";
    deleteButton.style.borderRadius="5px";
    deleteButton.style.margin="5px";
    deleteButton.style.borderWidth="0px";
    deleteButton.style.height="35px";
    deleteButton.style.width="80px";
    deleteButton.onclick = () => deleteTransaction(transaction.primeId);
    actionCell.appendChild(deleteButton);
  });
}

// Export transactions to CSV
function handleDownload() {
  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const csvContent = "data:text/csv;charset=utf-8," 
    + ["Date,Description,Amount,Type"].join(",") + "\n" 
    + transactions.map(t => `${formatDate(new Date(t.primeId))},${t.description},${t.amount},${t.type}`).join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-transaction-btn").onclick = addTransaction;
  document.getElementById("save-transaction-btn").onclick = saveTransaction;
  document.getElementById("export-btn").onclick = exportToCSV;
  updateBalance();
  updateTransactionTable();
});
