-- =============================================
-- Schema Politiqui para Supabase
-- Execute no SQL Editor do dashboard do Supabase
-- =============================================

-- ─────────────────────────────────────────────
-- Função: busca email pelo CPF (sem autenticação)
-- Permite login por CPF sem expor dados via RLS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_email_by_cpf(cpf_input TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result_email TEXT;
BEGIN
  SELECT u.email INTO result_email
  FROM public.perfis p
  JOIN auth.users u ON u.id = p.id
  WHERE p.cpf = regexp_replace(cpf_input, '\D', '', 'g')
  LIMIT 1;
  RETURN result_email;
END;
$$;

-- ─────────────────────────────────────────────
-- Tabela de perfis (extensão de auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.perfis (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                     TEXT NOT NULL,
  email                    TEXT,
  cpf                      TEXT UNIQUE,
  role                     TEXT NOT NULL DEFAULT 'eleitor'
    CONSTRAINT perfis_role_check
      CHECK (role IN ('lideranca', 'coordenador_geral', 'coordenador_regional', 'captador_votos', 'eleitor')),
  regiao                   TEXT,
  deputado_id              TEXT,
  coordenador_regional_id  UUID REFERENCES public.perfis(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Tabela de eleitores
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.eleitores (
  id                 TEXT PRIMARY KEY,
  nome               TEXT NOT NULL,
  whatsapp           TEXT,
  email              TEXT,
  titulo_eleitor     TEXT,
  data_nascimento    TEXT,
  bairro             TEXT,
  cidade             TEXT,
  nivel_voto         TEXT CONSTRAINT eleitores_nivel_voto_check
    CHECK (nivel_voto IN ('forte', 'medio', 'fraco')),
  nivel_engajamento  TEXT CONSTRAINT eleitores_nivel_engajamento_check
    CHECK (nivel_engajamento IN ('lideranca', 'cabo_eleitoral', 'eleitor_comum')),
  nichos             TEXT[]   NOT NULL DEFAULT '{}',
  gps_latitude       DOUBLE PRECISION,
  gps_longitude      DOUBLE PRECISION,
  aceita_whatsapp    BOOLEAN  NOT NULL DEFAULT TRUE,
  observacoes        TEXT     NOT NULL DEFAULT '',
  regiao             TEXT,
  atendimentos       JSONB    NOT NULL DEFAULT '[]',
  criado_por         UUID REFERENCES auth.users(id),
  criado_por_nome    TEXT,
  data_cadastro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS eleitores_criado_por   ON public.eleitores (criado_por);
CREATE INDEX IF NOT EXISTS eleitores_atualizado_em ON public.eleitores (atualizado_em);
CREATE INDEX IF NOT EXISTS eleitores_regiao        ON public.eleitores (regiao);

-- ─────────────────────────────────────────────
-- Trigger: atualiza atualizado_em automaticamente
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_eleitores_atualizado_em ON public.eleitores;
CREATE TRIGGER trigger_eleitores_atualizado_em
  BEFORE UPDATE ON public.eleitores
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ─────────────────────────────────────────────
-- Trigger: cria perfil automaticamente no sign-up
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'eleitor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────────

-- Funções auxiliares SECURITY DEFINER — bypassam RLS para checar role
-- sem causar recursão infinita nas policies
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.perfis WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_coord_regional_of(captador_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = captador_id AND coordenador_regional_id = auth.uid()
  );
$$;

ALTER TABLE public.perfis    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleitores ENABLE ROW LEVEL SECURITY;

-- ── Políticas de perfis ──
DROP POLICY IF EXISTS "perfis_select_proprio"      ON public.perfis;
DROP POLICY IF EXISTS "perfis_update_proprio"      ON public.perfis;
DROP POLICY IF EXISTS "perfis_insert_proprio"      ON public.perfis;
DROP POLICY IF EXISTS "perfis_select_gestores"     ON public.perfis;
DROP POLICY IF EXISTS "perfis_select_equipe_coord" ON public.perfis;

CREATE POLICY "perfis_select_proprio"  ON public.perfis FOR SELECT USING (auth.uid() = id);
CREATE POLICY "perfis_update_proprio"  ON public.perfis FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "perfis_insert_proprio"  ON public.perfis FOR INSERT WITH CHECK (auth.uid() = id);

-- Usa get_my_role() para evitar recursão
CREATE POLICY "perfis_select_gestores" ON public.perfis FOR SELECT USING (
  get_my_role() IN ('lideranca', 'coordenador_geral')
);

CREATE POLICY "perfis_select_equipe_coord" ON public.perfis FOR SELECT USING (
  coordenador_regional_id = auth.uid()
);

-- ── Políticas de eleitores ──
DROP POLICY IF EXISTS "eleitores_select_proprio"        ON public.eleitores;
DROP POLICY IF EXISTS "eleitores_select_gestores"       ON public.eleitores;
DROP POLICY IF EXISTS "eleitores_select_coord_regional" ON public.eleitores;
DROP POLICY IF EXISTS "eleitores_insert"                ON public.eleitores;
DROP POLICY IF EXISTS "eleitores_update"                ON public.eleitores;
DROP POLICY IF EXISTS "eleitores_delete"                ON public.eleitores;

CREATE POLICY "eleitores_select_proprio" ON public.eleitores FOR SELECT USING (
  criado_por = auth.uid()
);

-- Usa get_my_role() para evitar recursão via perfis
CREATE POLICY "eleitores_select_gestores" ON public.eleitores FOR SELECT USING (
  get_my_role() IN ('lideranca', 'coordenador_geral')
);

-- Usa is_coord_regional_of() para evitar recursão via perfis
CREATE POLICY "eleitores_select_coord_regional" ON public.eleitores FOR SELECT USING (
  is_coord_regional_of(criado_por)
);

CREATE POLICY "eleitores_insert" ON public.eleitores FOR INSERT WITH CHECK (
  criado_por = auth.uid()
);

CREATE POLICY "eleitores_update" ON public.eleitores FOR UPDATE USING (
  criado_por = auth.uid()
  OR get_my_role() IN ('lideranca', 'coordenador_geral', 'coordenador_regional')
);

CREATE POLICY "eleitores_delete" ON public.eleitores FOR DELETE USING (
  criado_por = auth.uid()
  OR get_my_role() IN ('lideranca', 'coordenador_geral')
);


