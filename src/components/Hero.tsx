
import React, { useEffect, useRef } from "react";

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      const elements = heroRef.current.querySelectorAll('.parallax-element');
      elements.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        const speed = parseFloat(htmlEl.dataset.speed || '0.05');
        const rotateX = y * 10 * speed;
        const rotateY = -x * 10 * speed;
        const translateX = x * 20 * speed;
        const translateY = y * 20 * speed;
        
        htmlEl.style.transform = `
          translate3d(${translateX}px, ${translateY}px, 0)
          rotateX(${rotateX}deg) rotateY(${rotateY}deg)
        `;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden"
    >
      {/* Abstract background shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute top-[15%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-primary opacity-60 blur-3xl parallax-element"
          data-speed="0.03"
        ></div>
        <div 
          className="absolute bottom-[10%] left-[15%] w-[25vw] h-[25vw] rounded-full bg-accent opacity-50 blur-3xl parallax-element"
          data-speed="0.05"
        ></div>
      </div>
      
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-1/2 lg:pr-12">
          <div className="max-w-xl">
            <span className="inline-block py-1 px-3 mb-5 text-xs font-medium bg-secondary rounded-full slide-up-delay-1">
              Designed with precision. Crafted with care.
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-tight mb-6 slide-up-delay-2">
              <span className="block">Simplicity is the</span> 
              <span className="block">ultimate sophistication</span>
            </h1>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed slide-up-delay-3 text-balance">
              Discover the perfect harmony of design and functionality. 
              Every detail meticulously crafted, every interaction thoughtfully designed.
            </p>
            
            <div className="flex flex-wrap gap-4 slide-up-delay-3">
              <button className="btn-primary">
                Explore Products
              </button>
              <button className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
          <div className="relative">
            {/* Main product image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover-scale parallax-element" data-speed="0.02">
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden">
                <div className="subtle-glass absolute inset-0 animate-blur-in"></div>
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                  <div className="h-56 w-56 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                    <div className="h-40 w-40 bg-foreground rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div 
              className="absolute -bottom-6 -left-6 w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center parallax-element animate-float" 
              data-speed="0.08"
            >
              <div className="h-12 w-12 rounded-xl bg-accent"></div>
            </div>
            
            <div 
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center parallax-element animate-float" 
              style={{ animationDelay: '1s' }}
              data-speed="0.06"
            >
              <div className="h-10 w-10 rounded-full bg-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
