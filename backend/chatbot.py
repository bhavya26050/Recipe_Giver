import time
import requests

# ✅ Replace this with your actual working Gemini API Key
API_KEY = "AIzaSyDFvCJpvcFpDiO1mwkI0HuETlnzAGdpz6k"

# Gemini API endpoint (1.5 Pro model)
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={API_KEY}"

def call_gemini(prompt, retries=3, wait_time=30):
    headers = {
        "Content-Type": "application/json"
    }

    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    for attempt in range(retries):
        print(f"Sending prompt to Gemini (Attempt {attempt + 1})...")
        try:
            response = requests.post(API_URL, headers=headers, json=body)
            if response.status_code == 200:
                data = response.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            elif response.status_code == 429:
                print("❌ Quota exceeded or too many requests.")
                print("⏳ Waiting 30 seconds before retrying...")
                time.sleep(wait_time)
            elif response.status_code == 403:
                return "❌ Access forbidden: Your API key may be invalid or inactive."
            elif response.status_code == 401:
                return "❌ Unauthorized: Please check your API key."
            else:
                return f"❌ Error {response.status_code}: {response.text}"
        except Exception as e:
            print(f"❌ Exception occurred: {e}")
            time.sleep(wait_time)

    return "❌ Failed to get a response after multiple attempts. Check your API quota."

def main():
    print("💬 Welcome to the Gemini terminal chatbot! Type 'exit' to quit.")
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'exit':
            print("👋 Goodbye!")
            break
        response = call_gemini(user_input)
        print("\n🤖 Gemini says:\n", response)

if __name__ == "__main__":
    main()
