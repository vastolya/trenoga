'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// One viewport-sized field beneath the entire document: no section boundaries.
export default function Scene() {
 const root = useRef<HTMLDivElement>(null);
 const [ready, setReady] = useState(false);

 useEffect(() => {
  const host = root.current!;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false }); }
  catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(max-width: 768px)').matches ? 1 : 1.25));
  host.appendChild(renderer.domElement);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  const uniforms = {
   uTime: { value: 0 }, uJourney: { value: 0 },
   uFlow: { value: 0 }, uReturn: { value: 1 }, uFocus: { value: 0 },
   uPointer: { value: new THREE.Vector2(.5, .5) },
   uTrail: { value: new THREE.Vector2(.5, .5) },
   uPulse: { value: new THREE.Vector3(.5, .5, -20) },
   uResolution: { value: new THREE.Vector2(1, 1) },
  };
  const material = new THREE.ShaderMaterial({
   depthWrite: false, uniforms,
   vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
   fragmentShader: `
    varying vec2 vUv;
    uniform float uTime,uJourney,uFlow,uReturn,uFocus;
    uniform vec2 uPointer,uTrail,uResolution;
    uniform vec3 uPulse;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float cloud(vec2 p,vec2 center,vec2 scale){vec2 d=(p-center)*scale;return exp(-dot(d,d));}
    void main(){
     float t=uTime*.13;
     // A closed orbit: both ends of the document share the same spatial phase.
     float phase=uJourney*6.28318530718;
     vec2 orbit=vec2(sin(phase),1.-cos(phase));
     vec2 p=vUv;
     vec2 pointer=p-uPointer;
     float touch=exp(-dot(pointer*3.,pointer*3.));
     p+=pointer*touch*.25;
     p+=(uPointer-uTrail)*exp(-distance(p,uTrail)*4.)*.8;
     float age=max(0.,uTime-uPulse.z);
     vec2 pulse=p-uPulse.xy;
     p+=pulse*exp(-dot(pulse*3.,pulse*3.))*exp(-age*.9)*sin(age*1.6)*.28;
     p.x+=sin(p.y*7.+t+orbit.x*.65)*.08+(uPointer.x-.5)*.085;
     p.y+=sin(p.x*6.-t)*.06+orbit.y*.08;
     p.x+=sin(p.y*13.-t)*.02+uFlow*.025;
     vec2 center=vec2(.75+sin(t*.55+orbit.x*.8)*.12,.4+sin(t*.7)*.09);
     float mass=cloud(p,center,vec2(2.5,2.1));
     float trail=cloud(p,vec2(.18+sin(t*.4)*.12,.22+orbit.y*.075),vec2(2.4,4.0));
     float haze=cloud(p,vec2(.38,.62+sin(t*.4)*.1),vec2(1.7,2.3));
     float cut=cloud(p,uPointer,vec2(3.4,3.4))*touch;
     float ink=clamp(mass*.94+trail*.65-cut*.17,0.,1.);
     float folds=.92+sin(p.y*19.+sin(p.x*7.+t)*2.)*.08;
     vec3 paper=vec3(.910,.898,.867);
     vec3 copper=vec3(.48,.29,.18);
     vec3 tone=mix(copper,vec3(.035,.031,.025),smoothstep(.2,.8,mass));
     // The journey disperses in the archive and gathers back at the end.
     float strength=(mix(.28,.88,uReturn)+orbit.x*.025)*(1.-uFocus*.5*(1.-uReturn));
     float alpha=clamp(ink*folds*strength+haze*.065,0.,.9);
     float grain=hash(floor(vUv*uResolution))-.5;
     vec3 color=mix(paper,tone,alpha)+grain*.028;
     gl_FragColor=vec4(color,1.);
    }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  const resize = () => {
   renderer.setSize(host.clientWidth, host.clientHeight);
   renderer.getDrawingBufferSize(uniforms.uResolution.value);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const pointer = new THREE.Vector2(.5, .5);
  const heroTitle = document.querySelector<HTMLElement>('.hero h1');
  let focus = 0, frame = 0, previousScroll = window.scrollY;
  let elapsed = 0, lastPaint = -100;
  const journey = () => {
   const maxScroll = Math.max(0, document.documentElement.scrollHeight-innerHeight);
   const scroll = THREE.MathUtils.clamp(window.scrollY, 0, maxScroll);
   const progress = maxScroll > 0 ? scroll/maxScroll : 0;
   const distanceToEnd = Math.min(scroll, maxScroll-scroll)/Math.max(innerHeight, 1);
   return { progress, returnStrength: Math.exp(-distanceToEnd*distanceToEnd*2.5) };
  };
  const isArtwork = (target: EventTarget | null) => target instanceof Element && !!target.closest('.chrono-piece,.archive-piece,.series-works button,.about-photo,.studio-photo');
  const move = (e: PointerEvent) => {
   pointer.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
   focus = isArtwork(e.target) ? 1 : 0;
  };
  const leave = () => { pointer.set(.5, .5); focus = 0; };
  const press = (e: PointerEvent) => {
   if (!motion.matches) uniforms.uPulse.value.set(e.clientX / innerWidth, 1-e.clientY / innerHeight, elapsed);
  };
  const focusIn = (e: FocusEvent) => { focus = isArtwork(e.target) ? 1 : 0; };
  const focusOut = () => { focus = 0; };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', press, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  document.addEventListener('focusin', focusIn);
  document.addEventListener('focusout', focusOut);
  const animate = (time: number) => {
   frame = requestAnimationFrame(animate);
   if (document.hidden || time-lastPaint < 1000/30) return;
   const dt = Math.min((time-lastPaint)*.001, .05);
   lastPaint = time;
   const scroll = window.scrollY;
   const { progress, returnStrength } = journey();
   const ease = .07;
   uniforms.uJourney.value += (progress-uniforms.uJourney.value)*ease;
   uniforms.uReturn.value += (returnStrength-uniforms.uReturn.value)*ease;
   uniforms.uFocus.value += (focus-uniforms.uFocus.value)*ease;
   if (!motion.matches) {
    elapsed += dt;
    uniforms.uTime.value = elapsed;
    uniforms.uPointer.value.lerp(pointer, .07);
    uniforms.uTrail.value.lerp(uniforms.uPointer.value, .018);
    if (heroTitle && scroll < innerHeight*1.3) {
     heroTitle.style.setProperty('--type-x', `${(uniforms.uPointer.value.x*100).toFixed(2)}%`);
     heroTitle.style.setProperty('--type-y', `${((1-uniforms.uPointer.value.y)*100).toFixed(2)}%`);
    }
    uniforms.uFlow.value += (THREE.MathUtils.clamp((scroll-previousScroll)/80,-1,1)-uniforms.uFlow.value)*.12;
   }
   previousScroll = scroll;
   renderer.render(scene, camera);
  };
  // Match direct anchor visits and restored scroll positions before the first paint.
  const initial = journey();
  uniforms.uJourney.value = initial.progress;
  uniforms.uReturn.value = initial.returnStrength;
  renderer.render(scene, camera);
  setReady(true);
  frame = requestAnimationFrame(animate);
  return () => {
   cancelAnimationFrame(frame); observer.disconnect();
   window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', press);
   document.documentElement.removeEventListener('pointerleave', leave);
   document.removeEventListener('focusin', focusIn); document.removeEventListener('focusout', focusOut);
   heroTitle?.style.removeProperty('--type-x'); heroTitle?.style.removeProperty('--type-y');
   geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
 }, []);

 return <div className="immersive-backdrop" ref={root} aria-hidden="true"><div className={`ambient-fallback ${ready ? 'loaded' : ''}`}/></div>;
}
