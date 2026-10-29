// The fill blends with the live background; the fine outline stays independent.
// The decorative copy is hidden from assistive technology and cannot receive input.
export default function ReactiveText({ text, textured = false }: { text: string; textured?: boolean }) {
 if(textured)return <span className="reactive-type reactive-type-textured"><span className="reactive-type-patina">{text.split('\n').map((line,index)=><span className="reactive-type-line" key={index}>{line}</span>)}</span></span>;
 return <span className="reactive-type"><span className="reactive-type-fill">{text}</span><span className="reactive-type-edge" aria-hidden="true">{text}</span></span>;
}
