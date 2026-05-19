import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
import pickle
import re
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

base = os.path.dirname(__file__)

def clean(text):
    text = str(text).lower()
    text = re.sub(r'\*[a-z0-9\-]+', ' grab ', text)
    text = re.sub(r'bill_[a-z0-9]+', ' parking ', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ── load base training data ──
real = pd.read_csv(os.path.join(base, 'cipher_training_data.csv'))
synthetic = pd.read_csv(os.path.join(base, 'synthetic_training_data.csv'))

# ── pull user corrections from Neon ──
try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute("""
        SELECT description, correct_category 
        FROM training_queue 
        WHERE correct_category != ''
    """)
    rows = cursor.fetchall()
    conn.close()

    corrections = pd.DataFrame(rows, columns=['description', 'category'])
    corrections['source'] = 'user_correction'
    corrections['notes'] = 'from user edit'
    print(f"User corrections: {len(corrections)}")
except Exception as e:
    print(f"Could not load corrections: {e}")
    corrections = pd.DataFrame(columns=['description', 'category', 'source', 'notes'])

# ── combine all data ──
df = pd.concat([real, synthetic, corrections], ignore_index=True)

print(f"Total samples: {len(df)} (real: {len(real)}, synthetic: {len(synthetic)}, corrections: {len(corrections)})")
print(df['category'].value_counts())

df['cleaned'] = df['description'].apply(clean)

"""
tf-idf converts text to numbers
* tf = term frequency (how often a term appears in a document); idf = inverse document frequency (how unique a term is across all documents)
* takes a string and breaks it into n-grams (sequences of chars) -> 2 char-grams, 3 char-grams, 4 char-grams
* then converts these chunks into a vector of numbers: rows = merchants/descriptions, columns = n-grams, values = tf-idf scores (importance of that n-gram for that description)

logistic regression learns which numbers map to which categories 
* takes the tf-idf vectors as input and learns to predict the category (Food, Transport, Shopping) based on the patterns in those vectors 
* for a new merchant it multiplies each chunk's score by its learned weight and sums them up for each category
* C = 1.0 (L2 regularisation strength) -> balances fitting the training data well and keeping the model simple to avoid overfitting
* lower C = simpler model, higher C = more complex model
* class_weight='balanced' makes model treat every category equally regardless of sample count, so rare categories like Entertainment still get learned properly
"""
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        analyzer='char_wb',
        ngram_range=(2, 4),
        min_df=1,
        max_features=10000
    )),
    ('clf', LogisticRegression(
        max_iter=1000,
        C=1.0,
        class_weight='balanced'
    ))
])

# 5-fold cross-validation for unseen data (accuracy check)
scores = cross_val_score(pipeline, df['cleaned'], df['category'], cv=5, scoring='accuracy')
print(f"\nCV Accuracy: {scores.mean():.2f} ± {scores.std():.2f}")

pipeline.fit(df['cleaned'], df['category'])  # actual training on all data

with open(os.path.join(base, 'categoriser_model.pkl'), 'wb') as f:
    pickle.dump(pipeline, f)  # save the trained model

print(f"\nModel saved to categoriser_model.pkl!")