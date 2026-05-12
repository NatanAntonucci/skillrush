import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CreateLineupPayload {
  title: string;
  agentId: string;
  mapId: string;
  abilityId: string;
  abilityName: string;
  description: string;
  videoUrl: string;
  difficulty?: string;
  side?: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Obtém o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Cria cliente Supabase com o token do usuário para verificar autenticação
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not configured');
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Verifica o usuário com o token
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const payload: CreateLineupPayload = await request.json();

    // Valida os campos obrigatórios
    if (!payload.title || !payload.agentId || !payload.mapId || !payload.abilityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Cria cliente Supabase Admin para inserção
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Cria a lineup usando o supabaseAdmin (server-side)
    const { data, error } = await supabaseAdmin
      .from('lineups')
      .insert([
        {
          title: payload.title,
          agent_id: payload.agentId,
          map_id: payload.mapId,
          ability_id: payload.abilityId,
          ability_name: payload.abilityName,
          description: payload.description,
          video_url: payload.videoUrl,
          difficulty: payload.difficulty,
          side: payload.side,
          hotspot_x: payload.hotspot.x,
          hotspot_y: payload.hotspot.y,
          hotspot_label: payload.hotspot.label,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to create lineup: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
