import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const About = () => {
  return (
    <>
      <Navbar />
      <div
        className="min-h-screen flex items-center justify-center py-8 mt-10"
        style={{
          backgroundImage: "url('/images/about_bg.jpg')",  // Add your own background image here
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4 md:mx-auto">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00695c] to-[#8e44ad] mb-4">
            About Timetable Genie
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Welcome to Timetable Genie, a revolutionary platform designed to simplify the scheduling process for educational institutions. Our mission is to provide an intuitive tool that helps schools, colleges, and universities easily create, manage, and optimize their timetables.
          </p>
          <p className="text-gray-700 text-lg mb-6">
            We understand the challenges institutions face when it comes to scheduling. That’s why we’ve created a customizable, user-friendly platform that allows users to define periods, subjects, and teacher availability. We aim to save time and reduce errors while providing flexibility in creating the most efficient timetable possible.
          </p>
          <p className="text-gray-700 text-lg mb-6">
            Whether you are a small school or a large university, Timetable Genie adapts to your needs. Join us in transforming the way timetables are created and managed, and experience the power of simplicity and efficiency.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-bold py-2 px-4 rounded hover:bg-[#4f94b0] transform hover:scale-105 transition-all"
          >
            Go Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
