import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserSettings } from "@/hooks/use-settings";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Save,
  BellOff,
  BarChart4,
  AlertCircle,
  Check,
  GaugeCircle
} from "lucide-react";

type NotificationsSettingsProps = {
  settings: UserSettings | null;
  updateSetting: (key: string, value: string) => Promise<void>;
};

export function NotificationsSettings({ settings, updateSetting }: NotificationsSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(settings?.emailNotifications === 'true');
  const [pushNotifications, setPushNotifications] = useState(settings?.pushNotifications === 'true');
  const [rankingAlerts, setRankingAlerts] = useState(settings?.rankingAlerts === 'true');
  const [apiQuotaAlerts, setApiQuotaAlerts] = useState(settings?.apiQuotaAlerts === 'true');
  const [weeklyReports, setWeeklyReports] = useState(settings?.weeklyReports === 'true');
  const [performanceAlerts, setPerformanceAlerts] = useState(settings?.performanceAlerts === 'true');
  const [alertLevel, setAlertLevel] = useState(settings?.alertLevel || 'medium');
  const [emailAddress, setEmailAddress] = useState(settings?.notificationEmail || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    updateSetting('emailNotifications', checked.toString());
  };

  const handlePushNotificationsChange = (checked: boolean) => {
    setPushNotifications(checked);
    updateSetting('pushNotifications', checked.toString());
  };

  const handleRankingAlertsChange = (checked: boolean) => {
    setRankingAlerts(checked);
    updateSetting('rankingAlerts', checked.toString());
  };

  const handleApiQuotaAlertsChange = (checked: boolean) => {
    setApiQuotaAlerts(checked);
    updateSetting('apiQuotaAlerts', checked.toString());
  };

  const handleWeeklyReportsChange = (checked: boolean) => {
    setWeeklyReports(checked);
    updateSetting('weeklyReports', checked.toString());
  };

  const handlePerformanceAlertsChange = (checked: boolean) => {
    setPerformanceAlerts(checked);
    updateSetting('performanceAlerts', checked.toString());
  };

  const handleAlertLevelChange = (value: string) => {
    setAlertLevel(value);
    updateSetting('alertLevel', value);
  };

  const handleEmailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(e.target.value);
  };

  const saveNotificationSettings = async () => {
    setIsSaving(true);
    
    try {
      await updateSetting('notificationEmail', emailAddress);
      
      toast({
        title: "Notifications Updated",
        description: "Your notification settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-400" />
          <CardTitle>Notification Settings</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Notification Methods</h3>
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-medium">Email Notifications</h3>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={handleEmailNotificationsChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                Receive notifications via email
              </p>
              
              {emailNotifications && (
                <div className="mt-3 pt-3 border-t border-[#2a3146]">
                  <Label htmlFor="notification-email" className="text-sm mb-2 block">
                    Notification Email
                  </Label>
                  <Input
                    id="notification-email"
                    placeholder="Enter your email address"
                    value={emailAddress}
                    onChange={handleEmailAddressChange}
                    className="bg-[#252a3a] border-[#2a3146] text-white"
                  />
                </div>
              )}
            </div>
            
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-medium">Push Notifications</h3>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={handlePushNotificationsChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                Receive notifications in browser and mobile app
              </p>
            </div>
            
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Alert Level</h3>
              </div>
              <Select value={alertLevel} onValueChange={handleAlertLevelChange}>
                <SelectTrigger className="bg-[#252a3a] border-[#2a3146] text-white">
                  <SelectValue placeholder="Select alert level" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <BellOff className="h-4 w-4 text-gray-400" />
                      <span>Low (Critical alerts only)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-indigo-400" />
                      <span>Medium (Important alerts)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <GaugeCircle className="h-4 w-4 text-orange-400" />
                      <span>High (All alerts and updates)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400 mt-2">
                Set how many notifications you want to receive
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Notification Types</h3>
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <BarChart4 className="h-5 w-5 text-green-400" />
                  <h3 className="font-medium">Ranking Changes</h3>
                </div>
                <Switch 
                  checked={rankingAlerts} 
                  onCheckedChange={handleRankingAlertsChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                Notifications when your video rankings change
              </p>
            </div>
            
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <h3 className="font-medium">API Quota Alerts</h3>
                </div>
                <Switch 
                  checked={apiQuotaAlerts} 
                  onCheckedChange={handleApiQuotaAlertsChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                Alerts when API quotas are running low
              </p>
            </div>
            
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <h3 className="font-medium">Weekly Reports</h3>
                </div>
                <Switch 
                  checked={weeklyReports} 
                  onCheckedChange={handleWeeklyReportsChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                Weekly performance summary reports
              </p>
            </div>
            
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <h3 className="font-medium">Performance Alerts</h3>
                </div>
                <Switch 
                  checked={performanceAlerts} 
                  onCheckedChange={handlePerformanceAlertsChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                Alerts about significant performance changes
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-indigo-400 mt-0.5" />
            <div>
              <p className="text-indigo-400 font-medium mb-1">Never miss important updates</p>
              <p className="text-sm text-gray-300">
                Configure your notification settings to stay informed about critical changes in your video performance,
                API quotas, and security events. We recommend keeping at least email notifications enabled.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4 flex justify-end">
        <Button 
          className="gradient-primary"
          onClick={saveNotificationSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Notification Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}