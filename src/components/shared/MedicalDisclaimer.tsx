import { AlertCircle } from "lucide-react";

export const MedicalDisclaimer = ({ className }: { className?: string }) => (
  <div className={`p-6 bg-slate-900/5 backdrop-blur-md border border-slate-200/50 rounded-[2rem] flex items-start gap-4 text-xs text-slate-600 font-medium ${className}`}>
    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-sm">
      <AlertCircle className="w-5 h-5" />
    </div>
    <div>
      <p className="font-black uppercase tracking-widest mb-1.5 text-slate-900 text-[10px]">Medical Safety Protocol</p>
      <p className="leading-relaxed italic opacity-80">TrialMatch AI is an informational tool only. This is <strong>not medical advice</strong>. Final eligibility is determined solely by trial investigators. Always consult your oncology team or primary physician.</p>
    </div>
  </div>
);
