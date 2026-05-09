/**
 * Componente de loader padronizado para todas as páginas
 * Usa 3 pontos animados (padrão Atividades e Notícias)
 */
export default function PageLoader({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 text-primary mb-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-pulse" 
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-pulse" 
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
        <p className="text-sm font-medium text-neutral-600">{message}</p>
      </div>
    </div>
  );
}
