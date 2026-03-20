import React from 'react';
import { PageId } from '../components/Navbar';

// Local assets
const heroImage = "/assets/DSC02424 (1).jpg";
const universityImage = "/assets/DSC02259 (1).jpg";
const corporateImage = "/assets/DSC02308 (1).jpg";
const internationalImage = "/assets/DSC02616.jpg";
const schedulingImage = "/assets/DSC02336.jpg";
const managementImage = "/assets/DSC02260.jpg";
const paymentImage = "/assets/DSC02420.jpg";
const communityImage = "/assets/DSC02581 (1).jpg";

interface OrganizationsPageProps {
  onNavigate: (page: PageId) => void;
}

export function OrganizationsPage({ onNavigate }: OrganizationsPageProps) {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const whoWeServe = [
    {
      title: "Universities & Students",
      description: "Supporting student wellness, team sports, and campus tournaments",
      tags: ["Leagues", "Training", "Tournaments"],
      image: universityImage,
      color: "green",
    },
    {
      title: "Corporate Teams",
      description: "Team building, wellness programs, and after-work games",
      tags: ["Team Building", "Wellness", "After-Work"],
      image: corporateImage,
      color: "blue",
    },
    {
      title: "International Organizations",
      description: "Embassy communities, NGOs, and international businesses",
      tags: ["Community", "Networking", "Expatriates"],
      image: internationalImage,
      color: "yellow",
    },
  ];

  const universityFeatures = [
    {
      title: "Campus Sports Programs",
      description: "Hosting university teams, leagues and tournaments",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Flexible Scheduling",
      description: "Aligned with academic calendars and exam periods",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Student Wellness",
      description: "Promoting fitness, stress relief, and social connections",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const whyChooseUs = [
    {
      title: "Reliable Scheduling",
      description: "Games start on time, every time. Automated booking ensures no conflicts.",
      image: schedulingImage,
      color: "green",
    },
    {
      title: "Professional Management",
      description: "Well-maintained facilities with staff always on site to assist you.",
      image: managementImage,
      color: "blue",
    },
    {
      title: "Flexible Payment",
      description: "Easy payment options including MoMo, Visa, and corporate invoicing.",
      image: paymentImage,
      color: "yellow",
    },
    {
      title: "Community Building",
      description: "Connect with other teams, join leagues, and build lasting relationships.",
      image: communityImage,
      color: "green",
    },
  ];

  const partners = [
    { name: "TechNova", description: "Providing digital solutions for league management and player stats.", color: "blue" },
    { name: "UniCore", description: "Partnering for student wellness and inter-campus leagues.", color: "red" },
    { name: "VitalLife", description: "Promoting active lifestyles and community health initiatives.", color: "green" },
    { name: "BuildRight", description: "Building world-class sports infrastructure and facilities.", color: "orange" },
    { name: "FinCorp", description: "Supporting sustainable sports development and youth programs.", color: "indigo" },
    { name: "PowerGrid", description: "Powering our night games and sustainable facility operations.", color: "yellow" },
    { name: "GlobalMove", description: "Ensuring smooth operations and equipment transport for events.", color: "teal" },
    { name: "MediaStream", description: "Broadcasting the excitement of local football to the world.", color: "purple" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Corporate teams building connections through football" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/85"></div>
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Football That Strengthens Teams
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8">
              When football is played consistently in the right environment, teams communicate better, fitness improves, and connections form naturally.
            </p>
            <button
              onClick={() => { onNavigate('contact'); scrollToTop(); }}
              className="inline-block bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Who We Serve</h2>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-3xl mx-auto">
            From universities to corporate teams, we provide the perfect environment for football excellence
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whoWeServe.map((item, index) => (
              <div 
                key={index} 
                className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer h-96"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-${item.color}-900/90 via-${item.color}-700/40 to-transparent`}></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-white/90 mb-4">{item.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Universities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-green-600 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
              <img 
                src={universityImage} 
                alt="University sports" 
                className="relative rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                FOR UNIVERSITIES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Developing Student Athletes
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                We work with leading universities to provide professional facilities for their sports programs, promoting student wellness, team spirit, and healthy competition.
              </p>
              <div className="space-y-4">
                {universityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start group cursor-pointer">
                    <div className={`w-12 h-12 bg-${index === 0 ? 'green' : index === 1 ? 'blue' : 'green'}-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-600 transition-colors duration-300`}>
                      <div className={`text-${index === 0 ? 'green' : index === 1 ? 'blue' : 'green'}-600 group-hover:text-white transition-colors`}>
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

      {/* Why Organizations Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Organizations Choose Us
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Professional facilities and dedicated support for your team
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index} 
                className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer h-80"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-${item.color}-900/90 via-${item.color}-700/40 to-transparent`}></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-white/90 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Partners - Moving Carousel */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Partners</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Trusted by leading organizations across Rwanda
          </p>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
            <div className="flex animate-scroll">
              <div className="flex items-center gap-8 px-8">
                {partners.map((partner, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 w-64 h-40 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="text-center p-4">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-${partner.color}-100 flex items-center justify-center`}>
                        <svg className={`w-8 h-8 text-${partner.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="font-bold text-gray-700">{partner.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-8 px-8">
                {partners.map((partner, index) => (
                  <div 
                    key={`dup-${index}`} 
                    className="flex-shrink-0 w-64 h-40 bg-white rounded-xl shadow-md flex items-center justify-center hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="text-center p-4">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-${partner.color}-100 flex items-center justify-center`}>
                        <svg className={`w-8 h-8 text-${partner.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="font-bold text-gray-700">{partner.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Let's Build Your Football Program
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us to discuss regular bookings, league scheduling, or custom arrangements for your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { onNavigate('contact'); scrollToTop(); }}
              className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </button>
            <button
              onClick={() => { onNavigate('book'); scrollToTop(); }}
              className="inline-block border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Book a Pitch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
