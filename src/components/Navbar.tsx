import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
export type PageId = 'home' | 'pitches' | 'book' | 'organizations' | 'contact';
interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}
export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks: {
    name: string;
    id: PageId;
  }[] = [
  {
    name: 'Home',
    id: 'home'
  },
  {
    name: 'Pitches',
    id: 'pitches'
  },
  {
    name: 'Book Now',
    id: 'book'
  },
  {
    name: 'Organizations',
    id: 'organizations'
  },
  {
    name: 'Contact',
    id: 'contact'
  }];

  const handleNavigate = (id: PageId) => {
    onNavigate(id);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };
  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => handleNavigate('home')}>
            
            <div className="flex items-center gap-2">
              {/* Logo */}
              <img
                src="/assets/logo.webp"
                alt="Soka Zone Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
            <button
              key={link.id}
              onClick={() => handleNavigate(link.id)}
              className={`font-medium transition-colors ${currentPage === link.id ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}>
              
                {link.name}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu">
              
              {isOpen ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen &&
      <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) =>
          <button
            key={link.id}
            onClick={() => handleNavigate(link.id)}
            className={`block w-full text-left px-3 py-3 text-base font-medium rounded-md ${currentPage === link.id ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'}`}>
            
                {link.name}
              </button>
          )}
          </div>
        </div>
      }
    </nav>);

}