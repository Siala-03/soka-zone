import React from 'react';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { PageId } from './Navbar';
interface FooterProps {
  onNavigate: (page: PageId) => void;
}
export function Footer({ onNavigate }: FooterProps) {
  const handleNavigate = (e: React.MouseEvent, id: PageId) => {
    e.preventDefault();
    onNavigate(id);
    window.scrollTo(0, 0);
  };
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 text-white mb-6 cursor-pointer"
              onClick={(e) => handleNavigate(e, 'home')}>
              
              <img
                src="/assets/logo-transparent.png"
                alt="Soka Zone Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed">
              Professional football pitches for serious players in Kigali. We
              provide top-tier facilities for matches, training, and
              tournaments.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavigate(e, 'home')}
                  className="hover:text-green-500 transition-colors">
                  
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavigate(e, 'pitches')}
                  className="hover:text-green-500 transition-colors">
                  
                  Our Pitches
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavigate(e, 'book')}
                  className="hover:text-green-500 transition-colors">
                  
                  Book Now
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavigate(e, 'organizations')}
                  className="hover:text-green-500 transition-colors">
                  
                  Organizations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleNavigate(e, 'contact')}
                  className="hover:text-green-500 transition-colors">
                  
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>123 Sports Avenue, Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>+250 787 104 894</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>info@sokazone.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-6">Newsletter</h3>
            <p className="text-sm mb-4">
              Subscribe to get updates on tournaments and special offers.
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => e.preventDefault()}>
              
              <input
                type="email"
                placeholder="Your email address"
                className="bg-gray-900 border border-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:border-green-500 text-sm" />
              
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm w-full md:w-auto">
                
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} Soka Zone. All rights reserved.</p>
            <p className="text-gray-400 mt-1">Developed by Siala Solutions</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>);

}