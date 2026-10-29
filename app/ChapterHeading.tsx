import type { Chapter } from './chronology';
import type { ReactNode } from 'react';

export default function ChapterHeading({chapter,children}:{chapter:Pick<Chapter,'id'|'period'|'title'|'description'>;children?:ReactNode}){
 const description=chapter.description.charAt(0).toUpperCase()+chapter.description.slice(1)+'.';
 return <div className="chapter-heading">
  <span className="chapter-period">{chapter.period}</span>
  <div><h2 id={`${chapter.id}-title`}>{chapter.title}</h2>{children??<p>{description}</p>}</div>
 </div>;
}
