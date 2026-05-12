import { supabase } from '@/services/supabase/client';
import type { MapData } from '@/types';

export async function fetchMaps() {
  const { data, error } = await supabase
    .from('maps')
    .select(`
      id,
      display_name,
      list_view_icon,
      display_icon,
      splash,
      is_competitive
    `)
    .order('display_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch maps: ${error.message}`);
  }

  return (data || []).map((map: any) => ({
    id: map.id,

    displayName: map.display_name,

    listViewIcon: map.list_view_icon,

    displayIcon: map.display_icon,

    splash: map.splash,

    isCompetitive: map.is_competitive,
  })) as MapData[];
}