import React, { memo } from 'react';
import { usePendingChats } from '../../../shared/lib/hooks/use-pending-chats';

// Простой пример использования хука usePendingChats
const PendingChatsExample = memo(() => {
  const {
    pendingChats,
    pendingChatsCount,
    hasNewChats,
    isLoading,
    isError,
    error,
    refetchPendingChats,
    isManagerOrAdmin
  } = usePendingChats();

  // Если пользователь не менеджер/админ
  if (!isManagerOrAdmin) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">
          Доступ к ожидающим чатам только для менеджеров и администраторов
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        Пример использования usePendingChats
      </h3>

      {/* Статус загрузки */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-blue-700">Загрузка ожидающих чатов...</p>
        </div>
      )}

      {/* Ошибка */}
      {isError && (
        <div className="mb-4 p-3 bg-red-50 rounded">
          <p className="text-red-700">
            Ошибка: {error?.message || 'Не удалось загрузить чаты'}
          </p>
          <button
            onClick={refetchPendingChats}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Статистика */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p><strong>Количество ожидающих чатов:</strong> {pendingChatsCount}</p>
        <p><strong>Есть новые чаты:</strong> {hasNewChats ? 'Да' : 'Нет'}</p>
        <p><strong>Роль позволяет доступ:</strong> {isManagerOrAdmin ? 'Да' : 'Нет'}</p>
      </div>

      {/* Список чатов */}
      {hasNewChats ? (
        <div>
          <h4 className="font-medium mb-2">Ожидающие чаты:</h4>
          <div className="space-y-2">
            {pendingChats.map((chat) => (
              <div key={chat.id} className="p-3 border rounded bg-yellow-50">
                <p><strong>ID чата:</strong> {chat.id}</p>
                <p><strong>ID пользователя:</strong> {chat.user_id}</p>
                <p><strong>Статус:</strong> {chat.status}</p>
                <p><strong>Менеджер:</strong> {chat.manager_id || 'Не назначен'}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-green-50 rounded">
          <p className="text-green-700">Нет ожидающих чатов</p>
        </div>
      )}

      {/* Кнопка обновления */}
      <div className="mt-4">
        <button
          onClick={refetchPendingChats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Обновить список
        </button>
      </div>

      {/* JSON данные для отладки */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">
          Показать JSON данные (для отладки)
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(pendingChats, null, 2)}
        </pre>
      </details>
    </div>
  );
});

PendingChatsExample.displayName = 'PendingChatsExample';

export default PendingChatsExample; 