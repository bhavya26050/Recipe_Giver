
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset from the same directory
base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, "recipes_small.csv")

# Load and clean dataset
df = pd.read_csv(csv_path)
df.dropna(subset=['ingredients'], inplace=True)

# TF-IDF Vectorizer
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['ingredients'])

# Recipe recommendation logic
def recommend_recipes(user_ingredients, top_n=5):
    user_vec = vectorizer.transform([user_ingredients])
    cosine_sim = cosine_similarity(user_vec, tfidf_matrix)
    top_indices = cosine_sim[0].argsort()[-top_n:][::-1]
    return df.iloc[top_indices][['title', 'ingredients']]
