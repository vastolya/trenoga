'use client';
import { useEffect, useId, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Deterministic wear: the same scratches survive every mount and navigation.
function wornCopper() {
 const color=document.createElement('canvas'),roughness=document.createElement('canvas');
 color.width=color.height=roughness.width=roughness.height=512;
 const c=color.getContext('2d')!,r=roughness.getContext('2d')!;
 c.fillStyle='#b4704d';c.fillRect(0,0,512,512);
 r.fillStyle='#b0b0b0';r.fillRect(0,0,512,512);
 let seed=371;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<14000;i++){
  const x=random()*512,y=random()*512,shade=random()>0.5?255:20;
  c.fillStyle=`rgba(${shade},${shade*.73},${shade*.5},${random()*.035})`;c.fillRect(x,y,1+random()*2,1+random()*2);
  const gray=Math.floor(150+random()*55);r.fillStyle=`rgb(${gray},${gray},${gray})`;r.fillRect(x,y,2,2);
 }
 for(let i=0;i<280;i++){
  const x=random()*512,y=random()*512,length=3+random()*38;
  const endX=x+length,endY=y+(random()-.5)*length*.65;
  for(const ctx of [c,r]){
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(endX,endY);ctx.lineWidth=.4+random()*.65;
   ctx.strokeStyle=ctx===c?(i%3===0?'rgba(123,77,46,.16)':'rgba(225,176,123,.3)'):'rgba(115,115,115,.55)';ctx.stroke();
  }
 }
 // A few faint scuffs soften the polished copper without dark stains.
 for(let i=0;i<12;i++){
  const x=random()*512,y=random()*512;
  c.save();c.translate(x,y);c.rotate(-.4+random()*.3);
  c.fillStyle='rgba(212,164,117,.10)';c.fillRect(0,0,10+random()*35,1+random()*4);c.restore();
 }
 for(let i=0;i<250;i++){
  const x=random()*512,y=random()*512,size=.5+random()*1.8;
  r.fillStyle='#c8c8c8';r.fillRect(x,y,size,size);
 }
 const map=new THREE.CanvasTexture(color);map.colorSpace=THREE.SRGBColorSpace;
 const relief=new THREE.CanvasTexture(roughness);
 return {map,relief};
}

