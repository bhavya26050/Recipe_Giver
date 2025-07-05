import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Dict, List, Tuple
import google.generativeai as genai
import os
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

# Load dataset from the same directory
base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, "recipes_small.csv")

# Load and clean dataset
df = pd.read_csv(csv_path)
df.dropna(subset=['ingredients'], inplace=True)

# TF-IDF Vectorizer
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['ingredients'])

# Recipe recommendation logic
def recommend_recipes(user_ingredients, top_n=5):
    user_vec = vectorizer.transform([user_ingredients])
    cosine_sim = cosine_similarity(user_vec, tfidf_matrix)
    top_indices = cosine_sim[0].argsort()[-top_n:][::-1]
    return df.iloc[top_indices][['title', 'ingredients']]

# 🏷️ DIETARY CLASSIFICATION IMPLEMENTATION
class DietaryClassifier:
    def __init__(self):
        # Define dietary keywords and patterns
        self.dietary_patterns = {
            'vegetarian': {
                'exclude': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'meat', 'bacon', 'ham', 'sausage', 'turkey'],
                'confidence_boost': ['vegetables', 'veggie', 'vegetarian', 'plant-based']
            },
            'vegan': {
                'exclude': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'meat', 'egg', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'honey'],
                'confidence_boost': ['vegan', 'plant-based', 'coconut milk', 'almond milk', 'cashew']
            },
            'gluten_free': {
                'exclude': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'soy sauce', 'beer', 'barley', 'rye'],
                'include': ['rice', 'quinoa', 'gluten-free', 'corn'],
                'confidence_boost': ['gluten-free', 'rice flour', 'almond flour']
            },
            'dairy_free': {
                'exclude': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cottage cheese'],
                'include': ['coconut milk', 'almond milk', 'oat milk', 'dairy-free'],
                'confidence_boost': ['dairy-free', 'lactose-free', 'coconut cream']
            },
            'keto_friendly': {
                'include': ['avocado', 'cheese', 'olive oil', 'coconut oil', 'nuts', 'salmon', 'chicken thigh'],
                'exclude': ['rice', 'pasta', 'bread', 'potato', 'sugar', 'flour', 'banana'],
                'confidence_boost': ['keto', 'low-carb', 'high-fat']
            },
            'high_protein': {
                'include': ['chicken', 'beef', 'fish', 'salmon', 'eggs', 'protein powder', 'quinoa', 'lentils', 'beans'],
                'confidence_boost': ['protein', 'lean', 'high-protein']
            },
            'low_carb': {
                'exclude': ['rice', 'pasta', 'bread', 'potato', 'noodles', 'flour', 'sugar'],
                'include': ['cauliflower', 'zucchini', 'spinach', 'broccoli'],
                'confidence_boost': ['low-carb', 'carb-free', 'cauliflower rice']
            }
        }
    
    def classify_recipe(self, ingredients_text: str, title: str = "") -> Dict[str, float]:
        """
        Classify recipe based on dietary restrictions
        Returns confidence scores for each dietary category (0.0 to 1.0)
        """
        ingredients_lower = ingredients_text.lower()
        title_lower = title.lower()
        full_text = f"{ingredients_lower} {title_lower}"
        
        classifications = {}
        
        for diet_type, patterns in self.dietary_patterns.items():
            confidence = self._calculate_confidence(full_text, patterns)
            classifications[diet_type] = round(confidence, 2)
        
        return classifications
    
    def _calculate_confidence(self, text: str, patterns: Dict) -> float:
        """Calculate confidence score for a specific dietary classification"""
        confidence = 0.5  # Base confidence
        
        # Check exclusions (reduce confidence if found)
        if 'exclude' in patterns:
            for exclude_word in patterns['exclude']:
                if exclude_word in text:
                    confidence -= 0.3
        
        # Check inclusions (increase confidence if found)
        if 'include' in patterns:
            include_count = sum(1 for include_word in patterns['include'] if include_word in text)
            confidence += include_count * 0.2
        
        # Check confidence boosters (strong indicators)
        if 'confidence_boost' in patterns:
            boost_count = sum(1 for boost_word in patterns['confidence_boost'] if boost_word in text)
            confidence += boost_count * 0.4
        
        # Ensure confidence is between 0 and 1
        return max(0.0, min(1.0, confidence))
    
    def get_dietary_tags(self, ingredients_text: str, title: str = "", threshold: float = 0.6) -> List[str]:
        """Get dietary tags that meet the confidence threshold"""
        classifications = self.classify_recipe(ingredients_text, title)
        return [diet_type for diet_type, confidence in classifications.items() if confidence >= threshold]

