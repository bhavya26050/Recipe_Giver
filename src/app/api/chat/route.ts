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
  
  // Extract potential ingredients from the query
  const words = query.split(/\s+/);
  const possibleIngredients = words.filter(word => word.length > 3);
  
  // Search by title or ingredients
  const results = recipeDatabase.filter(recipe => {
    const title = recipe.title?.toLowerCase() || '';
    const ingredients = typeof recipe.ingredients === 'string' 
      ? recipe.ingredients.toLowerCase() 
      : JSON.stringify(recipe.ingredients).toLowerCase();
    
    // Direct title match (prioritize exact matches)
    if (title === query) return true;
    
    // Partial title match
    if (title.includes(query)) return true;
    
    // Check if title contains any word from the query that's longer than 3 chars
    if (possibleIngredients.some(word => title.includes(word))) return true;
    
    // Check for individual ingredients
    if (possibleIngredients.some(ingredient => ingredients.includes(ingredient))) return true;
    
    return false;
  });
  
  if (results.length > 0) {
    console.log(`✅ Found ${results.length} recipes in database for "${query}"`);
    // Sort results by relevance - exact title matches first
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      if (aTitle === query && bTitle !== query) return -1;
      if (bTitle === query && aTitle !== query) return 1;
      
      return 0;
    });
    
    return results.slice(0, 3); // Return top 3 matches
  }
  
  console.log(`❌ No recipes found in database for "${query}"`);
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
    const { message } = await request.json();
    const userQuery = message.trim();
    
    // Check cache first
    const cacheKey = userQuery.toLowerCase();
    if (responseCache.has(cacheKey)) {
      console.log("🔄 Returning cached response");
      return NextResponse.json({ response: responseCache.get(cacheKey) });
    }
    
    console.log(`📝 User query: "${userQuery}"`);
    
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
        suggestions = '\n\n### I also found these other recipes you might like:\n';
        csvResults.slice(1).forEach((recipe, index) => {
          suggestions += `- ${recipe.title}\n`;
        });
        suggestions += '\nWould you like to see any of these recipes instead? Just ask and I ll show you the details.';
      }
      
      const response = `${mainRecipe}${suggestions}\n\nIs there anything specific about this recipe you'd like me to explain? Or would you like suggestions for substitutions or side dishes?`;
      
      // Cache the response
      responseCache.set(cacheKey, response);
      
      return NextResponse.json({ response });
    }
    
    // 2. If no results in CSV, use Gemini API
    // Prepare recipe prompt with formatting instructions to mimic ChatGPT style
    const recipePrompt = `You're NutriChef, a helpful cooking and nutrition assistant. 
    I need you to provide a recipe based on this request: "${userQuery}"
    
    Format your response in a conversational style like ChatGPT would:
    1. Begin with a friendly, brief personal response about the request (1-2 sentences)
    2. Format the recipe title as a level 2 heading (##)
    3. Add ingredients list with bullet points
    4. Add numbered step-by-step instructions
    5. Include a brief nutritional note if relevant
    6. End with a question to encourage further conversation
    
    Use Markdown formatting with appropriate headings, lists, and spacing.
    Keep the tone warm and helpful, as if you're a friend sharing a recipe.`;
    
    const body = {
      contents: [
        {
          parts: [
            { text: recipePrompt }
          ]
        }
      ],
      // Add these parameters to reduce token usage
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
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
          
          return NextResponse.json({ response: fallbackResponse });
        }
        
        const errorData = await response.text();
        console.error(`❌ API Error (${response.status}): ${errorData}`);
        return NextResponse.json({ 
          error: `Failed to get response from Gemini API: ${response.status} ${response.statusText}` 
        }, { status: response.status });
      }
      
      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Cache the response
      responseCache.set(cacheKey, responseText);
      
      return NextResponse.json({ response: responseText });
    } catch (error) {
      console.error("❌ API call failed, using fallback response", error);
      const fallbackResponse = getFallbackResponse(userQuery);
      
      // Cache the fallback
      responseCache.set(cacheKey, fallbackResponse);
      
      return NextResponse.json({ response: fallbackResponse });
    }
    
  } catch (error: any) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}

