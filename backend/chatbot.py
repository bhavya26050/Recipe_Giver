# import pandas as pd
# import google.generativeai as genai

# # ================== 📌 Load recipe dataset ==================
# df = pd.read_csv('recipes_small.csv')

# # Optional: Check columns
# print("\n🧾 Available columns in your dataset:\n", df.columns)

# # ================== 📌 Configure Gemini API ==================
# API_KEY = "AIzaSyB9j4RN16unVw2yPMA95_h0fWRYnHB5h98"  # Replace with your actual API key
# genai.configure(api_key=API_KEY)

# model = genai.GenerativeModel("gemini-1.5-pro")

# response = model.generate_content("Give me a simple tomato soup recipe.")

# print(response.text)

# # ================== 📌 Function to list available models ==================
# def list_models():
#     models = genai.list_models()
#     print("\n📝 Available models:")
#     for model in models:
#         print(f"- {model.name} (methods: {model.supported_generation_methods})")

# # ================== 📌 Function to ask Gemini ==================
# def ask_gemini(prompt):
#     model = genai.GenerativeModel("models/gemini-1.5-pro")  # ✅ Fixed model name
#     response = model.generate_content(prompt)
#     return response.text

# # ================== 📌 Function to search recipes by ingredients ==================
# def search_by_ingredients(ingredients_list):
#     ingredients_list = [ingredient.strip().lower() for ingredient in ingredients_list]
#     matching_recipes = []
#     for _, row in df.iterrows():
#         recipe_ingredients = str(row['ingredients']).lower()
#         if all(ingredient in recipe_ingredients for ingredient in ingredients_list):
#             matching_recipes.append({
#                 'title': row['title'],
#                 'ingredients': row['ingredients'],
#                 'instructions': row['directions']
#             })
#     return matching_recipes

# # ================== 📌 Function to search recipes by dish name ==================
# def search_by_dish_name(dish_name):
#     result = df[df['title'].str.contains(dish_name, case=False, na=False)]
#     if not result.empty:
#         return result[['title', 'ingredients', 'directions']].to_dict(orient='records')
#     else:
#         return "❌ Sorry, no recipe found for that dish."

# # ================== 📌 Function to suggest random recipes ==================
# def suggest_random_recipes(n=3):
#     suggestions = df.sample(n)
#     return suggestions[['title', 'ingredients', 'directions']].to_dict(orient='records')

# # ================== 📌 Main chatbot loop ==================
# def chatbot():
#     print("👩‍🍳 Welcome to Recipe Chatbot! 🍳 Type 'exit' to quit anytime.")
    
#     while True:
#         user_input = input("\nYou: ").lower()

#         if "ingredients" in user_input:
#             ingredients = input("👉 Enter ingredients separated by commas: ").split(',')
#             results = search_by_ingredients(ingredients)
#             if results:
#                 print(f"\n🍽️ Found {len(results)} recipe(s) with those ingredients:")
#                 for recipe in results:
#                     print("\n===============================")
#                     print(f"🍽️ {recipe['title']}")
#                     print(f"Ingredients: {recipe['ingredients']}")
#                     print(f"Instructions: {recipe['instructions']}")
#             else:
#                 print("❌ Sorry, no recipes found with those ingredients.")

#         elif "dish" in user_input:
#             dish_name = input("👉 Enter dish name: ")
#             result = search_by_dish_name(dish_name)
#             if isinstance(result, list):
#                 print(f"\n🍽️ Found {len(result)} recipe(s) with that dish name:")
#                 for recipe in result:
#                     print("\n===============================")
#                     print(f"🍽️ {recipe['title']}")
#                     print(f"Ingredients: {recipe['ingredients']}")
#                     print(f"Instructions: {recipe['directions']}")
#             else:
#                 print(result)

#         elif "suggest" in user_input:
#             suggestions = suggest_random_recipes()
#             print(f"\n🎲 Here are {len(suggestions)} random recipe suggestions for you:")
#             for recipe in suggestions:
#                 print("\n===============================")
#                 print(f"🍽️ {recipe['title']}")
#                 print(f"Ingredients: {recipe['ingredients']}")
#                 print(f"Instructions: {recipe['directions']}")

#         elif "gemini" in user_input:
#             question = input("🤖 Enter your recipe or food-related question for Gemini: ")
#             try:
#                 answer = ask_gemini(question)
#                 print("\n✨ Gemini says:\n", answer)
#             except Exception as e:
#                 print("❌ Error talking to Gemini:", e)

#         elif "models" in user_input:
#             list_models()

#         elif "exit" in user_input:
#             print("👋 Goodbye! Happy cooking!")
#             break

#         else:
#             print("💡 I can help with recipes by ingredients, dish names, suggest random dishes, list models, or ask Gemini! Type 'exit' to quit.")

# # ================== 📌 Run chatbot if script is executed ==================
# if __name__ == "__main__":
#     print("\n📢 Type 'models' in chatbot to view available models if you need.")
#     chatbot()

