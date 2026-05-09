// import { useEffect, useState } from 'react';
// import { AlertCircle, RotateCw } from 'lucide-react';
// import { fetchParceiros } from '../services/api';
// import type { Partner } from '../types/partners';

// ====================================================================
// VERSÃO HARDCODED PARA DEMONSTRAÇÃO (Modo Legado)
// ====================================================================
// CPT "Parceiros" não existe no site antigo WordPress.
// Esta versão usa dados estáticos para visualização.
// Descomente a versão original quando o CPT estiver disponível ou quando não estiver mais em modo legado.
// ====================================================================

type HardcodedPartner = {
  id: number;
  name: string;
  logo: string;
  website?: string;
};

// logos em assets/images/
const HARDCODED_PARTNERS: HardcodedPartner[] = [
  { id: 1, name: 'Parceiro 1', logo: 'egestor.png', website: 'https://www.ugestor.com.br/' },
  { id: 2, name: 'Parceiro 2', logo: 'brasimpex.png' },
  { id: 3, name: 'Parceiro 3', logo: 'bonamix.png', website: 'https://bonamixatacarejo.com.br/' },
  { id: 4, name: 'Parceiro 4', logo: 'hospitalsantamaria.png', website: 'https://www.hospitalsantamarta.com.br/' },
  { id: 5, name: 'Parceiro 5', logo: 'instituidor.png' },
  { id: 6, name: 'Parceiro 6', logo: 'sasbio.png', website: 'https://www.sasbio.com.br/' },
];

export default function Partners() {
  // Duplica os parceiros para criar efeito de loop infinito
  const allPartners = [...HARDCODED_PARTNERS, ...HARDCODED_PARTNERS];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Parceiros e Apoiadores
          </h2>
          <p className="text-neutral-600">
            Instituições que acreditam no nosso propósito
          </p>
        </div>

        {/* Container com overflow hidden para o carousel */}
        <div className="relative overflow-x-hidden overflow-y-visible">
          {/* Wrapper animado que desliza para a esquerda */}
          <div className="flex gap-16 animate-scroll-left py-6">
            {allPartners.map((partner, index) => {
              const imageSrc = `/images/${partner.logo}`;
              
              const logoImage = (
                <img
                  src={imageSrc}
                  alt={partner.name}
                  className="h-20 md:h-24 w-auto object-contain transition-all duration-300 hover:scale-110"
                  width="150"
                  height="80"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    console.error(`Erro ao carregar logo: ${imageSrc}`);
                    e.currentTarget.src = 'https://via.placeholder.com/150x60?text=Logo';
                  }}
                />
              );

              return (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center min-w-[200px] py-2"
                >
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      aria-label={`Visitar site de ${partner.name}`}
                    >
                      {logoImage}
                    </a>
                  ) : (
                    logoImage
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ====================================================================
// CÓDIGO ORIGINAL - Versão com CPT/ACF
// ====================================================================
// Descomente este código quando o CPT de Parceiros estiver disponível
// no WordPress ou quando não estiver em modo legado.
// ====================================================================

/*
export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchParceiros();
      setPartners(data);
    } catch (err) {
      console.error('Erro ao carregar parceiros', err);
      setError('Não conseguimos carregar os parceiros no momento. Tente novamente mais tarde.');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 flex items-center gap-4 max-w-md mx-auto">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Erro ao carregar parceiros</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={loadPartners}
                aria-label="Recarregar parceiros"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-white"
              >
                <RotateCw size={16} />
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  const extractLogoUrl = (logoValue: unknown): string => {
    if (!logoValue) return '';

    if (typeof logoValue === 'string') return logoValue;

    if (typeof logoValue === 'object' && logoValue !== null) {
      const obj = logoValue as Record<string, unknown>;
      if (typeof obj.url === 'string') return obj.url;
    }

    return '';
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Parceiros e Apoiadores
          </h2>
          <p className="text-neutral-600">
            Instituições que acreditam no nosso propósito
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 items-center">
          {partners.map((partner) => {
            const name =
              partner.acf?.partner_name ||
              partner.title?.rendered ||
              '';

            const logoUrl = extractLogoUrl(partner.acf?.partner_logo);
            const link = partner.acf?.partner_website;

            if (!logoUrl) return null;

            const image = (
              <img
                src={logoUrl}
                alt={name}
                className="
                  max-w-full
                  h-20
                  md:h-24
                  object-contain
                  opacity-90
                  transition-all
                  hover:opacity-100
                "
                width="150"
                height="80"
                onError={(e) => {
                  console.error('Erro ao carregar logo:', logoUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            );

            return (
              <div
                key={partner.id}
                className="
                  bg-white
                  rounded-xl
                  px-6
                  py-5
                  flex
                  items-center
                  justify-center
                  shadow-sm
                  hover:shadow-md
                  hover:-translate-y-1
                  transition-all
                  duration-200
                "
              >
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full h-full"
                  >
                    {image}
                  </a>
                ) : (
                  image
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
*/
