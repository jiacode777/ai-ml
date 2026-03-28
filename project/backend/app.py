from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

from model import predict_expenses, detect_anomaly

app = Flask(__name__)
# Enable CORS for all routes (important for MVP to bypass CORS issues)
CORS(app)

DATA_FILE = "data.json"

# Utility functions to read/write JSON data
def read_data():
    if not os.path.exists(DATA_FILE):
        return {"expenses": [], "business": []}
    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"expenses": [], "business": []}

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

# --- ROUTES ---

@app.route('/api/expense', methods=['POST'])
def add_expense():
    req = request.json
    amount = float(req.get('amount', 0))
    category = req.get('category', "Other")

    data = read_data()
    expenses = data.get("expenses", [])

    # Check for anomaly using historical data BEFORE adding
    is_anomaly = detect_anomaly(expenses, amount)

    # Determine day_index based on latest day index to mock a timeseries easily
    last_day_index = max([e.get("day_index", 0) for e in expenses], default=0)
    
    # Create the new record
    new_expense = {
        "amount": amount,
        "category": category,
        "date": datetime.today().strftime('%Y-%m-%d'),
        "day_index": last_day_index + 1
    }
    
    expenses.append(new_expense)
    data["expenses"] = expenses
    write_data(data)

    return jsonify({"success": True, "anomaly_alert": is_anomaly}), 201


@app.route('/api/business', methods=['POST'])
def add_business():
    req = request.json
    item = req.get('item', "Unknown")
    cp = float(req.get('cp', 0))
    sp = float(req.get('sp', 0))
    quantity = int(req.get('quantity', 0))

    data = read_data()
    data["business"].append({
        "item": item,
        "cp": cp,
        "sp": sp,
        "quantity": quantity
    })
    write_data(data)

    return jsonify({"success": True}), 201


@app.route('/api/summary', methods=['GET'])
def get_summary():
    data = read_data()
    
    # 1. Calculate Total Expenses & Categories
    total_expenses = 0
    categories = {}
    for exp in data.get("expenses", []):
        amt = exp.get("amount", 0)
        cat = exp.get("category", "Other")
        total_expenses += amt
        categories[cat] = categories.get(cat, 0) + amt

    # 2. Calculate Business Profit
    total_profit = 0
    for biz in data.get("business", []):
        profit_per_item = biz.get("sp", 0) - biz.get("cp", 0)
        total_profit += (profit_per_item * biz.get("quantity", 0))

    # 3. Net Balance
    net_balance = total_profit - total_expenses

    return jsonify({
        "total_expenses": total_expenses,
        "total_profit": total_profit,
        "net_balance": net_balance,
        "categories": categories
    })


@app.route('/api/prediction', methods=['GET'])
def get_prediction():
    data = read_data()
    expenses = data.get("expenses", [])
    
    prediction_result = predict_expenses(expenses)
    
    if prediction_result is None:
        return jsonify({"error": "Not enough data"}), 400
        
    return jsonify(prediction_result)

if __name__ == '__main__':
    # Run the server
    app.run(debug=True, port=5000)
