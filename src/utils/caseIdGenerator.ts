export const generateCaseId = (): string => {
  const prefix = 'TRV';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const generateDocumentId = (): string => {
  return `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
