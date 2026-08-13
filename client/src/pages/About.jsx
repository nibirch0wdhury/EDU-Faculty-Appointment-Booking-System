import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About EDU Appointment System</h1>
        <div className="card space-y-6">
          <p>
            The EDU Appointment System is a comprehensive web application designed to streamline
            the process of booking appointments with faculty members at East Delta University.
          </p>
          <p>
            Our mission is to eliminate the inefficiencies of traditional appointment booking
            methods and provide a seamless digital experience for both students and faculty members.
          </p>
          <div className="bg-primary-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-primary-800">Key Benefits</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Real-time faculty availability</li>
              <li>✓ Easy appointment booking and cancellation</li>
              <li>✓ Automated notifications and reminders</li>
              <li>✓ Centralized management for administrators</li>
              <li>✓ Mobile-friendly responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;