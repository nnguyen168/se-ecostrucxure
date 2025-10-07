import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Wind, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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
}

interface FleetMapProps {
  turbines: any[];
}

export const FleetMap: React.FC<FleetMapProps> = ({ turbines }) => {
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
      region: 'Great Plains'
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
      region: 'Midwest'
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
      region: 'California'
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
      region: 'Rocky Mountains'
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
      region: 'Great Plains'
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
      region: 'Midwest'
    }
  ];

  // Connection lines between wind farms
  const connections = [
    { from: [35.2, -101.8], to: [35.5, -98.5], color: '#10b981' }, // TX to OK
    { from: [42.0, -93.5], to: [40.8, -89.4], color: '#10b981' }, // IA to IL
    { from: [35.1, -118.3], to: [41.9, -106.3], color: '#3b82f6' }, // CA to WY
  ];

  // Custom icon for wind farms
  const createWindFarmIcon = (farm: WindFarm) => {
    const colorMap = {
      optimal: '#10b981',
      moderate: '#f59e0b',
      maintenance: '#ef4444'
    };

    return L.divIcon({
      className: 'custom-wind-farm-icon',
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            background: ${colorMap[farm.status]};
            opacity: 0.2;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: white;
            border: 2px solid ${colorMap[farm.status]};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: bold;
            font-size: 11px;
            color: ${colorMap[farm.status]};
          ">
            ${farm.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.2); opacity: 0.1; }
        100% { transform: scale(1); opacity: 0.3; }
      }
      .leaflet-container {
        font-family: inherit;
      }
      .farm-popup {
        font-family: inherit;
        min-width: 250px;
      }
      .farm-popup h3 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }
      .farm-popup .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
      }
      .farm-popup .stat {
        display: flex;
        flex-direction: column;
      }
      .farm-popup .stat-label {
        font-size: 10px;
        color: #6b7280;
        margin-bottom: 2px;
      }
      .farm-popup .stat-value {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={[39.0, -98.0]} // Center of US
        zoom={4}
        style={{ height: '450px', width: '100%' }}
        className="z-0"
      >
        {/* Map tiles from OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Connection lines */}
        {connections.map((conn, idx) => (
          <Polyline
            key={idx}
            positions={[conn.from as [number, number], conn.to as [number, number]]}
            color={conn.color}
            weight={2}
            opacity={0.4}
            dashArray="5, 10"
          />
        ))}

        {/* Wind farm markers */}
        {windFarms.map((farm) => (
          <Marker
            key={farm.id}
            position={[farm.lat, farm.lng]}
            icon={createWindFarmIcon(farm)}
            eventHandlers={{
              click: () => setSelectedFarm(farm.id),
            }}
          >
            <Popup className="farm-popup">
              <div>
                <h3 className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-600" />
                  {farm.name}
                </h3>
                <Badge variant="outline" className="text-xs mb-2">
                  {farm.region}
                </Badge>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-label">Turbines</span>
                    <span className="stat-value">{farm.turbineCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Power</span>
                    <span className="stat-value">{farm.totalPower} MW</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Wind Speed</span>
                    <span className="stat-value">{farm.avgWindSpeed} mph</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Efficiency</span>
                    <span className="stat-value">{farm.efficiency}%</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status</span>
                    <Badge
                      variant={farm.status === 'optimal' ? 'default' : farm.status === 'moderate' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {farm.status === 'optimal' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {farm.status === 'moderate' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {farm.status.charAt(0).toUpperCase() + farm.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
              <div className="text-xs">
                <strong>{farm.name}</strong><br />
                {farm.turbineCount} turbines • {farm.totalPower} MW
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Individual turbine markers (smaller, clustered around farms) */}
        {turbines.slice(0, 30).map((turbine, idx) => {
          // Distribute turbines around wind farms
          const farmIndex = idx % windFarms.length;
          const farm = windFarms[farmIndex];
          const angle = (idx * 137.5) % 360; // Golden angle for better distribution
          const distance = 0.1 + (idx % 3) * 0.05;
          const lat = farm.lat + distance * Math.cos(angle * Math.PI / 180);
          const lng = farm.lng + distance * Math.sin(angle * Math.PI / 180);

          return (
            <CircleMarker
              key={`turbine-${idx}`}
              center={[lat, lng]}
              radius={3}
              fillColor={turbine.status === 'operational' ? '#10b981' : '#f59e0b'}
              color="#fff"
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>Turbine {turbine.name}</strong><br />
                  Status: {turbine.status}<br />
                  Output: {turbine.energy_output?.toFixed(1) || 0} MW
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map overlay stats */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-10">
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

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-10">
        <p className="text-xs font-semibold text-gray-700 mb-2">Wind Farm Status</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Optimal Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Moderate Output</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Maintenance Required</span>
          </div>
        </div>
      </div>
    </div>
  );
};