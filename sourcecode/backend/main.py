from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import pdfplumber
from dotenv import load_dotenv
import os
import io
from pydantic import BaseModel
from typing import List
from categoriser import categorise_transactions
from features import extract_features 
from archetypes import assign_archetype, generate_insights
from auth import hash_password, verify_password, create_token, decode_token
from database import get_db, SessionLocal
from sqlalchemy import text
import uuid
from fastapi import Depends, HTTPException, Header

app = FastAPI() # creates FastAPI server 
load_dotenv() # loads .env file 

"""
localhost:8000/health → runs health()
localhost:8000/analyse → runs analyse()
localhost:8000/parse-pdf → runs parse_pdf()
"""

# ── allow React (localhost:3000) to talk to FastAPI (localhost:8000) ──
app.add_middleware(
    CORSMiddleware,  
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── data models ──
# BaseModel is a Pydantic class that provides data validation and parsing, defines shape of the data coming in 
# when React sends transactions, FastAPI automatically validates they have a description, amount, and category, if not reject 
class Transaction(BaseModel):
    description: str
    amount: float
    category: str = ""
    time: str = ""
    date: str = ""

class AnalyseRequest(BaseModel):
    transactions: List[Transaction]

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── health check endpoint ──
# when someone hits GET /health, run this fxn
@app.get("/health")
def health():
    return { "status": "ok" }

# ── main analyse endpoint ──
# when React sends transactions to POST /analyse, this function runs and returns the mock results
@app.post("/analyse")
def analyse(request: AnalyseRequest):
    # categorise the transactions
    transactions_list = [t.dict() for t in request.transactions]
    categorised = categorise_transactions(transactions_list)
    features = extract_features(categorised)
    archetype_name, archetype_data, scores = assign_archetype(features)
    insights = generate_insights(features, archetype_name)

    # count spending by category
    # cat = category name
    category_totals = {}
    for tx in categorised:
        cat = tx["predicted_category"]
        category_totals[cat] = category_totals.get(cat, 0) + tx["amount"] #.get(cat, 0) returns current total for category or 0 if not exists

    # sort by amount
    sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    # category_totals.items() returns list of (category, total) pairs, sorted by total in descending order
    # key = lambda x: x[1] tells sorted() to sort by the second element of the pair (the total amount)
    # reverse=True sorts in descending order so highest spending categories come first
    top_categories = sorted_categories[:5] # takes only the first 5 items 

    # build chart data from real transactions
    chart_colors = ["#D4537E", "#81C784", "#2E7D32", "#ED93B1", "#C8E6C9"]
    chart_data = {
        "labels": [c[0] for c in top_categories],
        "values": [round(c[1], 2) for c in top_categories],
        "colors": chart_colors[:len(top_categories)]
    }

    # total spent
    total_spent = sum(tx["amount"] for tx in categorised)
    
    # hardcoded mock response for now
    # real ML pipeline comes later
    return {
        "archetype": archetype_name,
        "portrait": generate_portrait(archetype_name, features),
        "metrics": [
            { "value": str(features.get("present_bias_score", 0)), "label": "present bias", "color": "#D4537E" },
            { "value": f"${features.get('total_amount', 0)}", "label": "total analysed", "color": "#2E7D32" },
            { "value": f"{round(features.get('late_night_ratio', 0) * 100)}%", "label": "late night spend", "color": "#D4537E" },
        ],
        "insights": insights,
        "chartData": chart_data
    }

def generate_portrait(archetype_name: str, features: dict) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = f"""You are Cipher, a behavioural finance app.
                The user's spending archetype is: {archetype_name}

                Their key behavioural data:
                - Present bias score: {features['present_bias_score']}/100
                - Late night spending: {round(features['late_night_ratio'] * 100)}% of transactions
                - Food delivery ratio: {round(features['food_delivery_ratio'] * 100)}% of food spend
                - Top spending category: {features['top_category']} ({round(features['top_category_dominance'] * 100)}% of total)
                - Subscription density: {round(features['subscription_density'] * 100)}% of transactions
                - Merchant loyalty score: {features['merchant_loyalty']}

                Write exactly 2-3 sentences describing their spending psychology. Rules:
                - Be specific to their numbers, not generic
                - Use plain language, not financial jargon
                - Do not be preachy or give advice
                - Speak like a smart friend, not a financial advisor
                - Ground observations in real behavioural science concepts (present bias, loss aversion, etc.)"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200
    )
    return response.choices[0].message.content.strip()

@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    transactions = []

    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table) < 2:
                    continue

                # first row is headers
                headers = [str(h or '').strip().lower() for h in table[0]]

                # detect which column is which by name
                date_idx = next((i for i, h in enumerate(headers) if 'date' in h), None)
                desc_idx = next((i for i, h in enumerate(headers) if 'desc' in h or 'merchant' in h or 'details' in h or 'transaction' in h), None)
                amt_idx  = next((i for i, h in enumerate(headers) if 'amount' in h or 'debit' in h or 'withdrawal' in h), None)

                # skip table if we can't find the key columns
                if desc_idx is None or amt_idx is None:
                    continue

                for row in table[1:]:  # skip header row
                    if not row:
                        continue

                    desc_val = str(row[desc_idx] or '').strip()
                    amt_val  = str(row[amt_idx] or '').strip()
                    date_val = str(row[date_idx] or '').strip() if date_idx is not None else ''

                    if not desc_val:
                        continue

                    # skip summary/payment rows
                    skip_keywords = ['payment', 'sub-total', 'subtotal', 'balance', 'total', 'interest', 'fee', 'gst']
                    if any(k in desc_val.lower() for k in skip_keywords):
                        continue

                    try:
                        amt_clean = amt_val.replace(',', '').replace('(', '').replace(')', '').strip()
                        amount = abs(float(amt_clean))
                    except ValueError:
                        continue

                    if amount <= 0:
                        continue

                    transactions.append({
                        "description": desc_val,
                        "amount": amount,
                        "category": "",
                        "time": date_val
                    })

    if not transactions:
        return {"error": "No transactions found in PDF"}

    return {"transactions": transactions}

# ── register endpoint ──
@app.post("/register")
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        # check if email already exists
        existing = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": request.email}
        ).fetchone()
        
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # create new user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(request.password)
        
        db.execute(
            text("INSERT INTO users (id, email, password_hash) VALUES (:id, :email, :password_hash)"),
            {"id": user_id, "email": request.email, "password_hash": password_hash}
        )
        db.commit()
        
        token = create_token(user_id)
        return {"token": token, "user_id": user_id, "email": request.email} # creates JWT and sends it to the frontend
    
    finally:
        db.close()

# ── login endpoint ──
@app.post("/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        # find user by email
        user = db.execute(
            text("SELECT id, password_hash FROM users WHERE email = :email"),
            {"email": request.email}
        ).fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # verify password
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = create_token(user.id)
        return {"token": token, "user_id": user.id, "email": request.email} # creates JWT and send it to the frontend
    
    finally:
        db.close()

# ── helper to get current user from token ──
# every endpoint calls this 
# authorisation = stores JWT token (sends with every request from frontend)
# backend verifies token, extracts user_id and knows who is making the request
def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        user_id = decode_token(token)
        return user_id
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── transaction endpoints ──

@app.post("/transactions")
def add_transaction(request: dict, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        tx_id = str(uuid.uuid4())
        categorised = categorise_transactions([{
            "description": request.get("description", ""),
            "amount": request.get("amount", 0),
            "category": request.get("category", ""),
            "time": request.get("time", "")
        }])
        predicted = categorised[0]["predicted_category"] if categorised else ""

        db.execute(text("""
            INSERT INTO transactions (id, user_id, description, amount, category, predicted_category, time, date)
            VALUES (:id, :user_id, :description, :amount, :category, :predicted_category, :time, :date)
        """), {
            "id": tx_id,
            "user_id": user_id,
            "description": request.get("description", ""),
            "amount": request.get("amount", 0),
            "category": request.get("category", ""),
            "predicted_category": predicted,
            "time": request.get("time", ""),
            "date": request.get("date", "")
        })
        db.commit()
        return {"success": True, "id": tx_id}
    finally:
        db.close()

@app.get("/transactions")
def get_transactions(month: int = None, year: int = None, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        if month and year:
            rows = db.execute(text("""
                SELECT * FROM transactions 
                WHERE user_id = :user_id AND date LIKE :month
                ORDER BY date DESC
            """), {"user_id": user_id, "month": f"{year}-{str(month).zfill(2)}%"}).fetchall()
        else:
            rows = db.execute(text("""
                SELECT * FROM transactions 
                WHERE user_id = :user_id
                ORDER BY date DESC
            """), {"user_id": user_id}).fetchall()

        transactions = [dict(row._mapping) for row in rows]
        return {"transactions": transactions}
    finally:
        db.close()

@app.post("/transactions/bulk")
def bulk_add_transactions(request: dict, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        txs = request.get("transactions", [])
        categorised = categorise_transactions(txs)

        for tx in categorised:
            tx_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO transactions (id, user_id, description, amount, category, predicted_category, time, date)
                VALUES (:id, :user_id, :description, :amount, :category, :predicted_category, :time, :date)
            """), {
                "id": tx_id,
                "user_id": user_id,
                "description": tx.get("description", ""),
                "amount": tx.get("amount", 0),
                "category": tx.get("category", ""),
                "predicted_category": tx.get("predicted_category", ""),
                "time": tx.get("time", ""),
                "date": tx.get("date", "")
            })
        db.commit()
        return {"success": True, "count": len(categorised)}
    finally:
        db.close()

@app.get("/insights")
def get_insights(user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("SELECT * FROM transactions WHERE user_id = :user_id"),
            {"user_id": user_id}
        ).fetchall()

        transactions = [dict(row._mapping) for row in rows]
        count = len(transactions)

        if count < 20:
            return {"unlocked": False, "transaction_count": count}

        features = extract_features(transactions)
        archetype_name, archetype_data, scores = assign_archetype(features)
        insights = generate_insights(features, archetype_name)
        portrait = generate_portrait(archetype_name, features)

        return {
            "unlocked": True,
            "transaction_count": count,
            "archetype": archetype_name,
            "portrait": portrait,
            "metrics": [
                {"value": str(features.get("present_bias_score", 0)), "label": "present bias", "color": "#D4537E"},
                {"value": f"${features.get('total_amount', 0)}", "label": "total analysed", "color": "#2E7D32"},
                {"value": f"{round(features.get('late_night_ratio', 0) * 100)}%", "label": "late night spend", "color": "#D4537E"},
                {"value": features.get("top_category", ""), "label": "top category", "color": "#FF6B6B"},
            ],
            "insights": insights
        }
    finally:
        db.close()