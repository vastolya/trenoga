import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('../chronology');
const out = path.resolve('public/art/chronology');
await fs.mkdir(out, { recursive: true });
const groups = [];
for (const [groupIndex, name] of (await fs.readdir(source)).entries()) {
 const directory = path.join(source, name);
 if (!(await fs.stat(directory)).isDirectory()) continue;
 const files = (await fs.readdir(directory)).sort((a,b)=>a.localeCompare(b,'ru'));
 const images = [];
 for (const file of files.filter(file=>/\.(jpg|jpeg|webp|png)$/i.test(file))) {
  const index = images.length;
  const id = `g${groupIndex}-${String(index).padStart(2,'0')}`;
  const input = path.join(directory, file);
  const output = path.join(out, `${id}.webp`);
  const info = await sharp(input).rotate().resize({ width:2400,height:2200,fit:'inside',withoutEnlargement:true }).webp({quality:85}).toFile(output);
  images.push({id,file,src:`/art/chronology/${id}.webp`,width:info.width,height:info.height});
 }
 const text = files.find(file=>file.endsWith('.txt'));
 groups.push({name,description:text?(await fs.readFile(path.join(directory,text),'utf8')).trim():'',images});
 const tiles=[];
 for(const [i,img] of images.entries()){
  const thumb=await sharp(path.join(out,`${img.id}.webp`)).resize(290,220,{fit:'contain',background:'#e8e5dd'}).png().toBuffer();
  const x=(i%4)*300,y=Math.floor(i/4)*250;
  tiles.push({input:thumb,left:x,top:y});
  const label=Buffer.from(`<svg width="290" height="25"><text x="5" y="18" font-size="14">${img.id}</text></svg>`);
  tiles.push({input:label,left:x,top:y+222});
 }
 await sharp({create:{width:1200,height:Math.ceil(images.length/4)*250,channels:3,background:'#e8e5dd'}}).composite(tiles).jpeg({quality:85}).toFile(`chronology-${groupIndex}.jpg`);
}
await fs.writeFile('chronology-sources.json',JSON.stringify(groups,null,2)+'\n');
console.log(groups.map(g=>`${g.name}: ${g.images.length} images`).join('\n'));
