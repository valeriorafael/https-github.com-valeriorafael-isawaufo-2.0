import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

// Declare google for Google Identity Services integration
declare const google: any;

// Substitua pelo seu Client ID real do Google Cloud Console
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

interface AuthModalProps {
  onClose?: () => void;
  onLogin: (user: User) => void;
  isLanding?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, isLanding = false }) => {
  const [username, setUsername] = useState('');
  const [bootText, setBootText] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Decodificador de JWT (JSON Web Token) para extrair info do Google
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Texto de "boot" para imersão
    const logs = [
      "> INITIALIZING ENCRYPTED UPLINK...",
      "> BYPASSING REGIONAL FIREWALLS...",
      "> CONNECTING TO GUMN SATELLITE...",
      "> STATUS: READY FOR CREDENTIALS."
    ];
    
    logs.forEach((text, i) => {
      setTimeout(() => {
        setBootText(prev => [...prev, text]);
      }, i * 400);
    });

    // Inicializar Google Identity Services
    const initGoogle = () => {
      // Fix: Check for global 'google' variable provided by the script tag
      if (typeof google !== 'undefined' && google.accounts && googleBtnRef.current) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320 // Ajustado para o layout
        });
      } else {
        // Se a lib não carregou, tenta novamente em 1s
        setTimeout(initGoogle, 1000);
      }
    };

    initGoogle();
  }, []);

  const handleGoogleResponse = (response: any) => {
    setIsSyncing(true);
    const userData = parseJwt(response.credential);

    if (userData) {
      // Pequeno delay para efeito visual de sincronização
      setTimeout(() => {
        onLogin({
          id: userData.sub, // ID único do Google
          username: userData.name.replace(/\s+/g, '_'),
          avatar: userData.picture,
          clearance: 'Level 1'
        });
        setIsSyncing(false);
      }, 1000);
    } else {
      setIsSyncing(false);
      alert("Erro ao processar dados do Google. Tente o login manual.");
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    onLogin({
      id: `u-${Math.random().toString(36).substr(2, 5)}`,
      username: username.replace(/\s+/g, '_'),
      avatar: `https://picsum.photos/seed/${username}/100/100`,
      clearance: 'Level 1'
    });
  };

  return (
    <div className="w-full max-w-sm bg-[#0a0a0c]/95 border border-green-500/30 rounded-2xl shadow-[0_0_80px_rgba(34,197,94,0.15)] p-8 relative overflow-hidden transition-all duration-500">
      {/* Scan Line Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 scan-line"></div>

      {isSyncing ? (
        <div className="py-12 text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="font-orbitron text-sm text-green-500 tracking-[0.2em] uppercase">Syncing Credentials</p>
            <p className="text-[10px] text-gray-500 font-mono">ESTABLISHING SECURE OAUTH2 CHANNEL...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 animate-pulse">
              👽
            </div>
            <h2 className="font-orbitron text-xl font-bold tracking-[0.2em] text-green-500 uppercase">Restricted Access</h2>
            <div className="mt-2 h-12 overflow-hidden bg-black/40 p-2 rounded border border-green-500/5">
              {bootText.slice(-2).map((t, i) => (
                <p key={i} className="text-[8px] font-mono text-green-700/80 text-left truncate leading-tight">{t}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Google Identity Services Container */}
            <div className="flex flex-col items-center gap-4">
              <div ref={googleBtnRef} className="w-full flex justify-center"></div>
              <p className="text-[8px] text-gray-600 font-mono uppercase">Official Satellite Uplink</p>
            </div>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-green-500/10"></div>
              <span className="text-[8px] text-gray-600 font-bold uppercase font-mono">OR</span>
              <div className="flex-1 h-[1px] bg-green-500/10"></div>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-green-500/40 uppercase tracking-widest ml-1">Agent Designation</label>
                <input 
                  required
                  type="text" 
                  placeholder="CODENAME..." 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-4 text-sm font-mono text-green-400 placeholder:text-green-900 focus:outline-none focus:border-green-500 focus:bg-green-500/10 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-orbitron font-bold rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 uppercase tracking-widest text-[10px]"
              >
                Authenticate Link
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-2">
              <p className="text-[8px] text-gray-600 uppercase font-mono">Secured by GUMN-Alpha v1.0.4</p>
              <div className="flex gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;