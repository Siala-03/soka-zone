import React from 'react';
interface PageHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlayColor: 'dark' | 'green' | 'blue';
  children?: React.ReactNode;
}
export function PageHero({
  title,
  subtitle,
  backgroundImage,
  overlayColor,
  children
}: PageHeroProps) {
  const overlayClasses = {
    dark: 'bg-black/40',
    green: 'bg-green-900/70',
    blue: 'bg-blue-900/70'
  };
  return (
    <section className="relative w-full h-[80vh] min-h-[550px] flex items-center justify-center overflow-hidden">
      {/* Background Image with lazy loading */}
      <img 
        src={backgroundImage} 
        alt="" 
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlayColor]}`} />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl drop-shadow-md font-medium">
          {subtitle}
        </p>
        {children &&
        <div className="flex flex-wrap justify-center gap-4">{children}</div>
        }
      </div>
    </section>);

}