# Initialize dietary classifier
dietary_classifier = DietaryClassifier()

def classify_recipe_dietary(ingredients: str, title: str = "") -> Dict:
    """Classify recipe for dietary restrictions"""
    classifications = dietary_classifier.classify_recipe(ingredients, title)
    tags = dietary_classifier.get_dietary_tags(ingredients, title)
    
    return {
        'classifications': classifications,
        'dietary_tags': tags,
        'is_vegetarian': classifications.get('vegetarian', 0) >= 0.6,
        'is_vegan': classifications.get('vegan', 0) >= 0.6,
        'is_gluten_free': classifications.get('gluten_free', 0) >= 0.6,
        'is_dairy_free': classifications.get('dairy_free', 0) >= 0.6,
        'is_keto_friendly': classifications.get('keto_friendly', 0) >= 0.6,
        'is_high_protein': classifications.get('high_protein', 0) >= 0.6,
        'is_low_carb': classifications.get('low_carb', 0) >= 0.6
    }

# 📅 MEAL PLANNING IMPLEMENTATION
class MealPlanner:
    def __init__(self, recipes_df):
        self.recipes_df = recipes_df
        self.meal_types = {
            'breakfast': ['breakfast', 'pancake', 'oatmeal', 'toast', 'cereal', 'smoothie', 'eggs', 'muffin'],
            'lunch': ['salad', 'sandwich', 'soup', 'wrap', 'bowl', 'quinoa', 'pasta'],
            'dinner': ['chicken', 'beef', 'fish', 'curry', 'stir fry', 'roast', 'casserole', 'rice'],
            'snack': ['snack', 'chips', 'nuts', 'fruit', 'bar', 'cookie', 'crackers'],
            'dessert': ['cake', 'pie', 'ice cream', 'chocolate', 'dessert', 'sweet', 'cookie', 'brownie']
        }
    
    def categorize_recipe_by_meal(self, title: str, ingredients: str) -> str:
        """Categorize recipe into meal type based on title and ingredients"""
        text = f"{title} {ingredients}".lower()
        
        meal_scores = {}
        for meal_type, keywords in self.meal_types.items():
            score = sum(1 for keyword in keywords if keyword in text)
            meal_scores[meal_type] = score
        
        # Return meal type with highest score, default to 'dinner'
        return max(meal_scores, key=meal_scores.get) if max(meal_scores.values()) > 0 else 'dinner'
    
    def generate_weekly_meal_plan(self, dietary_preferences: List[str] = None) -> Dict:
        """Generate a 7-day meal plan"""
        if dietary_preferences is None:
            dietary_preferences = []
        
        # Categorize all recipes by meal type
        categorized_recipes = {'breakfast': [], 'lunch': [], 'dinner': [], 'snack': [], 'dessert': []}
        
        for _, recipe in self.recipes_df.iterrows():
            title = recipe.get('title', '')
            ingredients = recipe.get('ingredients', '')
            
            # Apply dietary filters if specified
            if dietary_preferences:
                dietary_info = classify_recipe_dietary(ingredients, title)
                if not self._meets_dietary_requirements(dietary_info, dietary_preferences):
                    continue
            
            meal_type = self.categorize_recipe_by_meal(title, ingredients)
            categorized_recipes[meal_type].append({
                'title': title,
                'ingredients': ingredients,
                'meal_type': meal_type
            })
        
        # Generate 7-day plan
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        meal_plan = {}
        
        for day in days:
            meal_plan[day] = {
                'breakfast': self._select_random_recipe(categorized_recipes['breakfast']),
                'lunch': self._select_random_recipe(categorized_recipes['lunch']),
                'dinner': self._select_random_recipe(categorized_recipes['dinner']),
                'snack': self._select_random_recipe(categorized_recipes['snack'])
            }
        
        return {
            'meal_plan': meal_plan,
            'dietary_preferences': dietary_preferences,
            'total_recipes': len([r for day_meals in meal_plan.values() for r in day_meals.values() if r])
        }
    
    def _meets_dietary_requirements(self, dietary_info: Dict, preferences: List[str]) -> bool:
        """Check if recipe meets dietary requirements"""
        for preference in preferences:
            preference_key = f"is_{preference}"
            if preference_key in dietary_info and not dietary_info[preference_key]:
                return False
        return True
    
    def _select_random_recipe(self, recipes: List[Dict]) -> Dict:
        """Select a random recipe from the list"""
        if not recipes:
            return {'title': 'No suitable recipe found', 'ingredients': '', 'meal_type': 'unknown'}
        
        return random.choice(recipes)
    
    def get_recipes_by_meal_type(self, meal_type: str, limit: int = 10) -> List[Dict]:
        """Get recipes filtered by meal type"""
        categorized_recipes = []
        
        for _, recipe in self.recipes_df.iterrows():
            title = recipe.get('title', '')
            ingredients = recipe.get('ingredients', '')
            
            if self.categorize_recipe_by_meal(title, ingredients) == meal_type:
                categorized_recipes.append({
                    'title': title,
                    'ingredients': ingredients,
                    'meal_type': meal_type,
                    'dietary_info': classify_recipe_dietary(ingredients, title)
                })
        
        return categorized_recipes[:limit]

