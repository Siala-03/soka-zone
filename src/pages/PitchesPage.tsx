import React from 'react';
import { PageId } from '../components/Navbar';

// Local assets
const heroImage = "/assets/pitch1.webp";
const turfImage = "/assets/pitch2.webp";
const actionImage = "/assets/pitch3.webp";
const nightImage = "/assets/night.webp";
const matchImage = "/assets/players4.webp";
const lightingImage = "/assets/night.webp";
const facilitiesImage = "/assets/facility.webp";

interface PitchesPageProps {
  onNavigate: (page: PageId) => void;
}

export function PitchesPage({ onNavigate }: PitchesPageProps) {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const facilities = [
    {
      title: "Premium Turf",
      subtitle: "FIFA-Standard Surface",
      description: "Professional artificial turf that plays true",
      items: ["✓ Even Surface", "✓ All-Weather"],
      image: turfImage,
      color: "green",
    },
    {
      title: "7-a-Side Perfect",
      subtitle: "7-a-Side Excellence",
      description: "Optimal dimensions for tactical football",
      items: ["✓ Strategic Play", "✓ Team Building"],
      image: actionImage,
      color: "blue",
    },
    {
      title: "Night Games",
      subtitle: "24/7 Availability",
      description: "LED lighting for perfect visibility",
      items: ["✓ Evening Play", "✓ Pro Lighting"],
      image: nightImage,
      color: "yellow",
    },
  ];

  const features = [
    {
      title: "Perfect Dimensions",
      description: "Ideal pitch size for tactical 7-a-side play with proper spacing",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Team Building",
      description: "Build chemistry with the optimal team size for engagement",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Fast-Paced Action",
      description: "Quick passing, high tempo, and continuous play guaranteed",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const qualityFeatures = [
    {
      title: "Even Surface",
      description: "Consistent playing field across the entire pitch",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Perfect Ball Roll",
      description: "Predictable ball movement for quality play",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Daily Maintenance",
      description: "Professional upkeep standards every day",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Built to Last",
      description: "Durable for intensive weekly play",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
    },
  ];

  const completeFacilities = [
    {
      title: "Professional Lighting",
      description: "LED floodlights for crystal-clear visibility during night games",
      image: lightingImage,
    },
    {
      title: "Player Amenities",
      description: "Changing rooms, seating areas, and rest spaces for teams",
      image: facilitiesImage,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional 7-aside Football Pitch" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-700/80"></div>
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for Football That Deserves Respect
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8">
              Premium 7-a-side pitches with professional artificial turf
            </p>
            <button
              onClick={() => { onNavigate('book'); scrollToTop(); }}
              className="inline-block bg-white text-green-700 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Book Your Pitch
            </button>
          </div>
        </div>
      </section>

      {/* Experience Our Facilities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Experience Our Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer h-80"
              >
                <img 
                  src={facility.image} 
                  alt={facility.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="text-white text-2xl font-bold">{facility.title}</h3>
                </div>
                <div className={`absolute inset-0 bg-${facility.color}-600/95 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-8`}>
                  <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-bold mb-4">{facility.subtitle}</h3>
                    <p className="text-lg mb-4">{facility.description}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      {facility.items.map((item, i) => (
                        <span key={i} className="bg-white/20 px-3 py-1 rounded-full">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Designed for 7-a-Side Football */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
              <img 
                src={matchImage} 
                alt="7-a-side match" 
                className="relative rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                7-A-SIDE SPECIALISTS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Designed for 7-a-Side Football
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Our pitches are specifically optimized for 7-a-side matches - the perfect format for tactical play, team building, and competitive football.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start group">
                    <div className={`w-12 h-12 bg-${index === 0 ? 'blue' : index === 1 ? 'green' : 'yellow'}-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-${index === 0 ? 'blue' : index === 1 ? 'green' : 'yellow'}-600 transition-colors duration-300`}>
                      <div className={`text-${index === 0 ? 'blue' : index === 1 ? 'green' : 'yellow'}-600 group-hover:text-white transition-colors`}>
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Pitch Quality */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Premium Pitch Quality
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Professional standards maintained daily
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Facilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Complete Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {completeFacilities.map((facility, index) => (
              <div 
                key={index} 
                className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer h-96"
              >
                <img 
                  src={facility.image} 
                  alt={facility.title} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8">
                  <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
                    <h3 className="text-white text-3xl font-bold mb-2">{facility.title}</h3>
                    <p className="text-white/90 text-lg">{facility.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Play 7-a-Side?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Book your pitch now and experience the difference of premium facilities
          </p>
          <button
            onClick={() => { onNavigate('book'); scrollToTop(); }}
            className="inline-block bg-white text-green-600 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Book a Pitch Now
          </button>
        </div>
      </section>
    </div>
  );
}
