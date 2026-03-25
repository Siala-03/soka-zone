import React from 'react';
import { PageId } from '../components/Navbar';

// Local assets
const heroImage = "/assets/field1.jpeg";
const pitchImage = "/assets/field2.jpeg";
const actionImage = "/assets/field3.jpeg";
const nightImage = "/assets/small_night.webp";
const teamImage = "/assets/small_players1.webp";
const playersImage = "/assets/small_pitch4.webp";
const galleryImages = [
  "/assets/field1.jpeg",
  "/assets/field3.jpeg",
  "/assets/small_players4.webp",
  "/assets/field2.jpeg",
  "/assets/small_pitch3.webp",
  "/assets/small_night.webp",
];

const eventImages = [
  "/assets/small_tournament.webp",
  "/assets/field3.jpeg",
  "/assets/small_tournament2.webp",
];

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const features = [
    {
      title: "Professional Pitch",
      subtitle: "Premium Artificial Turf",
      description: "Professional-grade surface designed for serious football",
      items: ["FIFA-standard quality", "Even playing surface", "Regular maintenance"],
      image: pitchImage,
      color: "green",
    },
    {
      title: "Live the Action",
      subtitle: "Competitive Matches",
      description: "Where teams compete and champions emerge",
      items: ["5-a-side & 7-a-side", "League hosting", "Tournament ready"],
      image: actionImage,
      color: "blue",
    },
    {
      title: "Night Games",
      subtitle: "Evening Sessions",
      description: "Play under professional floodlights",
      items: ["LED floodlights", "Evening schedules", "All-year availability"],
      image: nightImage,
      color: "yellow",
    },
  ];

  const stats = [
    { number: "20+", label: "Active Teams", description: "Organizations and teams trust Soka Zone for their football needs" },
    { number: "95%", label: "Satisfaction Rate", description: "Players love our facilities and professional service" },
    { number: "50+", label: "Weekly Games", description: "Matches played every week on our premium pitches" },
  ];

  const benefits = [
    {
      title: "Professional Turf",
      description: "High-quality artificial grass that plays true every single time",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: "Reliable Scheduling",
      description: "Book online and play on time, every time, no conflicts",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Night Games",
      description: "LED floodlights for perfect visibility during evening matches",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  const facilities = [
    { title: "Team Spirit", description: "Foster camaraderie and teamwork in a professional environment", image: teamImage, color: "green" },
    { title: "Quality Equipment", description: "FIFA-approved footballs, quality goals, and professional equipment", image: pitchImage, color: "blue" },
    { title: "Night Lighting", description: "State-of-the-art LED floodlights for evening and night games", image: nightImage, color: "yellow" },
    { title: "Premium Pitch", description: "Professionally maintained artificial turf for optimal play", image: actionImage, color: "green" },
  ];

  const featuresList = [
    "Corporate teams and organizations",
    "University and school teams",
    "Embassy and international community teams",
    "Casual groups who value good facilities",
  ];

  const events = [
    { title: "Soka Zone 7-aside tournament", date: "27 December 2025", image: eventImages[0] },
    { title: "Rwandair Vs Inkontanyi - Rwanda Corporate League", date: "22 October 2025", image: eventImages[1] },
    { title: "African Leadership University Vs University of Rwanda", date: "10 October 2025", image: eventImages[2] },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px]">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Soka Zone Pitch" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Where Good Football Lives
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Professional pitches for serious players in Kigali
            </p>
            <button
              onClick={() => { onNavigate('book'); scrollToTop(); }}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Book a Pitch
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer h-80"
              >
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="text-white text-3xl font-bold">{feature.title}</h3>
                </div>
                <div className={`absolute inset-0 bg-${feature.color}-600/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8`}>
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-4">{feature.subtitle}</h3>
                    <p className="text-lg mb-4">{feature.description}</p>
                    <ul className="text-left space-y-2">
                      {feature.items.map((item, i) => (
                        <li key={i} className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <div className="text-5xl font-bold mb-2">{stats[0].number}</div>
              <div className="text-xl font-semibold mb-2">{stats[0].label}</div>
              <p className="text-blue-100">{stats[0].description}</p>
            </div>
            <div className="bg-green-700 rounded-2xl p-8 text-white">
              <div className="text-5xl font-bold mb-2">{stats[1].number}</div>
              <div className="text-xl font-semibold mb-2">{stats[1].label}</div>
              <p className="text-green-100">{stats[1].description}</p>
            </div>
            <div className="bg-yellow-500 rounded-2xl p-8 text-white">
              <div className="text-5xl font-bold mb-2">{stats[2].number}</div>
              <div className="text-xl font-semibold mb-2">{stats[2].label}</div>
              <p className="text-yellow-100">{stats[2].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Soka Zone */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Soka Zone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-green-800 rounded-2xl p-8 text-white">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-3xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-green-100">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Facilities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer">
                <img 
                  src={facility.image} 
                  alt={facility.title} 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex items-end p-4">
                  <h4 className="text-white font-bold text-lg">{facility.title}</h4>
                </div>
                <div className={`absolute inset-0 bg-${facility.color}-600/95 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center text-white`}>
                  <h4 className="font-bold text-xl mb-3">{facility.title}</h4>
                  <p className="text-sm leading-relaxed">{facility.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Players */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Players Who Take the Game Seriously
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Whether you're a corporate team building camaraderie, a university squad training for competition, or friends who just love quality football - Soka Zone provides the environment where good football happens.
              </p>
              <ul className="space-y-4">
                {featuresList.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={playersImage} 
                alt="Players in action" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <div className="inline-block">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Gallery</h2>
              <div className="h-1 w-24 bg-orange-500"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg mb-12">
            Capturing the moments that make Soka Zone special
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer h-80 premium-card">
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Organizations */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by Leading Organizations and Country Embassies
          </h2>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
            <div className="flex animate-scroll">
              <div className="flex items-center gap-8 px-8">
                {[
                  { name: "Rwanda Civil Aviation", image: "/assets/RCAA.jfif" },
                  { name: "Akagera Aviation", image: "/assets/akagera.png" },
                  { name: "Sudanese Community", image: "/assets/Sudan.svg" },
                  { name: "Cameroon", image: "/assets/Cameroon.png" },
                  { name: "Kenya", image: "/assets/Kenya.webp" },
                  { name: "Nigeria", image: "/assets/Nigeria.webp" },
                  { name: "Ethiopia", image: "/assets/Ethiopia.png" },
                  { name: "Chinese", image: "/assets/china.png" },
                  { name: "Team X", image: "/assets/TeamX.png" },
                ].map((org, index) => (
                  <div key={index} className="flex-shrink-0 w-64 h-40 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-xl transition-shadow overflow-hidden p-4">
                    <img src={org.image} alt={org.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-8 px-8">
                {[
                  { name: "Rwanda Civil Aviation", image: "/assets/RCAA.jfif" },
                  { name: "Akagera Aviation", image: "/assets/akagera.png" },
                  { name: "Sudanese Community", image: "/assets/Sudan.svg" },
                  { name: "Cameroon", image: "/assets/Cameroon.png" },
                  { name: "Kenya", image: "/assets/Kenya.webp" },
                  { name: "Nigeria", image: "/assets/Nigeria.webp" },
                  { name: "Ethiopia", image: "/assets/Ethiopia.png" },
                  { name: "Chinese", image: "/assets/china.png" },
                  { name: "Team X", image: "/assets/TeamX.png" },
                ].map((org, index) => (
                  <div key={`dup-${index}`} className="flex-shrink-0 w-64 h-40 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-xl transition-shadow overflow-hidden p-4">
                    <img src={org.image} alt={org.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <div className="inline-block">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Latest Events</h2>
              <div className="h-1 w-24 bg-orange-500"></div>
            </div>
          </div>
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-300 pb-2 inline-block">Events</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-lg mb-4 h-64">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h4>
                <p className="text-gray-500 text-sm">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Play at Soka Zone?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Book your pitch now and experience the difference
          </p>
          <button
            onClick={() => { onNavigate('book'); scrollToTop(); }}
            className="inline-block bg-white text-green-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Book a Pitch Now
          </button>
        </div>
      </section>
    </div>
  );
}
