"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProjectManager from './components/ProjectManager';
import ProjectDetail from './components/ProjectDetail';

type Projeto = {
  id: string;
  nome: string;
  status: 'ativo' | 'encerrado';
  data_inicio: string;
  data_fim: string | null;
};

export default function AdminDashboard() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);

  const fetchProjetos = async () => {
    const { data } = await supabase
      .from('projetos')
      .select('*')
      .order('data_inicio', { ascending: false });
    if (data) {
      setProjetos(data);
      // Atualiza o projeto selecionado se ele estiver aberto
      if (selectedProject) {
        const updated = data.find(p => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  return (
    <div>
      {selectedProject ? (
        <ProjectDetail
          projeto={selectedProject}
          onBack={() => setSelectedProject(null)}
          onProjectUpdated={fetchProjetos}
        />
      ) : (
        <ProjectManager
          projetos={projetos}
          onUpdate={fetchProjetos}
          onSelectProject={setSelectedProject}
        />
      )}
    </div>
  );
}
