// types/partners.ts
export interface Partner {
  id: number;
  title?: {
    rendered: string;
  };
  acf?: {
    partner_name?: string;
    partner_logo?: number | string | { id: number; url: string; alt?: string }; // múltiplos tipos possíveis
    partner_website?: string;
    partner_status?: string;
    partner_is_featured?: boolean;
  };
}