/**
 * Tipo que representa um Edital vindo da API do WordPress
 * CPT: edital
 * Usado na página Edits.tsx
 */
export interface Edit {
  id: number;
  title: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  acf?: {
    edital_description?: string;
    edital_file?: {
      url: string;
      filename: string;
      filesize: number;
    };
    edital_year?: number;
    edital_publish_date?: string;
    edital_status?: 'Aberto' | 'Encerrado';
    edital_is_featured?: boolean;
  };
}
