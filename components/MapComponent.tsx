import React, { useEffect, useRef } from 'react';
import { Sighting } from '../types.ts';
import L from 'leaflet';

interface MapComponentProps {
  sightings: Sighting[];
  onSightingSelect: (sighting: Sighting) => void;
  onMapClick: (lat: number, lng: number) => void;
  theme: 'light' | 'dark';
}

const MapComponent: React.FC<MapComponentProps> = ({ sightings, onSightingSelect, onMapClick, theme }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  
  const onMapClickRef = useRef(onMapClick);
  const onSightingSelectRef = useRef(onSightingSelect);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onSightingSelectRef.current = onSightingSelect;
  }, [onMapClick, onSightingSelect]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 3,
      zoomControl: false,
      attributionControl: false
    });

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 20 }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualizar tiles quando o tema mudar
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileLayerRef.current.setUrl(tileUrl);
  }, [theme]);

  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    sightings.forEach(sighting => {
      const avg = sighting.ratings.length > 0 
        ? sighting.ratings.reduce((acc, r) => acc + r.score, 0) / sighting.ratings.length 
        : 0;

      const color = avg === 0 ? (theme === 'dark' ? '#3b82f6' : '#2563eb') : (avg <= 1.5 ? '#ef4444' : (theme === 'dark' ? '#22c55e' : '#16a34a'));
      const isDanger = avg > 0 && avg <= 1.5;

      const icon = L.divIcon({
        className: 'ufo-marker',
        html: `<div style="width: 28px; height: 28px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color}66; display: flex; align-items: center; justify-content: center; font-size: 14px; animation: ${isDanger ? 'pulse-red 2s infinite' : 'none'};">🛸</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([sighting.lat, sighting.lng], { icon })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSightingSelectRef.current(sighting);
        })
        .addTo(markersRef.current!);
    });
  }, [sightings, theme]);

  return <div ref={mapContainerRef} className="z-0 h-full w-full absolute inset-0 bg-[var(--bg-primary)] transition-colors duration-300" />;
};

export default MapComponent;