'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import ExhibitionEssay from './ExhibitionEssay';
import ChapterHeading from './ChapterHeading';
import ReactiveText from './ReactiveText';
import Archive from './Archive';
import CopperTear from './CopperTear';
import Header from './Header';
import { exhibitionWorks, type Artwork } from './chronology';
import WorkDialog from './WorkDialog';
const Scene=dynamic(()=>import('./Scene'),{ssr:false});

export default function Home(){
 const [selected,setSelected]=useState<Artwork|null>(null);
 const open=(artwork:Artwork)=>setSelected(artwork);
 return <>
  <Scene/>
  <Header/>
  <main>
   <section className="hero">
    <h1><ReactiveText text={'МАША\nТРЕНОГА'} textured/></h1>
   </section>
   <Archive open={open}/>
   <section className="story section" id="story" aria-labelledby="story-title">
    <ChapterHeading chapter={{id:'story',period:'2024',title:'Ничего страшного',description:''}}><p className="exhibition-kind">Персональная выставка</p><ExhibitionEssay/></ChapterHeading>
    <div className="series-works">{exhibitionWorks.map(artwork=><button className={artwork.layout==='wide'?'series-wide':undefined} key={artwork.id} onClick={()=>open(artwork)} aria-label={`Рассмотреть ${artwork.title}`}><img src={artwork.images[0].src} alt={artwork.title} width={artwork.images[0].width} height={artwork.images[0].height} loading="lazy" decoding="async"/><span>{artwork.title}</span></button>)}</div>
   </section>
   <section className="about section" id="about" aria-label="Художница и портфолио">
    <div className="about-grid">
     <div className="about-photo"><img src="/art/artist.jpg" alt="Маша Тренога, чёрно-белый портрет художницы" loading="lazy"/></div>
     <a className="about-portfolio" href="/portfolio.pdf" target="_blank" rel="noopener noreferrer" aria-label="Открыть портфолио Маши Треноги в новой вкладке" draggable={false}>
      <CopperTear idle/>
     </a>
    </div>
   </section>
   <footer className="archive-footer" id="contact">
    <div className="footer-identity"><span><ReactiveText text="Маша Тренога"/></span><small><ReactiveText text="© 2026"/></small></div>
    <nav className="footer-contacts" aria-label="Контакты художницы"><a href="https://t.me/mashatrenoga" target="_blank" rel="noopener noreferrer"><ReactiveText text="Telegram"/></a><a href="https://www.instagram.com/trenoga/" target="_blank" rel="noopener noreferrer"><ReactiveText text="Instagram"/></a></nav>
   </footer>
  </main>
  {selected&&<WorkDialog key={selected.id} artwork={selected} onClose={()=>setSelected(null)}/>}
 </>;
}
