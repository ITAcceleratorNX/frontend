import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  DOCUMENT_ERRORS,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENTS_PER_ORDER,
  MAX_TOTAL_BYTES_PER_ORDER,
} from './constants';

const getExtension = (name) => {
  if (typeof name !== 'string') return '';
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
};

export const validateDocumentFile = (file, existingDocuments = []) => {
  if (!file) return DOCUMENT_ERRORS.UNSUPPORTED_FORMAT;

  const ext = getExtension(file.name);
  const mime = file.type || '';
  if (!ALLOWED_EXTENSIONS.includes(ext) || (mime && !ALLOWED_MIME_TYPES.includes(mime))) {
    return DOCUMENT_ERRORS.UNSUPPORTED_FORMAT;
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return DOCUMENT_ERRORS.FILE_TOO_LARGE;
  }
  if (existingDocuments.length >= MAX_DOCUMENTS_PER_ORDER) {
    return DOCUMENT_ERRORS.TOO_MANY_DOCUMENTS;
  }
  const totalSize = existingDocuments.reduce((sum, d) => sum + Number(d?.size_bytes || 0), 0);
  if (totalSize + file.size > MAX_TOTAL_BYTES_PER_ORDER) {
    return DOCUMENT_ERRORS.TOTAL_LIMIT_EXCEEDED;
  }
  return null;
};

export const formatFileSize = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 1024) return `${value} Б`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} КБ`;
  return `${(value / (1024 * 1024)).toFixed(2)} МБ`;
};
