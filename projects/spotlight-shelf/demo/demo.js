/* Images: dark + lit versions of the SAME generated scene (Higgsfield / Nano Banana Pro).
   Swap these for local files once downloaded into ./media/ */
const DARK='media/scene-0.jpg';
const LIT ='media/scene-1.jpg';
/* Bottle hit areas as fractions of the image (x,y = centre; w,h = size). Tune by eye. */
const P=[
 {n:'Ambre Haute', notes:'Amber, smoked vanilla', x:.205,y:.53,w:.06,h:.27, prices:[['50 ml',180],['100 ml',260]]},
 {n:'Rose Givre',  notes:'Frosted rose, musk',   x:.348,y:.56,w:.085,h:.21,prices:[['50 ml',165],['100 ml',240]]},
 {n:'Fumée',       notes:'Smoke, vetiver, iron',  x:.502,y:.55,w:.09,h:.23, prices:[['50 ml',210],['100 ml',300]]},
 {n:'Bleu Atelier',notes:'Sea salt, iris',        x:.654,y:.55,w:.07,h:.24, prices:[['50 ml',150],['100 ml',220]]},
 {n:'Forêt',       notes:'Fig leaf, cedar',       x:.80, y:.54,w:.075,h:.27,prices:[['50 ml',195],['100 ml',280]]},
];
const CLOSE={0: "media/scene-2.jpg", 2: "media/scene-4.jpg", 4: "media/scene-3.jpg"};
const $=s=>document.querySelector(s), stage=$('#stage'), lit=$('#lit');
$('#dark').src=DARK; lit.src=LIT;
let open=-1;
P.forEach((p,i)=>{
  const h=document.createElement('div');h.className='hit';
  Object.assign(h.style,{left:(p.x-p.w/2)*100+'%',top:(p.y-p.h/2)*100+'%',width:p.w*100+'%',height:p.h*100+'%'});
  h.setAttribute('role','button');h.setAttribute('aria-label',p.n);
  h.onmouseenter=()=>{if(open<0)light(i)}; h.onmouseleave=()=>{if(open<0)light(-1)};
  h.onclick=()=>zoom(i); stage.appendChild(h);
});
/* Light only the hovered bottle: clip the lit layer to a soft cone above that bottle */
function light(i){
  if(i<0){lit.classList.remove('on');return}
  const p=P[i], l=(p.x-p.w*0.9)*100, r=(p.x+p.w*0.9)*100, b=(p.y+p.h/2+.04)*100;
  lit.style.clipPath=`polygon(${(p.x-p.w*.25)*100}% 0%, ${(p.x+p.w*.25)*100}% 0%, ${r}% ${b}%, ${l}% ${b}%)`;
  lit.classList.add('on');
}
function zoom(i){
  open=i; light(i); const p=P[i], k=3.2;
  const dx=(.5-p.x)*100, dy=(.5-p.y)*100;
  stage.style.transform=`translate(-50%,-50%) scale(${k}) translate(${dx}%,${dy}%)`;
  setTimeout(()=>card(p),650);
  if(CLOSE[i]){const c=$('#close');c.src=CLOSE[i];setTimeout(()=>c.style.opacity=1,700);}   /* card appears halfway through the zoom */
  $('#back').classList.add('show');
}
function card(p){
  $('#cname').textContent=p.n; $('#cnotes').textContent=p.notes;
  const s=$('#sizes'); s.innerHTML='';
  p.prices.forEach(([ml,pr],j)=>{const b=document.createElement('button');b.textContent=`${ml} · $${pr}`;if(!j)b.className='sel';b.onclick=()=>{[...s.children].forEach(c=>c.className='');b.className='sel'};s.appendChild(b)});
  $('#card').classList.add('show');
}
$('#back').onclick=()=>{open=-1;$('#close').style.opacity=0;$('#card').classList.remove('show');$('#back').classList.remove('show');stage.style.transform='translate(-50%,-50%)';light(-1)};
addEventListener('keydown',e=>{if(e.key==='Escape'&&open>=0)$('#back').click()});
