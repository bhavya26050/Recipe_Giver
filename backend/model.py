import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Dict, List, Tuple

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
        
        import random
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

def generate_meal_plan(days: int = 7, dietary_preferences: List[str] = None) -> Dict:
    """Generate meal plan for specified number of days"""
    return meal_planner.generate_weekly_meal_plan(dietary_preferences)

def get_meal_type_recipes(meal_type: str, limit: int = 10) -> List[Dict]:
    """Get recipes by meal type"""
    return meal_planner.get_recipes_by_meal_type(meal_type, limit)
