# TrialMatch AI
**"Find the right clinical trial, explained simply."**

TrialMatch AI is a patient-centered platform designed to bridge the gap between complex clinical trial data and patients seeking life-saving treatments. Using Google Gemini 3.1 and the official ClinicalTrials.gov API, we provide a personalized matching experience with plain-language explanations.

## 🚀 Features
- **Smart Patient Intake**: A guided medical form that captures the essential nuances of a patient's profile.
- **AI-Powered Eligibility Analysis**: Uses Gemini to analyze dense inclusion/exclusion criteria against the patient's medical history.
- **Plain-Language Summaries**: Translates medical jargon into easy-to-understand explanations.
- **Match Scoring**: Hybrid ranking system considering condition relevance, phase, and eligibility fit.
- **Doctor Discussion Guide**: AI-generated checklists to help patients talk to their healthcare providers about potential trials.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion.
- **Backend**: Node.js, Express, tsx.
- **AI**: Google Gemini 3.1 (via @google/genai).
- **Data Source**: ClinicalTrials.gov API v2.

## 🚦 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your environment variables (see `.env.example`).
4. Run the development server: `npm run dev`.

## 🛡 Medical Safety
TrialMatch AI is an informational tool. It does not provide medical advice or determine final eligibility. All users are strictly advised to consult with their medical professionals.
