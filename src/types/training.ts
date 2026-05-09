export interface Training {
  id: number;
  title?: {
    rendered: string;
  };
  acf?: {
    cap_subtitle?: string;
    cap_summary?: string;
    cap_feature_image?: string | number | { id: number; url: string };
    cap_modality?: string;
    cap_workload?: string;
    cap_start_date?: string;
    cap_end_date?: string;
    cap_signup_link?: string;
    cap_status?: string;
    cap_is_featured?: boolean;
  };
}
