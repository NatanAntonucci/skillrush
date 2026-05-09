/**
 * Tipo que representa uma Prestação de Contas vinda da API do WordPress
 * CPT: prestacao_conta
 * Usado na página Accounts.tsx
 */
export interface Account {
  id: number;
  title: {
    rendered: string;
  };
  acf?: {
    pc_file?: {
      url: string;
      filename: string;
      filesize: number;
    };
    pc_year?: number;
    pc_type?: string;
    pc_size?: string;
    pc_order?: number;
  };
}
