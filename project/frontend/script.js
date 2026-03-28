const API_URL = 'http://127.0.0.1:5000/api';

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const businessForm = document.getElementById('business-form');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingOverlay = document.getElementById('loading');
const anomalyAlert = document.getElementById('anomaly-alert');
const alertText = document.getElementById('alert-text');
const closeAlertBtn = document.getElementById('close-alert');

// Currency Formatter
const formatCurrency = (amount) => {
    return '$' + parseFloat(amount).toFixed(2);
};

// Colors for category bars
const barColors = ['#7952ff', '#d946ef', '#3b82f6', '#10b981', '#f59e0b'];

// Update Dashboard UI
const updateDashboard = async () => {
    try {
        const response = await fetch(`${API_URL}/summary`);
        const data = await response.json();

        // Update Stats
        document.getElementById('total-expense').textContent = formatCurrency(data.total_expenses);
        document.getElementById('total-profit').textContent = formatCurrency(data.total_profit);
        document.getElementById('net-balance').textContent = formatCurrency(data.net_balance);

        // Update Category Breakdown logic with progress bars
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';
        
        let totalExpenses = data.total_expenses || 1; // Prevent division by zero
        let colorIdx = 0;

        if (Object.keys(data.categories).length === 0) {
            categoryList.innerHTML = '<div class="empty-state">No expenses yet</div>';
        } else {
            for (const [cat, amt] of Object.entries(data.categories)) {
                
                const percentage = Math.min((amt / totalExpenses) * 100, 100).toFixed(1);
                const color = barColors[colorIdx % barColors.length];
                
                const item = document.createElement('div');
                item.className = 'cat-bar-item';
                item.innerHTML = `
                    <div class="cat-bar-info">
                        <span>${cat}</span>
                        <span>${formatCurrency(amt)}</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                    </div>
                `;
                categoryList.appendChild(item);
                colorIdx++;
            }
        }
    } catch (error) {
        console.error("Error fetching summary:", error);
    }
};

// Add Expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('exp-amount').value;
    const category = document.getElementById('exp-category').value;

    try {
        const response = await fetch(`${API_URL}/expense`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount), category })
        });
        
        const result = await response.json();
        expenseForm.reset();
        await updateDashboard();

        if (result.anomaly_alert) {
            showAlert("Unusual high spending detected: " + formatCurrency(amount));
        }
    } catch (error) {
        console.error("Error adding expense:", error);
    }
});

// Add Business Entry
businessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = document.getElementById('biz-item').value;
    const cp = document.getElementById('biz-cp').value;
    const sp = document.getElementById('biz-sp').value;
    const quantity = document.getElementById('biz-qty').value;

    try {
        await fetch(`${API_URL}/business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                item, 
                cp: parseFloat(cp), 
                sp: parseFloat(sp), 
                quantity: parseInt(quantity) 
            })
        });
        
        businessForm.reset();
        await updateDashboard();
    } catch (error) {
        console.error("Error adding business entry:", error);
    }
});

// Analyze & Predict
analyzeBtn.addEventListener('click', async () => {
    loadingOverlay.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_URL}/prediction`);
        const data = await response.json();

        document.getElementById('predict-state').classList.add('hidden');
        const mlResults = document.getElementById('ml-results');
        mlResults.classList.remove('hidden');

        document.getElementById('pred-amount').textContent = formatCurrency(data.predicted_7_days);
        
        const trendEl = document.getElementById('pred-trend');
        trendEl.textContent = data.trend;
        trendEl.className = 'trend-badge'; // reset
        if (data.trend === 'Increasing') trendEl.classList.add('trend-up');
        else if (data.trend === 'Decreasing') trendEl.classList.add('trend-down');
        else trendEl.classList.add('trend-stable');

    } catch (error) {
        console.error("Prediction failed:", error);
        document.getElementById('predict-state').innerHTML = "<p>Not enough data for prediction. Add more expenses.</p>";
    } finally {
        setTimeout(() => loadingOverlay.classList.add('hidden'), 500);
    }
});

// Alert
const showAlert = (msg) => {
    alertText.textContent = msg;
    anomalyAlert.classList.remove('hidden');
    setTimeout(() => {
        anomalyAlert.classList.add('hidden');
    }, 5000);
};

closeAlertBtn.addEventListener('click', () => {
    anomalyAlert.classList.add('hidden');
});

// Init
document.addEventListener('DOMContentLoaded', updateDashboard);
