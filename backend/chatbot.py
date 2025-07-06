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
from model import classify_recipe_dietary, generate_meal_plan, get_meal_type_recipes, generate_shopping_list
import ast
from datetime import datetime

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
    
    # Special case handling
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
        
        # Add dietary classification
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

def get_ai_only_recommendations(dish_name: str, count: int = 5) -> list:
    """Simple AI-only recommendations as fallback"""
    try:
        prompt = f"""Based on the dish "{dish_name}", suggest {count} similar recipes that someone might enjoy.

Consider:
- Similar main ingredients
- Same cuisine style
- Similar cooking methods
- Comparable flavors

Return only recipe names, one per line:"""

        response = model.generate_content(prompt)
        lines = response.text.strip().split('\n')
        
        recommendations = []
        for line in lines:
            cleaned = line.strip()
            # Remove numbering and formatting
            cleaned = re.sub(r'^\d+\.?\s*', '', cleaned)
            cleaned = re.sub(r'^[-•*]\s*', '', cleaned)
            cleaned = cleaned.strip('"\'')
            
            if cleaned and len(cleaned) > 3:
                recommendations.append(cleaned)
        
        return recommendations[:count]
        
    except Exception as e:
        print(f"❌ AI-only recommendations failed: {e}")
        return []

def simple_database_fallback(dish_name: str) -> list:
    """Simple keyword-based database search as ultimate fallback"""
    try:
        if not recipe_db:
            print("⚠️ Recipe database is empty")
            return []
            
        dish_lower = dish_name.lower()
        suggestions = []
        
        # Extract key words
        keywords = [word for word in dish_lower.split() if len(word) > 2]
        
        if not keywords:
            print("⚠️ No valid keywords extracted from dish name")
            return []
        
        for recipe in recipe_db:
            try:
                title = recipe.get('title', '').lower()
                if title and title != dish_lower:
                    # Check if any keyword matches
                    if any(keyword in title for keyword in keywords):
                        suggestions.append(recipe.get('title', ''))
                        if len(suggestions) >= 5:
                            break
            except Exception as e:
                print(f"⚠️ Error processing recipe: {e}")
                continue
        
        print(f"🔍 Simple fallback found {len(suggestions)} suggestions")
        return suggestions
        
    except Exception as e:
        print(f"❌ Simple database fallback failed: {e}")
        return []

def get_ai_ingredient_recipes(ingredient: str) -> list:
    """Generate AI recipe suggestions for ingredient"""
    try:
        prompt = f"""Generate 8 specific recipe names that use "{ingredient}" as a main ingredient.

Make them diverse:
- Different cuisines (Indian, Italian, Asian, etc.)
- Different meal types (breakfast, lunch, dinner, snacks)
- Both simple and elaborate dishes

Return only recipe names, one per line:"""

        response = model.generate_content(prompt)
        lines = response.text.strip().split('\n')
        
        recipes = []
        for line in lines:
            cleaned = line.strip()
            cleaned = re.sub(r'^\d+\.?\s*', '', cleaned)
            cleaned = re.sub(r'^[-•*]\s*', '', cleaned)
            cleaned = cleaned.strip('"\'')
            
            if cleaned and len(cleaned) > 3:
                recipes.append(cleaned)
        
        return recipes[:8]
        
    except Exception as e:
        print(f"❌ AI ingredient recipes failed: {e}")
        return []

def direct_ingredient_search(ingredient: str) -> list:
    """Direct database search for ingredient - enhanced version"""
    if not recipe_db:
        print("⚠️ Recipe database is empty")
        return []
        
    found_recipes = []
    seen_titles = set()
    
    # Enhanced search with variations
    search_terms = [ingredient]
    
    # Add common variations
    if ingredient == 'paneer':
        search_terms.extend(['cottage cheese', 'indian cheese'])
    elif ingredient == 'chicken':
        search_terms.extend(['poultry'])
    elif ingredient == 'chocolate':
        search_terms.extend(['cocoa', 'cacao'])
    elif ingredient == 'potato':
        search_terms.extend(['potatoes', 'aloo'])
    
    for recipe in recipe_db:
        try:
            ingredients_text = recipe.get('ingredients', '').lower()
            title = recipe.get('title', 'Unknown Recipe')
            
            if title not in seen_titles:
                # Check if any search term is in ingredients
                if any(term in ingredients_text for term in search_terms):
                    found_recipes.append(title)
                    seen_titles.add(title)
                    
                    # Limit results for performance
                    if len(found_recipes) >= 100:
                        break
        except Exception as e:
            print(f"⚠️ Error processing recipe {recipe.get('title', 'Unknown')}: {e}")
            continue
    
    print(f"🔍 Direct search found {len(found_recipes)} recipes for '{ingredient}'")
    return found_recipes

