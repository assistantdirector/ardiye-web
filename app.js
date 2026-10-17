(()=>{'use strict';
const API={};
const root=document.documentElement,$=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
function mode(m,save){root.dataset.mode=m;$$('.mode button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));$$('.mode-word').forEach(e=>e.textContent=m);if(save){try{localStorage.setItem('ardiye-mode',m)}catch(e){}}if(m==='draft')requestAnimationFrame(()=>dispatchEvent(new Event('ardiye-mode')))}

/* ===== COLOUR SCHEME ===== */
const SCH=['bauhaus','blue','yellow','black','red','ultra'];let colors={ink:'17,17,17',sel:'201,37,27',sel2:'30,63,160'};
function hexRgb(h){const m=/^#?([0-9a-f]{6})$/i.exec(h);if(!m)return null;const n=parseInt(m[1],16);return (n>>16)+','+((n>>8)&255)+','+(n&255)}
function readColors(){const cs=getComputedStyle(root);colors.ink=cs.getPropertyValue('--ink-rgb').trim()||colors.ink;colors.sel=cs.getPropertyValue('--sel-rgb').trim()||colors.sel;colors.sel2=hexRgb(cs.getPropertyValue('--sel2').trim())||colors.sel;const tc=$('meta[name=theme-color]');if(tc)tc.content=cs.getPropertyValue('--bg').trim()}
function scheme(n,save){n==='bauhaus'?delete root.dataset.scheme:root.dataset.scheme=n;const b=$('#scheme');if(b)b.lastElementChild.textContent=n;readColors();window.dispatchEvent(new Event('ardiye-scheme'));if(save){try{localStorage.setItem('ardiye-scheme',n)}catch(e){}}}
$('#scheme')&&$('#scheme').addEventListener('click',()=>nextScheme());

/* ===== DRAFT / FINAL MODE ===== */
$$('.mode button').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode,true)));

/* ===== SELECTION, DRAG, NUDGE ===== */
const sels=$$('.sel');let cur=null;const resetBtn=$('#reset');
sels.forEach((el,i)=>{el._id=i;el._dx=0;el._dy=0;const t=document.createElement('span');t.className='tagl';t.textContent=el.dataset.name||'frame';t.setAttribute('aria-hidden','true');const d=document.createElement('span');d.className='dim';d.setAttribute('aria-hidden','true');el.append(t,d)});
const sgn=n=>(n>=0?'+':'')+n;
function dims(){sels.forEach(el=>{const r=el.getBoundingClientRect(),d=el.lastElementChild;if(d)d.textContent=Math.round(r.width)+' × '+Math.round(r.height)+((el._dx||el._dy)?'  ·  '+sgn(el._dx)+', '+sgn(el._dy):'')})}
function moved(){const any=sels.some(e=>e._dx||e._dy);if(resetBtn)resetBtn.hidden=!any}
function setPos(el,dx,dy){el._dx=Math.round(dx);el._dy=Math.round(dy);el.style.setProperty('--dx',el._dx+'px');el.style.setProperty('--dy',el._dy+'px');moved();dims()}
addEventListener('ardiye-mode',()=>dims());
let onSel=()=>{};
function select(el){if(cur===el)return;cur&&cur.classList.remove('on');cur=el;el&&el.classList.add('on');dims();onSel(el)}
sels.forEach(el=>el.addEventListener('pointerdown',e=>{
 if(root.dataset.mode!=='draft'||e.button!==0)return;select(el);if(!fine)return;e.preventDefault();
 const sx=e.clientX,sy=e.clientY,ox=el._dx,oy=el._dy;let mv=false;
 const move=ev=>{if(!mv&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;mv=true;el.classList.add('drag');let dx=ox+ev.clientX-sx,dy=oy+ev.clientY-sy;if(Math.abs(dx)<8)dx=0;if(Math.abs(dy)<8)dy=0;setPos(el,dx,dy)};
 const up=()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up);el.classList.remove('drag');
  if(mv){commit();const h=ev=>{ev.preventDefault();ev.stopPropagation()};addEventListener('click',h,true);setTimeout(()=>removeEventListener('click',h,true),0)}};
 addEventListener('pointermove',move);addEventListener('pointerup',up)}));
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.sel,.mode,.reset'))select(null)});
resetBtn&&resetBtn.addEventListener('click',()=>{sels.forEach(e=>setPos(e,0,0));sels.forEach(e=>{e.style.removeProperty('--dx');e.style.removeProperty('--dy')});moved();commit()});
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key,tag=(document.activeElement||{}).tagName;if(/INPUT|TEXTAREA|SELECT/.test(tag))return;
 if(k==='d'||k==='D'){mode('draft',true);return}if(k==='f'||k==='F'){mode('final',true);return}
 if(root.dataset.mode!=='draft'||!cur)return;
 if(k==='Escape'){select(null);return}
 const st=e.shiftKey?10:1,m={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[k];
 if(m&&(!tag||tag==='BODY')){e.preventDefault();setPos(cur,cur._dx+m[0],cur._dy+m[1]);commitSoon()}});
