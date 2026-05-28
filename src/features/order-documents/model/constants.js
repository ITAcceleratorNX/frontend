export const DOCUMENT_TYPES = ['CONTRACT', 'ACT', 'INVOICE', 'APPENDIX', 'EDO', 'OTHER'];

export const DOCUMENT_TYPE_LABELS = {
  CONTRACT: 'Договор',
  ACT: 'Акт',
  INVOICE: 'Счёт',
  APPENDIX: 'Приложение',
  EDO: 'ЭДО',
  OTHER: 'Другое',
};

export const MAX_DOCUMENTS_PER_ORDER = 3;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_BYTES_PER_ORDER = 30 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

export const ALLOWED_INPUT_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png';

export const DOCUMENT_ERRORS = {
  UNSUPPORTED_FORMAT: 'Разрешены только PDF, DOC, DOCX, JPG, PNG',
  FILE_TOO_LARGE: 'Файл превышает допустимый размер 10 МБ',
  TOO_MANY_DOCUMENTS: 'К одному заказу можно прикрепить не более 3 документов',
  TOTAL_LIMIT_EXCEEDED: 'Превышен общий лимит документов по заказу (30 МБ)',
};
