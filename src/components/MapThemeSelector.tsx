import React, { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MapIcon, Satellite, Mountain, Car, Palette } from './Icons';

interface MapTheme {
    id: string;
    name: string;
    url: string;
    attribution: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const MAP_THEMES: MapTheme[] = [
    {
        id: 'streets',
        name: 'Streets',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        icon: MapIcon,
        description: 'Standard street map with roads and labels'
    },
    {
        id: 'satellite',
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        icon: Satellite,
        description: 'High-resolution satellite imagery'
    },
    {
        id: 'terrain',
        name: 'Terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap contributors',
        icon: Mountain,
        description: 'Topographic map with elevation contours'
    },
    {
        id: 'dark',
        name: 'Dark',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© CARTO',
        icon: Palette,
        description: 'Dark theme for low-light environments'
    },
    {
        id: 'traffic',
        name: 'Traffic',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        icon: Car,
        description: 'Street map optimized for navigation'
    },
    {
        id: 'hybrid',
        name: 'Hybrid',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
        icon: MapIcon,
        description: 'Street map with satellite overlay'
    }
];

interface MapThemeSelectorProps {
    isDarkMode: boolean;
    onThemeChange: (theme: MapTheme) => void;
    currentTheme: MapTheme;
}

export const MapThemeSelector: React.FC<MapThemeSelectorProps> = ({
    isDarkMode,
    onThemeChange,
    currentTheme
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleThemeSelect = (theme: MapTheme) => {
        onThemeChange(theme);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 text-sm font-medium text-slate-700 dark:text-slate-300 touch-manipulation"
                title="Select Map Theme"
            >
                {currentTheme.icon ? (
                    <currentTheme.icon className="w-4 h-4" />
                ) : (
                    <MapIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{currentTheme.name || 'Select Theme'}</span>
                <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:right-0 top-12 w-72 sm:w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[9999] max-h-[70vh] overflow-y-auto touch-manipulation">
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Map Theme</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose your preferred map style</p>
                    </div>
                    
                    <div className="max-h-56 overflow-y-auto">
                        {MAP_THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeSelect(theme)}
                                className={`w-full text-left px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors touch-manipulation ${
                                    currentTheme.id === theme.id 
                                        ? 'bg-sky-50 dark:bg-sky-900/50 border-r-2 border-sky-500' 
                                        : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        currentTheme.id === theme.id 
                                            ? 'bg-sky-100 dark:bg-sky-800 text-sky-600 dark:text-sky-400' 
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}>
                                        <theme.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium text-sm ${
                                                currentTheme.id === theme.id 
                                                    ? 'text-sky-700 dark:text-sky-300' 
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {theme.name}
                                            </span>
                                            {currentTheme.id === theme.id && (
                                                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                            {theme.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