if('ResizeObserver' in window){const ro=new ResizeObserver(dims);sels.forEach(e=>ro.observe(e))}else addEventListener('resize',dims);
// layers toggle words in the manifesto
$$('.lyr').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);$$('[data-w="'+b.dataset.l+'"]').forEach(w=>w.classList.toggle('off',!on))}));
mode(root.dataset.mode==='final'?'final':'draft',false);addEventListener('load',dims);readColors();$('#scheme')&&($('#scheme').lastElementChild.textContent=root.dataset.scheme||'bauhaus');
const hero=$('.hero h1.sel');if(hero&&root.dataset.mode==='draft'&&!sessionStorageSafe())select(hero);
function sessionStorageSafe(){try{return sessionStorage.getItem('ardiye-seen')}catch(e){return null}}
try{sessionStorage.setItem('ardiye-seen','1')}catch(e){}

/* ===== PENCIL CANVAS ===== */
const cv=$('#sketch');
if(cv){const ctx=cv.getContext('2d');let W=0,H=0;const dpr=Math.min(devicePixelRatio||1,1.5);
 const size=()=>{W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round'};size();
 let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,200)});
 const ws=Array.from({length:6},(_,i)=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,t:Math.random()*100,s:.6+Math.random()*.9,c:i%3===0,k:i%3}));
 const step=w=>{const px=w.x,py=w.y;w.t+=.012;const a=Math.sin(w.t*1.3+w.x*.004)*3+Math.cos(w.t*.7+w.y*.005)*3;w.x+=Math.cos(a)*w.s*2.2;w.y+=Math.sin(a)*w.s*2.2;
  if(w.x<0||w.x>W||w.y<0||w.y>H){w.x=Math.random()*W;w.y=Math.random()*H;return}
  ctx.strokeStyle=w.k===0?'rgba('+colors.sel+',.26)':w.k===1?'rgba('+colors.sel2+',.26)':'rgba('+colors.ink+',.14)';ctx.lineWidth=w.k<2?.8:.6;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(w.x,w.y);ctx.stroke()};
 addEventListener('ardiye-scheme',()=>{ctx.clearRect(0,0,W,H);for(let i=0;i<260;i++)ws.forEach(step)});
 if(rm){for(let i=0;i<500;i++)ws.forEach(step)}
 else{let f=0,run=true;const loop=()=>{if(!run)return;f++;ws.forEach(step);if(f%70===0){ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.035)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}requestAnimationFrame(loop)};
  for(let i=0;i<300;i++)ws.forEach(step);loop();
  document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)loop()})}
 // the cursor draws too
 let lx=null,ly=null,pressing=false,pencilOn=true;
 addEventListener('pointerdown',e=>{if(e.button===0&&!e.target.closest('a,button,input,.sel,.cmd,.board,.marq'))pressing=true});
 addEventListener('pointerup',()=>{pressing=false});
 API.clear=()=>ctx.clearRect(0,0,W,H);API.pencil=v=>{pencilOn=v===undefined?!pencilOn:v;cv.style.visibility=pencilOn?'':'hidden';return pencilOn};API.seed=()=>{for(let i=0;i<260;i++)ws.forEach(step)};
 addEventListener('pointermove',e=>{const x=e.clientX,y=e.clientY;
  if(lx!==null&&!rm&&root.dataset.mode==='draft'&&Math.hypot(x-lx,y-ly)<160){ctx.strokeStyle='rgba('+colors.sel+',.6)';ctx.lineWidth=pressing?2.8:1.1;ctx.beginPath();ctx.moveTo(lx+(Math.random()-.5),ly+(Math.random()-.5));ctx.lineTo(x,y);ctx.stroke()}
  lx=x;ly=y},{passive:true});
}

