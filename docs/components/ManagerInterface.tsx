import React, { useState } from 'react';
import { Send, Users, History } from 'lucide-react';
import { Notification, User } from '../types/notification';
import CreateNotificationForm from './CreateNotificationForm';
import NotificationHistory from './NotificationHistory';

interface ManagerInterfaceProps {
  users: User[];
  notifications: Notification[];
  onSendNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const ManagerInterface: React.FC<ManagerInterfaceProps> = ({
  users,
  notifications,
  onSendNotification
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1e2c4f] rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Панель менеджера</h2>
                <p className="text-sm text-gray-600">Создание и отправка уведомлений</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'create'
                    ? 'border-[#1e2c4f] text-[#1e2c4f]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Создать уведомление</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'history'
                    ? 'border-[#1e2c4f] text-[#1e2c4f]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>История</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'create' && (
            <CreateNotificationForm
              users={users}
              onSendNotification={onSendNotification}
            />
          )}
          {activeTab === 'history' && (
            <NotificationHistory notifications={notifications} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerInterface;