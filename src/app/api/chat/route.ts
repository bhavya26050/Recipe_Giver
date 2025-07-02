// import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';
// import csv from 'csv-parser';

// interface Recipe {
//   id: string;
//   title: string;
//   ingredients: string;
//   directions: string;
//   link?: string;
//   source?: string;
//   NER?: string;
// }

// // Cache for recipes to avoid reading CSV repeatedly
// let recipesCache: Recipe[] = [];
// let cacheLoaded = false;

// async function loadRecipes(): Promise<Recipe[]> {
//   if (cacheLoaded && recipesCache.length > 0) {
//     return recipesCache;
//   }

//   return new Promise((resolve, reject) => {
//     const recipes: Recipe[] = [];
//     const csvPath = path.join(process.cwd(), 'backend', 'recipes_small.csv');
    
//     if (!fs.existsSync(csvPath)) {
//       console.error('CSV file not found at:', csvPath);
//       resolve([]);
//       return;
//     }

//     fs.createReadStream(csvPath)
//       .pipe(csv())
//       .on('data', (row) => {
//         try {
//           // Parse the CSV data properly
//           const recipe: Recipe = {
//             id: row.id || '',
//             title: row.title || '',
//             ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
//             directions: row.directions ? JSON.parse(row.directions) : [],
//             link: row.link || '',
//             source: row.source || '',
//             NER: row.NER || ''
//           };
//           recipes.push(recipe);
//         } catch (error) {
//           console.error('Error parsing recipe row:', error);
//         }
//       })
//       .on('end', () => {
//         recipesCache = recipes;
//         cacheLoaded = true;
//         console.log(`✅ Loaded ${recipes.length} recipes from CSV`);
//         resolve(recipes);
//       })
//       .on('error', (error) => {
//         console.error('Error reading CSV:', error);
//         reject(error);
//       });
//   });
// }

// async function findRecipeByTitle(searchTitle: string): Promise<Recipe | null> {
//   const recipes = await loadRecipes();
  
//   const normalizedSearch = searchTitle.toLowerCase().trim();
  
//   // First try exact match
//   let found = recipes.find(recipe => 
//     recipe.title.toLowerCase().trim() === normalizedSearch
//   );
  
//   // If no exact match, try partial match
//   if (!found) {
//     found = recipes.find(recipe => 
//       recipe.title.toLowerCase().includes(normalizedSearch) ||
//       normalizedSearch.includes(recipe.title.toLowerCase())
//     );
//   }
  
//   return found || null;
// }

// function formatRecipeResponse(recipe: Recipe): string {
//   const ingredientsList = Array.isArray(recipe.ingredients) 
//     ? recipe.ingredients 
//     : (typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : []);
    
//   const directionsList = Array.isArray(recipe.directions) 
//     ? recipe.directions 
//     : (typeof recipe.directions === 'string' ? JSON.parse(recipe.directions) : []);

//   let response = `## ${recipe.title}\n\n`;
//   response += `*Perfect! I found this recipe in my database for you!* 🎯\n\n`;
  
//   // Format ingredients
//   response += `### 🥘 Ingredients:\n`;
//   ingredientsList.forEach((ingredient: string) => {
//     response += `• ${ingredient}\n`;
//   });
  
//   // Format instructions
//   response += `\n### 👨‍🍳 Instructions:\n`;
//   directionsList.forEach((direction: string, index: number) => {
//     response += `**${index + 1}.** ${direction}\n\n`;
//   });
  
//   // Add Chef's Tips
//   response += `### 💡 Chef's Tips:\n`;
//   response += `• Prep all ingredients before starting\n`;
//   response += `• Taste and adjust seasoning as needed\n`;
//   response += `• Don't rush the cooking process for best results\n\n`;
  
//   response += `**Questions about this recipe?** I can help with substitutions, cooking techniques, or serving suggestions! 😊\n\n`;
  
//   return response;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { message, history } = await request.json();
    
//     console.log('🔍 Searching for recipe:', message);
    
//     // Check if this is a recipe request
//     const recipeMatch = message.match(/^([^?]+?)(?:\s+recipe)?$/i);
    
