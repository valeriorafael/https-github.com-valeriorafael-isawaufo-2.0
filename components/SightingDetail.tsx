import React, { useState, useEffect } from 'react';
import { Sighting, User, GeminiAnalysis } from '../types.ts';
import { analyzeSighting } from '../geminiService.ts';

interface SightingDetailProps {
  sighting: Sighting;
  onClose: () => void;
  onRate: (id: string, score: number) => void;
  currentUser: User | null;
}

const SightingDetail: React.FC<SightingDetailProps> = ({ sighting, onClose, onRate, currentUser }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      const existing = sighting.ratings.find(r => r.userId === currentUser.id);
      setUserRating(existing ? existing.score : 0);
    }
    setAnalysis(null);
  }, [sighting, currentUser]);

  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    const result = await analyzeSighting(sighting);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  const avgRating = sighting.ratings.length > 0 
    ? (sighting.ratings.reduce((acc, r) => acc + r.score, 0) / sighting.ratings.length).toFixed(1)
    : 'New';

  return (
    <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto w-full md:w-[400px] lg:w-[450px] bg-[var(--bg-secondary)] md:bg-[var(--bg-secondary)]/95 backdrop-blur-2xl md:border-l border-[var(--border-color)] z-[3000] shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300 rounded-t-3xl md:rounded-none overflow-hidden transition-colors">
      <div className="md:hidden flex justify-center py-3 border-b border-[var(--border-color)]" onClick={onClose}>
        <div className="w-12 h-1.5 bg-[var(--text-primary)]/20 rounded-full"></div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
        <h2 className="font-orbitron text-sm md:text-lg font-bold text-[var(--text-primary)] truncate pr-4 uppercase tracking-tight">{sighting.title}</h2>
        <button onClick={onClose} className="p-2 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 rounded-full transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-[120px] md:pb-6 scrollbar-hide">
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <img 
            src={sighting.mediaUrl} 
            alt="UFO Sighting Evidence" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          <span className="absolute bottom-4 left-4 text-[9px] bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/20 uppercase tracking-widest font-bold text-white">
            {sighting.mediaType === 'image' ? 'Visual Data' : 'Video Stream'}
          </span>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 text-[10px] opacity-70 uppercase tracking-wider">
            <div className="bg-[var(--text-primary)]/5 p-2 rounded-xl border border-[var(--border-color)]">
              <span className="block opacity-60 mb-1 text-[var(--text-primary)]">Agent</span>
              <span className="font-bold text-blue-500 truncate">@{sighting.username}</span>
            </div>
            <div className="bg-[var(--text-primary)]/5 p-2 rounded-xl border border-[var(--border-color)]">
              <span className="block opacity-60 mb-1 text-[var(--text-primary)]">Date</span>
              <span className="font-bold">{new Date(sighting.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="bg-[var(--text-primary)]/5 p-2 rounded-xl border border-[var(--border-color)] col-span-2">
              <span className="block opacity-60 mb-1 text-[var(--text-primary)]">Coordinates</span>
              <span className="font-bold text-[var(--text-primary)]">{sighting.lat.toFixed(4)}, {sighting.lng.toFixed(4)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-[var(--text-primary)]">Observation</h3>
            <p className="text-[var(--text-primary)] opacity-80 leading-relaxed text-sm italic bg-[var(--text-primary)]/5 p-4 rounded-2xl border border-[var(--border-color)]">"{sighting.description}"</p>
          </div>

          <div className="bg-[var(--text-primary)]/5 border border-[var(--border-color)] rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-[var(--text-primary)]">Veracity Level</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${Number(avgRating) <= 1.5 ? 'bg-red-500/20 text-red-600' : 'bg-green-500/20 text-green-600'}`}>
                ★ {avgRating}
              </span>
            </div>
            
            <div className="flex justify-between items-center px-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => onRate(sighting.id, star)}
                  className={`text-3xl transition active:scale-95 touch-manipulation ${userRating >= star ? 'grayscale-0 drop-shadow-md' : 'grayscale opacity-20'}`}
                >
                  🛸
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={fetchAnalysis}
              disabled={loadingAnalysis}
              className="w-full py-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-2xl text-blue-600 text-[10px] font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              {loadingAnalysis ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '🛰️ Run AI Forensic Analysis'
              )}
            </button>

            {analysis && (
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center border-b border-blue-500/10 pb-2">
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Forensic Result</span>
                  <span className="text-[9px] font-bold px-1.5 bg-blue-500/20 text-blue-600 rounded uppercase">{analysis.credibility}</span>
                </div>
                <p className="text-[11px] text-blue-800/80 leading-relaxed">{analysis.explanation}</p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-blue-400 uppercase">Potential ID</span>
                  <span className="text-[10px] font-bold text-blue-700">{analysis.potentialIdentification}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SightingDetail;