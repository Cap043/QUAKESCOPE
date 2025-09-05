import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

interface CitySearchProps {
    isDarkMode: boolean;
    isMobile?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onLocationSelect?: (lat: number, lon: number) => void;
}

interface SearchResult {
    name: string;
    lat: number;
    lon: number;
    displayName: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({ 
    isDarkMode, 
    isMobile = false, 
    isCollapsed = false, 
    onToggleCollapse,
    onLocationSelect
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Debounced search function
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&accept-language=en`
                );
                const data = await response.json();
                
                const searchResults: SearchResult[] = data.map((item: any) => ({
                    name: item.display_name,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    displayName: item.display_name.split(',').slice(0, 3).join(', ')
                }));
                
                setResults(searchResults);
                setShowResults(true);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showResults || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleResultClick(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowResults(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle result selection
    const handleResultClick = (result: SearchResult) => {
        if (onLocationSelect) {
            onLocationSelect(result.lat, result.lon);
        } else if ((window as any).__mapLocationSearch) {
            (window as any).__mapLocationSearch(result.lat, result.lon);
        }
        setQuery('');
        setResults([]);
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    // Handle input focus
    const handleFocus = () => {
        if (results.length > 0) {
            setShowResults(true);
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mobile collapsed view
    if (isMobile && isCollapsed) {
        return (
            <button
                onClick={onToggleCollapse}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title="Search for a city"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        );
    }

    // Mobile expanded view
    if (isMobile && !isCollapsed) {
        return (
            <div className="relative w-full" ref={resultsRef}>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            placeholder="Search for a city..."
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                isDarkMode 
                                    ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-sky-500' 
                                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-sky-500'
                            }`}
                        />
                        {isLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onToggleCollapse}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Results dropdown */}
                {showResults && results.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-[1000] max-h-60 overflow-y-auto ${
                        isDarkMode 
                            ? 'bg-slate-800 border-slate-600' 
                            : 'bg-white border-slate-300'
                    }`}>
                        {results.map((result, index) => (
                            <button
                                key={`${result.lat}-${result.lon}`}
                                onClick={() => handleResultClick(result)}
                                className={`w-full text-left px-3 py-2 text-sm border-b last:border-b-0 transition-colors ${
                                    index === selectedIndex
                                        ? isDarkMode 
                                            ? 'bg-slate-700 text-slate-200' 
                                            : 'bg-slate-100 text-slate-900'
                                        : isDarkMode 
                                            ? 'text-slate-200 hover:bg-slate-700 border-slate-600' 
                                            : 'text-slate-900 hover:bg-slate-100 border-slate-200'
                                }`}
                            >
                                {result.displayName}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Desktop view
    return (
        <div className="relative" ref={resultsRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder="Search for a city..."
                    className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        isDarkMode 
                            ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-sky-500' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-sky-500'
                    }`}
                />
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Results dropdown */}
            {showResults && results.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-[1000] max-h-60 overflow-y-auto ${
                    isDarkMode 
                        ? 'bg-slate-800 border-slate-600' 
                        : 'bg-white border-slate-300'
                }`}>
                    {results.map((result, index) => (
                        <button
                            key={`${result.lat}-${result.lon}`}
                            onClick={() => handleResultClick(result)}
                            className={`w-full text-left px-3 py-2 text-sm border-b last:border-b-0 transition-colors ${
                                index === selectedIndex
                                    ? isDarkMode 
                                        ? 'bg-slate-700 text-slate-200' 
                                        : 'bg-slate-100 text-slate-900'
                                    : isDarkMode 
                                        ? 'text-slate-200 hover:bg-slate-700 border-slate-600' 
                                        : 'text-slate-900 hover:bg-slate-100 border-slate-200'
                            }`}
                        >
                            {result.displayName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
