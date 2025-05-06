import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { UserSettings } from "@/hooks/use-settings";
import { 
  Settings2, 
  Database, 
  Trash2, 
  Save,
  AlertTriangle,
  Info,
  Shield,
  Key,
  Cog,
  Cpu,
  Lock,
  FileJson
} from "lucide-react";

type AdvancedSettingsProps = {
  settings: UserSettings | null;
  updateSetting: (key: string, value: string) => Promise<void>;
};

export function AdvancedSettings({ settings, updateSetting }: AdvancedSettingsProps) {
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [confirmEmailForDeletion, setConfirmEmailForDeletion] = useState('');
  const [cacheTTL, setCacheTTL] = useState(settings?.cacheTTL || '3600');
  const [logLevel, setLogLevel] = useState(settings?.logLevel || 'info');
  const [maxApiRetries, setMaxApiRetries] = useState(settings?.maxApiRetries || '3');
  const [downloadData, setDownloadData] = useState(false);
  const [advancedQueryMode, setAdvancedQueryMode] = useState(settings?.advancedQueryMode === 'true');
  const [exportSettingsDialog, setExportSettingsDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAdvancedQueryModeChange = (checked: boolean) => {
    setAdvancedQueryMode(checked);
    updateSetting('advancedQueryMode', checked.toString());
  };

  const handleCacheTTLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCacheTTL(value);
  };

  const handleMaxApiRetriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxApiRetries(value);
  };

  const handleLogLevelChange = (value: string) => {
    setLogLevel(value);
  };

  const handleDeleteAccount = () => {
    // In a real application, this would send a request to delete the account
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted. You will receive a confirmation email.",
    });
    setConfirmDeleteAccount(false);
    setConfirmEmailForDeletion('');
  };

  const handleExportData = () => {
    // In a real application, this would generate and download user data
    setDownloadData(true);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloadData(false);
      
      // Create a mock JSON file for download
      const userData = {
        profile: {
          id: 1,
          username: "faisal",
          email: "faisal@hamnatec.com",
          fullName: "Faisal",
          company: "Hamna Tec",
        },
        settings: {
          theme: "dark",
          emailNotifications: true,
          apiQuotaAlerts: true,
        },
        videos: [
          { id: 1, title: "YouTube SEO Tutorial 2025", status: "published" },
          { id: 2, title: "How to Rank #1 on YouTube", status: "published" }
        ]
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hamna-tec-user-data.json';
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    }, 2000);
  };

  const handleExportSettings = () => {
    // In a real application, this would export user settings
    
    // Create a mock settings file for download
    const settingsData = {
      appearance: {
        theme: "dark",
        fontSize: "medium",
        reducedMotion: false,
        highContrast: false,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        rankingAlerts: true,
        apiQuotaAlerts: true,
      },
      advanced: {
        cacheTTL: parseInt(cacheTTL),
        logLevel: logLevel,
        maxApiRetries: parseInt(maxApiRetries),
        advancedQueryMode: advancedQueryMode,
      }
    };
    
    const dataStr = JSON.stringify(settingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hamna-tec-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    
    setExportSettingsDialog(false);
    
    toast({
      title: "Settings Exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const saveAdvancedSettings = async () => {
    setIsSaving(true);
    
    try {
      await updateSetting('cacheTTL', cacheTTL);
      await updateSetting('logLevel', logLevel);
      await updateSetting('maxApiRetries', maxApiRetries);
      
      toast({
        title: "Advanced Settings Updated",
        description: "Your advanced settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving advanced settings:", error);
      toast({
        title: "Error",
        description: "Failed to save advanced settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#151827] border-[#1e2231] text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cog className="h-5 w-5 text-indigo-400" />
            <CardTitle>Advanced System Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Configure advanced system settings and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Performance</h3>
              
              <div className="space-y-2">
                <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                <Input
                  id="cache-ttl"
                  type="number"
                  value={cacheTTL}
                  onChange={handleCacheTTLChange}
                  className="bg-[#1e2231] border-[#2a3146] text-white"
                />
                <p className="text-xs text-gray-500">
                  Time-to-live for cached data in seconds. Lower values improve data freshness, higher values improve performance.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-api-retries">Max API Retries</Label>
                <Input
                  id="max-api-retries"
                  type="number"
                  value={maxApiRetries}
                  onChange={handleMaxApiRetriesChange}
                  className="bg-[#1e2231] border-[#2a3146] text-white"
                />
                <p className="text-xs text-gray-500">
                  Maximum number of times to retry failed API requests before giving up.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">System</h3>
              
              <div className="space-y-2">
                <Label htmlFor="log-level">Log Level</Label>
                <Select value={logLevel} onValueChange={handleLogLevelChange}>
                  <SelectTrigger className="bg-[#1e2231] border-[#2a3146] text-white">
                    <SelectValue placeholder="Select log level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                    <SelectItem value="debug">Debug (Verbose)</SelectItem>
                    <SelectItem value="info">Info (Standard)</SelectItem>
                    <SelectItem value="warn">Warn (Warnings & Errors)</SelectItem>
                    <SelectItem value="error">Error (Errors Only)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Controls the detail level of application logs.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Advanced Query Mode</Label>
                  <p className="text-xs text-gray-500">
                    Enable advanced YouTube API query optimizations
                  </p>
                </div>
                <Switch 
                  checked={advancedQueryMode} 
                  onCheckedChange={handleAdvancedQueryModeChange}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-indigo-400 font-medium mb-1">Advanced System Settings</p>
                <p className="text-sm text-gray-300">
                  These settings affect system performance and behavior. Only modify these settings if you understand the implications.
                  Changes may require a system restart to take full effect.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#1e2231] pt-4 flex justify-end">
          <Button 
            className="gradient-primary"
            onClick={saveAdvancedSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Advanced Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-[#151827] border-[#1e2231] text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Manage your account data and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="export-data" className="border-[#2a3146]">
              <AccordionTrigger className="hover:text-white">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Export Your Data</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                <p className="mb-4">
                  Download a copy of your personal data, including your profile information, videos, and analytics data.
                </p>
                <Button 
                  onClick={handleExportData}
                  disabled={downloadData}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {downloadData ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Exporting Data...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" /> Export My Data
                    </>
                  )}
                </Button>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="export-settings" className="border-[#2a3146]">
              <AccordionTrigger className="hover:text-white">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-blue-400" />
                  <span>Export Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                <p className="mb-4">
                  Export your system settings configuration to a JSON file that you can back up or transfer to another account.
                </p>
                <Dialog open={exportSettingsDialog} onOpenChange={setExportSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <FileJson className="h-4 w-4 mr-2" /> Export Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#151827] border-[#1e2231] text-white">
                    <DialogHeader>
                      <DialogTitle>Export Settings Configuration</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        This will export all your system settings to a JSON file.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#2a3146] mb-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div className="text-sm text-gray-300">
                            <p className="font-medium text-blue-400 mb-1">Settings Export</p>
                            <p>
                              Your settings export will include:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Theme and appearance preferences</li>
                              <li>Notification settings</li>
                              <li>Advanced system configurations</li>
                              <li>Custom workflow settings</li>
                            </ul>
                            <p className="mt-2">
                              Note: API keys and sensitive credentials will <strong>not</strong> be included in the export.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setExportSettingsDialog(false)}
                        className="border-[#2a3146] text-gray-400"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleExportSettings}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileJson className="h-4 w-4 mr-2" /> Download Settings
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="delete-account" className="border-[#2a3146]">
              <AccordionTrigger className="hover:text-white">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  <span>Delete Account</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium mb-1">Warning: This action cannot be undone</p>
                      <p className="text-sm text-gray-300">
                        Deleting your account will permanently remove all your data, including videos, analytics, and settings.
                        This action cannot be reversed.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Dialog open={confirmDeleteAccount} onOpenChange={setConfirmDeleteAccount}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#151827] border-[#1e2231] text-white">
                    <DialogHeader>
                      <DialogTitle>Confirm Account Deletion</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        This action cannot be undone. Please type your email to confirm.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <Label htmlFor="confirm-email">Enter your email to confirm</Label>
                        <Input
                          id="confirm-email"
                          placeholder="your-email@example.com"
                          value={confirmEmailForDeletion}
                          onChange={(e) => setConfirmEmailForDeletion(e.target.value)}
                          className="bg-[#1e2231] border-[#2a3146] text-white"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setConfirmDeleteAccount(false)}
                        className="border-[#2a3146] text-gray-400"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={confirmEmailForDeletion !== 'faisal@hamnatec.com'}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Permanently Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card className="bg-[#151827] border-[#1e2231] text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-400" />
            <CardTitle>Security Audit</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            System security information and audit options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#2a3146]">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-yellow-400" />
                <h3 className="font-medium">Session Management</h3>
              </div>
              <div className="text-sm text-gray-400">
                <p className="mb-2">Current active sessions: <span className="text-white">2</span></p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#2a3146] text-gray-300 w-full"
                >
                  Manage Active Sessions
                </Button>
              </div>
            </div>
            
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#2a3146]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <h3 className="font-medium">Security Status</h3>
              </div>
              <div className="text-sm text-gray-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p>Two-factor authentication: <span className="text-white">Enabled</span></p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p>Last password change: <span className="text-white">30 days ago</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p>Security audit: <span className="text-white">Up to date</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#2a3146]">
            <div className="flex items-start gap-3 mb-3">
              <Cpu className="h-5 w-5 text-indigo-400 mt-0.5" />
              <div>
                <h3 className="font-medium">System Information</h3>
                <p className="text-sm text-gray-400">Technical details about your instance</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Version</span>
                <span className="text-white">2.5.0</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-white">Today</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Environment</span>
                <span className="text-white">Production</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Database Status</span>
                <span className="text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#1e2231] pt-4">
          <Button 
            variant="outline" 
            className="border-[#2a3146] text-gray-300 w-full"
          >
            <Shield className="h-4 w-4 mr-2" /> Run Security Audit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}