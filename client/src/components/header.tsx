import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ui/theme-provider';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-[#1e2231] bg-[#151827] flex items-center justify-between px-6">
      {/* Left section with page title */}
      <div className="flex items-center">
        <h2 className="font-heading font-medium text-xl">Dashboard</h2>
      </div>
      
      {/* Right section with actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            className="bg-[#1e2231] border border-[#252a3a] text-sm rounded-lg text-white pl-10 pr-4 py-2 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <i className="ri-search-line"></i>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <i className="ri-question-line text-xl"></i>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <i className="ri-sun-line text-xl"></i>
            ) : (
              <i className="ri-moon-line text-xl"></i>
            )}
          </Button>
          
          <Button className="ml-2 gradient-primary">
            <i className="ri-add-line mr-1"></i> New Analysis
          </Button>
        </div>
      </div>
    </header>
  );
}
