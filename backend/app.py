from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from .model import recommend_recipes

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class IngredientRequest(BaseModel):
    ingredients: str

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Recommendation endpoint
@app.post("/recommend")
def get_recommendations(data: IngredientRequest):
    try:
        results = recommend_recipes(data.ingredients)
        return {
            "success": True,
            "recommendations": results.to_dict(orient="records")
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "recommendations": []
        }
