/**
 * Tipo que representa um Documento vindo da API (CPT unificado)
 * Pode ser: Edital, Prestação de Contas ou Documento Institucional
 * Filtrado pela taxonomy tipo_documento
 */

// Campos ACF comuns a todos os documentos (baseado no layout atual)
interface DocumentoACFBase {
  arquivo_pdf?: number | string | {
    ID: number;
    url: string;
    filename: string;
    filesize: number;
    mime_type: string;
  };
  data_publicacao?: string; // formato: Ymd (20260225)
}

// Campos específicos de Editais
interface EditalACFFields {
  descricao_curta?: string;
  status_edital?: 'Aberto' | 'Encerrado';
}

// Union type completo para ACF do documento
export type DocumentoACF = DocumentoACFBase & Partial<EditalACFFields>;

// Tipo principal do documento
export interface Documento {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  tipo_documento?: number[];  // IDs dos termos da taxonomy
  ano_documento?: number[];   // IDs dos anos
  acf?: DocumentoACF;
  _embedded?: {
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
    'wp:attachment'?: Array<{
      id?: number;
      source_url?: string;
      mime_type?: string;
      media_details?: {
        filesize?: number;
      };
    }>;
  };
}

// Type guards para identificar o tipo do documento
export function isEdital(doc: Documento): boolean {
  const tipoTerm = doc._embedded?.['wp:term']?.[0]?.find(
    term => term.taxonomy === 'tipo_documento'
  );
  return tipoTerm?.slug === 'edital';
}

export function isPrestacaoContas(doc: Documento): boolean {
  const tipoTerm = doc._embedded?.['wp:term']?.[0]?.find(
    term => term.taxonomy === 'tipo_documento'
  );
  return tipoTerm?.slug === 'prestacao-contas';
}

export function isDocumentoInstitucional(doc: Documento): boolean {
  const tipoTerm = doc._embedded?.['wp:term']?.[0]?.find(
    term => term.taxonomy === 'tipo_documento'
  );
  return tipoTerm?.slug === 'documentos-institucionais' || 
         tipoTerm?.slug === 'atas' || 
         tipoTerm?.slug === 'relatorios' || 
         tipoTerm?.slug === 'estatutos';
}

// Aliases para compatibilidade com código existente (LEGACY)
export type Document = Documento;
export type Edit = Documento;
export type Account = Documento;
