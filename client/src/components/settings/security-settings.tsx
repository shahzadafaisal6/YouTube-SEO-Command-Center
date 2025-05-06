import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/hooks/use-settings";
import { Shield, KeyRound, AlertCircle, Bell, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SecuritySettingsProps = {
  profile: UserProfile | null;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
};

export function SecuritySettings({ profile, updateProfile }: SecuritySettingsProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = React.useState(
    profile?.twoFactorEnabled || false
  );
  
  const handleTwoFactorToggle = async (checked: boolean) => {
    setIsTwoFactorEnabled(checked);
    await updateProfile({ twoFactorEnabled: checked });
  };
  
  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          <CardTitle>Security Settings</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Manage your account security and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {profile?.googleId && (
          <Alert className="bg-green-900/20 text-green-400 border-green-800">
            <Check className="h-4 w-4" />
            <AlertTitle>You're signed in with Google</AlertTitle>
            <AlertDescription>
              Your account is secured by Google's authentication. You can still enhance security with 2FA.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] space-y-4 p-4">
          <div className="flex justify-between items-center py-4 border-b border-[#2a3146]">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-[#252a3a] flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-gray-400">Update your account password</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-[#2a3146]"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </Button>
          </div>
          
          <div className="flex justify-between items-center py-4 border-b border-[#2a3146]">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-[#252a3a] flex items-center justify-center">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
              </div>
            </div>
            <div className="flex items-center">
              <Switch 
                checked={isTwoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                className="mr-4"
              />
            </div>
          </div>
          
          {isTwoFactorEnabled && (
            <div className="bg-[#252a3a] p-4 rounded-lg">
              <h3 className="font-medium mb-2">2FA is enabled</h3>
              <p className="text-sm text-gray-400 mb-4">
                You'll be prompted for an authentication code when logging in.
              </p>
              <div className="border border-[#2a3146] rounded-lg p-3 mb-4">
                <Label htmlFor="recovery-codes" className="text-sm block mb-2">Recovery Codes</Label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="bg-[#1e2231] p-2 rounded">HTEC-A1B2C3</div>
                  <div className="bg-[#1e2231] p-2 rounded">HTEC-D4E5F6</div>
                  <div className="bg-[#1e2231] p-2 rounded">HTEC-G7H8I9</div>
                  <div className="bg-[#1e2231] p-2 rounded">HTEC-J0K1L2</div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  <AlertCircle className="h-3 w-3 inline-block mr-1" />
                  Save these codes in a secure place. You'll need them if you lose access to your authentication app.
                </p>
              </div>
              <Button 
                variant="outline"
                size="sm" 
                className="border-[#2a3146] text-gray-300 w-full"
              >
                Reset 2FA
              </Button>
            </div>
          )}
          
          <div className="flex justify-between items-center py-4">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-[#252a3a] flex items-center justify-center">
                <Bell className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium">Login Notifications</h3>
                <p className="text-sm text-gray-400">Get alerted about new logins to your account</p>
              </div>
            </div>
            <div className="flex items-center">
              <Switch className="mr-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] space-y-4 p-4">
          <h3 className="font-medium mb-2">Recent Login Activity</h3>
          
          <div className="space-y-3">
            <div className="bg-[#252a3a] p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Pakistan, Gujranwala</p>
                <p className="text-xs text-gray-400">Today, 2:15 PM • Chrome on Windows</p>
              </div>
              <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">
                Current Session
              </div>
            </div>
            
            <div className="bg-[#252a3a] p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Pakistan, Lahore</p>
                <p className="text-xs text-gray-400">Yesterday, 10:42 AM • Safari on macOS</p>
              </div>
            </div>
            
            <div className="bg-[#252a3a] p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Pakistan, Islamabad</p>
                <p className="text-xs text-gray-400">May 2, 2025, 3:18 PM • Firefox on Windows</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="border-[#2a3146] text-gray-300 mt-2 w-full"
          >
            View All Sessions
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4 flex justify-between">
        <div className="text-sm text-gray-400">
          Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
        <Button 
          variant="destructive" 
          size="sm"
        >
          Log Out All Devices
        </Button>
      </CardFooter>
    </Card>
  );
}