# Initialize meal planner
meal_planner = MealPlanner(df)

def suggest_related_recipes(recipes_df, dish_name: str):
    """Suggest related recipes based on dish name"""
    related = recipes_df[recipes_df['title'].str.contains(dish_name.split()[-1], case=False, na=False)]
    related = related[~related['title'].str.lower().eq(dish_name.lower())]
    suggestions = related['title'].dropna().unique().tolist()[:5]

    main_recipe_text = f"Main Recipe: {dish_name}\nIngredients: {', '.join(related['ingredients'].dropna().tolist())}"
    
    if suggestions:
        main_recipe_text += "\n\n🍽️ You might also enjoy:\n"
        for s in suggestions:
            main_recipe_text += f"- {s}\n"
    
    return main_recipe_text

# AI integration functions
def classify_recipe_dietary(ingredients_text: str, recipe_title: str = "") -> dict:
    """Classify recipe for dietary restrictions using AI"""
    if not model:
        return {
            'dietary_tags': ['general'], 
            'allergens': [], 
            'is_healthy': True, 
            'difficulty': 'medium'
        }
    
    prompt = f"""Analyze this recipe and identify dietary tags.

Recipe: {recipe_title}
Ingredients: {ingredients_text}

Return ONLY a JSON object with this exact format:
{{
    "dietary_tags": ["vegetarian", "gluten_free", "dairy_free"],
    "allergens": ["nuts", "dairy", "gluten"],
    "is_healthy": true,
    "difficulty": "easy"
}}

Available tags: vegetarian, vegan, gluten_free, dairy_free, keto_friendly, high_protein, low_carb, paleo, nut_free
Allergens: nuts, dairy, gluten, eggs, soy, shellfish, fish
Difficulty: easy, medium, hard"""

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

