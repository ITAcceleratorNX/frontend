import React, {useState} from 'react';
import { toast } from 'react-toastify';



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

  const handleSubmit = async () => {
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
      setTitle('');
      setContent('');
      setSendToAll(true);
      setSelectedUsers([]);
      setSearchTerm('');
      setIsEmail(false);
      setIsSms(false);
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
            <h2 className="font-semibold text-gray-900" style={{ fontSize: 'var(--heading-size)' }}>
              Создать уведомление
            </h2>
          </div>

          <form className="p-6 space-y-6" onSubmit={e => e.preventDefault()}>
            {/* Заголовок */}
            <div>
              <label className="block font-medium text-gray-700 mb-2" style={{ fontSize: 'var(--label-size)' }}>
                Заголовок уведомления *
              </label>
              <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Например: Уведомление"
                  required
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent"
                  style={{
                    fontSize: 'var(--input-size)',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--border-radius)',
                    height: 'var(--button-height)',
                  }}
              />
            </div>

            {/* Текст */}
            <div>
              <label className="block font-medium text-gray-700 mb-2" style={{ fontSize: 'var(--label-size)' }}>
                Текст уведомления *
              </label>
              <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  required
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent resize-none"
                  placeholder="Введите текст уведомления..."
                  style={{
                    fontSize: 'var(--input-size)',
                    padding: 'var(--input-padding)',
                    borderRadius: 'var(--border-radius)',
                  }}
              />
            </div>
            {/* Тип уведомления */}
            <div>
              <label
                  className="block font-medium text-gray-700 mb-2"
                  style={{ fontSize: 'var(--label-size)' }}
              >
                Тип уведомления *
              </label>
              <div className="relative">
                <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full appearance-none border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent transition-all duration-200"
                    style={{
                      fontSize: 'var(--input-size)',
                      padding: 'var(--input-padding)',
                      paddingRight: '2.5rem', // место для стрелки
                      height: 'var(--button-height)',
                      borderRadius: 'var(--border-radius)',
                    }}
                >
                  <option value="general">Общее</option>
                  <option value="payment">Платёж</option>
                  <option value="contract">Договор</option>
                </select>
                {/* кастомная стрелочка */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Способы отправки */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={isEmail}
                    onChange={() => setIsEmail(prev => !prev)}
                />
                <span style={{ fontSize: 'var(--input-size)' }}>Отправить через Email</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={isSms}
                    onChange={() => setIsSms(prev => !prev)}
                />
                <span style={{ fontSize: 'var(--input-size)' }}>Отправить через SMS</span>
              </label>
            </div>

            {/* Получатели */}
            <div>
              <label className="block font-medium text-gray-700 mb-3" style={{ fontSize: 'var(--label-size)' }}>
                Кому отправить
              </label>

              <label className="flex items-center space-x-3 mb-2">
                <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={e => setSendToAll(e.target.checked)}
                />
                <span style={{ fontSize: 'var(--input-size)' }}>Всем ({users.length})</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    checked={!sendToAll}
                    onChange={e => setSendToAll(!e.target.checked)}
                />
                <span style={{ fontSize: 'var(--input-size)' }}>Выбранным пользователям</span>
              </label>

              {!sendToAll && (
                  <div className="mt-4 border rounded p-3">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Поиск по имени/email"
                        className="w-full mb-2 p-2 border rounded"
                    />

                    {selectedUserNames.length > 0 && (
                        <div className="mb-2 text-sm text-gray-600">
                          Выбрано: {selectedUserNames.join(', ')}
                        </div>
                    )}

                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredUsers.map(user => (
                          <label key={user.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleUserToggle(user.id)}
                            />
                            <span>{user.name} ({user.email})</span>
                          </label>
                      ))}

                      {filteredUsers.length === 0 && (
                          <div className="text-gray-500 text-sm">Пользователи не найдены</div>
                      )}
                    </div>
                  </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  style={{ fontSize: 'var(--button-size)', height: 'var(--button-height)' }}
              >
                {isLoading ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreateNotificationForm;