import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { getOrderStatusText, getCargoMarkText } from '../../../shared/lib/types/orders';

const OrderConfirmModal = ({ isOpen, onClose, onConfirm, action, order }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return parseFloat(price).toLocaleString('ru-RU') + ' ₸';
  };

  const getActionConfig = () => {
    if (action === 'approve') {
      return {
        title: 'Подтвердить заказ',
        message: 'Вы уверены, что хотите подтвердить этот заказ?',
        description: 'После подтверждения пользователь сможет произвести оплату заказа.',
        confirmText: 'Подтвердить',
        confirmVariant: 'default',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200'
      };
    } else if (action === 'delete') {
      return {
        title: 'Удалить заказ',
        message: 'Вы уверены, что хотите удалить этот заказ?',
        description: 'Это действие нельзя отменить. Заказ будет удален навсегда.',
        confirmText: 'Удалить',
        confirmVariant: 'destructive',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        bgColor: 'from-red-50 to-rose-50',
        borderColor: 'border-red-200'
      };
    }
    return {};
  };

  const config = getActionConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.message}
            <br />
            <span className="text-sm text-muted-foreground mt-1 block">
              {config.description}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Общая информация о заказе */}
          <Card className={`bg-gradient-to-r ${config.bgColor} ${config.borderColor}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Заказ #{order.id}
                <Badge variant="outline" className="ml-auto">
                  {getOrderStatusText(order.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Информация о клиенте */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Информация о клиенте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Имя:
                  </span>
                  <span className="font-medium">{order.user?.name || 'Не указано'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email:
                  </span>
                  <span className="text-sm">{order.user?.email || 'Не указан'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Телефон:
                  </span>
                  <span className="text-sm">{order.user?.phone || 'Не указан'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Детали заказа */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Детали заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Хранилище:</span>
                  <span className="font-medium">{order.storage?.name || 'Не указано'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Объем:</span>
                  <Badge variant="outline">{order.total_volume} м³</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Создан:</span>
                  <span className="text-sm">{formatDate(order.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Финансовая информация */}
          <Card className="bg-gradient-to-r from-[#1e2c4f]/5 to-blue-50 border-[#1e2c4f]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#1e2c4f]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Финансовая информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Стоимость аренды</div>
                  <div className="text-lg font-semibold text-[#1e2c4f]">{formatPrice(order.total_price)}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Депозит</div>
                  <div className="text-lg font-semibold">15 000 ₸</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-[#1e2c4f] to-blue-600 text-white rounded-lg">
                  <div className="text-sm mb-1 opacity-90">Общая сумма</div>
                  <div className="text-xl font-bold">
                    {formatPrice((parseFloat(order.total_price) || 0) + 15000)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статусы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Статусы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant={order.status === 'APPROVED' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Статус: {getOrderStatusText(order.status)}
                </Badge>
                <Badge 
                  variant={order.payment_status === 'PAID' ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Оплата: {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
                </Badge>
                <Badge 
                  variant={order.contract_status === 'SIGNED' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Договор: {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Предметы в заказе */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Предметы в заказе
                  <Badge variant="secondary" className="ml-auto">
                    {order.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.slice(0, 6).map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="font-medium text-sm text-gray-900 mb-1">{item.name}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1">
                          {item.volume} м³
                        </Badge>
                        <span>{getCargoMarkText(item.cargo_mark)}</span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 6 && (
                    <div className="p-3 bg-gray-100 rounded-lg border-dashed border-gray-300 text-center">
                      <div className="text-sm text-gray-600">
                        и ещё {order.items.length - 6} предметов...
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            className={`${config.confirmClass} text-white flex items-center gap-2`}
          >
            {config.icon}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmModal; 