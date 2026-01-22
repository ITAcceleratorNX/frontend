import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';

const OnlinePaymentPage = () => {
  const [activeSection, setActiveSection] = useState('section1');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'section1', 'section2', 'section3', 'section4', 'section5', 'section6'
      ];
      
      const headerHeight = 96; // Высота хэдера + отступ
      const scrollPosition = window.scrollY + headerHeight;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'section1', title: 'Оплата картой онлайн' },
    { id: 'section2', title: 'Гарантии безопасности' },
    { id: 'section3', title: 'Возврат денежных средств' },
    { id: 'section4', title: 'Политика конфиденциальности' },
    { id: 'section5', title: 'Публичная оферта' },
    { id: 'section6', title: 'Контакты для разрешения спорных ситуаций' },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 96; // Высота хэдера + отступ
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Title Section with Gradient Background */}
      <div className="bg-gradient-to-r from-[#E0F2FE] to-white py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#273655] mb-2 font-['Montserrat'] leading-tight">
            Информация об онлайн-оплате
          </h1>
          
          <p className="text-sm md:text-base text-[#273655] font-['Montserrat']">
            Безопасная оплата услуг банковской картой с использованием современных
          </p>
          <p className="text-sm md:text-base text-[#273655] font-['Montserrat']">
            технологий защиты платежей
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-2 rounded transition-colors font-['Montserrat'] text-sm ${
                          activeSection === section.id
                            ? 'text-[#00A991] font-semibold'
                            : 'text-[#273655] hover:text-[#00A991] hover:bg-gray-50'
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 font-['Montserrat'] text-[#273655]">
              
              {/* Section 1 */}
              <section id="section1" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Оплата картой онлайн</h2>
                <div className="space-y-4 leading-relaxed">
                  <p>
                    Наш сайт подключен к интернет-эквайрингу, и Вы можете оплатить услугу банковской картой Visa или Mastercard, а также с помощью Apple Pay и Google Pay. После подтверждения выбранной услуги откроется защищенное окно с платежной страницей процессингового центра OneVision, где Вам необходимо ввести данные Вашей банковской карты.
                  </p>
                  <p>
                    Для дополнительной аутентификации держателя карты используется протокол 3-D Secure. Это обеспечивает дополнительный уровень защиты при проведении онлайн-платежей и подтверждает, что операцию совершает именно владелец карты.
                  </p>
                  <p>
                    Процесс оплаты происходит в несколько этапов:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Выбор услуги и подтверждение заказа на сайте ExtraSpace;</li>
                    <li>Переход на защищенную платежную страницу процессингового центра OneVision;</li>
                    <li>Ввод данных банковской карты в защищенном окне;</li>
                    <li>Подтверждение платежа через протокол 3-D Secure (при необходимости);</li>
                    <li>Получение подтверждения об успешной оплате.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section id="section2" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Гарантии безопасности</h2>
                <div className="space-y-4 leading-relaxed">
                  <p>
                    Процессинговый центр OneVision защищает и обрабатывает данные Вашей банковской карты по стандарту безопасности PCI DSS 3.0. Это международный стандарт безопасности данных индустрии платежных карт, который обеспечивает высокий уровень защиты информации о платежах.
                  </p>
                  <p>
                    Передача информации в платежный шлюз происходит с применением технологии шифрования SSL (Secure Sockets Layer). Это означает, что все данные, передаваемые между Вашим браузером и сервером процессингового центра, зашифрованы и защищены от перехвата третьими лицами.
                  </p>
                  <p>
                    OneVision не передает данные Вашей карты третьим лицам. Вся информация обрабатывается в соответствии с требованиями безопасности и используется исключительно для проведения платежных операций.
                  </p>
                  <p>
                    Ввод данных осуществляется в защищенном окне на платежной странице OneVision. Данные Вашей банковской карты не сохраняются на серверах сайта ExtraSpace и не передаются нам. Вся обработка платежных данных происходит на стороне процессингового центра.
                  </p>
                  <p>
                    Дополнительные меры безопасности:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Использование протокола 3-D Secure для дополнительной аутентификации;</li>
                    <li>Мониторинг подозрительных транзакций в режиме реального времени;</li>
                    <li>Соблюдение всех требований международных стандартов безопасности платежей;</li>
                    <li>Регулярные аудиты безопасности процессингового центра.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="section3" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Возврат денежных средств</h2>
                <div className="space-y-4 leading-relaxed">
                  <p>
                    Возврат наличными средствами не допускается. Возврат денежных средств возможен только на карту, с которой была совершена оплата.
                  </p>
                  <p>
                    Потребитель вправе отказаться от услуги в течение 14 дней при сохранении документа, подтверждающего оплату, в соответствии с законодательством Республики Казахстан о защите прав потребителей.
                  </p>
                  <p>
                    Для возврата денежных средств необходимо:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Направить заявление на возврат на электронный адрес: info@extraspace.kz;</li>
                    <li>Приложить к заявлению копию удостоверения личности;</li>
                    <li>Указать номер заказа и причину возврата;</li>
                    <li>Предоставить реквизиты карты, с которой была совершена оплата (если требуется).</li>
                  </ul>
                  <p>
                    Обработка заявления на возврат осуществляется в течение 10 рабочих дней с момента получения всех необходимых документов. Возврат денежных средств на карту происходит в срок от 3 до 30 рабочих дней в зависимости от банка-эмитента карты.
                  </p>
                  <p>
                    В случае частичного использования услуги возврат производится пропорционально неиспользованной части услуги, за вычетом фактически понесенных расходов.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="section4" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Политика конфиденциальности</h2>
                <div className="space-y-4 leading-relaxed">
                  <p>
                    Персональная информация (имя, адрес, телефон, email, номер карты) обрабатывается в соответствии с законами Республики Казахстан и не передается третьим лицам.
                  </p>
                  <p>
                    Вся информация передается в зашифрованном виде и не хранится на сервере сайта. Данные Вашей банковской карты обрабатываются исключительно процессинговым центром OneVision и не сохраняются в системе ExtraSpace.
                  </p>
                  <p>
                    Мы используем персональные данные только для следующих целей:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Обработка и выполнение Ваших заказов;</li>
                    <li>Связь с Вами по вопросам заказа и оказания услуг;</li>
                    <li>Улучшение качества обслуживания;</li>
                    <li>Соблюдение требований законодательства Республики Казахстан.</li>
                  </ul>
                  <p>
                    Более подробная информация о политике конфиденциальности доступна на странице: <Link to="/privacy-policy" className="text-[#00A991] hover:underline">Политика конфиденциальности</Link>.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="section5" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Публичная оферта</h2>
                <div className="space-y-4 leading-relaxed">
                  <p>
                    Совершая оплату на сайте extraspace.kz, клиент соглашается с условиями настоящей публичной оферты на оказание услуг аренды помещений.
                  </p>
                  <p>
                    Полный текст публичной оферты определяет условия оказания услуг, права и обязанности сторон, порядок расчетов и другие существенные условия договора.
                  </p>
                  <p>
                    Ознакомиться с полным текстом публичной оферты Вы можете по ссылке: <Link to="/public-offer" className="text-[#00A991] hover:underline">Публичная оферта</Link>.
                  </p>
                  <p>
                    Оплата услуг на сайте означает полное и безоговорочное принятие условий публичной оферты и согласие с условиями оказания услуг, указанными в оферте.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="section6" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold mb-6">Контакты для разрешения спорных ситуаций</h2>
                <div className="space-y-4 leading-relaxed">
                  <p>
                    По вопросам, связанным с оплатой и возвратами, просим обращаться:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Телефон:</strong> +7 778 391 14 25
                    </li>
                    <li>
                      <strong>Email:</strong> info@extraspace.kz
                    </li>
                    <li>
                      <strong>Адрес:</strong> Казахстан, г. Алматы, Бостандыкский район, ул. Аль-Фараби 19/1
                    </li>
                  </ul>
                  <p>
                    Мы готовы помочь Вам решить любые вопросы, связанные с оплатой услуг, возвратом денежных средств или другими финансовыми операциями. Наши специалисты ответят на все Ваши вопросы и окажут необходимую поддержку.
                  </p>
                  <p>
                    Время работы службы поддержки: с понедельника по пятницу с 9:00 до 18:00 по времени Алматы.
                  </p>
                  <p>
                    <strong>Реквизиты юридического лица:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>ТОО</strong> «Valar Group»</li>
                    <li><strong>БИН:</strong> 230240017395</li>
                    <li><strong>НОМЕР СЧЕТА:</strong> KZ59722S000024650651</li>
                    <li><strong>КБЕ:</strong> 17</li>
                    <li><strong>НАИМЕНОВАНИЕ БАНКА:</strong> АО Kaspi Bank</li>
                    <li><strong>БИК:</strong> CASPKZKA</li>
                    <li><strong>АДРЕС:</strong> Казахстан, город Алматы, Бостандыкский район, улица Аль-Фараби 19/1</li>
                    <li><strong>EMAIL:</strong> INFO@EXTRASPACE.KZ</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OnlinePaymentPage;
