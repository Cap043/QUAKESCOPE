import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Import the geocoder control
import 'leaflet-control-geocoder';

// Extend Leaflet types
declare module 'leaflet' {
    namespace Control {
        class Geocoder extends Control {
            constructor(options?: any);
        }
    }
}

interface GeocoderControlProps {
    isDarkMode: boolean;
}

export const GeocoderControl: React.FC<GeocoderControlProps> = ({ isDarkMode }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Create geocoder control using the correct API
        const geocoder = new L.Control.Geocoder({
            geocodingQueryParams: {
                'accept-language': 'en',
                'countrycodes': '', // Empty to search worldwide
                'limit': 10
            }
        });

        // Add geocoder to map
        geocoder.addTo(map);

        // Style the geocoder control for dark/light mode
        const geocoderContainer = document.querySelector('.leaflet-control-geocoder');
        if (geocoderContainer) {
            const geocoderInput = geocoderContainer.querySelector('input') as HTMLInputElement;
            const geocoderButton = geocoderContainer.querySelector('a') as HTMLAnchorElement;
            const geocoderResults = geocoderContainer.querySelector('.leaflet-control-geocoder-results') as HTMLElement;

            if (geocoderInput) {
                geocoderInput.placeholder = 'Search for a city...';
                geocoderInput.className = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    isDarkMode 
                        ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-sky-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-sky-500'
                }`;
            }

            if (geocoderButton) {
                geocoderButton.className = `flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`;
            }

            if (geocoderResults) {
                geocoderResults.className = `absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-[1000] max-h-60 overflow-y-auto ${
                    isDarkMode 
                        ? 'bg-slate-800 border-slate-600' 
                        : 'bg-white border-slate-300'
                }`;
            }

            // Style the container
            geocoderContainer.className = `leaflet-control-geocoder leaflet-bar leaflet-control ${
                isDarkMode ? 'dark-geocoder' : 'light-geocoder'
            }`;
        }

        // Handle geocoder results styling
        const styleGeocoderResults = () => {
            const results = document.querySelectorAll('.leaflet-control-geo coder-results a');
            results.forEach((result) => {
                const resultElement = result as HTMLElement;
                resultElement.className = `block px-3 py-2 text-sm border-b last:border-b-0 transition-colors ${
                    isDarkMode 
                        ? 'text-slate-200 hover:bg-slate-700 border-slate-600' 
                        : 'text-slate-900 hover:bg-slate-100 border-slate-200'
                }`;
            });
        };

        // Listen for geocoder events to style results
        map.on('geocoder_show', styleGeocoderResults);

        // Cleanup
        return () => {
            map.off('geocoder_show', styleGeocoderResults);
            if (geocoder) {
                map.removeControl(geocoder);
            }
        };
    }, [map, isDarkMode]);

    return null;
};
