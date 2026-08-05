"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  Heart, MapPin, Phone, Mail, Clock, Menu, X, Activity, 
  Users, Baby, Home, Droplets, Thermometer, Stethoscope, 
  Info, ChevronRight, ChevronLeft, Copy, Check, ChevronDown, Beaker
} from "lucide-react";

import { ActivityCard } from "./ActivityCard";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section tracking
      const sections = ['home', 'about', 'projects', 'atividades', 'doacao', 'contact'];
      let current = 'home';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = section;
          }
        }
      }
      
      if (window.location.pathname.includes('transparencia')) {
        current = 'transparencia';
      }
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home', id: 'home' },
    { name: 'Sobre', href: '#about', id: 'about' },
    { name: 'Projetos', href: '#projects', id: 'projects' },
    { name: 'Atividades', href: '#atividades', id: 'atividades' },
    { name: 'Contato', href: '#contact', id: 'contact' },
    { name: 'Doar', href: '#doacao', id: 'doacao' },
    { name: 'Transparência', href: '/transparencia', id: 'transparencia' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-white/90 backdrop-blur-sm border-b border-white/20 py-4 shadow-sm'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center relative z-50">
            <Image src="https://i.postimg.cc/kXVXyyqv/logo-sem-fundo-cortada-redimensionada.png" alt="Logo Banco de Leite" width={264} height={78} className="object-contain h-20 w-auto" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="flex items-center gap-8">
                {link.name === 'Transparência' && (
                  <span className={`text-sm opacity-50 font-light ${scrolled ? 'text-slate-400' : 'text-slate-600'}`}>|</span>
                )}
                <Link 
                  href={link.href}
                  className={`text-base font-medium transition-colors hover:text-primary relative pb-1 ${activeSection === link.id ? 'text-primary' : 'text-slate-700'}`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden relative z-50 p-2 text-slate-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden absolute top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-display font-medium text-slate-900"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center min-h-[85vh]">
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://i.postimg.cc/PJWSB5pM/hero-editada-v2.png" 
          alt="Hero Banner Banco de Leite" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-6xl md:text-[80px] font-display font-bold leading-[1.05] text-white mb-6 drop-shadow-lg">
            Banco de <br/>
            Leite Humano
          </h1>
          
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-[700px] mx-auto leading-relaxed drop-shadow-md font-medium">
            Um legado de amor que começou em 1943, cuidando de gerações<br className="hidden md:block"/> com pioneirismo em saúde infantil e maternidade em <span className="text-primary font-semibold">Taubaté</span>!
          </p>
          
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link 
                href="#doacao" 
                className="px-8 py-3 bg-primary text-white rounded font-medium hover:bg-primary-dark transition-all shadow-md hover:shadow-xl inline-flex items-center gap-2"
              >
                <Heart className="w-5 h-5 fill-current" />
                Faça sua Doação!
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        animate={{ y: [0, 0, -15, 0, -7, 0, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1]
        }}
      >
        <Link href="#about" aria-label="Role para baixo" className="block text-white opacity-90 hover:opacity-100 transition-opacity">
          <ChevronDown className="w-10 h-10 drop-shadow-md" />
        </Link>
      </motion.div>
    </section>
  )
}

