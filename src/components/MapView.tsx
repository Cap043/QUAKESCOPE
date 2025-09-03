import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { QuakeMarkers } from './QuakeMarkers';
import { Legend } from './Legend';
import { MapControls } from './MapControls';
import { MapThemeSelector } from './MapThemeSelector';
import { WorldWrapHandler } from './WorldWrapHandler';
import { MapBoundsHandler } from './MapBoundsHandler';
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
        icon: () => <div />, // Placeholder
        description: 'Standard street map with roads and labels'
    });

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
    };

    return (
        <div className="relative h-full w-full">
                    <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}
            minZoom={2}
            maxZoom={18}
            key={`map-container-${currentTheme.id}`}
            zoomControl={false}
            doubleClickZoom={true}
            trackResize={true}
            updateWhenZooming={false}
            updateWhenIdle={true}
            worldCopyJump={true}
            noWrap={false}
            maxBounds={undefined}
            maxBoundsViscosity={0}
            dragging={true}
            touchZoom={true}
            boxZoom={false}
            keyboard={false}
            className="map-container-fixed"
        >
            <TileLayer
                attribution={currentTheme.attribution}
                url={currentTheme.url}
                updateWhenZooming={false}
                updateWhenIdle={true}
                keepBuffer={4}
                maxZoom={18}
                minZoom={2}
                noWrap={false}
                bounds={undefined}
            />
            
            <WorldWrapHandler />
            <MapBoundsHandler />
            
            <QuakeMarkers
                quakes={quakes}
                hoveredQuakeId={hoveredQuakeId}
                selectedQuakeId={selectedQuakeId}
                onQuakeSelect={onQuakeSelect}
                onQuakeHover={onQuakeHover}
            />
            
            <FlyToMarker position={mapFlyToCoords} zoom={6} />
            <Legend />
            <MapControls isDarkMode={isDarkMode} />
            </MapContainer>
            
            {/* Theme Selector positioned absolutely over the map */}
            <div className="absolute top-4 left-4 z-[1000] sm:top-4 sm:left-4">
                <MapThemeSelector
                    isDarkMode={isDarkMode}
                    onThemeChange={handleThemeChange}
                    currentTheme={currentTheme}
                />
            </div>
        </div>
    );
};