def generate_meal_plan(days: int = 7, dietary_preferences: list = [], cuisine_preferences: list = [], cooking_time_preference: str = "any") -> str:
    """Generate a personalized meal plan using AI"""
    if not model:
        print("❌ AI model not available for meal plan generation")
        return """## 📅 Your 7-Day Meal Plan (Fallback)

### Day 1 (Monday)
**🌅 Breakfast:** Avocado Toast with Scrambled Eggs
**🌞 Lunch:** Quinoa Salad with Grilled Chicken  
**🌙 Dinner:** Baked Salmon with Roasted Vegetables

### Day 2 (Tuesday)
**🌅 Breakfast:** Greek Yogurt with Berries and Granola
**🌞 Lunch:** Turkey and Hummus Wrap
**🌙 Dinner:** Spaghetti with Marinara Sauce

### Day 3 (Wednesday)
**🌅 Breakfast:** Oatmeal with Banana and Nuts
**🌞 Lunch:** Caesar Salad with Grilled Chicken
**🌙 Dinner:** Stir-fried Vegetables with Tofu

### Day 4 (Thursday)
**🌅 Breakfast:** Smoothie Bowl with Mixed Fruits
**🌞 Lunch:** Lentil Soup with Crusty Bread
**🌙 Dinner:** Grilled Chicken with Sweet Potato

### Day 5 (Friday)
**🌅 Breakfast:** Pancakes with Fresh Berries
**🌞 Lunch:** Quinoa Buddha Bowl
**🌙 Dinner:** Fish Tacos with Avocado

### Day 6 (Saturday)
**🌅 Breakfast:** French Toast with Maple Syrup
**🌞 Lunch:** Caprese Salad with Baguette
**🌙 Dinner:** BBQ Chicken with Corn on the Cob

### Day 7 (Sunday)
**🌅 Breakfast:** Breakfast Burrito with Eggs and Beans
**🌞 Lunch:** Vegetable Soup with Grilled Cheese
**🌙 Dinner:** Sunday Roast with Yorkshire Pudding

### 🛒 Shopping List
**Proteins:** Eggs, chicken, salmon, turkey, tofu, fish
**Vegetables:** Avocado, mixed greens, tomatoes, bell peppers
**Grains:** Quinoa, bread, pasta, oats
**Dairy:** Greek yogurt, cheese, milk"""
    
    # Build dietary restrictions string
    dietary_str = ""
    if dietary_preferences:
        dietary_str = f"Dietary restrictions: {', '.join(dietary_preferences)}. "
    
    # Build cuisine preferences string  
    cuisine_str = ""
    if cuisine_preferences:
        cuisine_str = f"Preferred cuisines: {', '.join(cuisine_preferences)}. "
    
    # Build cooking time preference
    time_str = ""
    if cooking_time_preference and cooking_time_preference != "any":
        time_str = f"Prefer {cooking_time_preference} cooking time recipes. "
    
    prompt = f"""Create a detailed {days}-day meal plan with breakfast, lunch, and dinner for each day.

Requirements:
- {dietary_str}
- {cuisine_str}
- {time_str}
- Include variety in ingredients and cooking methods
- Balance nutrition across the week
- Make it practical for home cooking
- Include prep tips

Format as markdown with:
## 📅 Your {days}-Day Personalized Meal Plan

### Day 1 (Monday)
**🌅 Breakfast:** [Dish Name] - [Brief description]
**🌞 Lunch:** [Dish Name] - [Brief description]  
**🌙 Dinner:** [Dish Name] - [Brief description]

[Continue for all days]

### 🛒 Smart Shopping List
**Proteins:** [list items]
**Vegetables & Fruits:** [list items]
**Grains & Starches:** [list items]
**Dairy & Alternatives:** [list items]
**Pantry Essentials:** [list items]

### 💡 Meal Prep Tips
- [3-4 practical tips for the week]

Make it engaging, practical, and personalized!"""

    try:
        print(f"🤖 Generating meal plan with prompt: {prompt[:100]}...")
        response = model.generate_content(prompt)
        generated_plan = response.text.strip()
        print("✅ Meal plan generated successfully")
        return generated_plan
    except Exception as e:
        print(f"❌ Error generating meal plan: {e}")
        return f"Sorry, I couldn't generate a meal plan right now. Error: {str(e)}"