const About = () => {
  return (
    <section id="about" className="py-16 md:py-20 bg-[#f0f6f3] relative">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5 relative z-0"
            >
              <Image 
                src="https://i.postimg.cc/BQdZ71v5/foto-sobre.png" 
                alt="História do Banco de Leite" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div 
              whileHover={{ y: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -bottom-8 -right-8 bg-white p-6 rounded-3xl shadow-2xl shadow-black/10 border border-gray-100 hidden md:block cursor-default z-10"
            >
              <div className="text-4xl font-display font-bold text-primary mb-1">+80</div>
              <div className="text-sm text-slate-500 font-medium">Anos de dedicação</div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-8 tracking-tight">Sobre o Banco de Leite</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                Fundado em 17 de dezembro de 1943, o Serviço de Proteção à Criança (SPC) nasceu da iniciativa de um grupo de beneméritos de Taubaté, liderados pelo médico e filantropo Dr. Raul Guisard, tornando-se uma referência no atendimento à infância e às famílias da região.
              </p>
              <p>
                Na década de 1940, a instituição recebeu da Prefeitura de Taubaté um terreno onde, com o apoio da Diretoria, associados e comunidade, construiu sua sede própria. Nesse espaço foi implantado o primeiro Posto de Puericultura de Taubaté e região, oferecendo atendimento médico, social e assistencial pioneiro voltado à saúde materno-infantil.
              </p>
              <p>
                Em 2000, o SPC ampliou sua atuação com a implantação do <strong className="text-slate-900 font-semibold">Banco de Leite Humano (BLH)</strong>, serviço de saúde de média complexidade regulamentado pela RDC 171/ANVISA/MS e pela Portaria 2.193/MS. A iniciativa contou com a atuação da Diretoria do SPC, do Dr. Paulo Rosa, além do apoio do Rotary Taubaté Sul, Rotary Internacional, UNITAU, FUST/UNITAU e da Prefeitura Municipal de Taubaté, responsável pela adequação das instalações às exigências legais.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const AUTOPLAY_INTERVAL = 10000;

  const projects = [
    {
      title: "Educação e Apoio às Famílias Doadoras",
      desc: "Nossa equipe especializada orienta um grupo de mães sobre a importância da doação de leite humano e os cuidados no processo de coleta e armazenamento. O Banco de Leite Humano de Taubaté oferece todo o suporte necessário para que esse gesto de amor chegue com segurança aos bebês que mais precisam. 💧 Cada gota doada pode salvar uma vida.",
      img: "https://i.postimg.cc/fT3TvvDr/primeira-carrossel.jpg"
    },
    {
      title: "Coleta e Transporte Seguro de Leite Humano",
      desc: "O Banco de Leite de Taubaté realiza um trabalho essencial para salvar vidas. Nesta etapa do projeto, nossa equipe é responsável pela coleta e transporte do leite humano doado, garantindo que todo o processo aconteça com segurança, higiene e respeito às normas sanitárias. Cada frasco doado é um gesto de amor que faz diferença na recuperação e nutrição de bebês prematuros e recém-nascidos internados.",
      img: "https://i.postimg.cc/tC1Czz9C/segunda-carrossel.jpg"
    },
    {
      title: "Análise e Pasteurização do Leite Humano",
      desc: "Após a coleta, o leite humano passa por rigorosos processos de análise e pasteurização, garantindo sua segurança e qualidade antes de chegar aos bebês que mais precisam. Nossa equipe realiza todo o trabalho com cuidado, técnica e amor, assegurando que cada gota de leite doado seja aproveitada da melhor forma possível.",
      img: "https://i.postimg.cc/15g5KKyy/terceira-carrossel.jpg"
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % projects.length);
    setTimerKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setTimerKey((prev) => prev + 1);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
      setTimerKey((prev) => prev + 1);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [timerKey]);

  return (
    <section id="projects" className="py-16 md:py-20 bg-[#fbfbfd] overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary tracking-tight">Nossos Projetos</h2>
          </div>
        </div>
        
        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-slate-100 overflow-hidden relative group"
        >
          <div className="aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[3/1] relative overflow-hidden bg-slate-100">
            <AnimatePresence initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image 
                  src={projects[activeIndex].img} 
                  alt={projects[activeIndex].title} 
                  fill 
                  className="object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 flex items-center justify-center text-slate-700 hover:bg-white hover:text-primary transition-all pointer-events-auto"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 flex items-center justify-center text-slate-700 hover:bg-white hover:text-primary transition-all pointer-events-auto"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
          <div className="p-6 md:p-8 relative bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl md:text-2xl font-semibold text-primary mb-3 flex items-center gap-3">
                  <span className="w-6 h-1 bg-primary/30 rounded-full inline-block"></span>
                  {projects[activeIndex].title}
                </h3>
                <p className="text-slate-600 md:text-lg leading-relaxed max-w-3xl">{projects[activeIndex].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Carousel Pagination with Timer */}
        <div className="flex justify-center mt-10 gap-3">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                setTimerKey((prev) => prev + 1);
              }}
              className={`relative h-2.5 rounded-full overflow-hidden transition-all duration-300 ${i === activeIndex ? 'w-16 bg-primary/20' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Ir para projeto ${i + 1}`}
            >
              {i === activeIndex && (
                <motion.div 
                  className="absolute top-0 left-0 bottom-0 bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                  key={timerKey}
                />
              )}
            </button>
          ))}
        </div>

      </div>
    </section>
  )
}

