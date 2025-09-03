import React, { useState, useEffect } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { Earthquake } from '../lib/types';
import { formatFullDate, formatDepth } from '../lib/format';

interface ProfessionalQuakeMarkerProps {
    quake: Earthquake;
    isHovered: boolean;
    isSelected: boolean;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
}

export const ProfessionalQuakeMarker: React.FC<ProfessionalQuakeMarkerProps> = ({
    quake,
    isHovered,
    isSelected,
    onQuakeSelect,
    onQuakeHover
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Get magnitude-based styling
    const getMarkerStyle = () => {
        const magnitude = quake.mag || 0;
        let color, weight, opacity, fillOpacity, radius;

        if (magnitude < 2.5) {
            color = '#10b981'; // Green
            weight = 2;
            opacity = 0.8;
            fillOpacity = 0.6;
            radius = 4 + Math.pow(magnitude, 1.2);
        } else if (magnitude < 4.5) {
            color = '#f59e0b'; // Yellow
            weight = 3;
            opacity = 0.9;
            fillOpacity = 0.7;
            radius = 6 + Math.pow(magnitude, 1.3);
        } else if (magnitude < 6.0) {
            color = '#f97316'; // Orange
            weight = 4;
            opacity = 1.0;
            fillOpacity = 0.8;
            radius = 8 + Math.pow(magnitude, 1.4);
        } else {
            color = '#ef4444'; // Red
            weight = 5;
            opacity = 1.0;
            fillOpacity = 0.9;
            radius = 10 + Math.pow(magnitude, 1.5);
        }

        // Enhanced styling for hover and selection states
        if (isHovered || isSelected) {
            weight += 2;
            opacity = 1.0;
            fillOpacity = 0.9;
            radius += 2;
        }

        return {
            radius,
            fillColor: color,
            color: color,
            weight,
            opacity,
            fillOpacity,
            className: 'professional-marker'
        };
    };

    // Get magnitude color for text
    const getMagnitudeColor = () => {
        const magnitude = quake.mag || 0;
        if (magnitude < 2.5) return 'text-emerald-600 dark:text-emerald-400';
        if (magnitude < 4.5) return 'text-amber-600 dark:text-amber-400';
        if (magnitude < 6.0) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-500';
    };

    // Get magnitude label
    const getMagnitudeLabel = () => {
        const magnitude = quake.mag || 0;
        if (magnitude < 2.5) return 'Minor';
        if (magnitude < 4.5) return 'Light';
        if (magnitude < 6.0) return 'Moderate';
        return 'Strong';
    };

    // Animation effect on hover/selection
    useEffect(() => {
        if (isHovered || isSelected) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isHovered, isSelected]);

    const markerStyle = getMarkerStyle();

    return (
        <CircleMarker
            center={[quake.lat, quake.lon]}
            pathOptions={markerStyle}
            eventHandlers={{
                click: () => onQuakeSelect(quake.id, [quake.lat, quake.lon]),
                mouseover: () => onQuakeHover(quake.id),
                mouseout: () => onQuakeHover(null),
            }}
        >
            <Popup 
                minWidth={280}
                maxWidth={320}
                className="professional-popup"
                closeButton={true}
                autoPan={true}
                autoPanPadding={[50, 50]}
            >
                <div className="font-sans p-1">
                    {/* Header with magnitude and classification */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-2xl font-bold ${getMagnitudeColor()}`}>
                                    {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'}
                                </span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Magnitude
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    quake.mag && quake.mag < 2.5 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                    quake.mag && quake.mag < 4.5 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                    quake.mag && quake.mag < 6.0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                    {getMagnitudeLabel()}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatDepth(quake.depthKm)} depth
                                </span>
                            </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getMagnitudeColor().replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}`}></div>
                    </div>

                    {/* Location */}
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            Location
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {quake.place || 'Unknown location'}
                        </p>
                    </div>

                    {/* Time and coordinates */}
                    <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">Time:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {formatFullDate(quake.time)}
                            </p>
                        </div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-400">Coordinates:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-mono">
                                {quake.lat.toFixed(4)}, {quake.lon.toFixed(4)}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <a 
                            href={quake.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 px-3 py-2 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors text-center"
                        >
                            View on USGS
                        </a>
                        <button
                            onClick={() => onQuakeSelect(quake.id, [quake.lat, quake.lon])}
                            className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Center Map
                        </button>
                    </div>
                </div>
            </Popup>
        </CircleMarker>
    );
};
