import pandas as pd

# Load your RecipeNLG CSV file (replace the file name if needed)
df = pd.read_csv('RecipeNLG_dataset.csv')

# Show current columns to confirm what’s there
print(df.columns)

# Drop 'link' and 'source' columns
df = df.drop(['link', 'source'], axis=1)

# Keep only 15,000 random rows to make it lightweight
df_small = df.sample(15000, random_state=42)  # You can change 15000 to any number you want

# Save the new, smaller dataset
df_small.to_csv('recipes_small.csv', index=False)

print("✅ Cleaned and saved recipes_small.csv with 15000 rows")
