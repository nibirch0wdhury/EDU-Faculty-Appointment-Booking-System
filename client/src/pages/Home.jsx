import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Calendar className="w-12 h-12 text-primary-600" />,
      title: 'Live Schedules',
      description: 'View faculty availability in real-time and book appointments instantly.',
    },
    {
      icon: <Clock className="w-12 h-12 text-primary-600" />,
      title: 'Easy Booking',
      description: 'Request, view, and cancel appointments without any hassle.',
    },
    {
      icon: <Users className="w-12 h-12 text-primary-600" />,
      title: 'User Dashboards',
      description: 'Dedicated dashboards for students, faculty, and administrators.',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-primary-600" />,
      title: 'Organized Communication',
      description: 'Remove confusion and streamline the appointment process.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Book Faculty Appointments with Ease
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              East Delta University's centralized appointment system. Find faculty availability,
              book meetings instantly, and manage your schedule efficiently.
            </p>
            <div className="space-x-4">
              <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Get Started
              </Link>
              <Link to="/about" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose EDU Appointment System?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account as a student or faculty member.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Available Slots</h3>
              <p className="text-gray-600">Browse faculty schedules and find a time that works for you.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Confirm</h3>
              <p className="text-gray-600">Book your appointment and get instant confirmation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;