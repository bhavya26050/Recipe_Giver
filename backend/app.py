# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List
# from fastapi.middleware.cors import CORSMiddleware
# from .model import recommend_recipes

# app = FastAPI()

# # Allow frontend access
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Update with specific domain for production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Request model
# class IngredientRequest(BaseModel):
#     ingredients: str

# # Health check
# @app.get("/health")
# def health_check():
#     return {"status": "healthy"}

# # Recommendation endpoint
# @app.post("/recommend")
# def get_recommendations(data: IngredientRequest):
#     try:
#         results = recommend_recipes(data.ingredients)
#         return {
#             "success": True,
#             "recommendations": results.to_dict(orient="records")
#         }
#     except Exception as e:
#         return {
#             "success": False,
#             "error": str(e),
#             "recommendations": []
#         }
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from .model import recommend_recipes

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load recipe dataset once
recipes_df = pd.read_csv("backend/recipes_small.csv")

# ------------------------ MODELS ------------------------
class IngredientRequest(BaseModel):
    ingredients: str

class DishNameRequest(BaseModel):
    dish_name: str

# ------------------------ ENDPOINTS ------------------------

@app.get("/health")
def health_check():
    return {"status": "healthy"}

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

@app.post("/api/related-recipes")
async def related_recipes(data: DishNameRequest):
    dish = data.dish_name.lower()
    keyword = dish.split()[-1]  # e.g., "biryani" from "chicken biryani"

    related = recipes_df[recipes_df['title'].str.contains(keyword, case=False)]
    related = related[~related['title'].str.lower().eq(dish)]

    suggestions = related['title'].dropna().unique().tolist()[:5]
    return {"suggestions": suggestions}