def get_meal_type_recipes(meal_type: str, limit: int = 10, dietary_preferences: list = []) -> list:
    """Generate recipe suggestions for specific meal types using AI"""
    if not model:
        fallback_recipes = {
            'breakfast': [
                'Avocado Toast with Poached Egg', 'Greek Yogurt Parfait with Berries', 
                'Overnight Oats with Banana', 'Veggie Scrambled Eggs', 'Smoothie Bowl'
            ],
            'lunch': [
                'Quinoa Buddha Bowl', 'Grilled Chicken Caesar Salad', 'Turkey Club Sandwich',
                'Lentil Soup with Crusty Bread', 'Pasta Primavera'
            ],
            'dinner': [
                'Baked Salmon with Roasted Vegetables', 'Chicken Stir Fry', 'Spaghetti Carbonara',
                'Beef Tacos with Black Beans', 'Vegetable Curry with Rice'
            ]
        }
        return fallback_recipes.get(meal_type, ['Sample Recipe'])[:limit]
    
    # Build dietary restrictions
    dietary_str = ""
    if dietary_preferences:
        dietary_str = f" that are {', '.join(dietary_preferences)}"
    
    prompt = f"""Generate {limit} diverse and appealing {meal_type} recipe names{dietary_str}.

Requirements:
- Include variety in cuisines (American, Italian, Asian, Mexican, Indian, etc.)
- Mix of cooking methods (baked, grilled, pan-fried, no-cook, etc.)  
- Range from quick 15-minute meals to more elaborate dishes
- Include both classic and creative modern recipes
- Make them sound appetizing and specific

Return ONLY a numbered list of recipe names, no descriptions:
1. [Recipe Name]
2. [Recipe Name]
etc."""

    try:
        response = model.generate_content(prompt)
        
        # Parse the response to extract just the recipe names
        lines = response.text.strip().split('\n')
        recipes = []
        
        for line in lines:
            # Remove numbering and clean up
            cleaned = re.sub(r'^\d+\.\s*', '', line.strip())
            if cleaned and len(cleaned) > 3:
                recipes.append(cleaned)
        
        return recipes[:limit]
        
    except Exception as e:
        print(f"❌ Error generating {meal_type} recipes: {e}")
        # Fallback recipes by meal type
        fallback_recipes = {
            'breakfast': [
                'Avocado Toast with Poached Egg', 'Greek Yogurt Parfait with Berries', 
                'Overnight Oats with Banana', 'Veggie Scrambled Eggs', 'Smoothie Bowl'
            ],
            'lunch': [
                'Quinoa Buddha Bowl', 'Grilled Chicken Caesar Salad', 'Turkey Club Sandwich',
                'Lentil Soup with Crusty Bread', 'Pasta Primavera'
            ],
            'dinner': [
                'Baked Salmon with Roasted Vegetables', 'Chicken Stir Fry', 'Spaghetti Carbonara',
                'Beef Tacos with Black Beans', 'Vegetable Curry with Rice'
            ]
        }
        return fallback_recipes.get(meal_type, ['Sample Recipe'])[:limit]

def generate_shopping_list(meal_plan_text: str) -> dict:
    """Extract and organize shopping list from meal plan using AI"""
    if not model:
        return {
            'proteins': ['chicken', 'fish', 'eggs', 'beans'],
            'vegetables': ['broccoli', 'carrots', 'spinach', 'onions'],
            'fruits': ['bananas', 'berries', 'apples'],
            'grains': ['rice', 'quinoa', 'bread'],
            'dairy': ['milk', 'yogurt', 'cheese'],
            'pantry': ['olive oil', 'salt', 'pepper', 'garlic'],
            'estimated_cost': '$60-80',
            'serves': '2 people'
        }
    
    prompt = f"""From this meal plan, create a comprehensive shopping list organized by category.

Meal Plan:
{meal_plan_text}

Return ONLY a JSON object with this format:
{{
    "proteins": ["chicken breast", "salmon fillets", "eggs"],
    "vegetables": ["broccoli", "carrots", "spinach"],
    "fruits": ["bananas", "berries", "apples"],
    "grains": ["quinoa", "brown rice", "whole wheat bread"],
    "dairy": ["greek yogurt", "milk", "cheese"],
    "pantry": ["olive oil", "garlic", "onions", "spices"],
    "estimated_cost": "$75-100",
    "serves": "2-3 people"
}}"""

    try:
        response = model.generate_content(prompt)
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"❌ Error generating shopping list: {e}")
        return {
            'proteins': ['chicken', 'fish', 'eggs'],
            'vegetables': ['vegetables', 'fruits'],
            'grains': ['rice', 'bread'],
            'dairy': ['milk', 'cheese'],
            'pantry': ['cooking oil', 'spices'],
            'estimated_cost': '$50-70',
            'serves': '2 people'
        }

# Add these new AI-powered recommendation functions:

