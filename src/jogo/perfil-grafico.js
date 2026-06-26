export const PERFIS_GRAFICOS = {
  mobile: {
    id: 'mobile',
    nome: 'Mobile Estavel',
    resumo: 'Menos pixels, sem bloom e sem sombras dinamicas. Melhor para celulares fracos.',
    pixelRatioMobile: 0.95,
    pixelRatioDesktop: 1.05,
    sombras: false,
    antialias: false,
    bloom: false,
  },
  premium: {
    id: 'premium',
    nome: 'Premium',
    resumo: 'Equilibrio atual: imagem rica no PC e leveza controlada no celular.',
    pixelRatioMobile: 1.08,
    pixelRatioDesktop: 1.5,
    sombras: 'desktop',
    antialias: 'auto',
    bloom: 'desktop',
  },
  ultra: {
    id: 'ultra',
    nome: 'Ultra Instalado',
    resumo: 'Prioriza imagem. Perfil pensado para app instalado e aparelhos fortes.',
    pixelRatioMobile: 1.2,
    pixelRatioDesktop: 1.75,
    sombras: true,
    antialias: true,
    bloom: true,
  },
};

const CHAVE = 'venor_perfil_grafico';

export function lePerfilGrafico() {
  try {
    const id = localStorage.getItem(CHAVE);
    if (id && PERFIS_GRAFICOS[id]) return PERFIS_GRAFICOS[id];
  } catch {}
  return PERFIS_GRAFICOS.premium;
}

export function salvaPerfilGrafico(id) {
  const perfil = PERFIS_GRAFICOS[id] || PERFIS_GRAFICOS.premium;
  try { localStorage.setItem(CHAVE, perfil.id); } catch {}
  return perfil;
}

export function antialiasAtivo(perfil, ehMobile) {
  if (perfil.antialias === true) return true;
  if (perfil.antialias === 'auto') return !ehMobile;
  return false;
}

export function sombrasAtivas(perfil, ehMobile) {
  if (perfil.sombras === true) return true;
  if (perfil.sombras === 'desktop') return !ehMobile;
  return false;
}

export function bloomAtivo(perfil, ehMobile) {
  if (perfil.bloom === true) return true;
  if (perfil.bloom === 'desktop') return !ehMobile;
  return false;
}

export function aplicaPerfilRenderer(renderer, perfil, ehMobile) {
  const cap = ehMobile ? perfil.pixelRatioMobile : perfil.pixelRatioDesktop;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
  renderer.shadowMap.enabled = sombrasAtivas(perfil, ehMobile);
  return {
    perfil,
    pixelRatioCap: cap,
    sombras: renderer.shadowMap.enabled,
    bloom: bloomAtivo(perfil, ehMobile),
  };
}
