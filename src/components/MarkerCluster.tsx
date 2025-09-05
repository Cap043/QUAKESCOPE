import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { Earthquake as BaseEarthquake } from '../lib/types';

interface Earthquake extends BaseEarthquake {
    magnitude: number;
    depth: number;
    time: string;
}

interface MarkerClusterProps {
    quakes: BaseEarthquake[];
    isVisible: boolean;
    onQuakeSelect?: (quake: BaseEarthquake) => void;
    onQuakeHover?: (quakeId: string | null) => void;
    selectedQuakeId?: string | null;
    hoveredQuakeId?: string | null;
}

export const MarkerCluster: React.FC<MarkerClusterProps> = ({
    quakes,
    isVisible,
    onQuakeSelect,
    onQuakeHover,
    selectedQuakeId,
    hoveredQuakeId
}) => {
    const map = useMap();
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

    // Create custom earthquake marker
    const createQuakeMarker = (quake: BaseEarthquake) => {
        const magnitude = quake.mag || 0;
        let color = '#10b981'; // green (default)
        let size = 8;

        if (magnitude >= 6.0) {
            color = '#ef4444'; // red
            size = 16;
        } else if (magnitude >= 4.5) {
            color = '#f97316'; // orange
            size = 12;
        } else if (magnitude >= 2.5) {
            color = '#eab308'; // yellow
            size = 10;
        }

        // Depth-based border styling
        const isDeep = quake.depthKm > 100;
        const borderColor = isDeep ? '#1e40af' : '#ffffff'; // blue for deep, white for shallow
        const borderWidth = isDeep ? 3 : 2;

        const icon = L.divIcon({
            className: 'custom-quake-marker',
            html: `
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    background-color: ${color};
                    border: ${borderWidth}px solid ${borderColor};
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${size > 10 ? '8px' : '6px'};
                    font-weight: bold;
                    color: white;
                    text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
                ">
                    ${magnitude.toFixed(1)}
                </div>
            `,
            iconSize: [size + 4, size + 4],
            iconAnchor: [(size + 4) / 2, (size + 4) / 2]
        });

        const marker = L.marker([quake.lat, quake.lon], { icon });

        // Add popup
        const popupContent = `
            <div class="quake-popup">
                <div class="popup-header">
                    <h3 style="margin: 0; color: #1e40af; font-size: 14px;">M ${magnitude.toFixed(1)}</h3>
                    <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">${quake.place}</p>
                </div>
                <div class="popup-details">
                    <p style="margin: 2px 0; font-size: 11px;"><strong>Depth:</strong> ${quake.depthKm.toFixed(1)} km</p>
                    <p style="margin: 2px 0; font-size: 11px;"><strong>Time:</strong> ${new Date(quake.time).toLocaleString()}</p>
                </div>
                <div class="popup-actions">
                    <a href="${quake.url}" target="_blank" rel="noopener noreferrer" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 4px 8px; 
                              border-radius: 4px; text-decoration: none; font-size: 11px; margin-top: 4px;">
                        View on USGS
                    </a>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            className: 'custom-popup',
            maxWidth: 200,
            closeButton: false
        });

        // Add click and hover events
        marker.on('click', () => {
            if (onQuakeSelect) {
                onQuakeSelect(quake);
            }
        });

        marker.on('mouseover', () => {
            if (onQuakeHover) {
                onQuakeHover(quake.id);
            }
        });

        marker.on('mouseout', () => {
            if (onQuakeHover) {
                onQuakeHover(null);
            }
        });

        return marker;
    };

    useEffect(() => {
        if (!map) return;

        // Remove existing cluster group
        if (clusterGroupRef.current) {
            map.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        // Add new cluster group if visible and we have data
        if (isVisible && quakes.length > 0) {
            const clusterGroup = L.markerClusterGroup({
                chunkedLoading: true,
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: (cluster) => {
                    const childCount = cluster.getChildCount();
                    let className = 'marker-cluster marker-cluster-';
                    
                    if (childCount < 10) {
                        className += 'small';
                    } else if (childCount < 100) {
                        className += 'medium';
                    } else {
                        className += 'large';
                    }

                    return L.divIcon({
                        html: `<div><span>${childCount}</span></div>`,
                        className,
                        iconSize: L.point(40, 40)
                    });
                }
            });

            // Add markers to cluster group
            quakes.forEach(quake => {
                const marker = createQuakeMarker(quake);
                clusterGroup.addLayer(marker);
            });

            clusterGroup.addTo(map);
            clusterGroupRef.current = clusterGroup;
        }

        return () => {
            if (clusterGroupRef.current) {
                map.removeLayer(clusterGroupRef.current);
                clusterGroupRef.current = null;
            }
        };
    }, [map, quakes, isVisible, onQuakeSelect, onQuakeHover, selectedQuakeId, hoveredQuakeId]);

    return null;
};

export default MarkerCluster;
