import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wind, MapPin, Zap } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface WindFarm {
  id: string;
  name: string;
  lat: number;
  lng: number;
  turbineCount: number;
  totalPower: number;
  avgWindSpeed: number;
  efficiency: number;
  status: 'optimal' | 'moderate' | 'maintenance';
  region: string;
  state: string;
}

interface WorkingFleetMapProps {
  turbines: any[];
}

export const WorkingFleetMap: React.FC<WorkingFleetMapProps> = ({ turbines }) => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Define wind farms with real US locations
  const windFarms: WindFarm[] = [
    {
      id: 'tx-panhandle',
      name: 'Texas Panhandle Wind Complex',
      lat: 35.2,
      lng: -101.8,
      turbineCount: 25,
      totalPower: 87.5,
      avgWindSpeed: 18.5,
      efficiency: 94,
      status: 'optimal',
      region: 'Great Plains',
      state: 'Texas'
    },
    {
      id: 'ia-corn',
      name: 'Iowa Corn Belt Wind Farm',
      lat: 42.0,
      lng: -93.5,
      turbineCount: 18,
      totalPower: 63.0,
      avgWindSpeed: 14.2,
      efficiency: 89,
      status: 'optimal',
      region: 'Midwest',
      state: 'Iowa'
    },
    {
      id: 'ca-tehachapi',
      name: 'Tehachapi Pass Wind Farm',
      lat: 35.1,
      lng: -118.3,
      turbineCount: 15,
      totalPower: 52.5,
      avgWindSpeed: 16.8,
      efficiency: 92,
      status: 'optimal',
      region: 'California',
      state: 'California'
    },
    {
      id: 'wy-medicine',
      name: 'Medicine Bow Wind Project',
      lat: 41.9,
      lng: -106.3,
      turbineCount: 12,
      totalPower: 42.0,
      avgWindSpeed: 22.3,
      efficiency: 96,
      status: 'optimal',
      region: 'Rocky Mountains',
      state: 'Wyoming'
    },
    {
      id: 'ok-corridor',
      name: 'Oklahoma Wind Corridor',
      lat: 35.5,
      lng: -98.5,
      turbineCount: 20,
      totalPower: 70.0,
      avgWindSpeed: 17.9,
      efficiency: 91,
      status: 'optimal',
      region: 'Great Plains',
      state: 'Oklahoma'
    },
    {
      id: 'il-prairie',
      name: 'Illinois Prairie Wind Farm',
      lat: 40.8,
      lng: -89.4,
      turbineCount: 10,
      totalPower: 35.0,
      avgWindSpeed: 12.5,
      efficiency: 87,
      status: 'moderate',
      region: 'Midwest',
      state: 'Illinois'
    }
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize the map
    const map = L.map(mapContainerRef.current).setView([39.5, -98.5], 4);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers for each wind farm
    windFarms.forEach((farm) => {
      const color = farm.status === 'optimal' ? '#10b981' : farm.status === 'moderate' ? '#f59e0b' : '#ef4444';

      // Create custom HTML icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background-color: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-weight: bold;
            font-size: 10px;
            color: white;
          ">
            ${farm.state.substring(0, 2).toUpperCase()}
          </div>
        `,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      const marker = L.marker([farm.lat, farm.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="font-weight: 600; margin-bottom: 8px;">${farm.name}</h3>
            <div style="font-size: 12px; line-height: 1.5;">
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span style="color: #6b7280;">State:</span>
                <strong>${farm.state}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span style="color: #6b7280;">Turbines:</span>
                <strong>${farm.turbineCount}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span style="color: #6b7280;">Power:</span>
                <strong>${farm.totalPower} MW</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span style="color: #6b7280;">Wind Speed:</span>
                <strong>${farm.avgWindSpeed} mph</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span style="color: #6b7280;">Efficiency:</span>
                <strong>${farm.efficiency}%</strong>
              </div>
            </div>
          </div>
        `);

      marker.on('click', () => {
        handleFarmClick(farm.id, farm.lat, farm.lng);
      });

      markersRef.current[farm.id] = marker;
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const handleFarmClick = (farmId: string, lat: number, lng: number) => {
    setSelectedFarm(farmId === selectedFarm ? null : farmId);

    if (mapRef.current) {
      if (farmId !== selectedFarm) {
        mapRef.current.setView([lat, lng], 7, {
          animate: true,
          duration: 1
        });

        // Update marker style for selected farm
        Object.keys(markersRef.current).forEach((id) => {
          const marker = markersRef.current[id];
          const farm = windFarms.find(f => f.id === id);
          if (!farm) return;

          const color = farm.status === 'optimal' ? '#10b981' : farm.status === 'moderate' ? '#f59e0b' : '#ef4444';
          const size = id === farmId ? 40 : 30;
          const isSelected = id === farmId;

          const icon = L.divIcon({
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                font-weight: bold;
                font-size: ${size === 40 ? '12px' : '10px'};
                color: white;
                ${isSelected ? 'animation: pulse 2s infinite;' : ''}
              ">
                ${farm.state.substring(0, 2).toUpperCase()}
              </div>
              ${isSelected ? `
              <style>
                @keyframes pulse {
                  0% { box-shadow: 0 0 0 0 ${color}66; }
                  70% { box-shadow: 0 0 0 10px ${color}00; }
                  100% { box-shadow: 0 0 0 0 ${color}00; }
                }
              </style>
              ` : ''}
            `,
            className: '',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
          });

          marker.setIcon(icon);
        });
      } else {
        // Reset view to show all farms
        mapRef.current.setView([39.5, -98.5], 4, {
          animate: true,
          duration: 1
        });

        // Reset all markers to default size
        Object.keys(markersRef.current).forEach((id) => {
          const marker = markersRef.current[id];
          const farm = windFarms.find(f => f.id === id);
          if (!farm) return;

          const color = farm.status === 'optimal' ? '#10b981' : farm.status === 'moderate' ? '#f59e0b' : '#ef4444';

          const icon = L.divIcon({
            html: `
              <div style="
                width: 30px;
                height: 30px;
                background-color: ${color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                font-weight: bold;
                font-size: 10px;
                color: white;
              ">
                ${farm.state.substring(0, 2).toUpperCase()}
              </div>
            `,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
          });

          marker.setIcon(icon);
        });
      }
    }
  };

  const selectedFarmData = windFarms.find(f => f.id === selectedFarm);

  return (
    <div className="h-full w-full space-y-4">
      {/* Map Display */}
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-gray-200">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Map Controls and Stats Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 pointer-events-none">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{turbines.length}</p>
                <p className="text-xs text-gray-500">Total Turbines</p>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">6</p>
                <p className="text-xs text-gray-500">Wind Farms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Farm Info Overlay */}
        {selectedFarmData && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-sm pointer-events-none">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-600" />
                {selectedFarmData.name}
              </h3>
            </div>
            <Badge variant="outline" className="text-xs mb-2">
              {selectedFarmData.state} • {selectedFarmData.region}
            </Badge>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Turbines:</span>
                <p className="font-semibold">{selectedFarmData.turbineCount}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Power:</span>
                <p className="font-semibold">{selectedFarmData.totalPower} MW</p>
              </div>
              <div>
                <span className="text-gray-500">Wind Speed:</span>
                <p className="font-semibold">{selectedFarmData.avgWindSpeed} mph</p>
              </div>
              <div>
                <span className="text-gray-500">Efficiency:</span>
                <p className="font-semibold">{selectedFarmData.efficiency}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wind Farm Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {windFarms.map((farm) => (
          <Card
            key={farm.id}
            className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
              selectedFarm === farm.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleFarmClick(farm.id, farm.lat, farm.lng)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      farm.status === 'optimal'
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : farm.status === 'moderate'
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                        : 'bg-red-100 text-red-700 border-2 border-red-500'
                    }`}
                  >
                    {farm.state.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-xs line-clamp-1">{farm.name}</h4>
                    <p className="text-xs text-gray-500">{farm.turbineCount} turbines</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-900">{farm.totalPower} MW</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{farm.avgWindSpeed} mph</span>
                  </div>
                </div>
              </div>
            </div>
            {selectedFarm === farm.id && (
              <div className="absolute top-2 right-2">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Optimal Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600">Moderate Output</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Maintenance Required</span>
        </div>
      </div>
    </div>
  );
};