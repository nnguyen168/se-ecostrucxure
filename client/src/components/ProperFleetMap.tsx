import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wind, MapPin, Zap, CheckCircle2, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

interface ProperFleetMapProps {
  turbines: any[];
}

// Component to handle map centering when farm is selected
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export const ProperFleetMap: React.FC<ProperFleetMapProps> = ({ turbines }) => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.5, -98.5]); // Center of US
  const [mapZoom, setMapZoom] = useState<number>(4);

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

  // Create custom icons for different statuses
  const createCustomIcon = (status: string, isSelected: boolean) => {
    const color = status === 'optimal' ? '#10b981' : status === 'moderate' ? '#f59e0b' : '#ef4444';
    const size = isSelected ? 40 : 30;

    return L.divIcon({
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
          transition: all 0.3s ease;
          ${isSelected ? 'animation: pulse 2s infinite;' : ''}
        ">
          <svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L12 10M12 10L16 6M12 10L8 6M12 10L12 22M19.778 4.223L17.556 7.667M4.222 4.223L6.444 7.667M3 12H7M17 12H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        ${isSelected ? `
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 ${color}40; }
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
  };

  const handleFarmClick = (farmId: string, lat: number, lng: number) => {
    setSelectedFarm(farmId === selectedFarm ? null : farmId);
    if (farmId !== selectedFarm) {
      setMapCenter([lat, lng]);
      setMapZoom(7);
    } else {
      setMapCenter([39.5, -98.5]);
      setMapZoom(4);
    }
  };

  const selectedFarmData = windFarms.find(f => f.id === selectedFarm);

  return (
    <div className="h-full w-full space-y-4">
      {/* Map Display */}
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={mapZoom} />

          {windFarms.map((farm) => (
            <Marker
              key={farm.id}
              position={[farm.lat, farm.lng]}
              icon={createCustomIcon(farm.status, farm.id === selectedFarm)}
              eventHandlers={{
                click: () => handleFarmClick(farm.id, farm.lat, farm.lng)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-2">{farm.name}</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">State:</span>
                      <span className="font-medium">{farm.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Turbines:</span>
                      <span className="font-medium">{farm.turbineCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Power:</span>
                      <span className="font-medium">{farm.totalPower} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wind Speed:</span>
                      <span className="font-medium">{farm.avgWindSpeed} mph</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Efficiency:</span>
                      <span className="font-medium">{farm.efficiency}%</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="text-gray-500">Status:</span>
                      <Badge
                        variant={farm.status === 'optimal' ? 'default' : farm.status === 'moderate' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {farm.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Controls and Stats Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-[1000]">
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
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-sm z-[1000]">
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