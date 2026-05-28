/* eslint-disable react/prop-types */
import React from 'react';
import { Download, Eye, Trash2, FileText, Loader2 } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { DOCUMENT_TYPE_LABELS } from '../model/constants';
import { formatFileSize } from '../model/validation';
import { formatCalendarDateLong } from '../../../shared/lib/utils/date';
import DocumentTypeSelect from './DocumentTypeSelect';

const ActionButton = ({ onClick, disabled, loading, icon: Icon, label, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
    {label}
  </button>
);

const OrderDocumentRow = ({
  document,
  mode,
  onOpen,
  onDownload,
  onDelete,
  onTypeChange,
  onVisibilityChange,
  isOpening,
  isDownloading,
  isDeleting,
  isUpdating,
}) => {
  const isManager = mode === 'manager';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 hover:border-[#31876D]/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#31876D]/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[#31876D]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-medium text-[#273655] truncate" title={document.file_name}>
              {document.file_name}
            </p>
            {!isManager && (
              <Badge variant="outline" className="text-[10px] font-normal border-gray-200">
                {DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}
              </Badge>
            )}
            {isManager && document.visible_to_client && (
              <Badge className="text-[10px] bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20">
                Виден клиенту
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6B6B]">
            <span>{formatCalendarDateLong(document.created_at) || '—'}</span>
            <span className="text-gray-300">•</span>
            <span>{formatFileSize(document.size_bytes)}</span>
            {document.uploaded_by?.name && (
              <>
                <span className="text-gray-300">•</span>
                <span>Загрузил: {document.uploaded_by.name}</span>
              </>
            )}
          </div>

          {isManager && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:items-center">
              <DocumentTypeSelect
                value={document.document_type}
                onChange={(value) => onTypeChange?.(document.id, value)}
                disabled={isUpdating}
              />
              <label className="inline-flex items-center gap-2 text-xs text-[#273655]">
                <Switch
                  checked={Boolean(document.visible_to_client)}
                  onCheckedChange={(checked) => onVisibilityChange?.(document.id, checked)}
                  disabled={isUpdating}
                />
                Показать клиенту
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
        <ActionButton
          onClick={() => onOpen?.(document.id)}
          loading={isOpening}
          icon={Eye}
          label="Открыть"
          className="text-[#273655] hover:bg-gray-100"
        />
        <ActionButton
          onClick={() => onDownload?.(document.id)}
          loading={isDownloading}
          icon={Download}
          label="Скачать"
          className="text-[#273655] hover:bg-gray-100"
        />
        {isManager && (
          <ActionButton
            onClick={() => onDelete?.(document.id)}
            loading={isDeleting}
            icon={Trash2}
            label="Удалить"
            className="text-red-600 hover:bg-red-50"
          />
        )}
      </div>
    </div>
  );
};

export default OrderDocumentRow;
