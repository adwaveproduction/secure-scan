
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <a href="/" className="font-semibold text-lg inline-flex items-center mb-6">
              <div className="h-8 w-8 rounded-md bg-foreground mr-2"></div>
              <span className="text-lg font-medium">Precision</span>
            </a>
            <p className="text-sm text-foreground/70 mb-6 max-w-xs">
              Crafting exceptional experiences through meticulous design and precision engineering.
            </p>
            <div className="flex space-x-4">
              {["twitter", "instagram", "facebook", "linkedin"].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-foreground hover:text-white transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-base mb-6">Products</h3>
            <ul className="space-y-3">
              {["Model X", "Model Y", "Accessories", "New Releases"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-base mb-6">Company</h3>
            <ul className="space-y-3">
              {["About Us", "Careers", "Press", "Sustainability"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-base mb-6">Support</h3>
            <ul className="space-y-3">
              {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60 mb-4 md:mb-0">
            © {new Date().getFullYear()} Precision. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-xs text-foreground/60 hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-foreground/60 hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-foreground/60 hover:text-foreground transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
