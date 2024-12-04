import Link from "next/link";
import { FaHome, FaInfoCircle, FaListAlt, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="navbar bg-gradient-to-r from-[#8e44ad] to-[#3498db] shadow-md fixed w-full z-10 top-0 left-0">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8a65] to-[#ffe0b2]">
            Timetable Genie
          </span>
        </div>

        {/* Nav Links */}
        <div className="nav-links flex space-x-6 text-lg text-white">
          <Link href="/" >
            <p className="nav-link hover:text-[#ff8a65] hover:scale-105 transform transition-all">
              <FaHome className="inline-block mr-2" />
              Home
            </p>
          </Link>
          <Link href="/timetables" >
            <p className="nav-link hover:text-[#ff8a65] hover:scale-105 transform transition-all">
              <FaListAlt className="inline-block mr-2" />
              Time Tables
            </p>
          </Link>
          <Link href="/about">
            <p className="nav-link hover:text-[#ff8a65] hover:scale-105 transform transition-all">
              <FaInfoCircle className="inline-block mr-2" />
              About
            </p>
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className="mobile-menu bg-gradient-to-r from-[#8e44ad] to-[#3498db] lg:hidden absolute w-full top-full left-0 p-4">
        <ul className="space-y-4 text-white text-lg">
          <li>
            <Link href="/" passHref>
              <p className="nav-link block hover:text-[#ff8a65]">Home</p>
            </Link>
          </li>
          <li>
            <Link href="#features" passHref>
              <p className="nav-link block hover:text-[#ff8a65]">Features</p>
            </Link>
          </li>
          <li>
            <Link href="#about" passHref>
              <p className="nav-link block hover:text-[#ff8a65]">About</p>
            </Link>
          </li>
          <li>
            <Link href="#contact" passHref>
              <p className="nav-link block hover:text-[#ff8a65]">Contact</p>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
