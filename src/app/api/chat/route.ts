// import { NextRequest, NextResponse } from 'next/server';

// // Backend URL - adjust if your Python server runs on different port
// const BACKEND_URL = 'http://localhost:5000';

// // Cache to avoid repeated calls
// const responseCache = new Map();

// // Helper function to call Python backend
// async function callBackend(endpoint: string, data: any): Promise<any> {
//   try {
//     const response = await fetch(`${BACKEND_URL}${endpoint}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       throw new Error(`Backend error: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error(`❌ Backend call failed for ${endpoint}:`, error);
//     throw error;
//   }
// }

// // Check if backend is healthy
// async function checkBackendHealth(): Promise<boolean> {
//   try {
//     const response = await fetch(`${BACKEND_URL}/health`);
//     const data = await response.json();
//     return data.status === 'healthy';
//   } catch (error) {
//     console.error('❌ Backend health check failed:', error);
//     return false;
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { message, history = [] } = await request.json();
//     const userQuery = message.trim();
    
//     // Check cache first
//     const cacheKey = userQuery.toLowerCase();
//     if (responseCache.has(cacheKey)) {
//       console.log("🔄 Returning cached response");
//       return NextResponse.json({ 
//         response: responseCache.get(cacheKey),
//         source: "cache"
//       });
//     }
    
//     console.log(`📝 Processing query: "${userQuery}"`);
    
//     // Enhanced conversation detection
//     const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy|sup|what's up|how are you|how's it going)(\?|!|\.)?$/i.test(userQuery);
//     const isSimpleResponse = /^(yes|yeah|yep|no|nope|ok|okay|sure|fine|thanks|thank you|cool|nice|great|awesome|perfect|alright|good|bad|not bad|i'm good|i'm fine|doing well)(\?|!|\.)?$/i.test(userQuery);
//     const isFarewell = /^(bye|goodbye|see you|farewell|take care|talk later|thanks bye|good night|have a good day)(\?|!|\.)?$/i.test(userQuery);
//     const isCompliment = /^(you're (great|awesome|amazing|helpful|good|the best)|thank you so much|thanks a lot|you rock|love it|love this|this is great|amazing work|wonderful|excellent|brilliant|fantastic)(\?|!|\.)?$/i.test(userQuery);
    
//     // Food-related detection
//     const isFoodRelated = /recipe|cook|make|prepare|bake|grill|roast|fry|boil|steam|food|dish|meal|breakfast|lunch|dinner|snack|dessert|cuisine|ingredient|nutrition|healthy|diet|kitchen|chef|culinary|spice|flavor|taste|biryani|curry|pasta|chicken|beef|fish|vegetables|paneer|rice|bread|soup|salad|pizza|burger|sandwich|noodles|sauce|marinade|seasoning/i.test(userQuery);
    
//     // Non-food topic detection
//     const isNonFoodQuery = /code|programming|fibonacci|algorithm|math|science|weather|sports|politics|movie|music|technology|computer|software|car|travel|job|school|game|phone|internet|social media/i.test(userQuery);
    
//     // Handle conversational responses FIRST
//     if (isGreeting) {
//       const greetingResponses = [
//         "Hello! 👋 I'm doing great, thank you! I'm NutriChef, your friendly cooking companion. I'm here to help with recipes, cooking techniques, and nutrition advice. What delicious creation would you like to explore today?",
//         "Hi there! 😊 I'm fantastic and ready to help you cook something amazing! What can I whip up for you today?",
//         "Hey! 🌟 I'm doing wonderful, thanks! I'm your culinary assistant ready to help with any recipe or cooking question. What's cooking in your mind?",
//         "Hello! 🍳 I'm excellent, thank you! Ready to create something delicious together? What would you like to cook?"
//       ];
      
//       const response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
//       responseCache.set(cacheKey, response);
//       return NextResponse.json({ response, source: "conversation" });
//     }
    
//     if (isFarewell) {
//       const farewellResponses = [
//         "Take care and happy cooking! 👋 Remember, I'm always here for your culinary adventures!",
//         "Goodbye! 🌟 Enjoy your time in the kitchen, and come back anytime for more recipes!",
//         "See you later! 🍳 May your meals be delicious and your cooking successful!",
//         "Bye for now! ✨ Keep exploring new flavors and happy cooking!"
//       ];
      
//       const response = farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
//       responseCache.set(cacheKey, response);
//       return NextResponse.json({ response, source: "conversation" });
//     }
    
//     if (isSimpleResponse) {
//       const followUpResponses = [
//         "Wonderful! 🌟 What type of cuisine or dish are you interested in? I can help with recipes, cooking techniques, or nutrition advice!",
//         "Great! 😊 Are you looking for a specific recipe, cooking tips, or meal inspiration? I'm here to help!",
//         "Awesome! 🍽️ What would you like to explore in the kitchen today? I can suggest recipes or answer cooking questions!",
//         "Perfect! 👨‍🍳 Tell me what you're in the mood for - I'm excited to help you create something delicious!"
//       ];
      
//       const response = followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
//       responseCache.set(cacheKey, response);
//       return NextResponse.json({ response, source: "conversation" });
//     }
    
