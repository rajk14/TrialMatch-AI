import axios from "axios";
import { PatientProfile, Trial, TrialAnalysis } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const searchTrials = async (profile: PatientProfile) => {
  // Step 1: Agentic Query Expansion (Frontend)
  let optimizedCond = profile.condition;
  
  try {
    const refinementPrompt = `
      You are a clinical search agent. Convert the patient's condition and symptoms into an optimized, MeSH-compliant search term for the ClinicalTrials.gov query system.
      Focus on returning ONLY the keywords that will yield the most relevant results.
      
      Condition: ${profile.condition}
      Symptoms: ${profile.symptoms}
      Age: ${profile.age}
      Sex: ${profile.sex}
      
      Return ONLY the optimized search string, no other text.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: refinementPrompt,
    });
    
    optimizedCond = response.text?.trim() || profile.condition;
    console.log(`Searching with MeSH-optimized term: ${optimizedCond}`);
  } catch (err) {
    console.error("Query expansion failed, using original condition:", err);
  }

  const response = await axios.post("/api/search-trials", { 
    ...profile,
    optimizedCond 
  });
  return response.data.trials as Trial[];
};

export const analyzeTrial = async (patientProfile: PatientProfile, trial: Trial) => {
  const prompt = `
    You are a clinical trial eligibility explanation assistant specializing in clinical NLP and specialized medical reasoning. 
    Your role is to compare a patient profile with clinical trial criteria and explain potential fit in plain language.
    
    Methodology:
    - Use MeSH (Medical Subject Headings) to standardize the condition and biomarker terminology.
    - Apply logic derived from TREC Clinical Trials benchmarks (2021/2022) for high-precision patient-to-trial retrieval.
    - Evaluate inclusion and exclusion criteria with strict clinical logic.
    - You must not provide medical advice or final eligibility decisions.

    Patient Profile:
    ${JSON.stringify(patientProfile, null, 2)}

    Clinical Trial Details:
    Title: ${trial.title}
    NCT ID: ${trial.nctId}
    Summary: ${trial.summary}
    Eligibility Criteria: ${trial.eligibility}

    Analyze the fit based on:
    - MeSH term alignment (Standardized condition match)
    - Absolute contraindications in medical history vs Exclusion criteria
    - Prior treatment compatibility (e.g., specific drug classes allowed/forbidden)
    - Demographic fit (Age, Sex, Performance Status)

    Output strictly in JSON format:
    {
      "match_score": 0-100,
      "match_level": "Strong potential match | Possible match | Weak match | Not enough information",
      "plain_language_summary": "...",
      "why_it_matches": ["..."],
      "possible_concerns": ["..."],
      "unknowns_to_confirm": ["..."],
      "doctor_questions": ["..."],
      "next_steps": ["..."],
      "safety_note": "..."
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          match_score: { type: Type.NUMBER },
          match_level: { type: Type.STRING },
          plain_language_summary: { type: Type.STRING },
          why_it_matches: { type: Type.ARRAY, items: { type: Type.STRING } },
          possible_concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          unknowns_to_confirm: { type: Type.ARRAY, items: { type: Type.STRING } },
          doctor_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
          next_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          safety_note: { type: Type.STRING }
        },
        required: ["match_score", "match_level", "plain_language_summary", "why_it_matches", "possible_concerns", "doctor_questions", "next_steps", "safety_note"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as TrialAnalysis;
};

export const fetchTrialById = async (id: string) => {
  const response = await axios.get(`/api/trial/${id}`);
  return response.data.trial as Trial;
};
