import fs from 'node:fs/promises';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import sharp from 'sharp';

const source=path.resolve('../ничего страшного');
const output=path.resolve('public/art/exhibition');
await fs.mkdir(output,{recursive:true});
const files=await fs.readdir(source);
const works=[];
async function save(id,title,input,meta={}){
 const info=await input.rotate().resize({width:2400,height:2200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toFile(path.join(output,`${id}.webp`));
 works.push({id,title,date:meta.date||'',medium:meta.medium||'Из серии «Ничего страшного»',...(meta.dimensions?{dimensions:meta.dimensions}:{}),layout:info.width/info.height>1.45?'wide':'large',images:[{id,src:`/art/exhibition/${id}.webp`,width:info.width,height:info.height}]});
}
// Two missing JPEG exports have a full-resolution RGB image embedded in their AI/PDF.
// Decode only the verified 8-bit, three-channel, unpredicted Flate image stream.
async function embeddedImage(file){
 const buffer=await fs.readFile(path.join(source,file)),text=buffer.toString('latin1');
 const index=text.indexOf('/Subtype/Image');
 if(index<0)throw Error(`No embedded image in ${file}`);
 const startObject=text.lastIndexOf(' obj',index),stream=text.indexOf('stream',index);
 const dictionary=text.slice(startObject,stream);
 const number=key=>Number(dictionary.match(new RegExp(`/${key}\\s+(\\d+)`))?.[1]);
 const width=number('Width'),height=number('Height'),length=number('Length');
 if(number('BitsPerComponent')!==8||!dictionary.includes('/Filter/FlateDecode')||dictionary.includes('/Predictor'))throw Error(`Unsupported image encoding in ${file}`);
 const start=text.indexOf('\n',stream)+1;
 const pixels=inflateSync(buffer.subarray(start,start+length));
 if(pixels.length!==width*height*3)throw Error(`Unexpected channel layout in ${file}`);
 return sharp(pixels,{raw:{width,height,channels:3}});
}
for(let n=1;n<=17;n++){
 const jpg=files.find(name=>name===`${n}-01.jpg`);
 const input=jpg?sharp(path.join(source,jpg)):await embeddedImage(`${n}.ai`);
 await save(`series-${n}`,`Ничего страшного / ${String(n).padStart(2,'0')}`,input);
}
await save('khorovod','Хоровод',sharp(path.join(source,files.find(name=>name.startsWith('«Хоровод»')))),{date:'2024',medium:'Холст, акрил, лак',dimensions:'150 × 300 см'});
await save('hearts','Сердцееды',sharp(path.join(source,files.find(name=>name.startsWith('серия «Сердцееды»')))),{date:'2024',medium:'Серия · Холст, акрил, лак',dimensions:'30 × 40 см'});
// The embedded AI images are alternate exports of these named works, not new works.
for(const [duplicateId,originalId] of [['series-1','hearts'],['series-17','khorovod']]){
 const index=works.findIndex(work=>work.id===duplicateId);
 const original=works.find(work=>work.id===originalId);
 original.images.push(...works[index].images);
 works.splice(index,1);
}
await fs.writeFile('app/exhibition-works.json',JSON.stringify(works,null,2)+'\n');
const tiles=[];
for(const [index,work] of works.entries()){
 const x=(index%5)*240,y=Math.floor(index/5)*220;
 const thumbnail=await sharp(path.join(output,`${work.id}.webp`)).resize(230,190,{fit:'contain',background:'#e8e5dd'}).png().toBuffer();
 tiles.push({input:thumbnail,left:x,top:y});
 tiles.push({input:Buffer.from(`<svg width="230" height="25"><text x="5" y="18" font-size="14">${work.id}</text></svg>`),left:x,top:y+192});
}
await sharp({create:{width:1200,height:Math.ceil(works.length/5)*220,channels:3,background:'#e8e5dd'}}).composite(tiles).jpeg({quality:85}).toFile('exhibition-contact.jpg');
console.log(`Prepared ${works.length} works with ${works.reduce((sum,work)=>sum+work.images.length,0)} images, including two alternate AI exports.`);
