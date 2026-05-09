export interface Project {
  id: number;
  title: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  acf?: {
    project_client?: string;
    project_subtitle?: string;
    project_summary?: string;
    project_featured_image?: string;  // Seguindo padrão WordPress ACF
    project_gallery?: Array<{ url: string; title?: string; alt?: string }>;  // Galeria de imagens
    project_status?: string;
    project_start_date?: string;
    project_end_date?: string;
    project_url?: string;
    impacto?: string;  // Legacy field - manter para compatibilidade
  };
}
