export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skillrush.com.br';
  return configured.replace(/\/+$/, '');
}
