(() => {
'use strict';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),screen=document.querySelector('.screen'),tv=document.querySelector('.tv'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),buttons=[...document.querySelectorAll('[data-channel]')],ids=buttons.map(b=>b.dataset.channel);
const colors=['#d5d4c9','#d7ce42','#43b8c0','#4bad55','#b34bb0','#c54540','#354eb7'];
const picture=new Image();picture.src='img/broadcast-tv-clean.png';picture.onload=()=>{draw();disturb()};
let strength=0,pointerY=.5,pointerX=.46,frame=0,last=0,active=0,reveal=0,revealUntil=0;
const mark=new Image(),markSvg=document.querySelector('.ntv-logo').cloneNode(true);
markSvg.querySelector('rect')?.remove();markSvg.setAttribute('viewBox','45 60 115 80');markSvg.setAttribute('width','460');markSvg.setAttribute('height','320');
mark.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(markSvg));
const revealLayer=document.createElement('canvas'),revealCtx=revealLayer.getContext('2d');
function revealMark(time,w,h){
 const target=time<revealUntil?1:0;reveal+=(target-reveal)*.16;
 if(reveal<.005||!mark.complete||!mark.naturalWidth)return;
 if(revealLayer.width!==w||revealLayer.height!==h){revealLayer.width=w;revealLayer.height=h}
 revealCtx.clearRect(0,0,w,h);revealCtx.globalCompositeOperation='source-over';
 revealCtx.drawImage(mark,w*.29,h*.29,w*.34,h*.35);
 const radius=w*.28,g=revealCtx.createRadialGradient(pointerX*w,pointerY*h,0,pointerX*w,pointerY*h,radius);
 g.addColorStop(0,'rgba(255,255,255,.46)');g.addColorStop(.45,'rgba(255,255,255,.29)');g.addColorStop(1,'rgba(255,255,255,0)');
 revealCtx.globalCompositeOperation='destination-in';revealCtx.fillStyle=g;revealCtx.fillRect(0,0,w,h);
 ctx.save();ctx.globalAlpha=reveal;ctx.globalCompositeOperation='screen';ctx.drawImage(revealLayer,0,0);ctx.restore();
}
function screenPath(w,h){ctx.beginPath();ctx.moveTo(w*.14,h*.15);ctx.bezierCurveTo(w*.32,h*.08,w*.65,h*.06,w*.77,h*.09);ctx.bezierCurveTo(w*.82,h*.11,w*.83,h*.18,w*.82,h*.32);ctx.lineTo(w*.81,h*.74);ctx.bezierCurveTo(w*.81,h*.80,w*.78,h*.81,w*.71,h*.81);ctx.lineTo(w*.17,h*.80);ctx.bezierCurveTo(w*.10,h*.79,w*.085,h*.75,w*.09,h*.65);ctx.lineTo(w*.095,h*.28);ctx.bezierCurveTo(w*.10,h*.20,w*.11,h*.17,w*.14,h*.15);ctx.closePath()}
function draw(time=performance.now()){
 const w=canvas.width,h=canvas.height;if(!ctx||!w||!h)return;
 ctx.clearRect(0,0,w,h);if(!picture.complete||!picture.naturalWidth)return;
 ctx.drawImage(picture,0,0,w,h);
 ctx.save();screenPath(w,h);ctx.clip();if(!reduced.matches){ctx.fillStyle=`rgba(0,0,0,${.018+.012*Math.sin(time*.008)+.007*Math.sin(time*.037)})`;ctx.fillRect(0,0,w,h)}
 const testOn=document.querySelector('.live').getAttribute('aria-pressed')==='true';if(!testOn)revealMark(time,w,h);
 if(testOn){ctx.fillStyle='#080c10e8';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w*.46,h*.44);ctx.rotate(-.035);ctx.textAlign='center';ctx.fillStyle='#f2f0e6';ctx.font=`bold ${w*.031}px Arial`;ctx.fillText('НЕ ПЕРЕКЛЮЧАЙТЕСЬ.',0,0);ctx.font=`${w*.019}px Arial`;ctx.fillStyle='#b6bfb9';ctx.fillText('Сейчас будет что-то интересное.',0,h*.065);ctx.fillStyle='#53cf76';ctx.font=`${w*.016}px monospace`;ctx.fillText('SPT × НТВ / ТЕСТОВЫЙ ЭФИР',0,-h*.085);ctx.restore()}
 if(!reduced.matches){
  const center=h*(.47+Math.sin(time*.00085)*.12), intensity=.25+strength*.65;
  for(let n=0;n<12;n++){
   const y=center+(Math.random()-.5)*h*.065, band=1+Math.random()*h*.009,shift=(Math.random()-.5)*w*.075*intensity;
   ctx.drawImage(canvas,0,y,w,band,shift,y,w,band);
   ctx.fillStyle=`rgba(160,255,239,${Math.random()*.26*intensity})`;ctx.fillRect(w*.09,y,w*.75,1);
  }
  if(strength>.05){for(let n=0;n<5;n++){const y=Math.max(h*.15,Math.min(h*.78,pointerY*h+(Math.random()-.5)*h*.12)),band=1+Math.random()*h*.012;ctx.drawImage(canvas,0,y,w,band,(Math.random()-.5)*w*.09*strength,y,w,band)}}
  for(let n=0;n<80;n++){ctx.fillStyle=`rgba(225,250,245,${Math.random()*.22})`;ctx.fillRect(w*.1+Math.random()*w*.71,center+(Math.random()-.5)*h*.07,Math.random()*9,1)}
 }
 ctx.restore();
}
function animate(time){frame=0;if(document.hidden||reduced.matches){draw(time);return}if(time-last>50){draw(time);strength*=.87;last=time}frame=requestAnimationFrame(animate)}
function disturb(){if(reduced.matches)return;strength=1;if(!frame)frame=requestAnimationFrame(animate)}
function locate(e){const r=screen.getBoundingClientRect();pointerX=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));pointerY=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));if(!reduced.matches){revealUntil=performance.now()+1100;disturb()}}
screen.addEventListener('pointermove',locate,{passive:true});screen.addEventListener('pointerdown',locate,{passive:true});screen.addEventListener('pointerleave',()=>{revealUntil=0});tv.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();pointerX=.46;pointerY=.46;revealUntil=performance.now()+1400;disturb()}});
function select(id,hash=true){const index=ids.indexOf(id);if(index<0)return;active=index;document.querySelectorAll('.channel').forEach(s=>s.hidden=s.id!==id);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.channel===id)));document.querySelector('#channel-number').textContent=String(index+1).padStart(2,'0');if(hash)history.replaceState(null,'','#'+id);const panel=document.getElementById(id);panel.classList.remove('tuning');void panel.offsetWidth;panel.classList.add('tuning');disturb()}
buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.channel)));document.querySelector('.brand').addEventListener('click',()=>select('team'));document.querySelector('nav').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(active+(e.key==='ArrowRight'?1:2))%3;select(ids[n]);buttons[n].focus()});
const live=document.querySelector('.live');live.addEventListener('click',()=>{const on=live.getAttribute('aria-pressed')!=='true';live.setAttribute('aria-pressed',String(on));live.setAttribute('aria-label',on?'Выключить тестовый эфир':'Включить тестовый эфир');document.querySelector('.test').hidden=!on;draw();disturb()});
const intro=document.querySelector('.tune-in');if(!reduced.matches){intro.classList.add('active');setTimeout(()=>intro.classList.remove('active'),1100)}
const start=Date.now();setInterval(()=>{if(document.hidden)return;const s=Math.floor((Date.now()-start)/1000);document.querySelector('.clock').textContent=[Math.floor(s/3600)%24,Math.floor(s/60)%60,s%60,0].map(v=>String(v).padStart(2,'0')).join(':')},1000);
new ResizeObserver(()=>{canvas.width=Math.round(Math.min(screen.clientWidth*devicePixelRatio,1000));canvas.height=Math.round(canvas.width/(screen.clientWidth/screen.clientHeight));draw()}).observe(screen);reduced.addEventListener('change',()=>{strength=0;draw();if(!reduced.matches&&!frame)frame=requestAnimationFrame(animate)});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!frame&&!reduced.matches)frame=requestAnimationFrame(animate)});select(ids.includes(location.hash.slice(1))?location.hash.slice(1):'team',false);window.addEventListener('hashchange',()=>select(location.hash.slice(1)||'team',false));
})();

