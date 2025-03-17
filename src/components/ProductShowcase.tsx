
import React, { useRef, useEffect } from "react";

const ProductShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !productRef.current) return;
      
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1)
      const scrollProgress = 1 - Math.max(0, Math.min(1, (top / (windowHeight - height * 0.5)) + 0.5));
      
      // Apply rotation based on scroll
      productRef.current.style.transform = `
        perspective(1000px) 
        rotateY(${scrollProgress * 20}deg) 
        rotateX(${scrollProgress * -10}deg)
        scale(${0.9 + scrollProgress * 0.1})
      `;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="products" 
      className="py-24 overflow-hidden relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-secondary/50"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
            <span className="inline-block py-1 px-3 mb-5 text-xs font-medium bg-secondary rounded-full slide-up-delay-1">
              Perfection in every detail
            </span>
            <h2 className="text-3xl md:text-4xl font-medium mb-6 slide-up-delay-2">
              Elevate your experience with unparalleled craftsmanship
            </h2>
            <p className="text-foreground/70 mb-8 leading-relaxed slide-up-delay-3 text-balance">
              We believe that great design is not just about how something looks, but how it works.
              Experience the perfect balance of form and function with our meticulously crafted products.
            </p>
            
            <div className="space-y-6 slide-up-delay-3">
              {/* Product specs */}
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Ultra-responsive design</h4>
                  <p className="text-sm text-foreground/70">Engineered to respond to your every touch with speed and precision.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 10L12 14L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Premium materials</h4>
                  <p className="text-sm text-foreground/70">Only the finest materials that feel great to the touch and stand the test of time.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Intuitive interface</h4>
                  <p className="text-sm text-foreground/70">Every interaction feels natural and effortless, eliminating complexity.</p>
                </div>
              </div>
            </div>
            
            <button className="btn-primary mt-10 slide-up-delay-3">
              Discover the Collection
            </button>
          </div>
          
          <div className="w-full lg:w-1/2 flex justify-center">
            <div 
              ref={productRef} 
              className="relative w-full max-w-md transition-transform duration-300 bg-white rounded-2xl p-8 shadow-xl"
            >
              {/* Product */}
              <div className="aspect-square rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-foreground/90 rounded-xl shadow-lg flex items-center justify-center">
                  <div className="w-1/2 h-1/2 bg-white rounded-lg"></div>
                </div>
              </div>
              
              {/* Product info */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-medium mb-2">Precision Model X</h3>
                <p className="text-sm text-foreground/70 mb-4">The pinnacle of refined design</p>
                <div className="flex justify-center space-x-4">
                  <span className="text-sm font-medium">$1,299</span>
                  <span className="text-sm text-foreground/50 line-through">$1,499</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
