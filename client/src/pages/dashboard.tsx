import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ExecutiveOverview } from "@/components/dashboard/executive-overview";
import { VideoPerformance } from "@/components/dashboard/video-performance";
import { KeywordInsights } from "@/components/dashboard/keyword-insights";
import { ApiQuota } from "@/components/dashboard/api-quota";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { SettingsModal } from "@/components/settings/settings-modal";

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {/* Executive Overview Section */}
          <ExecutiveOverview />
          
          {/* Dashboard Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Video Performance Widget */}
            <VideoPerformance />
            
            {/* Right Column */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Top Keywords Widget */}
              <KeywordInsights />
              
              {/* API Quota Widget */}
              <ApiQuota />
            </div>
          </div>
          
          {/* Pending Tasks Section */}
          <PendingTasks />
        </main>
      </div>
      
      {/* Settings Modal */}
      <div id="settings-modal" className="hidden">
        <SettingsModal 
          open={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
        />
      </div>

      {/* Event listener for settings button */}
      <script type="text/javascript" dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const settingsButtons = document.querySelectorAll('[class*="ri-settings"]');
            settingsButtons.forEach(button => {
              button.addEventListener('click', () => {
                window.setIsSettingsOpen(true);
              });
            });
          });
        `
      }} />
    </div>
  );
}