//     if (recipeMatch) {
//       const searchTitle = recipeMatch[1].trim();
//       console.log('🔍 Looking for recipe:', searchTitle);
      
//       const recipe = await findRecipeByTitle(searchTitle);
      
//       if (recipe) {
//         console.log('✅ Found recipe:', recipe.title);
//         const formattedResponse = formatRecipeResponse(recipe);
        
//         return NextResponse.json({
//           response: formattedResponse,
//           source: 'database'
//         });
//       }
//     }
    
//     // If no recipe found, fall back to your existing chatbot logic
//     // ... your existing API logic here ...
    
//     return NextResponse.json({
//       response: "I couldn't find that specific recipe in my database. Could you try a different recipe name or ask me for cooking suggestions?",
//       source: 'fallback'
//     });
    
//   } catch (error) {
//     console.error('❌ Error in chat API:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const responseCache = new Map();

async function callBackend(endpoint: string, data: any): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ Backend call failed for ${endpoint}:`, error);
    throw error;
  }
}

async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], offset = 0 } = await request.json();
    const userQuery = message.trim();
    // Include offset in cache key!
    const cacheKey = `${userQuery.toLowerCase()}_${offset}_${Math.random()}`;

    if (responseCache.has(cacheKey)) {
      console.log("🔄 Returning cached response");
      return NextResponse.json({
        response: responseCache.get(cacheKey),
        source: "cache"
      });
    }

    console.log(`📝 Processing query: "${userQuery}"`);

    const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy|what's up|how are you|how's it going)(\?|!|\.)?$/i.test(userQuery);
    const isSimpleResponse = /^(yes|yeah|yep|no|nope|ok|okay|sure|fine|thanks|thank you|cool|nice|great|awesome|perfect|alright|good|bad|not bad|i'm good|i'm fine|doing well)(\?|!|\.)?$/i.test(userQuery);
    const isFarewell = /^(bye|goodbye|see you|farewell|take care|talk later|thanks bye|good night|have a good day)(\?|!|\.)?$/i.test(userQuery);
    const isCompliment = /^(you're (great|awesome|amazing|helpful|good|the best)|thank you so much|thanks a lot|you rock|love it|love this|this is great|amazing work|wonderful|excellent|brilliant|fantastic)(\?|!|\.)?$/i.test(userQuery);

    const isFoodRelated = new RegExp(
      "\\b(recipe|cook|make|prepare|bake|grill|roast|fry|boil|steam|food|dish|meal|breakfast|lunch|dinner|snack|dessert|cuisine|ingredient|nutrition|healthy|diet|kitchen|chef|culinary|spice|flavor|taste|biryani|curry|pasta|chicken|beef|fish|vegetables|paneer|rice|bread|soup|salad|pizza|burger|sandwich|noodles|sauce|marinade|seasoning)\\b",
      "i"
    ).test(userQuery);

    const isNonFoodQuery = /\b(code|programming|fibonacci|algorithm|math|science|weather|sports|politics|movie|music|technology|computer|software|car|travel|job|school|game|phone|internet|social media)\b/i.test(userQuery);

    // 🗨️ Conversation logic
    if (isGreeting) {
      const responses = [
        "Hello! 👋 I'm NutriChef. What delicious creation would you like to explore today?",
        "Hi there! 😊 I'm ready to help you cook something amazing!",
        "Hey! 🌟 I'm your culinary assistant. What's cooking in your mind?",
        "Hello! 🍳 Ready to create something delicious together?"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }

    if (isFarewell) {
      const responses = [
        "Take care and happy cooking! 👋",
        "Goodbye! 🌟 Come back anytime for more recipes!",
        "See you later! 🍳",
        "Bye for now! ✨ Happy cooking!"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }

    if (isSimpleResponse) {
      const responses = [
        "Wonderful! 🌟 What cuisine or dish are you interested in?",
        "Great! 😊 Looking for a specific recipe or just browsing?",
        "Awesome! 🍽️ Want help with cooking or nutrition?",
        "Perfect! 👨‍🍳 What can I help you create today?"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }

    if (isCompliment) {
      const responses = [
        "Thank you so much! 😊 What shall we cook next?",
        "You're so kind! 🌟 Let's explore some recipes!",
        "Aww, thank you! 💚 What delicious thing are we making today?",
        "That means a lot! 😄 Ready to cook something new?"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }

    if (isNonFoodQuery && !isFoodRelated) {
      const redirectResponse = "I'm NutriChef 🍳 — I focus on recipes, cooking, and nutrition. Want help with a dish today?";
      responseCache.set(cacheKey, redirectResponse);
      return NextResponse.json({ response: redirectResponse, source: "redirect" });
    }

    const isBackendHealthy = await checkBackendHealth();
    if (!isBackendHealthy) {
      const fallbackResponse = `I'm having trouble connecting to my recipe database right now. Here's some general advice:

