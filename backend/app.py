from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import logging
import csv
import os

# Import your ML model
try:
    from model import recommend_recipes, classify_recipe_dietary, generate_meal_plan, get_meal_type_recipes
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
try:
    recipes_df = pd.read_csv("recipes_small.csv")
    print(f"✅ Loaded {len(recipes_df)} recipes from CSV")
except FileNotFoundError:
    print("❌ recipes_small.csv not found")
    recipes_df = pd.DataFrame()

# Request models
class IngredientRequest(BaseModel):
    ingredients: str

class DishNameRequest(BaseModel):
    dish_name: str

class RecipeResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    error: str = None

class DietaryRequest(BaseModel):
    ingredients: str
    title: str = ""

class MealPlanRequest(BaseModel):
    days: int = 7
    dietary_preferences: List[str] = []

class MealTypeRequest(BaseModel):
    meal_type: str
    limit: int = 10

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ml_model_loaded": ML_MODEL_LOADED,
        "recipes_loaded": len(recipes_df) > 0,
        "total_recipes": len(recipes_df),
        "features": [
            "Recipe Recommendations",
            "Dietary Classification", 
            "Meal Planning",
            "Meal Type Filtering"
        ],
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

@app.post("/api/related-recipes")
async def related_recipes(data: DishNameRequest):
    """Get related recipes based on dish name"""
    
    if recipes_df.empty:
        raise HTTPException(
            status_code=503,
            detail="Recipe database not available"
        )
    
    try:
        dish = data.dish_name.lower()
        keyword = dish.split()[-1]  # e.g., "biryani" from "chicken biryani"

        related = recipes_df[recipes_df['title'].str.contains(keyword, case=False, na=False)]
        related = related[~related['title'].str.lower().eq(dish)]

        suggestions = related['title'].dropna().unique().tolist()[:5]
        
        return {
            "success": True,
            "dish_name": data.dish_name,
            "suggestions": suggestions,
            "count": len(suggestions)
        }
        
    except Exception as e:
        logger.error(f"Error getting related recipes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get related recipes: {str(e)}"
        )

@app.post("/api/classify-dietary")
def classify_dietary(data: DietaryRequest):
    """Classify recipe for dietary restrictions"""
    try:
        if not data.ingredients.strip():
            raise HTTPException(
                status_code=400,
                detail="Ingredients cannot be empty"
            )
        
        logger.info(f"Classifying dietary info for: {data.title}")
        
        dietary_info = classify_recipe_dietary(data.ingredients, data.title)
        
        return {
            "success": True,
            "recipe_title": data.title,
            "dietary_analysis": dietary_info
        }
        
    except Exception as e:
        logger.error(f"Error classifying dietary info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to classify dietary info: {str(e)}"
        )

@app.post("/api/generate-meal-plan")
def create_meal_plan(data: MealPlanRequest):
    """Generate a weekly meal plan"""
    try:
        logger.info(f"Generating {data.days}-day meal plan with preferences: {data.dietary_preferences}")
        
        meal_plan = generate_meal_plan(data.days, data.dietary_preferences)
        
        return {
            "success": True,
            "meal_plan": meal_plan,
            "message": f"Generated {data.days}-day meal plan successfully!"
        }
        
    except Exception as e:
        logger.error(f"Error generating meal plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate meal plan: {str(e)}"
        )

@app.post("/api/recipes-by-meal-type")
def recipes_by_meal_type(data: MealTypeRequest):
    """Get recipes filtered by meal type"""
    try:
        valid_meal_types = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']
        
        if data.meal_type not in valid_meal_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid meal type. Must be one of: {', '.join(valid_meal_types)}"
            )
        
        logger.info(f"Getting {data.meal_type} recipes (limit: {data.limit})")
        
        recipes = get_meal_type_recipes(data.meal_type, data.limit)
        
        return {
            "success": True,
            "meal_type": data.meal_type,
            "recipes": recipes,
            "count": len(recipes)
        }
        
    except Exception as e:
        logger.error(f"Error getting meal type recipes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get {data.meal_type} recipes: {str(e)}"
        )

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Recipe Recommendation API",
        "version": "1.0.0",
        "features": {
            "recommendations": "/recommend",
            "dietary_classification": "/api/classify-dietary",
            "meal_planning": "/api/generate-meal-plan",
            "meal_type_recipes": "/api/recipes-by-meal-type",
            "related_recipes": "/api/related-recipes"
        },
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Recipe Recommendation API...")
    
    # Use import string to enable reload
    uvicorn.run(
        "app:app",  # Import string instead of app object
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
