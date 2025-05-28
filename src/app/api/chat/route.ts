import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Using a different model with higher quota or simulating a response if API is exhausted
const API_KEY = "AIzaSyC4yeWyOcfsVGF6IRvDscOPdCoO-tG8XIs";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Cache to avoid hitting rate limits
const responseCache = new Map();

// Load and parse CSV data
let recipeDatabase: any[] = [];

async function loadRecipeDatabase() {
  try {
    console.log("⏳ Attempting to load recipe database...");
    
    // First try to load from data directory
    const csvFilePath = path.join(process.cwd(), 'data', 'recipes_small.csv');
    if (fs.existsSync(csvFilePath)) {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      recipeDatabase = parse(csvData, { columns: true });
      console.log(`✅ Successfully loaded ${recipeDatabase.length} recipes from CSV at ${csvFilePath}`);
      return;
    }
    
    // Then try the backend directory
    const backendPath = path.join(process.cwd(), 'backend', 'recipes_small.csv');
    if (fs.existsSync(backendPath)) {
      const csvData = fs.readFileSync(backendPath, 'utf8');
      recipeDatabase = parse(csvData, { columns: true });
      console.log(`✅ Successfully loaded ${recipeDatabase.length} recipes from CSV at ${backendPath}`);
      return;
    }
    
    // Try the root directory
    const rootPath = path.join(process.cwd(), 'recipes_small.csv');
    if (fs.existsSync(rootPath)) {
      const csvData = fs.readFileSync(rootPath, 'utf8');
      recipeDatabase = parse(csvData, { columns: true });
      console.log(`✅ Successfully loaded ${recipeDatabase.length} recipes from CSV at ${rootPath}`);
      return;
    }
    
    // Try parent directory
    const parentPath = path.join(process.cwd(), '..', 'recipes_small.csv');
    if (fs.existsSync(parentPath)) {
      const csvData = fs.readFileSync(parentPath, 'utf8');
      recipeDatabase = parse(csvData, { columns: true });
      console.log(`✅ Successfully loaded ${recipeDatabase.length} recipes from CSV at ${parentPath}`);
      return;
    }
    
    // Last attempt - hardcode a few recipes from the CSV in case all loading fails
    console.log('⚠️ CSV file not found in any expected location. Loading hardcoded recipes.');
    recipeDatabase = getHardcodedRecipes();
    console.log(`✅ Loaded ${recipeDatabase.length} hardcoded recipes as fallback`);
    
  } catch (error) {
    console.error('❌ Error loading recipe database:', error);
    // Initialize with hardcoded recipes as fallback
    recipeDatabase = getHardcodedRecipes();
    console.log(`✅ Loaded ${recipeDatabase.length} hardcoded recipes as fallback after error`);
  }
}

// Immediate load attempt
loadRecipeDatabase();

// Function to search recipes in CSV database
function searchRecipes(query: string): any[] | null {
  if (!recipeDatabase || recipeDatabase.length === 0) {
    console.log('⚠️ Recipe database not available, attempting to load it now...');
    loadRecipeDatabase();
    if (recipeDatabase.length === 0) {
      console.log('❌ Failed to load recipe database');
      return null;
    }
  }
  
  console.log(`🔍 Searching for recipes matching "${query}" in database of ${recipeDatabase.length} recipes`);
  query = query.toLowerCase().trim();
  
  // Extract key terms from the query
  const keywords = query.split(/\s+/).filter(word => word.length > 2);
  const exactMatch = keywords.join(' ');
  
  // First try exact title match
  const exactMatches = recipeDatabase.filter(recipe => {
    const title = (recipe.title || '').toLowerCase();
    return title === exactMatch || title.includes(exactMatch);
  });
  
  if (exactMatches.length > 0) {
    console.log(`✅ Found exact matches for "${query}"`);
    return exactMatches.slice(0, 3);
  }
  
  // Then try matching key components of the dish name
  const dishNameMatches = recipeDatabase.filter(recipe => {
    const title = (recipe.title || '').toLowerCase();
    
    // Check if all keywords appear in the title
    const allKeywordsMatch = keywords.every(keyword => title.includes(keyword));
    
    // Check if most keywords appear in the title (at least 70%)
    const keywordMatchCount = keywords.filter(keyword => title.includes(keyword)).length;
    const mostKeywordsMatch = keywordMatchCount >= Math.ceil(keywords.length * 0.7);
    
    return allKeywordsMatch || mostKeywordsMatch;
  });
  
  if (dishNameMatches.length > 0) {
    console.log(`✅ Found dish name matches for "${query}"`);
    return dishNameMatches.slice(0, 3);
  }
  
  // No strong matches found
  console.log(`❌ No strong recipe matches found in database for "${query}"`);
  return null;
}

