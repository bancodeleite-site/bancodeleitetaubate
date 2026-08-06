"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type Projeto = {
  id: string;
  nome: string;
  status: 'ativo' | 'encerrado';
};

export default function UploadForm({ projetos, selectedProjetoId: initialProjetoId, onProjetoChange, onUploadSuccess }: { 
  projetos: Projeto[], 
  selectedProjetoId: string | null,
  onProjetoChange: (id: string) => void,
  onUploadSuccess: () => void 
}) {
  const [tipo, setTipo] = useState('circunstanciado');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [mes, setMes] = useState((new Date().getMonth() + 1).toString());
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [projetoId, setProjetoId] = useState<string>(initialProjetoId ?? projetos[0]?.id ?? '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!projetoId || !file || !nomeArquivo) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      // Pega o token da sessão atual para mandar pro backend
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("Sessão inválida");

      const formData = new FormData();
      formData.append('id_projeto', projetoId);
      formData.append('tipo', tipo);
      formData.append('nome_arquivo', nomeArquivo);
      if (tipo !== 'termo') {
        formData.append('ano', ano);
        formData.append('mes', mes);
      }
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro no upload');

      setSuccess(true);
      setNomeArquivo('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
      
      // Remove a mensagem de sucesso depois de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Projeto</label>
        <select 
          value={projetoId} 
          onChange={e => setProjetoId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] bg-white outline-none"
        >
          {projetos.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Documento</label>
        <select 
          value={tipo} 
          onChange={e => setTipo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] bg-white outline-none"
        >
          <option value="termo">Termo de Colaboração / Plano de Trabalho</option>
          <option value="circunstanciado">Relatório Circunstanciado (Mensal)</option>
          <option value="financeiro">Relatório Financeiro (Mensal)</option>
        </select>
      </div>

      {tipo !== 'termo' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
            <input 
              type="number" 
              value={ano} 
              onChange={e => setAno(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mês</label>
            <select 
              value={mes} 
              onChange={e => setMes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] bg-white outline-none"
            >
              {[
                { v: '1', l: 'Janeiro' }, { v: '2', l: 'Fevereiro' }, { v: '3', l: 'Março' }, { v: '4', l: 'Abril' },
                { v: '5', l: 'Maio' }, { v: '6', l: 'Junho' }, { v: '7', l: 'Julho' }, { v: '8', l: 'Agosto' },
                { v: '9', l: 'Setembro' }, { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' },
              ].map(m => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome de Exibição do Arquivo</label>
        <input 
          required
          value={nomeArquivo} 
          onChange={e => setNomeArquivo(e.target.value)}
          placeholder="Ex: Nota Fiscal nº 123"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">Este é o nome que aparecerá para o visitante do site.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Arquivo PDF</label>
        <input 
          required
          type="file" 
          accept="application/pdf"
          ref={fileInputRef}
          onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-[#d1e8d6] file:cursor-pointer"
        />
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">Upload realizado com sucesso!</div>}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full mt-4 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 flex justify-center"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "Fazer Upload"
        )}
      </button>
    </form>
  );
}