/* ===== COORDINATE READOUT + GUIDES ===== */
const ro=$('#readout');
if(ro&&fine){const gx=document.createElement('div'),gy=document.createElement('div');gx.className='gx';gy.className='gy';gx.setAttribute('aria-hidden','true');gy.setAttribute('aria-hidden','true');document.body.append(gx,gy);let raf=0,mx=0,my=0,cx=0,cy=0;const pad=n=>String(Math.round(n)).padStart(4,'0');
 addEventListener('pointermove',e=>{cx=e.clientX;cy=e.clientY;mx=cx;my=cy+scrollY;if(!raf)raf=requestAnimationFrame(()=>{raf=0;gx.style.transform='translateY('+cy+'px)';gy.style.transform='translateX('+cx+'px)';ro.innerHTML='x '+pad(mx)+' &nbsp; y '+pad(my)})},{passive:true})}

/* ===== SCROLL SPY ===== */
const links=$$('.nav a'),sec=$$('main section[id]');
if('IntersectionObserver' in window&&links.length&&$('#narrative')){let pin=null;const set=a=>links.forEach(l=>l.classList.toggle('on',l===a));
 const so=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting||pin)return;const id=e.target.id==='top'?'':e.target.id;set(links.find(l=>l.getAttribute('href')==='#'+id)||null)}),{rootMargin:'-45% 0px -50% 0px'});
 sec.forEach(s=>so.observe(s));
 links.forEach(a=>a.addEventListener('click',()=>{pin=a;set(a);const free=()=>{pin=null};setTimeout(()=>{addEventListener('wheel',free,{passive:true,once:true});addEventListener('touchmove',free,{passive:true,once:true});addEventListener('keydown',free,{once:true})},700)}));
}

/* ===== COPY EMAIL + YEAR ===== */
const c=$('#copy'),n=$('#copy-note'),mail=$('#mail');
if(c&&mail)c.addEventListener('click',async()=>{const o=n.innerHTML;try{await navigator.clipboard.writeText(mail.textContent.trim());n.textContent='copied.'}catch(e){n.textContent='press ctrl/cmd + c to copy'}setTimeout(()=>n.innerHTML=o,2200)});
const y=$('#year');if(y)y.textContent=new Date().getFullYear();

// ============ extras ============
const sess=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}};
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};

