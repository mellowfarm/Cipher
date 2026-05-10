# Rule-based transaction categoriser for Singapore merchants
# Will be replaced with ML model once we have enough labelled data

# keyword rules — order matters, more specific rules first
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

def categorise(description: str) -> str:
    """
    Takes a transaction description and returns its category.
    Checks each rule in order — returns the first match.
    Falls back to 'Others' if nothing matches.
    """
    description_lower = description.lower().strip()

    for category, keywords in RULES.items():
        for keyword in keywords:
            if keyword in description_lower:
                return category

    return "Others"


def categorise_transactions(transactions: list) -> list:
    """
    Takes a list of transactions and adds a predicted category to each.
    If the transaction already has a category from the user, keeps it.
    """
    categorised = []
    for tx in transactions:
        tx_dict = dict(tx) if hasattr(tx, '__dict__') else tx
        predicted = categorise(tx_dict.get('description', ''))
        categorised.append({
            **tx_dict,
            "predicted_category": predicted
        })
    return categorised