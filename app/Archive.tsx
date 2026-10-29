'use client';
import { Fragment } from 'react';
import { chapters, type Artwork } from './chronology';
import ChapterHeading from './ChapterHeading';

export default function Archive({open}:{open:(artwork:Artwork,photo?:number)=>void}){
 return <section className="archive chronology" id="works">
  <nav className="chronology-index" aria-label="Периоды и группы работ">{chapters.map((chapter,index)=><Fragment key={chapter.id}>{index===1&&<a href="#story"><span className="index-period">2024</span><span className="index-title">Ничего страшного</span></a>}<a href={`#${chapter.id}`}><span className="index-period">{chapter.period}</span><span className="index-title">{chapter.title}</span></a></Fragment>)}</nav>
  {chapters.map((chapter,chapterIndex)=><section className={`archive-year chapter chapter-${chapterIndex}`} id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
   <ChapterHeading chapter={chapter}/>
   <div className="chronology-flow">{chapter.works.map((artwork,index)=>{
    const cover=artwork.images[0];
    return <article className={`chrono-piece chrono-${artwork.layout} rhythm-${index%4}`} key={artwork.id}>
     <button className="chrono-cover" onClick={()=>open(artwork)} aria-label={`Рассмотреть: ${artwork.title}`}>
      <figure><div className="piece-image"><img src={cover.src} alt={artwork.title} width={cover.width} height={cover.height} loading="lazy" decoding="async"/></div>
       <figcaption className="piece-caption"><div className="piece-description"><h3>{artwork.title}</h3></div>{chapter.id==='prints-2021-2024'&&artwork.dimensions&&<div className="piece-size"><span>{artwork.dimensions}</span></div>}</figcaption>
      </figure>
     </button>
    </article>
   })}</div>
  </section>)}
 </section>
}
