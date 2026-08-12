import React from 'react';

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <div className="card space-y-6">
          <p className="text-center text-gray-600">
            Have questions or need assistance? We're here to help!
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">242020612@eastdelta.edu.bd</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">+880XXXXXXXXXX</p>
            </div>
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="input-field" />
            <input type="email" placeholder="Your Email" className="input-field" />
            <textarea placeholder="Your Message" className="input-field" rows="4"></textarea>
            <button className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;