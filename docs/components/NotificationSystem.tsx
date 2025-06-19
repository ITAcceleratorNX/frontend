import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Users } from 'lucide-react';
import UserNotifications from './UserNotifications';
import ManagerInterface from './ManagerInterface';
import AdminInterface from './AdminInterface';
import { UserRole, Notification, User as UserType } from '../types/notification';

const NotificationSystem: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Добрый день, Иван!',
      content: 'Ваш договор успешно подписан и вступил в силу.',
      timestamp: new Date('2024-03-12T18:30:00'),
      isRead: false,
      sender: 'system',
      recipients: ['user1']
    },
    {
      id: '2',
      title: 'Добрый день, Иван!',
      content: 'Сообщаем, что срок действия вашего договора истекает через одну неделю.',
      timestamp: new Date('2024-08-05T18:38:00'),
      isRead: true,
      sender: 'system',
      recipients: ['user1']
    }
  ]);

  const [users] = useState<UserType[]>([
    { id: 'user1', name: 'Иван Петров', email: 'ivan@example.com', role: 'user' },
    { id: 'user2', name: 'Мария Сидорова', email: 'maria@example.com', role: 'user' },
    { id: 'user3', name: 'Алексей Козлов', email: 'alexey@example.com', role: 'user' }
  ]);

  const handleSendNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'user': return <User className="w-5 h-5" />;
      case 'manager': return <Users className="w-5 h-5" />;
      case 'admin': return <Shield className="w-5 h-5" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'user': return 'Пользователь';
      case 'manager': return 'Менеджер';
      case 'admin': return 'Администратор';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#1e2c4f]">ExtraSpace</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Уведомления</span>
              </div>
            </div>
            
            {/* Role Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Роль:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['user', 'manager', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      currentRole === role
                        ? 'bg-[#1e2c4f] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {getRoleIcon(role)}
                    <span>{getRoleLabel(role)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'user' && (
          <UserNotifications 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead}
          />
        )}
        {currentRole === 'manager' && (
          <ManagerInterface 
            users={users}
            notifications={notifications}
            onSendNotification={handleSendNotification}
          />
        )}
        {currentRole === 'admin' && (
          <AdminInterface 
            users={users}
            notifications={notifications}
            onSendNotification={handleSendNotification}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;