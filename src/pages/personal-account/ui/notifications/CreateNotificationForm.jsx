import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CreateNotificationForm = ({ users = [], onSendNotification, scale = 1 }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Стили для масштабирования
  const scaleStyle = {
    '--label-size': `${18 * scale}px`,
    '--input-size': `${18 * scale}px`,
    '--heading-size': `${24 * scale}px`,
    '--button-size': `${20 * scale}px`,
    '--button-height': `${50 * scale}px`,
    '--spacing': `${20 * scale}px`,
    '--input-padding': `${16 * scale}px`,
    '--border-radius': `${8 * scale}px`,
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      toast.error('Выберите получателей уведомления');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const recipients = sendToAll ? users.map(u => u.id) : selectedUsers;
      
      await onSendNotification({
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
      setSearchTerm('');
      
      toast.success('Уведомление успешно отправлено!');
    } catch (error) {
      toast.error('Ошибка при отправке уведомления');
      console.error('Send notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserNames = selectedUsers.map(id => 
    users.find(u => u.id === id)?.name
  ).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto" style={scaleStyle}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900" style={{fontSize: 'var(--heading-size)'}}>
            Создать уведомление
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block font-medium text-gray-700 mb-2" style={{fontSize: 'var(--label-size)'}}>
              Заголовок уведомления *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-all duration-200"
              placeholder="Например: Добрый день, Иван!"
              required
              style={{
                fontSize: 'var(--input-size)',
                padding: 'var(--input-padding)',
                borderRadius: 'var(--border-radius)',
                height: 'var(--button-height)',
              }}
            />
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block font-medium text-gray-700 mb-2" style={{fontSize: 'var(--label-size)'}}>
              Текст уведомления *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Введите текст уведомления..."
              required
              style={{
                fontSize: 'var(--input-size)',
                padding: 'var(--input-padding)',
                borderRadius: 'var(--border-radius)',
              }}
            />
          </div>

          {/* Recipients */}
          <div>
            <label className="block font-medium text-gray-700 mb-3" style={{fontSize: 'var(--label-size)'}}>
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
                  style={{
                    width: `${20 * scale}px`,
                    height: `${20 * scale}px`,
                  }}
                />
                <div className="flex items-center">
                  <span className="text-gray-900" style={{fontSize: 'var(--input-size)'}}>
                    Всем пользователям ({users.length})
                  </span>
                </div>
              </label>

              {/* Send to Selected */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!sendToAll}
                  onChange={(e) => setSendToAll(!e.target.checked)}
                  className="w-5 h-5 text-[#1e2c4f] border-gray-300 rounded focus:ring-[#1e2c4f]"
                  style={{
                    width: `${20 * scale}px`,
                    height: `${20 * scale}px`,
                  }}
                />
                <div className="flex items-center">
                  <span className="text-gray-900" style={{fontSize: 'var(--input-size)'}}>
                    Выбранным пользователям
                  </span>
                </div>
              </label>
            </div>

            {/* User Selection */}
            {!sendToAll && (
              <div className="mt-4 border border-gray-200 rounded-lg">
                {/* Search */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowUserList(true)}
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent"
                      placeholder="Поиск по имени или email..."
                      style={{
                        fontSize: 'var(--input-size)',
                        height: 'var(--button-height)',
                      }}
                    />
                  </div>
                </div>

                {/* Selected Users Summary */}
                {selectedUsers.length > 0 && (
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600" style={{fontSize: 'var(--input-size)'}}>
                        Выбрано: {selectedUsers.length} пользователей
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers([])}
                        className="text-red-600 hover:text-red-800"
                        style={{fontSize: 'var(--input-size)'}}
                      >
                        Очистить
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedUserNames.map((name, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1e2c4f] text-white"
                          style={{fontSize: 'var(--input-size)'}}
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
                          style={{
                            width: `${16 * scale}px`,
                            height: `${16 * scale}px`,
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900" 
                               style={{fontSize: 'var(--input-size)'}}>
                            {user.name}
                          </div>
                          <div className="text-gray-500" 
                               style={{fontSize: `${14 * scale}px`}}>
                            {user.email}
                          </div>
                        </div>
                      </label>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <div className="p-4 text-center text-gray-500" 
                           style={{fontSize: 'var(--input-size)'}}>
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
              className="px-6 bg-[#1e2c4f] text-white rounded-lg font-medium hover:bg-[#2d3f5f] focus:ring-2 focus:ring-[#1e2c4f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                fontSize: 'var(--button-size)',
                height: 'var(--button-height)',
              }}
            >
              {isLoading ? 'Отправляется...' : 'Отправить уведомление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationForm; 