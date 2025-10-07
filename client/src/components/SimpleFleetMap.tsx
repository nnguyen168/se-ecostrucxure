import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wind, MapPin, Zap, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

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

interface SimpleFleetMapProps {
  turbines: any[];
}

export const SimpleFleetMap: React.FC<SimpleFleetMapProps> = ({ turbines }) => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);

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

  // Create OpenStreetMap embed URL with all markers
  const createMapUrl = () => {
    // Calculate bounding box to include all wind farms
    const lats = windFarms.map(f => f.lat);
    const lngs = windFarms.map(f => f.lng);
    const minLat = Math.min(...lats) - 2;
    const maxLat = Math.max(...lats) + 2;
    const minLng = Math.min(...lngs) - 2;
    const maxLng = Math.max(...lngs) + 2;

    // Create bbox for all US wind farms
    const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;

    // If a farm is selected, center on it but still show others
    if (selectedFarmData) {
      const zoomBbox = `${selectedFarmData.lng - 5},${selectedFarmData.lat - 3},${selectedFarmData.lng + 5},${selectedFarmData.lat + 3}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${zoomBbox}&layer=mapnik&marker=${selectedFarmData.lat},${selectedFarmData.lng}`;
    }

    // Show all of US with markers
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  };

  // Create individual marker URLs for each farm
  const createMarkerUrl = (farm: WindFarm) => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${farm.lng - 0.1},${farm.lat - 0.1},${farm.lng + 0.1},${farm.lat + 0.1}&layer=mapnik&marker=${farm.lat},${farm.lng}`;
  };

  const openInMaps = (farm: WindFarm) => {
    window.open(`https://www.openstreetmap.org/?mlat=${farm.lat}&mlon=${farm.lng}#map=10/${farm.lat}/${farm.lng}`, '_blank');
  };

  return (
    <div className="h-full w-full space-y-4">
      {/* Map Display */}
      <div className="relative h-[350px] w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <>
          <iframe
            key={selectedFarm || 'all'} // Force iframe reload on selection change
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={createMapUrl()}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Custom markers overlay for all wind farms */}
          <div className="absolute inset-0 pointer-events-none">
            {windFarms.map((farm) => {
              // Calculate position on map (approximate for visual reference)
              const left = ((farm.lng + 120) / 60) * 100; // Normalize longitude to percentage
              const top = ((50 - farm.lat) / 30) * 100;   // Normalize latitude to percentage

              return (
                <div
                  key={farm.id}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className={`
                    pointer-events-auto cursor-pointer
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all hover:scale-110 hover:z-10
                    ${selectedFarm === farm.id
                      ? 'w-10 h-10 ring-4 ring-blue-400 ring-opacity-50 z-20'
                      : ''
                    }
                    ${farm.status === 'optimal'
                      ? 'bg-green-500 text-white shadow-green-200'
                      : farm.status === 'moderate'
                      ? 'bg-amber-500 text-white shadow-amber-200'
                      : 'bg-red-500 text-white shadow-red-200'
                    }
                    shadow-lg
                  `}
                  onClick={() => setSelectedFarm(farm.id)}
                  title={`${farm.name} - ${farm.turbineCount} turbines`}
                >
                  {farm.state.substring(0, 2).toUpperCase()}
                </div>
              </div>
              );
            })}
          </div>

            {/* Overlay with farm info - only show when a farm is selected */}
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
                    title="Open in OpenStreetMap"
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
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status</span>
                    <Badge
                      variant={selectedFarmData.status === 'optimal' ? 'default' : selectedFarmData.status === 'moderate' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {selectedFarmData.status === 'optimal' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {selectedFarmData.status === 'moderate' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {selectedFarmData.status.charAt(0).toUpperCase() + selectedFarmData.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Map Stats */}
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
                {selectedFarm && (
                  <button
                    onClick={() => setSelectedFarm(null)}
                    className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors"
                  >
                    View All Farms
                  </button>
                )}
              </div>
            </div>
        </>
      </div>

      {/* Wind Farm Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {windFarms.map((farm) => (
          <Card
            key={farm.id}
            className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
              selectedFarm === farm.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedFarm(farm.id)}
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