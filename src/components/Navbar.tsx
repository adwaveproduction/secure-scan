
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8",
        scrolled ? "py-3 blur-backdrop shadow-sm" : "py-6 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="font-semibold text-lg">
          <span className="sr-only">Home</span>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-foreground mr-2"></div>
            <span className="text-lg font-medium">Precision</span>
          </div>
        </a>
        
        <nav className="hidden md:flex space-x-8">
          {["Products", "Features", "About", "Contact"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center">
          <button className="btn-secondary text-sm hidden md:block">
            Learn More
          </button>
          
          <button className="md:hidden p-2 rounded-md hover:bg-foreground/5">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
