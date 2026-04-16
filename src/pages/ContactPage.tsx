import { PageHero } from '../components/PageHero';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/250789619991?text=Hello%20Soka%20Zone%2C%20I%20need%20help%20with%20booking.';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" aria-hidden="true" fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.97L0 24l6.32-1.66a11.9 11.9 0 0 0 5.75 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.43ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.04-1.39l-.36-.21-3.75.98 1-3.66-.24-.38a9.86 9.86 0 0 1-1.51-5.25c0-5.46 4.45-9.9 9.92-9.9a9.8 9.8 0 0 1 7.02 2.91 9.82 9.82 0 0 1 2.9 7c0 5.47-4.45 9.9-9.91 9.9Zm5.43-7.42c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.19-.18.2-.35.23-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.25-.6-.5-.51-.68-.52l-.58-.01c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.09 1.8-.74 2.05-1.45.25-.71.25-1.32.17-1.45-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}

export function ContactPage() {
  const contactMethods = [
  {
    icon: <Mail className="w-6 h-6 text-white" />,
    iconBg: 'bg-green-500',
    title: 'Email',
    content: 'sokazone@outlook.com',
    isLink: true,
    href: 'mailto:sokazone@outlook.com',
    linkColor: 'text-green-600'
  },
  {
    icon: <Phone className="w-6 h-6 text-white" />,
    iconBg: 'bg-blue-500',
    title: 'Phone',
    content: '+250 792 887 614',
    isLink: true,
    href: 'tel:+250792887614',
    linkColor: 'text-green-600'
  },
  {
    icon: <WhatsAppIcon />,
    iconBg: 'bg-[#25D366]',
    title: 'WhatsApp',
    content: '+250 789 619 991',
    isLink: true,
    href: WHATSAPP_URL,
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
        backgroundImage="/assets/small_facility.webp"
        overlayColor="blue">
        
        <a
          href="mailto:sokazone@outlook.com"
          className="bg-white text-blue-900 hover:bg-gray-100 px-6 py-2 rounded-md font-bold transition-colors">
          
          Send us an Email
        </a>
        <a
          href="tel:+250792887614"
          className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-6 py-2 rounded-md font-bold transition-colors">
          
          Call Us Now
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white hover:bg-[#1EBE5D] px-6 py-2 rounded-md font-bold transition-colors inline-flex items-center gap-2">
          <WhatsAppIcon />
          Chat on WhatsApp
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