import fs from 'fs';

const path = 'e:/!!!!!!!!Repositorio/Eklipse Funded/src/components/auth/LoginPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find login-panel and register-panel
const loginPanelStart = content.indexOf('<motion.div\n                key="login-panel"');
const registerPanelStart = content.indexOf('<motion.div\n              key="register-panel"');
const endOfRegisterForm = content.indexOf('</motion.div>\n            )}\n          </AnimatePresence>');

if (loginPanelStart === -1 || registerPanelStart === -1 || endOfRegisterForm === -1) {
  console.error('Failed to locate markers:', { loginPanelStart, registerPanelStart, endOfRegisterForm });
  process.exit(1);
}

// Extract login content
const loginEnd = content.indexOf('</motion.div>', loginPanelStart) + '</motion.div>'.length;
const loginPanel = content.slice(loginPanelStart, loginEnd);

// Extract register content
const registerEnd = endOfRegisterForm + '</motion.div>'.length;
const registerPanel = content.slice(registerPanelStart, registerEnd);

console.log('Login panel length:', loginPanel.length);
console.log('Register panel length:', registerPanel.length);

const beforeRender = content.slice(0, content.indexOf('  return (\n    <div className="h-screen w-full relative'));

const newReturn = `  const renderPepe = (side: 'left' | 'right') => (
    <div className={\`hidden md:flex \${
      side === 'left' ? 'w-full md:w-[46%] lg:w-[48%] xl:w-[48%]' : 'w-full md:w-[44%] lg:w-[46%] xl:w-[46%]'
    } h-screen relative items-end justify-center overflow-hidden pb-0 select-none pointer-events-none\`}>
      <img 
        src={pepeFooterImg} 
        alt="Pepe Sentinel Mascot" 
        className="w-[320px] md:w-[420px] lg:w-[480px] xl:w-[540px] 2xl:w-[620px] max-w-[95%] max-h-[88vh] h-auto object-contain block drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
      />
    </div>
  );

  return (
    <div className="h-screen w-full relative bg-[#06070B] text-white selection:bg-amber-400/20 selection:text-amber-300 overflow-hidden select-none">
      
      {/* Top Left Navigation Back to Landing */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer z-50 group px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-xl hover:border-amber-400/40"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amber-400" />
        <span>{isEn ? 'Back to Landing' : 'Volver al Inicio'}</span>
      </button>

      {/* Top Right Live Security Badge */}
      <div className="fixed top-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 z-50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold text-white">Shield v4.2</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400">Zero-Trust WAF</span>
      </div>

      {/* Imagen de fondo viva y atmosférica (Eclipse Solar y Ciudad Iluminada) en toda la pantalla */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center sm:bg-[position:center_center] pointer-events-none z-0 scale-[1.01]"
        style={{ backgroundImage: \`url(\${loginBackgroundImg})\` }}
      >
        {/* Velo atmosférico muy sutil para que el fondo se aprecie brillante, nítido y espectacular */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] pointer-events-none" />
        {/* Viñeta sutil en bordes para enfocar la vista sin oscurecer el centro ni la ciudad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Subtle Living Cosmic Dust Canvas en toda la pantalla */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-40">
        <AmbientLivingCosmicCanvas />
      </div>

      {/* Luces atmosféricas de fondo proyectadas a través del cristal */}
      <div className="fixed top-1/6 right-10 w-96 h-96 bg-purple-600/15 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/6 left-10 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* CONTENEDOR PRINCIPAL INTERCALADO:
          - EN LOGIN: PEPE A LA IZQUIERDA, FORMULARIO A LA DERECHA
          - EN REGISTRO: FORMULARIO A LA IZQUIERDA, PEPE A LA DERECHA */}
      <div className="relative z-20 w-full h-screen">
        {mode === 'login' ? (
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* LADO IZQUIERDO: PEPE (Desktop Only - Oculto 100% en Móvil) */}
            {renderPepe('left')}

            {/* LADO DERECHO: FORMULARIO DE LOGIN */}
            <div className="w-full md:w-[54%] lg:w-[52%] xl:w-[52%] h-screen relative z-20 overflow-y-auto no-scrollbar md:border-l border-white/10 bg-black/15 sm:bg-black/20 backdrop-blur-[1px]">
              <div className="w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
                ${loginPanel}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* LADO IZQUIERDO: FORMULARIO DE REGISTRO */}
            <div className="w-full md:w-[58%] lg:w-[56%] xl:w-[55%] h-screen relative z-20 overflow-y-auto no-scrollbar md:border-r border-white/10 bg-black/15 sm:bg-black/20 backdrop-blur-[1px]">
              <div className="w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
                ${registerPanel}
              </div>
            </div>

            {/* LADO DERECHO: PEPE (Desktop Only - Oculto 100% en Móvil) */}
            {renderPepe('right')}
          </div>
        )}
      </div>

    </div>
  );
};
`;

const updatedContent = beforeRender + newReturn;
fs.writeFileSync(path, updatedContent, 'utf8');
console.log('Successfully updated LoginPage.tsx!');
