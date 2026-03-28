import numpy as np
from sklearn.linear_model import LinearRegression

def predict_expenses(expenses):
    """
    Takes a list of expense records and predicts the spending trend 
    for the next 7 days using Linear Regression.
    """
    # If not enough data, return None
    if len(expenses) < 2:
        return None

    # Group expenses by day_index
    daily_sums = {}
    for exp in expenses:
        day_idx = exp.get("day_index", 1)
        daily_sums[day_idx] = daily_sums.get(day_idx, 0) + exp.get("amount", 0)

    # Convert to ML-friendly format
    days = list(daily_sums.keys())
    amounts = list(daily_sums.values())

    # Need at least 2 distinct days
    if len(days) < 2:
        return None

    X = np.array(days).reshape(-1, 1)
    y = np.array(amounts)

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next 7 days
    last_day = max(days)
    next_days = np.array([last_day + i for i in range(1, 8)]).reshape(-1, 1)
    predictions = model.predict(next_days)
    
    # Floor negative predictions to 0
    predictions = np.maximum(predictions, 0)
    
    total_prediction = float(np.sum(predictions))

    # Trend logic
    trend_coeff = model.coef_[0]
    if trend_coeff > 5:
        trend = "Increasing"
    elif trend_coeff < -5:
        trend = "Decreasing"
    else:
        trend = "Stable"

    return {
        "predicted_7_days": round(total_prediction, 2),
        "trend": trend,
        "m_coeff": round(float(trend_coeff), 2)
    }

def detect_anomaly(expenses, current_amount):
    """
    Statistical Anomaly detection:
    Alert if today's expense > 1.5x of the average daily expense
    """
    if len(expenses) == 0:
        return False

    total = sum(exp.get("amount", 0) for exp in expenses)
    avg = total / len(expenses)

    return current_amount > (1.5 * avg)
