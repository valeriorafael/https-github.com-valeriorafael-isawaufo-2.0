
import React, { useState, useEffect } from 'react';
import { Sighting } from '../types';

interface SightingFormProps {
  onClose: () => void;
  onSave: (data: Partial<Sighting>) => void;
  defaultTitle?: string;
}

const SightingForm: React.FC<SightingFormProps> = ({ onClose, onSave, defaultTitle }) => {
  const [title, setTitle] = useState(defaultTitle || '');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (defaultTitle) setTitle(defaultTitle);
  }, [defaultTitle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, mediaType, mediaUrl: previewUrl });
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[4000] flex items-end md:items-center justify-center">
      <div className="bg-[#0e0e11] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="font-orbitron text-sm md:text-xl font-bold text-green-500 uppercase tracking-tighter">
              {defaultTitle ? 'BUILD STATUS REPORT' : 'New Contact Entry'}
            </h2>
            <p className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">Transmission: ENCRYPTED</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Descriptor</label>
            <input 
              required
              type="text" 
              placeholder="Identification tag..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-green-400 focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Observations</label>
            <textarea 
              required
              rows={3}
              placeholder="Visual confirmation details..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Evidence Data</label>
            <input 
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-green-600/20 file:text-green-500 file:font-bold cursor-pointer"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-orbitron font-bold rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            TRANSMIT DATA
          </button>
        </form>
      </div>
    </div>
  );
};

export default SightingForm;
