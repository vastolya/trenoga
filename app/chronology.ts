import sources from '../chronology-sources.json';
import exhibition from './exhibition-works.json';

export type ArtImage = { id:string; src:string; width:number; height:number; file?:string };
export type Artwork = { id:string; title:string; date:string; medium:string; dimensions?:string; layout:'wide'|'large'|'small'; images:ArtImage[] };
export type Chapter = { id:string; period:string; title:string; description:string; works:Artwork[] };
const images = new Map(sources.flatMap(group=>group.images).map(image=>[image.id,image]));
const image = (id:string):ArtImage => {
 const result=images.get(id);
 if(!result) throw new Error(`Missing chronology image: ${id}`);
 return result;
};
const work=(id:string,title:string,date:string,medium:string,ids:string[],layout:Artwork['layout']='small',dimensions?:string):Artwork=>({id,title,date,medium,images:ids.map(image),layout,dimensions});

export const chapters:Chapter[]=[
 {id:'year-2025',period:'2025',title:'Фреска',description:sources[3].description,works:[
  work('biennale','Машинерия','2025','Музей · Фреска',['g3-01','g3-02','g3-03','g3-04','g3-05','g3-00'],'wide'),
 ]},
 {id:'street-2021-2024',period:'2021—2024',title:'Улица',description:sources[2].description,works:[
  work('fast-forward','Очень быстро едем вперёд','2024','Фасадная краска, аэрозоль',['g2-07','g2-10','g2-11'],'wide','230 × 360 см'),
  work('hibernation','Спячка','2024','Уличная работа',['g2-08'],'large'),
  work('thistle','Оберег Чертополох','2023','Фасадная краска',['g2-06','g2-04','g2-05'],'large','12 × 15 м'),
  work('street-nothing-extra','Ничего лишнего','2021—2024','Фасадная краска',['g2-03','g2-00'],'small'),
  work('street-composition','Уличная композиция','2021—2024','Общий вид и процесс',['g2-09','g2-02'],'large'),
  work('street-process','Работа над росписью','2021—2024','Документация процесса',['g2-01'],'small'),
 ]},
 {id:'prints-2021-2024',period:'2021—2024',title:'Линогравюра',description:sources[1].description,works:[
  work('kolobok','Колобок','2024','Линогравюра',['g1-02'],'large','10 × 15 см'),
  work('nota','Нота','2024','Линогравюра',['g1-05'],'small','10 × 15 см'),
  work('break','Перерыв','2024','Линогравюра',['g1-06'],'large','14 × 21 см'),
  work('kolobok-death','Смерть колобка','2024','Линогравюра',['g1-08'],'small','14 × 21 см'),
  work('safe-place','Безопасное место','2023','Линогравюра',['g1-00'],'small'),
  work('campfire','У костра','2023','Линогравюра',['g1-09'],'large'),
  work('sorcerer','Колдун','2022','Линогравюра',['g1-01'],'large','14 × 21 см'),
  work('mother','Мама','2022','Линогравюра',['g1-03'],'small'),
  work('print-nothing-extra','Ничего лишнего','2022','Линогравюра',['g1-04'],'large'),
  work('fatigue','Усталость','2022','Линогравюра',['g1-10'],'small'),
  work('smoking','Сижу, курю','2021','Линогравюра',['g1-07'],'large'),
 ]},
 {id:'early-2018-2021',period:'2018—2021',title:'Ранние работы',description:sources[0].description,works:[
  work('fabrika','Бар Фабрика','2021','Зарисовка',['g0-00'],'large'),
  work('kazak','Портрет Владимира Казака','2021','Фабрика · Зарисовка',['g0-05'],'small'),
  work('faces-two','Лица 2','2019','Графика',['g0-04'],'small'),
  work('faces-one','Лица 1','2018—2021','Графика',['g0-03'],'wide'),
  work('sharp-question','Вопрос стоит остро','2018—2021','Графика',['g0-02'],'large'),
  work('workshop','В мастерской','2018—2021','Зарисовка',['g0-01'],'large'),
  work('friend-steals','Приятель ворует','2018—2021','Графика',['g0-06'],'small'),
  work('friend-leaves','Приятель уходит','2018—2021','Графика',['g0-07'],'large'),
  work('student','Ученик','2018—2021','Зарисовка',['g0-08'],'small'),
 ]},
];

const orderedExhibition=[...exhibition.filter(artwork=>artwork.id==='khorovod'),...exhibition.filter(artwork=>artwork.id!=='khorovod')];
export const exhibitionWorks:Artwork[]=orderedExhibition.map((artwork,index)=>({...artwork,title:artwork.id==='khorovod'?'Хоровод':`${String(index+1).padStart(2,'0')} / ${String(orderedExhibition.length).padStart(2,'0')}`,layout:artwork.layout as Artwork['layout']}));
export const allWorks=[...chapters.flatMap(chapter=>chapter.works),...exhibitionWorks];
