console.log("FINANCE FLOW JAVASCRIPT LOADED");

/* =========================================
   FINANCE FLOW - JAVASCRIPT
   Transaction Management System
========================================= */

"use strict";

// =========================================
// 1. ELEMENTS
// =========================================

const $ = (selector) => document.querySelector(selector);

const modal = $("#transactionModal");
const form = $("#transactionForm");

const typeInput = $("#transactionType");
const descriptionInput = $("#transactionDescription");
const amountInput = $("#transactionAmount");
const categoryInput = $("#transactionCategory");
const dateInput = $("#transactionDate");

const addButton = $("#addTransactionBtn");
const closeButton = $("#closeModal");
const cancelButton = $("#cancelTransaction");

let editingId = null;

// =========================================
// 2. STORAGE
// =========================================

const STORAGE_KEY = "financeFlowTransactions";

function loadTransactions() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Storage error:", error);
        return [];
    }
}

let transactions = loadTransactions();

function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );
    } catch (error) {
        alert("Unable to save data. Check your browser storage.");
        console.error(error);
    }
}

// =========================================
// 3. HELPERS
// =========================================

function generateId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMoney(value) {
    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " MAD";
}

function formatDate(date) {
    if (!date) return "-";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function getTypeName(type) {
    const names = {
        income: "Income",
        expenses: "Expense",
        savings: "Saving",
        investing: "Investment",
        sadaqa: "Sada9a"
    };

    return names[type] || type;
}

function getAmountColor(type) {
    return type === "income" ? "#35d69a" : "#ff7185";
}

// =========================================
// 4. NAVIGATION
// =========================================

function openPage(pageId) {
    const target = document.getElementById(pageId);

    if (!target || !target.classList.contains("page-section")) {
        return;
    }

    document.querySelectorAll(".page-section").forEach(page => {
        page.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageId
        );
    });

    const pageNames = {
        dashboard: "Welcome Back!",
        transactions: "Transaction History",
        income: "Income",
        expenses: "Expenses",
        savings: "Savings",
        investing: "Investing",
        sadaqa: "Sada9a",
        reports: "Reports & PDF",
        settings: "Settings"
    };

    const title = $(".top-header h1");

    if (title) {
        title.textContent = pageNames[pageId] || "FinanceFlow";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page]");

    if (pageButton) {
        event.preventDefault();
        openPage(pageButton.dataset.page);
    }
});

// =========================================
// 5. MODAL
// =========================================

function openModal(type = "") {
    editingId = null;

    form.reset();

    $("#transactionModal .modal-header h2").textContent =
        "Add Transaction";

    typeInput.value = type;
    dateInput.value = getToday();

    modal.classList.add("show");

    descriptionInput.focus();
}

function closeModal() {
    modal.classList.remove("show");
    form.reset();
    editingId = null;
}

addButton.addEventListener("click", () => {
    openModal();
});

closeButton.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
        closeModal();
    }
});

// =========================================
// 6. QUICK ACTIONS
// =========================================

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        openModal(button.dataset.action);
    });
});

// =========================================
// 7. ADD / EDIT TRANSACTION
// =========================================

form.addEventListener("submit", event => {
    event.preventDefault();

    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value.trim() || "General";
    const date = dateInput.value;

    const validTypes = [
        "income",
        "expenses",
        "savings",
        "investing",
        "sadaqa"
    ];

    if (!validTypes.includes(type)) {
        alert("Please select a valid transaction type.");
        return;
    }

    if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    if (editingId) {
        const index = transactions.findIndex(
            transaction => transaction.id === editingId
        );

        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                type,
                description,
                amount,
                category,
                date
            };
        }
    } else {
        transactions.push({
            id: generateId(),
            type,
            description,
            amount,
            category,
            date,
            createdAt: new Date().toISOString()
        });
    }

    saveTransactions();
    closeModal();
    renderDashboard();
});

// =========================================
// 8. CALCULATE TOTALS
// =========================================

function calculateTotals() {
    const totals = {
        income: 0,
        expenses: 0,
        savings: 0,
        investing: 0,
        sadaqa: 0
    };

    transactions.forEach(transaction => {
        const amount = Number(transaction.amount);

        if (
            Object.prototype.hasOwnProperty.call(
                totals,
                transaction.type
            ) &&
            Number.isFinite(amount)
        ) {
            totals[transaction.type] += amount;
        }
    });

    totals.balance =
        totals.income -
        totals.expenses -
        totals.savings -
        totals.investing -
        totals.sadaqa;

    return totals;
}

// =========================================
// 9. UPDATE DASHBOARD CARDS
// =========================================

