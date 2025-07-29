import React, { useState } from 'react';
import { Search, Package, MapPin, User, Phone, Truck, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { ordersApi } from '../../../shared/api/ordersApi';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

const ItemSearch = () => {
  const [itemId, setItemId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearched, setIsSearched] = useState(false);

  // Функция для получения текста статуса на русском
  const getStatusText = (status) => {
    const statusMap = {
      'PENDING_FROM': '⏳ Ожидает отправки со склада',
      'PENDING_TO': '⏳ Ожидает доставки на склад',
      'IN_PROGRESS': '🚚 В процессе доставки',
      'DELIVERED': '✅ Доставлено'
    };
    return statusMap[status] || status;
  };

  // Функция для получения текста типа груза
  const getCargoMarkText = (mark) => {
    const cargoMap = {
      'NO': 'Обычный',
      'HEAVY': 'Тяжёлый',
      'FRAGILE': 'Хрупкий'
    };
    return cargoMap[mark] || mark;
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING_FROM': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'PENDING_TO': 'text-blue-600 bg-blue-50 border-blue-200',
      'IN_PROGRESS': 'text-purple-600 bg-purple-50 border-purple-200',
      'DELIVERED': 'text-green-600 bg-green-50 border-green-200'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Обработчик поиска
  const handleSearch = async () => {
    if (!itemId.trim()) {
      toast.error('Введите ID вещи для поиска');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ordersApi.searchItemById(itemId.trim());
      setSearchResult(result);
      setIsSearched(true);
      toast.success('Вещь найдена!');
    } catch (error) {
      console.error('Ошибка при поиске вещи:', error);
      setSearchResult(null);
      setIsSearched(true);
      
      if (error.response?.status === 404) {
        toast.error('Вещь с таким ID не найдена');
      } else {
        toast.error('Произошла ошибка при поиске вещи');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Сброс поиска
  const handleReset = () => {
    setItemId('');
    setSearchResult(null);
    setIsSearched(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Форма поиска */}
      <div className={`transition-all duration-500 ease-in-out ${isSearched && searchResult ? 'transform -translate-y-20 mb-8' : 'min-h-screen flex items-center justify-center'}`}>
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#273655] rounded-full mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#273655] mb-2">Поиск вещи</h1>
            <p className="text-gray-600">Введите ID вещи для получения информации</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Введите ID вещи..."
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#273655] focus:ring-[#273655] transition-colors"
                disabled={isLoading}
              />
              <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 bg-[#273655] hover:bg-[#1e2a47] text-white py-3 text-lg rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Поиск...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Найти
                  </>
                )}
              </Button>

              {isSearched && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-6 py-3 text-lg rounded-xl border-2 border-gray-200 hover:border-[#273655] hover:text-[#273655] transition-colors"
                >
                  Сбросить
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Результат поиска */}
      {isSearched && searchResult && (
        <div className="animate-fadeIn">
          <Card className="p-8 shadow-xl border-2 border-gray-100 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Информация о вещи */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-[#273655] mb-2">Информация о вещи</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID вещи</p>
                      <p className="font-semibold text-lg">{searchResult.item.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Название</p>
                      <p className="font-semibold text-lg">{searchResult.item.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Объём</p>
                      <p className="font-semibold text-lg">{searchResult.item.volume} м³</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Тип груза</p>
                      <p className="font-semibold text-lg">{getCargoMarkText(searchResult.item.cargo_mark)}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-500 mb-2">Статус доставки</p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(searchResult.status)}`}>
                      <Clock className="w-4 h-4 mr-2" />
                      {getStatusText(searchResult.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о доставке */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-[#273655] mb-2">Информация о доставке</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Склад</p>
                      <p className="font-semibold">{searchResult.warehouseAddress}</p>
                      <p className="text-sm text-gray-600">Бокс: {searchResult.storageName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Адрес клиента</p>
                      <p className="font-semibold">{searchResult.userAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Клиент</p>
                      <p className="font-semibold text-lg">{searchResult.userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Телефон</p>
                      <p className="font-semibold text-lg">{searchResult.userPhone}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-500 mb-1">ID заказа доставки</p>
                    <p className="font-mono text-lg font-semibold text-[#273655]">{searchResult.movingOrderId}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Сообщение о том, что ничего не найдено */}
      {isSearched && !searchResult && (
        <div className="animate-fadeIn text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Вещь не найдена</h3>
          <p className="text-gray-600">Вещь с ID "{itemId}" не найдена в системе</p>
        </div>
      )}
    </div>
  );
};

export default ItemSearch;