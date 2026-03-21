import React from 'react';
import { PageHero } from '../components/PageHero';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
export function ContactPage() {
  const contactMethods = [
  {
    icon: <Mail className="w-6 h-6 text-white" />,
    iconBg: 'bg-green-500',
    title: 'Email',
    content: 'sokazone@gmail.com',
    isLink: true,
    href: 'mailto:sokazone@gmail.com',
    linkColor: 'text-green-600'
  },
  {
    icon: <Phone className="w-6 h-6 text-white" />,
    iconBg: 'bg-blue-500',
    title: 'Phone',
    content: '+250 787 104 894',
    isLink: true,
    href: 'tel:+250787104894',
    linkColor: 'text-green-600'
  },
  {
    icon: <MapPin className="w-6 h-6 text-white" />,
    iconBg: 'bg-green-600',
    title: 'Visit Us',
    content: 'Soka Zone\nKK102St, Sanitas Kanombe',
    isLink: false
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    iconBg: 'bg-amber-500',
    title: 'Hours',
    content: 'Open Daily\nMorning to Late Evening',
    isLink: false
  }];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <PageHero
        title="Let's Set Up Your Game Properly"
        subtitle="For bookings, enquiries, or organized group sessions, reach out and we'll handle it professionally."
        backgroundImage="/assets/facility.webp"
        overlayColor="blue">
        
        <a
          href="mailto:sokazone@gmail.com"
          className="bg-white text-blue-900 hover:bg-gray-100 px-6 py-2 rounded-md font-bold transition-colors">
          
          Send us an Email
        </a>
        <a
          href="tel:+250787104894"
          className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-6 py-2 rounded-md font-bold transition-colors">
          
          Call Us Now
        </a>
      </PageHero>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help you book your perfect game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) =>
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start">
              
                <div
                className={`w-12 h-12 ${method.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {method.title}
                </h3>
                {method.isLink ?
              <a
                href={method.href}
                className={`${method.linkColor} hover:underline font-medium`}>
                
                    {method.content}
                  </a> :

              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {method.content}
                  </p>
              }
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Location
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find us easily at our location in Kigali
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-96 w-full bg-gray-200 flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.456789012345!2d30.059!3d-1.953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258f8e2b3d%3A0x1a1a1a1a1a1a1a1a!2sKK%20102%20St%2C%20Kigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Soka Zone Location"
              />
            </div>
            <div className="p-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Soka Zone</h3>
                  <p className="text-gray-600">
                    KK102St, Sanitas Kanombe<br />
                    Kigali, Rwanda
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>);

}