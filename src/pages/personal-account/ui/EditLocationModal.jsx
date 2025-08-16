import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../shared/api/axios';

const EditLocationModal = ({ isOpen, onClose, item, onLocationUpdated }) => {
  const [location, setLocation] = useState(item?.location || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location.trim()) {
      toast.error('Введите местоположение');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.patch(`/order-items/${item.id}/location`, {
        physical_location: location.trim()
      });
      
      toast.success('Местоположение успешно обновлено');
      onLocationUpdated(response.data.orderItem);
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении местоположения:', error);
      if (error.response?.status === 404) {
        toast.error('Товар не найден');
      } else if (error.response?.status === 403) {
        toast.error('Нет доступа для изменения этого товара');
      } else {
        toast.error('Ошибка при обновлении местоположения');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setLocation(item?.location || '');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1e2c4f]" />
            Изменить местоположение
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Местоположение товара</Label>
            <Input
              id="location"
              type="text"
              placeholder="Введите физическое местоположение..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={255}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Максимум 255 символов
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Обновление...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationModal;
