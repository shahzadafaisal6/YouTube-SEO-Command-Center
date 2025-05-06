import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type SidebarItem = {
  href: string;
  icon: string;
  label: string;
};

const mainItems: SidebarItem[] = [
  { href: "/", icon: "ri-dashboard-line", label: "Dashboard" },
  { href: "/videos", icon: "ri-video-line", label: "My Videos" },
  { href: "/analytics", icon: "ri-bar-chart-line", label: "Analytics" },
  { href: "/keyword-research", icon: "ri-search-line", label: "Keyword Research" },
  { href: "/competitor-analysis", icon: "ri-user-search-line", label: "Competitor Analysis" },
  { href: "/ai-assistant", icon: "ri-robot-line", label: "AI Assistant" },
  { href: "/api-quota", icon: "ri-database-2-line", label: "API Quota" },
];

const toolItems: SidebarItem[] = [
  { href: "/tools/title-generator", icon: "ri-magic-line", label: "Title Generator" },
  { href: "/tools/description-writer", icon: "ri-file-text-line", label: "Description Writer" },
  { href: "/tools/tag-optimizer", icon: "ri-price-tag-3-line", label: "Tag Optimizer" },
  { href: "/tools/thumbnail-analyzer", icon: "ri-image-line", label: "Thumbnail Analyzer" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-[#1e2231] bg-[#151827] flex flex-col h-full overflow-hidden transition-all duration-200">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center border-b border-[#1e2231]">
        <div className="gradient-primary rounded-lg h-8 w-8 flex items-center justify-center mr-3">
          <span className="font-bold text-white">H</span>
        </div>
        <h1 className="font-heading font-semibold text-lg text-white">Hamna Tec</h1>
      </div>
      
      {/* Nav Sections */}
      <div className="pt-2 overflow-y-auto flex-1 px-2">
        {/* Primary Nav */}
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-500 px-3 mb-2 tracking-wider">Main</p>
          <ul>
            {mainItems.map((item) => (
              <li className="mb-1" key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2",
                    location === item.href
                      ? "text-white bg-[#252a3a]"
                      : "text-gray-400 hover:text-white hover:bg-[#1e2231]"
                  )}
                >
                  <i className={cn(item.icon, "mr-3 text-lg")}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Tools Nav */}
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-500 px-3 mb-2 tracking-wider">Tools</p>
          <ul>
            {toolItems.map((item) => (
              <li className="mb-1" key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2",
                    location === item.href
                      ? "text-white bg-[#252a3a]"
                      : "text-gray-400 hover:text-white hover:bg-[#1e2231]"
                  )}
                >
                  <i className={cn(item.icon, "mr-3 text-lg")}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="px-4 py-3 border-t border-[#1e2231] flex items-center">
        <img src="https://ui-avatars.com/api/?name=Faisal&background=6366F1&color=fff" alt="User" className="w-8 h-8 rounded-full mr-3" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">Faisal</p>
          <p className="text-xs text-gray-400 truncate">faisal@hamnatec.com</p>
        </div>
        <Link 
          href="/settings"
          className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#1e2231]"
        >
          <i className="ri-settings-3-line"></i>
        </Link>
      </div>
    </aside>
  );
}
