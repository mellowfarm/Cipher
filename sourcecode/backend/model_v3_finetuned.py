import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle
import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()

# training data
df = pd.read_csv('cipher_training_data_combined.csv')

# pull corrections from Neon
try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute("SELECT description, correct_category FROM training_queue WHERE correct_category != ''")
    rows = cursor.fetchall()
    conn.close()
    corrections = pd.DataFrame(rows, columns=['description', 'category'])
    print(f"User corrections: {len(corrections)}")
except Exception as e:
    print(f"Could not load corrections: {e}")
    corrections = pd.DataFrame(columns=['description', 'category'])

df = pd.concat([df, corrections], ignore_index=True)
print(f"Total samples: {len(df)}")

# embed all descriptions
model = SentenceTransformer('all-MiniLM-L6-v2')
X = model.encode(df["description"].tolist(), show_progress_bar=True)
y = df["category"].tolist()

# split into train and test sets
# X -> embeddings; y -> labels 
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42) # 80% train, 20% test

# train logistic regression classifier -> one vs rest by default for multiclass classification
# why logistic regression over a neural network classifier?
# because your sentence transformer embeddings are already really good features — the hard representational work is done. 
# logistic regression is fast, interpretable, and doesn't need much data. 
# a neural network classifier on top would overfit on 644 examples.
clf = LogisticRegression(max_iter=1000, class_weight='balanced') # max_iter=1000 to ensure convergence; class_weight='balanced' to handle any class imbalance
clf.fit(X_train, y_train)

# evaluate on test set
y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

with open("cipher_categoriser_v3.pkl", "wb") as f:
    pickle.dump(clf, f)
print("saved!")

# test
def classify(description):
    embedding = model.encode([description])
    return clf.predict(embedding)[0]

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



