import { useState, useEffect, useMemo, useCallback } from "react";
import { PatientProfile, Trial, TrialAnalysis } from "./types";
import { searchTrials, analyzeTrial, fetchTrialById } from "./lib/api";
import { smartStorage, STORAGE_KEYS } from "./lib/storage";
import { IntakeForm } from "./components/trial/IntakeForm";
import { TrialCard } from "./components/trial/TrialCard";
import { TrialDetails } from "./components/trial/TrialDetails";
import { MedicalDisclaimer } from "./components/shared/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dna, 
  Search, 
  ChevronLeft,
  ChevronRight, 
  Loader2, 
  Filter, 
  Sparkles,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  History as HistoryIcon,
  Menu,
  X
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

type ViewState = "landing" | "intake" | "loading" | "results" | "detail" | "saved" | "history" | "how-it-works" | "vision" | "pricing";

export default function App() {
  const [view, setView] = useState<ViewState>("landing");
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(() => {
    return smartStorage.get<PatientProfile | null>(STORAGE_KEYS.PATIENT_PROFILE, null);
  });

  useEffect(() => {
    smartStorage.set(STORAGE_KEYS.PATIENT_PROFILE, patientProfile);
  }, [patientProfile]);

  const [trials, setTrials] = useState<Trial[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, TrialAnalysis>>(() => {
    return smartStorage.get<Record<string, TrialAnalysis>>(STORAGE_KEYS.TRIAL_ANALYSES, {});
  });

  useEffect(() => {
    smartStorage.set(STORAGE_KEYS.TRIAL_ANALYSES, analyses);
  }, [analyses]);

  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [savedTrials, setSavedTrials] = useState<Trial[]>(() => {
    return smartStorage.get<Trial[]>(STORAGE_KEYS.SAVED_TRIALS, []);
  });

  // Handle Deep Linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trialId = params.get("trialId");
    if (trialId) {
      setView("loading");
      fetchTrialById(trialId)
        .then(trial => {
          setSelectedTrial(trial);
          setView("detail");
          // If we have a profile, analyze it
          if (patientProfile) {
            analyzeIndividualTrial(patientProfile, trial);
          }
        })
        .catch(err => {
          console.error("Failed to load deep linked trial", err);
          showToast("Failed to load the shared trial.", "error");
          setView("landing");
        });
    }
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const success = smartStorage.set(STORAGE_KEYS.SAVED_TRIALS, savedTrials);
    if (!success && savedTrials.length > 0) {
      showToast("Failed to save trials. Storage is full. Please clear data in History tab.", "error");
    }
  }, [savedTrials]);

  const [dialogContent, setDialogContent] = useState<{ title: string; content: string } | null>(null);

  const [phaseFilter, setPhaseFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [locationSearch, setLocationSearch] = useState<string>("");

  const filteredTrials = useMemo(() => {
    return trials.filter(trial => {
      const matchPhase = phaseFilter === "All" || trial.phase.includes(phaseFilter);
      const matchStatus = statusFilter === "All" || trial.status.toLowerCase().includes(statusFilter.toLowerCase());
      const matchLocation = !locationSearch || trial.locations?.some(loc => 
        loc.city?.toLowerCase().includes(locationSearch.toLowerCase()) || 
        loc.state?.toLowerCase().includes(locationSearch.toLowerCase()) ||
        loc.facility?.toLowerCase().includes(locationSearch.toLowerCase())
      );
      return matchPhase && matchStatus && matchLocation;
    });
  }, [trials, phaseFilter, statusFilter, locationSearch]);

  const handleDemo = (profile: PatientProfile) => {
    setPatientProfile(profile);
    setView("intake");
  };

  const handleDemoInstant = (profile: PatientProfile) => {
    handleIntakeSubmit(profile);
  };

  const DEMO_PROFILES = [
    {
      title: "Breast Cancer",
      subtitle: "Stage II, HER2+",
      color: "bg-pink-50 border-pink-100 text-pink-600 hover:border-pink-200",
      iconColor: "bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
      patient: {
        condition: "Stage II HER2+ Breast Cancer",
        symptoms: "Lump in left breast, fatigue",
        age: 52,
        sex: "Female" as const,
        location: "Boston, MA",
        medicalHistory: "No major surgeries",
        medications: "Vitamin D",
        priorTreatments: "None",
        travelDistance: 100
      }
    },
    {
      title: "Type 2 Diabetes",
      subtitle: "Insulin Resistant",
      color: "bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-200",
      iconColor: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      patient: {
        condition: "Type 2 Diabetes",
        symptoms: "Increased thirst, fatigue",
        age: 60,
        sex: "Male" as const,
        location: "Chicago, IL",
        medicalHistory: "Hypertension",
        medications: "Metformin",
        priorTreatments: "Metformin for 5 years",
        travelDistance: 50
      }
    },
    {
      title: "Alzheimer's",
      subtitle: "Early Stage",
      color: "bg-purple-50 border-purple-100 text-purple-600 hover:border-purple-200",
      iconColor: "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
      patient: {
        condition: "Early Stage Alzheimer's",
        symptoms: "Mild cognitive impairment, confusion",
        age: 72,
        sex: "Female" as const,
        location: "Seattle, WA",
        medicalHistory: "Generally healthy",
        medications: "None",
        priorTreatments: "Memory training",
        travelDistance: 25
      }
    },
    {
      title: "Rare Disease",
      subtitle: "Cystic Fibrosis",
      color: "bg-teal-50 border-teal-100 text-teal-600 hover:border-teal-200",
      iconColor: "bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
      patient: {
        condition: "Cystic Fibrosis",
        symptoms: "Chronic cough, shortness of breath",
        age: 24,
        sex: "Male" as const,
        location: "San Diego, CA",
        medicalHistory: "Congenital condition",
        medications: "Kalydeco",
        priorTreatments: "Chest percussion therapy",
        travelDistance: 200
      }
    }
  ];

  const startIntake = () => {
    setPatientProfile(null);
    setView("intake");
  };
  
  const handleIntakeSubmit = async (profile: PatientProfile) => {
    setPatientProfile(profile);
    setView("loading");
    try {
      const results = await searchTrials(profile);
      setTrials(results);
      setView("results");
      
      // Background analysis for each trial
      results.forEach(trial => {
        analyzeIndividualTrial(profile, trial);
      });
    } catch (error) {
      console.error(error);
      setView("intake");
    }
  };

  const analyzeIndividualTrial = async (profile: PatientProfile, trial: Trial) => {
    try {
      const analysis = await analyzeTrial(profile, trial);
      setAnalyses(prev => ({ ...prev, [trial.nctId]: analysis }));
    } catch (err) {
      console.error(`Failed to analyze ${trial.nctId}`, err);
    }
  };

  const handleTrialClick = (trial: Trial) => {
    setSelectedTrial(trial);
    setView("detail");
  };

  const toggleSaveTrial = (trial: Trial) => {
    setSavedTrials(prev => {
      const isSaved = prev.some(t => t.nctId === trial.nctId);
      if (isSaved) {
        showToast("Trial removed from saved list.");
        return prev.filter(t => t.nctId !== trial.nctId);
      }
      showToast("Trial saved successfully!");
      return [...prev, trial];
    });
  };

  const handleShareTrial = useCallback(async (trial: Trial) => {
    const url = new URL(window.location.origin);
    url.searchParams.set("trialId", trial.nctId);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Clinical Trial: ${trial.title}`,
          text: `Check out this clinical trial I found on TrialMatch AI: ${trial.title}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Share failed", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard failed", err);
        showToast("Failed to copy link.", "error");
      }
    }
  }, []);

  const showFooterInfo = (title: string, content: string) => {
    setDialogContent({ title, content });
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="medical-disclaimer-banner">
        <Sparkles className="w-3 h-3 animate-pulse" />
        <span>MEDICAL DISCLAIMER: TrialMatch AI provides information ONLY. Consult your physician for medical advice.</span>
      </div>

      <header className="h-20 glass-panel px-8 flex items-center justify-between sticky top-0 z-[60] liquid-shadow mx-4 mt-4 rounded-3xl border-white/20">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("landing")}>
          <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-xl shadow-emerald-200 group-hover:scale-110 transition-all duration-500">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">TrialMatch<span className="text-emerald-600">AI</span></h1>
        </div>
        
          <nav className="hidden md:flex gap-1 bg-slate-100/30 p-1.5 rounded-2xl border border-slate-200/20 backdrop-blur-md">
            {[
              { id: "landing", label: "Matches" },
              { id: "saved", label: "Saved" },
              { id: "history", label: "Vault" },
              { id: "vision", label: "Vision" },
              { id: "how-it-works", label: "Engine" },
              { id: "pricing", label: "Pricing" }
            ].map((nav) => (
              <button 
                key={nav.id}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  (nav.id === "landing" && ["landing", "intake", "results", "loading", "detail"].includes(view)) || view === nav.id
                    ? "bg-white text-emerald-600 shadow-xl shadow-slate-200/50" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                }`} 
                onClick={() => setView(nav.id as ViewState)}
              >
                {nav.label}
              </button>
            ))}
          </nav>

        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-3 rounded-2xl bg-slate-100/50 hover:bg-white transition-all border border-slate-200/20 shadow-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden lg:flex flex-col items-end mr-2">
            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none mb-1 shadow-emerald-100">AI Active</div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
              {patientProfile ? patientProfile.condition.slice(0, 15) : "Safe Mode"}
            </div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-lg shadow-emerald-100/20 hover:scale-105 transition-transform cursor-help">
            {patientProfile?.condition?.[0] || <Sparkles className="w-5 h-5" />}
          </div>
          <div className="ml-4 flex items-center">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-50 p-4 md:hidden"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-6 space-y-2">
              {[
                { id: "landing", label: "Match Finder" },
                { id: "saved", label: "Saved Trials" },
                { id: "history", label: "History" },
                { id: "vision", label: "Vision" },
                { id: "how-it-works", label: "How it Works" },
                { id: "pricing", label: "Pricing" }
              ].map((nav) => (
                <button
                  key={nav.id}
                  className={`w-full px-6 py-4 rounded-2xl text-left font-black tracking-tight transition-all ${
                    view === nav.id ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    setView(nav.id as ViewState);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {nav.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center space-y-12 max-w-4xl mx-auto"
            >
              <div className="space-y-6">
                <Badge variant="outline" className="px-5 py-2 text-emerald-700 bg-emerald-50/50 backdrop-blur-sm border-emerald-100 rounded-full text-sm font-bold mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                  Gemini Flash 3 & ClinicalTrials.gov
                </Badge>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                  Search trials, <br/><span className="text-emerald-600">simplified.</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
                  Advanced AI agentic reasoning paired with standardized medical taxonomies to find your best clinical match.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-6">
                <Button size="lg" className="h-16 px-12 text-xl bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 group font-black" onClick={startIntake}>
                  Start Intake
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
                <button onClick={() => setView("how-it-works")} className="text-slate-900 font-black flex items-center gap-2 px-6 py-4 rounded-2xl hover:bg-slate-100 transition-colors">
                  Learn more <ChevronLeft className="rotate-180 w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-xl font-bold">Try a Demo Scenario</h3>
                  <p className="text-slate-500">Pick a pre-filled profile to see how the AI analyzes eligibility.</p>
                </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEMO_PROFILES.map((demo, i) => (
                  <motion.button
                    key={demo.title}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemo(demo.patient)}
                    className={`p-6 rounded-[2rem] glass-card border-0 shadow-xl shadow-slate-200/40 transition-all text-left space-y-3 group/demo relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 pointer-events-none rounded-full ${demo.color.includes('emerald') ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/demo:scale-110 shadow-lg ${demo.iconColor} bg-white ring-8 ring-slate-50/50`}>
                      <Dna className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-black text-slate-900 group-hover/demo:text-emerald-700 transition-colors uppercase tracking-widest text-[11px]">{demo.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-tight">{demo.subtitle}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
              </div>

              <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-200/50 pt-20">
                {[
                  { title: "Smart Matching", desc: "Our AI analyzes complex eligibility criteria that keywords often miss.", icon: Sparkles, color: "bg-emerald-50 text-emerald-600" },
                  { title: "Plain Language", desc: "No more medical jargon. Get clear explanations of why a trial fits you.", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
                  { title: "Source Verified", desc: "Real-time data directly from ClinicalTrials.gov official public registry.", icon: CheckCircle2, color: "bg-indigo-50 text-indigo-600" }
                ].map((item, i) => (
                  <div key={i} className="p-10 glass-card rounded-[3rem] border-white/60 shadow-xl shadow-slate-100/20 text-left space-y-6 hover:shadow-2xl transition-all hover:-translate-y-2 duration-500">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} shadow-sm shadow-current/20`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase leading-tight">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium italic opacity-80">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <MedicalDisclaimer className="mt-12 text-center inline-flex" />
            </motion.div>
          )}

          {view === "intake" && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <IntakeForm onSubmit={handleIntakeSubmit} onDemo={handleDemoInstant} initialProfile={patientProfile} />
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center py-24 space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                <Dna className="w-6 h-6 text-blue-400 absolute inset-0 m-auto" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Finding the best matches...</h2>
                <p className="text-slate-500">Searching ClinicalTrials.gov and preparing AI analysis for you.</p>
              </div>
            </motion.div>
          )}

          {view === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-8 -mx-4 -my-8 md:-my-16 h-[calc(100vh-10rem)]"
            >
              <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto hidden lg:flex">
                <div className="space-y-6">
                  <div>
                    <label className="sidebar-label">Active Search Profile</label>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-sm font-bold text-slate-800">{patientProfile?.condition}</div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                        {patientProfile?.age} yrs, {patientProfile?.sex}, {patientProfile?.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Filter Results</h3>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Trial Phase</Label>
                      <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                        <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                          <SelectValue placeholder="Select Phase" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                          <SelectItem value="All">All Phases</SelectItem>
                          <SelectItem value="PHASE1">Phase 1</SelectItem>
                          <SelectItem value="PHASE2">Phase 2</SelectItem>
                          <SelectItem value="PHASE3">Phase 3</SelectItem>
                          <SelectItem value="PHASE4">Phase 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Recruitment Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                          <SelectItem value="All">All Statuses</SelectItem>
                          <SelectItem value="RECRUITING">Recruiting</SelectItem>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="ENROLLING">Enrolling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Search Location</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input 
                          placeholder="City or Facility..." 
                          className="h-10 pl-9 rounded-xl border-slate-200 bg-slate-50/50"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-full text-xs font-bold text-slate-400 hover:text-slate-900"
                      onClick={() => {
                        setPhaseFilter("All");
                        setStatusFilter("All");
                        setLocationSearch("");
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => setView("intake")}>Update Medical Profile</Button>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                  <div className="text-xs text-slate-400 font-medium italic italic">"AI is scanning thousands of criteria points..."</div>
                  <Progress value={100} className="h-1 bg-slate-100" />
                </div>
              </aside>

              <section className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
                <div className="flex justify-between items-center px-4 md:px-0">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Top Match Results</h2>
                    <p className="text-sm text-slate-500">Found {filteredTrials.length} potentials from {trials.length} studies</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setView("intake")} className="lg:hidden">Edit Profile</Button>
                    <div className="lg:hidden">
                       {/* Mobile filter button could go here if needed, but for now we focus on desktop sidebar as requested */}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-2 space-y-4 custom-scrollbar">
                  {filteredTrials.map((trial) => (
                    <div 
                      key={trial.nctId} 
                      onClick={() => setSelectedTrial(trial)}
                      className={`cursor-pointer transition-all ${selectedTrial?.nctId === trial.nctId ? 'ring-2 ring-blue-600 ring-offset-4 rounded-2xl' : ''}`}
                    >
                      <TrialCard 
                        trial={trial} 
                        analysis={analyses[trial.nctId]} 
                        isLoadingAnalysis={!analyses[trial.nctId]}
                        onViewDetails={handleTrialClick}
                        onShare={handleShareTrial}
                      />
                    </div>
                  ))}
                  {trials.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                      <p className="text-xl text-slate-500">No recruiting trials found.</p>
                      <Button onClick={() => setView("intake")}>Try broader search terms</Button>
                    </div>
                  )}
                </div>
              </section>

              <aside className="hidden xl:flex w-[400px] flex-col glass-panel border-l-0 rounded-l-[3.5rem] overflow-hidden shadow-2xl relative z-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>
                {selectedTrial && analyses[selectedTrial.nctId] ? (
                  <div className="flex flex-col h-full bg-white/40 backdrop-blur-xl">
                    <div className="p-10 bg-emerald-500/5 border-b border-white/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-600 w-2.5 h-6 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">AI Synthesis</h2>
                      </div>
                      <p className="text-lg font-black leading-tight text-slate-900 italic tracking-tight">
                        "{analyses[selectedTrial.nctId].plain_language_summary}"
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                      <div className="flex justify-between items-center py-6 px-8 bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl pointer-events-none rounded-full"></div>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-500 tracking-tighter">{analyses[selectedTrial.nctId].match_score}%</div>
                        <div className="text-right">
                          <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Match Index</div>
                          <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">{analyses[selectedTrial.nctId].match_level}</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Prime Compatibility</h4>
                        <ul className="space-y-4">
                          {analyses[selectedTrial.nctId].why_it_matches.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex items-start gap-4 text-[13px] font-bold text-slate-700 leading-snug italic">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 opacity-80" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Clinical Protocol</h4>
                        <div className="bg-white/60 rounded-[1.5rem] p-6 border border-white shadow-sm italic text-xs text-slate-600 font-medium leading-[1.6]">
                          " {analyses[selectedTrial.nctId].doctor_questions[0]} "
                        </div>
                      </div>

                      <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95" onClick={() => handleTrialClick(selectedTrial)}>
                        Expand Details <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-8 bg-emerald-500/5">
                    <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-3xl flex items-center justify-center text-slate-300 border border-white shadow-xl shadow-slate-200/50">
                      <Sparkles className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Neural Selection Ready</h3>
                      <p className="text-sm text-slate-400 font-bold leading-relaxed opacity-70">SELECT A RESEARCH NODE FROM THE RESULTS LIST TO GENERATE A REAL-TIME ELIGIBILITY SYNTHESIS.</p>
                    </div>
                  </div>
                )}
              </aside>
            </motion.div>
          )}

          {view === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end border-b pb-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Your Saved Trials ({savedTrials.length})</h2>
                  <p className="text-slate-500">Keep track of interesting trials to discuss with your doctor.</p>
                </div>
                {savedTrials.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setSavedTrials([])} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                    Clear All
                  </Button>
                )}
              </div>

              {savedTrials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTrials.map((trial) => (
                    <TrialCard 
                      key={trial.nctId} 
                      trial={trial} 
                      analysis={analyses[trial.nctId]} 
                      isLoadingAnalysis={!analyses[trial.nctId]}
                      onViewDetails={handleTrialClick}
                      onRemove={toggleSaveTrial}
                      onShare={handleShareTrial}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <HistoryIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">No saved trials yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Trials you save will appear here for easy access and comparison.</p>
                  <Button onClick={() => setView("landing")}>Browse Trials</Button>
                </div>
              )}
            </motion.div>
          )}

          {view === "how-it-works" && (
            <motion.div
              key="how-it-works"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tight">How TrialMatch <span className="text-blue-600">AI Works</span></h2>
                <p className="text-lg text-slate-500">Bridging the gap between medical research and patient understanding.</p>
              </div>

              <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/ATPFExkCg6U" 
                  title="TrialMatch AI Video Guide" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { step: "01", title: "Standardized Profile", content: "We map your symptoms using MeSH (Medical Subject Headings) to ensure precision matching against global oncology and medical records." },
                  { step: "02", title: "High-Recall Search", content: "We query 500,000+ studies via ClinicalTrials.gov API using search patterns benchmarked against TREC Clinical Trials standards (2021/2022)." },
                  { step: "03", title: "Agentic Reasoning", content: "Gemini 3.1 acts as a clinical NLP agent, parsing thousands of lines of complex eligibility criteria comparing them directly against your specific profile." },
                  { step: "04", title: "Explainable Insights", content: "We translate the 'medical-speak' into plain language, explaining exactly why you might be a match and what concerns to discuss." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-black text-blue-100 italic select-none">{item.step}</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-200">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="text-2xl font-bold italic">"Our goal isn't just to find trials, but to make them understandable."</h3>
                  <p className="text-blue-100">TrialMatch AI empowers patients to have better conversations with their doctors through technology.</p>
                </div>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10" onClick={startIntake}>
                  Get Started Now
                </Button>
              </div>
            </motion.div>
          )}

          {view === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">System <span className="text-emerald-600">History & Storage</span></h2>
                <p className="text-lg text-slate-500 font-medium">Manage your clinical profile and local application data.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <HistoryIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Profile Integrity</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b text-sm">
                      <span className="text-slate-500">Active Profile</span>
                      <span className="font-bold">{patientProfile?.condition || "None"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b text-sm">
                      <span className="text-slate-500">Saved Trials</span>
                      <span className="font-bold">{savedTrials.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b text-sm">
                      <span className="text-slate-500">Cached Analyses</span>
                      <span className="font-bold">{Object.keys(analyses).length}</span>
                    </div>
                  </div>
                  <Button onClick={() => setView("intake")} variant="outline" className="w-full rounded-2xl h-12 font-bold bg-slate-50">Reset Profile</Button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Storage Health</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/10 text-sm">
                      <span className="text-white/50">Storage Usage</span>
                      <span className="font-bold">{smartStorage.getStats().sizeInKb} KB</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10 text-sm">
                      <span className="text-white/50">Limit Status</span>
                      <span className={`font-bold ${smartStorage.getStats().isNearLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {smartStorage.getStats().isNearLimit ? 'Near Capacity' : 'Healthy'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-400 font-bold hover:bg-red-500/10 h-12 rounded-2xl"
                    onClick={() => {
                        if (confirm("This will permanently delete all your saved trials and medical profile. Continue?")) {
                            smartStorage.clearAll();
                        }
                    }}
                  >
                    Clear All Application Data
                  </Button>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100 text-center space-y-4">
                <p className="text-sm text-emerald-800 font-medium">
                  Note: All data is stored locally in your browser. We never send your identification or medical profile to our database.
                </p>
              </div>
            </motion.div>
          )}

          {view === "vision" && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-6">
                <h2 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.95] uppercase">Democratizing <br/><span className="text-emerald-600">Clinical Hope</span></h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
                  "Our vision is a world where medical complexity is no longer a barrier to life-saving research."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                    <Sparkles className="w-24 h-24 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-emerald-400">The Problem</h3>
                  <p className="opacity-80 leading-relaxed font-medium">
                    80% of clinical trials are delayed due to recruitment issues, and 95% of patients are unaware that a clinical trial might be a valid care option for them.
                  </p>
                </div>
                <div className="p-10 bg-emerald-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                    <Dna className="w-24 h-24" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">The Solution</h3>
                  <p className="opacity-90 leading-relaxed font-bold">
                    By distilling massive medical datasets into patient-first narratives, we bridge the communication gap between research facilities and clinical patients.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/50 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white shadow-sm space-y-8 text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Core Values</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-black text-emerald-600 uppercase text-xs mb-2">Transparency</h4>
                    <p className="text-sm text-slate-500 italic">Clear sources, clear logic.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-600 uppercase text-xs mb-2">Precision</h4>
                    <p className="text-sm text-slate-500 italic">MeSH-compliant mapping.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-600 uppercase text-xs mb-2">Empathy</h4>
                    <p className="text-sm text-slate-500 italic">Design for accessibility.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-600 uppercase text-xs mb-2">Integrity</h4>
                    <p className="text-sm text-slate-500 italic">Privacy-first engineering.</p>
                  </div>
                </div>
                <div className="pt-8">
                  <Button size="lg" className="h-16 px-12 text-lg bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 group font-black" onClick={startIntake}>
                    Help us build the future <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "detail" && selectedTrial && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <TrialDetails 
                trial={selectedTrial} 
                analysis={analyses[selectedTrial.nctId]} 
                patientProfile={patientProfile!}
                onBack={() => {
                  // Clear URL parameters when returning
                  window.history.replaceState({}, '', window.location.pathname);
                  setView(trials.length > 0 ? "results" : "landing");
                }}
                onSave={() => toggleSaveTrial(selectedTrial)}
                onShare={() => handleShareTrial(selectedTrial)}
                isSaved={savedTrials.some(t => t.nctId === selectedTrial.nctId)}
              />
            </motion.div>
          )}
          {view === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Simple <span className="text-emerald-600">Pricing</span></h2>
                <p className="text-lg text-slate-500 font-medium">Choose a plan that fits your clinical trial matching needs.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold">Basic</h3>
                  <div className="text-4xl font-black">$0<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                  <ul className="space-y-4 text-sm font-bold text-slate-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Basic Trial Search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Save up to 5 Trials</li>
                    <li className="flex items-center gap-2 text-slate-400"><X className="w-5 h-5" /> No Agentic Reasoning</li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-2xl h-12 font-bold bg-slate-50">Current Plan</Button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden space-y-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full"></div>
                  <Badge className="bg-emerald-500 text-white border-none absolute top-8 right-8">Pro</Badge>
                  <h3 className="text-xl font-bold text-emerald-400">Premium</h3>
                  <div className="text-4xl font-black">$29<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                  <ul className="space-y-4 text-sm font-bold text-slate-300 relative z-10">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Unlimited Trial Search</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Unlimited Saved Trials</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Full Agentic Reasoning (Gemini 3.1)</li>
                  </ul>
                  <Button className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold relative z-10">Upgrade to Premium</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="glass-dark text-slate-400 py-20 mt-24 relative overflow-hidden">
        {/* Decorative elements for depth */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white uppercase">TrialMatch <span className="text-emerald-500">AI</span></span>
            </div>
            <p className="text-base leading-relaxed max-w-sm text-slate-400/80 font-medium italic">
              "Democratizing clinical access through agentic reasoning and patient-first design."
            </p>
            <div className="flex gap-4">
               {/* Social placeholders if needed */}
            </div>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase text-[10px] tracking-[0.3em] opacity-50">Resources</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="https://clinicaltrials.gov" target="_blank" className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block">ClinicalTrials.gov (500k+ Studies)</a></li>
              <li><button onClick={() => showFooterInfo("TREC Benchmarks", "Our matching logic is evaluated against the TREC Clinical Trials benchmarks (2021-2022) to ensure high relevance and retrieval precision for patient profiles.")} className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block text-left">TREC Benchmarks</button></li>
              <li><button onClick={() => showFooterInfo("MeSH Standardization", "All conditions and symptoms are normalized using Medical Subject Headings (MeSH) to ensure global compatibility with trial documentation.")} className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block text-left">MeSH Index</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-6 uppercase text-[10px] tracking-[0.3em] opacity-50">Safety & Trust</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><button onClick={() => showFooterInfo("Privacy Policy", "Your medical data is yours. We encrypt all information and never sell patient profiles to third parties.")} className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block text-left">Privacy Policy</button></li>
              <li><button onClick={() => showFooterInfo("Terms of Service", "By using TrialMatch AI, you agree that this is an informational tool and not a substitute for professional medical advice.")} className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block text-left">Terms of Service</button></li>
              <li><button onClick={() => showFooterInfo("Medical Disclaimer", "Final eligibility is decided by trial investigators. Always consult your oncologist or primary care physician.")} className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block text-left">Medical Disclaimer</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-10 border-t border-white/5 text-[10px] flex flex-col md:flex-row justify-between items-center gap-4 opacity-50 font-black tracking-widest uppercase">
          <p>© 2026 TrialMatch AI. Built for HealthTech Innovation.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2 transition-opacity hover:opacity-100 cursor-default"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Gemini 3.1 Neural Compute</span>
            <span className="hidden md:inline">Precision Informatics</span>
            <span className="hidden md:inline">Open Standards</span>
          </div>
        </div>

        {dialogContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden border border-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"></div>
              <button 
                onClick={() => setDialogContent(null)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black mb-4 text-slate-900 tracking-tight leading-tight uppercase">{dialogContent.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-8 font-medium italic opacity-80">{dialogContent.content}</p>
              <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black shadow-xl transition-all active:scale-95" onClick={() => setDialogContent(null)}>I UNDERSTAND</Button>
            </motion.div>
          </div>
        )}
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm ${
              toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
