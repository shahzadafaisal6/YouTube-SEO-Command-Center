import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserSettings } from "@/hooks/use-settings";
import { Palette, Moon, Sun, Monitor, Check } from "lucide-react";

type AppearanceSettingsProps = {
  settings: UserSettings;
  updateSetting: (key: string, value: string) => Promise<void>;
};

export function AppearanceSettings({ settings, updateSetting }: AppearanceSettingsProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
    (settings?.theme as 'light' | 'dark' | 'system') || 'dark'
  );
  const [fontType, setFontType] = React.useState(settings?.font_type || 'inter');
  const [reduceAnimations, setReduceAnimations] = React.useState(
    settings?.reduce_animations === 'true'
  );
  const [reduceMotion, setReduceMotion] = React.useState(
    settings?.reduce_motion === 'true'
  );
  
  React.useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  const handleThemeChange = async (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    await updateSetting('theme', value);
  };
  
  const handleFontChange = async (value: string) => {
    setFontType(value);
    await updateSetting('font_type', value);
    
    // Apply font class to document
    const root = document.documentElement;
    root.classList.remove('font-inter', 'font-manrope', 'font-jetbrains');
    root.classList.add(`font-${value}`);
  };
  
  const handleReduceAnimationsToggle = async (checked: boolean) => {
    setReduceAnimations(checked);
    await updateSetting('reduce_animations', checked.toString());
    
    // Apply reduced animations class to document
    const root = document.documentElement;
    if (checked) {
      root.classList.add('reduce-animations');
    } else {
      root.classList.remove('reduce-animations');
    }
  };
  
  const handleReduceMotionToggle = async (checked: boolean) => {
    setReduceMotion(checked);
    await updateSetting('reduce_motion', checked.toString());
    
    // Apply reduced motion class to document
    const root = document.documentElement;
    if (checked) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };
  
  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-400" />
          <CardTitle>Appearance Settings</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Customize the look and feel of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] space-y-4 p-6">
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          
          <RadioGroup 
            value={theme} 
            onValueChange={(value) => handleThemeChange(value as 'light' | 'dark' | 'system')}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem 
                value="light" 
                id="theme-light" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#2a3146] bg-[#252a3a] p-4 hover:bg-[#2a2f41] hover:border-[#3a4156] peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-950/20 cursor-pointer"
              >
                <Sun className="mb-3 h-6 w-6 text-gray-400 peer-data-[state=checked]:text-indigo-400" />
                <div className="font-medium">Light</div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="dark" 
                id="theme-dark" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#2a3146] bg-[#252a3a] p-4 hover:bg-[#2a2f41] hover:border-[#3a4156] peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-950/20 cursor-pointer"
              >
                <Moon className="mb-3 h-6 w-6 text-gray-400 peer-data-[state=checked]:text-indigo-400" />
                <div className="font-medium">Dark</div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="system" 
                id="theme-system" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#2a3146] bg-[#252a3a] p-4 hover:bg-[#2a2f41] hover:border-[#3a4156] peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-950/20 cursor-pointer"
              >
                <Monitor className="mb-3 h-6 w-6 text-gray-400 peer-data-[state=checked]:text-indigo-400" />
                <div className="font-medium">System</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] space-y-4 p-6">
          <h3 className="text-lg font-medium mb-4">Font</h3>
          
          <RadioGroup 
            value={fontType} 
            onValueChange={handleFontChange}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem 
                value="inter" 
                id="font-inter" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="font-inter"
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#2a3146] bg-[#252a3a] p-4 hover:bg-[#2a2f41] hover:border-[#3a4156] peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-950/20 cursor-pointer"
              >
                <div className="font-sans text-2xl mb-3">Aa</div>
                <div className="font-medium">Inter</div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="manrope" 
                id="font-manrope" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="font-manrope"
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#2a3146] bg-[#252a3a] p-4 hover:bg-[#2a2f41] hover:border-[#3a4156] peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-950/20 cursor-pointer"
              >
                <div className="font-serif text-2xl mb-3">Aa</div>
                <div className="font-medium">Manrope</div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="jetbrains" 
                id="font-jetbrains" 
                className="sr-only peer" 
              />
              <Label
                htmlFor="font-jetbrains"
                className="flex flex-col items-center justify-between rounded-md border-2 border-[#2a3146] bg-[#252a3a] p-4 hover:bg-[#2a2f41] hover:border-[#3a4156] peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-950/20 cursor-pointer"
              >
                <div className="font-mono text-2xl mb-3">Aa</div>
                <div className="font-medium">JetBrains</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] p-6">
          <h3 className="text-lg font-medium mb-4">Accessibility</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reduce animations</h4>
                <p className="text-sm text-gray-400">
                  Disable non-essential animations and transitions
                </p>
              </div>
              <Switch 
                checked={reduceAnimations}
                onCheckedChange={handleReduceAnimationsToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reduce motion</h4>
                <p className="text-sm text-gray-400">
                  Minimize movement in the interface
                </p>
              </div>
              <Switch 
                checked={reduceMotion}
                onCheckedChange={handleReduceMotionToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">High contrast mode</h4>
                <p className="text-sm text-gray-400">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Larger text</h4>
                <p className="text-sm text-gray-400">
                  Increase the size of text throughout the interface
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4 flex justify-between">
        <div className="text-sm text-gray-400">
          {theme === 'dark' ? 
            "Dark theme is currently active" : 
            theme === 'light' ? 
              "Light theme is currently active" : 
              "System preference theme is currently active"
          }
        </div>
        <Button 
          variant="outline" 
          className="border-[#2a3146] text-gray-300"
          onClick={() => handleThemeChange('dark')}
        >
          Reset to Defaults
        </Button>
      </CardFooter>
    </Card>
  );
}