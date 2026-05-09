/**
 * Utilitários de formatação
 */

/**
 * Formata bytes para formato legível (KB, MB, GB)
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Extrai extensão do arquivo
 * @param filename - Nome do arquivo
 * @returns Extensão em maiúsculas (ex: "PDF")
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || '';
}

/**
 * Formata data no padrão brasileiro
 * @param dateString - Data em formato ISO ou string
 * @returns Data formatada (ex: "15/01/2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
