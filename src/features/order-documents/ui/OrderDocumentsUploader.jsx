/* eslint-disable react/prop-types */
import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import {
  ALLOWED_INPUT_ACCEPT,
  MAX_DOCUMENTS_PER_ORDER,
  MAX_DOCUMENT_BYTES,
} from '../model/constants';
import { validateDocumentFile, formatFileSize } from '../model/validation';
import DocumentTypeSelect from './DocumentTypeSelect';

const OrderDocumentsUploader = ({ documents = [], onUpload, isUploading, disabled }) => {
  const inputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [error, setError] = useState(null);

  const limitReached = documents.length >= MAX_DOCUMENTS_PER_ORDER;

  const reset = () => {
    setPendingFile(null);
    setDocumentType('');
    setVisibleToClient(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateDocumentFile(file, documents);
    if (validation) {
      setError(validation);
      setPendingFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError(null);
    setPendingFile(file);
  };

  const handleSubmit = async () => {
    if (!pendingFile) return;
    try {
      await onUpload({
        file: pendingFile,
        document_type: documentType || undefined,
        visible_to_client: visibleToClient,
      });
      reset();
    } catch {
      // ошибка отображается через onError-хуков, поле не сбрасываем
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-3 sm:p-4">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_INPUT_ACCEPT}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading || limitReached}
      />

      {!pendingFile ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-[#6B6B6B]">
            PDF / DOC / DOCX / JPG / PNG, до {formatFileSize(MAX_DOCUMENT_BYTES)}.
            <br />
            Прикреплено {documents.length} из {MAX_DOCUMENTS_PER_ORDER}.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading || limitReached}
            onClick={() => inputRef.current?.click()}
            className="border-[#31876D]/30 text-[#31876D] hover:bg-[#31876D]/10"
          >
            <Upload className="w-4 h-4" />
            Прикрепить документ
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#273655] truncate" title={pendingFile.name}>
                {pendingFile.name}
              </p>
              <p className="text-xs text-[#6B6B6B]">{formatFileSize(pendingFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-[#6B6B6B] hover:text-[#273655] underline-offset-2 hover:underline"
              disabled={isUploading}
            >
              Очистить
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DocumentTypeSelect
              value={documentType}
              onChange={setDocumentType}
              disabled={isUploading}
              placeholder="Тип (автоопределение по имени)"
            />
            <label className="inline-flex items-center gap-2 text-xs text-[#273655] px-1">
              <Switch
                checked={visibleToClient}
                onCheckedChange={setVisibleToClient}
                disabled={isUploading}
              />
              Показать клиенту сразу после загрузки
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isUploading}
              className="bg-[#31876D] hover:bg-[#2a7561] text-white"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Загрузить
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
      {limitReached && !error && !pendingFile && (
        <p className="mt-2 text-xs text-[#A1824A]">
          Достигнут лимит документов. Удалите ненужный, чтобы добавить новый.
        </p>
      )}
    </div>
  );
};

export default OrderDocumentsUploader;
