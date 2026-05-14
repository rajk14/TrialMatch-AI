# TrialMatch AI - Devpost Submission

## 💡 Inspiration
Clinical trial search engines exist, but they are often built for researchers, not patients. When a patient is diagnosed with a serious condition, they are often overwhelmed by technical medical jargon. We wanted to build a tool that feels like a supportive assistant, explaining *why* a trial might be a good fit in language anyone can understand.

## 🧠 What it does
TrialMatch AI takes a detailed patient profile (diagnosis, history, medications) and searches the official ClinicalTrials.gov registry. It then uses the Gemini 3.1 model to perform an "AI logic match" on the eligibility criteria of the most relevant studies. 

The result is a ranked list of trials, each with a "Match Score" and a "Plain Language Summary" explaining exactly why the patient might (or might not) fit the trial.

## 🛠 How we built it
- **Frontend**: A high-polish medical SaaS interface built with **React** and **shadcn/ui**.
- **Agentic Pipeline**:
  1. **Intake**: Multi-step structured medical form.
  2. **Fetch**: Real-time query to ClinicalTrials.gov API v2.
  3. **Reasoning**: Parallel AI analysis of trial criteria using **Gemini 3.1**.
  4. **Explanation**: AI-generated simple summaries and doctor discussion guides.
- **Backend**: An **Express** proxy to handle secure AI reasoning and data normalization.

## 🚀 Challenges we ran into
Integrating the ClinicalTrials.gov API v2 required mapping its complex JSON structure to a simpler internal model for the AI to reason about without exceeding token limits on large lists. We implemented a hybrid scoring system that combines keyword relevance with AI reasoning.

## 📈 Future Roadmap
- **Geospatial Mapping**: Better distance calculations for travel requirements.
- **PDF Export**: Allowing patients to download a professional "Trial Match Report" for their doctor.
- **Waitlist Alerts**: Notifying patients when new recruiting trials matching their profile appear.
- **Multilingual Support**: Explaining trials in the patient's native language.

## 🧬 Pitch Script (2 Minute)
"Hello, we are the team behind TrialMatch AI. 

Every year, thousands of clinical trials fail because they can't find enough patients. At the same time, millions of patients are looking for treatments but are locked out by a wall of medical jargon. 

Searching for a trial shouldn't feel like reading a legal contract. 

With TrialMatch AI, we’ve turned the clinical trial search into a conversation. A patient simply enters their medical profile, and our AI assistant parses thousands of pages of inclusion criteria to find the needle in the haystack. 

We don't just give you a list of IDs. We give you a score, a simple explanation of why it fits, and a checklist of questions to ask your doctor. 

TrialMatch AI: Making life-saving research accessible to everyone."