import pandas as pd
import google.generativeai as genai
import time
from google.api_core.exceptions import ResourceExhausted

# ================== 📌 Load recipe dataset ==================
df = pd.read_csv('recipes_small.csv')

# Optional: Check columns
print("\n🧾 Available columns in your dataset:\n", df.columns)

# ================== 📌 Configure Gemini API ==================
API_KEY = "AIzaSyB9j4RN16unVw2yPMA95_h0fWRYnHB5h98"  # Replace with your actual API key
genai.configure(api_key=API_KEY)

# ================== 📌 Function to safely call Gemini ==================
def call_gemini_with_retry(prompt, retries=3, wait_time=60):
    model = genai.GenerativeModel("gemini-1.5-pro")
    attempt = 0
    while attempt < retries:
        try:
            print(f"📤 Sending prompt to Gemini (Attempt {attempt + 1})...")
            response = model.generate_content(prompt)
            return response.text
        except ResourceExhausted:
            print("⚠️ Quota exceeded. Waiting before retrying...")
            time.sleep(wait_time)
            attempt += 1
    return "❌ Failed to get a response from Gemini after multiple attempts."

# First Gemini test
print("\n🤖 Testing Gemini response:")
print(call_gemini_with_retry("Give me a simple tomato soup recipe."))

# ================== 📌 Function to list available models ==================
def list_models():
    models = genai.list_models()
    print("\n📝 Available models:")
    for model in models:
        print(f"- {model.name} (methods: {model.supported_generation_methods})")

# ================== 📌 Function to ask Gemini ==================
def ask_gemini(prompt):
    return call_gemini_with_retry(prompt)

# ================== 📌 Function to search recipes by ingredients ==================
def search_by_ingredients(ingredients_list):
    ingredients_list = [ingredient.strip().lower() for ingredient in ingredients_list]
    matching_recipes = []
    for _, row in df.iterrows():
        recipe_ingredients = str(row['ingredients']).lower()
        if all(ingredient in recipe_ingredients for ingredient in ingredients_list):
            matching_recipes.append({
                'title': row['title'],
                'ingredients': row['ingredients'],
                'instructions': row['directions']
            })
    return matching_recipes

# ================== 📌 Function to search recipes by dish name ==================
def search_by_dish_name(dish_name):
    result = df[df['title'].str.contains(dish_name, case=False, na=False)]
    if not result.empty:
        return result[['title', 'ingredients', 'directions']].to_dict(orient='records')
    else:
        return "❌ Sorry, no recipe found for that dish."

# ================== 📌 Function to suggest random recipes ==================
def suggest_random_recipes(n=3):
    suggestions = df.sample(n)
    return suggestions[['title', 'ingredients', 'directions']].to_dict(orient='records')

# ================== 📌 Main chatbot loop ==================
def chatbot():
    print("👩‍🍳 Welcome to Recipe Chatbot! 🍳 Type 'exit' to quit anytime.")
    
    while True:
        user_input = input("\nYou: ").lower()

        if "ingredients" in user_input:
            ingredients = input("👉 Enter ingredients separated by commas: ").split(',')
            results = search_by_ingredients(ingredients)
            if results:
                print(f"\n🍽️ Found {len(results)} recipe(s) with those ingredients:")
                for recipe in results:
                    print("\n===============================")
                    print(f"🍽️ {recipe['title']}")
                    print(f"Ingredients: {recipe['ingredients']}")
                    print(f"Instructions: {recipe['instructions']}")
            else:
                print("❌ Sorry, no recipes found with those ingredients.")

        elif "dish" in user_input:
            dish_name = input("👉 Enter dish name: ")
            result = search_by_dish_name(dish_name)
            if isinstance(result, list):
                print(f"\n🍽️ Found {len(result)} recipe(s) with that dish name:")
                for recipe in result:
                    print("\n===============================")
                    print(f"🍽️ {recipe['title']}")
                    print(f"Ingredients: {recipe['ingredients']}")
                    print(f"Instructions: {recipe['directions']}")
            else:
                print(result)

        elif "suggest" in user_input:
            suggestions = suggest_random_recipes()
            print(f"\n🎲 Here are {len(suggestions)} random recipe suggestions for you:")
            for recipe in suggestions:
                print("\n===============================")
                print(f"🍽️ {recipe['title']}")
                print(f"Ingredients: {recipe['ingredients']}")
                print(f"Instructions: {recipe['directions']}")

        elif "gemini" in user_input:
            question = input("🤖 Enter your recipe or food-related question for Gemini: ")
            answer = ask_gemini(question)
            print("\n✨ Gemini says:\n", answer)

        elif "models" in user_input:
            list_models()

        elif "exit" in user_input:
            print("👋 Goodbye! Happy cooking!")
            break

        else:
            print("💡 I can help with recipes by ingredients, dish names, suggest random dishes, list models, or ask Gemini! Type 'exit' to quit.")

# ================== 📌 Run chatbot if script is executed ==================
if __name__ == "__main__":
    print("\n📢 Type 'models' in chatbot to view available models if you need.")
    chatbot()
