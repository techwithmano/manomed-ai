**GitHub Description:**  
An AI-powered medical symptom analysis tool using Next.js and Google GenAI to generate interactive health questionnaires and condition assessments.

---

# 🩺 ManoMed AI

## 📖 Overview
ManoMed AI is a core, intelligent medical symptom analysis tool designed to help users better understand potential health conditions. By leveraging advanced artificial intelligence, the application analyzes user-provided symptoms and medical history to dynamically generate personalized, interactive questionnaires. It solves the problem of healthcare ambiguity by bridging the gap between initial symptom onset and medical consultation, providing users with preliminary condition likelihood assessments in a clean, user-friendly environment.

## ✨ Key Features
* **AI-Powered Symptom Analysis:** Utilizes Google GenAI to intelligently evaluate complex user symptoms.
* **Dynamic Questionnaires:** Generates contextual follow-up questions based on the user's initial health inputs.
* **Likelihood Assessment:** Calculates and displays potential medical conditions with probability scores.
* **Modern UI/UX:** Fully responsive, accessible design with seamless Dark/Light mode support.
* **Stateful Flow:** Guides users through an intuitive, step-by-step process from input to final assessment.

## 💻 Tech Stack
* **Frontend:** Next.js 15, React 18, TypeScript
* **Styling & Components:** Tailwind CSS, Radix UI
* **Artificial Intelligence:** Google GenAI API
* **State Management:** React Hooks
* **Deployment:** Vercel

## 🚀 Getting Started

Follow these steps to set up and run ManoMed AI locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/techwithmano/manomed-ai.git
   cd manomed-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.
