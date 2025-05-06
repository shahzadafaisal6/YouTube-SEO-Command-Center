import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AccountSettings } from "./account-settings";
import { ScrollArea } from "@/components/ui/scroll-area";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SidebarItem = {
  icon: string;
  label: string;
  value: string;
};

const sidebarSections = [
  {
    title: "General",
    items: [
      { icon: "ri-user-settings-line", label: "Account", value: "account" },
      { icon: "ri-team-line", label: "Team & Permissions", value: "team" },
      { icon: "ri-palette-line", label: "Appearance", value: "appearance" },
      { icon: "ri-translate-2", label: "Language & Region", value: "language" },
    ]
  },
  {
    title: "Integration",
    items: [
      { icon: "ri-youtube-line", label: "YouTube API", value: "youtube-api" },
      { icon: "ri-openai-fill", label: "OpenAI API", value: "openai-api" },
      { icon: "ri-eye-line", label: "Vision API", value: "vision-api" },
      { icon: "ri-google-line", label: "OAuth Integration", value: "oauth" },
    ]
  },
  {
    title: "System",
    items: [
      { icon: "ri-database-2-line", label: "Database", value: "database" },
      { icon: "ri-cache-line", label: "Caching & Performance", value: "caching" },
      { icon: "ri-shield-keyhole-line", label: "Security", value: "security" },
      { icon: "ri-backup-line", label: "Backup & Recovery", value: "backup" },
    ]
  },
  {
    title: "Advanced",
    items: [
      { icon: "ri-code-s-slash-line", label: "API Configuration", value: "api-config" },
      { icon: "ri-webhook-line", label: "Webhooks", value: "webhooks" },
      { icon: "ri-function-line", label: "SEO Algorithm", value: "seo-algorithm" },
    ]
  }
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("account");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSections = searchTerm ? 
    sidebarSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(section => section.items.length > 0) : 
    sidebarSections;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0" hideClose>
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="font-heading font-medium text-xl">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-64 border-r border-border overflow-y-auto bg-card">
            <div className="p-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search settings..."
                  className="bg-muted border border-input text-sm pl-10 pr-4 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <i className="ri-search-line"></i>
                </div>
              </div>
            </div>
            
            <div className="px-3">
              {filteredSections.map((section) => (
                <div key={section.title} className="py-2">
                  <p className="text-xs uppercase text-gray-500 px-3 mb-2 tracking-wider">{section.title}</p>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.value} className="mb-1">
                        <button
                          onClick={() => setActiveTab(item.value)}
                          className={`flex items-center rounded-lg px-3 py-2 w-full text-left ${
                            activeTab === item.value 
                              ? "text-white bg-accent" 
                              : "text-gray-400 hover:text-white hover:bg-muted"
                          }`}
                        >
                          <i className={`${item.icon} mr-3 text-lg`}></i>
                          <span>{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsContent value="account">
                    <AccountSettings />
                  </TabsContent>
                  
                  <TabsContent value="team">
                    <h3 className="font-heading font-medium text-lg mb-6">Team & Permissions</h3>
                    <p className="text-muted-foreground">Configure team members and their access permissions.</p>
                  </TabsContent>
                  
                  <TabsContent value="appearance">
                    <h3 className="font-heading font-medium text-lg mb-6">Appearance</h3>
                    <p className="text-muted-foreground">Customize the look and feel of your dashboard.</p>
                  </TabsContent>
                  
                  <TabsContent value="youtube-api">
                    <h3 className="font-heading font-medium text-lg mb-6">YouTube API Settings</h3>
                    <p className="text-muted-foreground">Configure your YouTube API integration and quota management.</p>
                  </TabsContent>
                  
                  <TabsContent value="openai-api">
                    <h3 className="font-heading font-medium text-lg mb-6">OpenAI API Settings</h3>
                    <p className="text-muted-foreground">Configure your OpenAI API integration and model preferences.</p>
                  </TabsContent>
                  
                  {/* Add more tabs as needed */}
                </Tabs>
              </div>
            </ScrollArea>
            
            <DialogFooter className="px-6 py-4 border-t border-border">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button>
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
