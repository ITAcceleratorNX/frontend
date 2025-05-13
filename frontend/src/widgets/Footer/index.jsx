import React from 'react';
import RoundPlaceIcon from '../../assets/round-place-24px.svg';
import RoundPhoneIcon from '../../assets/round-phone-24px.svg';
import LinkedInIcon from '../../assets/linkedin black.1.svg';
import YouTubeIcon from '../../assets/youtube color.1.svg';
import InstagramIcon from '../../assets/instagram black.1.svg';

const Footer = () => (
  <footer className="bg-[#0A142F] w-full h-[450px] text-white font-['Assistant'] mt-48">
    <div className="container mx-auto px-4">
      <hr className="border-t border-[#FFFFFF] mt-20 mb-10 ml-20 mr-20 opacity-50"/>
      <div className="flex flex-col md:flex-row items-start justify-between py-8">
        <h2 className="text-7xl py-6 ml-20 font-bold font-['Audiowide']">ExtraSpace</h2>
        <div className="flex flex-col md:items-start md:text-left mt-4 md:mt-0">
          <a href="#" className="flex items-center mb-2 mr-40">
            <img src={RoundPlaceIcon} alt="location" className="w-6 h-6 mr-2" />
            <span>345 Faulconer Drive, Suite 4 · Charlottesville, CA, 12345</span>
          </a>
          <a href="tel:(123)456-7890" className="flex items-center mb-4">
            <img src={RoundPhoneIcon} alt="phone" className="w-6 h-6 mr-2" />
            <span>(123) 456-7890</span>
          </a>
          <div className="flex space-x-3 mt-5">
            <span className="uppercase text-xs mb-2">Social Media</span>
            <a href="#"><img src={LinkedInIcon} alt="LinkedIn" className="w-6 h-6" /></a>
            <a href="#"><img src={YouTubeIcon} alt="YouTube" className="w-6 h-6" /></a>
            <a href="#"><img src={InstagramIcon} alt="Instagram" className="w-6 h-6 mt-[3.5px]" /></a>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <nav className="flex space-x-8 uppercase text-xs ml-20">
          <a href="#" className="hover:underline">About Us</a>
          <a href="#" className="hover:underline">Contact Us</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </nav>
        <div className="text-xs text-[#A6A6A6] mr-20">Copyright © 2018 · Lift Media Inc.</div>
      </div>
      <hr className="border-t border-[#FFFFFF] my-4 ml-20 mr-20 opacity-50"/>
    </div>
  </footer>
);

export default Footer;