/* ===== TOAST ===== */
const toastEl=mk('div','toast');toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.append(toastEl);
let tt;function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('on'),1900)}
// progress bar
const prog=mk('div','prog');prog.setAttribute('aria-hidden','true');document.body.append(prog);
// status bar
const st=mk('footer','status','<span id="st-mode">draft</span><span id="st-sel">no selection</span><span id="st-scroll">0%</span><span id="st-clock">--:--:--</span><span class="st-r">&#8984;K commands &middot; ? shortcuts</span>');st.setAttribute('aria-hidden','true');document.body.append(st);
const stSel=$('#st-sel'),stScroll=$('#st-scroll'),stMode=$('#st-mode'),stClock=$('#st-clock');
onSel=el=>{stSel.textContent=el?el.dataset.name:'no selection'};
const fmt=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
const tick=()=>{stClock.textContent=fmt.format(new Date());stMode.textContent=root.dataset.mode+' · '+(root.dataset.scheme||'bauhaus')};tick();setInterval(()=>{if(!document.hidden)tick()},1000);
addEventListener('ardiye-mode',tick);addEventListener('ardiye-scheme',tick);
let sraf=0;const onScroll=()=>{sraf=0;const m=document.documentElement.scrollHeight-innerHeight,p=m>0?scrollY/m:0;prog.style.transform='scaleX('+p+')';stScroll.textContent=Math.round(p*100)+'% scrolled'};
addEventListener('scroll',()=>{if(!sraf)sraf=requestAnimationFrame(onScroll)},{passive:true});onScroll();
// section dots
const secs=$$('main section.sec[id]');
if(secs.length>=3){const dots=mk('nav','dots');dots.setAttribute('aria-label','Sections');
 secs.forEach(s=>{const b=mk('button','','<span></span>');b.type='button';const nm=s.getAttribute('aria-label')||s.id;b.setAttribute('aria-label','go to '+nm);b.title=nm;b.dataset.t=s.id;b.addEventListener('click',()=>s.scrollIntoView({behavior:rm?'auto':'smooth'}));dots.append(b)});document.body.append(dots);
 if('IntersectionObserver' in window){const dio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('.dots button',dots).forEach(b=>b.classList.toggle('on',b.dataset.t===e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>dio.observe(s))}}

/* ===== UNDO / REDO ===== */
const snap=()=>JSON.stringify(sels.map(e=>[e._dx,e._dy]));
let hist=[snap()],hi=0,ct;
function commit(){const s=snap();if(s===hist[hi])return;hist=hist.slice(0,hi+1);hist.push(s);hi=hist.length-1;if(hist.length>60){hist.shift();hi--}}
function commitSoon(){clearTimeout(ct);ct=setTimeout(commit,450)}
function applySnap(s){JSON.parse(s).forEach((p,i)=>setPos(sels[i],p[0],p[1]));moved()}
function undo(){clearTimeout(ct);commit();if(hi>0){hi--;applySnap(hist[hi]);toast('undo')}else toast('nothing to undo')}
function redo(){if(hi<hist.length-1){hi++;applySnap(hist[hi]);toast('redo')}else toast('nothing to redo')}

/* ===== GRID OVERLAY ===== */
const gridEl=mk('div','gridov','<span></span>'.repeat(12));gridEl.setAttribute('aria-hidden','true');document.body.append(gridEl);
function grid(v){const on=v===undefined?root.dataset.grid!=='on':v;on?root.dataset.grid='on':delete root.dataset.grid;toast('grid '+(on?'on':'off'))}
// email copy
async function copyMail(){const m=$('#mail');if(!m)return toast('email: info@ardiye.art');try{await navigator.clipboard.writeText(m.textContent.trim());toast('copied info@ardiye.art')}catch(e){toast('press ctrl/cmd + c to copy')}}
const mailEl=$('#mail');if(mailEl){mailEl.dataset.cursor='click to copy';mailEl.style.cursor='pointer';mailEl.addEventListener('click',copyMail)}

/* ===== COMMAND PALETTE + HELP ===== */
let lastFocus=null;
function openDlg(el,focus){lastFocus=document.activeElement;el.classList.add('open');(focus||el.querySelector('.box')).focus()}
function closeDlg(el){el.classList.remove('open');lastFocus&&lastFocus.focus&&lastFocus.focus()}
const go=id=>{const t=document.getElementById(id);if(t)t.scrollIntoView({behavior:rm?'auto':'smooth'});else location.href='index.html#'+id};
const cmds=[
 ['go to cover','',()=>go('top')],['go to about','',()=>go('narrative')],['go to residents','',()=>go('residents')],['go to works','',()=>go('works')],['go to novaqua frame','',()=>go('work-2')],['go to version history','',()=>go('log')],['go to export / contact','',()=>go('contact')],
 ...$$('.foot>div:first-child a').slice(1).map(l=>['open file: '+l.textContent,'',()=>location.href=l.getAttribute('href')]),
 ['switch to draft mode','D',()=>mode('draft',true)],['switch to final mode','F',()=>mode('final',true)],
 ['next colour scheme','S',()=>nextScheme()],...SCH.map(n=>['colour scheme: '+n,'',()=>{scheme(n,true);toast('scheme: '+n)}]),
 ['toggle grid overlay','G',()=>grid()],['toggle pencil','P',()=>toast('pencil '+(API.pencil()?'on':'off'))],['redraw the pencil drawing','C',redraw],
 ['undo move','⌘Z',undo],['redo move','⇧⌘Z',redo],['reset layout','',()=>{resetBtn&&!resetBtn.hidden?resetBtn.click():toast('layout is already clean')}],
 ['copy email address','',copyMail],['scroll to top','',()=>scrollTo({top:0,behavior:rm?'auto':'smooth'})],['show keyboard shortcuts','?',()=>showHelp()]];
function redraw(){API.clear&&API.clear();API.seed&&API.seed();toast('redrawn')}
function nextScheme(){const n=SCH[(SCH.indexOf(root.dataset.scheme||'bauhaus')+1)%SCH.length];scheme(n,true);if(typeof toast==='function'&&toastEl)toast('scheme: '+n)}
const pal=mk('div','cmd','<div class="box" role="dialog" aria-modal="true" aria-label="Command palette" tabindex="-1"><input type="text" placeholder="type a command…" aria-label="Command" autocomplete="off" spellcheck="false"><ul role="listbox"></ul><p class="hint">↑ ↓ move &middot; enter run &middot; esc close</p></div>');document.body.append(pal);
const pin=$('input',pal),pul=$('ul',pal);let pitems=[],psel=0;
function render(){const q=pin.value.toLowerCase().split(/\s+/).filter(Boolean);pitems=cmds.filter(c=>q.every(w=>c[0].toLowerCase().includes(w)));psel=Math.min(psel,Math.max(pitems.length-1,0));
 pul.innerHTML=pitems.map((c,i)=>'<li role="option" data-i="'+i+'" aria-selected="'+(i===psel)+'"><span>'+c[0]+'</span><kbd>'+c[1]+'</kbd></li>').join('')||'<li class="none">no matching command</li>';const s=$('[aria-selected=true]',pul);s&&s.scrollIntoView({block:'nearest'})}
function run(i){const c=pitems[i];if(!c)return;closeDlg(pal);setTimeout(()=>c[2](),30)}
function openPal(){pin.value='';psel=0;render();openDlg(pal,pin)}
pin.addEventListener('input',()=>{psel=0;render()});
pin.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();psel=Math.min(psel+1,pitems.length-1);render()}else if(e.key==='ArrowUp'){e.preventDefault();psel=Math.max(psel-1,0);render()}else if(e.key==='Enter'){e.preventDefault();run(psel)}else if(e.key==='Tab')e.preventDefault()});
pul.addEventListener('click',e=>{const li=e.target.closest('li[data-i]');li&&run(+li.dataset.i)});
pal.addEventListener('pointerdown',e=>{if(e.target===pal)closeDlg(pal)});
const help=mk('div','cmd help','<div class="box" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" tabindex="-1"><p class="ph">keyboard shortcuts</p><dl class="keys"><div><dt>⌘ K &nbsp;or&nbsp; /</dt><dd>command palette</dd></div><div><dt>D &nbsp; F</dt><dd>draft / final mode</dd></div><div><dt>S</dt><dd>next colour scheme</dd></div><div><dt>G</dt><dd>grid overlay</dd></div><div><dt>P &nbsp; C</dt><dd>pencil on-off &middot; redraw</dd></div><div><dt>click &middot; drag</dt><dd>select &middot; move a block</dd></div><div><dt>← ↑ → ↓</dt><dd>nudge 1px (shift: 10px)</dd></div><div><dt>⌘ Z &nbsp; ⇧⌘ Z</dt><dd>undo &middot; redo a move</dd></div><div><dt>esc</dt><dd>close &middot; deselect</dd></div><div><dt>type “raw”</dt><dd>try it</dd></div></dl><p class="hint">press esc to close</p></div>');document.body.append(help);
function showHelp(){openDlg(help)}
help.addEventListener('pointerdown',e=>{if(e.target===help)closeDlg(help)});
$('#cmdk')&&$('#cmdk').addEventListener('click',openPal);
let buf='';
addEventListener('keydown',e=>{const tag=(e.target||{}).tagName||'';
 if(e.key==='Escape'){if(pal.classList.contains('open'))closeDlg(pal);if(help.classList.contains('open'))closeDlg(help);return}
 if(/INPUT|TEXTAREA|SELECT/.test(tag))return;
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.classList.contains('open')?closeDlg(pal):openPal();return}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){if(root.dataset.mode!=='draft')return;e.preventDefault();e.shiftKey?redo():undo();return}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return}
 if(e.metaKey||e.ctrlKey||e.altKey)return;
 if(pal.classList.contains('open')||help.classList.contains('open'))return;
 const k=e.key;
 if(k==='/'){e.preventDefault();openPal();return}
 if(k==='?'){showHelp();return}
 if(k==='g'||k==='G'){grid();return}
 if(k==='s'||k==='S'){nextScheme();return}
 if(k==='p'||k==='P'){toast('pencil '+(API.pencil()?'on':'off'));return}
 if(k==='c'||k==='C'){redraw();return}
 if(k.length===1){buf=(buf+k.toLowerCase()).slice(-8);
  if(buf.endsWith('raw')){const w=$('.hero h1 .w');if(w){w.classList.add('pulse');setTimeout(()=>w.classList.remove('pulse'),900)}toast('raw.')}
  else if(buf.endsWith('ardiye')){toast('ardiye: storage')}}});

