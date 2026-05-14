import { Trial, TrialAnalysis, PatientProfile } from "@/src/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MedicalDisclaimer } from "../shared/MedicalDisclaimer";
import ReactMarkdown from "react-markdown";
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Stethoscope, 
  Navigation, 
  ExternalLink,
  MessageSquare,
  FileText,
  ChevronLeft,
  Building2,
  Share2
} from "lucide-react";

interface TrialDetailsProps {
  trial: Trial;
  analysis?: TrialAnalysis;
  patientProfile: PatientProfile;
  onBack: () => void;
  onSave: () => void;
  onShare: () => void;
  isSaved: boolean;
}

export const TrialDetails = ({ trial, analysis, onBack, onSave, onShare, isSaved }: TrialDetailsProps) => {
  const isLoading = !analysis;

  return (
    <div className="max-w-4xl mx-auto space-y-12 px-4 md:px-0 pb-20">
      <div className="flex justify-between items-center glass-panel p-5 rounded-[2rem] border-white/20 shadow-2xl sticky top-4 z-50 lg:top-24 mx-2">
        <Button variant="ghost" onClick={onBack} className="rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
          <ChevronLeft className="w-4 h-4 mr-2" /> Return
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200" onClick={() => window.open(`https://clinicaltrials.gov/study/${trial.nctId}`, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" /> Source Registry
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button 
            size="sm" 
            variant={isSaved ? "secondary" : "default"}
            onClick={onSave}
            className={`rounded-xl font-black text-[10px] uppercase tracking-widest px-6 ${isSaved ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : "bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100"}`}
          >
            {isSaved ? "Stored in Vault" : "Store Selection"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="px-4 py-1.5 bg-slate-900/5 text-slate-700 text-[9px] font-black rounded-full border-0 uppercase tracking-[0.2em]">{trial.nctId}</Badge>
              <Badge className="px-4 py-1.5 bg-emerald-500/10 text-emerald-700 text-[9px] font-black rounded-full border-0 uppercase tracking-[0.2em]">{trial.status}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.95] uppercase">{trial.title}</h1>
            <div className="flex items-center gap-8 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Phase {trial.phase}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {trial.locations?.length || 0} Research Nodes
              </div>
            </div>
          </section>

          <Separator className="bg-slate-200/50" />

          <section className="space-y-6">
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="bg-emerald-600 w-2 h-5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
              Neural Context Synthesis
            </h2>
            
            {isLoading ? (
              <div className="animate-pulse space-y-8 bg-white/40 p-10 rounded-[3rem] border border-white/50 shadow-xl">
                <div className="space-y-4">
                  <div className="h-5 bg-emerald-100 rounded-full w-full"></div>
                  <div className="h-5 bg-emerald-100 rounded-full w-5/6"></div>
                  <div className="h-5 bg-emerald-100 rounded-full w-2/3 opacity-50"></div>
                </div>
                <div className="h-32 bg-slate-100/50 rounded-3xl"></div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-200/20 transition-all hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-emerald-500 to-blue-500 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-2xl font-black text-slate-900 mb-8 italic leading-tight tracking-tight leading-relaxed">
                  "{analysis.plain_language_summary}"
                </p>
                <div className="text-[15px] border-t pt-8 border-slate-200/30 font-medium leading-[1.8] opacity-80 text-slate-600 italic">
                  <ReactMarkdown>{trial.summary}</ReactMarkdown>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-6 p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-sm border border-white shadow-lg relative overflow-hidden group/card hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Positive Metrics
                </h3>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-2.5 bg-slate-200/50 rounded-full w-full"></div>)}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {analysis.why_it_matches.map((item, i) => (
                      <li key={i} className="text-[13px] text-slate-800 font-bold flex gap-4 leading-tight">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-6 p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-sm border border-white shadow-lg relative overflow-hidden group/card hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none rounded-full"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Risk Vectors
                </h3>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-2.5 bg-slate-200/50 rounded-full w-full"></div>)}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {analysis.possible_concerns.map((item, i) => (
                      <li key={i} className="text-[13px] text-slate-800 font-bold flex gap-4 leading-tight">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-6 p-8 rounded-[2.5rem] bg-emerald-500/5 backdrop-blur-md border border-emerald-200/30 shadow-inner">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-blue-500 opacity-60" /> Unknown Variables & Divergences
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-2.5 bg-emerald-100 rounded-full w-1/2"></div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {analysis.unknowns_to_confirm.map((item, i) => (
                    <li key={i} className="text-[11px] text-slate-500 font-black flex gap-4 leading-relaxed tracking-tight uppercase italic opacity-70">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-dark p-10 rounded-[3.5rem] text-white shadow-2xl space-y-10 sticky top-24 transform md:rotate-1 border-white/10 group/sidebar overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full group-hover/sidebar:bg-emerald-500/20 transition-all duration-700"></div>
            
            <div className="space-y-3 text-center pb-8 border-b border-white/5 relative z-10">
              {isLoading ? (
                <div className="h-14 w-32 bg-white/10 animate-pulse mx-auto rounded-[1.25rem]"></div>
              ) : (
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-500 tracking-tighter leading-none">{analysis.match_score}<span className="text-2xl text-white/30 ml-1">%</span></div>
              )}
              <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-2">Neural Match Coefficient</div>
            </div>

            <div className="space-y-8 relative z-10">
              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Query Generator
              </h3>
              <div className="space-y-5">
                {isLoading ? (
                  <div className="space-y-5">
                    <div className="h-20 bg-white/5 rounded-[1.5rem] animate-pulse"></div>
                    <div className="h-20 bg-white/5 rounded-[1.5rem] animate-pulse"></div>
                  </div>
                ) : (
                  analysis.doctor_questions.map((q, i) => (
                    <div key={i} className="text-sm font-semibold p-6 bg-white/5 rounded-[1.5rem] border border-white/5 text-emerald-50/80 leading-[1.6] italic relative overflow-hidden group-hover/sidebar:border-white/10 transition-colors">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/30"></div>
                      " {q} "
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                Action Sequence
              </h3>
              <div className="space-y-5">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-3 bg-white/5 rounded-full w-full"></div>
                    <div className="h-3 bg-white/5 rounded-full w-2/3"></div>
                  </div>
                ) : (
                  analysis.next_steps.map((step, i) => (
                    <div key={i} className="flex gap-5 text-sm items-center group/step">
                      <div className="w-8 h-8 rounded-[10px] bg-white/10 text-white flex items-center justify-center flex-shrink-0 text-[11px] font-black group-hover/step:bg-emerald-500 group-hover/step:text-slate-900 transition-all duration-300 shadow-inner">{i + 1}</div>
                      <span className="text-white/80 font-bold leading-tight group-hover/step:text-white transition-colors">{step}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button className="w-full h-16 bg-white text-slate-900 hover:bg-emerald-500 hover:text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all duration-500 relative z-10" onClick={() => window.print()}>
              Export Dossier (Print PDF)
            </Button>
          </div>
        </div>
      </div>
      
      <MedicalDisclaimer />
    </div>
  );
};
