import React from 'react';

export const Loading: React.FC = () => (
    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500 mx-auto"></div>
            <p className="mt-4 text-slate-700 dark:text-slate-300 font-semibold">Fetching latest earthquake data...</p>
        </div>
    </div>
);

export const LoadingMap: React.FC = () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500 mx-auto"></div>
            <p className="mt-4 text-slate-700 dark:text-slate-300 font-semibold">Loading map...</p>
        </div>
    </div>
);
