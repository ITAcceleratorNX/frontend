import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderDocumentsApi } from '../../api/orderDocumentsApi';
import { showGenericError, showGenericSuccess } from '../utils/notifications';

export const ORDER_DOCUMENTS_QUERY_KEYS = {
  ALL: ['order-documents'],
  BY_ORDER: (orderId) => ['order-documents', orderId],
};

const extractErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  return data?.message || data?.error || error?.userMessage || error?.message || fallback;
};

/**
 * Список документов по заказу.
 * - Менеджер видит все документы заказа.
 * - Клиент видит только visible_to_client = true.
 */
export const useOrderDocuments = (orderId, options = {}) => {
  return useQuery({
    queryKey: ORDER_DOCUMENTS_QUERY_KEYS.BY_ORDER(orderId),
    queryFn: () => orderDocumentsApi.list(orderId),
    enabled: Boolean(orderId),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

const invalidateOrder = (queryClient, orderId) => {
  queryClient.invalidateQueries({ queryKey: ORDER_DOCUMENTS_QUERY_KEYS.BY_ORDER(orderId) });
  queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
  queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
};

export const useUploadOrderDocument = (orderId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, document_type, visible_to_client }) =>
      orderDocumentsApi.upload(orderId, file, { document_type, visible_to_client }),
    onSuccess: () => {
      invalidateOrder(queryClient, orderId);
      showGenericSuccess('Документ загружен');
    },
    onError: (error) => {
      showGenericError(extractErrorMessage(error, 'Не удалось загрузить документ'));
    },
  });
};

export const useUpdateOrderDocument = (orderId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, ...patch }) => orderDocumentsApi.update(orderId, documentId, patch),
    onSuccess: () => {
      invalidateOrder(queryClient, orderId);
    },
    onError: (error) => {
      showGenericError(extractErrorMessage(error, 'Не удалось обновить документ'));
    },
  });
};

export const useDeleteOrderDocument = (orderId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId) => orderDocumentsApi.delete(orderId, documentId),
    onSuccess: () => {
      invalidateOrder(queryClient, orderId);
      showGenericSuccess('Документ удалён');
    },
    onError: (error) => {
      showGenericError(extractErrorMessage(error, 'Не удалось удалить документ'));
    },
  });
};

/**
 * Открывает новую вкладку синхронно (в user-gesture), чтобы не словить popup blocker,
 * показывает в ней заглушку «Загрузка…» и возвращает ссылку на окно.
 */
const openBlankTab = () => {
  const win = window.open('about:blank', '_blank');
  if (!win) return null;
  try {
    win.opener = null;
    win.document.write(
      '<!doctype html><meta charset="utf-8"><title>Загрузка документа…</title>' +
        '<style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#273655;background:#f7f7f8}</style>' +
        '<p>Загрузка документа…</p>'
    );
  } catch {
    // about:blank иногда даёт ограничения на write — просто игнорируем.
  }
  return win;
};

const navigateOrFallback = (win, url) => {
  if (win && !win.closed) {
    win.location.href = url;
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const closeIfOpen = (win) => {
  if (win && !win.closed) {
    try { win.close(); } catch { /* ignore */ }
  }
};

/**
 * Открыть signed URL во вкладке (просмотр).
 * Возвращает `open(documentId)` — функцию, которую нужно дёрнуть прямо из onClick,
 * чтобы вкладка успела открыться внутри user-gesture.
 */
export const useOpenOrderDocument = (orderId) => {
  const mutation = useMutation({
    mutationFn: async ({ documentId, win }) => {
      try {
        const data = await orderDocumentsApi.open(orderId, documentId);
        if (!data?.url) throw new Error('Не удалось получить ссылку на документ');
        navigateOrFallback(win, data.url);
        return data;
      } catch (error) {
        closeIfOpen(win);
        throw error;
      }
    },
    onError: (error) => {
      showGenericError(extractErrorMessage(error, 'Не удалось открыть документ'));
    },
  });

  const open = (documentId, options = {}) => {
    const win = openBlankTab();
    mutation.mutate({ documentId, win }, options);
  };

  return { ...mutation, open };
};

/**
 * Скачать документ. Cloudinary возвращает URL уже с Content-Disposition: attachment,
 * поэтому достаточно навигировать на него — браузер сам начнёт скачивание.
 * Окно тоже открываем синхронно, чтобы обойти popup blocker.
 */
export const useDownloadOrderDocument = (orderId) => {
  const mutation = useMutation({
    mutationFn: async ({ documentId, win }) => {
      try {
        const { url, file_name } = await orderDocumentsApi.download(orderId, documentId);
        if (!url) throw new Error('Не удалось получить ссылку на документ');
        navigateOrFallback(win, url);
        return { file_name };
      } catch (error) {
        closeIfOpen(win);
        throw error;
      }
    },
    onError: (error) => {
      showGenericError(extractErrorMessage(error, 'Не удалось скачать документ'));
    },
  });

  const download = (documentId, options = {}) => {
    const win = openBlankTab();
    mutation.mutate({ documentId, win }, options);
  };

  return { ...mutation, download };
};
