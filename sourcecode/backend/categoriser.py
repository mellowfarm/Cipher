import re
import pickle
import os

# ── load ML model ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'categoriser_model.pkl')
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            with open(MODEL_PATH, 'rb') as f:
                _model = pickle.load(f)
        except Exception as e:
            print(f"Warning: could not load ML model: {e}")
    return _model

def clean_description(text):
    text = str(text).lower()
    text = re.sub(r'\*[a-z0-9\-]+', ' grab ', text)
    text = re.sub(r'bill_[a-z0-9]+', ' parking ', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Rule-based transaction categoriser for Singapore merchants -- fallback if ML model is funky
RULES = {
    "Food": [
        "mcdonald", "mcdonalds", "kfc", "burger king", "subway", "pizza",
        "grab food", "grabfood", "foodpanda", "deliveroo",
        "hawker", "kopitiam", "food court", "canteen",
        "cafe", "coffee", "starbucks", "toast box", "ya kun",
        "restaurant", "eating", "eatery", "kitchen", "bistro",
        "sushi", "ramen", "prata", "nasi", "mee", "rice",
        "chicken rice", "laksa", "wanton", "dim sum",
        "koufu", "kopitiam", "foodfare", "select",
        "domino", "paparich", "old chang kee",
        "bengawan", "bread talk", "paris baguette",
    ],
    "Transport": [
        "grab", "gojek", "comfort", "comfort delgro", "comfortdelgro",
        "taxi", "cabcharge", "uber",
        "mrt", "bus", "transitlink", "ez-link", "ezlink", "ez link",
        "smrt", "sbs transit", "sbstransit",
        "parking", "carpark", "ura parking",
        "petrol", "shell", "esso", "caltex", "sinopec",
        "car wash", "carwash",
        "scoot", "singapore airlines", "sia", "jetstar",
        "changi", "airport",
    ],
    "Shopping": [
        "uniqlo", "zara", "h&m", "hm", "cotton on",
        "zalora", "shopee", "lazada", "amazon", "qoo10",
        "fairprice", "ntuc", "cold storage", "giant",
        "ikea", "courts", "harvey norman",
        "watsons", "guardian", "unity",
        "apple", "samsung", "challenger", "courts",
        "mustafa", "bugis", "orchard",
        "clothes", "fashion", "apparel",
    ],
    "Entertainment": [
        "netflix", "disney", "hbo", "apple tv",
        "cinema", "cathay", "shaw", "golden village", "gv",
        "concert", "ticket", "sistic", "ticketmaster",
        "escape", "universal studios", "uss",
        "bowling", "laser tag", "arcade",
        "steam", "playstation", "nintendo", "xbox",
        "spotify", "youtube premium", "apple music",
    ],
    "Health": [
        "pharmacy", "guardian", "watsons",
        "clinic", "polyclinic", "hospital",
        "doctor", "dentist", "dental",
        "gym", "fitness", "anytime fitness", "pure fitness",
        "yoga", "pilates",
        "ntuc income", "great eastern", "prudential", "aia",
        "medicine", "medical",
    ],
    "Subscriptions": [
        "spotify", "netflix", "disney+", "disneyplus",
        "apple", "google", "microsoft", "adobe",
        "dropbox", "icloud", "one drive",
        "youtube", "twitch",
        "subscription", "monthly", "annual plan",
        "singtel", "starhub", "m1", "circles",
    ],
    "Utilities": [
        "sp services", "sp group", "spgroup",
        "city gas", "citygas",
        "electricity", "utilities",
        "internet", "broadband",
        "singtel", "starhub", "m1",
        "phone bill", "mobile bill",
    ],
    "Groceries": [
        "ntuc", "fairprice", "cold storage", "giant",
        "sheng siong", "shengsiong",
        "market", "wet market", "supermarket",
        "redmart", "honestbee",
        "prime supermarket",
    ],
}

def rule_based_categorise(description):
    desc_lower = description.lower()
    for category, keywords in RULES.items():
        for kw in keywords:
            if kw in desc_lower:
                return category
    return None

def ml_categorise(description):
    model = get_model()
    if model is None:
        return None, 0.0
    try:
        cleaned = clean_description(description)
        pred = model.predict([cleaned])[0]
        proba = max(model.predict_proba([cleaned])[0]) # predict_proba() returns a probability for every category & max picks the highest one
        return pred, proba
    except Exception:
        return None, 0.0


def categorise_transactions(transactions):
    result = []
    for tx in transactions:
        desc = tx.get('description', '')
        user_cat = tx.get('category', '')
        
        if user_cat and user_cat != 'Others':
            predicted = user_cat # if user set it, respect it and skip ML 
        else:
            pred, conf = ml_categorise(desc) # ask ML model 
            if pred and conf > 0.25: # if ML is confident enough, use it
                predicted = pred 
            else:
                rule_pred = rule_based_categorise(desc) # fallback on rules 
                predicted = rule_pred if rule_pred else 'Others'
        
        result.append({**tx, 'predicted_category': predicted}) # add category to tx
    return result