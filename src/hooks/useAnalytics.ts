/**
 * useAnalytics Hook
 * 
 * Facilita rastreamento de eventos no Google Analytics 4 via Google Tag Manager
 * 
 * Uso:
 * const { trackEvent } = useAnalytics();
 * trackEvent('contact_form_submit', { form_name: 'contact_formulario' });
 */

export interface AnalyticsEvent {
  [key: string]: string | number | boolean | undefined;
}

export function useAnalytics() {
  /**
   * Rastreia um evento customizado no GA4
   * @param eventName - Nome do evento (ex: 'contact_form_submit')
   * @param eventData - Dados adicionais (ex: { form_name: 'contact' })
   */
  const trackEvent = (eventName: string, eventData?: AnalyticsEvent) => {
    // Verificar se dataLayer existe (GTM está carregado)
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData,
        timestamp: new Date().toISOString(),
      });

      // Log em desenvolvimento
      if (import.meta.env.DEV) {
        console.log(`[Analytics] Event tracked: ${eventName}`, eventData);
      }
    } else {
      // GTM não foi carregado ainda (offline ou erro)
      if (import.meta.env.DEV) {
        console.warn(`[Analytics] dataLayer is not available. Event NOT tracked: ${eventName}`);
      }
    }
  };

  /**
   * Rastreia page view customizado
   * @param pageTitle - Título da página
   * @param pagePath - Caminho da página (ex: '/noticia/123')
   */
  const trackPageView = (pageTitle: string, pagePath?: string) => {
    trackEvent('page_view', {
      page_title: pageTitle,
      page_path: pagePath || window.location.pathname,
      page_location: window.location.href,
    });
  };

  /**
   * Rastreia clique em link externo
   * @param url - URL do link
   * @param linkText - Texto do link
   */
  const trackOutboundLink = (url: string, linkText?: string) => {
    trackEvent('outbound_link_click', {
      link_url: url,
      link_text: linkText,
    });
  };

  /**
   * Rastreia envio de formulário
   * @param formName - Nome do formulário
   * @param success - Se envio foi bem-sucedido
   * @param errorMessage - Mensagem de erro (se aplicável)
   */
  const trackFormSubmit = (
    formName: string,
    success: boolean,
    errorMessage?: string
  ) => {
    trackEvent('form_submit', {
      form_name: formName,
      success,
      error_message: errorMessage,
    });
  };

  /**
   * Rastreia erro no aplicativo
   * @param errorName - Nome do erro
   * @param errorMessage - Mensagem de erro
   * @param errorStack - Stack trace (opcional)
   */
  const trackError = (
    errorName: string,
    errorMessage: string,
    errorStack?: string
  ) => {
    trackEvent('app_error', {
      error_name: errorName,
      error_message: errorMessage,
      error_stack: errorStack?.substring(0, 200), // Limitar tamanho
    });
  };

  /**
   * Rastreia scroll depth (qual % da página foi scrollada)
   * @param percentScrolled - Percentual (ex: 50 para 50%)
   */
  const trackScrollDepth = (percentScrolled: number) => {
    trackEvent('scroll_depth', {
      scroll_percentage: percentScrolled,
    });
  };

  /**
   * Rastreia vídeo ou mídia
   * @param mediaTitle - Título da mídia
   * @param mediaType - Tipo (video, audio, etc)
   * @param action - Ação (play, pause, complete)
   */
  const trackMediaEvent = (
    mediaTitle: string,
    mediaType: string,
    action: 'play' | 'pause' | 'complete' | 'error'
  ) => {
    trackEvent(`media_${action}`, {
      media_title: mediaTitle,
      media_type: mediaType,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackOutboundLink,
    trackFormSubmit,
    trackError,
    trackScrollDepth,
    trackMediaEvent,
  };
}

// Declarar window.dataLayer para TypeScript
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
