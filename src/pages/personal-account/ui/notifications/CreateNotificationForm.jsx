import React, { useState } from 'react';
import { Send, Users, Mail, MessageSquare, Search, X, Check, User, ChevronDown, Loader2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../../../shared/lib/toast';

const CreateNotificationForm = ({ users = [], onSendNotification, scale = 1 }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('general');
  const [isEmail, setIsEmail] = useState(false);
  const [isSms, setIsSms] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showErrorToast('Заполните все обязательные поля');
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      showErrorToast('Выберите получателей уведомления');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user_ids = sendToAll ? users.map(u => u.id) : selectedUsers;
      
      await onSendNotification({
        user_ids,
        isToAll: sendToAll,
        title: title.trim(),
        message: content.trim(),
        notification_type: notificationType,
        is_email: isEmail,
        is_sms: isSms,
      });
      
      // Сбрасываем форму
      setTitle('');
      setContent('');
      setSendToAll(true);
      setSelectedUsers([]);
      setSearchTerm('');
      setIsEmail(false);
      setIsSms(false);
      showSuccessToast('Уведомление успешно отправлено!');
    } catch (error) {
      showErrorToast('Ошибка при отправке уведомления');
      console.error('Send notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserNames = selectedUsers.map(id => 
    users.find(u => u.id === id)?.name
  ).filter(Boolean);

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return <MessageSquare className="w-4 h-4" />;
      case 'contract':
        return <Mail className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Создать новое уведомление</h2>
        <p className="text-gray-600">Отправьте важную информацию пользователям системы</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная форма */}
        <div className="lg:col-span-2 space-y-6">
          {/* Заголовок уведомления */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Заголовок уведомления *
            </label>
            <input
              type="text"
              value={title}
                  onChange={e => setTitle(e.target.value)}
              placeholder="Например: Важное обновление системы"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-colors text-sm"
            />
          </div>

          {/* Содержание */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Текст уведомления *
            </label>
            <textarea
              value={content}
                  onChange={e => setContent(e.target.value)}
              rows={6}
              placeholder="Введите подробное описание уведомления..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent resize-none transition-colors text-sm"
            />
          </div>

            {/* Тип уведомления */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
                Тип уведомления *
              </label>
              <div className="relative">
                <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                className="w-full appearance-none px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-colors text-sm pr-10"
                >
                <option value="general">📢 Общее уведомление</option>
                <option value="payment">💳 Уведомление о платеже</option>
                <option value="contract">📋 Уведомление о договоре</option>
                </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Способы доставки */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Способы доставки
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                    type="checkbox"
                    checked={isEmail}
                    onChange={() => setIsEmail(prev => !prev)}
                  className="w-4 h-4 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
                />
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Отправить через Email</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                    type="checkbox"
                    checked={isSms}
                    onChange={() => setIsSms(prev => !prev)}
                  className="w-4 h-4 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
                />
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Отправить через SMS</span>
              </label>
            </div>
          </div>
            </div>

        {/* Боковая панель - получатели */}
        <div className="space-y-6">
          {/* Выбор получателей */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Получатели
            </label>
            
            <div className="space-y-4">
              {/* Отправить всем */}
              <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${sendToAll ? 'border-[#1e2c4f] bg-blue-50' : 'border-gray-200'}">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={() => setSendToAll(prev => !prev)}
                  className="w-4 h-4 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
                />
                <Users className="w-4 h-4 text-[#1e2c4f]" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Отправить всем</span>
                  <p className="text-xs text-gray-500">{users.length} пользователей</p>
                </div>
              </label>

              {/* Выборочная отправка */}
            {!sendToAll && (
                <div className="space-y-3">
                  {/* Поиск пользователей */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск пользователей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Список пользователей */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Пользователи не найдены
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                            className="w-4 h-4 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
                          />
                          <div className="w-8 h-8 bg-[#1e2c4f] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name || `Пользователь #${user.id}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                      </label>
                      ))
                    )}
                  </div>

                  {/* Выбранные пользователи */}
                  {selectedUsers.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-[#1e2c4f] mb-2">
                        Выбрано: {selectedUsers.length} из {users.length}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedUserNames.slice(0, 3).map((name, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-white text-[#1e2c4f] rounded">
                            {name}
                          </span>
                        ))}
                        {selectedUserNames.length > 3 && (
                          <span className="text-xs text-[#1e2c4f]">
                            +{selectedUserNames.length - 3} еще
                          </span>
                      )}
                      </div>
              </div>
            )}
                </div>
              )}
            </div>
          </div>

          {/* Кнопка отправки */}
            <button
                  onClick={handleSubmit}
            disabled={isLoading || !title.trim() || !content.trim() || (!sendToAll && selectedUsers.length === 0)}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-[#1e2c4f] text-white rounded-lg hover:bg-[#1e2c4f]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Отправить уведомление</span>
              </>
            )}
            </button>
          </div>
      </div>
    </div>
  );
};

export default CreateNotificationForm; 