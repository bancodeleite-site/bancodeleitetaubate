"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Projeto = {
  id: string;
  nome: string;
  status: 'ativo' | 'encerrado';
  data_inicio: string;
  data_fim: string | null;
};

type Props = {
  projetos: Projeto[];
  onUpdate: () => void;
  onSelectProject: (projeto: Projeto) => void;
};

export default function ProjectManager({ projetos, onUpdate, onSelectProject }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState<'ativo' | 'encerrado'>('ativo');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({
        nome,
        status,
        data_inicio: dataInicio,
        data_fim: status === 'encerrado' && dataFim ? dataFim : null
      })
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error || 'Erro ao criar projeto');
    } else {
      setNome('');
      setStatus('ativo');
      setDataInicio('');
      setDataFim('');
      setShowForm(false);
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projetos</h2>
          <p className="text-sm text-gray-500 mt-0.5">Clique em um projeto para ver e gerenciar seus documentos.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2B6B43] text-white text-sm font-semibold rounded-lg hover:bg-[#205132] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Projeto
        </button>
      </div>

      {/* Formulário de Criação (expansível) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-[#2B6B43]/20 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">Criar Novo Projeto</h3>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Nome do Projeto</label>
              <input
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm"
                placeholder="Ex: Visita Domiciliar 2025..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Data de Início</label>
              <input
                required
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'ativo' | 'encerrado')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none bg-white text-sm"
              >
                <option value="ativo">Ativo</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            {status === 'encerrado' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Data de Fim</label>
                <input
                  required
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#2B6B43] text-white text-sm font-semibold rounded-lg hover:bg-[#205132] transition-colors disabled:opacity-70"
              >
                {loading ? 'Salvando...' : 'Criar Projeto'}
              </button>
            </div>
          </form>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      )}

      {/* Lista de Projetos como Cards */}
      {projetos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 font-medium">Nenhum projeto cadastrado</p>
          <p className="text-sm text-gray-400 mt-1">Clique em "Novo Projeto" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projetos.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="group text-left bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#2B6B43] hover:shadow-md transition-all duration-200 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#2B6B43] transition-colors">
                  {p.nome}
                </h3>
                <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'ativo'
                    ? 'bg-[#E4F2E7] text-[#2B6B43]'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.status === 'ativo' ? 'Ativo' : 'Encerrado'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Início: {new Date(p.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                {p.data_fim && ` · Fim: ${new Date(p.data_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#2B6B43] opacity-0 group-hover:opacity-100 transition-opacity mt-auto pt-1 border-t border-gray-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Abrir projeto
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
