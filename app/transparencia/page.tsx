"use client";

import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './components/LoginModal';

type Projeto = {
  id: string;
  nome: string;
  status: 'ativo' | 'encerrado';
  data_inicio: string;
  data_fim: string | null;
  anos: number[]; // Anos calculados
};

type Documento = {
  id: string;
  tipo: string;
  drive_url: string;
  ano: number | null;
  mes: number | null;
  nome_arquivo: string;
};

const MES_ABREV: Record<string, string> = { 
  "1":"Jan", "2":"Fev", "3":"Mar", "4":"Abr", "5":"Mai", "6":"Jun", 
  "7":"Jul", "8":"Ago", "9":"Set", "10":"Out", "11":"Nov", "12":"Dez" 
};
const MES_FULL: Record<string, string> = { 
  "1":"Janeiro", "2":"Fevereiro", "3":"Março", "4":"Abril", "5":"Maio", "6":"Junho", 
  "7":"Julho", "8":"Agosto", "9":"Setembro", "10":"Outubro", "11":"Novembro", "12":"Dezembro" 
};

type PathSegment = { type: string, value: string, label: string };

export default function TransparenciaPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [documentosProjeto, setDocumentosProjeto] = useState<Documento[]>([]);
  const [path, setPath] = useState<PathSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('projetos').select('*');
      if (data) {
        const pComAnos = data.map(p => {
          const anoInicio = parseInt(p.data_inicio.substring(0, 4));
          const anoFim = p.data_fim ? parseInt(p.data_fim.substring(0, 4)) : new Date().getFullYear();
          const anos = [];
          for (let i = anoInicio; i <= anoFim; i++) {
            anos.push(i);
          }
          return { ...p, anos };
        });
        setProjetos(pComAnos);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const loadDocumentos = async (projetoId: string) => {
    setLoadingDocs(true);
    const { data } = await supabase.from('documentos').select('*').eq('id_projeto', projetoId);
    if (data) setDocumentosProjeto(data);
    setLoadingDocs(false);
  };

  const go = (segment: PathSegment) => {
    if (segment.type === 'projeto') {
      const p = projetos.find(x => x.nome === segment.value);
      if (p) loadDocumentos(p.id);
    }
    setPath([...path, segment]);
  };

  const goTo = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

  const anosDisponiveis = Array.from(new Set(projetos.flatMap(p => p.anos))).sort((a, b) => b - a);

  const getProjetosDoAnoEStatus = (ano: number, status: string) => {
    return projetos.filter(p => p.status === status && p.anos.includes(ano));
  };

  const Chevron = () => (
    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const renderContent = () => {
    if (loading) return <div className="text-gray-500 text-center py-12">Carregando dados...</div>;

    // Nível 0: Ano
    if (path.length === 0) {
      if (anosDisponiveis.length === 0) return <div className="text-center text-gray-500 py-10">Nenhum projeto cadastrado ainda.</div>;
      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Selecione o ano</div>
          {anosDisponiveis.map(ano => (
            <button key={ano} onClick={() => go({type:'ano', value:ano.toString(), label:ano.toString()})}
              className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left font-semibold text-gray-900">
              {ano}
              <Chevron />
            </button>
          ))}
        </div>
      );
    }

    // Nível 1: Status
    if (path.length === 1) {
      const ano = parseInt(path[0].value);
      const ativos = getProjetosDoAnoEStatus(ano, 'ativo');
      const encerrados = getProjetosDoAnoEStatus(ano, 'encerrado');
      
      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Status dos Projetos</div>
          <button onClick={() => go({type:'status', value:'ativo', label:'Projetos Ativos'})}
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left group">
            <span className="font-semibold text-gray-900 group-hover:text-primary">Projetos Ativos</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">{ativos.length} projeto(s)</span>
              <Chevron />
            </div>
          </button>
          <button onClick={() => go({type:'status', value:'encerrado', label:'Projetos Encerrados'})}
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left group">
            <span className="font-semibold text-gray-900">Projetos Encerrados</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">{encerrados.length} projeto(s)</span>
              <Chevron />
            </div>
          </button>
        </div>
      );
    }

    // Nível 2: Projeto
    if (path.length === 2) {
      const ano = parseInt(path[0].value);
      const status = path[1].value;
      const lista = getProjetosDoAnoEStatus(ano, status);

      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Selecione o Projeto</div>
          {lista.length === 0 && <div className="text-gray-500 italic py-4">Nenhum projeto nesta categoria.</div>}
          {lista.map(p => (
            <button key={p.id} onClick={() => go({type:'projeto', value:p.nome, label:p.nome})}
              className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left group">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{p.nome}</span>
                {p.anos.length > 1 && <span className="text-xs text-gray-500 mt-0.5">Atravessa {p.anos[0]}–{p.anos[p.anos.length-1]}</span>}
              </div>
              <Chevron />
            </button>
          ))}
        </div>
      );
    }

    // Nível 3: Tipo Documento
    if (path.length === 3) {
      if (loadingDocs) return <div className="text-gray-500 py-10">Carregando documentos...</div>;

      const projeto = projetos.find(x => x.nome === path[2].value);
      const docs = documentosProjeto;
      
      const qtdTermos = docs.filter(d => d.tipo === 'termo').length;
      const qtdCircunstanciado = docs.filter(d => d.tipo === 'circunstanciado').length;
      const qtdFinanceiro = docs.filter(d => d.tipo === 'financeiro').length;

      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tipo de Documento</div>
          
          <button onClick={() => go({type:'tipo', value:'termo', label:'Termos / Planos de Trabalho'})}
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left group">
            <span className="font-semibold text-gray-900">Termo de Colaboração e Plano de Trabalho</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">{qtdTermos} arq.</span>
              <Chevron />
            </div>
          </button>
          
          <button onClick={() => go({type:'tipo', value:'circunstanciado', label:'Relatórios Circunstanciados'})}
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left group">
            <span className="font-semibold text-gray-900">Relatório Circunstanciado</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">{qtdCircunstanciado} arq.</span>
              <Chevron />
            </div>
          </button>
          
          <button onClick={() => go({type:'tipo', value:'financeiro', label:'Relatórios Financeiros'})}
            className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors text-left group">
            <span className="font-semibold text-gray-900">Relatório Financeiro</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">{qtdFinanceiro} arq.</span>
              <Chevron />
            </div>
          </button>
        </div>
      );
    }

    // Nível 4: Mês (só para circunstanciado e financeiro)
    if (path.length === 4) {
      const tipo = path[3].value;
      const projeto = projetos.find(x => x.nome === path[2].value);
      const docsDoTipo = documentosProjeto.filter(d => d.tipo === tipo);

      if (tipo === 'termo') {
        return (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Documentos</div>
            {docsDoTipo.length === 0 && <div className="text-gray-500 italic py-4">Nenhum termo anexado.</div>}
            {docsDoTipo.map(doc => (
              <div key={doc.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-start gap-3">
                <span className="font-bold text-gray-900">{doc.nome_arquivo}</span>
                <a href={doc.drive_url} target="_blank" rel="noreferrer" className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors">
                  Visualizar documento ↗
                </a>
              </div>
            ))}
          </div>
        );
      }

      // Tipos mensais: agrupar por mês/ano
      const mesesSet = new Set(docsDoTipo.map(d => `${d.mes}|${d.ano}`));
      const mesesArray = Array.from(mesesSet).map(s => {
        const [m, a] = s.split('|');
        return { mes: parseInt(m), ano: parseInt(a) };
      }).sort((a, b) => b.ano - a.ano || b.mes - a.mes); // Ordem decrescente

      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Selecione o Mês</div>
          {mesesArray.length === 0 && <div className="text-gray-500 italic py-4">Nenhum relatório encontrado.</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mesesArray.map(m => (
              <button key={`${m.mes}-${m.ano}`} onClick={() => go({type:'mes', value:`${m.mes}|${m.ano}`, label:`${MES_ABREV[m.mes.toString()]}/${m.ano}`})}
                className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary transition-colors group">
                <span className="font-bold text-gray-900 group-hover:text-primary">{MES_ABREV[m.mes.toString()]}</span>
                <span className="text-xs text-gray-500">{m.ano}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Nível 5: Arquivos do Mês selecionado
    if (path.length === 5) {
      const tipo = path[3].value;
      const [mes, ano] = path[4].value.split('|');
      const docs = documentosProjeto.filter(d => d.tipo === tipo && d.mes?.toString() === mes && d.ano?.toString() === ano);

      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Documentos do Mês</div>
          {docs.map(doc => (
            <div key={doc.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-start gap-3">
              <div>
                <div className="font-bold text-gray-900 text-base">{doc.nome_arquivo}</div>
                <div className="text-sm text-gray-500 mt-1">{MES_FULL[mes]} {ano}</div>
              </div>
              <a href={doc.drive_url} target="_blank" rel="noreferrer" className="mt-2 text-sm font-bold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-dark transition-colors shadow-sm">
                Visualizar documento ↗
              </a>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans text-gray-900 flex flex-col">
      <div className="max-w-3xl mx-auto px-5 pt-10 flex flex-col flex-1 w-full">
        
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o site
          </Link>
        </div>

        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-display font-bold text-primary">Transparência</h1>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="text-xs font-semibold text-primary bg-primary-light hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Painel Admin
          </button>
        </div>
        
        <p className="text-gray-500 mb-8">Navegue pelos documentos oficiais, por aqui.</p>

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-gray-200 text-sm">
          <button onClick={() => setPath([])} className={`font-semibold transition-colors ${path.length === 0 ? 'text-gray-900 cursor-default' : 'text-primary hover:underline'}`}>
            Início
          </button>
          {path.map((seg, i) => {
            const isLast = i === path.length - 1;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <button onClick={() => isLast ? null : goTo(i)} className={`font-semibold transition-colors ${isLast ? 'text-gray-900 cursor-default' : 'text-primary hover:underline'}`}>
                  {seg.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Conteúdo Dinâmico */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={path.length}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {isLoginModalOpen && (
            <LoginModal 
              isOpen={isLoginModalOpen} 
              onClose={() => setIsLoginModalOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-auto pt-8 pb-8 border-t border-gray-200 text-center w-full">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Banco de Leite Humano. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