# **🔥 API ROUTES**

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
    """Search for recipes by ingredient with fallback strategies"""
    data = request.get_json()
    ingredient = data.get("ingredient", "").lower().strip()
    offset = int(data.get("offset", 0))

    if not ingredient:
        return jsonify({"error": "Missing ingredient"}), 400

    try:
        print(f"🔍 Searching for ingredient: '{ingredient}'")
        
        # **🔥 TRY MODEL-BASED SEARCH WITH FALLBACK**
        try:
            from model import get_intelligent_recommendations
            
            # Create a pseudo-dish name from ingredient for model
            pseudo_dish = f"{ingredient} recipe"
            result = get_intelligent_recommendations(pseudo_dish, recipe_db, count=15)
            
            if result and result.get('success') and result.get('recommendations'):
                # Filter to only include recipes that actually contain the ingredient
                filtered_recipes = []
                for rec in result['recommendations']:
                    recipe_title = rec.get('title', '')
                    # Find the actual recipe in database
                    for db_recipe in recipe_db:
                        if db_recipe.get('title', '').lower() == recipe_title.lower():
                            ingredients_text = db_recipe.get('ingredients', '').lower()
                            if ingredient in ingredients_text:
                                filtered_recipes.append(recipe_title)
                            break
                
                # If we got enough from model, return them
                if len(filtered_recipes) >= 5:
                    paginated = filtered_recipes[offset:offset+10]
                    return jsonify({
                        "found": len(paginated) > 0,
                        "recipes": paginated,
                        "total_found": len(filtered_recipes),
                        "has_more": offset + 10 < len(filtered_recipes),
                        "algorithm_used": "model_based_ingredient_search",
                        "ingredient_searched": ingredient
                    })
        except Exception as me:
            print(f"⚠️ Model-based ingredient search failed: {me}")
        
        # **🔥 FALLBACK TO DIRECT DATABASE SEARCH**
        direct_matches = direct_ingredient_search(ingredient)
        
        if direct_matches:
            paginated = direct_matches[offset:offset+10]
            return jsonify({
                "found": len(paginated) > 0,
                "recipes": paginated,
                "total_found": len(direct_matches),
                "has_more": offset + 10 < len(direct_matches),
                "algorithm_used": "direct_database_search",
                "ingredient_searched": ingredient
            })
        
        # **🔥 AI FALLBACK FOR INGREDIENT RECIPES**
        try:
            ai_recipes = get_ai_ingredient_recipes(ingredient)
            if ai_recipes:
                return jsonify({
                    "found": True,
                    "recipes": ai_recipes,
                    "total_found": len(ai_recipes),
                    "has_more": False,
                    "algorithm_used": "ai_generated_ingredient_recipes",
                    "ingredient_searched": ingredient,
                    "note": "AI-generated recipe suggestions"
                })
        except Exception as ae:
            print(f"⚠️ AI ingredient fallback failed: {ae}")
        
        # **🔥 NO RESULTS FOUND**
        return jsonify({
            "found": False,
            "recipes": [],
            "total_found": 0,
            "has_more": False,
            "algorithm_used": "no_results",
            "ingredient_searched": ingredient,
            "message": f"No recipes found with {ingredient}. Try a different ingredient or ask for recipe suggestions!"
        })
            
    except Exception as e:
        print(f"❌ Complete ingredient search failure: {e}")
        return jsonify({
            "error": str(e),
            "found": False,
            "recipes": [],
            "algorithm_used": "error_state"
        }), 500

