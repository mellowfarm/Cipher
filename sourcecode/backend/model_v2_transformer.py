from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')

categories = [
    "food & dining",
    "groceries & supermarket",
    "transport & travel",
    "shopping & retail",
    "entertainment & leisure",
    "health & medical",
    "subscriptions & streaming",
    "utilities & bills",
    "others"
]
category_embeddings = model.encode(categories)

def classify(description):
    description_embedding = model.encode(description)
    similarities = util.cos_sim(description_embedding, category_embeddings)[0] # [0] unwraps the outer dimension bc return is a 2d tensor (1, num_categories)
    best_idx = similarities.argmax().item() # argmax() returns the index of the highest similarity score; .item() converts from tensor to Python scalar
    return categories[best_idx]

test_transactions = [
    "KOPITIAM INVESTMENT PTE SINGAPORE",
    "NTUC FAIRPRICE APP PAYM SINGAPORE",
    "SHOPEE SINGAPORE Shopee SINGAPORE",
    "PARKING.SG BILL_772A19 SINGAPORE",
    "SINGAPOREAIR SINGAPORE SINGAPORE",
    "ADVANCED UROLOGY ASSOCI SINGAPORE",
    "SP DIGITAL PTE. LTD. SINGAPORE",
    "M1 LIMITED M1APP+ M1 LI SINGAPORE",
]

for t in test_transactions:
    print(f"{t[:40]:<40} → {classify(t)}")