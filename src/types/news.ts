/**
 * Tipo que representa uma Categoria de Notícia vinda da API do WordPress
 */
export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  taxonomy: 'noticia_category';
  count?: number;
}

/**
 * Tipo que representa uma Noticia vinda da API do WordPress
 * Com suporte a múltiplas categorias (taxonomy: noticia_category)
 */
export interface news {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  // Optional direct link to the post (when provided by API)
  link?: string;
  // Full content when returned by the API
  content?: {
    rendered: string;
  };
  // Categories associadas via taxonomy (API nova)
  noticia_category?: number[];
  // ACF fields (if applicable)
  acf?: {
    featured_image?: number;
    category?: string;
  };
  // Embedded data da REST API (quando usa ?_embed=wp:term)
  _embedded?: {
    'wp:term'?: NewsCategory[][];
  };
}
