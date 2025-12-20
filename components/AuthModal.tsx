import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

// Declare google for Google Identity Services integration
declare const google: any;

/**
 * IMPORTANTE: Para usar o login real do Google:
 * 1. Vá em https://console.cloud.google.com/
 * 2. Crie um projeto e uma "ID do cliente OAuth 2.0"
 * 3. Adicione a URL do seu site (ou localhost) em "Origens JavaScript autorizadas"
 * 4. Substitua a string abaixo pelo seu ID real.
 */
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
  const [googleError, setGoogleError] = useState(false);
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

    const initGoogle = () => {
      if (typeof google !== 'undefined' && google.accounts && googleBtnRef.current) {
        try {
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
            width: 320 
          });

          // Verifica se o ID ainda é o placeholder para mostrar aviso de dev
          if (GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID")) {
            setGoogleError(true);
          }
        } catch (e) {
          console.error("Google GSI Init Error", e);
          setGoogleError(true);
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
      }, 1200);
    } else {
      setIsSyncing(false);
      alert("Falha na descriptografia dos dados do satélite.");
    }
  };

  // Função para simular o que aconteceria com um login real (Para testes)
  const handleDemoLogin = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onLogin({
        id: "demo-123",
        username: "agent_fox_mulder",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
        clearance: 'Level 2'
      });
      setIsSyncing(false);
    }, 1500);
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
    <div className="w-full max-w-sm bg-[#0a0a0c]/95 border border-green-500/30 rounded-2xl shadow-[0_0_80px_rgba(34,197,94,0.15)] p-8 relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 scan-line"></div>

      {isSyncing ? (
        <div className="py-12 text-center space-y-6 animate-pulse">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-green-500/20 rounded-full mx-auto"></div>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="font-orbitron text-sm text-green-500 tracking-[0.2em] uppercase">Decrypting Identity</p>
            <p className="text-[9px] text-gray-500 font-mono">EXTRACTING BIOMETRIC DATA FROM OAUTH2 STREAM...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              👽
            </div>
            <h2 className="font-orbitron text-lg font-bold tracking-[0.2em] text-green-500 uppercase">Secure Access</h2>
            <div className="mt-3 h-10 overflow-hidden bg-black/40 p-2 rounded border border-green-500/10">
              {bootText.slice(-2).map((t, i) => (
                <p key={i} className="text-[8px] font-mono text-green-700/80 text-left truncate leading-tight tracking-tighter">{t}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]"></div>
              
              {googleError && (
                <div className="text-center px-2">
                  <p className="text-[8px] text-red-500/80 uppercase font-bold mb-2">Satellite Config Error (Invalid Client ID)</p>
                  <button 
                    onClick={handleDemoLogin}
                    className="text-[9px] text-blue-400 hover:text-blue-300 underline font-mono uppercase tracking-tighter"
                  >
                    Use Demo Account (Skip Real Google Auth)
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-green-500/10"></div>
              <span className="text-[8px] text-gray-600 font-bold uppercase font-mono">Field ID</span>
              <div className="flex-1 h-[1px] bg-green-500/10"></div>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-3">
              <div className="space-y-1.5">
                <input 
                  required
                  type="text" 
                  placeholder="AGENT_CODENAME" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 text-xs font-mono text-green-400 placeholder:text-green-900 focus:outline-none focus:border-green-500 focus:bg-green-500/10 transition-all text-center uppercase tracking-widest"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-black font-orbitron font-bold rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all active:scale-95 uppercase tracking-widest text-[9px]"
              >
                Establish Uplink
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-2">
              <p className="text-[7px] text-gray-700 uppercase font-mono tracking-[0.2em]">Quantum Encryption Active</p>
              <div className="flex gap-1.5 opacity-30">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150"></div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;