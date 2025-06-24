from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os
import re
import google.generativeai as genai
from typing import Optional, Dict, Any
import json
from dotenv import load_dotenv
import random
from model import classify_recipe_dietary, generate_meal_plan, get_meal_type_recipes
import ast

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API using environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in environment variables. Please check your .env file.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Load recipe database using CSV module instead of pandas
recipe_db = []

def load_recipe_database():
    global recipe_db
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'recipes_small.csv')
        if os.path.exists(csv_path):
            with open(csv_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                recipe_db = list(csv_reader)
            print(f"✅ Loaded {len(recipe_db)} recipes from CSV")
            return True
        else:
            print("❌ CSV file not found")
            return False
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        return False

# Load recipes on startup
load_recipe_database()

def extract_dish_name(user_query: str) -> Optional[str]:
    """Extract dish name using Gemini AI"""
    prompt = f"""Extract ONLY the exact dish name from this user query. Be very specific and precise.

User query: "{user_query}"

Rules:
- Extract the complete dish name including all words that describe the dish
- Don't add extra words
- Return the dish name in lowercase

Examples:
- "How do I make butter chicken?" → "butter chicken"
- "Recipe for chocolate cake please" → "chocolate cake"
- "Can you tell me paneer butter masala recipe?" → "paneer butter masala"

If no clear dish name is found, respond with "NONE".

Dish name:"""

    try:
        response = model.generate_content(prompt)
        dish_name = response.text.strip().lower()
        dish_name = re.sub(r'^dish name:\s*', '', dish_name, flags=re.IGNORECASE)
        dish_name = dish_name.replace('"', '').replace("'", "").strip()
        
        if dish_name == 'none' or len(dish_name) < 3:
            return None
            
        print(f"🧠 Extracted dish name: '{dish_name}' from query: '{user_query}'")
        return dish_name
    except Exception as e:
        print(f"❌ Error extracting dish name: {e}")
        
        # Fallback regex patterns
        query = user_query.lower()
        patterns = [
            r'(?:recipe for|make|cook|prepare)\s+(.+?)(?:\s+recipe|\s+please|$)',
            r'(?:how to make|how do i make)\s+(.+?)(?:\s+recipe|$|\?)',
            r'(paneer butter masala|butter chicken|chicken biryani|pasta carbonara|fried rice|chocolate cake)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, query)
            if match and match.group(1):
                return match.group(1).strip()
                
        return None

def search_recipe_in_csv(dish_name: str) -> Optional[Dict[str, Any]]:
    """Search for recipe in CSV database with preference for more complete recipes"""
    if not recipe_db:
        print("⚠️ Recipe database not available")
        return None
    
    print(f"🔍 Searching for '{dish_name}' in database of {len(recipe_db)} recipes")
    
    search_term = dish_name.lower().strip()
    
    # Collect all matches first
    all_matches = []
    
    # Find exact matches
    for recipe in recipe_db:
        if recipe.get('title', '').lower() == search_term:
            # Count ingredients to prioritize more complete recipes
            ingredients_count = 0
            try:
                raw_ingredients = recipe.get('ingredients', '')
                if raw_ingredients:
                    if raw_ingredients.startswith('['):
                        ingredients_list = ast.literal_eval(raw_ingredients)
                        ingredients_count = len(ingredients_list) if isinstance(ingredients_list, list) else 1
                    else:
                        ingredients_count = len(raw_ingredients.split(','))
            except:
                ingredients_count = 1
            
            all_matches.append((recipe, ingredients_count))
    
    # If we have multiple matches, prefer the one with more ingredients
    if all_matches:
        # Sort by ingredient count (descending) to get the most complete recipe
        all_matches.sort(key=lambda x: x[1], reverse=True)
        best_match = all_matches[0][0]
        print(f"✅ Found EXACT match: '{best_match['title']}' with {all_matches[0][1]} ingredients")
        return best_match
    
    # Try partial match with all keywords (existing logic)
    keywords = [word for word in search_term.split() if len(word) > 2]
    if len(keywords) >= 2:
        partial_matches = []
        for recipe in recipe_db:
            title_lower = recipe.get('title', '').lower()
            if all(keyword in title_lower for keyword in keywords):
                # Count ingredients for partial matches too
                ingredients_count = 0
                try:
                    raw_ingredients = recipe.get('ingredients', '')
                    if raw_ingredients:
                        if raw_ingredients.startswith('['):
                            ingredients_list = ast.literal_eval(raw_ingredients)
                            ingredients_count = len(ingredients_list) if isinstance(ingredients_list, list) else 1
                        else:
                            ingredients_count = len(raw_ingredients.split(','))
                except:
                    ingredients_count = 1
                
                partial_matches.append((recipe, ingredients_count))
        
        if partial_matches:
            partial_matches.sort(key=lambda x: x[1], reverse=True)
            best_partial = partial_matches[0][0]
            print(f"✅ Found partial match: '{best_partial['title']}' with {partial_matches[0][1]} ingredients")
            return best_partial
    
    # Rest of your existing search logic...
    if 'paneer' in search_term and 'butter' in search_term and 'masala' in search_term:
        for recipe in recipe_db:
            title_lower = recipe.get('title', '').lower()
            if 'paneer' in title_lower and 'butter' in title_lower and 'masala' in title_lower:
                print(f"✅ Found Indian dish match: '{recipe['title']}'")
                return recipe
    
    if 'biryani' in search_term:
        for recipe in recipe_db:
            title_lower = recipe.get('title', '').lower()
            if 'biryani' in title_lower:
                print(f"✅ Found biryani match: '{recipe['title']}'")
                return recipe
    
    print(f"❌ No recipe found in CSV for '{dish_name}'")
    return None

def format_csv_recipe(recipe: Dict[str, Any]) -> str:
    """Format CSV recipe into markdown with complete data"""
    try:
        title = recipe.get('title', 'Recipe')
        
        # Debug: Print raw data
        print(f"\n🔍 DEBUG: Formatting recipe '{title}'")
        print(f"Raw ingredients: {recipe.get('ingredients', 'N/A')[:100]}...")
        print(f"Raw directions: {recipe.get('directions', 'N/A')[:100]}...")
        
        # Parse ingredients - handle multiple formats
        ingredients = []
        raw_ingredients = recipe.get('ingredients', '')
        
        if raw_ingredients:
            try:
                # Remove any BOM or weird characters
                cleaned_ingredients = raw_ingredients.strip()
                
                # Try different parsing methods
                if cleaned_ingredients.startswith('[') and cleaned_ingredients.endswith(']'):
                    # It's a JSON-like array
                    try:
                        ingredients = ast.literal_eval(cleaned_ingredients)
                    except:
                        try:
                            # Replace single quotes with double quotes for JSON
                            json_ingredients = cleaned_ingredients.replace("'", '"')
                            ingredients = json.loads(json_ingredients)
                        except:
                            # Last resort: split by commas and clean up
                            ingredients = [
                                item.strip(' "\'[]') 
                                for item in cleaned_ingredients.strip('[]').split('", "')
                                if item.strip()
                            ]
                else:
                    # Split by common delimiters
                    ingredients = [ing.strip() for ing in cleaned_ingredients.split(',') if ing.strip()]
                
            except Exception as e:
                print(f"❌ Error parsing ingredients: {e}")
                ingredients = [str(raw_ingredients)]
        
        # Parse directions - handle multiple formats
        directions = []
        raw_directions = recipe.get('directions', '')
        
        if raw_directions:
            try:
                # Remove any BOM or weird characters
                cleaned_directions = raw_directions.strip()
                
                # Try different parsing methods
                if cleaned_directions.startswith('[') and cleaned_directions.endswith(']'):
                    # It's a JSON-like array
                    try:
                        directions = ast.literal_eval(cleaned_directions)
                    except:
                        try:
                            # Replace single quotes with double quotes for JSON
                            json_directions = cleaned_directions.replace("'", '"')
                            directions = json.loads(json_directions)
                        except:
                            # Last resort: split by '", "' and clean up
                            directions = [
                                item.strip(' "\'[]') 
                                for item in cleaned_directions.strip('[]').split('", "')
                                if item.strip()
                            ]
                else:
                    # Split by sentence endings
                    directions = [dir.strip() for dir in cleaned_directions.split('.') if dir.strip()]
                
            except Exception as e:
                print(f"❌ Error parsing directions: {e}")
                directions = [str(raw_directions)]
        
        # Clean and validate data
        clean_ingredients = []
        for ing in ingredients:
            if ing and str(ing).strip() and str(ing).strip() not in ['', 'None', 'null']:
                clean_ingredients.append(str(ing).strip())
        
        clean_directions = []
        for direction in directions:
            if direction and str(direction).strip() and str(direction).strip() not in ['', 'None', 'null']:
                cleaned = str(direction).strip()
                # Ensure proper sentence ending
                if not cleaned.endswith(('.', '!', '?')):
                    cleaned += '.'
                clean_directions.append(cleaned)
        
        # Debug: Print parsed data
        print(f"✅ Parsed {len(clean_ingredients)} ingredients, {len(clean_directions)} directions")
        
        # Build complete formatted recipe
        formatted = f"## {title}\n\n"
        formatted += "*Perfect! I found this recipe in my database for you!* 🎯\n\n"
        
        # Add all ingredients
        if clean_ingredients:
            formatted += "### 🥘 **Complete Ingredients:**\n"
            for ingredient in clean_ingredients:
                formatted += f"• {ingredient}\n"
            formatted += "\n"
        else:
            formatted += "### 🥘 **Ingredients:**\n• Ingredients list not available\n\n"
        
        # Add all directions
        if clean_directions:
            formatted += "### 👨‍🍳 **Complete Instructions:**\n"
            for i, step in enumerate(clean_directions, 1):
                formatted += f"**{i}.** {step}\n\n"
        else:
            formatted += "### 👨‍🍳 **Instructions:**\n**1.** Instructions not available in database.\n\n"
        
        # Add dietary classification (keep existing logic)
        try:
            ingredients_text = ' '.join(clean_ingredients)
            dietary_info = classify_recipe_dietary(ingredients_text, title)
            
            if dietary_info and dietary_info.get('dietary_tags'):
                formatted += "### 🏷️ **Dietary Info:**\n"
                tag_emojis = {
                    'vegetarian': '🌱',
                    'vegan': '🌿', 
                    'gluten_free': '🌾',
                    'dairy_free': '🥛',
                    'keto_friendly': '🥑',
                    'high_protein': '💪',
                    'low_carb': '📉'
                }
                
                for tag in dietary_info['dietary_tags']:
                    emoji = tag_emojis.get(tag, '✅')
                    formatted += f"{emoji} **{tag.replace('_', ' ').upper()}**\n"
                formatted += "\n"
        except Exception as e:
            print(f"⚠️ Could not classify dietary info: {e}")
        
        # Add chef's tips
        formatted += "### 💡 **Chef's Tips:**\n"
        formatted += "• Read through the entire recipe before starting\n"
        formatted += "• Prep all ingredients and tools beforehand\n"
        formatted += "• Taste and adjust seasoning as needed\n"
        formatted += "• Don't rush the cooking process for best results\n\n"
        
        formatted += "**Questions about this recipe?** I can help with substitutions, cooking techniques, or serving suggestions! 😊"
        
        return formatted
        
    except Exception as e:
        print(f"❌ Error formatting recipe: {e}")
        return f"## {recipe.get('title', 'Recipe')}\n\nI found this recipe but had trouble formatting it completely. Here's what I have:\n\n**Ingredients:** {recipe.get('ingredients', 'Not available')}\n\n**Directions:** {recipe.get('directions', 'Not available')}"

def generate_recipe_with_gemini(dish_name: str, user_query: str) -> str:
    """Generate recipe using Gemini AI"""
    prompt = f"""You are NutriChef, a friendly and knowledgeable cooking assistant. Create a complete, detailed recipe for "{dish_name}".

Original user request: "{user_query}"

Please provide a well-structured recipe with:

## {dish_name.title()}

*Brief enthusiastic introduction (1 sentence with 1 emoji)*

### 🥘 Ingredients:
• [List all ingredients with specific measurements]

### 👨‍🍳 Instructions:
1. [Detailed step-by-step numbered instructions]

### 💡 Chef's Tips:
• [2-3 helpful cooking tips for best results]

### 📊 Nutrition Info:
• [Brief nutritional highlights - calories, protein, etc.]

**End with an engaging question to continue the conversation**

Make it warm, friendly, encouraging, and practical. Focus on clear instructions that even beginners can follow."""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"❌ Error generating recipe: {e}")
        raise e

@app.route('/api/extract-dish', methods=['POST'])
def extract_dish():
    """Extract dish name from user query"""
    try:
        data = request.get_json()
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return jsonify({'error': 'Query is required'}), 400
        
        dish_name = extract_dish_name(user_query)
        
        return jsonify({
            'dish_name': dish_name,
            'success': dish_name is not None
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search-recipe', methods=['POST'])
def search_recipe():
    """Search for recipe in CSV database"""
    try:
        data = request.get_json()
        dish_name = data.get('dish_name', '').strip()
        
        if not dish_name:
            return jsonify({'error': 'Dish name is required'}), 400
        
        recipe = search_recipe_in_csv(dish_name)
        
        if recipe:
            formatted_recipe = format_csv_recipe(recipe)
            return jsonify({
                'found': True,
                'recipe': formatted_recipe,
                'source': 'database'
            })
        else:
            return jsonify({
                'found': False,
                'source': 'not_found'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe():
    """Generate recipe using Gemini AI"""
    try:
        data = request.get_json()
        dish_name = data.get('dish_name', '').strip()
        user_query = data.get('user_query', '').strip()
        
        if not dish_name:
            return jsonify({'error': 'Dish name is required'}), 400
        
        recipe = generate_recipe_with_gemini(dish_name, user_query)
        
        return jsonify({
            'recipe': recipe,
            'source': 'ai_generated'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search-by-ingredient', methods=['POST'])
def search_by_ingredient():
    data = request.get_json()
    ingredient = data.get("ingredient", "").lower()
    offset = int(data.get("offset", 0))  # default to 0 if not provided

    if not ingredient:
        return jsonify({"error": "Missing ingredient"}), 400

    # Find all matching recipes
    found_recipes = []
    seen_titles = set()
    for recipe in recipe_db:
        ingredients = recipe.get('ingredients', '').lower()
        title = recipe.get('title', 'Unknown Recipe')
        if ingredient in ingredients and title not in seen_titles:
            found_recipes.append(title)
            seen_titles.add(title)

    # 🟢 Shuffle the recipes before paginating
    random.shuffle(found_recipes)

    paginated = found_recipes[offset:offset+10]
    has_more = offset + 10 < len(found_recipes)

    return jsonify({
        "found": len(paginated) > 0,
        "recipes": paginated,
        "total_found": len(found_recipes),
        "offset": offset,
        "next_offset": offset + 10 if has_more else None,
        "has_more": has_more
    })


@app.route('/api/generate-recipe-list', methods=['POST'])
def generate_recipe_list():
    data = request.get_json()
    ingredient = data.get('ingredient', '').strip()
    if not ingredient:
        return jsonify({'error': 'Ingredient is required'}), 400

    prompt = f"""List 10 creative, diverse, and appealing dish ideas that use "{ingredient}" as a main ingredient. 
Just give the dish names, no instructions or ingredients. 
Format as a numbered list."""

    try:
        response = model.generate_content(prompt)
        return jsonify({
            'suggestions': response.text,
            'source': 'ai_generated_list'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/related-recipes', methods=['POST'])
def related_recipes():
    data = request.get_json()
    dish_name = data.get('dish_name', '').lower()
    dish_words = set(dish_name.split())
    # Simple example: find recipes with at least one word in common (except the dish itself)
    suggestions = []
    for recipe in recipe_db:
        title = recipe.get('title', '')
        title_lower = title.lower()
        if title_lower == dish_name:
            continue
        # Check if any word from the dish name is in the recipe title
        if any(word in title_lower for word in dish_words):
            suggestions.append(title)
        if len(suggestions) >= 5:
            break
    # Fallback: if not enough, fill with random recipes (excluding the main dish and already suggested)
    if len(suggestions) < 5:
        others = [r.get('title', '') for r in recipe_db if r.get('title', '').lower() != dish_name and r.get('title', '') not in suggestions]
        random.shuffle(others)
        suggestions += others[:5 - len(suggestions)]
    return jsonify({'suggestions': suggestions})
    # for recipe in recipe_db:
    #     title = recipe.get('title', '')
    #     if title.lower() != dish_name and any(word in title.lower() for word in dish_name.split()):
    #         suggestions.append(title)
    #     if len(suggestions) >= 5:
    #         break
    # return jsonify({'suggestions': suggestions})

@app.route('/api/classify-dietary', methods=['POST'])
def classify_dietary_flask():
    """Classify recipe for dietary restrictions (Flask version)"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '').strip()
        title = data.get('title', '').strip()
        
        if not ingredients:
            return jsonify({'error': 'Ingredients are required'}), 400
        
        dietary_info = classify_recipe_dietary(ingredients, title)
        
        return jsonify({
            'success': True,
            'recipe_title': title,
            'dietary_analysis': dietary_info
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-meal-plan', methods=['POST'])
def generate_meal_plan_flask():
    """Generate a weekly meal plan (Flask version)"""
    try:
        data = request.get_json()
        days = data.get('days', 7)
        dietary_preferences = data.get('dietary_preferences', [])
        
        meal_plan = generate_meal_plan(days, dietary_preferences)
        
        return jsonify({
            'success': True,
            'meal_plan': meal_plan,
            'message': f'Generated {days}-day meal plan successfully!'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes-by-meal-type', methods=['POST'])
def recipes_by_meal_type_flask():
    """Get recipes filtered by meal type (Flask version)"""
    try:
        data = request.get_json()
        meal_type = data.get('meal_type', '').strip()
        limit = data.get('limit', 10)
        
        valid_meal_types = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']
        
        if meal_type not in valid_meal_types:
            return jsonify({
                'error': f'Invalid meal type. Must be one of: {", ".join(valid_meal_types)}'
            }), 400
        
        recipes = get_meal_type_recipes(meal_type, limit)
        
        return jsonify({
            'success': True,
            'meal_type': meal_type,
            'recipes': recipes,
            'count': len(recipes)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'recipes_loaded': len(recipe_db) > 0,
        'total_recipes': len(recipe_db),
        'api_configured': bool(GEMINI_API_KEY)
    })

def debug_recipe_data(recipe_title: str):
    """Debug function to see raw recipe data"""
    recipe = search_recipe_in_csv(recipe_title)
    if recipe:
        print(f"\n🔍 DEBUG: Raw recipe data for '{recipe_title}':")
        print(f"Title: {recipe.get('title', 'N/A')}")
        print(f"Ingredients type: {type(recipe.get('ingredients'))}")
        print(f"Ingredients raw: {recipe.get('ingredients', 'N/A')[:200]}...")
        print(f"Directions type: {type(recipe.get('directions'))}")
        print(f"Directions raw: {recipe.get('directions', 'N/A')[:200]}...")
        return recipe
    else:
        print(f"❌ Recipe '{recipe_title}' not found in database")
        return None

# Add this to your search endpoint for testing
@app.route('/api/debug-recipe', methods=['POST'])
def debug_recipe():
    """Debug endpoint to check raw recipe data"""
    try:
        data = request.get_json()
        dish_name = data.get('dish_name', '').strip()
        
        recipe = debug_recipe_data(dish_name)
        
        return jsonify({
            'found': recipe is not None,
            'raw_data': recipe if recipe else None
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add this debug endpoint to your chatbot.py
@app.route('/api/debug-rum-cake', methods=['GET'])
def debug_rum_cake():
    """Debug Rum Cake specifically"""
    recipe = search_recipe_in_csv("rum cake")
    if recipe:
        return jsonify({
            'found': True,
            'title': recipe.get('title'),
            'raw_ingredients': recipe.get('ingredients'),
            'raw_directions': recipe.get('directions'),
            'ingredients_type': str(type(recipe.get('ingredients'))),
            'directions_type': str(type(recipe.get('directions')))
        })
    else:
        return jsonify({'found': False})

if __name__ == '__main__':
    print("🚀 Starting NutriChef Backend...")
    print(f"📊 Loaded {len(recipe_db)} recipes from CSV")
    print(f"🔑 API Key configured: {'✅' if GEMINI_API_KEY else '❌'}")
    
    # Get configuration from environment variables with defaults
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    
    app.run(debug=debug_mode, host=host, port=port)