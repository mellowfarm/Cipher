import re
from sentence_transformers import SentenceTransformer
import pickle
import os

_clf = None
_st_model = None

def get_model():
    global _clf, _st_model
    if _clf is None:
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'cipher_categoriser_v3.pkl')
            with open(model_path, 'rb') as f:
                _clf = pickle.load(f)
            _st_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("ML model loaded successfully!")
        except Exception as e:
            print(f"Warning: could not load ML model: {e}")
    return _clf, _st_model

# Rule-based transaction categoriser for Singapore merchants -- fallback if ML model is funky
RULES = {
    # check these first — more specific categories before general ones
    'Groceries': [
        'ntuc fairprice', 'ntuc fp', 'fairprice app', 'fairprice online',
        'fairprice finest', 'fairprice xtra',
        'giant hypermart', 'giant supermarket', 'sheng siong',
        'cold storage', 'redmart', 'jasons marketplace',
    ],
    'Subscriptions': [
        'netflix', 'spotify', 'disney+', 'disney plus', 'apple.com/bill',
        'google one', 'youtube premium', 'amazon prime', 'microsoft 365',
        'adobe', 'dropbox', 'icloud', 'canva', 'notion',
        'm1 limited', 'singtel', 'starhub', 'circles life',
    ],
    'Utilities': [
        'sp services', 'sp digital', 'sp group', 'singapore power',
        'union gas', 'cnergy', 'city gas', 'geneco', 'sembcorp',
        'keppel electric', 'senoko', 'pub singapore',
    ],
    'Health': [
        'raffles medical', 'raffles hospital', 'mount elizabeth',
        'gleneagles', 'parkway', 'thomson medical', 'polyclinic',
        'bfit', 'fitness first', 'anytime fitness', 'virgin active',
        'watsons', "watson's", 'watson s', 'unity pharmacy', 'guardian health',
        'physio', 'physiotherapy', 'urology', 'orthopaedic',
        'greateasternlife', 'great eastern', 'prudential', 'aia singapore',
        'ntuc income', 'aviva', 'fwd insurance',
    ],
    'Transport': [
        'grab*', 'bus/mrt', 'mrt', 'transitlink', 'ez-link', 'ezlink',
        'comfort', 'comfortdelgro', 'cdg', 'gojek', 'tada', 'ryde',
        'parking.sg', 'parking.sgbill', 'wilson parking', 'ura parking',
        'shell', 'caltex', 'esso', 'exxonmobil', 'spc petrol', 'bp petrol',
        'singaporeair', 'singapore airlines', 'scoot', 'jetstar', 'airasia',
        'tigerair', 'batik air', 'egencia', 'petroleum',
    ],
    'Entertainment': [
        'golden village', 'gv cinema', 'shaw theatres', 'cathay cinema',
        'filmgarde', 'we cinemas', 'klook', 'kkday', 'sistic',
        'universal studios', 'night safari', 'singapore zoo',
        'solace studios', 'photobooth',
    ],
    'Shopping': [
        'shopee', 'lazada', 'amazon sg', 'qoo10', 'zalora',
        'uniqlo', 'h&m', 'zara', 'cotton on', 'isetan',
        'daiso', 'daisojapan', 'lotte dfs', 'lotte t2', 'lotte t3',
        'guardian pharmacy',
    ],
    'Food': [
        'kopitiam', 'hawker', 'foodpanda', 'deliveroo',
        'mcdonalds', 'mcdonald', 'kfc', 'burger king', 'subway',
        'starbucks', 'toastbox', 'ya kun', 'yakun',
        'gongcha', 'gong cha', 'liho', 'koi cafe', 'playmade',
        'tiger sugar', 'tealive', 'sharetea',
        'sakae sushi', 'sushi express', 'itacho',
        'old chang kee', 'bengawan solo', 'breadtalk', 'prima deli',
        'dondondonki', 'don don donki',
        'saizeriya', 'mooloolabar', 'morganfields',
        'maccha house', 'yochi', 'icetalk', 'ice talk',
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
    clf, st_model = get_model()
    if clf is None or st_model is None:
        return None, 0.0
    try:
        embedding = st_model.encode([description])
        pred = clf.predict(embedding)[0]
        proba = max(clf.predict_proba(embedding)[0])
        return pred, proba
    except Exception:
        return None, 0.0


def categorise_transactions(transactions):
    result = []
    for tx in transactions:
        desc = tx.get('description', '')
        user_cat = tx.get('category', '')
        
        # 1. user explicitly set category → always respect it
        if user_cat and user_cat != 'Others':
            predicted = user_cat
        else:
            # 2. try rules first — fast and reliable for known SG merchants
            rule_pred = rule_based_categorise(desc)
            if rule_pred:
                predicted = rule_pred
            else:
                # 3. fall back to ML for unknown merchants
                pred, conf = ml_categorise(desc)
                predicted = pred if pred and conf > 0.25 else 'Others'
        
        result.append({**tx, 'predicted_category': predicted})
    return result

def get_st_model():
    _, st_model = get_model()
    return st_model