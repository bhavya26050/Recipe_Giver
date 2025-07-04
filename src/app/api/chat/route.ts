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

      // Search in database
      const searchResult = await callBackend('/api/search-recipe', { dish_name: dishName });
      if (searchResult.found) {
        let suggestions: string[] = [];
        try {
          const related = await callBackend('/api/related-recipes', { dish_name: dishName });
          suggestions = related.suggestions || [];
        } catch (e) {
          console.warn("⚠️ Could not fetch related recipes.");
        }

        const finalResponse = suggestions.length > 0
          ? `${searchResult.recipe}\n\n🍽️ You might also enjoy:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
          : searchResult.recipe;

        responseCache.set(cacheKey, finalResponse);
        return NextResponse.json({ response: finalResponse, source: "database", dishName });
      }

      // Generate recipe using AI
      const generateResult = await callBackend('/api/generate-recipe', { dish_name: dishName, user_query: userQuery });
      const response = generateResult.recipe;
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "ai_generated", dishName });
    }

    // ✅ **Priority 4: Ingredient-based Search**
    const ingredientMatch = userQuery.match(/(?:recipes?\s+(?:from|with|using)\s+)([a-zA-Z]+)/i);
    if (ingredientMatch) {
      const ingredient = ingredientMatch[1].toLowerCase();
      const ingredientResult = await callBackend('/api/search-by-ingredient', { ingredient, offset: 0 });

      if (ingredientResult.found && ingredientResult.recipes.length > 0) {
        const response = `# 🥘 Recipes with ${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}

${ingredientResult.recipes.map((title: string, idx: number) => `${idx + 1}. ${title}`).join('\n')}

**Want the full recipe?** Just ask me about any of these dishes! 😊`;
        
        responseCache.set(cacheKey, response);
        return NextResponse.json({ response, source: "ingredient_search", ingredient });
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
