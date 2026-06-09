
import { Link } from 'react-router-dom'
import { DroneCanvas } from '../components/canvas/DroneCanvas'
import { Button } from '../components/ui/Button'
import { Shield, Zap, TrendingUp, MonitorSmartphone, Target, Sprout, Map, Github } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-industrial-bg text-industrial-fg animate-in">
      
      {/* Hero Section with Split Screen Layout */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[85vh] border-b border-industrial-border">
        
        {/* Left Hero Content */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 bg-industrial-bg">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-industrial-accent tracking-widest uppercase mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-industrial-accent"></span>
            </span>
            DRØNE Systems · Enterprise Solutions
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase leading-none mb-6">
            Construído para <br />
            <span className="text-industrial-accent">Missões</span> que <br />
            Exigem <span className="text-industrial-fg border-b-2 border-industrial-accent">Precisão</span>
          </h1>
          <p className="text-sm sm:text-base text-industrial-fg-secondary leading-relaxed max-w-lg mb-8">
            Drones modulares para vigilância patrimonial, agricultura de precisão, mapeamento geoespacial e operações de segurança. Cada componente é intercambiável, cada configuração é pronta para missão.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/configurator">
              <Button variant="primary" size="lg" className="font-semibold uppercase tracking-wider">
                Começar a Configurar
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="secondary" size="lg" className="uppercase tracking-wider">
                Ver Catalogo
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Hero Visuals - Interactive 3D Canvas */}
        <div className="relative min-h-[400px] md:min-h-0 bg-zinc-950/40 flex items-center justify-center border-t md:border-t-0 md:border-l border-industrial-border">
          <div className="absolute inset-0 z-0">
            <DroneCanvas rotate={true} />
          </div>
          <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-sm bg-industrial-bg/90 border border-industrial-border text-[9px] font-mono uppercase text-industrial-accent font-medium tracking-wide">
              Módulo 3D Ativo
            </span>
          </div>
        </div>

      </section>

      {/* Specs Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-industrial-border bg-zinc-950/20">
        {[
          { value: '360', label: 'Autonomia (min)' },
          { value: '30', label: 'Alcance Máx (km)' },
          { value: '3.2', label: 'Carga Útil (kg)' },
          { value: '99.7%', label: 'Disponibilidade' },
        ].map((spec, i) => (
          <div key={i} className="px-6 py-8 text-center border-r last:border-r-0 border-industrial-border">
            <div className="font-mono text-3xl font-extrabold text-industrial-accent tracking-tighter">
              {spec.value}
            </div>
            <div className="font-mono text-[10px] uppercase text-industrial-muted mt-2 tracking-wider">
              {spec.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center md:text-left mb-12">
          <div className="font-mono text-[10px] text-industrial-accent tracking-widest uppercase mb-2">
            PLATAFORMA INDUSTRIAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            Por que escolher DRØNE?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Simulação 3D Direta',
              desc: 'Peso, empuxo, autonomia de voo e custo são calculados instantaneamente conforme você altera a configuração.',
              icon: <MonitorSmartphone className="text-industrial-accent" size={20} />
            },
            {
              num: '02',
              title: 'Peças Intercambiáveis',
              desc: 'Motores, chassis, sensores de payload, baterias e hélices são projetados para acoplamento 100% plug & play.',
              icon: <Zap className="text-industrial-accent" size={20} />
            },
            {
              num: '03',
              title: 'Resumos Técnicos',
              desc: 'Gere fichas técnicas e relatórios estruturados para homologação, cotação comercial ou auditorias de segurança.',
              icon: <TrendingUp className="text-industrial-accent" size={20} />
            },
            {
              num: '04',
              title: 'AppSec Guardrail',
              desc: 'Configurações de projetos armazenadas e validadas criptograficamente, garantindo confidencialidade e integridade.',
              icon: <Shield className="text-industrial-accent" size={20} />
            }
          ].map((item, index) => (
            <div key={index} className="p-6 border border-industrial-border bg-industrial-surface/50 rounded flex flex-col justify-between hover:border-industrial-accent/30 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-industrial-accent bg-industrial-bg px-2 py-0.5 border border-industrial-border rounded-sm">
                    {item.num}
                  </span>
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-tight text-industrial-fg mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-industrial-fg-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-6 md:px-12 border-t border-industrial-border bg-zinc-950/10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center md:text-left mb-12">
            <div className="font-mono text-[10px] text-industrial-accent tracking-widest uppercase mb-2">
              APLICAÇÕES OPERACIONAIS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Segmentos Atendidos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                code: '// segurança e inteligência',
                title: 'Defesa & Vigilância Patrimonial',
                desc: 'Patrulhamento ostensivo de perímetros, monitoramento inteligente e rastreamento térmico noturno com payloads FLIR dual-camera integrados.',
                icon: <Target className="text-industrial-accent" size={20} />
              },
              {
                code: '// agricultura digital',
                title: 'Monitoramento & Pulverização',
                desc: 'Análise multiespectral ativa, sensores NDVI para diagnóstico foliar precoce e planos de voo autônomos de alta densidade.',
                icon: <Sprout className="text-industrial-accent" size={20} />
              },
              {
                code: '// cartografia e mapeamento',
                title: 'Mapeamento LiDAR & Georreferenciamento',
                desc: 'Fotogrametria em alta resolução (GSD de até 1.5cm) e levantamentos topográficos densos integrados com ArcGIS API e nuvem de pontos.',
                icon: <Map className="text-industrial-accent" size={20} />
              }
            ].map((uso, index) => (
              <div key={index} className="p-8 border border-industrial-border bg-industrial-bg rounded hover:border-industrial-accent/20 transition-all duration-300">
                <div className="font-mono text-[9px] text-industrial-accent tracking-widest uppercase mb-3 flex items-center gap-1.5">
                  {uso.icon} {uso.code}
                </div>
                <h3 className="text-base font-bold uppercase tracking-tight text-industrial-fg mb-3">
                  {uso.title}
                </h3>
                <p className="text-xs text-industrial-fg-secondary leading-relaxed">
                  {uso.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-tight mb-4">
          Pronto para configurar seu drone?
        </h2>
        <p className="text-sm text-industrial-fg-secondary mb-8">
          Monte seu drone sob medida, analise a aerodinâmica, estime custos de fabricação e adicione projetos diretamente à sua frota operacional em tempo real.
        </p>
        <Link to="/configurator">
          <Button variant="primary" size="lg" className="uppercase font-bold tracking-wider px-8 h-12 shadow-lg shadow-industrial-accent/20">
            Começar Agora
          </Button>
        </Link>
      </section>

      {/* About Section */}
      <section className="border-t border-industrial-border bg-zinc-950/10 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-mono text-[10px] text-industrial-accent tracking-widest uppercase mb-2">
            FULL-STACK & UI/UX · PROJETO DE ESTUDOS
          </div>
          <p className="text-sm text-industrial-fg-secondary max-w-2xl mx-auto mb-5 leading-relaxed">
            Portfólio demonstrando arquitetura full-stack com React Three Fiber, Fastify, MongoDB e JWT,
            combinado a um design system industrial criado no Figma com foco em UI/UX.
          </p>
          <a
            href="https://github.com/ImBSilva/drone-configurator"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-industrial-accent hover:text-industrial-accent-hover transition-colors font-mono"
          >
            <Github size={14} /> github.com/ImBSilva/drone-configurator
          </a>
        </div>
      </section>

    </div>
  )
}
export default LandingPage
