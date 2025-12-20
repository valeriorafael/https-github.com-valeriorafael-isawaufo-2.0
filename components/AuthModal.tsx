import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

// Declare google for Google Identity Services integration
declare const google: any;

/**
 * ID do cliente OAuth 2.0 validado pelo usuário.
 */
const GOOGLE_CLIENT_ID = "243561407066-l26bne0cnccbsrd80trfg987q3jmcpp2.apps.googleusercontent.com";

interface AuthModalProps {
  onClose?: () => void;
  onLogin: (user: User) => void;
  isLanding?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, isLanding = false }) => {
  const [username, setUsername] = useState('');
  const [bootText, setBootText] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

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
    const logs = [
      "> SCANNING FOR QUANTUM SIGNATURES...",
      "> ESTABLISHING GOOGLE SATELLITE LINK...",
      "> ENCRYPTING TRANSMISSION CHANNEL...",
      "> SYSTEM READY: AWAITING CREDENTIALS."
    ];
    
    logs.forEach((text, i) => {
      setTimeout(() => {
        setBootText(prev => [...prev, text]);
      }, i * 300);
    });

    const initGoogle = () => {
      if (typeof google !== 'undefined' && google.accounts && googleBtnRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin'
          });

          google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: "signin_with",
            shape: "pill",
            logo_alignment: "left",
            width: 300 
          });

          // Solicita a conta Google automaticamente (One Tap)
          google.accounts.id.prompt();
          
          setGoogleReady(true);
        } catch (e) {
          console.error("GSI Error:", e);
        }
      } else {
        setTimeout(initGoogle, 500);
      }
    };

    initGoogle();
  }, []);

  const handleGoogleResponse = (response: any) => {
    setIsSyncing(true);
    const userData = parseJwt(response.credential);

    if (userData) {
      setTimeout(() => {
        onLogin({
          id: userData.sub,
          username: userData.name.replace(/\s+/g, '_').toLowerCase(),
          avatar: userData.picture,
          clearance: 'Level 1'
        });
        setIsSyncing(false);
      }, 1500);
    } else {
      setIsSyncing(false);
      alert("Encryption error: Could not verify satellite token.");
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    onLogin({
      id: `u-${Math.random().toString(36).substr(2, 5)}`,
      username: username.replace(/\s+/g, '_').toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      clearance: 'Level 1'
    });
  };

  return (
    <div className="w-full max-w-sm bg-[#0a0a0c]/95 border border-green-500/30 rounded-3xl shadow-[0_0_100px_rgba(34,197,94,0.2)] p-10 relative overflow-hidden transition-all duration-700">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/30 scan-line"></div>

      {isSyncing ? (
        <div className="py-16 text-center space-y-8 animate-pulse">
          <div className="relative flex justify-center">
             <div className="w-24 h-24 border-2 border-green-500/10 rounded-full"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-t-2 border-green-500 rounded-full animate-spin"></div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center text-2xl">📡</div>
          </div>
          <div className="space-y-3">
            <p className="font-orbitron text-sm text-green-500 tracking-[0.3em] uppercase font-bold">Verifying Agent</p>
            <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Synchronizing with Global Node...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto text-4xl mb-6 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]">
              🛸
            </div>
            <h2 className="font-orbitron text-xl font-bold tracking-[0.3em] text-green-500 uppercase">UFO Tracker</h2>
            <div className="mt-4 h-12 overflow-hidden bg-black/60 p-3 rounded-lg border border-green-500/10 backdrop-blur-sm">
              {bootText.slice(-2).map((t, i) => (
                <p key={i} className="text-[9px] font-mono text-green-500/60 text-left truncate leading-tight tracking-tight uppercase">{t}</p>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]"></div>
              {!googleReady && (
                <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
              )}
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-[1px] bg-green-500/10"></div>
              <span className="text-[9px] text-gray-600 font-bold uppercase font-mono tracking-widest">OR</span>
              <div className="flex-1 h-[1px] bg-green-500/10"></div>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="relative group">
                <input 
                  required
                  type="text" 
                  placeholder="AGENT_CODENAME" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono text-green-400 placeholder:text-gray-700 focus:outline-none focus:border-green-500/50 focus:bg-green-500/5 transition-all text-center uppercase tracking-[0.3em]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4.5 bg-green-600 hover:bg-green-500 text-black font-orbitron font-bold rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.2)] transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
              >
                Access Network
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <p className="text-[8px] text-gray-500 uppercase font-mono tracking-widest">Global Encryption Active</p>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;