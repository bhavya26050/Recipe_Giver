"use client";
import { useState } from "react";

export default function Home() {
  const [recipes, setRecipes] = useState<any[]>([]);

  const getRecommendations = async () => {
    const ingredients = ["milk", "banana", "sugar"];
    const res = await fetch("http://127.0.0.1:8000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ✅ Corrected body format
      body: JSON.stringify({
        ingredients: ingredients.join(" "), // joins into a single string
      }),
    });

    const data = await res.json();
    setRecipes(data.recommendations); // ✅ Access the "recommendations" field
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Recommender</h1>
      <button
        onClick={getRecommendations}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Get Recipes
      </button>

      <ul className="mt-4 list-disc list-inside">
        {recipes.map((recipe, i) => (
          <li key={i}>
            <strong>{recipe.title}</strong>: {recipe.ingredients}
          </li>
        ))}
      </ul>
    </div>
  );
}