/* ===== HERO TITLE SCRAMBLE ===== */
function scramble(){if(rm)return;const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';$$('.hero h1 .ch').forEach((c,i)=>{const fin=c.dataset.f||(c.dataset.f=c.textContent);let n=0;const tot=7+i*3;const t=setInterval(()=>{n++;if(n>=tot){c.textContent=fin;clearInterval(t)}else c.textContent=A[Math.random()*26|0]},45)});}
const h1=$('.hero h1');if(h1)h1.addEventListener('dblclick',scramble);
// boot screen (first visit per session, home only)
(function(){if(!$('.hero')||rm||sess('ardiye-boot')){scramble();return}
 sess('ardiye-boot','1');const b=mk('div','boot','<b>raw flux</b><div class="bar2"><i></i></div><span>opening untitled-1 &middot; <em>000</em>%</span>');b.setAttribute('aria-hidden','true');document.body.append(b);
 const i=$('.bar2 i',b),em=$('em',b);let p=0;const fin=()=>{b.classList.add('done');setTimeout(()=>{b.remove();scramble()},450)};
 const t=setInterval(()=>{p=Math.min(100,p+Math.random()*16+7);i.style.width=p+'%';em.textContent=String(Math.round(p)).padStart(3,'0');if(p>=100){clearInterval(t);setTimeout(fin,150)}},55);
 setTimeout(()=>{if(b.isConnected)fin()},2600)})();
// cursor label + tilt
if(fine){$$('.board').forEach(b=>b.dataset.cursor='open '+(b.querySelector('h3')||{textContent:'file'}).textContent);$$('.res').forEach(r=>r.dataset.cursor='open '+((r.querySelector('h2')||{}).textContent||'resident file'));
 const ct2=mk('div','ctag');ct2.setAttribute('aria-hidden','true');document.body.append(ct2);let craf=0,cx2=0,cy2=0,cur2=null;
 addEventListener('pointermove',e=>{cx2=e.clientX;cy2=e.clientY;const t=e.target.closest&&e.target.closest('[data-cursor]');if(t!==cur2){cur2=t;ct2.textContent=t?t.dataset.cursor:'';ct2.classList.toggle('on',!!t)}if(!craf)craf=requestAnimationFrame(()=>{craf=0;ct2.style.transform='translate('+(cx2+16)+'px,'+(cy2+18)+'px)'})},{passive:true});
 if(!rm)$$('.board,.photo').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;el.style.setProperty('--rx',((.5-py)*5).toFixed(2)+'deg');el.style.setProperty('--ry',((px-.5)*7).toFixed(2)+'deg')},{passive:true});el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')})})}

/* ===== SCROLL REVEALS ===== */
if('IntersectionObserver' in window&&!rm){const rv=$$('.big,.two,.hist li,.hist h2,.cap,.board .art img,.info>*,.panel,.foot>div,.spec div,.prose,.exit h2,.mail');
 rv.forEach(e=>e.classList.add(e.matches('.art img')?'rvi':'rv'));
 const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const sib=[...e.target.parentElement.children].indexOf(e.target);e.target.style.transitionDelay=Math.min(sib,6)*70+'ms';e.target.classList.add('rv-in');io2.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.05});
 $$('.rv,.rvi').forEach(e=>io2.observe(e))}

/* ===== PAGE TRANSITIONS ===== */
if(!rm){addEventListener('pageshow',()=>document.body.classList.remove('leaving'));
 document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname||!/\.html$|\/$/.test(u.pathname))return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>{location.href=u.href},220)})}
// tab title
const title0=document.title;document.addEventListener('visibilitychange',()=>{document.title=document.hidden?'come back — still unfinished':title0});
})();
