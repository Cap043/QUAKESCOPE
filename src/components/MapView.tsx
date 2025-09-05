import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { QuakeMarkers } from './QuakeMarkers';
import { Legend } from './Legend';
import { MapControls } from './MapControls';
import { MapThemeSelector } from './MapThemeSelector';
import { WorldWrapHandler } from './WorldWrapHandler';
import { MapIcon } from './Icons';
import { Earthquake } from '../lib/types';

export interface MapTheme {
    id: string;
    name: string;
    url: string;
    attribution: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

interface MapViewProps {
    quakes: Earthquake[];
    hoveredQuakeId: string | null;
    selectedQuakeId: string | null;
    mapFlyToCoords: [number, number] | null;
    isDarkMode: boolean;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
}

// Component to handle map fly-to functionality
const FlyToMarker: React.FC<{ position: [number, number] | null; zoom: number }> = ({ position, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
        if (position && map) {
            try {
                map.flyTo(position, zoom, {
                    animate: true,
                    duration: 1.5
                });
            } catch (error) {
                console.warn('Map flyTo failed:', error);
            }
        }
    }, [position, zoom, map]);
    
    return null;
};

export const MapView: React.FC<MapViewProps> = ({
    quakes,
    hoveredQuakeId,
    selectedQuakeId,
    mapFlyToCoords,
    isDarkMode,
    onQuakeSelect,
    onQuakeHover
}) => {
    const [currentTheme, setCurrentTheme] = useState<MapTheme>({
        id: 'streets',
        name: 'Streets',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        icon: MapIcon,
        description: 'Standard street map with roads and labels'
    });

    // Detect mobile screen size
    const [isMobile, setIsMobile] = useState(false);
    const [manualThemeChange, setManualThemeChange] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-switch to dark theme when overall theme is dark (only if no manual theme change)
    useEffect(() => {
        if (!manualThemeChange) {
            if (isDarkMode && currentTheme.id !== 'dark') {
                setCurrentTheme({
                    id: 'dark',
                    name: 'Dark',
                    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                    attribution: '© CARTO',
                    icon: MapIcon,
                    description: 'Dark theme for low-light environments'
                });
            } else if (!isDarkMode && currentTheme.id === 'dark') {
                setCurrentTheme({
                    id: 'streets',
                    name: 'Streets',
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '© OpenStreetMap contributors',
                    icon: MapIcon,
                    description: 'Standard street map with roads and labels'
                });
            }
        }
    }, [isDarkMode, currentTheme.id, manualThemeChange]);

    useEffect(() => {
        // Dynamically add Leaflet's CSS to the document head
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        
        // Check if the link already exists to avoid duplicates
        if (!document.querySelector('link[href*="leaflet"]')) {
            document.head.appendChild(link);
        }

        // Cleanup function to remove the link when the component unmounts
        return () => {
            const existingLink = document.querySelector('link[href*="leaflet"]');
            if (existingLink) {
                document.head.removeChild(existingLink);
            }
        };
    }, []);

    const handleThemeChange = (theme: MapTheme) => {
        setCurrentTheme(theme);
        setManualThemeChange(true);
    };

    return (
        <div className="relative h-full w-full">
                                       <MapContainer
                        center={[20, 0]}
                        zoom={isMobile ? 1 : 2}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}
                        minZoom={isMobile ? 1 : 2}
                        maxZoom={18}
                        key={`map-container-${currentTheme.id}-${isMobile ? 'mobile' : 'desktop'}`}
                        zoomControl={false}
                        doubleClickZoom={true}
                        trackResize={true}
                        worldCopyJump={true}
                    >
            <TileLayer
                attribution={currentTheme.attribution}
                url={currentTheme.url}
                keepBuffer={4}
                maxZoom={18}
                minZoom={2}
            />
            
            <WorldWrapHandler />
            
            <QuakeMarkers
                quakes={quakes}
                hoveredQuakeId={hoveredQuakeId}
                selectedQuakeId={selectedQuakeId}
                isDarkMode={isDarkMode}
                onQuakeSelect={onQuakeSelect}
                onQuakeHover={onQuakeHover}
            />
            
            <FlyToMarker position={mapFlyToCoords} zoom={isMobile ? 8 : 10} />
            <Legend />
            <MapControls isDarkMode={isDarkMode} />
            </MapContainer>
            
            {/* Theme Selector positioned absolutely over the map */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000]">
                <MapThemeSelector
                    isDarkMode={isDarkMode}
                    onThemeChange={handleThemeChange}
                    currentTheme={currentTheme}
                />
            </div>
        </div>
    );
};
