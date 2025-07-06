import os
import csv
import re
from typing import Dict, List
import google.generativeai as genai
from dotenv import load_dotenv
import random

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("✅ Gemini AI model configured successfully")
else:
    model = None
    print("❌ GEMINI_API_KEY not found in environment variables")

# Load dataset using CSV instead of pandas
def load_recipes_csv():
    """Load recipes from CSV file"""
    recipes = []
    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "recipes_small.csv")
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                if row.get('ingredients'):  # Only include rows with ingredients
                    recipes.append(row)
        print(f"✅ Loaded {len(recipes)} recipes from CSV")
        return recipes
    except FileNotFoundError:
        print("❌ recipes_small.csv not found")
        return []

# Load recipes
recipes_data = load_recipes_csv()

def recommend_recipes(user_ingredients, top_n=5):
    """Simple recipe recommendation without sklearn"""
    if not recipes_data:
        return []
    
    user_ingredients_lower = user_ingredients.lower()
    user_words = set(user_ingredients_lower.split())
    
    scored_recipes = []
    
    for recipe in recipes_data:
        ingredients_text = recipe.get('ingredients', '').lower()
        ingredients_words = set(ingredients_text.split())
        
        # Simple scoring based on common words
        common_words = user_words.intersection(ingredients_words)
        score = len(common_words)
        
        if score > 0:
            scored_recipes.append((recipe, score))
    
    # Sort by score and return top N
    scored_recipes.sort(key=lambda x: x[1], reverse=True)
    return [recipe for recipe, score in scored_recipes[:top_n]]

def classify_recipe_dietary(ingredients_text: str, recipe_title: str = "") -> dict:
    """Classify recipe for dietary restrictions using AI"""
    if not model:
        return {
            'dietary_tags': ['general'], 
            'allergens': [], 
            'is_healthy': True, 
            'difficulty': 'medium'
        }
    
    prompt = f"""Analyze this recipe and return ONLY a JSON object:

Recipe: {recipe_title}
Ingredients: {ingredients_text}

Return JSON with:
{{
    "dietary_tags": ["vegetarian", "vegan", "gluten_free", "dairy_free", "keto_friendly", "high_protein", "low_carb"],
    "allergens": ["nuts", "dairy", "gluten", "soy", "eggs"],
    "is_healthy": true/false,
    "difficulty": "easy/medium/hard"
}}"""

    try:
        response = model.generate_content(prompt)
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"❌ Error classifying dietary info: {e}")
        return {
            'dietary_tags': ['general'], 
            'allergens': [], 
            'is_healthy': True, 
            'difficulty': 'medium'
        }

def generate_meal_plan(days: int = 7, dietary_preferences: list = []) -> str:
    """Generate a personalized meal plan using AI"""
    if not model:
        return """## 📅 Your 7-Day Meal Plan

### Day 1 (Monday)
**🌅 Breakfast:** Avocado Toast with Eggs
**🌞 Lunch:** Quinoa Salad with Chicken  
**🌙 Dinner:** Baked Salmon with Vegetables

### Day 2 (Tuesday)
**🌅 Breakfast:** Greek Yogurt with Berries
**🌞 Lunch:** Turkey Wrap
**🌙 Dinner:** Pasta with Marinara

[Continue for remaining days...]"""

    dietary_str = f"Dietary preferences: {', '.join(dietary_preferences)}. " if dietary_preferences else ""
    
    prompt = f"""Create a {days}-day meal plan with breakfast, lunch, and dinner.

{dietary_str}

Format as markdown with:
## 📅 Your {days}-Day Meal Plan

### Day 1 (Monday)
**🌅 Breakfast:** [Dish] - [Description]
**🌞 Lunch:** [Dish] - [Description]
**🌙 Dinner:** [Dish] - [Description]

[Continue for all days]"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"❌ Error generating meal plan: {e}")
        return f"Sorry, couldn't generate meal plan: {str(e)}"

def get_meal_type_recipes(meal_type: str, limit: int = 10) -> list:
    """Get recipes for specific meal type"""
    if not recipes_data:
        return []
    
    meal_keywords = {
        'breakfast': ['breakfast', 'pancake', 'oatmeal', 'toast', 'cereal', 'eggs'],
        'lunch': ['salad', 'sandwich', 'soup', 'wrap', 'bowl'],
        'dinner': ['chicken', 'beef', 'fish', 'curry', 'rice', 'pasta'],
        'snack': ['snack', 'chips', 'nuts', 'fruit', 'bar'],
        'dessert': ['cake', 'pie', 'chocolate', 'dessert', 'sweet', 'cookie']
    }
    
    keywords = meal_keywords.get(meal_type.lower(), [])
    matching_recipes = []
    
    for recipe in recipes_data:
        title = recipe.get('title', '').lower()
        if any(keyword in title for keyword in keywords):
            matching_recipes.append({
                'title': recipe.get('title', ''),
                'ingredients': recipe.get('ingredients', '')
            })
    
    return matching_recipes[:limit]

def generate_shopping_list(meal_plan_text: str) -> dict:
    """Generate shopping list from meal plan"""
    return {
        'proteins': ['chicken', 'fish', 'eggs'],
        'vegetables': ['broccoli', 'carrots', 'spinach'],
        'grains': ['rice', 'bread', 'pasta'],
        'dairy': ['milk', 'cheese', 'yogurt'],
        'pantry': ['oil', 'salt', 'pepper'],
        'estimated_cost': '$60-80',
        'serves': '2 people'
    }
