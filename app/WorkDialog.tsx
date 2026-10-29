'use client';
import { useEffect, useRef, useState } from 'react';
import type { Artwork } from './chronology';

export default function WorkDialog({artwork,onClose}:{artwork:Artwork;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const thumbs=useRef<HTMLDivElement>(null);
 const [photo,setPhoto]=useState(0);
 const count=artwork.images.length;
 const image=artwork.images[photo];
 const step=(direction:number)=>setPhoto(value=>(value+direction+count)%count);
 useEffect(()=>{
  const host=dialog.current!;
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  host.showModal();
  return()=>{host.close();document.body.style.overflow=old};
 },[]);
 useEffect(()=>{
  const strip=thumbs.current;
  const active=strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if(!strip||!active)return;
  const left=active.offsetLeft;
  let target=strip.scrollLeft;
  if(left<target)target=left;
  else if(left+active.offsetWidth>target+strip.clientWidth)target=left+active.offsetWidth-strip.clientWidth;
  strip.scrollTo({left:target,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },[photo]);
 return <dialog className="work-dialog" ref={dialog} aria-labelledby="work-dialog-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}} onKeyDown={e=>{
  if(count<2)return;
  if(e.key==='ArrowRight'){e.preventDefault();step(1)}
  if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
 }}>
  <button className="close" onClick={onClose} aria-label="Закрыть">✕</button>
  <div className={`work-gallery${count>1?' has-thumbnails':''}`}>
   <div className="work-gallery-image"><img src={image.src} alt={`${artwork.title}${count>1?`, снимок ${photo+1}`:''}`} decoding="async"/></div>
   {count>1&&<div className="work-thumbnails" ref={thumbs} role="group" aria-label={`Фотографии работы «${artwork.title}»`}>{artwork.images.map((item,index)=><button key={item.id} type="button" aria-label={`Снимок ${index+1} из ${count}`} aria-pressed={photo===index} onClick={()=>setPhoto(index)}><img src={item.src} alt="" width={item.width} height={item.height} loading="lazy" decoding="async"/></button>)}</div>}
   <div className="work-gallery-bottom"><div className="work-gallery-caption"><h3 id="work-dialog-title">{artwork.title}</h3><p>{[artwork.date,artwork.medium,artwork.dimensions].filter(Boolean).join(' · ')}</p></div>{count>1&&<div className="work-gallery-controls"><button onClick={()=>step(-1)} aria-label="Предыдущий снимок этой работы">←</button><span aria-live="polite" aria-atomic="true">{photo+1} / {count}</span><button onClick={()=>step(1)} aria-label="Следующий снимок этой работы">→</button></div>}</div>
  </div>
 </dialog>;
}
