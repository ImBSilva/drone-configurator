import { Shield, Cpu, Layers, BookOpen, GitBranch } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-industrial-border bg-industrial-bg py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Tech Spec section */}
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-wider text-industrial-accent uppercase mb-3 flex items-center gap-1.5">
              <Cpu size={14} /> DRØNE ENGINE Beta 0.5
            </h3>
            <p className="text-xs text-industrial-fg-secondary leading-relaxed max-w-sm">
              Plataforma de modelagem 3D e parametrização industrial de drones corporativos de alta performance. Desenvolvido para operações governamentais, mapeamento LiDAR e inteligência aérea avançada.
            </p>
          </div>

          {/* Core Info */}
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-wider text-industrial-fg uppercase mb-3 flex items-center gap-1.5">
              <Layers size={14} /> ESTRUTURA MONOREPO
            </h3>
            <ul className="text-xs text-industrial-fg-secondary space-y-1.5 font-mono">
              <li>Client: React.js + Three.js + R3F + Tailwind CSS</li>
              <li>Server: Node.js + Fastify + MongoDB</li>
              <li>DevOps: Docker Compose + JWT AppSec Core</li>
            </ul>
          </div>

          {/* Security details */}
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-3 flex items-center gap-1.5">
              <Shield size={14} /> APPSEC / DEFENSIVE SECURITY
            </h3>
            <p className="text-xs text-industrial-fg-secondary leading-relaxed">
              Autenticação segura implementando sanitização contra NoSQL Injection, XSS mitigation headers, JWT signature checks, hashes criptografados e rate limits robustos.
            </p>
          </div>

          {/* Study project notice */}
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-wider text-industrial-fg uppercase mb-3 flex items-center gap-1.5">
              <BookOpen size={14} /> PROJETO DE ESTUDOS
            </h3>
            <p className="text-xs text-industrial-fg-secondary leading-relaxed mb-3">
              Aplicação de portfólio para demonstração de arquitetura full-stack, computação gráfica 3D, segurança de API e design UI/UX.
            </p>
            <a
              href="https://github.com/ImBSilva/drone-configurator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-industrial-accent hover:text-industrial-accent-hover transition-colors font-mono mb-3"
            >
              <GitBranch size={14} /> github.com/ImBSilva/drone-configurator
            </a>
            <div className="flex flex-wrap gap-1.5">
              {['React', 'Fastify', 'MongoDB', 'Three.js', 'Tailwind'].map((tech) => (
                <span key={tech} className="px-1.5 py-0.5 rounded-sm bg-industrial-border/30 border border-industrial-border/50 text-[9px] font-mono text-industrial-muted uppercase tracking-wider">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        <hr className="border-industrial-border my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-industrial-muted">
          <div>
            © {new Date().getFullYear()} DRØNE INDUSTRIAL. Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-industrial-fg cursor-pointer">Segurança da Informação</span>
            <span>·</span>
            <span className="hover:text-industrial-fg cursor-pointer">Especificações Técnicas</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer
