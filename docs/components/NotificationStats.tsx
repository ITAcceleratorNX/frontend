import React from 'react';
import { BarChart3, Users, Bell, CheckCircle, Clock } from 'lucide-react';
import { Notification, User } from '../types/notification';

interface NotificationStatsProps {
  notifications: Notification[];
  users: User[];
}

const NotificationStats: React.FC<NotificationStatsProps> = ({ notifications, users }) => {
  const totalNotifications = notifications.length;
  const readNotifications = notifications.filter(n => n.isRead).length;
  const unreadNotifications = totalNotifications - readNotifications;
  const readPercentage = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;

  const stats = [
    {
      label: 'Всего уведомлений',
      value: totalNotifications,
      icon: Bell,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Прочитано',
      value: readNotifications,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Не прочитано',
      value: unreadNotifications,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      label: 'Активных пользователей',
      value: users.length,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[#1e2c4f]" />
        <h3 className="text-lg font-semibold text-gray-900">Аналитика уведомлений</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${stat.textColor} mb-1`}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Read Rate Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Статистика прочтения</h4>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Прочитано</span>
            <span className="font-medium text-gray-900">{readPercentage.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#1e2c4f] h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${readPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{readNotifications} прочитано</span>
            <span>{unreadNotifications} не прочитано</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Последняя активность</h4>
          
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <span className="text-gray-900 font-medium truncate flex-1">
                  {notification.title}
                </span>
                <span className="text-gray-500 whitespace-nowrap">
                  {notification.timestamp.toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationStats;