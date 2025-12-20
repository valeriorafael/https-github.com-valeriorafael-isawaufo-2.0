import React, { useState, useCallback, useEffect } from 'react';
import { User, Sighting } from './types.ts';
import SidebarModule from './components/Sidebar.tsx';
import MobileNavModule from './components/MobileNav.tsx';
import MapComponentModule from './components/MapComponent.tsx';
import SightingDetailModule from './components/SightingDetail.tsx';
import SightingFormModule from './components/SightingForm.tsx';
import AuthModalModule from './components/AuthModal.tsx';

const Sidebar = (SidebarModule as any).default || SidebarModule;
const MobileNav = (MobileNavModule as any).default || MobileNavModule;
const MapComponent = (MapComponentModule as any).default || MapComponentModule;
const SightingDetail = (SightingDetailModule as any).default || SightingDetailModule;
const SightingForm = (SightingFormModule as any).default || SightingFormModule;
const AuthModal = (AuthModalModule as any).default || AuthModalModule;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ufo_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('ufo_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  
  const [sightings, setSightings] = useState<Sighting[]>(() => {
    try {
      const saved = localStorage.getItem('ufo_sightings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [showModal, setShowModal] = useState(false);
  const [newCoords, setNewCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [isTargetingMode, setIsTargetingMode] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('ufo_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleLogin = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem('ufo_user', JSON.stringify(newUser));
  }, []);

  const handleLogout = useCallback(() => {
    setSelectedSighting(null);
    setShowModal(false);
    setNewCoords(null);
    setIsTargetingMode(false);
    setUser(null);
    localStorage.removeItem('ufo_user');
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setNewCoords({ lat, lng });
    setShowModal(true);
  }, []);

  const handleSightingSelect = useCallback((sighting: Sighting) => {
    setSelectedSighting(sighting);
  }, []);

  const handleSaveSighting = useCallback((data: Partial<Sighting>) => {
    if (!user || !newCoords) return;

    const sighting: Sighting = {
      id: Date.now().toString(),
      userId: String(user.id),
      username: String(user.username),
      title: String(data.title || 'Unknown Observation'),
      description: String(data.description || 'No details provided.'),
      lat: Number(newCoords.lat),
      lng: Number(newCoords.lng),
      timestamp: Date.now(),
      createdAt: Date.now(),
      ratings: [],
      mediaType: data.mediaType || 'image',
      mediaUrl: String(data.mediaUrl || 'https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?q=80&w=800&auto=format&fit=crop')
    };

    setSightings(prev => {
      const updated = [...prev, sighting];
      localStorage.setItem('ufo_sightings', JSON.stringify(updated));
      return updated;
    });
    
    setShowModal(false);
    setNewCoords(null);
    setIsTargetingMode(false);
  }, [user, newCoords]);

  const handleRate = useCallback((sightingId: string, score: number) => {
    if (!user) return;
    setSightings(prev => {
      const updated = prev.map(s => {
        if (s.id !== sightingId) return s;
        const filteredRatings = s.ratings.filter(r => r.userId !== user.id);
        const newRatings = [...filteredRatings, { userId: user.id, score }];
        return { ...s, ratings: newRatings };
      });
      localStorage.setItem('ufo_sightings', JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 pt-safe pb-safe">
        <AuthModal onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-mono transition-colors duration-300">
      <div className="hidden md:flex">
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          onTargetToggle={() => setIsTargetingMode(prev => !prev)}
          isTargeting={isTargetingMode}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
      </div>

      <main className="flex-1 relative overflow-hidden">
        <MapComponent 
          sightings={sightings} 
          onSightingSelect={handleSightingSelect} 
          onMapClick={handleMapClick} 
          theme={theme}
        />
        
        <div className="absolute top-safe right-4 z-[1000] flex flex-col items-end pointer-events-none mt-4">
          <div className="bg-[var(--bg-secondary)]/80 backdrop-blur border border-[var(--text-primary)]/20 px-3 py-1.5 rounded-full text-[9px] uppercase shadow-lg">
            <span className="opacity-60">Status: </span>
            <span className="text-[var(--text-primary)] animate-pulse">Live</span>
          </div>
        </div>

        {isTargetingMode && (
          <div className="absolute inset-0 pointer-events-none border-4 border-red-500/20 animate-pulse z-[500]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-red-500/30 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            </div>
          </div>
        )}
      </main>

      <div className="md:hidden">
        <MobileNav 
          user={user}
          onLogout={handleLogout}
          onTargetToggle={() => setIsTargetingMode(prev => !prev)}
          isTargeting={isTargetingMode}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
      </div>

      {showModal && (
        <SightingForm 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveSighting}
          defaultTitle={isTargetingMode ? "ANOMALY_TRACKED" : ""}
        />
      )}

      {selectedSighting && (
        <SightingDetail 
          sighting={selectedSighting} 
          onClose={() => setSelectedSighting(null)} 
          onRate={handleRate}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default App;