export type Event = {
  id: number;
  slug: string;
  date?: string; // WordPress post date (ISO 8601)
  title: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  acf: {
    event_summary?: string;
    event_start_date?: string; // YYYYMMDD format
    event_end_date?: string;   // YYYYMMDD format
    event_location?: string;
    event_registration_url?: string;
    event_is_featured?: boolean;
    event_featured_image?: string; // URL
  };
};
