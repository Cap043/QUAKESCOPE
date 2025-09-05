import React from 'react';
import { CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Earthquake } from '../lib/types';
import { getMagnitudeMarkerOptions, getMagnitudeColor } from '../lib/colors';
import { 
    formatFullDate, 
    formatDepth, 
    formatMagnitude,
    formatCoordinates,
    formatMagnitudeDescription,
    formatTimeAgo
} from '../lib/format';

interface QuakeMarkersProps {
    quakes: Earthquake[];
    hoveredQuakeId: string | null;
    selectedQuakeId: string | null;
    isDarkMode: boolean;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
}

export const QuakeMarkers: React.FC<QuakeMarkersProps> = ({
    quakes,
    hoveredQuakeId,
    selectedQuakeId,
    isDarkMode,
    onQuakeSelect,
    onQuakeHover
}) => {
    const getDynamicMarkerOptions = (quake: Earthquake) => {
        const baseOptions = getMagnitudeMarkerOptions(quake.mag, isDarkMode);
        const isHovered = quake.id === hoveredQuakeId;
        const isSelected = quake.id === selectedQuakeId;
        
        if (isHovered || isSelected) {
            return {
                ...baseOptions,
                weight: baseOptions.weight + 2,
                opacity: 1,
                fillOpacity: 0.75,
                radius: baseOptions.radius + 3,
            };
        }
        return baseOptions;
    };

    const renderCompactPopupContent = (quake: Earthquake) => {
        const magnitude = formatMagnitude(quake.mag);
        const magnitudeClass = getMagnitudeColor(quake.mag).split(' ')[0];
        const coordinates = formatCoordinates(quake.lat, quake.lon);
        const magnitudeDescription = formatMagnitudeDescription(quake.mag);
        const timeAgo = formatTimeAgo(quake.time);
        
        return (
            <div className="font-sans p-2">
                {/* Compact Header with Magnitude */}
                <div className="text-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl border-3 ${getMagnitudeColor(quake.mag)} mb-1`}>
                        {magnitude}
                    </div>
                    <h3 className={`text-base font-bold ${magnitudeClass} mb-1`}>
                        {quake.mag !== null ? `${magnitude} Magnitude` : 'Magnitude N/A'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        {magnitudeDescription} • {timeAgo}
                    </p>
                </div>

                {/* Compact Location */}
                <div className="mb-2">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {quake.place || 'Unknown location'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {coordinates}
                    </p>
                </div>

                {/* Compact Details */}
                <div className="mb-2 text-xs">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Depth:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {formatDepth(quake.depthKm)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Time:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {formatFullDate(quake.time)}
                        </span>
                    </div>
                </div>

                {/* USGS Link */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <a 
                        href={quake.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-black bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 rounded transition-colors usgs-button"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        USGS
                    </a>
                </div>
            </div>
        );
    };

    return (
        <>
            {quakes.map(quake => {
                const isSelected = quake.id === selectedQuakeId;
                
                // If selected, show a special icon marker
                if (isSelected) {
                    const icon = L.divIcon({
                        className: 'selected-quake-marker',
                        html: `
                            <div class="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse">
                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                                </svg>
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    return (
                        <Marker
                            key={quake.id}
                            position={[quake.lat, quake.lon]}
                            icon={icon}
                            eventHandlers={{
                                click: () => onQuakeSelect(quake.id, [quake.lat, quake.lon]),
                                mouseover: () => onQuakeHover(quake.id),
                                mouseout: () => onQuakeHover(null),
                            }}
                        >
                            <Popup 
                                minWidth={200} 
                                maxWidth={250}
                                closeButton={false}
                                autoClose={false}
                                className="professional-popup"
                            >
                                {renderCompactPopupContent(quake)}
                            </Popup>
                        </Marker>
                    );
                }

                // Regular circle marker for non-selected quakes
                const markerOptions = getDynamicMarkerOptions(quake);
                return (
                    <CircleMarker
                        key={quake.id}
                        center={[quake.lat, quake.lon]}
                        radius={markerOptions.radius}
                        pathOptions={markerOptions}
                        eventHandlers={{
                            click: () => onQuakeSelect(quake.id, [quake.lat, quake.lon]),
                            mouseover: () => onQuakeHover(quake.id),
                            mouseout: () => onQuakeHover(null),
                        }}
                    >
                        <Popup 
                            minWidth={200} 
                            maxWidth={250}
                            closeButton={false}
                            autoClose={false}
                            className="professional-popup"
                        >
                            {renderCompactPopupContent(quake)}
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
};
