import React from 'react';
import { ProfessionalQuakeMarker } from './ProfessionalQuakeMarker';
import { Earthquake } from '../lib/types';

interface ProfessionalQuakeMarkersProps {
    quakes: Earthquake[];
    hoveredQuakeId: string | null;
    selectedQuakeId: string | null;
    onQuakeSelect: (quakeId: string, coords: [number, number]) => void;
    onQuakeHover: (quakeId: string | null) => void;
}

export const ProfessionalQuakeMarkers: React.FC<ProfessionalQuakeMarkersProps> = ({
    quakes,
    hoveredQuakeId,
    selectedQuakeId,
    onQuakeSelect,
    onQuakeHover
}) => {
    return (
        <>
            {quakes.map(quake => (
                <ProfessionalQuakeMarker
                    key={quake.id}
                    quake={quake}
                    isHovered={quake.id === hoveredQuakeId}
                    isSelected={quake.id === selectedQuakeId}
                    onQuakeSelect={onQuakeSelect}
                    onQuakeHover={onQuakeHover}
                />
            ))}
        </>
    );
};
