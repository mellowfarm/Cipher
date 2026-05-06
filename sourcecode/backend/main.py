from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI() # creates FastAPI server 

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
    category: str

class AnalyseRequest(BaseModel):
    transactions: List[Transaction]

# ── health check endpoint ──
# when someone hits GET /health, run this fxn
@app.get("/health")
def health():
    return { "status": "ok" }

# ── main analyse endpoint ──
#when React sends transactions to POST /analyse, this function runs and returns the mock results
@app.post("/analyse")
def analyse(request: AnalyseRequest):
    # hardcoded mock response for now
    # real ML pipeline comes later
    return {
        "archetype": "The Comfort Seeker",
        "portrait": "You spend to feel better. Your transactions reveal a pattern of emotional regulation — food and entertainment spike when stress is high, especially late at night. Your wallet is doing emotional work your mind hasn't processed yet.",
        "metrics": [
            { "value": "73", "label": "present bias", "color": "#D4537E" },
            { "value": "$1,847", "label": "total analysed", "color": "#2E7D32" },
            { "value": "31%", "label": "late night spend", "color": "#D4537E" },
        ],
        "insights": [
            { "color": "#D4537E", "label": "Late night spending", "text": "31% of your transactions happen after 10pm, averaging 40% above your normal transaction size." },
            { "color": "#2E7D32", "label": "Social spend clusters", "text": "Your food spending peaks on Fridays and weekends, suggesting you spend more with others around." },
            { "color": "#ED93B1", "label": "Subscription creep", "text": "You have 6 active subscriptions totalling $87/month. 2 show no adjacent usage signals." },
        ],
        "chartData": {
            "labels": ["Food", "Shopping", "Transport", "Entertainment", "Others"],
            "values": [701, 406, 332, 258, 150],
            "colors": ["#D4537E", "#81C784", "#2E7D32", "#ED93B1", "#C8E6C9"],
        }
    }