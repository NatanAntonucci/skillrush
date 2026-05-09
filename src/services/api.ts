const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function normalizeUrl(endpoint: string) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const base = API_BASE_URL.replace(/\/+$|^\//g, '');
  const path = endpoint.replace(/^\/+/, '');
  return base ? `${base}/${path}` : path;
}

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = normalizeUrl(endpoint);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${url}`);
  }

  return response.json() as Promise<T>;
}

export function buildApiUrl(endpoint: string) {
  return normalizeUrl(endpoint);
}

export function fetchProjetos() {
  if (isLegacyEnabled) {
    return fetchLegacyPostsByCategory(LEGACY_CATEGORY_PROJECTS).then((posts) =>
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        acf: {
          impacto: '',
          project_image: getFeaturedImageUrl(post) || undefined,
        },
      }))
    );
  }
  
  return fetchAPI<Project[]>('projetos?per_page=10&_embed=wp:featuredmedia')
    .then(projects => 
      projects.map(project => {
        const imageUrl = extractImageUrl(project.acf?.project_featured_image) 
                        || extractFeaturedImageUrl(project);
        
        // Se não tem excerpt, usa início do content
        let excerpt = project.excerpt;
        if (!excerpt?.rendered && project.content?.rendered) {
          const plainText = project.content.rendered.replace(/<[^>]*>/g, '').trim();
          excerpt = { rendered: plainText.substring(0, 200) + '...' };
        }
        
        return {
          ...project,
          excerpt,
          content: project.content ? { ...project.content, rendered: cleanContent(project.content.rendered || '') } : undefined,
          acf: project.acf ? {
            ...project.acf,
            project_featured_image: imageUrl,
          } : undefined,
        };
      })
    );
}

export function fetchEventos() {
  if (isLegacyEnabled) {
    return fetchLegacyPostsByCategory(LEGACY_CATEGORY_EVENTS).then((posts) =>
      posts.map((post) => ({
        id: post.id,
        slug: '',
        title: post.title,
        content: post.content,
        acf: {
          event_summary: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || '',
          event_start_date: toYmd(post.date),
          event_end_date: '',
          event_location: '',
          event_registration_url: '',
          event_is_featured: false,
          event_featured_image: getFeaturedImageUrl(post) || undefined,
        },
      }))
    );
  }
  
  return fetchAPI<Event[]>('eventos?per_page=10&_embed=wp:featuredmedia')
    .then(events =>
      events.map(event => {
        const imageUrl = extractImageUrl(event.acf?.event_featured_image) 
                        || extractFeaturedImageUrl(event);
        
        // Se não tem summary no ACF, gera a partir do excerpt ou content
        let acfData = event.acf || {};
        if (!acfData.event_summary) {
          // Prioriza excerpt do WordPress
          if (event.excerpt?.rendered) {
            const plainText = event.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
            if (plainText.length > 0) {
              acfData = {
                ...acfData,
                event_summary: plainText.substring(0, 200)
              };
            }
          } 
          // Fallback para content se excerpt também não existir
          else if (event.content?.rendered) {
            const plainText = event.content.rendered.replace(/<[^>]*>/g, '').trim();
            if (plainText.length > 0) {
              acfData = {
                ...acfData,
                event_summary: plainText.substring(0, 150) + '...'
              };
            }
          }
          
          // Se ainda não tem summary (evento completamente vazio), usa o título
          if (!acfData.event_summary) {
            const titleText = event.title.rendered.replace(/<[^>]*>/g, '').trim();
            acfData = {
              ...acfData,
              event_summary: `Evento: ${titleText}`
            };
          }
        }

        return {
          ...event,
          content: event.content ? { ...event.content, rendered: cleanContent(event.content.rendered || '') } : undefined,
          acf: {
            ...acfData,
            event_featured_image: imageUrl,
          },
        };
      })
    );
}

export function fetchParceiros() {
  if (isLegacyEnabled) {
    return fetchLegacyPostsByCategory(LEGACY_CATEGORY_PARTNERS).then((posts) =>
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        acf: {
          partner_name: post.title?.rendered || '',
          partner_logo: getFeaturedImageUrl(post) || '',
          partner_website: post.link || '',
          partner_status: 'ativo',
          partner_is_featured: false,
        },
      }))
    );
  }
  return fetchAPI<Partner[]>('parcerias?per_page=20&acf_format=standard&_fields=id,title,acf');
}

export function fetchCapacitacoes() {
  if (isLegacyEnabled) {
    return fetchLegacyPostsByCategory(LEGACY_CATEGORY_TRAINING).then((posts) =>
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        acf: {
          cap_subtitle: '',
          cap_summary: post.excerpt?.rendered || '',
          cap_feature_image: getFeaturedImageUrl(post) || '',
          cap_modality: '',
          cap_workload: '',
          cap_start_date: toYmd(post.date),
          cap_end_date: '',
          cap_signup_link: '',
          cap_status: 'Planejada',
          cap_is_featured: false,
        },
      }))
    );
  }
  
  return fetchAPI<Training[]>('capacitacoes?per_page=10&_embed=wp:featuredmedia')
    .then(trainings =>
      trainings.map(training => {
        const imageUrl = extractImageUrl(training.acf?.cap_feature_image) 
                        || extractFeaturedImageUrl(training);
        return {
          ...training,
          acf: training.acf ? {
            ...training.acf,
            cap_feature_image: imageUrl,
          } : training.acf,
        };
      })
    );
}

// Single-entity fetch helpers for detail pages
export function fetchNoticia(id: number | string) {
  if (isLegacyEnabled) {
    return fetchLegacyPostById(id).then((post) => ({
      id: post.id,
      date: post.date,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      link: post.link,
    }));
  }
  return fetchAPI<news>(`noticias/${id}?_fields=id,date,title,excerpt,content,acf,noticia_category`);
}

export function fetchProjeto(id: number | string) {
  if (isLegacyEnabled) {
    return fetchLegacyPostById(id).then((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      acf: {
        impacto: '',
        project_image: getFeaturedImageUrl(post) || undefined,
      },
    }));
  }
  
  return fetchAPI<Project>(`projetos/${id}?_embed=wp:featuredmedia`)
    .then(project => {
      const imageUrl = extractImageUrl(project.acf?.project_featured_image) 
                      || extractFeaturedImageUrl(project);
      return {
        ...project,
        content: project.content ? { ...project.content, rendered: cleanContent(project.content.rendered || '') } : undefined,
        acf: project.acf ? {
          ...project.acf,
          project_featured_image: imageUrl,
        } : undefined,
      };
    });
}

export function fetchEvento(id: number | string) {
  if (isLegacyEnabled) {
    return fetchLegacyPostById(id).then((post) => ({
      id: post.id,
      slug: '',
      title: post.title,
      content: post.content,
      acf: {
        event_summary: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || '',
        event_start_date: toYmd(post.date),
        event_end_date: '',
        event_location: '',
        event_registration_url: '',
        event_is_featured: false,
        event_featured_image: getFeaturedImageUrl(post) || undefined,
      },
    }));
  }
  
  return fetchAPI<Event>(`eventos/${id}?_embed=wp:featuredmedia`)
    .then(event => {
      const imageUrl = extractImageUrl(event.acf?.event_featured_image) 
                      || extractFeaturedImageUrl(event);
      
      // Gera event_summary se não existir
      let acfData = event.acf || {};
      if (!acfData.event_summary) {
        if (event.excerpt?.rendered) {
          const plainText = event.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
          if (plainText.length > 0) {
            acfData = {
              ...acfData,
              event_summary: plainText.substring(0, 200)
            };
          }
        } else if (event.content?.rendered) {
          const plainText = event.content.rendered.replace(/<[^>]*>/g, '').trim();
          if (plainText.length > 0) {
            acfData = {
              ...acfData,
              event_summary: plainText.substring(0, 150) + '...'
            };
          }
        }
        
        // Fallback final: usa o título se evento está completamente vazio
        if (!acfData.event_summary) {
          const titleText = event.title.rendered.replace(/<[^>]*>/g, '').trim();
          acfData = {
            ...acfData,
            event_summary: `Evento: ${titleText}`
          };
        }
      }
      
      return {
        ...event,
        content: event.content ? { ...event.content, rendered: cleanContent(event.content.rendered || '') } : undefined,
        acf: {
          ...acfData,
          event_featured_image: imageUrl,
        },
      };
    });
}

// ============================================================================
// DOCUMENTOS (CPT UNIFICADO)
// ============================================================================
// CPT: documento (unificado)
// Taxonomies: tipo_documento (hierarchical), ano_documento (tags)
// Filtragem feita por taxonomy query parameters
// ============================================================================

/**
 * Busca documentos filtrados por tipo (taxonomy tipo_documento)
 * Primeiro busca o ID do termo pelo slug, depois filtra por ID (WordPress REST exige ID numérico).
 * @param tipoSlug - Slug do tipo ('edital', 'prestacao-contas', 'documentos-institucionais', etc.)
 * @param perPage - Quantidade de resultados por página (padrão: 20)
 * @returns Array de documentos
 */
async function fetchDocumentosPorTipo(tipoSlug: string, perPage: number = 20): Promise<Documento[]> {
  if (isLegacyEnabled) {
    return Promise.resolve([]);
  }

  let tipoId = tipoDocumentoIdCache.get(tipoSlug);

  if (!tipoId) {
    type TipoDocumentoTerm = { id: number; slug: string };
    const terms = await fetchAPI<TipoDocumentoTerm[]>(
      `tipo_documento?slug=${encodeURIComponent(tipoSlug)}&_fields=id,slug&per_page=1`,
      { noCache: true }
    );

    if (!terms.length) {
      return [];
    }

    tipoId = terms[0].id;
    tipoDocumentoIdCache.set(tipoSlug, tipoId);
  }

  return fetchAPI<Documento[]>(
    `documentos?tipo_documento=${tipoId}&per_page=${perPage}&acf_format=standard&_embed=true&_fields=id,date,slug,title,content,tipo_documento,ano_documento,acf,_embedded`,
    { noCache: true }
  );
}

/**
 * Busca todos os documentos (sem filtro de tipo)
 * Usado na página Documents.tsx
 */
export function fetchDocumentos(perPage: number = 20) {
  if (isLegacyEnabled) {
    return Promise.resolve([]);
  }
  return fetchAPI<Documento[]>(
    `documentos?per_page=${perPage}&acf_format=standard&_embed=true&_fields=id,date,slug,title,content,tipo_documento,ano_documento,acf,_embedded`,
    { noCache: true }
  );
}

/**
 * Busca apenas editais (filtra por tipo_documento = 'edital')
 * Usado na página Edits.tsx
 */
export function fetchEditais(perPage: number = 20) {
  return fetchDocumentosPorTipo('edital', perPage);
}

/**
 * Busca apenas prestações de contas (filtra por tipo_documento = 'prestacao-contas')
 * Usado na página Accounts.tsx
 */
export function fetchPrestacaoContas(perPage: number = 20) {
  return fetchDocumentosPorTipo('prestacao-contas', perPage);
}

/**
 * Busca apenas documentos institucionais
 * Usado na página Documents.tsx
 */
export function fetchDocumentosInstitucionais(perPage: number = 20) {
  return fetchDocumentosPorTipo('documentos-institucionais', perPage);
}

/**
 * Busca documento individual por ID
 * @param id - ID do documento
 * @returns Documento completo
 */
export function fetchDocumento(id: number | string) {
  if (isLegacyEnabled) {
    return Promise.resolve(null);
  }
  return fetchAPI<Documento>(
    `documentos/${id}?acf_format=standard&_embed=true&_fields=id,date,slug,title,content,tipo_documento,ano_documento,acf,_embedded`,
    { noCache: true }
  );
}

// ============================================================================
// CATEGORIAS DE NOTÍCIAS (Taxonomy: noticia_category)
// ============================================================================

/**
 * Busca todas as categorias de notícias da Taxonomy
 * Usado em NewsList.tsx para popular o dropdown de filtros
 */
export async function fetchNoticiasCategories() {
  if (isLegacyEnabled) {
    // Legacy retorna vazio - categorias são hardcoded
    return Promise.resolve([]);
  }
  return fetchAPI<Array<{
    id: number;
    name: string;
    slug: string;
    count: number;
  }>>('noticia_category');
}  

