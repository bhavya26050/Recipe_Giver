import { NextRequest, NextResponse } from 'next/server';

// ✅ Backend URL configuration for production
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_BACKEND_URL || 'https://recipe-giver-backend.onrender.com'
  : 'http://localhost:5000';

console.log('🔗 Backend URL:', BACKEND_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

const responseCache = new Map();

// Enhanced backend call with better error handling
async function callBackend(endpoint: string, data: any): Promise<any> {
  try {
    console.log(`🔗 Calling: ${BACKEND_URL}${endpoint}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Backend call failed for ${endpoint}:`, error);
    throw error;
  }
}

async function checkBackendHealth(): Promise<boolean> {
  try {
    console.log(`🔍 Checking backend health at: ${BACKEND_URL}/api/health`);
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add timeout
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    console.log(`📊 Health check response status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ Health check failed with status: ${response.status}`);
      return false;
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`❌ Health check returned non-JSON content: ${contentType}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Health check data:`, data);
    
    return data.status === 'healthy';
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();
    const userQuery = message.trim();
    const cacheKey = `${userQuery.toLowerCase()}_${Math.random()}`;

    if (responseCache.has(cacheKey)) {
      console.log("🔄 Returning cached response");
      return NextResponse.json({
        response: responseCache.get(cacheKey),
        source: "cache"
      });
    }

    console.log(`📝 Processing query: "${userQuery}"`);

    // ✅ **Enhanced Pattern Recognition**
    const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy|what's up|how are you|how's it going)(\?|!|\.)?$/i.test(userQuery);
    const isSimpleResponse = /^(yes|yeah|yep|no|nope|ok|okay|sure|fine|thanks|thank you|cool|nice|great|awesome|perfect|alright|good|bad|not bad|i'm good|i'm fine|doing well)(\?|!|\.)?$/i.test(userQuery);
    const isFarewell = /^(bye|goodbye|see you|farewell|take care|talk later|thanks bye|good night|have a good day)(\?|!|\.)?$/i.test(userQuery);
    const isCompliment = /^(you're (great|awesome|amazing|helpful|good|the best)|thank you so much|thanks a lot|you rock|love it|love this|this is great|amazing work|wonderful|excellent|brilliant|fantastic)(\?|!|\.)?$/i.test(userQuery);

    // ✅ **Fix: Add Meal Planning Detection**
    const isMealPlan = /\b(meal\s*plan|weekly\s*plan|week\s*meal|plan\s*for\s*week|weekly\s*menu|menu\s*plan|7\s*day\s*plan)\b/i.test(userQuery);
    const isBreakfast = /\b(breakfast|morning\s*meal|brunch)\b/i.test(userQuery);
    const isLunch = /\b(lunch|midday\s*meal|afternoon\s*meal)\b/i.test(userQuery);
    const isDinner = /\b(dinner|evening\s*meal|supper)\b/i.test(userQuery);

    const isFoodRelated = new RegExp(
      "\\b(recipe|cook|make|prepare|bake|grill|roast|fry|boil|steam|food|dish|meal|breakfast|lunch|dinner|snack|dessert|cuisine|ingredient|nutrition|healthy|diet|kitchen|chef|culinary|spice|flavor|taste|biryani|curry|pasta|chicken|beef|fish|vegetables|paneer|rice|bread|soup|salad|pizza|burger|sandwich|noodles|sauce|marinade|seasoning)\\b",
      "i"
    ).test(userQuery);

    const isNonFoodQuery = /\b(code|programming|fibonacci|algorithm|math|science|weather|sports|politics|movie|music|technology|computer|software|car|travel|job|school|game|phone|internet|social media)\b/i.test(userQuery);

    // ✅ **Conversation Logic**
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

    // ✅ **Check Backend Health**
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

    console.log("🚀 Using enhanced pipeline...");

    // ✅ **Priority 1: Handle Meal Planning Requests**
    if (isMealPlan) {
      console.log("🍽️ Detected meal plan request");
      try {
        // Extract preferences from the user query
        const isVegetarian = /\b(vegetarian|veggie|no meat)\b/i.test(userQuery);
        const isVegan = /\b(vegan|plant.based)\b/i.test(userQuery);
        const isGlutenFree = /\b(gluten.free|no gluten|celiac)\b/i.test(userQuery);
        const isKeto = /\b(keto|ketogenic|low.carb)\b/i.test(userQuery);
        const isHealthy = /\b(healthy|clean eating|nutritious)\b/i.test(userQuery);
        
        const dietary_preferences = [];
        if (isVegetarian) dietary_preferences.push('vegetarian');
        if (isVegan) dietary_preferences.push('vegan');
        if (isGlutenFree) dietary_preferences.push('gluten_free');
        if (isKeto) dietary_preferences.push('keto_friendly');
        if (isHealthy) dietary_preferences.push('healthy');
        
        // Extract cuisine preferences
        const cuisine_preferences = [];
        if (/\b(italian|pasta|pizza)\b/i.test(userQuery)) cuisine_preferences.push('Italian');
        if (/\b(indian|curry|spicy)\b/i.test(userQuery)) cuisine_preferences.push('Indian');
        if (/\b(mexican|taco|burrito)\b/i.test(userQuery)) cuisine_preferences.push('Mexican');
        if (/\b(asian|chinese|japanese|thai)\b/i.test(userQuery)) cuisine_preferences.push('Asian');
        if (/\b(american|classic|comfort)\b/i.test(userQuery)) cuisine_preferences.push('American');
        
        // Extract cooking time preference
        let cooking_time_preference = 'any';
        if (/\b(quick|fast|15.min|30.min|easy)\b/i.test(userQuery)) {
          cooking_time_preference = 'quick (under 30 minutes)';
        } else if (/\b(elaborate|gourmet|fancy|special)\b/i.test(userQuery)) {
          cooking_time_preference = 'elaborate (over 60 minutes)';
        }
        
        const mealPlanResult = await callBackend('/api/generate-meal-plan', { 
          days: 7, 
          dietary_preferences,
          cuisine_preferences,
          cooking_time_preference
        });
        
        if (mealPlanResult.success) {
          let response = mealPlanResult.meal_plan;
          
          // Add shopping list if available
          if (mealPlanResult.shopping_list && !mealPlanResult.shopping_list.error) {
            response += `\n\n### 🛒 **Organized Shopping List**\n\n`;
            
            const list = mealPlanResult.shopping_list;
            if (list.proteins) response += `**Proteins:** ${list.proteins.join(', ')}\n`;
            if (list.vegetables) response += `**Vegetables:** ${list.vegetables.join(', ')}\n`;
            if (list.fruits) response += `**Fruits:** ${list.fruits.join(', ')}\n`;
            if (list.grains) response += `**Grains:** ${list.grains.join(', ')}\n`;
            if (list.dairy) response += `**Dairy:** ${list.dairy.join(', ')}\n`;
            if (list.pantry) response += `**Pantry Items:** ${list.pantry.join(', ')}\n`;
            
            if (list.estimated_cost) response += `\n**Estimated Cost:** ${list.estimated_cost}`;
          }
          
          response += `\n\n**Want modifications?** I can adjust this plan for specific dietary needs, cooking time, or cuisine preferences! 😊`;
          
          responseCache.set(cacheKey, response);
          return NextResponse.json({ response, source: "ai_meal_plan" });
        }
      } catch (error) {
        console.error("❌ Meal plan generation failed:", error);
      }
    }

    // ✅ **Priority 2: Handle Meal Type Requests**
    if (isBreakfast || isLunch || isDinner) {
      const mealType = isBreakfast ? 'breakfast' : isLunch ? 'lunch' : 'dinner';
      console.log(`🍽️ Detected ${mealType} request`);
      
      try {
        // Extract dietary preferences for meal type
        const dietary_preferences = [];
        if (/\b(vegetarian|veggie)\b/i.test(userQuery)) dietary_preferences.push('vegetarian');
        if (/\b(vegan)\b/i.test(userQuery)) dietary_preferences.push('vegan');
        if (/\b(healthy|nutritious)\b/i.test(userQuery)) dietary_preferences.push('healthy');
        if (/\b(quick|fast|easy)\b/i.test(userQuery)) dietary_preferences.push('quick');
        
        const mealTypeResult = await callBackend('/api/recipes-by-meal-type', { 
          meal_type: mealType, 
          limit: 8,
          dietary_preferences
        });
        
        if (mealTypeResult.success && mealTypeResult.recipes.length > 0) {
          const response = `# 🍽️ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Ideas

Here are some delicious ${mealType} recipes generated just for you:

${mealTypeResult.recipes.map((recipe: string, index: number) => 
  `**${index + 1}.** ${recipe}`
).join('\n')}

**Want a specific recipe?** Just ask me "How to make [dish name]" for complete instructions! 😊

**Need modifications?** I can suggest substitutions for dietary restrictions or ingredient swaps.`;

          responseCache.set(cacheKey, response);
          return NextResponse.json({ response, source: "ai_meal_type" });
        }
      } catch (error) {
        console.error(`❌ ${mealType} recipes failed:`, error);
      }
    }

    // ✅ **Priority 3: Extract Dish Name and Search**
    const extractResult = await callBackend('/api/extract-dish', { query: userQuery });

    if (extractResult.success && extractResult.dish_name) {
      const dishName = extractResult.dish_name;
      console.log(`🎯 Dish: "${dishName}"`);

      // Search in database first
      const searchResult = await callBackend('/api/search-recipe', { dish_name: dishName });
      if (searchResult.found) {
        let suggestions: string[] = [];
        
        // Get related recipes for database recipes
        try {
          const related = await callBackend('/api/related-recipes', { dish_name: dishName });
          suggestions = related.suggestions || [];
          console.log(`🔍 Related recipes for "${dishName}":`, suggestions);
        } catch (e) {
          console.warn("⚠️ Could not fetch related recipes.");
        }

        // **🔥 ENHANCED: Also try ingredient-based suggestions for database recipes**
        if (suggestions.length < 3) {
          try {
            // **🔥 IMPROVED: Better main ingredient extraction for database recipes too**
            const ingredientPriority = [
              'paneer', 'chicken', 'mutton', 'beef', 'fish', 'prawns', 'lamb', 
              'egg', 'tofu', 'dal', 'lentils', 'chickpeas', 'potato', 'cauliflower',
              'spinach', 'okra', 'eggplant', 'mushroom', 'rice', 'pasta', 'noodles',
              'chocolate', 'vanilla', 'strawberry', 'banana', 'apple', 'cake', 'bread'
            ];
            
            // Find the most important ingredient
            let mainIngredient = null;
            const dishLower = dishName.toLowerCase();
            
            // **🔥 SPECIAL HANDLING FOR DESSERTS AND SPECIFIC DISHES**
            if (dishLower.includes('chocolate')) {
              mainIngredient = 'chocolate';
            } else if (dishLower.includes('cake')) {
              mainIngredient = 'cake';
            } else if (dishLower.includes('paneer')) {
              mainIngredient = 'paneer';
            } else if (dishLower.includes('chicken')) {
              mainIngredient = 'chicken';
            } else if (dishLower.includes('dal') || dishLower.includes('lentil')) {
              mainIngredient = 'dal';
            } else if (dishLower.includes('biryani') || dishLower.includes('rice')) {
              mainIngredient = 'rice';
            } else {
              // Check for priority ingredients in order
              for (const ingredient of ingredientPriority) {
                if (dishLower.includes(ingredient)) {
                  mainIngredient = ingredient;
                  break;
                }
              }
            }
            
            console.log(`🔍 Extracted main ingredient: "${mainIngredient}" from dish: "${dishName}"`);
            
            if (mainIngredient) {
              const ingredientResult = await callBackend('/api/search-by-ingredient', { 
                ingredient: mainIngredient, 
                offset: 0 
              });
              
              if (ingredientResult.found && ingredientResult.recipes) {
                // Add unique recipes that aren't already in suggestions
                const additionalSuggestions = ingredientResult.recipes
                  .filter((recipe: string) => {
                    const recipeLower = recipe.toLowerCase();
                    return !suggestions.some(s => s.toLowerCase() === recipeLower) && 
                           recipeLower !== dishName.toLowerCase() &&
                           // **🔥 ENSURE SUGGESTIONS CONTAIN THE MAIN INGREDIENT**
                           recipeLower.includes(mainIngredient.toLowerCase());
                  })
                  .slice(0, 5 - suggestions.length);
                
                suggestions.push(...additionalSuggestions);
                console.log(`✅ Added ${additionalSuggestions.length} ingredient-based suggestions for "${mainIngredient}"`);
              }
            }
          } catch (e) {
            console.warn("⚠️ Could not fetch ingredient-based suggestions for database recipe.", e);
          }
        }

        // **🔥 BUILD FINAL RESPONSE WITH PROPER FORMATTING**
        let finalResponse = searchResult.recipe;
        
        if (suggestions.length > 0) {
          finalResponse += `\n\n---\n\n## 🍽️ You Might Also Enjoy:\n\n`;
          finalResponse += suggestions.map((suggestion, index) => 
            `**${index + 1}.** ${suggestion}`
          ).join('\n');
          finalResponse += `\n\n*Want the recipe for any of these? Just ask me! 😊*`;
        }

        responseCache.set(cacheKey, finalResponse);
        return NextResponse.json({ response: finalResponse, source: "database_with_suggestions", dishName });
      }

      // Generate recipe using AI
      const generateResult = await callBackend('/api/generate-recipe', { dish_name: dishName, user_query: userQuery });
      
      // **🔥 ADD RECOMMENDATIONS FOR AI-GENERATED RECIPES TOO**
      let suggestions: string[] = [];
      try {
        const related = await callBackend('/api/related-recipes', { dish_name: dishName });
        suggestions = related.suggestions || [];
      } catch (e) {
        console.warn("⚠️ Could not fetch related recipes for AI recipe.");
      }

      // **🔥 ENHANCED: Also try ingredient-based suggestions for AI recipes**
      if (suggestions.length < 3) {
        try {
          // **🔥 IMPROVED: Better main ingredient extraction**
          const ingredientPriority = [
            'paneer', 'chicken', 'mutton', 'beef', 'fish', 'prawns', 'lamb', 
            'egg', 'tofu', 'dal', 'lentils', 'chickpeas', 'potato', 'cauliflower',
            'spinach', 'okra', 'eggplant', 'mushroom', 'rice', 'pasta', 'noodles'
          ];
          
          // Find the most important ingredient (prioritize proteins and main vegetables)
          let mainIngredient = null;
          const dishLower = dishName.toLowerCase();
          
          // Check for priority ingredients in order
          for (const ingredient of ingredientPriority) {
            if (dishLower.includes(ingredient)) {
              mainIngredient = ingredient;
              break;
            }
          }
          
          // **🔥 SPECIAL HANDLING FOR SPECIFIC DISHES**
          if (dishLower.includes('paneer')) {
            mainIngredient = 'paneer';
          } else if (dishLower.includes('chicken')) {
            mainIngredient = 'chicken';
          } else if (dishLower.includes('dal') || dishLower.includes('lentil')) {
            mainIngredient = 'dal';
          } else if (dishLower.includes('biryani') || dishLower.includes('rice')) {
            mainIngredient = 'rice';
          }
          
          console.log(`🔍 Extracted main ingredient: "${mainIngredient}" from dish: "${dishName}"`);
          
          if (mainIngredient) {
            const ingredientResult = await callBackend('/api/search-by-ingredient', { 
              ingredient: mainIngredient, 
              offset: 0 
            });
            
            if (ingredientResult.found && ingredientResult.recipes) {
              // Add unique recipes that aren't already in suggestions
              const additionalSuggestions = ingredientResult.recipes
                .filter((recipe: string) => {
                  const recipeLower = recipe.toLowerCase();
                  return !suggestions.some(s => s.toLowerCase() === recipeLower) && 
                         recipeLower !== dishName.toLowerCase() &&
                         // **🔥 ENSURE SUGGESTIONS CONTAIN THE MAIN INGREDIENT**
                         recipeLower.includes(mainIngredient.toLowerCase());
                })
                .slice(0, 5 - suggestions.length);
              
              suggestions.push(...additionalSuggestions);
              console.log(`✅ Added ${additionalSuggestions.length} ingredient-based suggestions for "${mainIngredient}"`);
            }
          }
        } catch (e) {
          console.warn("⚠️ Could not fetch ingredient-based suggestions.", e);
        }
      }

      // **🔥 BUILD FINAL RESPONSE WITH RECOMMENDATIONS**
      let finalResponse = generateResult.recipe;
      
      if (suggestions.length > 0) {
        finalResponse += `\n\n---\n\n## 🍽️ You Might Also Enjoy:\n\n`;
        finalResponse += suggestions.map((suggestion, index) => 
          `**${index + 1}.** ${suggestion}`
        ).join('\n');
        finalResponse += `\n\n*Want the recipe for any of these? Just ask me! 😊*`;
      }

      responseCache.set(cacheKey, finalResponse);
      return NextResponse.json({ response: finalResponse, source: "ai_generated_with_suggestions", dishName });
    }

    // ✅ **Priority 4: Enhanced Ingredient-based Search**
    const ingredientPatterns = [
      /(?:recipes?\s+(?:from|with|using|made with)\s+)([a-zA-Z]+)/i,
      /(?:recipe\s+using\s+)([a-zA-Z]+)/i,
      /(?:dishes?\s+with\s+)([a-zA-Z]+)/i,
      /(?:what\s+can\s+i\s+make\s+with\s+)([a-zA-Z]+)/i,
      /(?:show\s+me\s+)([a-zA-Z]+)(?:\s+recipes?)/i
    ];

    let ingredientMatch = null;
    let ingredient = null;

    // Try each pattern to find ingredient
    for (const pattern of ingredientPatterns) {
      ingredientMatch = userQuery.match(pattern);
      if (ingredientMatch) {
        ingredient = ingredientMatch[1].toLowerCase();
        break;
      }
    }

    // **🔥 ENHANCED: Also check for standalone ingredient mentions**
    if (!ingredient) {
      const commonIngredients = [
        'paneer', 'chicken', 'chocolate', 'potato', 'rice', 'pasta', 'fish', 
        'beef', 'pork', 'egg', 'vegetable', 'mutton', 'dal', 'lentil',
        'tomato', 'onion', 'garlic', 'spinach', 'cheese', 'milk'
      ];

      for (const commonIngredient of commonIngredients) {
        if (userQuery.toLowerCase().includes(commonIngredient)) {
          ingredient = commonIngredient;
          break;
        }
      }
    }

    console.log(`🔍 Extracted ingredient: "${ingredient}" from query: "${userQuery}"`);

    if (ingredient) {
      try {
        const ingredientResult = await callBackend('/api/search-by-ingredient', { 
          ingredient, 
          offset: 0 
        });

        if (ingredientResult.found && ingredientResult.recipes.length > 0) {
          const response = `# 🥘 Recipes with ${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}

Here are ${ingredientResult.total_found} delicious recipes I found:

${ingredientResult.recipes.map((title: string, idx: number) => `**${idx + 1}.** ${title}`).join('\n')}

**Want the full recipe?** Just ask me about any of these dishes! 😊

**Need more options?** I can show you different types of ${ingredient} dishes or recipes from specific cuisines.`;
          
          responseCache.set(cacheKey, response);
          return NextResponse.json({ response, source: "ingredient_search", ingredient });
        } else {
          // **🔥 FALLBACK: Generate AI-based ingredient recipes**
          try {
            // ✅ FIX: Use existing endpoint instead of non-existent one
            const aiRecipeResult = await callBackend('/api/generate-recipe', { 
              dish_name: `${ingredient} recipes`,
              user_query: `Show me different recipes using ${ingredient}`
            });
            
            if (aiRecipeResult.recipe) {
              const response = `# 🥘 Creative ${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)} Recipe Ideas

I couldn't find specific recipes in my database, but here are some ideas:

${aiRecipeResult.recipe}

**Want a specific recipe?** Just ask me "How to make [dish name]" and I'll provide detailed instructions! 😊`;
              
              responseCache.set(cacheKey, response);
              return NextResponse.json({ response, source: "ai_ingredient_fallback", ingredient });
            }
          } catch (aiError) {
            console.warn("⚠️ AI ingredient fallback failed:", aiError);
          }
        }
      } catch (error) {
        console.error(`❌ Ingredient search failed for "${ingredient}":`, error);
      }
    }

    // ✅ **Fallback: Clarification**
    const clarificationResponse = "I'd love to help you with a recipe! Could you be more specific about what dish you'd like to make?\n\nFor example:\n• \"How to make chicken biryani\"\n• \"Recipe for paneer butter masala\"\n• \"Show me pasta recipes\"\n• \"Generate a meal plan for this week\"\n\nWhat would you like to cook today? 😊";
    
    responseCache.set(cacheKey, clarificationResponse);
    return NextResponse.json({ response: clarificationResponse, source: "clarification" });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({
      error: 'Something went wrong.',
      response: "Sorry, I'm having trouble right now. Please try again! 🍳"
    }, { status: 500 });
  }
}