// Fallback responses when API is unavailable
function getFallbackResponse(message: string): string {
  const query = message.toLowerCase();
  
  if (query.includes("pasta") || query.includes("spaghetti")) {
    return `I'd love to share a quick garlic pasta recipe with you! This is one of my favorites when I need a delicious meal in a hurry.

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
  } else if (query.includes("chicken")) {
    return `Here's a simple but delicious baked chicken breast recipe that's perfect for a quick dinner!

## Easy Baked Chicken Breast

### Ingredients:
- 2 boneless, skinless chicken breasts
- 1 tbsp olive oil
- 1 tsp paprika
- 1 tsp garlic powder
- 1/2 tsp dried oregano
- 1/2 tsp salt
- 1/4 tsp black pepper
- Lemon wedges for serving

### Instructions:
1. Preheat your oven to 425°F (220°C).
2. Pat chicken breasts dry with paper towels.
3. Rub both sides with olive oil.
4. In a small bowl, mix all the spices together, then coat the chicken evenly on both sides.
5. Place the seasoned chicken on a baking sheet lined with parchment paper.
6. Bake for 18-20 minutes until the internal temperature reaches 165°F.
7. Let the chicken rest for 5 minutes before slicing.
8. Serve with fresh lemon wedges for squeezing over top.

Each serving provides about 220 calories, 9g fat, 2g carbs, and 35g protein, making this a great high-protein option.

What kind of side dish would you like to serve with this chicken? I can suggest some options that would pair nicely.`;
  } else if (query.includes("vegetarian") || query.includes("vegan")) {
    return `I've got a wonderful plant-based recipe for you! This chickpea curry is filling, flavorful, and completely vegan.

## Simple Chickpea Curry

### Ingredients:
- 2 cans (15 oz each) chickpeas, drained and rinsed
- 1 onion, diced
- 2 cloves garlic, minced
- 1 tbsp ginger, grated
- 1 can (14 oz) diced tomatoes
- 1 can (14 oz) coconut milk
- 2 tbsp curry powder
- 1 tsp ground cumin
- 1/2 tsp turmeric
- Salt to taste
- Fresh cilantro for garnish
- Rice for serving

### Instructions:
1. In a large pot, sauté the onion until translucent (about 5 minutes).
2. Add garlic and ginger, cooking for 1 minute until fragrant.
3. Add curry powder, cumin, and turmeric, stirring for 30 seconds to bloom the spices.
4. Add diced tomatoes, chickpeas, and coconut milk. Stir well to combine.
5. Simmer for 15-20 minutes, stirring occasionally.
6. Season with salt to taste.
7. Serve over rice and garnish with fresh cilantro.

This hearty curry provides about 300 calories per serving with 12g fat, 40g carbs, and 12g protein.

Is this the kind of vegetarian dish you were looking for? I can suggest other plant-based recipes if you'd prefer something different.`;
  } else if (query.includes("cupcake") || query.includes("citrus")) {
    return `You're in luck! I've found a delicious Triple-Citrus Cupcake recipe that's bursting with fresh citrus flavors.

## Triple-Citrus Cupcakes

### Ingredients:
- 3 1/3 cups all-purpose flour
- 2 teaspoons coarse salt
- 1 pound (4 sticks) unsalted butter, room temperature
- 2 cups sugar
- 3 tablespoons finely grated lemon zest (from 3 lemons)
- 3 tablespoons finely grated orange zest (from 2 oranges)
- 3 tablespoons finely grated lime zest, plus more for garnish (from about 3 limes)
- 1 teaspoon pure vanilla extract
- 9 large eggs, room temperature
- Citrus Glaze (made with lime juice and zest)

### Instructions:
1. Preheat oven to 325°F and line standard muffin tins with paper liners.
2. Whisk together flour and salt in a bowl.
3. With an electric mixer on medium-high speed, cream butter and sugar until pale and fluffy, scraping down sides of bowl occasionally.
4. Add all citrus zests.
5. Reduce speed to medium, and add vanilla.
6. Add eggs, three at a time, beating until incorporated, scraping down sides of bowl as needed.
7. Reduce speed to low and add flour mixture in four batches, beating until completely incorporated after each.
8. Divide batter evenly among lined cups, filling each three-quarters full; tap pans on countertop once to distribute batter.
9. Bake, rotating tins halfway through, until a cake tester inserted in centers comes out clean, about 20 minutes.
10. Transfer tins to wire racks to cool 10 minutes; turn out cupcakes onto racks and let cool completely.
11. For finishing, dip tops of cupcakes in glaze, then turn over quickly and garnish with zest.

These cupcakes are best eaten the day they are glazed. The bright citrus flavors make them perfect for spring or summer gatherings!

Would you like me to provide a recipe for the citrus glaze as well?`;
  } else {
    // Default recipe for any other query
    return `I'd be happy to share a versatile recipe that you can adapt to whatever ingredients you have on hand!

## Sheet Pan Dinner - Base Recipe

### Ingredients:
- 1 lb protein of your choice (chicken, tofu, shrimp, or chickpeas)
- 4 cups mixed vegetables, cut into similar sizes
- 2 tbsp olive oil
- 2 tsp Italian seasoning (or your favorite herb blend)
- 1 tsp garlic powder
- 1/2 tsp salt
- 1/4 tsp black pepper
- Optional: lemon wedges for serving

### Instructions:
1. Preheat your oven to 425°F (220°C) and line a large baking sheet with parchment paper.
2. Prepare your protein: cut chicken into chunks, drain and cube tofu, peel shrimp, or drain chickpeas.
3. In a large bowl, toss vegetables and protein with olive oil and all seasonings until well coated.
4. Spread everything in a single layer on the baking sheet - don't overcrowd!
5. Roast for 20-25 minutes until vegetables are tender and protein is cooked through.
6. If you're using the optional lemon, squeeze fresh juice over everything just before serving.

The nutrition will vary based on your specific ingredients, but this template generally provides a balanced meal with protein, fiber, and healthy fats.

What kind of protein and vegetables do you have available? I can give you specific seasoning suggestions based on your ingredients.`;
  }
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
      title: "Glazed Carrots",
      ingredients: `["3 to 4 carrots", "1 1/2 Tbsp. butter", "1/3 c. brown sugar", "grated lemon rind and juice"]`,
      directions: `["Cook 3 to 4 carrots; cut crosswise in 1-inch pieces.", "Add butter, brown sugar (packed) and grated lemon rind and juice to taste.", "Heat slow, stirring occasionally, until nicely glazed, about 15 minutes.", "Makes 2 to 3 servings."]`
    }
  ];
}