@app.route('/api/generate-recipe-list', methods=['POST'])
def generate_recipe_list():
    """Generate AI-powered recipe list for ingredient"""
    data = request.get_json()
    ingredient = data.get('ingredient', '').strip()
    
    if not ingredient:
        return jsonify({'error': 'Ingredient is required'}), 400

    # Enhanced prompt for better variety
    prompt = f"""Generate 10 diverse and appealing recipe names that prominently feature "{ingredient}" as a main ingredient.

Requirements:
- Include variety in cuisines (Indian, Italian, Asian, Mexican, American, etc.)
- Mix of meal types (breakfast, lunch, dinner, snacks, desserts)
- Range from quick 15-minute recipes to elaborate dishes
- Include both traditional and modern fusion recipes
- Make each recipe name specific and appetizing
- Ensure {ingredient} is clearly the star ingredient

Examples for paneer:
- Paneer Butter Masala
- Grilled Paneer Tikka
- Paneer Fried Rice
- Spinach Paneer Wrap
- Paneer Tikka Pizza

Return only the recipe names in a numbered list format:
1. [Recipe Name]
2. [Recipe Name]
etc."""

    try:
        response = model.generate_content(prompt)
        
        # Enhanced parsing
        suggestions_text = response.text.strip()
        
        # Clean and format the response
        lines = suggestions_text.split('\n')
        formatted_suggestions = []
        
        for i, line in enumerate(lines, 1):
            cleaned = line.strip()
            # Remove existing numbering
            cleaned = re.sub(r'^\d+\.?\s*', '', cleaned)
            # Remove bullets
            cleaned = re.sub(r'^[-•*]\s*', '', cleaned)
            
            if cleaned and len(cleaned) > 3:
                # Add our own numbering
                formatted_suggestions.append(f"{i}. {cleaned}")
        
        # Join back into text
        final_suggestions = '\n'.join(formatted_suggestions[:10])
        
        print(f"✅ Generated {len(formatted_suggestions)} recipe suggestions for '{ingredient}'")
        
        return jsonify({
            'suggestions': final_suggestions,
            'ingredient': ingredient,
            'count': len(formatted_suggestions),
            'source': 'ai_generated_list'
        })
        
    except Exception as e:
        print(f"❌ Error generating recipe list for '{ingredient}': {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/related-recipes', methods=['POST'])
def related_recipes():
    """Model-based intelligent recipe recommendations with proper error handling"""
    data = request.get_json()
    dish_name = data.get('dish_name', '').strip()
    
    if not dish_name:
        return jsonify({'error': 'Dish name is required'}), 400
    
    try:
        print(f"🤖 Getting model-based recommendations for: '{dish_name}'")
        
        # **🔥 TRY MODEL-BASED RECOMMENDATION ENGINE WITH FALLBACK**
        try:
            from model import get_intelligent_recommendations
            result = get_intelligent_recommendations(dish_name, recipe_db, count=5)
            
            if result and result.get('success'):
                recommendations = [rec['title'] for rec in result.get('recommendations', [])]
                
                print(f"✅ Model-based system returned {len(recommendations)} recommendations")
                
                return jsonify({
                    'success': True,
                    'dish_name': dish_name,
                    'suggestions': recommendations,
                    'algorithm_used': f"model_based_{result.get('source', 'unknown')}",
                    'confidence': result.get('confidence', 'medium')
                })
        except ImportError as ie:
            print(f"⚠️ Model import failed: {ie}")
        except Exception as me:
            print(f"⚠️ Model-based recommendations failed: {me}")
        
        # **🔥 FALLBACK TO SIMPLE AI RECOMMENDATIONS**
        try:
            ai_suggestions = get_ai_only_recommendations(dish_name, count=5)
            if ai_suggestions:
                return jsonify({
                    'success': True,
                    'dish_name': dish_name,
                    'suggestions': ai_suggestions,
                    'algorithm_used': 'ai_only_fallback',
                    'confidence': 'medium'
                })
        except Exception as ae:
            print(f"⚠️ AI-only recommendations failed: {ae}")
        
        # **🔥 FALLBACK TO DATABASE SEARCH**
        try:
            fallback_suggestions = simple_database_fallback(dish_name)
            if fallback_suggestions:
                return jsonify({
                    'success': True,
                    'dish_name': dish_name,
                    'suggestions': fallback_suggestions,
                    'algorithm_used': 'simple_database_fallback',
                    'note': 'Using simple database search as fallback'
                })
        except Exception as de:
            print(f"⚠️ Database fallback failed: {de}")
        
        # **🔥 ULTIMATE FALLBACK - RETURN EMPTY BUT SUCCESSFUL**
        return jsonify({
            'success': True,
            'dish_name': dish_name,
            'suggestions': [],
            'algorithm_used': 'no_recommendations_available',
            'note': 'No recommendations could be generated at this time'
        })
    
    except Exception as e:
        print(f"❌ Complete failure in recommendations: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'dish_name': dish_name,
            'suggestions': []
        }), 500

# **🔥 HEALTH CHECK ENDPOINT**
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with proper error handling"""
    try:
        return jsonify({
            'status': 'healthy',
            'database_loaded': len(recipe_db) > 0,
            'total_recipes': len(recipe_db),
            'model_available': model is not None,
            'timestamp': str(datetime.now())
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'database_loaded': False,
            'total_recipes': 0,
            'model_available': False
        }), 500

# Also add a simple root endpoint for testing:
@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Recipe Chatbot API is running',
        'status': 'online',
        'endpoints': [
            '/api/health',
            '/api/search-recipe',
            '/api/generate-recipe',
            '/api/search-by-ingredient',
            '/api/related-recipes'
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    # Configure for production
    if os.environ.get('FLASK_ENV') == 'production':
        app.config['DEBUG'] = False
        host = '0.0.0.0'
        # Update CORS for production - add your Vercel URL here after deployment
        CORS(app, origins=[
            "http://localhost:3000",  # Development
            "https://*.vercel.app",   # All Vercel apps
            "https://your-vercel-app.vercel.app"  # Replace with actual URL
        ])
        print(f"🚀 Production mode on {host}:{port}")
    else:
        app.config['DEBUG'] = True
        host = 'localhost'
        CORS(app, origins=["http://localhost:3000"])
        print(f"🔧 Development mode on {host}:{port}")
    
    print(f"🌍 Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"🔗 CORS configured for: {app.config.get('origins', 'localhost')}")
    
    app.run(host=host, port=port, debug=app.config['DEBUG'])