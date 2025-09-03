import React from 'react';
import { AlertTriangleIcon } from './Icons';

interface ErrorStateProps {
    onRetry: () => void;
    error: Error | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, error }) => (
    <div className="absolute inset-0 bg-red-50 dark:bg-red-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
            <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Couldn't Fetch Data</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {error?.message || 'There was a problem contacting the USGS server. Please check your connection.'}
            </p>
            <div className="mt-6 flex gap-4 justify-center">
                <a 
                    href="https://earthquake.usgs.gov/data/comcat/data-event-sourcing.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    USGS Status
                </a>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                >
                    Retry
                </button>
            </div>
        </div>
    </div>
);
