from fastapi import FastAPI, Request
from pydantic import BaseModel
from chatbot import search_by_dish_name, ask_gemini
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeRequest(BaseModel):
    query: str

@app.post("/get-recipe")
def get_recipe(req: RecipeRequest):
    dish_name = req.query.strip()
    result = search_by_dish_name(dish_name)

    # Check if CSV result is not from Gemini fallback
    if isinstance(result, list) and result[0]['ingredients'] != "Not in CSV":
        return {"source": "csv", "recipes": result}
    else:
        return {"source": "gemini", "recipes": result}
