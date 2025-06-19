import React, { useState } from 'react';
import { Send, Users, UserCheck, Search, X } from 'lucide-react';
import { Notification, User } from '../types/notification';

interface CreateNotificationFormProps {
  users: User[];
  onSendNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const CreateNotificationForm: React.FC<CreateNotificationFormProps> = ({
  users,
  onSendNotification
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const recipients = sendToAll ? users.map(u => u.id) : selectedUsers;
    
    onSendNotification({
      title: title.trim(),
      content: content.trim(),
      isRead: false,
      sender: 'manager',
      recipients
    });
    
    // Reset form
    setTitle('');
    setContent('');
    setSendToAll(true);
    setSelectedUsers([]);
    setIsLoading(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const selectedUserNames = selectedUsers.map(id => 
    users.find(u => u.id === id)?.name
  ).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-green-800 font-medium">Уведомление успешно отправлено!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок уведомления
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-all duration-200"
            placeholder="Например: Добрый день, Иван!"
            required
          />
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Текст уведомления
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Введите текст уведомления..."
            required
          />
        </div>

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Кому отправить
          </label>
          
          <div className="space-y-3">
            {/* Send to All */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
                className="w-5 h-5 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
              />
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Всем пользователям ({users.length})</span>
              </div>
            </label>

            {/* Send to Selected */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!sendToAll}
                onChange={(e) => setSendToAll(!e.target.checked)}
                className="w-5 h-5 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
              />
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Выбранным пользователям</span>
              </div>
            </label>
          </div>

          {/* User Selection */}
          {!sendToAll && (
            <div className="mt-4 border border-gray-200 rounded-lg">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowUserList(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent"
                    placeholder="Поиск по имени или email..."
                  />
                </div>
              </div>

              {/* Selected Users Summary */}
              {selectedUsers.length > 0 && (
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Выбрано: {selectedUsers.length} пользователей
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedUsers([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Очистить
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedUserNames.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1e2c4f] text-white"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              {(showUserList || searchTerm) && (
                <div className="max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="w-4 h-4 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </label>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Пользователи не найдены
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !content.trim() || (!sendToAll && selectedUsers.length === 0)}
            className="flex items-center space-x-2 px-6 py-3 bg-[#1e2c4f] text-white rounded-lg font-medium hover:bg-[#2d3f5f] focus:ring-2 focus:ring-[#1e2c4f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
            <span>{isLoading ? 'Отправляется...' : 'Отправить уведомление'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotificationForm;