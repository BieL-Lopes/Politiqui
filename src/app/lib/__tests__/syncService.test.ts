/**
 * Testes dos mappers toRow / fromRow do syncService.
 *
 * As funções são internas ao módulo, portanto re-implementamos a lógica
 * aqui para isolar os testes de dependências externas (Supabase, Dexie).
 * Isso também serve como documentação do contrato de mapeamento.
 */
import { describe, it, expect } from 'vitest';
import type { ElectorData } from '../../components/CaptureForm';

// ─── Re-implementação inline dos mappers para teste isolado ───────────────────
// (espelha exatamente a lógica de src/app/lib/syncService.ts)

function toRow(e: ElectorData): Record<string, unknown> {
  return {
    id: e.id,
    nome: e.nome,
    whatsapp: e.whatsapp,
    email: e.email ?? null,
    titulo_eleitor: e.tituloEleitor,
    data_nascimento: e.dataNascimento,
    bairro: e.bairro,
    cidade: e.cidade,
    nivel_voto: e.nivelVoto,
    nivel_engajamento: e.nivelEngajamento,
    nichos: e.nichos,
    gps_latitude: e.gpsLatitude ?? null,
    gps_longitude: e.gpsLongitude ?? null,
    aceita_whatsapp: e.aceitaWhatsapp,
    observacoes: e.observacoes,
    regiao: e.regiao ?? null,
    atendimentos: e.atendimentos,
    criado_por_nome: e.createdByName ?? null,
    data_cadastro: e.dataCadastro,
  };
}

function fromRow(row: Record<string, unknown>): ElectorData {
  return {
    id: row.id as string,
    nome: row.nome as string,
    whatsapp: (row.whatsapp as string) ?? '',
    email: (row.email as string) ?? '',
    tituloEleitor: (row.titulo_eleitor as string) ?? '',
    dataNascimento: (row.data_nascimento as string) ?? '',
    bairro: (row.bairro as string) ?? '',
    cidade: (row.cidade as string) ?? '',
    nivelVoto: (row.nivel_voto as ElectorData['nivelVoto']) ?? 'medio',
    nivelEngajamento: (row.nivel_engajamento as ElectorData['nivelEngajamento']) ?? 'eleitor_comum',
    nichos: (row.nichos as string[]) ?? [],
    gpsLatitude: row.gps_latitude as number | undefined,
    gpsLongitude: row.gps_longitude as number | undefined,
    aceitaWhatsapp: (row.aceita_whatsapp as boolean) ?? true,
    observacoes: (row.observacoes as string) ?? '',
    dataCadastro: row.data_cadastro as string,
    atendimentos: (row.atendimentos as ElectorData['atendimentos']) ?? [],
    createdBy: (row.criado_por as string) ?? '',
    createdByName: (row.criado_por_nome as string) ?? '',
    regiao: row.regiao as string | undefined,
    updatedAt: row.atualizado_em as string | undefined,
  };
}

// ─── Fixture ──────────────────────────────────────────────────────────────────

const SAMPLE_ELECTOR: ElectorData = {
  id: 'abc-123',
  nome: 'Maria Silva',
  whatsapp: '11999991234',
  email: 'maria@exemplo.com',
  tituloEleitor: '123456789012',
  dataNascimento: '1990-05-15',
  bairro: 'Centro',
  cidade: 'São Paulo',
  nivelVoto: 'forte',
  nivelEngajamento: 'cabo_eleitoral',
  nichos: ['Saúde', 'Educação'],
  gpsLatitude: -23.5505,
  gpsLongitude: -46.6333,
  aceitaWhatsapp: true,
  observacoes: 'Atende pela manhã',
  dataCadastro: '2024-01-15T10:00:00.000Z',
  atendimentos: [],
  createdBy: 'user-uuid-001',
  createdByName: 'Rafael Captador',
  regiao: 'Zona Sul',
};

// ─── toRow ────────────────────────────────────────────────────────────────────

describe('toRow — camelCase → snake_case', () => {
  const row = toRow(SAMPLE_ELECTOR);

  it('mapeia campos básicos corretamente', () => {
    expect(row.id).toBe('abc-123');
    expect(row.nome).toBe('Maria Silva');
    expect(row.whatsapp).toBe('11999991234');
    expect(row.email).toBe('maria@exemplo.com');
  });

  it('converte nomes compostos para snake_case', () => {
    expect(row.titulo_eleitor).toBe('123456789012');
    expect(row.data_nascimento).toBe('1990-05-15');
    expect(row.nivel_voto).toBe('forte');
    expect(row.nivel_engajamento).toBe('cabo_eleitoral');
    expect(row.criado_por_nome).toBe('Rafael Captador');
    expect(row.data_cadastro).toBe('2024-01-15T10:00:00.000Z');
  });

  it('preserva coordenadas GPS', () => {
    expect(row.gps_latitude).toBe(-23.5505);
    expect(row.gps_longitude).toBe(-46.6333);
  });

  it('preserva array de nichos', () => {
    expect(row.nichos).toEqual(['Saúde', 'Educação']);
  });

  it('email undefined vira null', () => {
    const semEmail: ElectorData = { ...SAMPLE_ELECTOR, email: undefined };
    expect(toRow(semEmail).email).toBeNull();
  });

  it('GPS undefined vira null', () => {
    const semGps: ElectorData = { ...SAMPLE_ELECTOR, gpsLatitude: undefined, gpsLongitude: undefined };
    expect(toRow(semGps).gps_latitude).toBeNull();
    expect(toRow(semGps).gps_longitude).toBeNull();
  });

  it('regiao undefined vira null', () => {
    const semRegiao: ElectorData = { ...SAMPLE_ELECTOR, regiao: undefined };
    expect(toRow(semRegiao).regiao).toBeNull();
  });
});

// ─── fromRow ──────────────────────────────────────────────────────────────────

describe('fromRow — snake_case → camelCase', () => {
  const row: Record<string, unknown> = {
    id: 'xyz-789',
    nome: 'João Oliveira',
    whatsapp: '21988887777',
    email: 'joao@exemplo.com',
    titulo_eleitor: '987654321098',
    data_nascimento: '1985-12-01',
    bairro: 'Lapa',
    cidade: 'Rio de Janeiro',
    nivel_voto: 'medio',
    nivel_engajamento: 'eleitor_comum',
    nichos: ['Esporte'],
    gps_latitude: -22.9068,
    gps_longitude: -43.1729,
    aceita_whatsapp: false,
    observacoes: '',
    data_cadastro: '2024-03-10T08:00:00.000Z',
    atendimentos: [],
    criado_por: 'user-uuid-002',
    criado_por_nome: 'Ana Coord',
    regiao: 'Norte',
    atualizado_em: '2024-03-11T09:00:00.000Z',
  };

  const elector = fromRow(row);

  it('mapeia campos básicos corretamente', () => {
    expect(elector.id).toBe('xyz-789');
    expect(elector.nome).toBe('João Oliveira');
    expect(elector.email).toBe('joao@exemplo.com');
  });

  it('converte snake_case para camelCase', () => {
    expect(elector.tituloEleitor).toBe('987654321098');
    expect(elector.dataNascimento).toBe('1985-12-01');
    expect(elector.nivelVoto).toBe('medio');
    expect(elector.nivelEngajamento).toBe('eleitor_comum');
    expect(elector.createdByName).toBe('Ana Coord');
    expect(elector.dataCadastro).toBe('2024-03-10T08:00:00.000Z');
  });

  it('preserva GPS e aceite de WhatsApp', () => {
    expect(elector.gpsLatitude).toBe(-22.9068);
    expect(elector.gpsLongitude).toBe(-43.1729);
    expect(elector.aceitaWhatsapp).toBe(false);
  });

  it('preserva updatedAt', () => {
    expect(elector.updatedAt).toBe('2024-03-11T09:00:00.000Z');
  });

  it('nichos null/ausente vira array vazio', () => {
    expect(fromRow({ ...row, nichos: null }).nichos).toEqual([]);
  });

  it('atendimentos null/ausente vira array vazio', () => {
    expect(fromRow({ ...row, atendimentos: null }).atendimentos).toEqual([]);
  });

  it('nivel_voto ausente usa "medio" como fallback', () => {
    const { nivel_voto: _, ...semNivel } = row;
    expect(fromRow(semNivel).nivelVoto).toBe('medio');
  });
});

// ─── Round-trip ───────────────────────────────────────────────────────────────

describe('round-trip toRow → fromRow', () => {
  it('preserva dados essenciais no ciclo de serialização', () => {
    const row = toRow(SAMPLE_ELECTOR);
    // Simula o que o Supabase devolveria (adiciona criado_por manualmente)
    const rowWithExtra = { ...row, criado_por: SAMPLE_ELECTOR.createdBy };
    const recovered = fromRow(rowWithExtra);

    expect(recovered.id).toBe(SAMPLE_ELECTOR.id);
    expect(recovered.nome).toBe(SAMPLE_ELECTOR.nome);
    expect(recovered.whatsapp).toBe(SAMPLE_ELECTOR.whatsapp);
    expect(recovered.email).toBe(SAMPLE_ELECTOR.email);
    expect(recovered.nivelVoto).toBe(SAMPLE_ELECTOR.nivelVoto);
    expect(recovered.nichos).toEqual(SAMPLE_ELECTOR.nichos);
    expect(recovered.gpsLatitude).toBe(SAMPLE_ELECTOR.gpsLatitude);
    expect(recovered.regiao).toBe(SAMPLE_ELECTOR.regiao);
  });
});
