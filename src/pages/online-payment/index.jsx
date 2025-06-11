import React, { useEffect } from 'react';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';
import Vector038 from '../../assets/Vector_038.svg';
import image85 from '../../assets/image 85.png';
import ShieldEye from '../../assets/Shield Eye@2x.png';
import eyeScan from '../../assets/Eye Scan.svg';
import hand from '../../assets/hand.png';
import fingerprint from '../../assets/fingerprint.png';
import group1010 from '../../assets/group 1010.png';

const OnlinePaymentPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white font-sans">
      <Header />

      {/* Main Section */}
      <div className="w-full flex flex-col items-center justify-center pt-20 pb-10">
        <div className="flex items-center justify-center mb-2 mt-[-20px]">
          <img src={Vector038} alt="icon" className="w-10 h-10 mr-2 mt-[-5px]" />
          <h1 className="text-[35px] md:text-[35px] font-bold text-[#273655] font-['Montserrat'] text-center tracking-[0.05em]">
            Информация об онлайн-оплате для<br />сайта extraspace.kz
          </h1>
          <img src={Vector038} alt="icon" className="w-10 h-10 ml-2 mt-[-5px]" />
        </div>
      </div>

      {/* Платежи. Оплата банковской картой онлайн */}
      <section className="w-full bg-[#273551] py-16 px-4 mb-10">
        <div className="max-w-6xl pl-28 mx-auto flex flex-col md:flex-row items-center md:items-start justify-between">
          <div className="flex-shrink-0 mb-8 md:mb-0 md:-mr-4">
            <img src={image85} alt="bank card payment" className="w-[330px] h-[330px] object-contain" />
          </div>
          <div className="flex-1 text-left mr-32 max-w-[485px]">
            <h2 className="text-[30px] md:text-[30px] text-right font-bold text-white mb-6 font-['Montserrat']">
              Платежи. Оплата банковской<br />картой онлайн
            </h2>
            <p className="text-white text-[14px] font-bold leading-relaxed max-w-[500px] font-['Montserrat'] text-justify">
              Наш сайт подключен к интернет-эквайрингу, и Вы можете оплатить услугу банковской картой Visa или Mastercard, а также с помощью Apple Pay и Google Pay. После подтверждения выбранной услуги откроется защищенное окно с платежной страницей процессингового центра OneVision, где Вам необходимо ввести данные Вашей банковской карты. Для дополнительной аутентификации держателя карты используется протокол 3-D Secure.
            </p>
          </div>
        </div>
      </section>

      {/* Гарантии безопасности */}
      <section className="w-full py-16 px-4 mb-10">
        <div className="max-w-6xl pl-28 mx-auto flex flex-col md:flex-row items-center md:items-start justify-between">
          <div className="flex-1 text-left mr-32 max-w-[485px]">
            <h2 className="text-[30px] md:text-[30px] font-bold text-[#000000] mb-6 font-['Montserrat']">
              Гарантии безопасности
            </h2>
            <p className="text-[#000000] text-[14px] font-bold leading-relaxed max-w-[500px] font-['Montserrat'] text-left">
              Процессинговый центр OneVision защищает и обрабатывает данные Вашей банковской карты по стандарту безопасности PCI DSS 3.0. Передача информации в платежный шлюз происходит с применением технологии шифрования SSL. OneVision не передает данные Вашей карты третьим лицам. Ввод данных осуществляется в защищенном окне на платежной странице OneVision.
            </p>
          </div>
          <div className="flex-shrink-0 mt-4 mr-36 md:mt-[-56px] md:-ml-4">
            <img src={ShieldEye} alt="shield eye" className="w-[300px] h-[300px] object-contain" />
          </div>
        </div>
      </section>

      {/* Возврат денежных средств */}
      <section className="w-full bg-[#394150] py-24 px-4 mb-10">
        <div className="max-w-6xl pl-28 mt-[-12px] mx-auto flex flex-col md:flex-row items-center md:items-start justify-between">
          <div className="flex-shrink-0 mb-8 mt-8 ml-16 md:mb-0 md:-mr-4">
            <img src={group1010} alt="return money" className="w-[170px] h-[170px] object-contain" />
          </div>
          <div className="flex-1 text-left mr-32 max-w-[485px]">
            <h2 className="text-[30px] md:text-[30px] text-right font-bold text-white mb-6 font-['Montserrat']">
              Возврат денежных средств
            </h2>
            <p className="text-white text-[14px] font-bold leading-relaxed max-w-[500px] font-['Montserrat'] text-right">
              Возврат наличными средствами не допускается. Возврат денежных средств возможен только на карту, с которой была совершена оплата. Потребитель вправе отказаться от услуги в течение 14 дней при сохранении документа, подтверждающего оплату. Для возврата необходимо направить заявление и копию удостоверения личности на электронный адрес: info@extraspace.kz.
            </p>
          </div>
        </div>
      </section>

      {/* Политика конфиденциальности */}
      <section className="w-full py-16 px-4 mb-10">
        <div className="max-w-6xl pl-28 mx-auto flex flex-col md:flex-row items-center md:items-start justify-between">
          <div className="flex-1 text-left mr-32 mt-[20px] max-w-[530px]">
            <h2 className="text-[30px] md:text-[30px] font-bold text-[#000000] mb-6 font-['Montserrat']">
              Политика конфиденциальности
            </h2>
            <p className="text-[#000000] text-[14px] font-bold leading-relaxed max-w-[500px] font-['Montserrat'] text-left">
              Персональная информация (имя, адрес, телефон, email, номер карты) обрабатывается в соответствии с законами РК и не передается третьим лицам. Вся информация передается в зашифрованном виде и не хранится на сервере сайта.
            </p>
          </div>
          <div className="flex flex-col items-center  mr-36 justify-center gap-4">
            <img src={eyeScan} alt="eye scan" className="w-[100px] h-[100px] object-contain" />
            <div className="flex items-center justify-center gap-4">
              <img src={hand} alt="hand" className="w-[100px] h-[100px] object-contain" />
              <img src={fingerprint} alt="fingerprint" className="w-[100px] h-[100px] object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Публичная оферта */}
      <section className="w-full bg-[#222427] py-12 px-4 mb-10">
        <div className="max-w-6xl pl-28 mx-auto flex flex-col items-start">
          <div className="w-[800px]">
            <h2 className="text-[30px] md:text-[30px] font-bold text-white mb-6 font-['Montserrat'] text-left">
              Публичная оферта
            </h2>
            <p className="text-white text-[14px] font-bold leading-relaxed mb-6 max-w-full font-['Montserrat'] text-justify">
              Совершая оплату на сайте extraspace.kz, клиент соглашается с условиями настоящей публичной оферты на оказание услуг аренды помещений. Полный текст оферты доступен по ссылке:
            </p>
          </div>
          <button className="px-6 py-1 rounded-full text-lg font-medium font-['Montserrat'] transition-colors mt-0 mb-10" style={{backgroundColor: '#FFFFFF', color: 'black'}}>
            Cтраница<b>→</b>
          </button>
        </div>
      </section>

      {/* Контакты для разрешения спорных ситуаций */}
      <section className="w-full bg-[#FFFFFF] py-0 px-4 mb-28">
        <div className="max-w-6xl pl-28 mx-auto flex flex-col items-start">
          <div className="w-[800px]">
            <h2 className="text-[30px] md:text-[30px] font-bold text-black mb-6 font-['Montserrat'] text-left">
              Контакты для разрешения спорных ситуаций
            </h2>
            <p className="text-black text-[14px] font-bold leading-relaxed max-w-full font-['Montserrat'] text-justify">
              По вопросам, связанным с оплатой и возвратами, просим обращаться по телефону: 
            </p>
            <p className="text-black text-[14px] font-bold leading-relaxed max-w-full font-['Montserrat'] text-justify">
              +7 (707) 123-45-67 или на email: info@extraspace.kz
            </p>
          </div>
        </div>
      </section>

      {/* Новый футер с реквизитами юридического лица */}
      <footer className="bg-[#0A142F] w-full py-32 text-white font-['Abhaya Libre SemiBold'] mt-[-60px]">
        <div className="container mx-auto px-4">
          <hr className="border-t border-[#FFFFFF] opacity-50 mt-[-30px] ml-20 mr-20" />
          <div className="flex flex-col md:flex-row mt-[50px] mb-[90px] items-center justify-between md:items-start pl-20 pr-20 py-0">
            <h2 className="text-7xl mt-[50px] font-bold font-['Audiowide']">ExtraSpace</h2>
            <div className="text-sm mr-[150px] text-left">
              <h3 className="font-bold mb-2 text-xl">РЕКВИЗИТЫ ЮРИДИЧЕСКОГО ЛИЦА</h3>
              <p className="mb-0"><b>ТОО</b> «EXTRA SPACE»</p>
              <p className="mb-0"><b>БИН:</b> 123456789012</p>
              <p className="mb-0"><b>ЮРИДИЧЕСКИЙ АДРЕС: Г. АЛМАТЫ. УЛ. ПРИМЕРНАЯ,</b> 1</p>
              <p className="mb-0"><b>ФАКТИЧЕСКИЙ АДРЕС: ТОТ ЖЕ</b></p>
              <p className="mb-0"><b>БАНК: АО «КАЗКОММЕРЦБАНК»</b></p>
              <p className="mb-0"><b>ИИК:</b> KZ123456789012345678</p>
              <p className="mb-0"><b>БИК:</b> KZKOKZKX</p>
              <p className="mb-0">EMAIL: INFO@EXTRASPACE.KZ</p>
            </div>
          </div>
          <hr className="border-t border-[#FFFFFF] opacity-50 mb-[-70px] ml-20 mr-20 my-0" />
        </div>
      </footer>

    </div>
  );
};

export default OnlinePaymentPage; 