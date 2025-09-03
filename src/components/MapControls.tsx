import React, { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Settings, ZoomIn, ZoomOut, MousePointer, Ruler } from './Icons';

interface MapControlsProps {
    isDarkMode: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({ isDarkMode }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrollWheelZoom, setScrollWheelZoom] = useState(true);
    const [showScale, setShowScale] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const map = useMap();

    // Sync scroll wheel zoom state with map on mount
    useEffect(() => {
        setScrollWheelZoom(map.scrollWheelZoom.enabled());
    }, [map]);

    // Toggle scale control
    const toggleScale = () => {
        const newValue = !showScale;
        setShowScale(newValue);
        if (newValue) {
            // Add scale control
            const scaleControl = L.control.scale({
                position: 'bottomleft',
                maxWidth: 100,
                metric: true,
                imperial: true,
                updateWhenIdle: false
            });
            map.addControl(scaleControl);
        } else {
            // Remove scale control
            const scaleControl = document.querySelector('.leaflet-control-scale');
            if (scaleControl) {
                scaleControl.remove();
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleScrollWheelZoom = () => {
        const newValue = !scrollWheelZoom;
        setScrollWheelZoom(newValue);
        if (newValue) {
            map.scrollWheelZoom.enable();
        } else {
            map.scrollWheelZoom.disable();
        }
        // Always keep touch/pinch zoom enabled
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
    };

    const zoomIn = () => {
        map.zoomIn();
    };

    const zoomOut = () => {
        map.zoomOut();
    };

    const resetView = () => {
        map.setView([20, 0], 2);
    };

    return (
        <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="flex flex-col gap-1">
                <button
                    onClick={zoomIn}
                    className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                    onClick={zoomOut}
                    className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
            </div>

            {/* Settings Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                    title="Map Settings"
                >
                    <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2">
                        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Map Controls</h3>
                        </div>
                        
                        <div className="px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MousePointer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Scroll to Zoom</span>
                                </div>
                                <button
                                    onClick={toggleScrollWheelZoom}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                                        scrollWheelZoom 
                                            ? 'bg-sky-600' 
                                            : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            scrollWheelZoom ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Scale Toggle */}
                        <div className="px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Show Scale</span>
                                </div>
                                <button
                                    onClick={toggleScale}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                                        showScale 
                                            ? 'bg-sky-600' 
                                            : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            showScale ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={resetView}
                                className="w-full text-left text-sm text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                            >
                                Reset View
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