//     if (isCompliment) {
//       const complimentResponses = [
//         "Thank you so much! 😊 That really motivates me! What delicious creation would you like to work on next?",
//         "You're so kind! 🌟 I love helping with culinary adventures. Ready to explore some recipes together?",
//         "Aww, thank you! 💚 Your enthusiasm for cooking makes this fun for me too. What shall we cook today?",
//         "That means the world to me! 😄 I'm passionate about making cooking accessible. What can I help you create?"
//       ];
      
//       const response = complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
//       responseCache.set(cacheKey, response);
//       return NextResponse.json({ response, source: "conversation" });
//     }
    
//     // Handle non-food queries
//     if (isNonFoodQuery && !isFoodRelated) {
//       const redirectResponse = "I appreciate your question, but I'm NutriChef - your specialized cooking assistant! 🍳 I focus exclusively on food, recipes, cooking techniques, and nutrition.\n\nIs there anything delicious you'd like to cook today? I can help you find recipes, explain cooking methods, or answer nutrition questions!";
      
//       responseCache.set(cacheKey, redirectResponse);
//       return NextResponse.json({ response: redirectResponse, source: "redirect" });
//     }
    
//     // HYBRID PIPELINE - Check if backend is available
//     const isBackendHealthy = await checkBackendHealth();
    
//     if (!isBackendHealthy) {
//       console.log("⚠️ Python backend is not available, using fallback");
//       const fallbackResponse = `I'm having trouble connecting to my recipe database right now, but I'd still love to help you with cooking!

// Here are some general cooking tips for "${userQuery}":

// ### 🥘 Basic Approach:
// • Start with fresh, quality ingredients
// • Prepare all ingredients before cooking (mise en place)
// • Follow proper cooking temperatures and timing
// • Season gradually and taste as you go

// ### 👨‍🍳 General Tips:
// • Always read the full recipe before starting
// • Have all your tools ready
// • Don't rush the cooking process
// • Adjust seasoning to your taste

// **Please try asking again in a moment - my recipe database should be back online soon!** 😊`;

//       responseCache.set(cacheKey, fallbackResponse);
//       return NextResponse.json({ response: fallbackResponse, source: "fallback" });
//     }
    
//     console.log("🚀 Starting hybrid pipeline with Python backend...");
    
//     try {
//       // STEP 1: Extract dish name using Python backend
//       const extractResult = await callBackend('/api/extract-dish', { query: userQuery });
      
//       if (!extractResult.success || !extractResult.dish_name) {
//         const clarificationResponse = "I'd love to help you with a recipe! Could you be more specific about what dish you'd like to make?\n\nFor example:\n• \"How to make chicken biryani\"\n• \"Recipe for paneer butter masala\"\n• \"Show me pasta recipes\"\n\nWhat would you like to cook today? 😊";
        
//         responseCache.set(cacheKey, clarificationResponse);
//         return NextResponse.json({ response: clarificationResponse, source: "clarification" });
//       }
      
//       const dishName = extractResult.dish_name;
//       console.log(`🎯 Backend extracted dish: "${dishName}"`);
      
//       // STEP 2: Search in CSV database using Python backend
//       const searchResult = await callBackend('/api/search-recipe', { dish_name: dishName });
      
//       if (searchResult.found) {
//         console.log(`✅ Found recipe in CSV database`);
//         const response = searchResult.recipe;
        
//         responseCache.set(cacheKey, response);
//         return NextResponse.json({ 
//           response, 
//           source: "database",
//           dishName: dishName
//         });
//       }
      
//       // STEP 3: Generate recipe using Python backend with Gemini
//       console.log(`🤖 No CSV match found for "${dishName}" - generating with AI`);
      
//       const generateResult = await callBackend('/api/generate-recipe', { 
//         dish_name: dishName, 
//         user_query: userQuery 
//       });
      
//       const response = generateResult.recipe;
      
//       responseCache.set(cacheKey, response);
//       return NextResponse.json({ 
//         response, 
//         source: "ai_generated",
//         dishName: dishName
//       });
      
//     } catch (backendError) {
//       console.error("❌ Backend pipeline failed:", backendError);
      
//       // Enhanced fallback when backend fails
//       const fallbackResponse = `I'm having some technical difficulties right now, but I still want to help you cook something delicious!

// ## General Cooking Guidance

// While I work on restoring my full recipe database, here are some helpful tips:

// ### 🥘 For Your Request "${userQuery}":
// • Look up the basic ingredients you'll need
// • Prepare all ingredients before you start cooking
// • Follow standard cooking temperatures and timing
// • Season gradually and taste as you go

// ### 👨‍🍳 General Cooking Tips:
// • Always read the full recipe before starting
// • Have all your tools and ingredients ready
// • Don't rush the cooking process for best results
// • Adjust seasoning to your personal taste

// ### 💡 Quick Suggestion:
// Try searching for "${userQuery}" on a cooking website like AllRecipes or Food Network while I get my system back online!

// **Please try asking again in a few minutes - I should be back to full functionality soon!** 😊`;

//       responseCache.set(cacheKey, fallbackResponse);
//       return NextResponse.json({ 
//         response: fallbackResponse, 
//         source: "fallback"
//       });
//     }
    
//   } catch (error: any) {
//     console.error('❌ Error in chat API:', error);
//     return NextResponse.json({ 
//       error: 'Something went wrong. Please try again!',
//       response: "Sorry, I'm having trouble right now. Please try asking your question again, and I'll do my best to help you with your cooking needs! 🍳"
//     }, { status: 500 });
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
      const response = searchResult.recipe;
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "database", dishName });
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
