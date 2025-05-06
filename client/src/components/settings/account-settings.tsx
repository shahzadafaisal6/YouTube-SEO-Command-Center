import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/hooks/use-settings";
import { User, UserPlus, Mail, Lock, UserCheck } from "lucide-react";

type AccountSettingsProps = {
  profile: UserProfile | null;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
};

export function AccountSettings({ profile, updateProfile }: AccountSettingsProps) {
  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-orange-400" />
          <CardTitle>Account Settings</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Manage your account information and status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1f2e] rounded-lg p-5 border border-[#2a3146]">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Account Status</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Current status: <span className="text-green-400">Active</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                    Verified Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a1f2e] rounded-lg p-5 border border-[#2a3146]">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Account Type</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Current plan: <span className="text-blue-400">Professional</span>
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] divide-y divide-[#2a3146]">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-medium">Email Address</h3>
                <p className="text-sm text-gray-400">{profile?.email || 'faisal@hamnatec.com'}</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#2a3146] text-gray-300">
              Change
            </Button>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-gray-400">Last changed 30 days ago</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#2a3146] text-gray-300">
              Change
            </Button>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-sm text-gray-400">Who can see your public profile</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#2a3146] text-gray-300">
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4">
        <Button variant="destructive" className="w-full">
          Deactivate Account
        </Button>
      </CardFooter>
    </Card>
  );
}