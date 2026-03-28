# 📈 Smart Expense & Profit Analyzer with ML Predictions

A lightweight, proactive web application designed for students and micro-business owners to track expenses, calculate profits, and use Machine Learning to predict future spending trends. Instead of purely reacting to past expenses, this tool forecast your upcoming week and alerts you to spending anomalies instantly!

##  Features
- **Simple Expense Tracker**: Quickly log daily spending by amount and category without friction.
- **Profit Engine**: Calculate exact net profits for small business item sales utilizing the standard `(SP - CP) × Quantity` formula.
- **Machine Learning Predictions**: Automatically predicts total expected spending over the next 7 days and spending trend (Increasing / Decreasing / Stable) using Scikit-Learn's `LinearRegression` model.
- **Anomaly Detection**: Receive instant UI alerts when you log an expense that is 1.5x higher than your daily average.
- **Minimalist Premium UI**: Fluid, glass-morphism dark-mode interface built purely with HTML/CSS without convoluted frameworks.

## 🛠️ Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Fetch API) 
- **Backend API**: Python 3, Flask, Flask-CORS
- **Machine Learning**: `scikit-learn` (Linear Regression), `numpy`, `pandas`
- **Data Persistence**: Local lightweight `data.json` storage (No database setup required!)

## Project Structure
```text
project/
│── frontend/          # Vanilla Web UI
│   │── index.html
│   │── style.css
│   │── script.js
│
│── backend/           # Python API and ML Scripts
│   │── app.py
│   │── model.py
│   │── requirements.txt
│   │── data.json      # Auto-generated JSON storage
│
│── README.md
```

---

##  Setup & Installation

Follow these steps to run the application locally.

### Prerequisites
Make sure you have [Python 3.8+](https://www.python.org/downloads/) installed on your machine.

### 1. Clone the repository
Navigate to the directory in your terminal:
```bash
git clone https://github.com/your-username/smart-expense-analyzer.git
cd smart-expense-analyzer
```

### 2. Install Dependencies
Open your terminal and navigate to the `backend` folder to install the required Python packages:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Backend Server
Run the Flask application:
```bash
python app.py
```
*The server will start running locally at `http://127.0.0.1:5000`.*

### 4. Run the Frontend
Because the frontend uses plain HTML/JS and the backend has CORS enabled, **no complex webpack or node server is needed!** 
Simply open `frontend/index.html` directly in your browser:
- **Windows**: Double click the file or right click -> Open With Google Chrome/Edge.
- **Mac**: `open frontend/index.html`

---

##  How to Use

1. **Add Expenses**: Use the left panel to input daily expenses. This saves to the local JSON and dynamically evaluates if you've triggered an anomaly. 
2. **Add Business Transactions**: Log sales. The profit is calculated automatically and injected into the Net Balance.
3. **Predict the Future**: Click the vibrant **"Analyze & Predict"** button to feed the historical data into the `LinearRegression` model and generate a spending forecast for the upcoming week based on your unique habits. 

---

## 🔬 Academic Note: ML Approach & Limitations
*(Included for presentation and assessment purposes)*

**Approach**:
* **Linear Regression**: We model total expenses against daily progression ($y = mx + b$). This isolates the trend coefficient ($m$) to identify spending trajectory and uses `.predict()` to summarize the next 7 days.
* **Statistical Anomaly**: Compares real-time additions against dynamically calculated averages ($1.5 \times$ threshold) for quick flag identification. 

**Limitations**:
* **Dataset Size**: The model requires continuous data; small localized test inputs lack the robust variance ML models thrive on.
* **Algorithm Constraints**: `LinearRegression` effectively captures broad movements but struggles with rigid seasonality (e.g., weekend spending spikes). More advanced approaches like Random Forests or time-series specific models (ARIMA) would be implemented in scaled versions.