// Function to format recipe from CSV data
function formatCSVRecipe(recipe: any): string {
  try {
    const title = recipe.title || 'Recipe';
    
    // Parse ingredients from string representation
    let ingredients: string[] = [];
    try {
      if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'string') {
          // Handle string representations of arrays like: ["item1", "item2"]
          ingredients = JSON.parse(recipe.ingredients.replace(/'/g, '"'));
        } else if (Array.isArray(recipe.ingredients)) {
          ingredients = recipe.ingredients;
        }
      }
    } catch (e) {
      ingredients = [recipe.ingredients];
    }
    
    // Parse directions from string representation
    let directions: string[] = [];
    try {
      if (recipe.directions) {
        if (typeof recipe.directions === 'string') {
          directions = JSON.parse(recipe.directions.replace(/'/g, '"'));
        } else if (Array.isArray(recipe.directions)) {
          directions = recipe.directions;
        }
      }
    } catch (e) {
      directions = [recipe.directions];
    }
    
    // Format the recipe in a nice readable format with ChatGPT-style formatting
    let formattedRecipe = `## ${title}\n\n`;
    formattedRecipe += `I found this delicious recipe for you! Here are the details:\n\n`;
    formattedRecipe += `### Ingredients:\n`;
    
    ingredients.forEach((ingredient, index) => {
      if (ingredient && ingredient.trim()) {
        formattedRecipe += `- ${ingredient.trim()}\n`;
      }
    });
    
    formattedRecipe += `\n### Instructions:\n`;
    
    directions.forEach((step, index) => {
      if (step && step.trim()) {
        formattedRecipe += `${index + 1}. ${step.trim()}\n`;
      }
    });
    
    return formattedRecipe;
  } catch (error) {
    console.error('❌ Error formatting CSV recipe:', error);
    return `## ${recipe.title || 'Recipe'}\n\nI found this recipe but couldn't format it properly. Let me see if I can find another one for you.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();
    const userQuery = message.trim();
    
    // Check cache first
    const cacheKey = userQuery.toLowerCase();
    if (responseCache.has(cacheKey)) {
      console.log("🔄 Returning cached response");
      return NextResponse.json({ 
        response: responseCache.get(cacheKey),
        source: responseCache.get(`${cacheKey}_source`) || "unknown"
      });
    }
    
    console.log(`📝 User query: "${userQuery}"`);
    
    // Enhanced conversation detection
    const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy|sup|what's up|how are you|how's it going|yo|hiya)/i.test(userQuery);
    const isQuestion = /^(what|why|how|when|where|who|can you|do you|tell me|could you|would you|should i|is there|are there|explain|describe)/i.test(userQuery);
    const isSimpleResponse = /^(yes|yeah|yep|yup|no|nope|nah|ok|okay|sure|fine|thanks|thank you|ty|thx|cool|nice|great|awesome|perfect|exactly|absolutely|definitely|maybe|perhaps|possibly|i think|i guess|sounds good|alright)$/i.test(userQuery);
    const isFarewell = /^(bye|goodbye|see you|farewell|take care|talk later|gtg|gotta go|thanks bye|thank you bye)$/i.test(userQuery);
    const isCompliment = /^(you're (great|awesome|amazing|helpful|good|the best)|thank you so much|thanks a lot|you rock|love it|love this|this is great|amazing|wonderful|excellent|brilliant|fantastic)$/i.test(userQuery);
    
    // Check if it's a recipe-related query
    const isRecipeQuery = /recipe|make|cook|prepare|bake|grill|roast|fry|boil|steam|sauté|how to make|how to cook|how do i|ingredients|cooking|food|dish|meal|breakfast|lunch|dinner|snack|dessert|curry|pasta|chicken|beef|fish|vegetarian|vegan|paneer|rice|bread|soup|salad|sandwich|pizza|burger|noodles|stir|marinade|sauce|spice|seasoning|nutrition|calories|protein|carbs|healthy|diet/i.test(userQuery);
    
    // Enhanced conversational logic
    if (!isRecipeQuery && (isGreeting || isQuestion || isSimpleResponse || isFarewell || isCompliment)) {
      console.log("👋 Detected a conversational query, providing conversational response");
      
      let conversationalResponse = "";
      
      // Greetings
      if (isGreeting) {
        const greetingResponses = [
          "Hello there! 👋 So great to hear from you! What culinary adventure are we embarking on today?",
          "Hey! 🌟 I'm excited to help you create something delicious. What's cooking?",
          "Hi! 😊 Ready to whip up something amazing? What kind of flavors are you craving?",
          "Hello! 🍳 I'm here to be your cooking companion. What can we make together today?",
          "Hey there! ✨ Whether you're a beginner or a seasoned chef, I'm here to help. What's on your mind?"
        ];
        conversationalResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      }
      
      // Simple responses and agreement
      else if (userQuery.toLowerCase().includes("yeah") || userQuery.toLowerCase().includes("yes") || userQuery.toLowerCase().includes("sure")) {
        const agreeResponses = [
          "Wonderful! 🎉 What kind of dish are you in the mood for? I can help you with anything from quick 5-minute snacks to elaborate gourmet meals!",
          "Perfect! ✨ Are you looking for something specific like comfort food, healthy options, or maybe something from a particular cuisine?",
          "Awesome! 🍽️ Tell me more about what you're craving - sweet, savory, spicy, or something completely different?",
          "Great! 👨‍🍳 Do you have any ingredients you'd like to use up, or should I suggest something completely new?",
          "Fantastic! 🌟 What's your cooking skill level? I can tailor my suggestions from beginner-friendly to chef-level challenges!"
        ];
        conversationalResponse = agreeResponses[Math.floor(Math.random() * agreeResponses.length)];
      }
      
      // Questions about the assistant
      else if (userQuery.toLowerCase().includes("what is yeah") || userQuery.toLowerCase().includes("what are you")) {
        conversationalResponse = "I'm NutriChef! 👨‍🍳 Your friendly AI cooking assistant. I'm here to help you discover amazing recipes, provide cooking tips, answer nutrition questions, and make your kitchen adventures more enjoyable. What would you like to explore today?";
      }
      
      // Compliments
      else if (isCompliment) {
        const complimentResponses = [
          "Aww, thank you! 😊 That means a lot! I love helping people discover the joy of cooking. What shall we create next?",
          "You're so kind! 🌟 It makes me happy to know I'm helping you in the kitchen. Ready for another culinary adventure?",
          "Thank you so much! 💚 Your enthusiasm for cooking is contagious! What delicious dish should we tackle together?",
          "That's so sweet of you to say! 😄 I'm here whenever you need cooking inspiration. What's next on your culinary wishlist?"
        ];
        conversationalResponse = complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
      }
      
      // Farewells
      else if (isFarewell) {
        const farewellResponses = [
          "Take care! 👋 Happy cooking, and remember - I'm always here when you need recipe inspiration!",
          "Goodbye! 🌟 Enjoy your cooking adventures, and don't hesitate to come back for more delicious ideas!",
          "See you later! 🍳 May your kitchen always be filled with amazing aromas and tasty creations!",
          "Bye for now! ✨ Keep experimenting in the kitchen - you've got this!"
        ];
        conversationalResponse = farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
      }
      
      // General questions or unclear intent
      else if (isQuestion || isSimpleResponse) {
        const helpfulResponses = [
          "I'd be happy to help! 🤗 Could you be more specific about what you'd like to know? I'm great with recipes, cooking techniques, ingredient substitutions, and nutrition advice!",
          "Absolutely! 💫 What cooking topic interests you? Whether it's a specific dish, dietary requirements, or cooking methods - I'm here for it all!",
          "Of course! 🎯 Feel free to ask me about recipes, cooking tips, meal planning, or anything food-related. What's on your culinary mind?",
          "I'm here to help! 🌟 Whether you need a recipe, want to learn a cooking technique, or have nutrition questions - just let me know what you're curious about!"
        ];
        conversationalResponse = helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
      }
      
      // Default friendly response
      else {
        conversationalResponse = "Thanks for chatting with me! 😊 I'm your friendly neighborhood cooking assistant. Whether you need recipes, cooking tips, or food inspiration - I'm here to help! What can we cook up together today? 🍳✨";
      }
      
      // Cache the response
      responseCache.set(cacheKey, conversationalResponse);
      responseCache.set(`${cacheKey}_source`, "conversation");
      
      return NextResponse.json({ 
        response: conversationalResponse,
        source: "conversation"
      });
    }
    
    // If database is empty, try loading it again
    if (recipeDatabase.length === 0) {
      await loadRecipeDatabase();
    }
    
    // 1. First try to find recipes in the CSV database
    const csvResults = searchRecipes(userQuery);
    
    if (csvResults && csvResults.length > 0) {
      console.log(`🍳 Found recipes in database: ${csvResults.map(r => r.title).join(', ')}`);
      
      // Format the first recipe from CSV
      const mainRecipe = formatCSVRecipe(csvResults[0]);
      
      // Include suggestions for other matches if available
      let suggestions = '';
      if (csvResults.length > 1) {
        suggestions = '\n\n### 🌟 I also found these other recipes you might like:\n';
        csvResults.slice(1).forEach((recipe, index) => {
          suggestions += `- ${recipe.title}\n`;
        });
        suggestions += '\nWould you like to see any of these recipes instead? Just ask and I\'ll show you the details! 😊';
      }
      
      const personalizedIntro = getPersonalizedIntro(userQuery);
      const response = `${personalizedIntro}${mainRecipe}${suggestions}\n\n💡 **Need help with this recipe?** I can explain any cooking terms, suggest substitutions, recommend side dishes, or help you adjust portions. Just ask! 👨‍🍳`;
      
      // Cache the response along with source info
      responseCache.set(cacheKey, response);
      responseCache.set(`${cacheKey}_source`, "database");
      
      return NextResponse.json({ 
        response,
        source: "database"
      });
    }
    
    // 2. If no results in CSV, use Gemini API with enhanced prompt
    console.log(`🌐 No matching recipes in database, using Gemini API for: "${userQuery}"`);
    
    // Enhanced recipe prompt with better conversation context
    const recipePrompt = `You're NutriChef, a warm, friendly, and knowledgeable cooking assistant with the personality of a helpful friend who loves food. You have expertise in recipes, cooking techniques, nutrition, and food culture from around the world.

The user is asking: "${userQuery}"

Context from conversation history: ${history.length > 0 ? history.map(h => `${h.role}: ${h.content}`).join('\n') : 'This is the start of our conversation.'}

Please respond in a natural, conversational way. Here's how to handle different types of requests:

**For recipe requests:**
- Start with an enthusiastic, personalized greeting that acknowledges their specific request
- Use emojis sparingly but effectively (1-2 per response)
- Create a recipe title as a level 2 heading (## Recipe Name)
- List ingredients with bullet points, including approximate quantities
- Number the cooking instructions step by step with clear, easy-to-follow directions
- Include helpful cooking tips, timing, or technique notes
- Add a brief nutritional insight or serving suggestion
- End with an engaging question to encourage further conversation (like asking about dietary preferences, skill level, or what they plan to serve it with)

**For cooking questions (not recipe requests):**
- Answer helpfully and conversationally
- Share practical tips and insights
- Ask follow-up questions to better understand their needs
- Offer to provide related recipes or additional help

**For general food/nutrition questions:**
- Provide accurate, helpful information
- Keep the tone friendly and approachable
- Offer practical applications or suggestions

**Tone guidelines:**
- Be warm, encouraging, and enthusiastic about food
- Use a friendly, conversational style (like talking to a friend)
- Show genuine interest in helping them succeed in the kitchen
- Be supportive for beginners and informative for experienced cooks
- Avoid being overly formal or robotic

Keep your responses well-structured, informative, and engaging. Make cooking feel accessible and fun!`;
    
    // Create the proper structure for Gemini API
    const body = {
      contents: [
        {
          parts: [
            { text: recipePrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8, // Slightly higher for more natural conversation
        maxOutputTokens: 1200, // Increased for more detailed responses
      }
    };
    
    console.log("🚀 Sending request to Gemini API...");
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        // If we hit rate limits, provide a fallback response
        if (response.status === 429) {
          console.log("⚠️ Rate limit hit, using fallback response");
          const fallbackResponse = getFallbackResponse(userQuery);
          
          // Cache the fallback to avoid future API calls
          responseCache.set(cacheKey, fallbackResponse);
          responseCache.set(`${cacheKey}_source`, "fallback");
          
          return NextResponse.json({ 
            response: fallbackResponse,
            source: "fallback"
          });
        }
        
        const errorData = await response.text();
        console.error(`❌ API Error (${response.status}): ${errorData}`);
        
        // Provide a specific fallback for the user's query
        const fallbackResponse = getFallbackResponse(userQuery);
        responseCache.set(cacheKey, fallbackResponse);
        responseCache.set(`${cacheKey}_source`, "fallback");
        
        return NextResponse.json({ 
          response: fallbackResponse,
          source: "fallback"
        });
      }
      
      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Cache the response
      responseCache.set(cacheKey, responseText);
      responseCache.set(`${cacheKey}_source`, "api");
      
      return NextResponse.json({ 
        response: responseText,
        source: "api"
      });
    } catch (error) {
      console.error("❌ API call failed, using fallback response", error);
      const fallbackResponse = getFallbackResponse(userQuery);
      
      // Cache the fallback
      responseCache.set(cacheKey, fallbackResponse);
      responseCache.set(`${cacheKey}_source`, "fallback");
      
      return NextResponse.json({ 
        response: fallbackResponse,
        source: "fallback"
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

// Enhanced fallback responses for specific queries
function getFallbackResponse(message: string): string {
  const query = message.toLowerCase();
  
  if (query.includes("paneer") && query.includes("butter") && query.includes("masala")) {
    return `I'd love to help you make Paneer Butter Masala! Here's a delicious recipe for you:

## Paneer Butter Masala

### Ingredients:
- 400g paneer, cubed
- 2 large tomatoes, chopped
- 1 large onion, chopped
- 3-4 garlic cloves
- 1-inch piece ginger
- 2-3 green chilies
- 2 tbsp butter
- 1 tbsp oil
- 1 tsp cumin seeds
- 1 tsp garam masala
- 1 tsp red chili powder
- 1/2 tsp turmeric powder
- 1/2 cup heavy cream
- 2 tbsp cashews (optional)
- Salt to taste
- Fresh coriander for garnish

### Instructions:
1. Blend tomatoes, onion, garlic, ginger, and green chilies into a smooth paste.
2. Heat butter and oil in a pan. Add cumin seeds and let them splutter.
3. Add the tomato-onion paste and cook for 8-10 minutes until oil separates.
4. Add all the spices and cook for 2 minutes.
5. Add paneer cubes and gently mix.
6. Pour in the cream and simmer for 3-4 minutes.
7. Garnish with fresh coriander and serve hot with rice or naan.

This creamy, flavorful dish serves 4 people and is perfect for a special dinner! The paneer provides about 18g of protein per serving.

Would you like any tips for making the paneer extra soft, or suggestions for side dishes to go with this?`;
  }
  
  if (query.includes("pasta") || query.includes("spaghetti")) {
    return `I don't have a specific database match for your request, but I can offer this delicious pasta recipe instead.

## Quick Garlic Pasta

### Ingredients:
- 8 oz pasta (any shape you prefer)
- 3 tbsp olive oil
- 4-6 cloves garlic, minced
- 1/4 tsp red pepper flakes (optional, for a bit of heat)
- 1/2 cup grated Parmesan cheese
- Salt and black pepper to taste
- 2 tbsp fresh parsley, chopped

### Instructions:
1. Cook pasta according to package directions until al dente.
2. While pasta cooks, heat olive oil over medium heat in a large skillet.
3. Add minced garlic and red pepper flakes, cooking until fragrant (about 1 minute).
4. Reserve 1/2 cup pasta water, then drain pasta.
5. Add pasta to the skillet with garlic oil, tossing to coat.
6. Add Parmesan cheese and a splash of pasta water, stirring until creamy.
7. Season with salt and pepper, then garnish with fresh parsley.

This simple pasta has about 380 calories per serving with 15g fat, 48g carbs, and 12g protein.

Would you like to know any substitutions you could make or what sides would go well with this dish?`;
  }
  
  // Default fallback that acknowledges it's creating a custom recipe for the query
  return `I'm having trouble accessing my full recipe database right now, but I'd still love to help you with "${message}"!

## Quick Recipe Suggestion

While I work on getting you the perfect recipe, here are some general tips for cooking ${message}:

### Basic Approach:
- Start with fresh, quality ingredients
- Prepare all ingredients before you start cooking
- Follow proper cooking temperatures and timing
- Season gradually and taste as you go

### General Cooking Tips:
- Always read the full recipe before starting
- Have all your tools and ingredients ready
- Don't rush the cooking process
- Adjust seasoning to your taste preferences

I'd love to provide you with a detailed recipe once my connection is restored. In the meantime, would you like some general cooking tips or suggestions for similar dishes I can help you with right now?`;
}

// Hardcoded recipes from the CSV file as a fallback
function getHardcodedRecipes() {
  return [
    {
      title: "Triple-Citrus Cupcakes",
      ingredients: `["3 1/3 cups all-purpose flour", "2 teaspoons coarse salt", "1 pound (4 sticks) unsalted butter, room temperature", "2 cups sugar", "3 tablespoons finely grated lemon zest (from 3 lemons)", "3 tablespoons finely grated orange zest (from 2 oranges)", "3 tablespoons finely grated lime zest, plus more for garnish (from about 3 limes)", "1 teaspoon pure vanilla extract", "9 large eggs, room temperature", "Citrus Glaze (made with lime juice and zest; page 315)"]`,
      directions: `["Preheat oven to 325F.", "Line standard muffin tins with paper liners.", "Whisk together flour and salt.", "With an electric mixer on medium-high speed, cream butter and sugar until pale and fluffy, scraping down sides of bowl every few minutes.", "Add citrus zests.", "Reduce speed to medium, and add vanilla.", "Add eggs, three at a time, beating until incorporated, scraping down sides of bowl as needed.", "Reduce speed to low.", "Add flour mixture in four batches, beating until completely incorporated after each.", "Divide batter evenly among lined cups, filling each three-quarters full; tap pans on countertop once to distribute batter.", "Bake, rotating tins halfway through, until a cake tester inserted in centers comes out clean, about 20 minutes.", "Transfer tins to wire racks to cool 10 minutes; turn out cupcakes onto racks and let cool completely.", "Cupcakes can be stored up to 2 days at room temperature, or frozen up to 2 months, in airtight containers.", "To finish, dip tops of cupcakes in glaze, then turn over quickly and garnish with zest.", "Cupcakes are best eaten the day they are glazed; keep at room temperature until ready to serve."]`
    },
    {
      title: "Marinated Flank Steak Recipe",
      ingredients: `["1 1/2 pound flank steak", "1/2 c. finely minced green onions (scallions)", "1/2 c. dry red wine", "1/4 c. soy sauce", "3 tbsp. salad oil", "3 teaspoon sesame seeds", "2 teaspoon packed brown sugar", "1/4 teaspoon grnd black pepper", "1/4 teaspoon grnd ginger", "1 clove garlic, chopped"]`,
      directions: `["Remove tenderloin from steak.", "Score meat.", "Combine remaining ingredients and pour over meat.", "Let marinate 24 hrs.", "Preheat grill.", "Broil or possibly grill.", "Slice thinly on an angle against the grain."]`
    },
    {
      title: "French Chicken Stew",
      ingredients: `["1 tablespoon rosemary", "1 teaspoon thyme", "3 bay leaves", "1 teaspoon smoked paprika", "1 teaspoon pepper", "1/4 cup red wine", "3 cups chicken broth", "2 cups button mushrooms sliced", "2 cups mushroom mix, oyster, shiitake, baby bella, sliced", "2 medium carrots sliced diagonally", "1 onion medium, chopped", "1 red potato medium, cut in 1-inch pieces", "1 cup frozen green beans 1-inch pieces", "1/2 can black olives pitted ripe, halved", "1 handful grape tomatoes halved", "8 chicken thighs with bones and skin. 2-3 lbs", "2 stalks celery", "3 cups water"]`,
      directions: `["combine all ingredients in slow cooker (6 quarts). bury chicken in vegetables. don't put herbs directly on chicken (because skin is removed later)", "add enough broth and water to cover most of ingredients. liquid level rises a good amount during cooking, so careful with filling the slow cooker too much.", "turn slow cooker on low for 6-7 hours or high 3-4 hours. Note: in my newer Crock-Pot this was enough time, but in my parents' older Crock-Pot 7 hours on low was not enough (don't know how long would be good. we left the veggies a little tough).", "pull out all chicken.", "skim off fat from top with spoon", "pull off skin and remove bones from chicken. shred and return to soup."]`
    },
    {
      title: "Jalapeno Salsa Dona",
      ingredients: `["12 jalapenos LARGE", "6 cloves roasted garlic", "1/4 cup olive oil", "1 tablespoon rice wine vinegar", "salt TO TASTE"]`,
      directions: `["Rinse the jalapenos and arrange them on a baking sheet.", "Turn the oven to broil.", "Roast the peppers under the broiler until lightly browned turning so all sides are browned.", "Turn off the heat and let the peppers sit for about 10 minutes.", "Stem the peppers and remove the seeds. Remove the skin.", "Place the peppers, garlic, olive oil and rice wine vinegar in a blender or food processor.", "Blend until smooth and silky. Salt to taste.", "The jalapenos and olive oil will turn into a silky smooth paste.", "Depending on the size of your jalapenos and preference, add more salt and vinegar to taste."]`
    }
  ];
}

// Add this helper function at the bottom of your file
function getPersonalizedIntro(query: string): string {
  const introOptions = [
    `Perfect! I found exactly what you're looking for with "${query}"! 🎯\n\n`,
    `Great choice! Here's a wonderful recipe for ${query} that I think you'll love! ✨\n\n`,
    `Excellent request! I've got the perfect ${query} recipe for you! 🍳\n\n`,
    `You're in for a treat! This ${query} recipe is one of my favorites to share! 😊\n\n`,
    `Amazing choice! Let me share this delicious ${query} recipe with you! 🌟\n\n`,
  ];
  
  return introOptions[Math.floor(Math.random() * introOptions.length)];
}