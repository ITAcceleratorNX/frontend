import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets';

const OfferPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(0,0,0,0.05) 0%, transparent 50%),
          radial-gradient(circle at 90% 20%, rgba(0,0,0,0.05) 0%, transparent 50%),
          radial-gradient(circle at 10% 80%, rgba(0,0,0,0.05) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(0,0,0,0.05) 0%, transparent 50%)
        `
      }}
    >
      <Header />

      {/* Back Button */}
      <div className="flex items-center mb-6 mt-8 ml-8">
        <button 
          onClick={() => navigate('/home', { state: { activeSection: 'adminusers' } })} 
          className="mr-4 p-3 rounded-full hover:bg-white/80 transition-all duration-300 shadow-sm border border-gray-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.75 19.5L8.25 12L15.75 4.5" stroke="#273655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-[#273655] hover:text-blue-700 transition-colors cursor-pointer" onClick={() => navigate('/home')}>
          Назад
        </h1>
      </div>

      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Официальная публичная оферта 
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-['Montserrat']">
          Публичная оферта покупки склада в ExtraSpace  
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-12 lg:p-16">
            <div className="prose prose-lg max-w-none">
              
              {/* Section 1 */}
              <div className="mb-16">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-lg">1</div>
                  <h2 className="text-3xl font-bold text-gray-900 m-0 font-['Montserrat']">Основные определения</h2>
                </div>
                <div className="ml-15 space-y-6 text-gray-700 leading-relaxed">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h4 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Покупатель
                    </h4>
                    <p className="text-base leading-relaxed">физическое лицо, имеющее намерение заказать или приобрести товары, либо заказывающее, приобретающее или использующее товары исключительно для личных, семейных, домашних и иных нужд, не связанных с осуществлением предпринимательской деятельности, разместившее Заказ на сайте https://extraspace.kz/ либо указанное в Заказе в качестве получателя Товара.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Зарегистрированный покупатель
                    </h4>
                    <p className="text-base leading-relaxed">Покупатель, предоставивший о себе Продавцу индивидуальную информацию (Фамилию, Имя, Отчество, адрес электронной почты (E-mail), Телефон), которая может быть использована для оформления Заказа многократно. Данная информация предоставляется при оформлении Заказа.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h4 className="font-bold text-purple-900 mb-3 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                      </svg>
                      Продавец
                    </h4>
                    <p className="text-base leading-relaxed">организация независимо от её организационно-правовой формы, а также Индивидуальный предприниматель, осуществляющий продажу товаров.</p>
                    <div className="mt-4 p-4 bg-purple-100 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">
                        В рамках настоящих правил Продавцом является <strong>ТОО «Valar Group»</strong><br/>
                        📍 Казахстан, город Алматы, Бостандыкский район, улица Аль-Фараби 19/1
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="font-bold text-orange-900 mb-3 text-lg flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                        </svg>
                        Интернет-магазин
                      </h4>
                      <p className="text-base leading-relaxed">Сайт, на котором любой Покупатель может ознакомиться с представленными Товарами, их описанием и ценами на Товары, выбрать определённый Товар, способ оплаты и доставки Товаров.</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="font-bold text-teal-900 mb-3 text-lg flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Сайт
                      </h4>
                      <p className="text-base leading-relaxed">совокупность информационных ресурсов, размещённых в Интернете по адресу https://extraspace.kz/. Сайт принадлежит и администрируется ТОО «Valar Group»</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h4 className="font-bold text-red-900 mb-3 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                      </svg>
                      Товар
                    </h4>
                    <p className="text-base leading-relaxed">объект купли-продажи, не изъятый и не ограниченный в гражданском обороте и представленный к продаже в Интернет-магазине, посредством размещения в соответствующем разделе Интернет-магазина. Предметом купли-продажи могут быть только Товары, отмеченные в Интернет-магазине как Товары со статусом «в наличии».</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h4 className="font-bold text-yellow-900 mb-3 text-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Заказ на резерв товара в магазине
                    </h4>
                    <p className="text-base leading-relaxed">(требуется дополнительное подтверждение о наличии товара в выбранном магазине) — это заявка на резерв товара в выбранном магазине, оформленная по соответствующей форме, отправленная посредством сети Интернет. Заказ на резерв товара в магазине считается оформленным после получения Покупателем СМС-извещения от Продавца о наличии товара в выбранном магазине.</p>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="mb-16">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-lg">2</div>
                  <h2 className="text-3xl font-bold text-gray-900 m-0 font-['Montserrat']">Общие положения</h2>
                </div>
                <div className="ml-15 space-y-6 text-gray-700 leading-relaxed">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
                    <p className="text-lg font-medium text-blue-900 mb-3">2.1. Правовая основа</p>
                    <p className="text-base leading-relaxed">
                      Настоящие «Правила продажи товаров в Интернет-магазине https://extraspace.kz/» (далее — «Правила») определяют порядок розничной купли-продажи Товаров через Интернет-магазин, и в соответствии со ст. 395 Гражданского Кодекса РК являются официальной публичной офертой ТОО «Valar Group», далее именуемого «Продавец», адресованной физическим лицам, далее именуемым «Покупатель», при совместном упоминании Продавец и Покупатель также именуются «Стороны», а каждый по отдельности «Сторона».
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-lg font-medium text-gray-900 mb-3">2.2. Гарантии сторон</p>
                      <p className="text-base leading-relaxed">
                        Каждая Сторона гарантирует другой Стороне, что обладает необходимой право- и дееспособностью, а равно всеми правами и полномочиями, необходимыми и достаточными для заключения и исполнения договора розничной купли-продажи.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-lg font-medium text-gray-900 mb-3">2.3. Согласие с правилами</p>
                      <p className="text-base leading-relaxed">
                        Заказывая Товары через Интернет-магазин, Покупатель соглашается с Правилами, изложенными ниже.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border-l-4 border-green-500">
                    <p className="text-lg font-medium text-green-900 mb-3">2.4. Применимое законодательство</p>
                    <p className="text-base leading-relaxed">
                      К отношениям между Покупателем и Продавцом применяются положения Гражданского Кодекса РК, Закон РК «О защите прав потребителей» от 4 мая 2010 года № 274-IV, и иные правовые акты, принятые в соответствии с ними.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-lg font-medium text-yellow-900 mb-3">2.5. Изменения правил</p>
                      <p className="text-base leading-relaxed">
                        Продавец оставляет за собой право вносить изменения в настоящие Правила, в связи с чем, Покупатель обязуется регулярно отслеживать изменения в Правилах, размещенных на странице Интернет-магазина на странице https://extraspace.kz/.
                      </p>
                    </div>
                    
                    <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-lg font-medium text-purple-900 mb-3">2.6. Ознакомление</p>
                      <p className="text-base leading-relaxed">
                        Продавец производит ознакомление Покупателя с настоящими Правилами путем их размещения на главной странице сайта Интернет-магазина в разделе «Правила продажи».
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="mb-16">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-lg">3</div>
                  <h2 className="text-3xl font-bold text-gray-900 m-0 font-['Montserrat']">Регистрация в интернет-магазине</h2>
                </div>
                <div className="ml-15 grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                    <h4 className="font-bold text-green-800 mb-3 text-lg">3.1. Доступность заказов</h4>
                    <p className="text-base text-green-700 leading-relaxed">
                      Оформить Заказ в Интернет-магазине могут зарегистрированные и незарегистрированные Покупатели.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
                    <h4 className="font-bold text-yellow-800 mb-3 text-lg">3.2. Ответственность за данные</h4>
                    <p className="text-base text-yellow-700 leading-relaxed">
                      Продавец не несет ответственности за точность и правильность информации, предоставляемой Покупателем при регистрации.
                    </p>
                  </div>
                  
                  <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
                    <h4 className="font-bold text-blue-900 mb-3 text-lg">3.3. Индивидуальная идентификация</h4>
                    <p className="text-base text-blue-800 leading-relaxed">
                      Покупатель, зарегистрировавшийся в Интернет-магазине получает индивидуальную идентификацию путем предоставления логина и пароля. Индивидуальная идентификация Покупателя позволяет избежать несанкционированных действий третьих лиц от имени Покупателя и открывает доступ к дополнительным сервисам. Передача Покупателем логина и пароля третьим лицам запрещена, Покупатель самостоятельно несёт ответственность за все возможные негативные последствия, в случае передачи логина и пароля третьим лицам.
                    </p>
                  </div>
                  
                  <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border-l-4 border-purple-500">
                    <h4 className="font-bold text-purple-900 mb-3 text-lg">3.4. Защита персональных данных</h4>
                    <p className="text-base text-purple-800 leading-relaxed">
                      Продавец подтверждает, что все персональные данные, полученные от зарегистрированных покупателей, будут обрабатываться в соответствии с Законом Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите».
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections 4-10 in compact format */}
              <div className="space-y-16">
                {/* Section 4 */}
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-lg">4</div>
                    <h2 className="text-3xl font-bold text-gray-900 m-0 font-['Montserrat']">Оформление и сроки выполнения заказа</h2>
                  </div>
                  <div className="ml-15 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mr-4 flex-shrink-0">4.1</span>
                        <p className="text-base text-gray-700 leading-relaxed">Заказ Покупателя может быть оформлен через сеть Интернет.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mr-4 flex-shrink-0">4.2</span>
                        <p className="text-base text-gray-700 leading-relaxed">При оформлении Заказа Покупатель подтверждает, что ознакомлен с правилами продажи Товаров через Интернет-магазин и предоставляет сотруднику Продавца информацию необходимую для оформления Заказа.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mr-4 flex-shrink-0">4.3</span>
                        <p className="text-base text-gray-700 leading-relaxed">Если после получения Заказа обнаруживается, что на складе у Продавца отсутствует необходимое количество заказанного Товара, Продавец информирует об этом Покупателя в течение 1 рабочего дня. В случае невозможности информирования Покупателя Продавец имеет право сформировать заказ в разумные сроки. Покупатель вправе согласиться получить Товар в количестве, имеющемся в наличии у Продавца, либо аннулировать данную позицию Товара из Заказа. В случае невозможности получения ответа Покупателя в течение 2 (двух) календарных дней с даты оформления Заказа, Продавец вправе аннулировать Заказ в полном объеме.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mr-4 flex-shrink-0">4.4</span>
                        <p className="text-base text-gray-700 leading-relaxed">В случае возникновения у Покупателя вопросов, касающихся свойств и характеристик Товара, перед оформлением Заказа, Покупатель должен обратиться к Продавцу по телефону.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mr-4 flex-shrink-0">4.5</span>
                        <p className="text-base text-gray-700 leading-relaxed">Продавец вправе в одностороннем порядке ограничить количество товарных позиций в одном заказе, сумму одного заказа, а также количество заказов, единовременно оформляемых на один адрес одному Покупателю. Форма возможной оплаты заказа определяется по соглашению между Продавцом и Покупателем при оформлении заказа и не должна противоречить действующему законодательству РК.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-lg">5</div>
                    <h2 className="text-3xl font-bold text-gray-900 m-0 font-['Montserrat']">Доставка товара</h2>
                  </div>
                  <div className="ml-15 bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-4 flex-shrink-0">5.4</span>
                        <p className="text-base text-green-800 leading-relaxed">Стоимость сборки и выдачи заказанных Товаров рассчитывается индивидуально, исходя из стоимости товара, общей суммы Заказа. Точная стоимость доставки рассчитывается в корзине, с предварительно выбранными товарами.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-4 flex-shrink-0">5.5</span>
                        <p className="text-base text-green-800 leading-relaxed">При выдаче заказанные Товары вручаются Покупателю или лицу, указанному в качестве получателя в Заказе.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-4 flex-shrink-0">5.6</span>
                        <p className="text-base text-green-800 leading-relaxed">В момент доставки Товара лицо, осуществляющее доставку, демонстрирует Покупателю и/или Получателю внешний вид и комплектность Товара.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-4 flex-shrink-0">5.7</span>
                        <div className="text-base text-green-800 leading-relaxed">
                          <p className="mb-2">Покупатель и/или Получатель в момент получения Товара получает пакет документов на Товар:</p>
                          <ul className="list-disc list-inside ml-4">
                            <li>кассовый чек либо заменяющий его документ установленной формы</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sections 6-10 */}
                {[
                  {
                    number: 6,
                    title: "Оплата товара",
                    color: "orange",
                    items: [
                      { num: "6.1", text: "Цена Товара указывается рядом с определённым наименованием Товара в Интернет-магазине." },
                      { num: "6.2", text: "Цена Товара в Интернет-магазине может быть изменена Продавцом в одностороннем порядке. Цена товара действительна на момент оформления заказа Покупателем. При этом цена на заказанный Покупателем Товар изменению не подлежит." },
                      { num: "6.3", text: "Заказать можно только тот Товар, который есть в наличии на момент заказа." },
                      { num: "6.4", text: "Оплата Товара Покупателем производится в тенге при получении заказа в розничном магазине – наличными денежными средствами, банковской картой, подарочной картой, электронным подарочным сертификатом в кассе розничного магазина." },
                      { num: "6.5", text: "Договор купли-продажи считается заключённым с момента оплаты Покупателем заказанных Товаров и выдачи кассового или товарного чеков. В случае приобретения покупателем товара по акции, определенные продавцом в акции условия приобретения товара являются для сторон существенными условиями заключаемого договора купли-продажи." },
                      { num: "6.6", text: "Способы оплаты Заказа определяются по соглашению между Покупателем и Продавцом с учетом стоимости заказа и действующего законодательства РК." },
                      { num: "6.7", text: "Идентификатором заказа через интернет-магазин служит документ продавца, оформляемый при подтверждении заказа покупателя, однозначно указывающий на принадлежность товара к заказу интернет магазина. В случае, если покупатель не предоставляет данный документ на кассе и/или магазин не может однозначно идентифицировать продаваемый товар как заказ через интернет-магазин, продавец имеет право реализовать товар на условиях и по текущей стоимости товара в розничном магазине." }
                    ]
                  },

                  {
                    number: 7,
                    title: "Возврат и обмен товара",
                    color: "red",
                    items: [
                      { num: "7.1", text: "Возврат товара надлежащего качества: Покупатель вправе отказаться от заказанного Товара в любое время до его получения, а после получения Товара — в течение 14 (четырнадцати) дней, не считая день получения товара. Возврат Товара надлежащего качества возможен в случае, если сохранены его товарный вид, потребительские свойства, а также документ, подтверждающий факт и условия покупки указанного Товара. При отказе Покупателя от Товара Продавец обязан возвратить ему сумму, уплаченную Покупателем за Товар, за исключением расходов Продавца на обработку заказа (Услуга сборки и выдачи заказа) с товаром, возврат которого осуществляет Покупатель, не позднее чем через 10 дней с даты предъявления Покупателем соответствующего письменного требования через сайт Интернет-магазина." },
                      { num: "7.3", text: "Возврат Товара производится на основании Заявления, заполненного и подписанного Покупателем." },
                      { num: "7.4", text: "При возврате Покупателем Товара надлежащего качества составляются накладная или акт о возврате товара, в котором указываются: полное фирменное наименование (наименование) Продавца; фамилия, имя, отчество Покупателя; наименование Товара; даты заключения договора и передачи Товара; сумма, подлежащая возврату; подписи продавца и покупателя." }
                    ]
                  },

                  {
                    number: 8,
                    title: "Гарантии и ответственность",
                    color: "purple",
                    items: [
                      { num: "8.1", text: "Продавец не несет ответственности за ущерб, причиненный Покупателю вследствие ненадлежащего использования Товаров, приобретённых в Интернет-магазине." },
                      { num: "8.2", text: "Продавец не отвечает за убытки Покупателя возникшие в результате: неправильного заполнения бланка-заказа, в т. ч. неправильного указания персональных данных, неправомерных действий третьих лиц." },
                      { num: "8.3", text: "Покупатель обязуется не использовать заказанный Товар в предпринимательских целях." },
                      { num: "8.4", text: "Покупатель несёт всю ответственность за достоверность сведений, указанных им при регистрации в Интернет-магазине." },
                      { num: "8.5", text: "Стороны освобождаются от ответственности за полное или частичное неисполнение своих обязательств, если такое неисполнение явилось следствием действия обстоятельств непреодолимой силы, возникших после вступления в силу Правил, в результате событий чрезвычайного характера, которые Стороны не могли предвидеть и предотвратить разумными мерами." },
                      { num: "8.6", text: "В иных случаях, не предусмотренных п. 8.5. Правил неисполнения или ненадлежащего исполнения своих обязательств Стороны несут ответственность в соответствии с действующим законодательством Республики Казахстан." }
                    ]
                  },

                  {
                    number: 9,
                    title: "Конфиденциальность и защита персональной информации",
                    color: "indigo",
                    items: [
                      { num: "9.1", text: "При регистрации в Интернет-магазине Покупатель предоставляет о себе следующую информацию: Фамилия, Имя, адрес электронной почты, контактный номер телефона, вариант пароля для доступа к Интернет-магазину, который хранится в зашифрованном виде." },
                      { num: "9.2", text: "Продавец использует полученную от Покупателя информацию: для регистрации Покупателя в Интернет-магазине; для выполнения своих обязательств перед Покупателем; для оценки и анализа работы Интернет-магазина; для определения победителя в акциях, проводимых Продавцом; для восстановления пароля; для рассылки рекламно-информационных сообщений." },
                      { num: "9.3", text: "Продавец обязуется не разглашать полученную от Покупателя информацию. Не считается нарушением предоставление Продавцом информации агентам и третьим лицам, действующим на основании договора с Продавцом, для исполнения обязательств перед Покупателем." },
                      { num: "9.4", text: "Ознакомление Покупателя с настоящими Правилами означает его безусловное согласие на обработку персональных данных, предоставленных Покупателем при регистрации и/или оформлении Заказа в Интернет-магазине." },
                      { num: "9.5", text: "Продавец вправе использовать технологию cookies. Cookies не содержат конфиденциальную информацию и не передаются третьим лицам." },
                      { num: "9.6", text: "Продавец получает информацию об ip-адресе посетителя Сайта. Данная информация не используется для установления личности посетителя." }
                    ]
                  },
                  {
                    number: 10,
                    title: "Прочие условия",
                    color: "gray",
                    items: [
                      { num: "10.1", text: "К отношениям между Покупателем и Продавцом применяется законодательство Республики Казахстан." },
                      { num: "10.2", text: "Покупатель гарантирует, что все условия настоящих Правил ему понятны, и он принимает их безусловно и в полном объёме." },
                      { num: "10.3", text: "Все возникающее споры стороны будут стараться решить путем переговоров, при недостижении соглашения спор будет передан на рассмотрение в суд в соответствии с действующим законодательством РК." },
                      { num: "10.4", text: "Недействительность какого-либо положения настоящих Правил не влечет за собой недействительность остальных положений." }
                    ]
                  }
                ].map((section) => (
                  <div key={section.number}>
                    <div className="flex items-center mb-8">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-5 shadow-lg">{section.number}</div>
                      <h2 className="text-3xl font-bold text-gray-900 m-0 font-['Montserrat']">{section.title}</h2>
                    </div>
                    <div className={`ml-15 bg-gradient-to-r from-${section.color}-50 to-${section.color}-100 p-8 rounded-2xl border border-${section.color}-200 shadow-lg`}>
                      <div className="space-y-4">
                        {section.items.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <span className={`inline-flex items-center justify-center w-8 h-8 bg-${section.color}-600 text-white rounded-full text-sm font-bold mr-4 flex-shrink-0`}>{item.num}</span>
                            <p className={`text-base text-${section.color}-800 leading-relaxed`}>{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-20 pt-10 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center space-x-4 text-base text-gray-600 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2">ТОО «Valar Group»</p>
                    <p>Казахстан, город Алматы, Бостандыкский район, улица Аль-Фараби 19/1</p>
                    <p className="mt-4 font-medium text-blue-700">
                      По вопросам договора-оферты: 
                      <a href="mailto:info@extraspace.kz" className="ml-1 hover:underline">info@extraspace.kz</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer with Company Details */}
      <footer className="bg-gradient-to-r from-slate-900 to-blue-900 w-full py-6 text-white mt-20">
        <div className="container mx-auto px-8">
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between lg:items-start space-y-8 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h2 className="text-5xl lg:text-6xl font-bold font-['Audiowide'] mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  ExtraSpace
                </h2>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="font-bold mb-6 text-xl text-blue-200">РЕКВИЗИТЫ ЮРИДИЧЕСКОГО ЛИЦА</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-blue-300">ТОО</span> «Valar Group»</p>
                  <p><span className="font-semibold text-blue-300">БИН:</span> 230240017395</p>
                  <p><span className="font-semibold text-blue-300">НОМЕР СЧЕТА:</span> KZ59722S000024650651</p>
                  <p><span className="font-semibold text-blue-300">КБЕ:</span> 17</p>
                  <p><span className="font-semibold text-blue-300">НАИМЕНОВАНИЕ БАНКА:</span> АО Kaspi Bank</p>
                  <p><span className="font-semibold text-blue-300">БИК:</span> CASPKZKA</p>
                  <p><span className="font-semibold text-blue-300">АДРЕС:</span> Казахстан, город Алматы, Бостандыкский район, улица Аль-Фараби 19/1</p>
                  <p className="pt-2">
                    <span className="font-semibold text-blue-300">EMAIL:</span> 
                    <a href="mailto:info@extraspace.kz" className="ml-1 text-blue-200 hover:text-white transition-colors">
                      info@extraspace.kz
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 text-center">
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} ТОО «Valar Group». Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OfferPage;