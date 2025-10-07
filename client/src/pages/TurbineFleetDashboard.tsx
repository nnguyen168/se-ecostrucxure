import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { GenieChat } from '@/components/GenieChat';
import { WorkingFleetMap } from '@/components/WorkingFleetMap';
import {
  Wind,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Battery,
  MessageSquare,
  MapPin,
  TrendingUp,
  Activity,
  Zap,
  User,
  BarChart3,
  AlertCircle,
  Settings,
  Bell,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
// API imports will use fetch directly

interface TurbineStatus {
  operational: number;
  warning: number;
  maintenance: number;
  offline: number;
}

interface TurbineFleetKPIs {
  total_turbines: number;
  turbines_needing_maintenance: number;
  fleet_health_percentage: number;
  total_energy_production: number;
  operational_turbines: number;
  warning_turbines: number;
  offline_turbines: number;
}

interface AssistantSummary {
  message: string;
  priority_items: string[];
  weather_status: string;
  performance_summary: string;
}

interface EnergyOutput {
  timestamp: string;
  value: number;
}

interface Turbine {
  id: number;
  name: string;
  status: string;
  lat: number;
  lng: number;
  energy_output: number;
}

export const TurbineFleetDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<TurbineFleetKPIs | null>(null);
  const [assistantSummary, setAssistantSummary] = useState<AssistantSummary | null>(null);
  const [energyData, setEnergyData] = useState<EnergyOutput[]>([]);
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [activeTab, setActiveTab] = useState<string>('homepage');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KPIs
        const kpisResponse = await fetch('/api/turbine/kpis');
        if (kpisResponse.ok) {
          const data = await kpisResponse.json();
          setKpis(data);
        }

        // Fetch assistant summary
        const summaryResponse = await fetch('/api/turbine/assistant-summary');
        if (summaryResponse.ok) {
          const data = await summaryResponse.json();
          setAssistantSummary(data);
        }

        // Fetch energy output
        const energyResponse = await fetch('/api/turbine/energy-output');
        if (energyResponse.ok) {
          const data = await energyResponse.json();
          setEnergyData(data);
        }

        // Fetch turbine locations
        const turbinesResponse = await fetch('/api/turbine/turbines/map/clusters');
        if (turbinesResponse.ok) {
          const data = await turbinesResponse.json();
          setTurbines(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sample data for visualizations
  const regionalData = [
    { region: 'North', output: 45 },
    { region: 'South', output: 38 },
    { region: 'East', output: 52 },
    { region: 'West', output: 41 },
  ];

  const maintenanceData = [
    { name: 'Operational', value: kpis?.operational_turbines || 0 },
    { name: 'Warning', value: kpis?.warning_turbines || 0 },
    { name: 'Maintenance', value: kpis?.turbines_needing_maintenance || 0 },
    { name: 'Offline', value: kpis?.offline_turbines || 0 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/android-chrome-192x192.png"
                alt="EcoStruxure Logo"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">EcoStruxure</h1>
                <p className="text-xs text-gray-500">Wind Fleet Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Bachar Wehbi</p>
                  <p className="text-xs text-gray-500">Senior Field Technician</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Fleet Management System</CardTitle>
              <CardDescription className="text-sm text-gray-500">Comprehensive turbine fleet operations and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="homepage">
                  <Wind className="w-4 h-4 mr-2" />
                  Homepage
                </TabsTrigger>
                <TabsTrigger value="operational">
                  <Wrench className="w-4 h-4 mr-2" />
                  Operational
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="agents">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Agents Service
                </TabsTrigger>
              </TabsList>

              <TabsContent value="homepage" className="mt-4 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Turbines</CardTitle>
                        <Wind className="w-4 h-4 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-3xl font-semibold text-gray-900">{kpis?.total_turbines || 0}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span>{kpis?.operational_turbines || 0} Operational</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500">Need Attention</CardTitle>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-3xl font-semibold text-gray-900">{kpis?.turbines_needing_maintenance || 0}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                          <span>Immediate Action Required</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500">Fleet Health</CardTitle>
                        <Activity className="w-4 h-4 text-emerald-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-3xl font-semibold text-gray-900">{kpis?.fleet_health_percentage || 0}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${kpis?.fleet_health_percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500">Energy Production</CardTitle>
                        <Zap className="w-4 h-4 text-purple-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-3xl font-semibold text-gray-900">{kpis?.total_energy_production || 0} <span className="text-lg font-normal text-gray-500">GWh</span></p>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                          <span className="text-green-600 font-medium">+8.3%</span>
                          <span className="text-gray-500 ml-1">from yesterday</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Assistant Summary and Energy Output */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Virtual Assistant Card */}
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold">Virtual Assistant</CardTitle>
                          <CardDescription className="text-sm text-gray-500">Daily briefing and insights</CardDescription>
                        </div>
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-3">{assistantSummary?.message}</p>
                        <div className="space-y-2">
                          {assistantSummary?.priority_items?.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Weather Status</p>
                          <p className="text-sm font-semibold text-gray-900">{assistantSummary?.weather_status}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Performance</p>
                          <p className="text-sm font-semibold text-gray-900">{assistantSummary?.performance_summary}</p>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => setActiveTab('agents')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Conversation
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Energy Analytics */}
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold">Energy Analytics</CardTitle>
                          <CardDescription className="text-sm text-gray-500">24-hour production overview</CardDescription>
                        </div>
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={energyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="timestamp"
                              tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' })}
                              stroke="#9ca3af"
                              fontSize={12}
                            />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                              labelFormatter={(value) => new Date(value).toLocaleString()}
                              contentStyle={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">92.3%</p>
                          <p className="text-xs text-gray-500">Peak Efficiency</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">78.5%</p>
                          <p className="text-xs text-gray-500">Capacity Factor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Fleet Locations Map */}
                <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Wind Farm Fleet Locations</CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          Real-time monitoring across {turbines.length} turbines in 6 major US wind corridors
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                          Live
                        </Badge>
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Real World Map Display */}
                      <div className="lg:col-span-2">
                        <WorkingFleetMap turbines={turbines} />
                      </div>

                      {/* Performance Metrics */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Regional Performance</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={regionalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="region" stroke="#9ca3af" fontSize={11} />
                                <YAxis stroke="#9ca3af" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="output" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Distribution</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={maintenanceData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={35}
                                  outerRadius={65}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {maintenanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {maintenanceData.map((item, index) => (
                              <div key={item.name} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                                <span className="text-xs text-gray-600">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="operational" className="mt-4">
                <div className="w-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Real-time Operational Dashboard</h3>
                    <p className="text-sm text-gray-500">Live turbine performance metrics and operational status</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <iframe
                      src="https://one-env-nam-nguyen-workspace-classic.cloud.databricks.com/embed/dashboardsv3/01f0a2bbd98c1bcbb19ce3de2416d407?o=3500980823973775&f_7afb9ef1%7E55251e89=0336f273-8fac-d327-a6a7-323544d90807"
                      width="100%"
                      height="600"
                      frameBorder="0"
                      title="Databricks Operational Dashboard"
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <div className="w-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics Dashboard</h3>
                    <p className="text-sm text-gray-500">Historical trends, predictive insights, and performance analytics</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <iframe
                      src="https://one-env-nam-nguyen-workspace-classic.cloud.databricks.com/embed/dashboardsv3/01f0a2bbd9be14e796c3a0952f0b7f36?o=3500980823973775"
                      width="100%"
                      height="600"
                      frameBorder="0"
                      title="Databricks Analytics Dashboard"
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="mt-4">
                <div className="w-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Wind Fleet Assistant</h3>
                    <p className="text-sm text-gray-500">Chat with Genie to explore data, get insights, and receive intelligent recommendations</p>
                  </div>

                  {/* Genie Chat Interface */}
                  <GenieChat />
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};