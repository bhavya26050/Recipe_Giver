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

// Update the formatCSVRecipe function for better ChatGPT-style formatting
function formatCSVRecipe(recipe: any): string {
  try {
    const title = recipe.title || 'Recipe';
    
    // Parse ingredients from string representation
    let ingredients: string[] = [];
    try {
      if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'string') {
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
    
    // Format the recipe with proper ChatGPT-style structure
    let formattedRecipe = `## ${title}\n\n`;
    
    // Ingredients section
    formattedRecipe += `### 📋 Ingredients:\n\n`;
    ingredients.forEach((ingredient, index) => {
      if (ingredient && ingredient.trim()) {
        formattedRecipe += `• ${ingredient.trim()}\n`;
      }
    });
    
    // Instructions section
    formattedRecipe += `\n### 👩‍🍳 Instructions:\n\n`;
    directions.forEach((step, index) => {
      if (step && step.trim()) {
        formattedRecipe += `**${index + 1}.** ${step.trim()}\n\n`;
      }
    });
    
    // Add a helpful tip section
    formattedRecipe += `### 💡 Chef's Tips:\n\n`;
    formattedRecipe += `• Read through all steps before starting\n`;
    formattedRecipe += `• Prep all ingredients beforehand for smoother cooking\n`;
    formattedRecipe += `• Taste and adjust seasonings as needed\n`;
    
    return formattedRecipe;
  } catch (error) {
    console.error('❌ Error formatting CSV recipe:', error);
    return `## ${recipe.title || 'Recipe'}\n\nI found this recipe but had trouble formatting it. Let me help you with a different recipe or answer any cooking questions you have!`;
  }
}

// Update the POST function with stricter food/recipe filtering
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
    const isSimpleResponse = /^(yes|yeah|yep|yup|no|nope|nah|ok|okay|sure|fine|thanks|thank you|ty|thx|cool|nice|great|awesome|perfect|exactly|absolutely|definitely|maybe|perhaps|possibly|i think|i guess|sounds good|alright)$/i.test(userQuery);
    const isFarewell = /^(bye|goodbye|see you|farewell|take care|talk later|gtg|gotta go|thanks bye|thank you bye)$/i.test(userQuery);
    const isCompliment = /^(you're (great|awesome|amazing|helpful|good|the best)|thank you so much|thanks a lot|you rock|love it|love this|this is great|amazing|wonderful|excellent|brilliant|fantastic)$/i.test(userQuery);
    
    // Comprehensive food and cooking related keywords
    const isFoodRelated = /recipe|make|cook|prepare|bake|grill|roast|fry|boil|steam|sauté|how to make|how to cook|how do i cook|ingredients|cooking|food|dish|meal|breakfast|lunch|dinner|snack|dessert|curry|pasta|chicken|beef|fish|pork|lamb|vegetarian|vegan|paneer|rice|bread|soup|salad|sandwich|pizza|burger|noodles|stir|marinade|sauce|spice|seasoning|nutrition|calories|protein|carbs|healthy|diet|kitchen|chef|culinary|baking|grilling|eating|taste|flavor|delicious|yummy|restaurant|cafe|menu|order|serve|plate|bowl|cup|tablespoon|teaspoon|oven|stove|microwave|refrigerator|freezer|fresh|organic|herbs|vegetables|fruits|meat|dairy|cheese|milk|eggs|oil|butter|sugar|salt|pepper|garlic|onion|tomato|potato|carrot|broccoli|spinach|lettuce|apple|banana|orange|lemon|lime|strawberry|blueberry|avocado|quinoa|pasta|noodles|bread|toast|cereal|oatmeal|smoothie|juice|coffee|tea|wine|beer|water|appetizer|entree|main course|side dish|garnish|dressing|marinade|glaze|topping|filling|crust|dough|batter|frosting|syrup/i.test(userQuery);
    
    // Check for non-food programming/technical queries
    const isProgrammingQuery = /code|programming|function|algorithm|fibonacci|array|loop|variable|class|method|software|computer|javascript|python|java|html|css|database|server|api|github|git|coding|developer|programming language|syntax|debug|compile|execute|binary|decimal|hexadecimal|bit|byte|memory|cpu|hardware|software|operating system|windows|linux|mac|android|ios|app development|web development|machine learning|artificial intelligence|data structure|sorting|searching|binary tree|linked list|stack|queue|recursion|iteration|conditional|if statement|for loop|while loop|switch case/i.test(userQuery);
    
    // Check for other non-food topics
    const isNonFoodQuery = /weather|sports|politics|news|movie|music|book|travel|math|science|physics|chemistry|biology|history|geography|literature|art|fashion|technology|business|finance|stock|investment|cryptocurrency|bitcoin|car|vehicle|transport|airplane|train|bus|hotel|vacation|holiday|school|university|education|job|career|interview|salary|money|bank|insurance|health|medicine|doctor|hospital|pharmacy|exercise|gym|fitness|workout|yoga|meditation|psychology|therapy|relationship|dating|marriage|family|children|baby|pet|dog|cat|bird|fish|plant|garden|flower|tree|house|apartment|furniture|decoration|cleaning|laundry|shopping|clothes|shoes|jewelry|makeup|skincare|haircare|game|video game|smartphone|laptop|tablet|internet|social media|facebook|instagram|twitter|youtube|netflix|spotify|amazon|google|apple|microsoft|tesla|phone number|address|email|password|login|account|profile|settings|download|upload|install|update|backup|virus|security|privacy|encryption|blockchain|quantum|space|nasa|mars|moon|planet|star|universe|galaxy|solar system|climate change|global warming|environment|pollution|recycling|energy|electricity|solar power|wind power|nuclear|fossil fuel|oil|gas|coal/i.test(userQuery);
    
    // Enhanced logic for handling queries
    if (isGreeting || isSimpleResponse || isFarewell || isCompliment) {
      console.log("👋 Detected a conversational query, providing conversational response");
      
      let conversationalResponse = "";
      
      // Greetings
      if (isGreeting) {
        const greetingResponses = [
          "Hello there! 👋 I'm NutriChef, your dedicated cooking assistant. I'm here to help you with recipes, cooking techniques, and food-related questions. What delicious dish would you like to create today?",
          "Hey! 🌟 Welcome to NutriChef! I specialize in all things food and cooking. Whether you need a recipe, cooking tips, or nutrition advice, I'm your culinary companion. What can I cook up for you?",
          "Hi! 😊 I'm excited to help you on your culinary journey! I can assist with recipes, cooking methods, ingredient substitutions, and food-related questions. What's cooking in your mind today?",
          "Hello! 🍳 I'm NutriChef, and I live and breathe food! From simple snacks to gourmet meals, I'm here to guide your cooking adventures. What would you like to explore in the kitchen?",
          "Hey there! ✨ Ready to create something amazing in the kitchen? I'm here to help with recipes, cooking tips, nutrition advice, and all your food-related questions. What shall we make together?"
        ];
        conversationalResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      }
      
      // Simple responses and agreement
      else if (userQuery.toLowerCase().includes("yeah") || userQuery.toLowerCase().includes("yes") || userQuery.toLowerCase().includes("sure")) {
        const agreeResponses = [
          "Wonderful! 🎉 What type of cuisine are you interested in? I can help with everything from comfort food to international dishes, healthy meals to indulgent treats!",
          "Perfect! ✨ Are you looking for something quick and easy, or do you have time for a more elaborate cooking project? I can suggest recipes based on your available time and skill level.",
          "Awesome! 🍽️ Tell me what you're in the mood for - are you craving something specific, or would you like me to suggest recipes based on ingredients you have?",
          "Great! 👨‍🍳 What's your cooking experience like? I can tailor my suggestions from beginner-friendly recipes to more advanced culinary challenges.",
          "Fantastic! 🌟 Do you have any dietary preferences or restrictions I should know about? I can help with vegetarian, vegan, gluten-free, or any other specific dietary needs."
        ];
        conversationalResponse = agreeResponses[Math.floor(Math.random() * agreeResponses.length)];
      }
      
      // Compliments
      else if (isCompliment) {
        const complimentResponses = [
          "Thank you so much! 😊 I'm passionate about helping people discover the joy of cooking. What culinary adventure would you like to embark on next?",
          "You're so kind! 🌟 It makes me happy to help fellow food enthusiasts. Ready to explore some delicious recipes together?",
          "Aww, thank you! 💚 I love sharing my culinary knowledge. What type of dish or cooking technique would you like to learn about?",
          "That means the world to me! 😄 I'm here to make cooking fun and accessible. What can I help you create in the kitchen today?"
        ];
        conversationalResponse = complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
      }
      
      // Farewells
      else if (isFarewell) {
        const farewellResponses = [
          "Take care and happy cooking! 👋 Remember, I'm always here when you need recipe inspiration or cooking guidance. Enjoy your culinary adventures!",
          "Goodbye! 🌟 May your kitchen be filled with delicious aromas and successful cooking experiments. Come back anytime for more food wisdom!",
          "See you later! 🍳 Keep exploring new flavors and recipes. I'll be here whenever you need cooking support or food inspiration!",
          "Bye for now! ✨ Wishing you many delicious meals ahead. Don't hesitate to return for more culinary guidance!"
        ];
        conversationalResponse = farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
      }
      
      // Default friendly response
      else {
        conversationalResponse = "Thanks for chatting with me! 😊 I'm NutriChef, your dedicated cooking companion. I'm here to help with recipes, cooking techniques, nutrition advice, and all things food-related. What culinary creation shall we work on together? 🍳✨";
      }
      
      // Cache the response
      responseCache.set(cacheKey, conversationalResponse);
      responseCache.set(`${cacheKey}_source`, "conversation");
      
      return NextResponse.json({ 
        response: conversationalResponse,
        source: "conversation"
      });
    }
    
    // Check if the query is programming/technical or completely unrelated to food
    if (isProgrammingQuery || (isNonFoodQuery && !isFoodRelated)) {
      console.log("🚫 Detected non-food related query, redirecting to food topics");
      
      const redirectResponses = [
        "I appreciate your question, but I'm NutriChef - a specialized cooking and recipe assistant! 🍳 I focus exclusively on food, recipes, cooking techniques, and nutrition. \n\nIs there anything delicious you'd like to cook today? I can help you find recipes, explain cooking methods, or answer nutrition questions!",
        
        "That's an interesting question, but I'm designed specifically to help with cooking and food-related topics! 👨‍🍳 \n\nHow about we explore something tasty instead? I can suggest recipes based on ingredients you have, help with cooking techniques, or provide nutrition advice. What sounds good to you?",
        
        "I'd love to help, but my expertise is all about food and cooking! 🌟 I'm your go-to assistant for recipes, cooking tips, meal planning, and nutrition guidance.\n\nWhat kind of delicious dish would you like to create today? I'm here to make your cooking journey amazing!",
        
        "Thanks for the question! However, I'm NutriChef, and I specialize in all things culinary! 🍽️ From recipes and cooking techniques to nutrition advice and meal planning - that's where I shine.\n\nLet's talk food! What are you in the mood to cook or learn about today?"
      ];
      
      const redirectResponse = redirectResponses[Math.floor(Math.random() * redirectResponses.length)];
      
      // Cache the response
      responseCache.set(cacheKey, redirectResponse);
      responseCache.set(`${cacheKey}_source`, "redirect");
      
      return NextResponse.json({ 
        response: redirectResponse,
        source: "redirect"
      });
    }
    
    // If it's not food-related but also not clearly programming/non-food, give a gentle redirect
    if (!isFoodRelated) {
      console.log("❓ Unclear query, gently redirecting to food topics");
      
      const gentleRedirect = "I'm NutriChef, your specialized cooking assistant! 🍳 I'm here to help with recipes, cooking techniques, nutrition, and all things food-related.\n\nWhat would you like to cook today? I can help you find the perfect recipe, explain cooking methods, or answer any food and nutrition questions you might have! 😊";
      
      // Cache the response
      responseCache.set(cacheKey, gentleRedirect);
      responseCache.set(`${cacheKey}_source`, "redirect");
      
      return NextResponse.json({ 
        response: gentleRedirect,
        source: "redirect"
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
        suggestions = '\n\n---\n\n### 🌟 Other recipes you might enjoy:\n\n';
        csvResults.slice(1).forEach((recipe, index) => {
          suggestions += `**${index + 1}.** ${recipe.title}\n`;
        });
        suggestions += '\n*Would you like to see any of these recipes? Just ask!* 😊';
      }
      
      const personalizedIntro = getPersonalizedIntro(userQuery);
      const response = `${personalizedIntro}${mainRecipe}${suggestions}\n\n---\n\n💡 **Need help with this recipe?** \nI can explain cooking terms, suggest ingredient substitutions, recommend side dishes, help adjust portions, or answer any cooking questions! 👨‍🍳`;
      
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
    
    // Enhanced recipe prompt with better formatting instructions
    const recipePrompt = `You are NutriChef, a warm, friendly, and knowledgeable cooking assistant. You specialize exclusively in food, recipes, cooking techniques, and nutrition.

The user is asking: "${userQuery}"

IMPORTANT: Only respond to food and cooking related queries. If the request is not about food, recipes, cooking, or nutrition, politely redirect them to ask about culinary topics.

For food-related requests, follow this structure:

**For recipe requests:**
1. Start with a brief, enthusiastic greeting that acknowledges their request
2. Create a clear recipe title using ## heading
3. List ingredients with bullet points, including quantities
4. Provide numbered step-by-step instructions
5. Include helpful cooking tips or techniques
6. Add nutritional information if relevant
7. End with an encouraging question to continue the conversation

**For cooking questions:**
- Provide clear, helpful answers
- Share practical tips and techniques
- Offer related recipe suggestions when appropriate

**Formatting guidelines:**
- Use proper markdown formatting
- Structure responses with clear sections
- Include helpful emojis sparingly (1-2 per response)
- Keep tone conversational but informative
- Make instructions easy to follow

**Tone:**
- Warm and encouraging
- Professional but friendly
- Supportive for all skill levels
- Enthusiastic about food and cooking

Remember: You are a culinary expert focused solely on helping people cook, eat well, and enjoy food!`;
    
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
        temperature: 0.7,
        maxOutputTokens: 1200,
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
        if (response.status === 429) {
          console.log("⚠️ Rate limit hit, using fallback response");
          const fallbackResponse = getFallbackResponse(userQuery);
          
          responseCache.set(cacheKey, fallbackResponse);
          responseCache.set(`${cacheKey}_source`, "fallback");
          
          return NextResponse.json({ 
            response: fallbackResponse,
            source: "fallback"
          });
        }
        
        const errorData = await response.text();
        console.error(`❌ API Error (${response.status}): ${errorData}`);
        
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

// Update the helper function for better personalized intros

function getPersonalizedIntro(query: string): string {
  const introOptions = [
    `Perfect! I found exactly what you're looking for! 🎯\n\n`,
    `Great choice! Here's a delicious recipe that I think you'll love: ✨\n\n`,
    `Excellent! I've got the perfect recipe for you: 🍳\n\n`,
    `You're in for a treat! Here's one of my favorite recipes to share: 😊\n\n`,
    `Amazing choice! Let me share this wonderful recipe with you: 🌟\n\n`,
  ];
  
  return introOptions[Math.floor(Math.random() * introOptions.length)];
}