**GitHub Description:**  
An AI-powered medical symptom analysis tool using Next.js and Google GenAI to generate interactive health questionnaires and condition assessments.

---

# 🩺 ManoMed AI

## 📖 Overview
ManoMed AI is a core, intelligent medical symptom analysis tool designed to help users better understand potential health conditions. By leveraging advanced artificial intelligence, the application analyzes user-provided symptoms and medical history to dynamically generate personalized, interactive questionnaires. It solves the problem of healthcare ambiguity by bridging the gap between initial symptom onset and medical consultation, providing users with preliminary condition likelihood assessments in a clean, user-friendly environment.

## ✨ Key Clinical & Technical Features
* **4-Tier Clinical Triage:** Evaluates symptoms into EMERGENCY, URGENT, ROUTINE, or SELF-CARE with clear action timeframes.
* **Real-Time Emergency Red-Flag Interceptor:** Automatically detects life-threatening keywords (cardiac distress, stroke, anaphylaxis) and surfaces instant emergency call actions.
* **Speech-to-Text Voice Dictation:** Integrated Web Speech API allows patients to speak their symptoms hands-free.
* **Interactive Body Systems & Symptom Chips:** Visual anatomical system selector and one-click high-yield symptom tags.
* **Dynamic Multi-Type Questionnaire:** Generates structured Yes/No toggles, 1–10 pain/severity sliders, qualitative choice buttons, and clinical rationale explanations.
* **Differential Diagnosis with Evidence Breakdown:** Ranked conditions with ICD-10 hints, supporting indicators, and unconfirmed factors.
* **Interactive Probability Visualizations:** Responsive Recharts bar charts comparing diagnostic likelihoods.
* **1-Click Clinical SOAP Note:** Formatted in standard EHR documentation syntax (Subjective, Objective, Assessment, Plan) for doctor hand-off.
* **Doctor Checklist & Diagnostic Workup:** Recommended laboratory/imaging tests and interactive questions checklist for medical appointments.
* **Persistent Assessment History:** LocalStorage-backed session management and historical records tracker ("Past Assessments").
* **Doctor-Ready PDF Export & Email:** Comprehensive multi-page report generator powered by jsPDF and AutoTable with SendGrid email integration.

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
   git clone https://github.com/manomed-ai/manomed-ai.git
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
