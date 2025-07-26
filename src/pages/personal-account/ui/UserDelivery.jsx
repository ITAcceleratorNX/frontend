import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

const UserDelivery = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Заголовок страницы */}
      <Card className="border-[#1e2c4f]/20 shadow-xl rounded-2xl bg-gradient-to-r from-[#1e2c4f] to-blue-600">
        <CardHeader className="text-center py-12">
          <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Truck className="w-12 h-12" />
            Доставка
          </CardTitle>
          <p className="text-blue-100 text-xl leading-relaxed max-w-2xl mx-auto">
            Управление доставкой ваших товаров
          </p>
        </CardHeader>
      </Card>

      {/* Статистика доставок */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                <Package className="w-8 h-8 text-[#1e2c4f]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Всего доставок</p>
                <p className="text-3xl font-bold text-[#1e2c4f]">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl group-hover:from-yellow-200 group-hover:to-orange-200 transition-all">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">В процессе</p>
                <p className="text-3xl font-bold text-orange-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Доставлено</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Адресов</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <Card className="shadow-xl rounded-2xl border-gray-200">
        <CardContent className="p-8">
          <div className="text-center py-16">
            <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Truck className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Раздел в разработке</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Функционал доставки находится в стадии разработки. Скоро здесь появится возможность отслеживать и управлять доставками.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDelivery;