export interface PatientProfile {
  condition: string;
  symptoms: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  location: string;
  medicalHistory: string;
  medications: string;
  priorTreatments: string;
  travelDistance: number;
}

export interface Trial {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  summary: string;
  eligibility: string;
  sponsor: string;
  locations: TrialLocation[];
}

export interface TrialLocation {
  facility: string;
  city: string;
  state: string;
  country: string;
}

export interface TrialAnalysis {
  match_score: number;
  match_level: string;
  plain_language_summary: string;
  why_it_matches: string[];
  possible_concerns: string[];
  unknowns_to_confirm: string[];
  doctor_questions: string[];
  next_steps: string[];
  safety_note: string;
}
