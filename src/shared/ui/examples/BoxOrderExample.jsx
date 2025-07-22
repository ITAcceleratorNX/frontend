import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ProfileStatus } from '../ProfileStatus';
import { useProfileCheck } from '../../lib/hooks/useProfileCheck';
import { Package } from 'lucide-react';

// Пример компонента заказа бокса с проверкой профиля
export const BoxOrderExample = () => {
  const { createBoxOrder, isLoading, isProfileComplete } = useBoxOrder();

  const handleOrderBox = () => {
    createBoxOrder({
      boxType: 'standard',
      size: 'medium',
      duration: 30 // дней
    });
  };

  return (
    <div className="space-y-6">
      {/* Статус профиля */}
      <ProfileStatus variant="compact" />
      
      {/* Основной контент с защитой */}
      <ProfileGuard 
        customMessage="Для заказа бокса необходимо заполнить все данные в личном кабинете."
        fallback={
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Package className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Заполните профиль для оформления заказа бокса
                </p>
                <ProfileStatus showDetails />
              </div>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Заказ бокса
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Стандартный бокс</h3>
                <p className="text-sm text-muted-foreground">Размер: Средний</p>
                <p className="text-sm text-muted-foreground">Срок: 30 дней</p>
              </div>
            </div>
            
            <Button 
              onClick={handleOrderBox}
              disabled={isLoading || !isProfileComplete}
              className="w-full"
            >
              {isLoading ? 'Оформление заказа...' : 'Заказать бокс'}
            </Button>
          </CardContent>
        </Card>
      </ProfileGuard>
    </div>
  );
};

// Пример использования HOC
export const ProtectedBoxOrder = () => {
  const { createBoxOrder, isLoading } = useBoxOrder();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Защищенный заказ бокса</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => createBoxOrder({ boxType: 'premium' })}
          disabled={isLoading}
        >
          Заказать премиум бокс
        </Button>
      </CardContent>
    </Card>
  );
};

// Экспортируем защищенную версию
export const ProtectedBoxOrderWithGuard = withProfileGuard(ProtectedBoxOrder, {
  customMessage: 'Для заказа премиум бокса заполните все данные профиля.'
});