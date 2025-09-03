import React, { useRef, useEffect } from 'react';
import { Earthquake } from '../lib/types';
import { getMagnitudeColor } from '../lib/colors';
import { formatRelativeTime, formatDepth } from '../lib/format';

interface QuakeListProps {
    quakes: Earthquake[] | null;
    selectedQuakeId: string | null;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
    className?: string;
}

export const QuakeList: React.FC<QuakeListProps> = ({
    quakes,
    selectedQuakeId,
    onQuakeSelect,
    onQuakeHover,
    className = ''
}) => {
    const listRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (selectedQuakeId && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selectedQuakeId]);

    if (!quakes || quakes.length === 0) {
        return (
            <div className={`p-8 text-center text-slate-500 dark:text-slate-400 ${className}`}>
                <p className="font-semibold">No Earthquakes Found</p>
                <p className="text-sm mt-1">Try lowering the minimum magnitude or expanding the time range.</p>
            </div>
        );
    }

    return (
        <div 
            ref={listRef} 
            className={`h-full overflow-y-auto bg-slate-50 dark:bg-slate-900/50 ${className}`} 
            onMouseLeave={() => onQuakeHover(null)}
        >
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {quakes.map(quake => {
                    const isSelected = quake.id === selectedQuakeId;
                    return (
                        <li
                            key={quake.id}
                            ref={isSelected ? selectedItemRef : null}
                            onClick={() => onQuakeSelect(quake.id, [quake.lat, quake.lon])}
                            onMouseEnter={() => onQuakeHover(quake.id)}
                            className={`p-4 cursor-pointer transition-colors duration-300 ${
                                isSelected 
                                    ? 'bg-sky-100 dark:bg-sky-900/50' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg border-2 ${getMagnitudeColor(quake.mag)}`}>
                                    {quake.mag !== null ? quake.mag.toFixed(1) : 'N/A'}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {quake.place || 'Unknown location'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {formatRelativeTime(quake.time)} &middot; {formatDepth(quake.depthKm)} depth
                                    </p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
