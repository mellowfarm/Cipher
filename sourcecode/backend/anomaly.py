# anomaly.py -> unsupervised anomaly detection for Cipher transactions
# uses Isolation Forest on per-category spending distributions to flag high amt outliers 

from collections import defaultdict
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_anomalies(transactions: list) -> list:
    if not transactions:
        return []
    
    flagged = {} # hold all the anomalies we will find, k=ids, val=anomaly dicts
    
    def add(tx, reason, severity="medium"):
        tx_id = tx.get("id", tx.get("description", "") + tx.get("date", ""))
        
        if tx_id not in flagged:
            flagged[tx_id] = {
                "id": tx.get("id", ""),
                "description": tx.get("description", ""),
                "amount": tx.get("amount", 0),
                "date": tx.get("date", ""),
                "category": tx.get("predicted_category", tx.get("category", "Others")),
                "reason": reason,
                "severity": severity,
            } # only adds to flagged if this transaction hasn't been flagged before
        
    _detect_amount_outliers(transactions, add)

    results = sorted(flagged.values(), key=lambda x: x["date"], reverse=True)
    return results[:10]
    
# detector 1: isolation forest (amount outliers)
# groups transactions by category first, so your food spend is only compared to your other food transactions
def _detect_amount_outliers(transactions: list, add_fn) -> None:
    by_category = defaultdict(list)
    
    # loops every transaction, figures out category and appends it to the right bucket
    for tx in transactions:
        cat = tx.get("predicted_category", tx.get("category", "Others"))
        by_category[cat].append(tx)
    
    # for each category
    for cat, txs in by_category.items():
        if len(txs) < 5:
            continue # isolation forest needs some data to learn what "normal" looks like, or else it will just flag random things
        # make numpy array + reshape bc sklearn always expects 2D input for fit/predict!
        amounts = np.array([tx["amount"] for tx in txs]).reshape(-1, 1)
        mean_amount = float(np.mean(amounts))
        std_amount = float(np.std(amounts))

        if std_amount == 0:
            continue

        clf = IsolationForest(contamination=0.1, random_state=42) # creates the model, contamination=0.1 tells it to expect about 10% outliers
        preds = clf.fit_predict(amounts) # trains model on your data and returns predictions in one call
        # 1 = normal, -1 = outlier

        for tx, pred in zip(txs, preds):
            amount = tx["amount"]
            if pred == -1 and amount > mean_amount: # flagged as an outlier and amount spent is on the HIGH side
                z = (amount - mean_amount) / std_amount if std_amount > 0 else 0 # z score: how many stdevs above the mean is this amount
                severity = "high" if z > 2.5 else "medium"
                multiple = round(amount / mean_amount, 1)
                reason = (
                    f"${amount:.2f} on {cat} - "
                    f"{multiple}x your usual ${mean_amount:.2f} average"
                )
                add_fn(tx, reason, severity)


        