function updateStatistics() {
    const totals = calculateTotals();

    $("#totalBalance").textContent =
        formatMoney(totals.balance);

    $("#totalIncome").textContent =
        formatMoney(totals.income);

    $("#totalExpenses").textContent =
        formatMoney(totals.expenses);

    $("#totalSavings").textContent =
        formatMoney(totals.savings);

    $("#totalInvestments").textContent =
        formatMoney(totals.investing);

    $("#totalSadaqa").textContent =
        formatMoney(totals.sadaqa);

    $("#totalBalance").style.color =
        totals.balance >= 0 ? "#35d69a" : "#ff7185";
}

// =========================================
// 10. TRANSACTION TABLE
// =========================================

function createTransactionRow(transaction, showActions = false) {
    const amount = Number(transaction.amount);

    const actionButtons = showActions
        ? `
            <button class="edit-btn" data-edit="${escapeHTML(transaction.id)}"
                style="background:#29222f;border:0;padding:7px 10px;border-radius:7px;color:#d99ad4;">
                Edit
            </button>
            <button class="delete-btn" data-delete="${escapeHTML(transaction.id)}"
                style="background:#302027;border:0;padding:7px 10px;border-radius:7px;color:#ff7185;">
                Delete
            </button>
        `
        : "";

    return `
        <tr>
            <td>${escapeHTML(transaction.description)}</td>
            <td>${escapeHTML(getTypeName(transaction.type))}</td>
            ${showActions ? `<td>${escapeHTML(transaction.category)}</td>` : ""}
            <td>${formatDate(transaction.date)}</td>
            <td style="color:${getAmountColor(transaction.type)};font-weight:600;">
                ${transaction.type === "income" ? "+" : "-"}${formatMoney(amount)}
            </td>
            ${showActions ? `<td>${actionButtons}</td>` : ""}
        </tr>
    `;
}

function renderRecentTransactions() {
    const tbody = $("#recentTransactions");

    const recent = [...transactions]
        .sort((a, b) => {
            return b.date.localeCompare(a.date) ||
                String(b.createdAt || "").localeCompare(
                    String(a.createdAt || "")
                );
        })
        .slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">No transactions yet.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recent.map(transaction => {
        const amount = Number(transaction.amount);

        return `
            <tr>
                <td>${escapeHTML(transaction.description)}</td>
                <td>${escapeHTML(getTypeName(transaction.type))}</td>
                <td>${formatDate(transaction.date)}</td>
                <td style="color:${getAmountColor(transaction.type)};font-weight:600;">
                    ${transaction.type === "income" ? "+" : "-"}${formatMoney(amount)}
                </td>
            </tr>
        `;
    }).join("");
}

function renderAllTransactions() {
    const tbody = $("#allTransactions");

    const search = $("#transactionSearch").value
        .trim()
        .toLowerCase();

    const type = $("#transactionFilter").value;
    const date = $("#filterDate").value;

    const filtered = [...transactions]
        .filter(transaction => {
            const matchesSearch =
                transaction.description.toLowerCase().includes(search) ||
                transaction.category.toLowerCase().includes(search);

            const matchesType =
                type === "all" || transaction.type === type;

            const matchesDate =
                !date || transaction.date === date;

            return matchesSearch && matchesType && matchesDate;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">No matching transactions found.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(transaction => {
        return createTransactionRow(transaction, true);
    }).join("");
}

// =========================================
// 11. EDIT TRANSACTION
// =========================================

function editTransaction(id) {
    const transaction = transactions.find(item => item.id === id);

    if (!transaction) return;

    editingId = id;

    typeInput.value = transaction.type;
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    $("#transactionModal .modal-header h2").textContent =
        "Edit Transaction";

    modal.classList.add("show");
}

// =========================================
// 12. DELETE TRANSACTION
// =========================================

function deleteTransaction(id) {
    const transaction = transactions.find(item => item.id === id);

    if (!transaction) return;

    const confirmed = confirm(
        `Are you sure you want to delete "${transaction.description}"?`
    );

    if (!confirmed) return;

    transactions = transactions.filter(item => item.id !== id);

    saveTransactions();
    renderDashboard();
}

// Event delegation for edit and delete buttons

$("#allTransactions").addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
        editTransaction(editButton.dataset.edit);
    }

    if (deleteButton) {
        deleteTransaction(deleteButton.dataset.delete);
    }
});

// =========================================
// 13. SEARCH AND FILTER
// =========================================

$("#transactionSearch").addEventListener(
    "input",
    renderAllTransactions
);

$("#transactionFilter").addEventListener(
    "change",
    renderAllTransactions
);

$("#filterDate").addEventListener(
    "change",
    renderAllTransactions
);

// =========================================
// 14. RENDER EVERYTHING
// =========================================

function renderDashboard() {
    updateStatistics();
    renderRecentTransactions();
    renderAllTransactions();
}

// =========================================
// 15. INITIALIZE APP
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    dateInput.value = getToday();
    renderDashboard();
});

renderDashboard();
