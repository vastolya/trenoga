'use client';
import { useEffect, useId, useRef, useState } from 'react';
import exhibition from './exhibition.json';

const paragraphs=exhibition.trim().split(/\r?\n\s*\r?\n/).map(text=>text.replace(/\s+/g,' ').trim());

export default function ExhibitionEssay(){
 const [expanded,setExpanded]=useState(false);
 const id=useId();
 const content=useRef<HTMLDivElement>(null);
 const [height,setHeight]=useState({full:0,preview:70.2});
 useEffect(()=>{
  const host=content.current!;
  const measure=()=>{
   const first=host.querySelector('p')!;
   const full=host.scrollHeight,preview=Math.min(full,parseFloat(getComputedStyle(first).lineHeight)*3);
   setHeight(previous=>previous.full===full&&previous.preview===preview?previous:{full,preview});
  };
  const observer=new ResizeObserver(measure);observer.observe(host);measure();
  return()=>observer.disconnect();
 },[]);
 const toggle=()=>setExpanded(value=>!value);
 return <article className="exhibition-essay" data-expanded={expanded} role="button" tabIndex={0} aria-label={expanded?'Свернуть текст выставки «Ничего страшного»':'Раскрыть текст выставки «Ничего страшного»'} aria-expanded={expanded} aria-controls={id}
  onClick={()=>{if(window.getSelection()?.isCollapsed!==false)toggle()}}
  onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}}}>
  <div className="exhibition-text-viewport" style={{height:expanded?height.full:height.preview}}><div ref={content} id={id}>{paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></div>
 </article>;
}
