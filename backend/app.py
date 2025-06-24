from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import logging
import pandas as pd

# Import your ML model
try:
    from model import recommend_recipes
    ML_MODEL_LOADED = True
    print("✅ ML Model loaded successfully")
except ImportError as e:
    print(f"❌ Failed to load ML model: {e}")
    ML_MODEL_LOADED = False

app = FastAPI(title="Recipe Recommendation API", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load recipe dataset once
recipes_df = pd.read_csv("recipes_small.csv")

# Request models
class IngredientRequest(BaseModel):
    ingredients: str

class DishNameRequest(BaseModel):
    dish_name: str

class RecipeResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    error: str = None

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ml_model_loaded": ML_MODEL_LOADED,
        "service": "Recipe Recommendation API"
    }

# Recipe recommendation endpoint
@app.post("/recommend", response_model=RecipeResponse)
def get_recommendations(data: IngredientRequest):
    """Get recipe recommendations based on ingredients"""
    
    if not ML_MODEL_LOADED:
        raise HTTPException(
            status_code=503, 
            detail="ML model not available. Please check server logs."
        )
    
    if not data.ingredients.strip():
        raise HTTPException(
            status_code=400,
            detail="Ingredients cannot be empty"
        )
    
    try:
        logger.info(f"Getting recommendations for: {data.ingredients}")
        
        # Get recommendations from ML model
        results = recommend_recipes(data.ingredients)
        
        # Convert to list of dictionaries
        recommendations = results.to_dict(orient="records")
        
        logger.info(f"Found {len(recommendations)} recommendations")
        
        return RecipeResponse(
            success=True,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recommendations: {str(e)}"
        )

# @app.post("/api/related-recipes")
# async def related_recipes(data: DishNameRequest):
#     dish = data.dish_name.lower()
#     keyword = dish.split()[-1]  # e.g., "biryani" from "chicken biryani"

#     related = recipes_df[recipes_df['title'].str.contains(keyword, case=False)]
#     related = related[~related['title'].str.lower().eq(dish)]

#     suggestions = related['title'].dropna().unique().tolist()[:5]
#     return {"suggestions": suggestions}
@app.route("/api/related-recipes", methods=["POST"])
def related_recipes():
    data = request.get_json()
    dish = data.get("dish_name", "").lower()

    # Tokenize the dish name
    words = dish.split()

    # Only keep meaningful words (optional: add your own stopword list)
    keywords = [word for word in words if word not in {"with", "and", "the", "of", "in", "on", "a"}]

    # Search for any of those keywords in other recipe titles
    related = recipes_df[
        recipes_df['title'].str.lower().apply(
            lambda title: any(word in title for word in keywords)
        )
    ]

    # Exclude exact match
    related = related[~related['title'].str.lower().eq(dish)]

    # Return top 5 suggestions
    suggestions = related['title'].dropna().unique().tolist()[:5]
    return jsonify({"suggestions": suggestions})

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Recipe Recommendation API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Recipe Recommendation API...")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
