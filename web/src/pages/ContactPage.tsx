import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 mt-32 mb-12 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-4 md:p-8">
          <div
            className="elfsight-app-7ff885dd-fca6-4a65-ad21-e10d798a8fbb"
            data-elfsight-app-lazy
          ></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
