import React from 'react';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';

const PrivacyPolicy2Page = () => {
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
      
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Защита персональных данных
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-['Montserrat']">
            Политика конфиденциальности
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Мы серьезно относимся к защите ваших персональных данных и соблюдаем все требования законодательства Республики Казахстан
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              
              {/* Section 1 */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">1</div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Общие положения</h2>
                </div>
                <div className="ml-12 space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Настоящая Политика конфиденциальности составлена в соответствии с требованиями Закона Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите» и определяет порядок обработки и защиты персональных данных, осуществляемых ТОО «Valar Group» (далее — Оператор).
                  </p>
                  <p>
                    Оператор ставит целью соблюдение прав и свобод человека и гражданина при обработке персональных данных, включая защиту права на неприкосновенность частной жизни и личную тайну.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">2</div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Основные понятия</h2>
                </div>
                <div className="ml-12 space-y-6 text-gray-700">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-900 mb-2">Обработка персональных данных</h4>
                    <p className="text-sm">действия, направленные на сбор, хранение, изменение, дополнение, использование, распространение, обезличивание, блокирование и уничтожение персональных данных с использованием автоматизированных средств и без них.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-gray-900 mb-2">Субъект персональных данных</h4>
                    <p className="text-sm">физическое лицо, к которому относится информация, позволяющая прямо или косвенно его идентифицировать.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-gray-900 mb-2">Оператор</h4>
                    <p className="text-sm">юридическое лицо, самостоятельно или совместно с другими лицами организующее и/или осуществляющее обработку персональных данных, а также определяющее цели и объем обработки.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">3</div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Права и обязанности сторон</h2>
                </div>
                <div className="ml-12 grid md:grid-cols-2 gap-8">
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Оператор обязан:
                    </h3>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        получать согласие субъекта на сбор и обработку персональных данных
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        уведомлять субъектов в случае утечки данных
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        обеспечивать защиту персональных данных
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        прекращать обработку и уничтожать данные по запросу субъекта
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Субъект имеет право:
                    </h3>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        на доступ и получение информации о своих данных
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        требовать корректировки или удаления данных
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        отозвать согласие на обработку
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        обжаловать действия оператора в суд или в уполномоченный орган
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="ml-12 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Важно:</strong> Уполномоченным органом в области защиты персональных данных является Министерство цифрового развития, инноваций и аэрокосмической промышленности Республики Казахстан.
                  </p>
                </div>
              </div>

              {/* Remaining sections with similar styling */}
              <div className="space-y-12">
                {/* Section 4 */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">4</div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">Правовые основания обработки персональных данных</h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-700 mb-4">Обработка осуществляется при наличии хотя бы одного из следующих условий:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        'получение согласия субъекта',
                        'необходимость исполнения договора',
                        'выполнение требований законодательства Республики Казахстан',
                        'охрана жизни и здоровья субъекта',
                        'статистические или общественно значимые цели'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                            ✓
                          </div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">5</div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">Передача персональных данных</h2>
                  </div>
                  <div className="ml-12 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-gray-700">
                      Пе��едача персональных данных допускается только при наличии согласия субъекта, либо в рамках исполнения законодательства Республики Казахстан. Трансграничная передача допускается при обеспечении достаточной защиты данных.
                    </p>
                  </div>
                </div>

                {/* Section 6 */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">6</div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">Заключительные положения</h2>
                  </div>
                  <div className="ml-12 p-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-700">
                      Оператор оставляет за собой право вносить изменения в настоящую Политику. Все изменения публикуются на официальном сайте. Политика действует бессрочно до замены новой версией.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy2Page;