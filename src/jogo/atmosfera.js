// =============================================================
//  ATMOSFERA · partículas de ambiente (RV11.0) — o "pó dos raios de sol".
//  Poeira/pólen flutuando lentamente AO REDOR do jogador (o grupo segue o
//  avatar), dando profundidade e vida ao ar. Só no PC (no celular pesa).
//  Devolve { grupo, atualiza(dt, tempo) } — main3d posiciona no avatar.
// =============================================================
import * as THREE from 'three';

export function criaAtmosfera(ehMobile) {
  const grupo = new THREE.Group();
  const N = ehMobile ? 0 : 110;
  if (!N) return { grupo, atualiza() {}, motes: null };

  const R = 28, ALTO = 13;
  const pos = new Float32Array(N * 3);
  const vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * R * 2;
    pos[i * 3 + 1] = Math.random() * ALTO + 0.5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * R * 2;
    vel.push({ x: (Math.random() - 0.5) * 0.4, y: 0.08 + Math.random() * 0.22, z: (Math.random() - 0.5) * 0.4, ph: Math.random() * 6.28 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfff2d6, size: 0.085, sizeAttenuation: true,
    transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, fog: true,
  });
  const motes = new THREE.Points(geo, mat);
  motes.frustumCulled = false;
  grupo.add(motes);

  function atualiza(dt, tempo, opacidadeAlvo = 0.55) {
    // fade suave até a opacidade-alvo (some em zonas escuras se quiser)
    mat.opacity += (opacidadeAlvo - mat.opacity) * Math.min(1, dt * 2);
    const p = geo.attributes.position;
    for (let i = 0; i < N; i++) {
      let x = p.getX(i) + vel[i].x * dt + Math.sin(tempo * 0.6 + vel[i].ph) * 0.012;
      let y = p.getY(i) + vel[i].y * dt;
      let z = p.getZ(i) + vel[i].z * dt + Math.cos(tempo * 0.5 + vel[i].ph) * 0.012;
      if (y > ALTO) { y = 0.4; x = (Math.random() - 0.5) * R * 2; z = (Math.random() - 0.5) * R * 2; }
      if (x > R) x -= R * 2; else if (x < -R) x += R * 2;
      if (z > R) z -= R * 2; else if (z < -R) z += R * 2;
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  }

  return { grupo, atualiza, motes };
}
