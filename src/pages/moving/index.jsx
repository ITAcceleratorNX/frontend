import React from 'react';
import { Header } from '../../widgets';
import vectorLeaves from '../../assets/Vector_038 (Illustrator Vectors) svg-01 2.png';
import mainImg from '../../assets/image 17.png';
import topOverlay from '../../assets/Vector 3.png';
import bottomOverlay from '../../assets/Vector 2.png';
import autoLayout from '../../assets/Auto Layout Horizontal.png';
import image21 from '../../assets/image 21.png';
import kazakhstanMap from '../../assets/Kazakhstan.png';
import frameCheck from '../../assets/Frame.svg';
import LinkedInIcon from '../../assets/linkedin black.1.svg';
import InstagramIcon from '../../assets/instagram black.1.svg';
import YouTubeIcon from '../../assets/youtube color.1.svg';
import RoundPlaceIcon from '../../assets/round-place-24px.svg';
import RoundPhoneIcon from '../../assets/round-phone-24px.svg';

const MovingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      {/* Первый фрейм: Заказать доставку */}
      <section className="relative w-full h-[500px] mt-5 flex items-center justify-center">
        <img src={mainImg} alt="Delivery Truck" className="absolute inset-0 w-full h-[414px] top-20 object-cover z-10" />
        <img src={topOverlay} alt="top shape" className="absolute top-0 bottom-0 left-0 w-full h-[205px] z-20" />
        <img src={bottomOverlay} alt="bottom shape" className="absolute bottom-0 left-0 w-full h-[140px] z-20" />
        <div className="absolute z-30 top-[50px] flex flex-col items-center space-y-4">
          <div className="flex items-center">
            <img src={vectorLeaves} alt="deco" className="w-10 h-10 mr-1" />
            <h1 className="text-[40px] md:text-[55px] font-bold text-[#F86812] font-['Montserrat']">
              ЗАКАЗАТЬ ДОСТАВКУ
            </h1>
            <img src={vectorLeaves} alt="deco" className="w-10 h-10 ml-1" />
          </div>
          <button className="bg-[#F86812] text-white px-20 py-1 rounded-full text-lg font-medium hover:bg-[#d87d1c] transition-colors font-['Montserrat']">
            заказать доставку
          </button>
        </div>
      </section>
      {/* Второй фрейм: Гарантия */}
      <section className="w-full flex flex-col items-center justify-center -mt-[165px] pt-[150px] font-['DM Sans']">
        <h2 className="text-[42px] md:text-[44px] font-bold text-[#273655] text-center mb-4">
          Гарантия сохранности ваших вещей
        </h2>
        <p className="text-[#273655] text-left max-w-[720px] ml-[-58px] mb-8 text-[18px] leading-snug">
          В любой точке Алматы наши специалисты приедут, упакуют, погрузят и доставят ваши вещи на склад хранения. Вам не нужно беспокоиться о разборке мебели — мы предоставляем полный комплекс услуг по мувингу и хранению вещей. Ваши вещи под надежной защитой.
        </p>
        <div className="w-full flex justify-center">
          <img src={autoLayout} alt="Features" className="w-full max-w-[770px] object-contain" />
        </div>
      </section>
      {/* Третий фрейм: О компании */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between mt-44 mb-20 max-w-[1200px] mx-auto">
        <div className="flex-1 flex flex-col items-start justify-center md:pr-12">
          <h2 className="text-[#F86812] text-[36px] md:text-[38px] font-bold font-['DM Sans'] leading-tight ml-[1px] mb-4">
            Lorem Ipsum is simply<br />dummy
          </h2>
          <div className="bg-white rounded-xl shadow-none p-0 mb-2">
            <h3 className="text-[#273655] text-lg font-medium font-['DM Sans'] ml-[1px] mb-2">Lorem Ipsum is simply dummy</h3>
            <p className="text-[#273655] text-sm font-normal font-['DM Sans'] ml-[1px] mb-4 max-w-[350px]">
              Welcome to Burger Bliss, where we take your cravings to a whole new level! Our mouthwatering burgers are made from 100% beef and are served on freshly baked buns.
            </p>
            <button className="border border-[#D9D9D9] text-[#273655] px-5 py-1 rounded-full text-sm ml-[1px] font-['DM Sans'] hover:bg-[#f5f5f5] transition-colors">
              Do something
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center mr-[70px] mt-8 md:mt-0">
          <img src={image21} alt="Warehouse" className="rounded-2xl w-full max-w-[420px] h-[320px] mt-10 object-cover shadow-md" />
        </div>
      </section>
      {/* Четвертый фрейм: Описание и карта */}
      <section className="w-full flex flex-col items-left justify-center mt-10 mb-24">
        <h2 className="text-[#273655] text-[32px] md:text-[36px] font-bold font-['DM Sans'] text-left ml-[105px] mb-6">
          Lorem Ipsum is simply dummy
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-start gap-12 ml-[106px] mb-10 max-w-[900px] w-full">
          <p className="text-[#273655] text-base font-normal font-['DM Sans'] max-w-[450px]">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters
          </p>
          <p className="text-[#273655] text-base font-normal font-['DM Sans'] max-w-[450px]">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters
          </p>
        </div>
        <div className="w-full flex justify-center">
          <img src={kazakhstanMap} alt="Kazakhstan map" className="w-full max-w-[800px] object-contain" />
        </div>
      </section>
      {/* Пятый фрейм: Сравнение тарифов */}
      <section className="w-full flex flex-col items-center justify-center mt-[150px] mb-20 font-['Inter']">
        <div className="w-full mb-20 max-w-[1100px] bg-white border border-[#E6E9F5] overflow-x-auto shadow-sm">
          <table className="w-full text-[#222] text-[15px] font-normal border-collapse">
            <thead>
              <tr className="border-b border-[#E6E9F5]">
                <th className="text-left align-bottom font-['Roboto'] p-6 py-10 w-[220px] font-bold text-[18px]">
                  Compare plans <span className="ml-2 text-xs font-medium bg-white text-[#222] px-4 py-2 rounded-full border border-[#858BA0]">40% Off</span>
                  <div className="text-xs font-normal font-['Inter'] text-[#888] mt-2">Choose your workspace plan according to your organisational plan</div>
                </th>
                <th className="text-center align-bottom p-6 w-[220px] border-l border-[#E6E9F5]">
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] font-bold">$15 <span className="text-xs text-[#858BA0] align-middle">/помощь в складе</span></span>
                    <button className="bg-[#F86812] text-white rounded font-semibold px-6 py-2 text-[16px] w-full mt-3">Choose This Plan</button>
                  </div>
                </th>
                <th className="text-center align-bottom p-6 w-[220px] border-l border-[#E6E9F5]">
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] font-bold">$20 <span className="text-xs text-[#858BA0] align-middle">/доставка</span></span>
                    <button className="bg-[#F86812] text-white rounded font-semibold px-6 py-2 text-[16px] w-full mt-3">Choose This Plan</button>
                  </div>
                </th>
                <th className="text-center align-bottom p-6 w-[220px] border-l border-[#E6E9F5]">
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] font-bold">$30 <span className="text-xs text-[#858BA0] align-middle">/упаковка+доставка</span></span>
                    <button className="bg-[#F86812] text-white rounded font-semibold px-6 py-2 text-[16px] w-full mt-3">Choose This Plan</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E6E9F5]">
                <td className="p-4 text-[#222]">Number of Users</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">20 Pages</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">600 Pages<br /><span className="text-xs text-[#858BA0]">Pages Add-ons on Demand</span></td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">Unlimited<br /><span className="text-xs text-[#858BA0]">Pages Add-ons on Demand</span></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Users Per Page</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">5 Pages</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">50 Pages</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">Unlimited<br /><span className="text-xs text-[#858BA0]">Pages Add-ons on Demand</span></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Includes essential features to get started</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">More advanced features for increased productivity</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Designing & Development</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Customizable options to meet your specific needs</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Secure data storage</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Email Support</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">24/7 customer support</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Analytics and reporting</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr>
                <td className="p-4 text-[#222]">Account Management</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="mt-20 bg-[#F86812] text-white rounded-full px-20 py-1 text-[20px] font-medium font-['Montserrat'] hover:bg-[#d87d1c] transition-colors">заказать доставку</button>
      </section>
      <footer className="bg-[#0A142F] w-[1417px] h-[450px] text-white font-['Assistant'] mt-48">
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
    </div>
  );
};

export default MovingPage; 