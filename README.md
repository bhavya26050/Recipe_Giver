# 🍳 NutriChef (Recipe_Giver)

NutriChef is an AI-powered recipe assistant that helps users discover, generate, and manage recipes based on their preferences, dietary needs, and available ingredients. Combining a modern Next.js frontend, a flexible Python backend, Gemini AI integration, and real user authentication, NutriChef delivers a seamless, engaging, and highly customizable cooking experience.

---

## 🚀 Features

- **Recipe Discovery:** Search a curated database of diverse recipes
- **AI Recipe Generation:** Get creative, step-by-step recipes using Google Gemini AI when the database doesn't have what you need
- **Ingredient-Based Suggestions:** Find recipes with specific ingredients or based on what you have in your kitchen
- **Personalized Meal Plans:** Generate full meal plans tailored to dietary restrictions and cuisine preferences
- **Dietary Classification:** Instantly see if a recipe is vegan, gluten-free, healthy, etc.
- **Chatbot UX:** Conversational interface for recipe requests and suggestions
- **User Authentication:** Secure login via Firebase Auth (Email/Google)
- **Save Conversation History:** Store your chats and favorite recipes in your personal account
- **Responsive UI:** Mobile-first, modern design using Tailwind CSS and React components

---

## 🛠️ Tech Stack

| Layer      | Technology                                              |
|------------|--------------------------------------------------------|
| Frontend   | Next.js, React, TypeScript, Tailwind CSS, Geist Font   |
| Backend    | Python, Flask, Flask-CORS, Google Gemini AI, CSV       |
| Auth/Data  | Firebase Auth, Firestore                               |
| Deployment | Vercel (frontend), Render or similar (backend)         |

---

## 🏗️ Project Structure

```
/src/app/         # Next.js app directory (pages, layouts, API routes)
  /components/    # Reusable React components (e.g., Navbar, Chat UI)
  /firebase/      # Firebase config and helpers
  /styles/        # Tailwind CSS and global styles
/backend/         # Python Flask API, Gemini AI logic, CSV data
/public/          # Static assets (images, icons)
```

---

## 🧑‍💻 Getting Started

### Prerequisites

- Node.js 16+
- Python 3.8+
- npm or yarn
- (Optional) Google Gemini API Key
- Firebase Project (for Auth & Firestore)

### Installation (Frontend)

```bash
# Clone the repository
git clone https://github.com/bhavya26050/Recipe_Giver.git
cd Recipe_Giver

# Install dependencies
npm install
# or
yarn install

# Create a .env.local file and add any required NEXT_PUBLIC_ env variables

# Start the development server
npm run dev
# or
yarn dev
```

### Installation (Backend)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Set up environment variables in a .env file (see .env.example)
# Example:
# GEMINI_API_KEY=your-gemini-key

# Run the Flask server
python chatbot.py
```

---

## 🔑 Environment Variables

- **Frontend:**  
  - See `.env.example` for required environment variables (API base URLs, Firebase config, etc.)
- **Backend:**  
  - `GEMINI_API_KEY`
  - Any other API or DB credentials

---

## 📦 Deployment

- **Frontend:** Deploy on [Vercel](https://recipe-giver.vercel.app/) for best performance.
- **Backend:** Deploy on [Render](https://recipe-giver-backend.onrender.com/), Heroku, or a similar Python hosting service.
- **Environment variables** must be set in your deployment dashboard.

---

## ⚙️ Key Design Decisions

- **Hybrid Recipe Engine:**  
  - Checks its own CSV database first (for speed & reliability), then uses Gemini AI as a fallback for creative or missing recipes.
- **Intent Guardrails:**  
  - Only food/recipe-related queries are passed to AI (prevents off-topic answers and ensures user safety).
- **Post-processing:**  
  - AI responses are cleaned, formatted, and structured before being shown to the user.
- **Robust Error Handling:**  
  - If both database and AI fail, users see a helpful error, never a raw trace.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome!  
- Fork this repository
- Create a new feature branch
- Submit a pull request with details

---

## 🙋‍♂️ Questions or Support?

- File an issue in GitHub [issues](https://github.com/bhavya26050/Recipe_Giver/issues)
- Or contact the maintainer via GitHub profile

---

> **NutriChef – Your AI Partner in the Kitchen!**
