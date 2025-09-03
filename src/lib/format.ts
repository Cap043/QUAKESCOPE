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
