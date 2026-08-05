"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type Projeto = {
  id: string;
  nome: string;
  status: 'ativo' | 'encerrado';
  data_inicio: string;
  data_fim: string | null;
};

type Documento = {
  id: string;
  tipo: string;
  drive_url: string;
  drive_id: string;
  ano: number | null;
  mes: number | null;
  nome_arquivo: string;
};

const MES_FULL: Record<string, string> = {
  "1": "Janeiro", "2": "Fevereiro", "3": "Março", "4": "Abril",
  "5": "Maio", "6": "Junho", "7": "Julho", "8": "Agosto",
  "9": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
};

type Props = {
  projeto: Projeto;
  onBack: () => void;
  onProjectUpdated: () => void;
};

function RenameModal({ nome, onConfirm, onCancel }: { nome: string; onConfirm: (n: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(nome);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-bold text-gray-900 mb-4">Renomear Documento</h3>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={() => onConfirm(value)} className="px-4 py-2 text-sm font-semibold bg-[#2B6B43] text-white rounded-lg hover:bg-[#205132]">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function DocItem({ doc, onDelete, onRename }: { doc: Documento; onDelete: (id: string) => void; onRename: (id: string, nome: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group hover:border-[#2B6B43]/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
        <span className="text-sm text-gray-800 font-medium truncate">{doc.nome_arquivo}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        <a
          href={doc.drive_url}
          target="_blank"
          rel="noreferrer"
          title="Visualizar"
          className="p-1.5 text-gray-400 hover:text-[#2B6B43] rounded-md hover:bg-[#E4F2E7] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <button
          onClick={() => onRename(doc.id, doc.nome_arquivo)}
          title="Renomear"
          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          title="Excluir"
          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProjectDetail({ projeto, onBack, onProjectUpdated }: Props) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  // Edição do projeto
  const [editingName, setEditingName] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState(projeto.nome);
  const [savingName, setSavingName] = useState(false);

  // Rename modal
  const [renameDoc, setRenameDoc] = useState<{ id: string; nome: string } | null>(null);

  // Upload inline
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTipo, setUploadTipo] = useState('circunstanciado');
  const [uploadAno, setUploadAno] = useState(new Date().getFullYear().toString());
  const [uploadMes, setUploadMes] = useState((new Date().getMonth() + 1).toString());
  const [uploadNome, setUploadNome] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('documentos').select('*').eq('id_projeto', projeto.id);
    if (data) setDocumentos(data);
    setLoading(false);
  }, [projeto.id]);

  useEffect(() => {
    fetchDocs();
    const handleUpload = () => fetchDocs();
    window.addEventListener('documentUploaded', handleUpload);
    return () => window.removeEventListener('documentUploaded', handleUpload);
  }, [fetchDocs]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadNome) { setUploadError('Preencha todos os campos.'); return; }
    setUploadLoading(true);
    setUploadError('');
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('id_projeto', projeto.id);
      formData.append('tipo', uploadTipo);
      formData.append('nome_arquivo', uploadNome);
      if (uploadTipo !== 'termo') {
        formData.append('ano', uploadAno);
        formData.append('mes', uploadMes);
      }
      formData.append('file', uploadFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload');
      setUploadSuccess(true);
      setUploadNome('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocs();
      setTimeout(() => { setUploadSuccess(false); setShowUpload(false); }, 2000);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Excluir este documento permanentemente do Google Drive e do banco?')) return;
    const token = await getToken();
    const res = await fetch(`/api/delete?id=${docId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchDocs();
    else alert('Erro ao excluir documento.');
  };

  const handleRename = async (docId: string, novoNome: string) => {
    const token = await getToken();
    await fetch('/api/documentos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: docId, nome_arquivo: novoNome })
    });
    setRenameDoc(null);
    fetchDocs();
  };

  const handleSaveName = async () => {
    if (!nomeProjeto.trim()) return;
    setSavingName(true);
    const token = await getToken();
    await fetch('/api/projetos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: projeto.id, nome: nomeProjeto })
    });
    setSavingName(false);
    setEditingName(false);
    onProjectUpdated();
  };

  const handleToggleStatus = async () => {
    const novoStatus = projeto.status === 'ativo' ? 'encerrado' : 'ativo';
    const dataFim = novoStatus === 'encerrado' ? new Date().toISOString().split('T')[0] : null;
    const token = await getToken();
    await fetch('/api/projetos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: projeto.id, status: novoStatus, data_fim: dataFim })
    });
    onProjectUpdated();
    onBack();
  };

  const termos = documentos.filter(d => d.tipo === 'termo');
  const circunstanciados = documentos.filter(d => d.tipo === 'circunstanciado');
  const financeiros = documentos.filter(d => d.tipo === 'financeiro');

  const groupByAnoMes = (docs: Documento[]) => {
    const map: Record<string, Record<string, Documento[]>> = {};
    docs.forEach(d => {
      const ano = d.ano?.toString() ?? 'Sem ano';
      const mes = d.mes?.toString() ?? 'Sem mês';
      if (!map[ano]) map[ano] = {};
      if (!map[ano][mes]) map[ano][mes] = [];
      map[ano][mes].push(d);
    });
    return map;
  };

  const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <span className="text-xs font-semibold text-gray-400">{count} arq.</span>
    </div>
  );

  const MESES = [
    { v: '1', l: 'Janeiro' }, { v: '2', l: 'Fevereiro' }, { v: '3', l: 'Março' }, { v: '4', l: 'Abril' },
    { v: '5', l: 'Maio' }, { v: '6', l: 'Junho' }, { v: '7', l: 'Julho' }, { v: '8', l: 'Agosto' },
    { v: '9', l: 'Setembro' }, { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' },
  ];

  return (
    <div className="space-y-6">
      {/* Rename Modal */}
      {renameDoc && (
        <RenameModal
          nome={renameDoc.nome}
          onConfirm={(novoNome) => handleRename(renameDoc.id, novoNome)}
          onCancel={() => setRenameDoc(null)}
        />
      )}

      {/* Breadcrumb / Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B6B43] hover:underline"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Todos os projetos
      </button>

      {/* Card do Projeto */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nomeProjeto}
                  onChange={e => setNomeProjeto(e.target.value)}
                  className="flex-1 text-xl font-bold border-b-2 border-[#2B6B43] outline-none bg-transparent pb-1"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={savingName} className="text-sm font-bold text-[#2B6B43] hover:underline disabled:opacity-50">
                  {savingName ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => { setEditingName(false); setNomeProjeto(projeto.nome); }} className="text-sm font-bold text-gray-400 hover:underline">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-bold text-gray-900">{projeto.nome}</h2>
                <button onClick={() => setEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#2B6B43] rounded">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400 mt-1">
              Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              {projeto.data_fim && ` · Fim: ${new Date(projeto.data_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              projeto.status === 'ativo' ? 'bg-[#E4F2E7] text-[#2B6B43]' : 'bg-gray-100 text-gray-500'
            }`}>
              {projeto.status === 'ativo' ? 'Ativo' : 'Encerrado'}
            </span>
            <button
              onClick={handleToggleStatus}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline"
            >
              Marcar como {projeto.status === 'ativo' ? 'Encerrado' : 'Ativo'}
            </button>
          </div>
        </div>
      </div>

      {/* Documentos */}
      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Carregando documentos...</div>
      ) : (
        <div className="space-y-6">

          {/* Botão + Upload inline */}
          <div className="flex justify-end">
            <button
              onClick={() => { setShowUpload(!showUpload); setUploadError(''); setUploadSuccess(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2B6B43] text-white text-sm font-semibold rounded-lg hover:bg-[#205132] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showUpload ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
              </svg>
              {showUpload ? 'Cancelar' : 'Adicionar Documento'}
            </button>
          </div>

          {/* Formulário de Upload Inline */}
          {showUpload && (
            <div className="bg-[#f0f7f3] border border-[#2B6B43]/20 rounded-xl p-6">
              <h3 className="text-sm font-bold text-[#2B6B43] mb-4">Novo documento em: <span className="font-normal">{projeto.nome}</span></h3>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Tipo de Documento</label>
                  <select value={uploadTipo} onChange={e => setUploadTipo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm">
                    <option value="termo">Termo de Colaboração / Plano de Trabalho</option>
                    <option value="circunstanciado">Relatório Circunstanciado</option>
                    <option value="financeiro">Relatório Financeiro</option>
                  </select>
                </div>
                {uploadTipo !== 'termo' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Ano</label>
                      <input type="number" value={uploadAno} onChange={e => setUploadAno(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Mês</label>
                      <select value={uploadMes} onChange={e => setUploadMes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm">
                        {MESES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Nome de Exibição</label>
                  <input required value={uploadNome} onChange={e => setUploadNome(e.target.value)}
                    placeholder="Ex: Nota Fiscal nº 123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B6B43] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Arquivo PDF</label>
                  <input required type="file" accept="application/pdf" ref={fileInputRef}
                    onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E4F2E7] file:text-[#2B6B43] hover:file:bg-[#d1e8d6] file:cursor-pointer" />
                </div>
                {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
                {uploadSuccess && <p className="text-green-600 text-sm font-semibold">✓ Documento enviado com sucesso!</p>}
                <button type="submit" disabled={uploadLoading}
                  className="w-full py-2.5 bg-[#2B6B43] text-white font-semibold rounded-lg hover:bg-[#205132] transition-colors disabled:opacity-70 flex justify-center">
                  {uploadLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Fazer Upload'}
                </button>
              </form>
            </div>
          )}

          {/* Termos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader title="Termos de Colaboração e Planos de Trabalho" count={termos.length} />
            {termos.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum arquivo nesta seção.</p>
            ) : (
              <div className="space-y-2">
                {termos.map(doc => (
                  <DocItem
                    key={doc.id}
                    doc={doc}
                    onDelete={handleDelete}
                    onRename={(id, nome) => setRenameDoc({ id, nome })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Circunstanciados */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader title="Relatórios Circunstanciados" count={circunstanciados.length} />
            {circunstanciados.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum arquivo nesta seção.</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(groupByAnoMes(circunstanciados))
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([ano, meses]) => (
                    <div key={ano}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{ano}</p>
                      <div className="space-y-4 pl-4 border-l-2 border-gray-100">
                        {Object.entries(meses)
                          .sort(([a], [b]) => parseInt(b) - parseInt(a))
                          .map(([mes, docs]) => (
                            <div key={mes}>
                              <p className="text-sm font-semibold text-gray-600 mb-2">{MES_FULL[mes] ?? mes}</p>
                              <div className="space-y-2">
                                {docs.map(doc => (
                                  <DocItem
                                    key={doc.id}
                                    doc={doc}
                                    onDelete={handleDelete}
                                    onRename={(id, nome) => setRenameDoc({ id, nome })}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Financeiros */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader title="Relatórios Financeiros" count={financeiros.length} />
            {financeiros.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum arquivo nesta seção.</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(groupByAnoMes(financeiros))
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([ano, meses]) => (
                    <div key={ano}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{ano}</p>
                      <div className="space-y-4 pl-4 border-l-2 border-gray-100">
                        {Object.entries(meses)
                          .sort(([a], [b]) => parseInt(b) - parseInt(a))
                          .map(([mes, docs]) => (
                            <div key={mes}>
                              <p className="text-sm font-semibold text-gray-600 mb-2">{MES_FULL[mes] ?? mes}</p>
                              <div className="space-y-2">
                                {docs.map(doc => (
                                  <DocItem
                                    key={doc.id}
                                    doc={doc}
                                    onDelete={handleDelete}
                                    onRename={(id, nome) => setRenameDoc({ id, nome })}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