def get_smart_recipe_recommendations(dish_name: str, recipe_db: list, count: int = 5) -> dict:
    """Advanced AI-powered recipe recommendations using multiple strategies"""
    
    if not model:
        return {
            'suggestions': get_fallback_recommendations(dish_name),
            'algorithm': 'fallback',
            'confidence': 'low'
        }
    
    try:
        # **🔥 MULTI-STRATEGY AI RECOMMENDATION**
        
        # Strategy 1: Semantic similarity analysis
        semantic_suggestions = get_semantic_recommendations(dish_name)
        
        # Strategy 2: Ingredient-based recommendations
        ingredient_suggestions = get_ingredient_based_recommendations(dish_name, recipe_db)
        
        # Strategy 3: Cultural/cuisine recommendations
        cultural_suggestions = get_cultural_recommendations(dish_name)
        
        # Strategy 4: Nutritional similarity recommendations
        nutritional_suggestions = get_nutritional_recommendations(dish_name)
        
        # **🔥 COMBINE AND RANK SUGGESTIONS**
        all_suggestions = []
        
        # Add semantic suggestions (highest priority)
        all_suggestions.extend([(s, 'semantic', 0.9) for s in semantic_suggestions[:2]])
        
        # Add ingredient-based suggestions
        all_suggestions.extend([(s, 'ingredient', 0.8) for s in ingredient_suggestions[:2]])
        
        # Add cultural suggestions
        all_suggestions.extend([(s, 'cultural', 0.7) for s in cultural_suggestions[:2]])
        
        # Add nutritional suggestions
        all_suggestions.extend([(s, 'nutritional', 0.6) for s in nutritional_suggestions[:1]])
        
        # **🔥 REMOVE DUPLICATES AND RANK**
        unique_suggestions = []
        seen = set()
        
        for suggestion, strategy, confidence in all_suggestions:
            suggestion_clean = suggestion.lower().strip()
            if suggestion_clean not in seen and suggestion_clean != dish_name.lower():
                unique_suggestions.append({
                    'recipe': suggestion,
                    'strategy': strategy,
                    'confidence': confidence,
                    'reasoning': get_recommendation_reasoning(dish_name, suggestion, strategy)
                })
                seen.add(suggestion_clean)
                
                if len(unique_suggestions) >= count:
                    break
        
        return {
            'suggestions': [s['recipe'] for s in unique_suggestions],
            'detailed_suggestions': unique_suggestions,
            'algorithm': 'multi_strategy_ai',
            'confidence': 'high',
            'strategies_used': list(set([s['strategy'] for s in unique_suggestions]))
        }
        
    except Exception as e:
        print(f"❌ Error in smart recommendations: {e}")
        return {
            'suggestions': get_fallback_recommendations(dish_name),
            'algorithm': 'fallback_after_error',
            'confidence': 'low',
            'error': str(e)
        }

def get_semantic_recommendations(dish_name: str) -> list:
    """Get recommendations based on semantic similarity"""
    prompt = f"""Based on the dish "{dish_name}", suggest 3 recipes that are semantically similar.

Consider:
- Similar flavor profiles
- Comparable complexity
- Same comfort level (comfort food vs fine dining)
- Similar eating experience
- Cultural proximity

Focus on dishes that would appeal to someone who enjoys "{dish_name}".

Return only recipe names, one per line:"""

    try:
        response = model.generate_content(prompt)
        return parse_ai_suggestions(response.text)
    except:
        return []

def get_ingredient_based_recommendations(dish_name: str, recipe_db: list) -> list:
    """Get recommendations based on shared ingredients"""
    prompt = f"""Analyze the main ingredients in "{dish_name}" and suggest 3 recipes that share key ingredients but offer variety.

Consider:
- Primary protein/main ingredient
- Key spices and seasonings
- Base ingredients (rice, pasta, etc.)
- Cooking fats and aromatics

Suggest recipes that use similar ingredients in different ways.

Return only recipe names, one per line:"""

    try:
        response = model.generate_content(prompt)
        ai_suggestions = parse_ai_suggestions(response.text)
        
        # **🔥 ENHANCE WITH DATABASE VERIFICATION**
        verified_suggestions = []
        for suggestion in ai_suggestions:
            # Check if similar recipe exists in database
            if recipe_exists_in_db(suggestion, recipe_db):
                verified_suggestions.append(suggestion)
            else:
                verified_suggestions.append(suggestion)  # Keep AI suggestion even if not in DB
        
        return verified_suggestions
    except:
        return []

