'use client';
import { useEffect, useRef } from 'react';
import CopperTear from './CopperTear';

export default function Header(){
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{
  const header=root.current!;
  let previous=Math.max(0,window.scrollY),direction=0,travel=0,frame=0;
  const update=()=>{
   frame=0;
   const y=Math.max(0,window.scrollY),delta=y-previous;
   header.dataset.scrolled=String(y>24);
   if(y<90){header.dataset.hidden='false';travel=0}
   else if(delta!==0){
    const nextDirection=Math.sign(delta);
    travel=nextDirection===direction?travel+Math.abs(delta):Math.abs(delta);
    direction=nextDirection;
    const keyboardFocus=header.contains(document.activeElement)&&document.activeElement?.matches(':focus-visible');
    if(keyboardFocus)header.dataset.hidden='false';
    else if(direction<0&&travel>=4)header.dataset.hidden='false';
    else if(direction>0&&travel>=12)header.dataset.hidden='true';
   }
   previous=y;
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();window.addEventListener('scroll',scroll,{passive:true});
  return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame)};
 },[]);
 return <header className="site-header" ref={root} data-hidden="false" onFocusCapture={()=>{root.current!.dataset.hidden='false'}}>
  <a className="tear-home" href="/portfolio.pdf" target="_blank" rel="noopener noreferrer" aria-label="Открыть портфолио Маши Треноги в новой вкладке" title="Открыть портфолио" draggable={false}><CopperTear/></a>
  <nav aria-label="Основная навигация"><a href="#works">Работы</a><a href="#story">Серии</a><a href="#about">Автор</a></nav>
 </header>;
}