const Activities = () => {
  const acts = [
    { icon: <Info className="w-6 h-6"/>, title: "Educação em Saúde", desc: "Ações educativas na área da saúde coletiva com orientações nutricionais para famílias e comunidade." },
    { icon: <Users className="w-6 h-6"/>, title: "Acolhimento Acadêmico", desc: "Acolhimento de alunos de cursos técnicos e de graduação para visitas técnicas e trabalhos acadêmicos." },
    { icon: <Droplets className="w-6 h-6"/>, title: "Cursos para Gestantes", desc: "Cursos de orientação sobre amamentação para gestantes (mães e pais), preparando-os para esse momento especial." },
    { icon: <Home className="w-6 h-6"/>, title: "Coleta Domiciliar", desc: "Coleta do Leite Humano doado nas residências, garantindo conforto e praticidade para nossas doadoras." },
    { icon: <Thermometer className="w-6 h-6"/>, title: "Análise do Leite", desc: "Análise do Leite Doado (Acidez, teste de caloria e teste microbiológico) seguindo padrões rigorosos de qualidade." },
    { icon: <Activity className="w-6 h-6"/>, title: "Pasteurização", desc: "Pasteurização do Leite Humano para entrega nas UTI Neonatais, garantindo segurança para os recém-nascidos." },
    { icon: <Baby className="w-6 h-6"/>, title: "Atendimento Pediátrico", desc: "Atendimento médico pediátrico aos bebês das mães doadoras, proporcionando acompanhamento de qualidade." },
    { icon: <Stethoscope className="w-6 h-6"/>, title: "Orientação Especializada", desc: "Atendimento de orientação de Enfermagem e Nutrição para garantir o bem-estar das mães e bebês." },
  ];

  return (
    <section id="atividades" className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-slate-900 mb-6 tracking-tight">Nossas Atividades</h2>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto">Serviços essenciais prestados com excelência e carinho pela nossa equipe.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {acts.map((act, i) => (
            <ActivityCard key={i} act={act} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

const Donation = () => {
  const [copied, setCopied] = useState(false);
  const pixCode = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5925NOME DA INSTITUICAO6009SAO PAULO62070503***6304ABCD";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="doacao" className="py-16 md:py-20 bg-[#fbfbfd]">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden relative"
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-semibold text-slate-900 mb-6 tracking-tight">Como Ajudar</h2>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Um pequeno gesto seu pode fazer uma grande diferença na vida de muitos bebês. Sua contribuição nos ajuda a manter nossa estrutura.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">Doação de Leite</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Se você é uma mãe lactante com produção excedente, entre em contato para se tornar uma doadora.</p>
                  </div>
                </div>
                
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Copy className="w-7 h-7" />
                  </div>
                  <div className="w-full max-w-[280px] md:max-w-none">
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">Doação Financeira (PIX)</h4>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">Copie a chave abaixo para contribuir de forma rápida e segura com qualquer valor.</p>
                    <div className="flex items-center gap-2 bg-[#fbfbfd] p-2 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <input 
                        type="text" 
                        readOnly 
                        value={pixCode} 
                        className="bg-transparent text-sm text-slate-500 w-full outline-none px-3 truncate font-mono"
                      />
                      <button 
                        onClick={handleCopy}
                        className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shrink-0 shadow-sm"
                      >
                        {copied ? <Check className="w-4 h-4"/> : "Copiar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
              <Image src="https://i.postimg.cc/5t7bWHm3/QR-code.jpg" alt="Doação via PIX" fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const Contact = () => {
  return (
    <section id="contact" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-10 tracking-tight">Informações e Localização</h2>
            
            <div className="space-y-10 mb-14">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[#fbfbfd] border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Endereço</h4>
                  <p className="text-slate-600 leading-relaxed">Rua Dr. José Luís de Almeida Soares, 35<br/>Jardim Santa Clara, Taubaté - SP, 12080-130</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[#fbfbfd] border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Telefone</h4>
                  <a href="tel:+551236246814" className="text-slate-600 hover:text-primary transition-colors text-lg">(12) 3624-6814</a>
                </div>
              </div>
              <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-full bg-[#fbfbfd] border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">E-mail</h4>
                  <a href="mailto:blhtaubate@gmail.com" className="text-slate-600 hover:text-primary transition-colors">blhtaubate@gmail.com</a>
                </div>
              </div>
              <div className="flex gap-6">
                 <div className="w-12 h-12 rounded-full bg-[#fbfbfd] border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Horário de Funcionamento</h4>
                  <p className="text-slate-600 leading-relaxed">Segunda a Sexta: 07:30 - 13:30<br/>Sábado e Domingo: Fechado</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] overflow-hidden h-72 shadow-lg border border-gray-100 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3674.671340156761!2d-45.56069632468801!3d-22.9256950792419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ccf8f3c3070b8b%3A0x6b876e9842a27a3a!2sR.%20Dr.%20Jos%C3%A9%20Lu%C3%ADs%20de%20Almeida%20Soares%2C%2035%20-%20Jardim%20Santa%20Clara%2C%20Taubat%C3%A9%20-%20SP%2C%2012080-130!5e0!3m2!1spt-BR!2sbr!4v1694883445695!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="bg-[#fbfbfd] p-10 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit"
          >
            <h3 className="text-3xl font-display font-semibold text-primary mb-8">Guia Prático de Doação</h3>
            
            <div className="space-y-10">
              {/* Doação de Leite Materno */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Baby className="w-6 h-6 text-primary" />
                  <h4 className="text-xl font-semibold text-slate-900">Doação de Leite Materno</h4>
                </div>
                <p className="text-slate-600 mb-4">Seu leite pode salvar vidas. Veja como é simples se tornar uma doadora:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Ser saudável e não tomar medicamentos que impeçam a amamentação.</span>
                  </li>
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Apresentar exames pré-natais compatíveis (VDRL, HIV, Hepatite B e C).</span>
                  </li>
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Possuir uma produção de leite maior que a necessidade do seu bebê.</span>
                  </li>
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Entrar em contato conosco para receber o kit de coleta e as orientações.</span>
                  </li>
                </ul>
              </div>

              {/* Doação de Potes de Vidro */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Beaker className="w-6 h-6 text-primary" />
                  <h4 className="text-xl font-semibold text-slate-900">Doação de Potes de Vidro</h4>
                </div>
                <p className="text-slate-600 mb-4">Os potes são essenciais para armazenar o leite com segurança. Nós precisamos de:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Potes de vidro com tampa de plástico rosqueável (como os de café solúvel ou maionese).</span>
                  </li>
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Não servem potes com tampa de metal, pois podem enferrujar e contaminar o leite.</span>
                  </li>
                  <li className="flex gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>Você pode entregá-los diretamente em nossa sede durante o horário de funcionamento.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-20 border-t border-primary-dark">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6 bg-white p-3 rounded-2xl w-fit">
              <Image src="https://i.postimg.cc/kXVXyyqv/logo-sem-fundo-cortada-redimensionada.png" alt="Logo Banco de Leite" width={264} height={78} className="object-contain h-16 w-auto" />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Um legado de amor que começou em 1943, cuidando de gerações com pioneirismo em saúde infantil e maternidade.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Navegação</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#home" className="hover:text-primary-light transition-colors">Início</Link></li>
              <li><Link href="#about" className="hover:text-primary-light transition-colors">Sobre</Link></li>
              <li><Link href="#projects" className="hover:text-primary-light transition-colors">Projetos</Link></li>
              <li><Link href="#atividades" className="hover:text-primary-light transition-colors">Atividades</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Links Úteis</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#contact" className="hover:text-primary-light transition-colors">Contato</Link></li>
              <li><Link href="#doacao" className="hover:text-primary-light transition-colors">Como Doar</Link></li>
              <li><Link href="/transparencia" className="hover:text-primary-light transition-colors">Portal da Transparência</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="text-white font-medium mb-6">Contato</h4>
             <ul className="space-y-4 text-sm text-white/80">
                <li className="flex gap-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-1" />
                  <span>Rua Dr. José Luís de Almeida Soares, 35 - Taubaté/SP</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>(12) 3624-6814</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>blhtaubate@gmail.com</span>
                </li>
             </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-primary-dark/50 text-center text-sm text-white/70">
          <p>© {new Date().getFullYear()} Banco de Leite Humano. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Activities />
        <Contact />
        <Donation />
      </main>
      <Footer />
    </div>
  )
}
