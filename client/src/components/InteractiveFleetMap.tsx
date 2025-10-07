import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wind, MapPin, Zap, AlertTriangle, CheckCircle2, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

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

interface InteractiveFleetMapProps {
  turbines: any[];
}

export const InteractiveFleetMap: React.FC<InteractiveFleetMapProps> = ({ turbines }) => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(5);

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

  const selectedFarmData = windFarms.find(f => f.id === selectedFarm);

  // Create static map URL with multiple markers using MapBox Static API (free tier)
  const createStaticMapUrl = () => {
    // Center of US if no selection, or center on selected farm
    const centerLat = selectedFarmData ? selectedFarmData.lat : 39.5;
    const centerLng = selectedFarmData ? selectedFarmData.lng : -98.5;
    const zoom = selectedFarmData ? 6 : zoomLevel;

    // Create markers for all farms
    const markers = windFarms.map(farm => {
      const color = farm.status === 'optimal' ? '10b981' : farm.status === 'moderate' ? 'f59e0b' : 'ef4444';
      const size = farm.id === selectedFarm ? 'l' : 'm';
      return `pin-${size}+${color}(${farm.lng},${farm.lat})`;
    }).join(',');

    // Using OpenStreetMap static map API alternative
    return `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng-15},${centerLat-8},${centerLng+15},${centerLat+8}&layer=mapnik`;
  };

  // Create Google Maps URL with all markers
  const createGoogleMapsUrl = () => {
    const centerLat = selectedFarmData ? selectedFarmData.lat : 39.5;
    const centerLng = selectedFarmData ? selectedFarmData.lng : -98.5;
    const zoom = selectedFarmData ? 7 : 4;

    // Build markers parameter for Google Maps
    const markers = windFarms.map(farm => {
      return `${farm.lat},${farm.lng}`;
    }).join('|');

    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=800x400&maptype=roadmap&markers=color:green|${markers}&key=YOUR_API_KEY`;
  };

  const openInMaps = (farm?: WindFarm) => {
    if (farm) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${farm.lat},${farm.lng}`, '_blank');
    } else {
      // Open centered on US
      window.open(`https://www.google.com/maps/@39.5,-98.5,4z`, '_blank');
    }
  };

  return (
    <div className="h-full w-full space-y-4">
      {/* Map Display with US Background */}
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Simple US Map visualization with positioned markers */}
        <div className="absolute inset-0">
          {/* US Map Background - simplified representation */}
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {/* Simplified US outline */}
            <path
              d="M 100 200 Q 150 180 250 170 Q 400 160 550 180 Q 650 190 700 210 Q 690 250 650 280 Q 500 320 350 310 Q 200 290 120 250 Z"
              fill="#f0f9ff"
              stroke="#94a3b8"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* State boundaries hint */}
            <line x1="200" y1="150" x2="200" y2="350" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
            <line x1="300" y1="150" x2="300" y2="350" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
            <line x1="400" y1="150" x2="400" y2="350" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
            <line x1="500" y1="150" x2="500" y2="350" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
            <line x1="600" y1="150" x2="600" y2="350" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
          </svg>

          {/* Wind Farm Markers positioned on the map */}
          {windFarms.map((farm) => {
            // Convert lat/lng to x/y position on our 800x400 canvas
            // US roughly spans from -125 to -65 longitude (60 degrees)
            // and 25 to 50 latitude (25 degrees)
            const x = ((farm.lng + 125) / 60) * 800;
            const y = ((50 - farm.lat) / 25) * 400;

            return (
              <div
                key={farm.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              >
                <button
                  className={`
                    relative group cursor-pointer
                    ${selectedFarm === farm.id ? 'z-20' : 'z-10 hover:z-15'}
                  `}
                  onClick={() => setSelectedFarm(farm.id === selectedFarm ? null : farm.id)}
                >
                  {/* Pulse effect for selected */}
                  {selectedFarm === farm.id && (
                    <div className="absolute -inset-4 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
                  )}

                  {/* Marker */}
                  <div className={`
                    relative flex items-center justify-center rounded-full transition-all
                    ${selectedFarm === farm.id
                      ? 'w-14 h-14 ring-4 ring-blue-400 ring-opacity-50'
                      : 'w-10 h-10 hover:scale-110'
                    }
                    ${farm.status === 'optimal'
                      ? 'bg-green-500 shadow-green-200'
                      : farm.status === 'moderate'
                      ? 'bg-amber-500 shadow-amber-200'
                      : 'bg-red-500 shadow-red-200'
                    }
                    shadow-lg text-white font-bold text-xs
                  `}>
                    {farm.state.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {farm.name}
                      <div className="text-gray-300">{farm.turbineCount} turbines • {farm.totalPower} MW</div>
                    </div>
                    <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                  </div>
                </button>

                {/* Connection line to nearest farm */}
                {farm.id === 'tx-panhandle' && (
                  <svg className="absolute pointer-events-none" style={{ left: '0', top: '0', width: '200px', height: '100px' }}>
                    <line x1="0" y1="0" x2="100" y2="-20" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Farm Info Overlay */}
        {selectedFarmData && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-600" />
                {selectedFarmData.name}
              </h3>
              <button
                onClick={() => openInMaps(selectedFarmData)}
                className="text-blue-600 hover:text-blue-800"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
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

        {/* Map Controls and Stats */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3">
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
            <div className="flex gap-1">
              <button
                onClick={() => openInMaps()}
                className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open Full Map
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!selectedFarm && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur rounded-lg px-3 py-2">
            <p className="text-xs text-gray-600">Click any marker to view wind farm details</p>
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
            onClick={() => setSelectedFarm(farm.id === selectedFarm ? null : farm.id)}
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