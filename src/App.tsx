import { Suspense, lazy, useState } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const PitchesPage = lazy(() => import('./pages/PitchesPage').then((module) => ({ default: module.PitchesPage })));
const BookPage = lazy(() => import('./pages/BookPage').then((module) => ({ default: module.BookPage })));
const OrganizationsPage = lazy(() => import('./pages/OrganizationsPage').then((module) => ({ default: module.OrganizationsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));

const WHATSAPP_URL = 'https://wa.me/250792887614?text=Hello%20Soka%20Zone%2C%20I%20need%20help%20with%20booking.';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.97L0 24l6.32-1.66a11.9 11.9 0 0 0 5.75 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.43ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.04-1.39l-.36-.21-3.75.98 1-3.66-.24-.38a9.86 9.86 0 0 1-1.51-5.25c0-5.46 4.45-9.9 9.92-9.9a9.8 9.8 0 0 1 7.02 2.91 9.82 9.82 0 0 1 2.9 7c0 5.47-4.45 9.9-9.91 9.9Zm5.43-7.42c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.19-.18.2-.35.23-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.25-.6-.5-.51-.68-.52l-.58-.01c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.09 1.8-.74 2.05-1.45.25-.71.25-1.32.17-1.45-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}

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
      case 'admin':
        return <AdminPage onBackHome={() => setCurrentPage('home')} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-green-200 selection:text-green-900 flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-grow">
        <Suspense
          fallback={(
            <section className="bg-gray-50 min-h-screen py-16 px-4">
              <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
                <p className="text-gray-600">Loading page...</p>
              </div>
            </section>
          )}
        >
          {renderPage()}
        </Suspense>
      </main>
      <Footer onNavigate={setCurrentPage} />
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Soka Zone on WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-[#1EBE5D]"
      >
        <WhatsAppIcon />
      </a>
    </div>);

}