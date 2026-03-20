import React, { useState } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PitchesPage } from './pages/PitchesPage';
import { BookPage } from './pages/BookPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { ContactPage } from './pages/ContactPage';
export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'pitches':
        return <PitchesPage onNavigate={setCurrentPage} />;
      case 'book':
        return <BookPage />;
      case 'organizations':
        return <OrganizationsPage onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-200 selection:text-green-900 flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-grow">{renderPage()}</main>
      <Footer onNavigate={setCurrentPage} />
    </div>);

}