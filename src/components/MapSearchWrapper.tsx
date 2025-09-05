import React from 'react';
import { useMap } from 'react-leaflet';
import { CitySearch } from './CitySearch';

interface MapSearchWrapperProps {
    isDarkMode: boolean;
    isMobile?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const MapSearchWrapper: React.FC<MapSearchWrapperProps> = (props) => {
    const map = useMap();
    
    return <CitySearch {...props} map={map} />;
};
