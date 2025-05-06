import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { UserProfile } from "@/hooks/use-settings";
import { Save, User, Camera, X } from "lucide-react";

type ProfileSettingsProps = {
  profile: UserProfile | null;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
};

export function ProfileSettings({ profile, updateProfile }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    company: profile?.company || '',
    phone: profile?.phone || '',
    timezone: profile?.timezone || 'UTC',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // List of timezones
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'CST', label: 'CST (Central Standard Time)' },
    { value: 'MST', label: 'MST (Mountain Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'IST', label: 'IST (Indian Standard Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'AEST', label: 'AEST (Australian Eastern Standard Time)' },
    { value: 'CET', label: 'CET (Central European Time)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTimezoneChange = (value: string) => {
    setFormData({
      ...formData,
      timezone: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      setIsUploading(true);
      
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        timezone: formData.timezone,
        // In a real implementation, we would also upload the profile image
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription className="text-gray-400">
          Update your account profile information and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-32 w-32">
                {profileImage ? (
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-[#2a3146]">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                    <button 
                      className="absolute top-1 right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : profile?.fullName ? (
                  <div className="h-32 w-32 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-[#2a3146]">
                    <span className="text-white text-4xl font-bold">
                      {profile.fullName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-[#1a1f2e] border-4 border-[#2a3146] flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-500" />
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 bg-[#1a1f2e] hover:bg-[#252a3a] transition-colors px-4 py-2 rounded-lg">
                    <Camera className="h-4 w-4" />
                    <span>Change Image</span>
                  </div>
                  <Input 
                    id="profile-image" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
              
              <div className="text-center text-sm text-gray-400">
                <p>Recommended image size:</p>
                <p>300x300 pixels (max 2MB)</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-[#1e2231] border-[#2a3146] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#1e2231] border-[#2a3146] text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company / Organization</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Enter your company name"
                  value={formData.company}
                  onChange={handleChange}
                  className="bg-[#1e2231] border-[#2a3146] text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#1e2231] border-[#2a3146] text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger className="bg-[#1e2231] border-[#2a3146] text-white">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us a little about yourself"
                value={formData.bio}
                onChange={handleChange}
                className="min-h-[100px] bg-[#1e2231] border-[#2a3146] text-white"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4 flex justify-end">
        <Button 
          className="gradient-primary"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Profile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}