export default function CopperTear({idle=false}:{idle?:boolean}){
 const fallbackId=useId().replace(/:/g,'');
 const root=useRef<HTMLSpanElement>(null);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const host=root.current!;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true})}catch{return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,20);camera.position.set(0,.12,5.4);
  const environmentScene=new RoomEnvironment();
  const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(environmentScene,.04);
  scene.environment=environment.texture;
  const profile=[
   new THREE.CubicBezierCurve(new THREE.Vector2(0,-1.12),new THREE.Vector2(.48,-1.12),new THREE.Vector2(.73,-.65),new THREE.Vector2(.61,-.2)),
   new THREE.CubicBezierCurve(new THREE.Vector2(.61,-.2),new THREE.Vector2(.49,.25),new THREE.Vector2(.08,.88),new THREE.Vector2(0,1.3)),
  ];
  const points=[...profile[0].getPoints(35),...profile[1].getPoints(45).slice(1)];
  const geometry=new THREE.LatheGeometry(points,64);
  const {map,relief}=wornCopper();
  const material=new THREE.MeshPhysicalMaterial({map,roughnessMap:relief,bumpMap:relief,bumpScale:.028,metalness:.9,roughness:.92,envMapIntensity:.8,clearcoat:0});
  const tear=new THREE.Mesh(geometry,material);tear.rotation.set(.12,-.45,-.15);tear.scale.z=.82;scene.add(tear);
  const key=new THREE.DirectionalLight('#ffe5c3',2.5);key.position.set(-2,3,4);scene.add(key);
  const rim=new THREE.DirectionalLight('#fff4e4',1.1);rim.position.set(3,1,-2);scene.add(rim);
  const fill=new THREE.HemisphereLight('#eee3d1','#25120a',1.2);scene.add(fill);
  const resize=()=>{renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix()};
  resize();const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const target=new THREE.Vector2();
  const move=(e:PointerEvent)=>{
   target.set(THREE.MathUtils.clamp(e.clientX/innerWidth-.5,-.5,.5),THREE.MathUtils.clamp(e.clientY/innerHeight-.5,-.5,.5));
  };
  const reset=()=>target.set(0,0);
  const focus=()=>target.set(.12,-.08);
  const release=(e:PointerEvent)=>{if(e.pointerType==='touch')reset()};
  const link=host.closest('a')!;
  let hovered=false,focused=false,idleWeight=1;
  const enter=()=>{hovered=true};
  const leave=()=>{hovered=false};
  const focusIdle=()=>{focused=true};
  const blurIdle=()=>{focused=false};
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('pointerup',release,{passive:true});
  window.addEventListener('pointercancel',reset,{passive:true});
  window.addEventListener('blur',reset);
  document.documentElement.addEventListener('pointerleave',reset);
  link.addEventListener('focus',focus);link.addEventListener('blur',reset);
  link.addEventListener('pointerenter',enter);link.addEventListener('pointerleave',leave);
  link.addEventListener('focus',focusIdle);link.addEventListener('blur',blurIdle);
  let visible=true,frame=0,last=-100,elapsed=0;
  const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting});visibility.observe(host);
  const render=(time:number)=>{
   frame=requestAnimationFrame(render);
   if(!visible||document.hidden||time-last<1000/30)return;
   const dt=Math.min((time-last)*.001,.05);last=time;
   if(!motion.matches){
    elapsed+=dt;
    const ease=1-Math.exp(-4.5*dt);
    idleWeight+=((hovered||focused?0:1)-idleWeight)*ease;
    const phase=(elapsed%13-.8)/10.8;
    const progress=THREE.MathUtils.clamp(phase,0,1);
    const envelope=idle?Math.sin(progress*Math.PI)**4*idleWeight:0;
    const sway=Math.sin(progress*Math.PI*2)*envelope;
    tear.rotation.y+=(-.45+target.x*1.8+sway*.8-tear.rotation.y)*ease;
    tear.rotation.x+=(.12+target.y*.9+envelope*.18-tear.rotation.x)*ease;
    tear.rotation.z+=(-.15-target.x*.1+sway*.4-tear.rotation.z)*ease;
    tear.position.x=sway*.07;
    tear.position.y=Math.sin(elapsed*.45)*.012+envelope*.22;
    tear.scale.set(1-envelope*.025,1+envelope*.035,.82);
   }else{tear.rotation.set(.12,-.45,-.15);tear.position.set(0,0,0);tear.scale.set(1,1,.82)}
   renderer.render(scene,camera);
  };
  renderer.render(scene,camera);setReady(true);frame=requestAnimationFrame(render);
  return()=>{
   cancelAnimationFrame(frame);resizeObserver.disconnect();visibility.disconnect();
   window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',reset);
   window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',reset);window.removeEventListener('blur',reset);
   link.removeEventListener('focus',focus);link.removeEventListener('blur',reset);
   link.removeEventListener('pointerenter',enter);link.removeEventListener('pointerleave',leave);
   link.removeEventListener('focus',focusIdle);link.removeEventListener('blur',blurIdle);
   geometry.dispose();material.dispose();map.dispose();relief.dispose();environment.dispose();pmrem.dispose();environmentScene.dispose();renderer.dispose();renderer.domElement.remove();
  };
 },[idle]);
 return <span className="copper-tear" ref={root} aria-hidden="true" data-ready={ready}><svg className="tear-fallback" viewBox="0 0 64 80"><defs><linearGradient id={fallbackId} x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#3d2013"/><stop offset=".4" stopColor="#dfac79"/><stop offset=".65" stopColor="#a65c35"/><stop offset="1" stopColor="#59301c"/></linearGradient></defs><path d="M33 4C32 24 12 40 12 55a21 21 0 0 0 42 0C54 38 36 24 33 4Z" fill={`url(#${fallbackId})`}/></svg></span>;
}
