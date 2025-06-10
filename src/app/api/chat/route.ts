import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Using Gemini API
const API_KEY = "AIzaSyC4yeWyOcfsVGF6IRvDscOPdCoO-tG8XIs";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Cache to avoid hitting rate limits
const responseCache = new Map();

// Load and parse CSV data
let recipeDatabase: any[] = [];

async function loadRecipeDatabase() {
  try {
    console.log("⏳ Attempting to load recipe database...");
    
    // Try multiple paths to find the CSV file
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'recipes_small.csv'),
      path.join(process.cwd(), 'backend', 'recipes_small.csv'),
      path.join(process.cwd(), 'recipes_small.csv'),
      path.join(process.cwd(), '..', 'recipes_small.csv')
    ];
    
    for (const csvPath of possiblePaths) {
      if (fs.existsSync(csvPath)) {
        const csvData = fs.readFileSync(csvPath, 'utf8');
        recipeDatabase = parse(csvData, { columns: true });
        console.log(`✅ Successfully loaded ${recipeDatabase.length} recipes from CSV at ${csvPath}`);
        return;
      }
    }
    
    console.log('⚠️ CSV file not found. Will rely on AI for recipe generation.');
    recipeDatabase = [];
    
  } catch (error) {
    console.error('❌ Error loading recipe database:', error);
    recipeDatabase = [];
  }
}

// Immediate load attempt
loadRecipeDatabase();

