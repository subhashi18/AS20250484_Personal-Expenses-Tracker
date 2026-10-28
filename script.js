// Personal Expense Tracker - beginner-friendly JavaScript
const form = document.getElementById('transactionForm');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const filterInput = document.getElementById('filter');
const searchInput = document.getElementById('search');
const tableBody = document.getElementById('transactionTable');
const emptyMessage = document.getElementById('emptyMessage');
const incomeOutput = document.getElementById('totalIncome');
const expenseOutput = document.getElementById('totalExpenses');
const balanceOutput = document.getElementById('currentBalance');

const STORAGE_KEY = 'personalExpenseTransactions';
let transactions = [];

// Load transactions saved in this browser.
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) {
    transactions = saved.filter(t => t && (t.type === 'income' || t.type === 'expense') && Number.isFinite(Number(t.amount)));
  }
} catch (error) {
  console.error('Unable to load transactions:', error);
}

function todayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMoney(value) {
  return 'LKR ' + Number(value).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Unable to save transactions:', error);
  }
}

function updateSummary() {
  let income = 0;
  let expenses = 0;
  transactions.forEach(function (transaction) {
    if (transaction.type === 'income') {
      income += Number(transaction.amount);
    } else {
      expenses += Number(transaction.amount);
    }
  });
  incomeOutput.textContent = formatMoney(income);
  expenseOutput.textContent = formatMoney(expenses);
  balanceOutput.textContent = formatMoney(income - expenses);
}

function displayTransactions() {
  tableBody.innerHTML = '';
  const selectedType = filterInput.value;
  const searchText = searchInput.value.trim().toLowerCase();

  const visible = transactions.filter(function (transaction) {
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesSearch = String(transaction.description).toLowerCase().includes(searchText) ||
      String(transaction.category).toLowerCase().includes(searchText);
    return matchesType && matchesSearch;
  });

  visible.forEach(function (transaction) {
    const row = document.createElement('tr');

    function addCell(value, className = '') {
      const cell = document.createElement('td');
      cell.textContent = value;
      if (className) cell.className = className;
      row.appendChild(cell);
      return cell;
    }

    addCell(transaction.date);
    addCell(transaction.description);
    const typeCell = addCell(transaction.type === 'income' ? 'Income' : 'Expense');
    typeCell.className = 'tag tag-' + transaction.type;
    addCell(transaction.category);
    addCell(formatMoney(transaction.amount), 'amount-' + transaction.type);

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
      deleteTransaction(transaction.id);
    });
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });

  emptyMessage.hidden = visible.length !== 0;
}

function refreshPage() {
  updateSummary();
  displayTransactions();
}

function resetForm() {
  form.reset();
  dateInput.value = todayString();
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const type = typeInput.value;
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!['income', 'expense'].includes(type) || !description || !category || !date ||
      !Number.isFinite(amount) || amount <= 0) {
    // Native validation handles missing required fields; this catches extra cases.
    form.reportValidity();
    return;
  }

  const transaction = {
    id: String(Date.now()) + '-' + Math.random().toString(36).slice(2),
    type: type,
    description: description,
    amount: amount,
    category: category,
    date: date
  };

  transactions.push(transaction);
  saveTransactions();
  refreshPage();
  resetForm();
  alert("Transaction added successfully!");
});

function deleteTransaction(id) {
  if (!window.confirm('Delete this transaction?')) return;
  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });
  saveTransactions();
  refreshPage();
}

filterInput.addEventListener('change', displayTransactions);
searchInput.addEventListener('input', displayTransactions);
form.addEventListener('reset', function () {
  // Wait until the browser has finished its native reset.
  setTimeout(function () { dateInput.value = todayString(); }, 0);
});

// Initial screen.
dateInput.value = todayString();
refreshPage();
