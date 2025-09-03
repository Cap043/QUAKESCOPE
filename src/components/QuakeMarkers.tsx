import React from 'react';
import { CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Earthquake } from '../lib/types';
import { getMagnitudeMarkerOptions, getMagnitudeColor } from '../lib/colors';
import { formatFullDate, formatDepth } from '../lib/format';

interface QuakeMarkersProps {
    quakes: Earthquake[];
    hoveredQuakeId: string | null;
    selectedQuakeId: string | null;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
}

export const QuakeMarkers: React.FC<QuakeMarkersProps> = ({
    quakes,
    hoveredQuakeId,
    selectedQuakeId,
    onQuakeSelect,
    onQuakeHover
}) => {
    const getDynamicMarkerOptions = (quake: Earthquake) => {
        const baseOptions = getMagnitudeMarkerOptions(quake.mag);
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
                            <Popup minWidth={200}>
                                <div className="font-sans">
                                    <h3 className={`text-lg font-bold mb-1 ${getMagnitudeColor(quake.mag).split(' ')[0]}`}>
                                        {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'} Magnitude
                                    </h3>
                                    <p className="text-sm font-semibold text-slate-500 mt-2">
                                        {formatFullDate(quake.time)}<br/>
                                        {formatDepth(quake.depthKm)} depth
                                    </p>
                                    <a 
                                        href={quake.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs text-sky-600 hover:underline mt-2 block"
                                    >
                                        View on USGS &rarr;
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }

                // Regular circle marker for non-selected quakes
                return (
                    <CircleMarker
                        key={quake.id}
                        center={[quake.lat, quake.lon]}
                        pathOptions={getDynamicMarkerOptions(quake)}
                        eventHandlers={{
                            click: () => onQuakeSelect(quake.id, [quake.lat, quake.lon]),
                            mouseover: () => onQuakeHover(quake.id),
                            mouseout: () => onQuakeHover(null),
                        }}
                    >
                        <Popup minWidth={200}>
                            <div className="font-sans">
                                <h3 className={`text-lg font-bold mb-1 ${getMagnitudeColor(quake.mag).split(' ')[0]}`}>
                                    {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'} Magnitude
                                </h3>
                                <p className="text-sm font-semibold text-slate-800">
                                    {quake.place || 'Unknown location'}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">
                                    {formatFullDate(quake.time)}<br/>
                                    {formatDepth(quake.depthKm)} depth
                                </p>
                                <a 
                                    href={quake.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-sky-600 hover:underline mt-2 block"
                                >
                                    View on USGS &rarr;
                                </a>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
};
