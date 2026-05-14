import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trial, TrialAnalysis } from "@/src/types";
import { motion } from "motion/react";
import { MapPin, Building2, FlaskConical, ChevronRight, CheckCircle2, AlertCircle, Trash2, Sparkles, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TrialCardProps {
  trial: Trial;
  analysis?: TrialAnalysis;
  onViewDetails: (trial: Trial) => void;
  onRemove?: (trial: Trial) => void;
  onShare?: (trial: Trial) => void;
  isLoadingAnalysis?: boolean;
}

export const TrialCard = ({ trial, analysis, onViewDetails, onRemove, onShare, isLoadingAnalysis }: TrialCardProps) => {
  const getMatchBadge = (level: string) => {
    switch (level) {
      case "Strong potential match": return <Badge className="bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">Strong Match</Badge>;
      case "Possible match": return <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">Possible Match</Badge>;
      case "Weak match": return <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">Weak Match</Badge>;
      default: return <Badge variant="outline">Evaluating...</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="relative h-full"
    >
      <Card className={`h-full glass-card flex flex-col rounded-[2.5rem] border-0 hover:ring-2 hover:ring-emerald-500/20 shadow-xl shadow-slate-200/40 overflow-hidden relative group/card transition-all duration-500 ${analysis?.match_score && analysis.match_score >= 90 ? 'bg-emerald-50/30' : 'bg-white/40'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full group-hover/card:bg-emerald-500/10 transition-colors"></div>
        
        <CardHeader className="space-y-4 relative pr-20 p-8 pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Badge className="px-4 py-1.5 bg-slate-900/5 text-slate-700 text-[9px] font-black rounded-full border-0 uppercase tracking-[0.1em]">Phase {trial.phase}</Badge>
              <Badge className="px-4 py-1.5 bg-emerald-500/10 text-emerald-700 text-[9px] font-black rounded-full border-0 uppercase tracking-[0.1em]">Recruiting</Badge>
            </div>
            <CardTitle className="text-xl font-black text-slate-900 leading-[1.1] line-clamp-2 uppercase tracking-tighter group-hover/card:text-emerald-700 transition-colors">{trial.title}</CardTitle>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
              <span>{trial.sponsor}</span>
            </div>
          </div>

          {analysis && (
            <div className="absolute top-8 right-8">
              <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 flex flex-col items-center justify-center shadow-2xl transform -rotate-6 group-hover/card:rotate-0 transition-all duration-500 border border-white/10">
                <span className="text-white text-base font-black tracking-tighter">{analysis.match_score}%</span>
                <span className="text-[7px] text-white/50 font-black uppercase tracking-tighter -mt-1">Match</span>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow space-y-4 px-8 pt-0 pb-4">
          {analysis && (
            <div className="pt-2">
              <div className="px-6 py-5 bg-white/60 backdrop-blur-sm rounded-[1.5rem] border border-white text-[13px] text-slate-600 font-semibold leading-relaxed italic relative overflow-hidden shadow-sm group-hover/card:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-blue-500 opacity-50"></div>
                "{analysis.plain_language_summary}"
              </div>
            </div>
          )}

          {!analysis && isLoadingAnalysis && (
            <div className="pt-2">
              <div className="px-4 py-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 flex flex-col items-center justify-center gap-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Scanning AI Analysis</span>
                </div>
                <div className="w-full space-y-1.5">
                  <div className="h-1 bg-emerald-200/50 rounded-full w-full"></div>
                  <div className="h-1 bg-emerald-200/50 rounded-full w-4/5 ml-auto"></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-2 gap-2 mt-auto border-t border-white/20">
          <Button variant="ghost" className="flex-1 justify-between text-emerald-600 font-black text-xs hover:bg-emerald-500/10 rounded-xl h-11 px-4" onClick={() => onViewDetails(trial)}>
            EXPLORE DETAILS
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          {onShare && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl h-11 w-11 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                onShare(trial);
              }}
            >
              <Share2 className="w-4.5 h-4.5" />
            </Button>
          )}
          {onRemove && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl h-11 w-11 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(trial);
              }}
            >
              <Trash2 className="w-4.5 h-4.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
