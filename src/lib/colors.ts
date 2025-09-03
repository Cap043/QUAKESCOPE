export const getMagnitudeColor = (mag: number | null): string => {
    if (mag === null || mag === undefined) return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    if (mag < 2.5) return 'text-green-500 bg-green-500/10 border-green-500/30'; // Minor
    if (mag < 4.5) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'; // Light
    if (mag < 6.0) return 'text-orange-500 bg-orange-500/10 border-orange-500/30'; // Moderate
    return 'text-red-500 bg-red-500/10 border-red-500/30'; // Strong
};

export const getMagnitudeMarkerOptions = (mag: number | null) => {
    let color: string, weight: number, opacity: number;
    const magnitude = mag || 0;
    
    if (magnitude < 2.5) { 
        color = '#22c55e'; 
        weight = 1; 
        opacity = 0.6; 
    } else if (magnitude < 4.5) { 
        color = '#eab308'; 
        weight = 1; 
        opacity = 0.7; 
    } else if (magnitude < 6.0) { 
        color = '#f97316'; 
        weight = 2; 
        opacity = 0.8; 
    } else { 
        color = '#ef4444'; 
        weight = 2; 
        opacity = 0.9; 
    }

    return {
        radius: 2 + Math.pow(magnitude, 1.5),
        fillColor: color,
        color: color,
        weight: weight,
        opacity: opacity,
        fillOpacity: 0.5
    };
};
