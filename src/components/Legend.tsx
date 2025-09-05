import React, { useState, useEffect, useRef } from 'react';

export const Legend: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTouchRef = useRef<number>(Date.now());

    // Auto-hide after 5 seconds of inactivity
    useEffect(() => {
        const handleTouch = () => {
            lastTouchRef.current = Date.now();
            setIsVisible(true);
            setOpacity(1);
            
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            // Set new timeout
            timeoutRef.current = setTimeout(() => {
                setOpacity(0.3);
            }, 5000);
        };

        // Add touch event listeners
        document.addEventListener('touchstart', handleTouch);
        document.addEventListener('touchmove', handleTouch);
        document.addEventListener('touchend', handleTouch);

        // Initial timeout
        timeoutRef.current = setTimeout(() => {
            setOpacity(0.3);
        }, 5000);

        return () => {
            document.removeEventListener('touchstart', handleTouch);
            document.removeEventListener('touchmove', handleTouch);
            document.removeEventListener('touchend', handleTouch);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div 
            className={`absolute bottom-20 sm:bottom-4 left-4 z-[9999] p-2 sm:p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-opacity duration-500 ${
                opacity === 0.3 ? 'hover:opacity-100' : ''
            }`}
            style={{ opacity }}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    setOpacity(0.3);
                }, 5000);
            }}
        >
            <h4 className="font-bold text-xs sm:text-sm mb-1 sm:mb-2 text-slate-800 dark:text-slate-200">Magnitude</h4>
            <div className="space-y-0.5 sm:space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs">≥ 6.0</span>
                    <span className="hidden sm:inline text-xs">(Strong)</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs">4.5 - 5.9</span>
                    <span className="hidden sm:inline text-xs">(Moderate)</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">2.5 - 4.4</span>
                    <span className="hidden sm:inline text-xs">(Light)</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">&lt; 2.5</span>
                    <span className="hidden sm:inline text-xs">(Minor)</span>
                </div>
            </div>
        </div>
    );
};
