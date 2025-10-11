import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Download,
  Upload,
  Database,
  Zap,
  Moon,
  Sun,
  Monitor,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Mail,
  Smartphone
} from 'lucide-react';

export const SettingsDropdown: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [soundAlerts, setSoundAlerts] = React.useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Profile Settings */}
        <DropdownMenuItem className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          <div className="flex-1">
            <span className="text-sm">Profile Settings</span>
            <p className="text-xs text-gray-500">Manage your account details</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </DropdownMenuItem>

        {/* Notification Preferences */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Bell className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <span className="text-sm">Notification Preferences</span>
              <p className="text-xs text-gray-500">Configure alerts and updates</p>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            <DropdownMenuLabel className="text-xs">Alert Types</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked>
              <span className="text-sm">Critical Alerts</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              <span className="text-sm">Maintenance Reminders</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              <span className="text-sm">Performance Reports</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <span className="text-sm">Weather Updates</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Delivery Methods</DropdownMenuLabel>
            <DropdownMenuItem className="justify-between cursor-pointer">
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-2" />
                <span className="text-sm">Email</span>
              </div>
              <Switch checked={true} className="h-4 w-8" />
            </DropdownMenuItem>
            <DropdownMenuItem className="justify-between cursor-pointer">
              <div className="flex items-center">
                <Smartphone className="w-3 h-3 mr-2" />
                <span className="text-sm">SMS</span>
              </div>
              <Switch checked={false} className="h-4 w-8" />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Data & Performance */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Database className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <span className="text-sm">Data & Performance</span>
              <p className="text-xs text-gray-500">Manage data and optimization</p>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            <DropdownMenuItem className="justify-between cursor-pointer">
              <div className="flex items-center">
                <Wifi className="w-3 h-3 mr-2" />
                <span className="text-sm">Auto-refresh data</span>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                className="h-4 w-8"
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Download className="w-3 h-3 mr-2" />
              <span className="text-sm">Export Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Upload className="w-3 h-3 mr-2" />
              <span className="text-sm">Import Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600">
              <Database className="w-3 h-3 mr-2" />
              <span className="text-sm">Clear Cache</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Appearance */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <span className="text-sm">Appearance</span>
              <p className="text-xs text-gray-500">Theme and display settings</p>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            <DropdownMenuLabel className="text-xs">Theme</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={!darkMode}>
              <Sun className="w-3 h-3 mr-2" />
              <span className="text-sm">Light Mode</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={darkMode}>
              <Moon className="w-3 h-3 mr-2" />
              <span className="text-sm">Dark Mode</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <Monitor className="w-3 h-3 mr-2" />
              <span className="text-sm">System Default</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-between cursor-pointer">
              <div className="flex items-center">
                <Volume2 className="w-3 h-3 mr-2" />
                <span className="text-sm">Sound Alerts</span>
              </div>
              <Switch
                checked={soundAlerts}
                onCheckedChange={setSoundAlerts}
                className="h-4 w-8"
              />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Security */}
        <DropdownMenuItem className="cursor-pointer">
          <Shield className="w-4 h-4 mr-2" />
          <div className="flex-1">
            <span className="text-sm">Security</span>
            <p className="text-xs text-gray-500">Privacy and authentication</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </DropdownMenuItem>

        {/* Language */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Globe className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <span className="text-sm">Language & Region</span>
              <p className="text-xs text-gray-500">English (US)</p>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuCheckboxItem checked>
              <span className="text-sm">English (US)</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <span className="text-sm">English (UK)</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <span className="text-sm">Français</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <span className="text-sm">Deutsch</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              <span className="text-sm">Español</span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Advanced Settings */}
        <DropdownMenuItem className="cursor-pointer">
          <Zap className="w-4 h-4 mr-2" />
          <div className="flex-1">
            <span className="text-sm">Advanced Settings</span>
            <p className="text-xs text-gray-500">Developer options</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">Help & Support</span>
        </DropdownMenuItem>

        {/* Sign Out */}
        <DropdownMenuItem className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};