### 🥘 Basic Cooking Tips:
• Use fresh ingredients  
• Prepare everything before cooking  
• Follow correct temperatures and timing  
• Taste and adjust seasoning  

**Try again in a moment — I should be back online soon! 😊**`;
      responseCache.set(cacheKey, fallbackResponse);
      return NextResponse.json({ response: fallbackResponse, source: "fallback" });
    }

    console.log("🚀 Using hybrid pipeline...");

    // Step 1: Extract dish name
    const extractResult = await callBackend('/api/extract-dish', { query: userQuery });

    if (!extractResult.success || !extractResult.dish_name) {
      console.log("⚠️ No dish name detected. Trying fallback ingredient search...");

      const ingredientMatch = userQuery.match(/(?:recipes?\s+(?:from|with|using)\s+)([a-zA-Z]+)/i);

      if (ingredientMatch) {
        const ingredient = ingredientMatch[1].toLowerCase();
        const ingredientResult = await callBackend('/api/search-by-ingredient', { ingredient, offset });

        if (ingredientResult.found && ingredientResult.recipes.length > 0) {
          // Return only the titles, one per line (or as a numbered list)
          const response = ingredientResult.recipes
  .map((title, idx) => `${offset + idx + 1}. ${title}`)
  .join('\n');
          responseCache.set(cacheKey, response);
          return NextResponse.json({ response, source: "ingredient_search", ingredient });
        } else {
          // Fallback: Generate a list of dish ideas using AI if not found in DB
          const aiListResult = await callBackend('/api/generate-recipe-list', { ingredient });
          const response = aiListResult.suggestions;
          responseCache.set(cacheKey, response);
          return NextResponse.json({ response, source: "ai_generated_ingredient_list", ingredient });
        }
      }

      const clarificationResponse = "I'd love to help you with a recipe! Could you be more specific about what dish you'd like to make?\n\nFor example:\n• \"How to make chicken biryani\"\n• \"Recipe for paneer butter masala\"\n• \"Show me pasta recipes\"\n\nWhat would you like to cook today? 😊";
  responseCache.set(cacheKey, clarificationResponse);
  return NextResponse.json({ response: clarificationResponse, source: "clarification" });
    }

    const dishName = extractResult.dish_name;
    console.log(`🎯 Dish: "${dishName}"`);

    // Step 2: Search in database
    const searchResult = await callBackend('/api/search-recipe', { dish_name: dishName });
    if (searchResult.found) {
      // const response = searchResult.recipe;
      // responseCache.set(cacheKey, response);
      // return NextResponse.json({ response, source: "database", dishName });
      const response = searchResult.recipe;

let suggestions: string[] = [];
try {
  const related = await callBackend('/api/related-recipes', { dish_name: dishName });
  suggestions = related.suggestions || [];
} catch (e) {
  console.warn("⚠️ Could not fetch related recipes.");
}

const finalResponse = suggestions.length > 0
  ? `${response}\n\n🍽️ You might also enjoy:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
  : response;

responseCache.set(cacheKey, finalResponse);
return NextResponse.json({ response: finalResponse, source: "database", dishName });

    }

    // Step 3: Generate recipe using AI
    const generateResult = await callBackend('/api/generate-recipe', { dish_name: dishName, user_query: userQuery });
    const response = generateResult.recipe;
    responseCache.set(cacheKey, response);
    return NextResponse.json({ response, source: "ai_generated", dishName });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({
      error: 'Something went wrong.',
      response: "Sorry, I'm having trouble right now. Please try again! 🍳"
    }, { status: 500 });
  }
}
