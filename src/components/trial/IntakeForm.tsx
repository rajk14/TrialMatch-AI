import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientProfile } from "@/src/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Stethoscope, History as HistoryIcon, Pill, MapPin, Sparkles } from "lucide-react";

interface IntakeFormProps {
  onSubmit: (profile: PatientProfile) => void;
  onDemo: (profile: PatientProfile) => void;
  initialProfile?: PatientProfile | null;
}

const STEPS = [
  { title: "Basics", icon: Stethoscope },
  { title: "History", icon: HistoryIcon },
  { title: "Treatments", icon: Pill },
  { title: "Preferences", icon: MapPin },
];

export const IntakeForm = ({ onSubmit, onDemo, initialProfile }: IntakeFormProps) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PatientProfile>(initialProfile || {
    condition: "",
    symptoms: "",
    age: 45,
    sex: "Female",
    location: "",
    medicalHistory: "",
    medications: "",
    priorTreatments: "",
    travelDistance: 50,
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    } else {
      setProfile({
        condition: "",
        symptoms: "",
        age: 45,
        sex: "Female",
        location: "",
        medicalHistory: "",
        medications: "",
        priorTreatments: "",
        travelDistance: 50,
      });
    }
  }, [initialProfile]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const demoProfiles: Record<string, PatientProfile> = {
    breastCancer: {
      condition: "Stage II Breast Cancer",
      symptoms: "Lump in left breast, fatigue",
      age: 52,
      sex: "Female",
      location: "Boston, MA",
      medicalHistory: "No major surgeries, mother had breast cancer at 60",
      medications: "Vitamin D supplements",
      priorTreatments: "None yet",
      travelDistance: 100,
    },
    diabetes: {
      condition: "Type 2 Diabetes",
      symptoms: "Increased thirst, frequent urination",
      age: 60,
      sex: "Male",
      location: "Chicago, IL",
      medicalHistory: "High blood pressure",
      medications: "Metformin, Lisinopril",
      priorTreatments: "Metformin for 5 years",
      travelDistance: 25,
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-[3rem] border-0 ring-1 ring-white/50 overflow-hidden shadow-2xl shadow-slate-200/50 mb-12 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>
      
      <div className="bg-emerald-500/5 border-b border-white/50 p-10 pt-12">
        <div className="flex justify-between items-center mb-12 relative px-4">
          <div className="absolute top-5 left-12 right-12 h-1.5 bg-slate-200/30 -z-10 rounded-full" />
          <div className="absolute top-5 left-12 h-1.5 bg-emerald-500 transition-all duration-700 ease-out -z-10 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${(step / (STEPS.length - 1)) * 88}%` }} />
          
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border-0 transition-all duration-700 ${i <= step ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30 scale-110' : 'bg-white/80 backdrop-blur-md border border-slate-200/50 text-slate-400'}`}>
                <s.icon className={`w-5 h-5 ${i === step ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${i <= step ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-1.5 text-center px-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{STEPS[step].title} <span className="text-emerald-600">Context</span></h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-70">Security Layer Phase {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      <div className="p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="space-y-8"
          >
            {step === 0 && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="condition" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Diagnosis / Condition</Label>
                  <Input id="condition" className="h-14 rounded-2xl border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-base font-medium px-5" placeholder="e.g., Stage II Breast Cancer" value={profile.condition} onChange={e => setProfile({...profile, condition: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="age" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Age</Label>
                    <Input id="age" type="number" className="h-14 rounded-2xl border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all px-5 font-bold" value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="sex" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Sex</Label>
                    <Select value={profile.sex} onValueChange={(v: any) => setProfile({...profile, sex: v})}>
                      <SelectTrigger className="h-14 rounded-2xl border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all px-5 font-bold"><SelectValue placeholder="Select sex" /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/50 backdrop-blur-xl">
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="symptoms" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Current Symptoms</Label>
                  <Textarea id="symptoms" className="rounded-[1.5rem] border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[120px] p-5 font-medium" placeholder="Describe symptoms you are experiencing..." value={profile.symptoms} onChange={e => setProfile({...profile, symptoms: e.target.value})} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="history" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Medical History</Label>
                  <Textarea id="history" className="rounded-[1.5rem] border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[120px] p-5 font-medium" placeholder="Prior surgeries, allergies, other conditions..." value={profile.medicalHistory} onChange={e => setProfile({...profile, medicalHistory: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="meds" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Current Medications</Label>
                  <Textarea id="meds" className="rounded-[1.5rem] border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[120px] p-5 font-medium" placeholder="List medications you are currently taking..." value={profile.medications} onChange={e => setProfile({...profile, medications: e.target.value})} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="treatments" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Prior Treatments</Label>
                  <Textarea id="treatments" className="rounded-[1.5rem] border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[200px] p-5 font-medium" placeholder="Chemotherapy, radiation, physical therapy, etc..." value={profile.priorTreatments} onChange={e => setProfile({...profile, priorTreatments: e.target.value})} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Location (City, State)</Label>
                  <Input id="location" className="h-14 rounded-2xl border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all px-5 font-bold" placeholder="e.g., New York, NY" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="distance" className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block">Max Travel Distance (Miles)</Label>
                  <Input id="distance" type="number" className="h-14 rounded-2xl border-0 bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all px-5 font-bold" value={profile.travelDistance} onChange={e => setProfile({...profile, travelDistance: parseInt(e.target.value)})} />
                </div>
                <div className="px-6 py-5 bg-emerald-500/10 rounded-2xl text-[13px] text-emerald-700 font-bold border border-emerald-500/10 flex gap-4 backdrop-blur-sm shadow-sm">
                  <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
                  <p className="leading-relaxed uppercase tracking-tight">Our AI will standardize your history to MeSH and TREC Clinical Trial benchmarks for precision matching.</p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-16 gap-4">
          <div className="flex gap-3">
            {step === 0 && (
              <Button variant="outline" className="rounded-2xl border-emerald-200 text-emerald-600 font-bold px-6 h-12 hover:bg-emerald-50" onClick={() => onDemo(demoProfiles.breastCancer)}>Scenario Demo</Button>
            )}
            <Button variant="ghost" className="rounded-2xl h-12 px-6 font-bold text-slate-400 hover:text-slate-900 transition-colors" onClick={prev} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> BACK
            </Button>
          </div>
          
          {step < STEPS.length - 1 ? (
            <Button className="rounded-2xl px-10 h-14 bg-slate-900 text-white font-black hover:bg-emerald-600 shadow-xl transition-all hover:scale-105" onClick={next} disabled={!profile.condition && step === 0}>
              CONTINUE <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-12 h-16 font-black shadow-2xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95" onClick={() => onSubmit(profile)}>
              FIND MATCHES
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
