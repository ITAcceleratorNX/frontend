/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import {
  useDeleteOrderDocument,
  useDownloadOrderDocument,
  useOpenOrderDocument,
  useOrderDocuments,
  useUpdateOrderDocument,
  useUploadOrderDocument,
} from '../../../shared/lib/hooks/use-order-documents';
import OrderDocumentRow from './OrderDocumentRow';
import OrderDocumentsUploader from './OrderDocumentsUploader';

/**
 * Универсальная секция документов заказа.
 *
 * Используется и в личном кабинете клиента, и в карточке заказа менеджера.
 * Поведение управляется только пропом `mode`:
 *   - 'manager' — загрузка/удаление/изменение типа и видимости.
 *   - 'client'  — только просмотр/скачивание видимых документов.
 */
const OrderDocumentsSection = ({
  orderId,
  mode = 'client',
  title = 'Документы',
  className = '',
  emptyText,
}) => {
  const isManager = mode === 'manager';

  const { data: documents = [], isLoading, isError, refetch } = useOrderDocuments(orderId);

  const upload = useUploadOrderDocument(orderId);
  const update = useUpdateOrderDocument(orderId);
  const remove = useDeleteOrderDocument(orderId);
  const open = useOpenOrderDocument(orderId);
  const download = useDownloadOrderDocument(orderId);

  const [activeDocId, setActiveDocId] = useState(null);

  const handleOpen = (documentId) => {
    setActiveDocId(documentId);
    open.open(documentId, { onSettled: () => setActiveDocId(null) });
  };
  const handleDownload = (documentId) => {
    setActiveDocId(documentId);
    download.download(documentId, { onSettled: () => setActiveDocId(null) });
  };
  const handleDelete = (documentId) => {
    if (!window.confirm('Удалить документ безвозвратно?')) return;
    setActiveDocId(documentId);
    remove.mutate(documentId, { onSettled: () => setActiveDocId(null) });
  };
  const handleTypeChange = (documentId, document_type) => {
    setActiveDocId(documentId);
    update.mutate({ documentId, document_type }, { onSettled: () => setActiveDocId(null) });
  };
  const handleVisibilityChange = (documentId, visible_to_client) => {
    setActiveDocId(documentId);
    update.mutate({ documentId, visible_to_client }, { onSettled: () => setActiveDocId(null) });
  };

  const isRowActive = (id) => activeDocId === id;

  return (
    <section className={`rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 ${className}`}>
      <header className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#31876D]/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#31876D]" />
          </div>
          <h3 className="text-base font-semibold text-[#273655]">{title}</h3>
        </div>
        {documents.length > 0 && (
          <span className="text-xs text-[#6B6B6B]">{documents.length} шт.</span>
        )}
      </header>

      {isManager && (
        <div className="mb-3">
          <OrderDocumentsUploader
            documents={documents}
            onUpload={(payload) => upload.mutateAsync(payload)}
            isUploading={upload.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-[#6B6B6B]">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Загрузка документов…</span>
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <div className="flex-1">
            Не удалось загрузить документы.{' '}
            <button type="button" onClick={() => refetch()} className="underline">
              Повторить
            </button>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-[#6B6B6B] py-4 text-center">
          {emptyText || (isManager ? 'Документы пока не прикреплены.' : 'Документы появятся после того, как менеджер их прикрепит.')}
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((document) => (
            <OrderDocumentRow
              key={document.id}
              document={document}
              mode={mode}
              onOpen={handleOpen}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onTypeChange={handleTypeChange}
              onVisibilityChange={handleVisibilityChange}
              isOpening={open.isPending && isRowActive(document.id)}
              isDownloading={download.isPending && isRowActive(document.id)}
              isDeleting={remove.isPending && isRowActive(document.id)}
              isUpdating={update.isPending && isRowActive(document.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default OrderDocumentsSection;
