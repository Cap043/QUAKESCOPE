export const formatRelativeTime = (timestamp: number): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp) / 1000);
    
    if (isNaN(seconds)) return 'Just now';
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
};

export const formatFullDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

export const formatMagnitude = (mag: number | null): string => {
    if (mag === null || mag === undefined) return 'N/A';
    return mag.toFixed(1);
};

export const formatDepth = (depthKm: number): string => {
    return `${depthKm.toFixed(1)} km`;
};

export const formatCoordinates = (lat: number, lon: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    const latAbs = Math.abs(lat);
    const lonAbs = Math.abs(lon);
    
    return `${latAbs.toFixed(4)}°${latDir}, ${lonAbs.toFixed(4)}°${lonDir}`;
};

export const formatMagnitudeDescription = (mag: number | null): string => {
    if (mag === null || mag === undefined) return 'Unknown';
    if (mag < 2.5) return 'Minor Earthquake';
    if (mag < 4.5) return 'Light Earthquake';
    if (mag < 6.0) return 'Moderate Earthquake';
    if (mag < 7.0) return 'Strong Earthquake';
    if (mag < 8.0) return 'Major Earthquake';
    return 'Great Earthquake';
};

export const formatTimeAgo = (timestamp: number): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 30) return `${seconds} seconds ago`;
    return 'Just now';
};