// Optional broadcast tone: only starts after the visitor presses the sound button.
(() => {
 const button=document.querySelector('.sound');
 let context,oscillator,gain,enabled=false,busy=false;
 function render(){button.setAttribute('aria-pressed',String(enabled));button.textContent=enabled?'ЗВУК: ВКЛ':'ЗВУК: ВЫКЛ';button.setAttribute('aria-label',enabled?'Выключить тихий тон ГЦП':'Включить тихий тон ГЦП')}
 function volume(){if(!context||!gain)return;gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(enabled&&!document.hidden?.012:0,context.currentTime,.08)}
 button.addEventListener('click',async()=>{
  if(busy)return;busy=true;
  try{
   if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');context=new Audio();oscillator=context.createOscillator();gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=1000;gain.gain.value=0;oscillator.connect(gain);gain.connect(context.destination);oscillator.start()}
   if(!enabled)await context.resume();enabled=!enabled;volume();render();
  }catch{enabled=false;render();button.textContent='ЗВУК НЕДОСТУПЕН';button.setAttribute('aria-label','Звук недоступен в этом браузере')}
  finally{busy=false}
 });
 document.addEventListener('visibilitychange',volume);
 window.addEventListener('pagehide',()=>{enabled=false;volume();render()});
})();

// A small RGB registration reticle trails the ordinary pointer.
(() => {
 const light=document.querySelector('.cursor-light');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 let x=0,y=0,currentX=0,currentY=0,frame=0,visible=false;
 function step(){frame=0;if(!visible||motion.matches||!fine.matches)return;currentX+=(x-currentX)*.13;currentY+=(y-currentY)*.13;light.style.transform=`translate3d(${currentX}px,${currentY}px,0)`;if(Math.abs(x-currentX)+Math.abs(y-currentY)>.3)frame=requestAnimationFrame(step)}
 window.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||motion.matches||!fine.matches)return;x=e.clientX;y=e.clientY;if(!visible){currentX=x;currentY=y;visible=true}light.classList.add('visible');if(!frame)frame=requestAnimationFrame(step)},{passive:true});
 function hide(){visible=false;light.classList.remove('visible');if(frame)cancelAnimationFrame(frame);frame=0}
 document.documentElement.addEventListener('pointerleave',hide);window.addEventListener('blur',hide);motion.addEventListener('change',hide);fine.addEventListener('change',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
})();