def get_cultural_recommendations(dish_name: str) -> list:
    """Get recommendations from same or related cuisines"""
    prompt = f"""Based on the cultural/regional cuisine of "{dish_name}", suggest 3 recipes from the same or closely related culinary traditions.

Consider:
- Same regional cuisine
- Neighboring culinary traditions
- Historical culinary connections
- Similar cooking techniques and flavor principles

Return only recipe names, one per line:"""

    try:
        response = model.generate_content(prompt)
        return parse_ai_suggestions(response.text)
    except:
        return []

def get_nutritional_recommendations(dish_name: str) -> list:
    """Get recommendations with similar nutritional profile"""
    prompt = f"""Based on the nutritional characteristics of "{dish_name}", suggest 2 recipes with similar:

- Caloric density
- Macronutrient balance (protein/carb/fat ratio)
- Satiety level
- Healthiness quotient

Focus on nutritionally similar alternatives.

Return only recipe names, one per line:"""

    try:
        response = model.generate_content(prompt)
        return parse_ai_suggestions(response.text)
    except:
        return []

def get_recommendation_reasoning(original_dish: str, suggested_dish: str, strategy: str) -> str:
    """Generate reasoning for why a recipe was recommended"""
    reasoning_prompts = {
        'semantic': f"Why would someone who likes {original_dish} also enjoy {suggested_dish}? Focus on taste and experience similarities.",
        'ingredient': f"What key ingredients do {original_dish} and {suggested_dish} share that make them good companions?",
        'cultural': f"How are {original_dish} and {suggested_dish} culturally or regionally connected?",
        'nutritional': f"What nutritional similarities make {original_dish} and {suggested_dish} good alternatives?"
    }
    
    try:
        prompt = reasoning_prompts.get(strategy, f"Why is {suggested_dish} a good recommendation for someone who likes {original_dish}?")
        response = model.generate_content(f"{prompt} Keep it brief (1-2 sentences).")
        return response.text.strip()
    except:
        return f"Similar to {original_dish} in {strategy} characteristics."

def parse_ai_suggestions(ai_response: str) -> list:
    """Parse AI response to extract clean recipe names"""
    suggestions = []
    lines = ai_response.strip().split('\n')
    
    for line in lines:
        # Clean up the line
        cleaned = line.strip()
        # Remove numbering, bullets, etc.
        cleaned = re.sub(r'^\d+\.?\s*', '', cleaned)
        cleaned = re.sub(r'^[-•*]\s*', '', cleaned)
        cleaned = cleaned.strip('"\'')
        
        if cleaned and len(cleaned) > 3:
            suggestions.append(cleaned)
    
    return suggestions

def recipe_exists_in_db(recipe_name: str, recipe_db: list) -> bool:
    """Check if a recipe exists in the database"""
    recipe_lower = recipe_name.lower()
    for recipe in recipe_db:
        if recipe_lower in recipe.get('title', '').lower():
            return True
    return False

def get_fallback_recommendations(dish_name: str) -> list:
    """Fallback recommendations when AI is unavailable"""
    dish_lower = dish_name.lower()
    
    # Simple keyword-based fallback
    if 'chicken' in dish_lower:
        return ['Chicken Tikka Masala', 'Grilled Chicken Salad', 'Chicken Stir Fry']
    elif 'paneer' in dish_lower:
        return ['Palak Paneer', 'Paneer Tikka', 'Shahi Paneer']
    elif 'chocolate' in dish_lower:
        return ['Chocolate Brownies', 'Chocolate Chip Cookies', 'Chocolate Mousse']
    elif 'pasta' in dish_lower:
        return ['Spaghetti Carbonara', 'Penne Arrabbiata', 'Lasagna']
    else:
        return ['Mixed Vegetable Curry', 'Fried Rice', 'Caesar Salad']