// STEP 1: Improved Intent Extraction - Extract recipe name from user query
async function extractRecipeName(userQuery: string): Promise<string | null> {
  const extractionPrompt = `Extract ONLY the exact dish name from this user query. Be very specific and precise.

User query: "${userQuery}"

Rules:
- Extract the complete dish name including all words that describe the dish
- Don't add extra words
- Don't abbreviate
- If multiple dishes are mentioned, pick the main one
- Return the dish name in lowercase

Examples:
- "How do I make butter chicken?" → "butter chicken"
- "Recipe for chocolate cake please" → "chocolate cake"
- "Can you tell me paneer butter masala recipe?" → "paneer butter masala"
- "I want to cook chicken biryani" → "chicken biryani"
- "Show me pasta carbonara" → "pasta carbonara"
- "Make me some fried rice" → "fried rice"

If no clear dish name is found, respond with "NONE".

Dish name:`;

  const body = {
    contents: [{ parts: [{ text: extractionPrompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 20,
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    let dishName = data.candidates[0].content.parts[0].text.trim().toLowerCase();
    
    // Clean up the response
    dishName = dishName.replace(/^dish name:\s*/i, '').replace(/['"]/g, '').trim();
    
    if (dishName === 'none' || dishName.length < 3) {
      return null;
    }
    
    console.log(`🧠 Extracted dish name: "${dishName}" from query: "${userQuery}"`);
    return dishName;
  } catch (error) {
    console.error('❌ Failed to extract recipe name:', error);
    
    // Fallback: Simple regex extraction if API fails
    const query = userQuery.toLowerCase();
    const dishPatterns = [
      /(?:recipe for|make|cook|prepare)\s+(.+?)(?:\s+recipe|\s+please|$)/,
      /(?:how to make|how do i make)\s+(.+?)(?:\s+recipe|$|\?)/,
      /(paneer butter masala|butter chicken|chicken biryani|pasta carbonara|fried rice|chocolate cake)/,
    ];
    
    for (const pattern of dishPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        console.log(`🔄 Fallback extraction: "${match[1]}" from query: "${userQuery}"`);
        return match[1].trim();
      }
    }
    
    return null;
  }
}

// STEP 2: Much more strict Local CSV Search
function searchRecipeInCSV(dishName: string): any | null {
  if (!recipeDatabase || recipeDatabase.length === 0) {
    console.log('⚠️ Recipe database not available');
    return null;
  }
  
  console.log(`🔍 Searching for "${dishName}" in database of ${recipeDatabase.length} recipes`);
  
  const searchTerm = dishName.toLowerCase().trim();
  
  // Try EXACT match first (very strict)
  let match = recipeDatabase.find(recipe => {
    const title = (recipe.title || '').toLowerCase().trim();
    return title === searchTerm;
  });
  
  if (match) {
    console.log(`✅ Found EXACT match in CSV: "${match.title}"`);
    return match;
  }
  
  // Try very specific partial match (must match main keywords)
  const dishKeywords = searchTerm.split(/\s+/).filter(word => word.length > 2);
  
  if (dishKeywords.length >= 2) {
    match = recipeDatabase.find(recipe => {
      const title = (recipe.title || '').toLowerCase();
      // ALL keywords must be present for a match
      return dishKeywords.every(keyword => title.includes(keyword));
    });
    
    if (match) {
      console.log(`✅ Found specific match in CSV: "${match.title}" for "${dishName}"`);
      return match;
    }
  }
  
  // For Indian dishes, be even more specific
  if (searchTerm.includes('paneer') || searchTerm.includes('butter') || searchTerm.includes('masala')) {
    match = recipeDatabase.find(recipe => {
      const title = (recipe.title || '').toLowerCase();
      return title.includes('paneer') && title.includes('butter') && title.includes('masala');
    });
    
    if (match) {
      console.log(`✅ Found Indian dish match in CSV: "${match.title}"`);
      return match;
    }
  }
  
  // For biryani
  if (searchTerm.includes('biryani')) {
    match = recipeDatabase.find(recipe => {
      const title = (recipe.title || '').toLowerCase();
      return title.includes('biryani');
    });
    
    if (match) {
      console.log(`✅ Found biryani match in CSV: "${match.title}"`);
      return match;
    }
  }
  
  console.log(`❌ No specific recipe found in CSV for "${dishName}" - will use AI generation`);
  return null;
}

// STEP 3: Format CSV Recipe
function formatCSVRecipe(recipe: any): string {
  try {
    const title = recipe.title || 'Recipe';
    
    // Parse ingredients
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
      ingredients = recipe.ingredients ? [recipe.ingredients] : [];
    }
    
    // Parse directions
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
      directions = recipe.directions ? [recipe.directions] : [];
    }
    
    // Clean and format
    const cleanIngredients = ingredients
      .filter(ing => ing && ing.trim())
      .map(ing => ing.trim().replace(/^[^-]*-\s*/, ''));
    
    const cleanDirections = directions
      .filter(dir => dir && dir.trim())
      .map(dir => {
        let cleaned = dir.trim();
        if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
          cleaned += '.';
        }
        return cleaned;
      });
    
    let formattedRecipe = `## ${title}\n\n`;
    formattedRecipe += `*Perfect! I found this recipe in my database for you!* 🎯\n\n`;
    
    if (cleanIngredients.length > 0) {
      formattedRecipe += `### 🥘 Ingredients:\n\n`;
      cleanIngredients.forEach(ingredient => {
        formattedRecipe += `• ${ingredient}\n`;
      });
      formattedRecipe += '\n';
    }
    
    if (cleanDirections.length > 0) {
      formattedRecipe += `### 👨‍🍳 Instructions:\n\n`;
      cleanDirections.forEach((step, index) => {
        formattedRecipe += `**${index + 1}.** ${step}\n\n`;
      });
    }
    
    formattedRecipe += `### 💡 Chef's Tips:\n\n`;
    formattedRecipe += `• Prep all ingredients before starting\n`;
    formattedRecipe += `• Taste and adjust seasoning as needed\n`;
    formattedRecipe += `• Don't rush the cooking process for best results\n\n`;
    
    formattedRecipe += `**Questions about this recipe?** I can help with substitutions, cooking techniques, or serving suggestions! 😊`;
    
    return formattedRecipe;
  } catch (error) {
    console.error('❌ Error formatting CSV recipe:', error);
    return `## ${recipe.title || 'Recipe'}\n\nI found this recipe but had trouble formatting it properly. Let me try generating a fresh one for you!`;
  }
}

// STEP 4: Generate Recipe with Gemini
async function generateRecipeWithGemini(dishName: string, userQuery: string): Promise<string> {
  const recipePrompt = `You are NutriChef, a friendly and knowledgeable cooking assistant. Create a complete, detailed recipe for "${dishName}".

Original user request: "${userQuery}"

Please provide a well-structured recipe with:

## ${dishName.charAt(0).toUpperCase() + dishName.slice(1)}

*Brief enthusiastic introduction (1 sentence with 1 emoji)*

### 🥘 Ingredients:
• [List all ingredients with specific measurements]

### 👨‍🍳 Instructions:
1. [Detailed step-by-step numbered instructions]

### 💡 Chef's Tips:
• [2-3 helpful cooking tips for best results]

### 📊 Nutrition Info:
• [Brief nutritional highlights - calories, protein, etc.]

**End with an engaging question to continue the conversation**

Make it warm, friendly, encouraging, and practical. Focus on clear instructions that even beginners can follow.`;

  const body = {
    contents: [{ parts: [{ text: recipePrompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('❌ Failed to generate recipe with Gemini:', error);
    throw error;
  }
}

// STEP 5: Format Gemini Response (if needed)
async function formatGeminiResponse(rawRecipe: string): Promise<string> {
  const formatPrompt = `Please clean up and format this recipe in proper markdown with clear sections:

${rawRecipe}

Make sure it has:
- Clear ## heading for recipe title
- ### 🥘 Ingredients: section with bullet points
- ### 👨‍🍳 Instructions: section with numbered steps
- ### 💡 Chef's Tips: section
- Proper spacing and formatting
- Friendly, encouraging tone

Keep the content exactly the same, just improve the formatting.`;

  const body = {
    contents: [{ parts: [{ text: formatPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1200,
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) return rawRecipe; // Return original if formatting fails
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('❌ Failed to format recipe, using original:', error);
    return rawRecipe;
  }
}

// Main POST function with hybrid pipeline
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
        source: "cache"
      });
    }
    
    console.log(`📝 Processing query: "${userQuery}"`);
    
    // Enhanced conversation detection
    const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy|sup|what's up|how are you|how's it going)(\?|!|\.)?$/i.test(userQuery);
    const isSimpleResponse = /^(yes|yeah|yep|no|nope|ok|okay|sure|fine|thanks|thank you|cool|nice|great|awesome|perfect|alright|good|bad|not bad|i'm good|i'm fine|doing well)(\?|!|\.)?$/i.test(userQuery);
    const isFarewell = /^(bye|goodbye|see you|farewell|take care|talk later|thanks bye|good night|have a good day)(\?|!|\.)?$/i.test(userQuery);
    const isCompliment = /^(you're (great|awesome|amazing|helpful|good|the best)|thank you so much|thanks a lot|you rock|love it|love this|this is great|amazing work|wonderful|excellent|brilliant|fantastic)(\?|!|\.)?$/i.test(userQuery);
    
    // Food-related detection
    const isFoodRelated = /recipe|cook|make|prepare|bake|grill|roast|fry|boil|steam|food|dish|meal|breakfast|lunch|dinner|snack|dessert|cuisine|ingredient|nutrition|healthy|diet|kitchen|chef|culinary|spice|flavor|taste|biryani|curry|pasta|chicken|beef|fish|vegetables|paneer|rice|bread|soup|salad|pizza|burger|sandwich|noodles|sauce|marinade|seasoning/i.test(userQuery);
    
    // Non-food topic detection
    const isNonFoodQuery = /code|programming|fibonacci|algorithm|math|science|weather|sports|politics|movie|music|technology|computer|software|car|travel|job|school|game|phone|internet|social media/i.test(userQuery);
    
    // Handle conversational responses FIRST (keep existing logic)
    if (isGreeting) {
      const greetingResponses = [
        "Hello! 👋 I'm doing great, thank you! I'm NutriChef, your friendly cooking companion. I'm here to help with recipes, cooking techniques, and nutrition advice. What delicious creation would you like to explore today?",
        "Hi there! 😊 I'm fantastic and ready to help you cook something amazing! What can I whip up for you today?",
        "Hey! 🌟 I'm doing wonderful, thanks! I'm your culinary assistant ready to help with any recipe or cooking question. What's cooking in your mind?",
        "Hello! 🍳 I'm excellent, thank you! Ready to create something delicious together? What would you like to cook?"
      ];
      
      const response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }
    
    if (isFarewell) {
      const farewellResponses = [
        "Take care and happy cooking! 👋 Remember, I'm always here for your culinary adventures!",
        "Goodbye! 🌟 Enjoy your time in the kitchen, and come back anytime for more recipes!",
        "See you later! 🍳 May your meals be delicious and your cooking successful!",
        "Bye for now! ✨ Keep exploring new flavors and happy cooking!"
      ];
      
      const response = farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }
    
    if (isSimpleResponse) {
      const followUpResponses = [
        "Wonderful! 🌟 What type of cuisine or dish are you interested in? I can help with recipes, cooking techniques, or nutrition advice!",
        "Great! 😊 Are you looking for a specific recipe, cooking tips, or meal inspiration? I'm here to help!",
        "Awesome! 🍽️ What would you like to explore in the kitchen today? I can suggest recipes or answer cooking questions!",
        "Perfect! 👨‍🍳 Tell me what you're in the mood for - I'm excited to help you create something delicious!"
      ];
      
      const response = followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }
    
    if (isCompliment) {
      const complimentResponses = [
        "Thank you so much! 😊 That really motivates me! What delicious creation would you like to work on next?",
        "You're so kind! 🌟 I love helping with culinary adventures. Ready to explore some recipes together?",
        "Aww, thank you! 💚 Your enthusiasm for cooking makes this fun for me too. What shall we cook today?",
        "That means the world to me! 😄 I'm passionate about making cooking accessible. What can I help you create?"
      ];
      
      const response = complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
      responseCache.set(cacheKey, response);
      return NextResponse.json({ response, source: "conversation" });
    }
    
    // Handle non-food queries
    if (isNonFoodQuery && !isFoodRelated) {
      const redirectResponse = "I appreciate your question, but I'm NutriChef - your specialized cooking assistant! 🍳 I focus exclusively on food, recipes, cooking techniques, and nutrition.\n\nIs there anything delicious you'd like to cook today? I can help you find recipes, explain cooking methods, or answer nutrition questions!";
      
      responseCache.set(cacheKey, redirectResponse);
      return NextResponse.json({ response: redirectResponse, source: "redirect" });
    }
    
    // HYBRID PIPELINE STARTS HERE
    console.log("🚀 Starting hybrid LLM pipeline...");
    
    // STEP 1: Extract recipe name using LLM
    const dishName = await extractRecipeName(userQuery);
    
    if (!dishName) {
      const clarificationResponse = "I'd love to help you with a recipe! Could you be more specific about what dish you'd like to make?\n\nFor example:\n• \"How to make chicken biryani\"\n• \"Recipe for paneer butter masala\"\n• \"Show me pasta recipes\"\n\nWhat would you like to cook today? 😊";
      
      responseCache.set(cacheKey, clarificationResponse);
      return NextResponse.json({ response: clarificationResponse, source: "clarification" });
    }
    
    console.log(`🎯 Extracted dish: "${dishName}"`);
    
    // STEP 2: Search in local CSV database (more strict now)
    const csvRecipe = searchRecipeInCSV(dishName);
    
    if (csvRecipe) {
      console.log(`✅ Found recipe in CSV: "${csvRecipe.title}" - formatting and returning`);
      const formattedCSVRecipe = formatCSVRecipe(csvRecipe);
      
      responseCache.set(cacheKey, formattedCSVRecipe);
      return NextResponse.json({ 
        response: formattedCSVRecipe, 
        source: "database",
        dishName: dishName
      });
    }
    
    // STEP 3: Generate recipe using Gemini AI (this should happen for paneer butter masala)
    console.log(`🤖 No CSV match found for "${dishName}" - generating recipe with Gemini AI`);
    
    try {
      let geminiRecipe = await generateRecipeWithGemini(dishName, userQuery);
      
      // STEP 4: Format the response if needed (optional)
      if (!geminiRecipe.includes('### 🥘 Ingredients:')) {
        console.log("🔧 Formatting Gemini response for better structure");
        geminiRecipe = await formatGeminiResponse(geminiRecipe);
      }
      
      responseCache.set(cacheKey, geminiRecipe);
      return NextResponse.json({ 
        response: geminiRecipe, 
        source: "ai_generated",
        dishName: dishName
      });
      
    } catch (error) {
      console.error("❌ Gemini generation failed, using enhanced fallback");
      
      // Enhanced fallback based on extracted dish name
      const fallbackResponse = `I'd love to help you make ${dishName}! 🍳

## ${dishName.charAt(0).toUpperCase() + dishName.slice(1)}

*I'm having some trouble accessing my AI recipe generator right now, but I still want to help you!*

### 🥘 What You'll Generally Need:
• Fresh, quality ingredients specific to ${dishName}
• Proper cooking equipment and utensils
• The right spices and seasonings
• Patience for the best results

### 👨‍🍳 General Approach:
• Prepare all ingredients before starting (mise en place)
• Follow proper cooking temperatures and timing
• Season gradually and taste as you go
• Don't rush the cooking process

### 💡 Chef's Note:
I'd love to provide you with a detailed ${dishName} recipe once my AI connection is restored. This is definitely a dish I can help you with!

**Would you like to try asking again, or would you prefer tips for cooking techniques used in ${dishName}?** 😊`;

      responseCache.set(cacheKey, fallbackResponse);
      return NextResponse.json({ 
        response: fallbackResponse, 
        source: "fallback",
        dishName: dishName
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error in hybrid pipeline:', error);
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again!',
      response: "Sorry, I'm having trouble right now. Please try asking your question again, and I'll do my best to help you with your cooking needs! 🍳"
    }, { status: 500 });
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