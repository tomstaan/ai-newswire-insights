
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Bell, Video, Filter, Headphones } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <header className="border-b border-newswire-lightGray">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top header with date and sections */}
        <div className="py-2 text-xs text-newswire-mediumGray flex justify-between items-center border-b border-newswire-lightGray">
          <div className="hidden md:flex gap-4">
            <span>Internal Platform</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex gap-4">
            <Link to="/dashboard" className="hover:text-newswire-black">Dashboard</Link>
            <Link to="/login" className="hover:text-newswire-black">Sign In</Link>
          </div>
        </div>
        
        {/* Main header with logo and search */}
        <div className="py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={24} />
            </Button>
            <a 
              href="/" 
              className="text-4xl font-display font-bold tracking-tight flex items-center"
              onClick={(e) => handleNavigation(e, '/')}
            >
              NEWSWIRE
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User size={20} />
            </Button>
            <Button variant="outline" className="hidden md:inline-flex">
              134 / 100 <Video className="ml-2" size={16} />
            </Button>
            <Button className="hidden md:inline-flex bg-orange-500 hover:bg-orange-600">
              <Headphones className="mr-2" size={16} />
              Talk to a Licensing Expert
            </Button>
          </div>
        </div>
        
        {/* Navigation menu */}
        <nav className="py-2 border-t border-newswire-lightGray hidden md:block">
          <ul className="flex gap-6 text-sm font-medium overflow-x-auto">
            <li>
              <a 
                href="/" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/')}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="/top-stories" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/top-stories')}
              >
                Top Videos
              </a>
            </li>
            <li>
              <a 
                href="/trending" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/trending')}
              >
                Trending
              </a>
            </li>
            <li>
              <a 
                href="/categories" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/categories')}
              >
                Categories
              </a>
            </li>
            <li>
              <a 
                href="/regions" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/regions')}
              >
                Regions
              </a>
            </li>
            <li>
              <a 
                href="/licensed" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/licensed')}
              >
                Licensed
              </a>
            </li>
            <li>
              <a 
                href="/restricted" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/restricted')}
              >
                Restricted
              </a>
            </li>
            <li>
              <a 
                href="/cleared" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/cleared')}
              >
                Cleared
              </a>
            </li>
            <li>
              <a 
                href="/licenses" 
                className="hover:text-newswire-accent whitespace-nowrap"
                onClick={(e) => handleNavigation(e, '/licenses')}
              >
                My Licenses
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
