
'use strict';
const IMGS={shiba:'assets/characters/shiba.png',fox:'assets/characters/fox.png',chick:'assets/characters/chick.png'};
const names={shiba:'小柴 · 马嘉祺',fox:'小狐 · 丁程鑫',chick:'小鸡 · Victoria'};
const roomNames={living:'客厅',kitchen:'厨房',bedroom:'柴狐卧室',chick:'小鸡的房间'};
const parts=['早上','下午','晚上'], weekdays=['周六','周日','周一','周二','周三','周四','周五'];
const KEY='chai_fox_little_home_v02';
const startState=()=>({level:1,xp:0,growthMemo:[],outings:{},moments:{},talkXP:{},chatXP:{},noteXP:{},day:1,part:1,coins:24,room:'living',decor:[],packageDone:false,packagePlan:null,picnicDone:false,picnicPlan:null,taskDone:{},messages:[{who:'小猫 · 宋亚轩',emoji:'🐈',text:'大家今天在忙什么？',mine:false},{who:'小熊 · 严浩翔',emoji:'🐻',text:'我刚出门。天气还挺好。',mine:false}],diary:[{day:1,text:'搬进柴狐小屋的第一天。客厅里有阳光，三个人都有自己的小日子。'}],lastTalk:{}});
let state;try{state=JSON.parse(localStorage.getItem(KEY))||JSON.parse(localStorage.getItem('chai_fox_little_home_v01'))||startState()}catch(e){state=startState()};
state.level ??= 1;state.xp ??= 0;state.growthMemo ??= [];state.outings ??= {};state.moments ??= {};state.talkXP ??= {};state.chatXP ??= {};state.noteXP ??= {};
let activeStory=null;
const $=id=>document.getElementById(id);
function safe(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function dayLabel(){return `${weekdays[(state.day-1)%7]} · ${parts[state.part]}`}
function record(t){state.diary.unshift({day:state.day,text:t});state.diary=state.diary.slice(0,75);save()}
let toastTimer;function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800)}
function roomFor(who){if(state.day===1 && state.part===1)return 'living';if(state.part===0)return ({shiba:state.day%2?'living':'kitchen',fox:'kitchen',chick:'chick'})[who];if(state.part===1)return ({shiba:'living',fox:state.day%3===0?'kitchen':'living',chick:state.day%2?'living':'chick'})[who];return ({shiba:'bedroom',fox:'bedroom',chick:'chick'})[who]}
function getCharacters(){let positions={living:{shiba:[33,14],fox:[67,14],chick:[50,9]},kitchen:{shiba:[38,13],fox:[62,14],chick:[51,10]},bedroom:{shiba:[39,15],fox:[61,15],chick:[52,12]},chick:{shiba:[30,12],fox:[65,12],chick:[52,10]}};return Object.keys(names).filter(who=>roomFor(who)===state.room).map(who=>{let p=positions[state.room][who];return `<button class="character ${who}" style="left:${p[0]}%;bottom:${p[1]}%;transform:translateX(-50%)" data-who="${who}" aria-label="和${names[who]}互动"><img src="${IMGS[who]}" alt="${names[who]}" draggable="false"/><span class="char-caption">${names[who].split(' · ')[0]}</span></button>`}).join('')}
function roomSVG(room){
const wood=`<defs><linearGradient id="wall" x2="0" y2="1"><stop stop-color="#fcebd5"/><stop offset="1" stop-color="#f4d8bc"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#e5b98f"/><stop offset="1" stop-color="#c89370"/></linearGradient><linearGradient id="furn" x2="0" y2="1"><stop stop-color="#d9ac7e"/><stop offset="1" stop-color="#a87557"/></linearGradient><pattern id="paper" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="21" cy="23" r="1.6" fill="#d9b79b" opacity=".18"/></pattern></defs>`;
const base=`<rect width="900" height="560" fill="url(#wall)"/><rect width="900" height="560" fill="url(#paper)"/><path d="M0 352 H900 V560 H0Z" fill="url(#floor)"/><path d="M0 378 H900" stroke="#ae805c" stroke-width="5" opacity=".36"/><path d="M0 448 H900 M0 520 H900" stroke="#b78463" stroke-width="2" opacity=".34"/><path d="M100 352L20 560 M280 352L240 560 M450 352V560 M630 352L670 560 M800 352L880 560" stroke="#b78561" opacity=".25" stroke-width="2"/>`;
const rug=`<g data-item="rug" class="prop"><ellipse cx="468" cy="490" rx="238" ry="63" fill="#b86f62" opacity=".14"/><ellipse cx="468" cy="481" rx="235" ry="57" fill="${state.decor.includes('rug')?'#df9e8e':'#e9d4b8'}" stroke="#fff4dc" stroke-width="9"/><path d="M288 480Q465 453 644 480" fill="none" stroke="#fff3de" stroke-width="5" opacity=".53"/></g>`;
let objects='';
if(room==='living')objects=`<g class="prop" data-item="window"><rect x="65" y="77" width="212" height="195" rx="13" fill="#f8faf1" stroke="#b68f76" stroke-width="10"/><rect x="83" y="96" width="176" height="158" rx="5" fill="#c4d9d0"/><path d="M83 206Q135 157 169 184T259 175V254H83Z" fill="#a3c6a5"/><circle cx="227" cy="132" r="22" fill="#ffeab0"/><path d="M171 98V254M83 173H259" stroke="#fff8e9" stroke-width="8"/><path d="M61 73Q98 130 63 253L88 262Q119 177 97 72Z" fill="#f5cbb7"/><path d="M281 73Q238 138 287 253L263 261Q239 177 248 72Z" fill="#f5cbb7"/></g>
<g class="prop" data-item="frame"><rect x="360" y="94" width="168" height="117" rx="9" fill="#a47460"/><rect x="372" y="106" width="144" height="93" rx="4" fill="#f3eee3"/><path d="M381 182Q426 122 469 164T508 157V190H381" fill="#c0d0af"/><circle cx="478" cy="133" r="18" fill="#f2ca86"/><path d="M397 182Q423 163 458 183" fill="none" stroke="#fff" stroke-width="4"/></g>
<g class="prop" data-item="bookshelf"><rect x="737" y="129" width="130" height="291" rx="13" fill="#ba8c68" stroke="#95694e" stroke-width="7"/><path d="M745 215H860 M745 315H860" stroke="#96694f" stroke-width="11"/><rect x="757" y="168" width="23" height="44" rx="4" fill="#d67d76"/><rect x="785" y="181" width="19" height="30" fill="#e3b875"/><rect x="813" y="161" width="32" height="52" rx="4" fill="#a6ae8a"/><rect x="753" y="261" width="27" height="51" rx="4" fill="#c89778"/><rect x="786" y="245" width="24" height="67" rx="3" fill="#f4e0b3"/><rect x="819" y="272" width="28" height="41" rx="4" fill="#9cae99"/><rect x="758" y="353" width="48" height="53" rx="7" fill="#e3bf95"/><circle cx="822" cy="376" r="21" fill="#d3ddd0"/></g>
${rug}<g class="prop" data-item="sofa"><rect x="303" y="329" width="360" height="114" rx="33" fill="#b97b6b" stroke="#955e56" stroke-width="8"/><rect x="318" y="303" width="330" height="81" rx="29" fill="#dfa995" stroke="#bc8275" stroke-width="7"/><rect x="316" y="395" width="340" height="73" rx="24" fill="#d99e8e"/><rect x="340" y="354" width="82" height="67" rx="18" fill="#f7dec8" transform="rotate(-9 340 354)"/><rect x="532" y="349" width="83" height="65" rx="18" fill="#e3bd9a" transform="rotate(8 532 349)"/><rect x="328" y="463" width="25" height="25" rx="6" fill="#946958"/><rect x="608" y="463" width="25" height="25" rx="6" fill="#946958"/></g>
<g class="prop" data-item="table"><ellipse cx="472" cy="507" rx="115" ry="18" fill="#815f4c" opacity=".13"/><ellipse cx="467" cy="458" rx="127" ry="36" fill="#e6bb8d" stroke="#aa7f5d" stroke-width="9"/><path d="M407 472L388 522 M522 472L543 522" stroke="#aa7f5d" stroke-width="10"/><ellipse cx="468" cy="452" rx="27" ry="12" fill="#fff2db"/><circle cx="457" cy="450" r="6" fill="#d78f80"/><circle cx="470" cy="451" r="6" fill="#f8cd77"/><circle cx="481" cy="449" r="6" fill="#9aa980"/></g>
<g class="prop" data-item="plant"><path d="M114 432L170 432L161 490L123 490Z" fill="#dca889" stroke="#bd846f" stroke-width="5"/><path d="M140 429Q103 377 120 345Q158 364 140 429 M145 424Q183 357 186 348Q204 400 145 424 M137 425Q125 355 154 314Q177 372 137 425" fill="#91a987" stroke="#6f946d" stroke-width="3"/></g>
${!state.packageDone?`<g class="prop" data-item="package"><path d="M694 453L763 433L815 456L750 477Z" fill="#f1d49c" stroke="#be9265" stroke-width="5"/><path d="M694 453L750 477V546L694 517Z" fill="#d0a06f" stroke="#ae805a" stroke-width="4"/><path d="M750 477L815 456V525L750 546Z" fill="#e5ba83" stroke="#ae805a" stroke-width="4"/><path d="M733 441L793 466L793 537 M733 464V526" stroke="#fff1cd" stroke-width="9" opacity=".7"/><rect x="754" y="495" width="43" height="22" rx="3" fill="#fff5d8"/><text x="758" y="510" font-size="12" fill="#b48869">???</text></g>`:''}
${state.packagePlan==='living'?`<g class="prop" data-item="folding"><rect x="26" y="475" width="175" height="16" rx="7" fill="#b48764"/><path d="M53 488L35 537M175 488L190 537" stroke="#986c4c" stroke-width="8"/><text x="45" y="463" font-size="12" fill="#9c7660">新买的露营桌</text></g>`:''}
${state.decor.includes('lamp')?`<g class="prop" data-item="lamp"><path d="M684 295V454" stroke="#967765" stroke-width="9"/><path d="M653 306L713 306L700 268H666Z" fill="#f5d7a1"/><ellipse cx="683" cy="457" rx="31" ry="9" fill="#947361"/></g>`:''}
${state.decor.includes('photo')?`<g class="prop" data-item="photo"><rect x="579" y="118" width="92" height="80" rx="9" fill="#a88065"/><rect x="590" y="128" width="70" height="59" rx="5" fill="#f8e6d4"/><path d="M612 163Q618 145 632 163Q642 142 650 163" fill="none" stroke="#d99e91" stroke-width="6" stroke-linecap="round"/></g>`:''}
${state.decor.includes('newplant')?`<g class="prop" data-item="newplant"><path d="M684 425L725 425L719 473L689 473Z" fill="#e1b6a0"/><path d="M704 427Q670 391 682 365Q709 372 704 427M704 423Q730 367 746 376Q734 407 704 423" fill="#91ac87"/></g>`:''}`;
if(room==='kitchen')objects=`<g class="prop" data-item="fridge"><rect x="64" y="123" width="160" height="323" rx="15" fill="#e2e5d9" stroke="#b5c0b5" stroke-width="7"/><path d="M65 284H222" stroke="#b8c7b9" stroke-width="5"/><path d="M201 206V257 M201 324V390" stroke="#aab9ae" stroke-width="8" stroke-linecap="round"/><rect x="89" y="164" width="74" height="47" rx="8" fill="#f7e3a5" transform="rotate(-6 89 164)"/><text x="94" y="194" font-size="14" fill="#a37b65">买牛奶 ♡</text></g>
<g class="prop" data-item="cabinets"><rect x="290" y="108" width="493" height="129" rx="12" fill="#c9a27e" stroke="#a87d5f" stroke-width="7"/><path d="M455 114V231M619 114V231" stroke="#aa8065" stroke-width="7"/><circle cx="433" cy="175" r="5" fill="#f3e6c7"/><circle cx="595" cy="175" r="5" fill="#f3e6c7"/><circle cx="757" cy="175" r="5" fill="#f3e6c7"/></g>
<g class="prop" data-item="counter"><rect x="267" y="296" width="563" height="140" rx="8" fill="#e7c9a8" stroke="#b18b6a" stroke-width="7"/><rect x="254" y="268" width="588" height="32" rx="9" fill="#f6e9d5" stroke="#bfa18a" stroke-width="5"/><rect x="300" y="326" width="124" height="92" rx="7" fill="#f1e2cc"/><rect x="450" y="326" width="124" height="92" rx="7" fill="#f1e2cc"/><rect x="603" y="326" width="195" height="92" rx="7" fill="#f1e2cc"/></g>
<g class="prop" data-item="sink"><ellipse cx="475" cy="278" rx="83" ry="19" fill="#c1c7bd"/><ellipse cx="475" cy="277" rx="67" ry="11" fill="#e1e6df"/><path d="M468 270V242Q469 213 500 233" stroke="#a3aa9e" stroke-width="10" fill="none"/></g>
<g class="prop" data-item="kettle"><path d="M689 229L762 229L770 267L682 267Z" fill="#b8c9b3" stroke="#8ba58e" stroke-width="5"/><path d="M701 223Q723 190 747 223" fill="none" stroke="#8ba58e" stroke-width="7"/><path d="M768 235Q811 219 777 258" fill="none" stroke="#8ba58e" stroke-width="7"/></g>
<g class="prop" data-item="dining"><ellipse cx="494" cy="490" rx="194" ry="41" fill="#af8466" opacity=".2"/><ellipse cx="494" cy="467" rx="185" ry="50" fill="#d7aa82" stroke="#a27a5f" stroke-width="9"/><path d="M374 485L367 549 M613 485L626 549" stroke="#956c4d" stroke-width="14"/><ellipse cx="498" cy="458" rx="44" ry="16" fill="#f5f1dd"/><path d="M470 451Q493 434 520 449" fill="none" stroke="#d2956c" stroke-width="10"/></g>`;
if(room==='bedroom')objects=`<g class="prop" data-item="bed-window"><rect x="75" y="78" width="204" height="189" rx="12" fill="#c9dad2" stroke="#d2b699" stroke-width="11"/><circle cx="224" cy="133" r="22" fill="#fff4c6"/><path d="M82 189Q160 159 269 188V259H82Z" fill="#9dbca9"/><path d="M174 88V260" stroke="#fff4e2" stroke-width="9"/><path d="M62 78Q100 144 69 262L95 265Q122 178 109 78Z" fill="#ecd3b9"/><path d="M290 78Q246 144 284 262L261 263Q241 179 245 78Z" fill="#ecd3b9"/></g>
<g class="prop" data-item="bed"><rect x="290" y="286" width="420" height="195" rx="20" fill="#a97665"/><rect x="315" y="304" width="370" height="154" rx="18" fill="#f5e1cd"/><rect x="336" y="319" width="153" height="82" rx="18" fill="#fffaf0"/><rect x="513" y="319" width="147" height="82" rx="18" fill="#fffaf0"/><path d="M310 384Q490 355 690 386L697 489Q485 519 296 482Z" fill="#cfaaad" stroke="#b68b92" stroke-width="5"/><path d="M318 432Q489 399 680 432" stroke="#e9cacc" stroke-width="6" fill="none"/><path d="M320 486L320 511M677 486V511" stroke="#855c4e" stroke-width="14"/></g>
<g class="prop" data-item="nightstand"><rect x="742" y="353" width="112" height="116" rx="9" fill="#bc8b69"/><rect x="736" y="343" width="126" height="19" rx="7" fill="#d6ad84"/><path d="M745 404H853" stroke="#9e7157" stroke-width="6"/><circle cx="799" cy="390" r="5" fill="#f2ddc2"/></g><g class="prop" data-item="nightlamp"><path d="M794 347V281" stroke="#ab886c" stroke-width="8"/><path d="M755 288L835 288L822 241L768 241Z" fill="#f6d5a3"/></g>
<g class="prop" data-item="wardrobe"><rect x="45" y="301" width="196" height="193" rx="11" fill="#c9a17e" stroke="#a27c62" stroke-width="8"/><path d="M145 305V493" stroke="#a98267" stroke-width="6"/><circle cx="131" cy="404" r="6" fill="#f3d9a7"/><circle cx="160" cy="404" r="6" fill="#f3d9a7"/></g>`;
if(room==='chick')objects=`<g class="prop" data-item="chick-window"><rect x="54" y="72" width="234" height="195" rx="14" fill="#f8e7c9" stroke="#c79d7c" stroke-width="9"/><rect x="74" y="93" width="194" height="151" rx="4" fill="#b9d8d0"/><circle cx="209" cy="128" r="21" fill="#ffeec1"/><path d="M74 215Q168 156 268 217V244H74" fill="#a3c5a1"/><path d="M170 95V247" stroke="#fff9e8" stroke-width="9"/><path d="M43 74Q92 142 50 263L82 269Q103 153 87 74Z" fill="#e9b9ac"/><path d="M299 74Q247 148 293 263L259 266Q246 155 261 74Z" fill="#e9b9ac"/></g>
<g class="prop" data-item="chick-bed"><rect x="540" y="327" width="301" height="144" rx="31" fill="#cda18a"/><rect x="561" y="334" width="268" height="118" rx="28" fill="#fff0cd"/><rect x="587" y="341" width="103" height="50" rx="19" fill="#fffaf0"/><path d="M552 399Q699 361 833 400V471H548Z" fill="#ebc2a9"/><path d="M560 438Q695 422 824 439" stroke="#f8e0ca" stroke-width="6" fill="none"/></g>
<g class="prop" data-item="desk"><rect x="314" y="324" width="198" height="20" rx="6" fill="#c08d6c"/><path d="M326 344L316 477 M501 344L510 477" stroke="#aa795e" stroke-width="13"/><rect x="338" y="288" width="60" height="36" rx="5" fill="#f3d9a6" transform="rotate(-8 338 288)"/><rect x="432" y="287" width="27" height="40" rx="5" fill="#b2c7a8"/><path d="M432 286L443 251" stroke="#847c65" stroke-width="4"/></g>
<g class="prop" data-item="toy"><circle cx="187" cy="418" r="55" fill="#d5b190"/><circle cx="142" cy="381" r="22" fill="#cfaa8a"/><circle cx="232" cy="381" r="22" fill="#cfaa8a"/><circle cx="166" cy="415" r="7" fill="#715648"/><circle cx="209" cy="415" r="7" fill="#715648"/><ellipse cx="187" cy="439" rx="17" ry="13" fill="#f7dec4"/><path d="M183 434L190 434" stroke="#8e6550" stroke-width="3"/></g>
<g class="prop" data-item="chick-poster"><rect x="620" y="87" width="143" height="142" rx="10" fill="#f4d3b5" stroke="#b99078" stroke-width="8"/><path d="M675 180Q628 151 659 130Q682 114 690 139Q706 111 729 130Q749 159 690 190Z" fill="#e5a4a4"/><circle cx="647" cy="196" r="4" fill="#fff6e8"/><circle cx="733" cy="194" r="4" fill="#fff6e8"/></g>
<g class="prop" data-item="diary-desk"><rect x="354" y="309" width="66" height="14" rx="4" fill="#e5aa92"/><path d="M366 311L365 322" stroke="#fff6dc" stroke-width="3"/></g>`;
return `<svg viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet" aria-label="${roomNames[room]}的卡通小屋" role="img">${wood}${base}${objects}</svg>`;
}
function render(){state.coins=Math.max(0,state.coins);$('top-time').textContent=dayLabel();$('top-coins').textContent=state.coins;$('side-day').textContent=`第 ${state.day} 天`;$('side-part').textContent=`${dayLabel()} · ${state.day%4===0?'多云':'晴朗'}`;$('weather').textContent=state.day%4===0?'☁️ 多云 · 微风':'☀️ 晴朗 · 暖暖的';$('room-name').textContent=roomNames[state.room];$('scene-art').innerHTML=roomSVG(state.room);$('characters').innerHTML=getCharacters();$('family-list').innerHTML=Object.keys(names).map(who=>`<button class="family-person" data-family="${who}"><img src="${IMGS[who]}" alt=""/><span><span class="who">${names[who]}</span><span class="where">📍 ${roomNames[roomFor(who)]}</span></span></button>`).join('');document.querySelectorAll('[data-room]').forEach(el=>el.classList.toggle('active',el.dataset.room===state.room));
const story=$('story-card');if(!state.packageDone){story.innerHTML='<h3>📦 门口的神秘快递</h3><p>是谁买了这么大一个箱子？今天在客厅可以找到它。</p><button class="tiny-btn" data-openstory="package">过去看看 →</button>';story.classList.remove('finished')}
else if(state.day>=2&&!state.picnicDone){story.innerHTML='<h3>🧺 一张露营桌的后续</h3><p>昨天的快递还在影响今天。周末究竟怎么安排？</p><button class="tiny-btn" data-openstory="picnic">看看新消息 →</button>';story.classList.remove('finished')}
else{story.innerHTML=`<h3>📔 今日生活</h3><p>${state.picnicDone?'周末的故事已经写进了日记。':'纸箱的秘密已经揭晓。推进到明天，看看后续。'}</p><button class="tiny-btn ghost" data-activity="open-diary">翻翻日记 →</button>`;story.classList.add('finished')}
let done=['plant','table'].filter(id=>state.taskDone[id]===state.day).length;$('task-desc').textContent=`浇花、收拾桌子，今天已完成 ${done}/2 项。每项 +4 金币。`;
$('memo-text').textContent=!state.packageDone?'今天客厅里多了一个大纸箱。小鸡可以去看看。':!state.picnicDone?'小柴买来的露营桌，似乎还有故事没讲完……':`最新记忆：${state.diary[0]?.text||'这个家今天也在好好生活。'}`;
$('scene-sign').textContent=`${dayLabel()} · 点击物品探索 ✦`;save()}
function goRoom(room){state.room=room;render();toast(`来到了${roomNames[room]}`)}
function openModal(html){$('modal-content').innerHTML=html;if(!$('modal').open)$('modal').showModal()}
function closeModal(){$('modal').close();activeStory=null}
function panel(title,kicker,body){return `<div class="modal-body"><div class="modal-header"><div><div class="kicker">${kicker}</div><h2 class="modal-title">${title}</h2></div><button class="close" data-close aria-label="关闭">×</button></div>${body}</div>`}
function choices(arr){return `<div class="choice-stack">${arr.map(([label,action])=>`<button class="choice" data-activity="${action}">${label}<span class="choice-arrow">↗</span></button>`).join('')}</div>`}
function talkCard(who,say){return `<div class="talk"><img src="${IMGS[who]}" alt="${names[who]}"/><div><div class="speaker">${names[who]}</div><div class="quote">${safe(say)}</div></div></div>`}
function openCharacter(who){const greetings={shiba:['小柴正摆弄茶几上的东西，抬头看见你：“过来看看这个？”','“晚饭想吃什么？可以先想一想。”','“今天的歌单我已经选好了。”'],fox:['小狐正把沙发上的靠枕摆正：“你是不是又来捣乱了？”','“厨房还有点水果，想吃自己拿哦。”','“你看见我放在桌上的小本子了吗？”'],chick:['小鸡在房间里转了一圈，准备看看今天有什么新鲜事。','现在轮到小鸡决定今天要做什么了。','小鸡可以选择自己的行动，不需要谁替她做决定。']};let idx=(state.day+state.part)%3;openModal(panel(names[who],'FAMILY · 小小互动',`<p class="modal-desc">${safe(greetings[who][idx])}</p>${choices([['聊聊今天的安排',`talk-schedule-${who}`],['一起坐一会儿',`talk-sit-${who}`],['先去忙自己的事','close']])}`))}
function characterAction(type,who){let t;if(type==='schedule'){t=who==='shiba'?`小柴：“${state.part===2?'今天差不多要休息了。':'我等下还有点自己的事情，忙完再看看要不要出门。'}”`:who==='fox'?`小狐：“${state.part===0?'我先把早餐弄好。':'我有几个安排，晚点再说。'}”`:'今天由小鸡自己安排，可以继续逛房间、写日记或去看看其他家人。'}else{t=who==='shiba'?'小柴挪了挪位置，留出一小块空地：“坐吧，不过这个抱枕是我的。”':who==='fox'?'小狐把桌面上的杯子往里推了推：“小心点，刚泡的水还热。”':'小鸡可以在熟悉的小屋里待一会儿，时间慢慢过去。'}toast('这一刻被小屋悄悄记下了 ♡');openModal(panel('一个小小的瞬间','FAMILY · DAILY MOMENT',`<p class="modal-desc">${safe(t)}</p>${choices([['好啦，继续逛小屋','close']])}`))}
function propAction(item){if(item==='package'){if(!state.packageDone)startStory('package');else toast('这个纸箱已经拆开啦。');return}
if(item==='plant'){if(state.taskDone.plant!==state.day){state.taskDone.plant=state.day;state.coins+=4;record('今天给客厅的绿植浇了水，获得4枚金币。');toast('🌿 浇花完成！金币 +4')}else toast('小花已经喝过水啦。');render();return}
if(item==='table'||item==='dining'){if(state.taskDone.table!==state.day){state.taskDone.table=state.day;state.coins+=4;record('顺手收拾了家里的桌子，获得4枚金币。');toast('🫧 桌子干净啦！金币 +4')}else toast('今天已经把桌子整理过了。');render();return}
let data={window:'窗外有阳光，远处树叶轻轻晃动。',frame:'墙上挂着一幅很简单的风景画。',bookshelf:'书架上有小说、歌单笔记和几本只读到一半的书。',sofa:'沙发软乎乎的。靠枕总是不知不觉换位置。',rug:'地毯很柔软，坐在上面也很舒服。',lamp:'新落地灯亮起来，客厅变得更暖了。',photo:'墙上的相框里，是属于这个小家的记忆。',folding:'折叠露营桌现在成了客厅里最显眼的东西。',newplant:'新来的绿植已经找到自己的位置。',fridge:'冰箱门上贴着一张小纸条：牛奶、草莓、鸡蛋。',cabinets:'柜子里的碗碟摆得整整齐齐。',counter:'台面上还有洗净的杯子。',sink:'水槽里没有待洗的碗，今天很不错。',kettle:'水壶咕噜咕噜地响了一小会儿。',bed:'大床看上去很舒服，床单上留着浅浅的褶皱。',nightstand:'床头柜上放着一本书和一个马克杯。',nightlamp:'打开床头灯，房间里铺满柔和的橙光。',wardrobe:'衣柜里的衣服可以等换装系统上线再慢慢挑。','bed-window':'窗外的天色随着时间慢慢变化。','chick-window':'小鸡的窗户正对着一片小小的绿地。','chick-bed':'这是一张专属于小鸡的床。','desk':'小书桌上放着画纸和铅笔。','toy':'一只毛绒小熊住在小鸡房间的地板上。','chick-poster':'墙上的海报是一个软软的爱心。','diary-desk':'桌上有一本可以写字的小日记。'};let txt=data[item]||'这里藏着一点生活的痕迹。';if(item==='diary-desk'){openDiary();return}toast(txt)}
function startStory(id){activeStory={id,step:'intro'};renderStory()}
function storyStep(step){if(!activeStory)return;activeStory.step=step;renderStory()}
function renderStory(){if(!activeStory)return;const {id,step}=activeStory;let title,txt,say='',who='shiba',options=[];
if(id==='package'){
 title='家门口的巨型纸箱';if(step==='intro'){txt='周六下午，客厅门边多出一个大箱子，快把平时放拖鞋的地方堵住了。小柴蹲在旁边，正在费劲地找胶带的开口。小狐从厨房探出脑袋，看了一眼箱子的体积。';say='小狐：“马嘉祺，你到底买了多大的东西？”';who='fox';options=[['先看看快递单','story-look'],['凑过去敲敲纸箱','story-knock'],['去问小狐怎么回事','story-ask']]} 
 else if(step==='look'){txt='快递单的收件人写着马嘉祺。商品名称很长，最后几个字格外醒目：“加宽款便携折叠露营桌”。';say='小柴：“我觉得它很实用，真的。”';options=[['继续听听他们怎么说','story-discuss']]}
 else if(step==='knock'){txt='箱子里面没有动静，只传出轻微的木板碰撞声。小柴把胶带撕开一角，一根桌腿从缝隙里露了出来。';say='小柴：“其实吧，我就想买个可以带出去玩的桌子。”';options=[['看看小狐的反应','story-discuss']]}
 else if(step==='ask'){txt='小狐摊开手，表示自己也刚看到这个箱子。他走过来仔细瞧了瞧，发现纸箱上贴着“折叠露营桌”的标签。';who='fox';say='小狐：“咱家什么时候准备开露营用品店了？”';options=[['留下来听他们讨论','story-discuss']]}
 else {txt='把箱子打开以后，一张折叠桌占了客厅小半块地方。小柴说本来想等天气更暖和，带大家出去野餐。小狐试着撑开桌腿，发现它竟然真的很结实。';who='fox';say='小狐：“买都买了，那你准备放哪儿？”';options=[['试着先摆在客厅','finish-package-living'],['先收好，以后野餐时用','finish-package-storage'],['在家庭群问问大家的意见','finish-package-group']]} 
}else{
 title='露营桌的后续';if(step==='intro'){txt='第二天，小柴把昨天的露营桌拍了一张照片，发进了家庭群。小猫秒回了一句：“我报名。”小熊说自己还得看看安排。至于天气预报，明天可能有一点风。';who='shiba';say='小柴：“所以，我们到底要不要出门？”';options=[['查天气，去附近的公园','finish-picnic-park'],['就在家里弄个阳台野餐','finish-picnic-home'],['这周先不去，约个别的时间','finish-picnic-later']]}
}
openModal(panel(title,id==='package'?'STORY · 第一天':'STORY · 新的一天',`<p class="modal-desc">${safe(txt)}</p>${say?talkCard(who,say):''}${choices(options)}<div style="margin-top:13px;font-size:11px;color:#a38b78">这段故事会记录你的选择，但无法替其他角色决定他们的想法。</div>`))}
function finishPackage(outcome){state.packageDone=true;state.packagePlan=outcome;let line={living:'大家试着把折叠露营桌放进了客厅，它真的占了不少地方。',storage:'露营桌被收好，等一个合适的野餐日。',group:'小鸡提议先发到群聊里征求意见，群里很快热闹了起来。'}[outcome];record('巨型快递的秘密揭晓：小柴买了一张折叠露营桌。'+line);if(outcome==='group')state.messages.push({who:'我 · 小鸡',emoji:'🐥',text:'新露营桌到了，你们想哪天一起出去玩吗？',mine:true},{who:'小猫 · 宋亚轩',emoji:'🐈',text:'这么快！有吃的我就来！',mine:false});state.coins+=3;closeModal();render();toast('📔 新的家庭记忆已收录 · 金币 +3')}
function finishPicnic(outcome){state.picnicDone=true;state.picnicPlan=outcome;let text={park:'大家最后决定先去附近的公园看看。出发前，小狐坚持多带了一件外套。',home:'因为天气不确定，一家人把餐垫铺在家里，决定先在室内野餐。',later:'大家决定换个日子。小柴把折叠桌靠墙放好，约定下周再讨论。'}[outcome];record('露营桌的后续：'+text);state.coins+=5;closeModal();render();toast('🌷 一段新记忆已写入日记 · 金币 +5')}
function advance(){state.part++;if(state.part>=3){state.part=0;state.day++;state.coins+=3;toast(`新的一天开始了！零花钱 +3 🪙`)}else{toast(`时间来到了${parts[state.part]}。`)}render()}
const goods=[{id:'rug',name:'莓果色地毯',desc:'客厅暖一点',emoji:'🧶',cost:14},{id:'lamp',name:'奶油落地灯',desc:'让夜晚更柔和',emoji:'💡',cost:12},{id:'photo',name:'家庭纪念相框',desc:'给墙面留一角',emoji:'🖼️',cost:10},{id:'newplant',name:'新绿植',desc:'多养一盆小小的绿',emoji:'🪴',cost:9}];
function openShop(){openModal(panel('小屋杂货铺','HOME SHOP · 装饰与收集',`<p class="modal-desc">用日常小任务攒来的金币布置家。买到的东西会出现在客厅里，且自动保存。</p><div class="shop-grid">${goods.map(g=>`<div class="shop-item"><div class="shop-icon">${g.emoji}</div><div><div class="shop-title">${g.name}</div><p>${g.desc}</p><button data-buy="${g.id}" ${state.decor.includes(g.id)||state.coins<g.cost?'disabled':''}>${state.decor.includes(g.id)?'已拥有':g.cost+' 🪙 购买'}</button></div></div>`).join('')}</div><p class="small-muted" style="margin-top:15px">当前金币：${state.coins} 🪙 · 买完记得回客厅看看。</p>`))}
function buy(id){let g=goods.find(x=>x.id===id);if(!g||state.decor.includes(id)||state.coins<g.cost)return;state.coins-=g.cost;state.decor.push(id);record('在小屋杂货铺添置了「'+g.name+'」。');render();openShop();toast('买好啦！去客厅看看 ✨')}
function openPhone(){const emojiMap={'我 · 小鸡':'🐥'};openModal(panel('我们的家庭群','PHONE · 消息',`<p class="small-muted" style="margin:-6px 0 12px">群成员：柴、狐、鸡，以及会偶尔冒泡的朋友们。</p><div class="chat" id="chat-list">${state.messages.map(m=>`<div class="chat-message ${m.mine?'mine':''}"><div class="chat-avatar">${m.emoji||emojiMap[m.who]||'🐾'}</div><div><div class="chat-name">${safe(m.who)}</div><div class="chat-bubble">${safe(m.text)}</div></div></div>`).join('')}</div><div class="chat-actions"><button class="tiny-btn" data-activity="send-sticker">发一只小鸡表情 🐥</button><button class="tiny-btn ghost" data-activity="close">收起手机</button></div><p class="small-muted" style="margin-top:12px">第一版支持预设消息互动，之后会升级成更完整的社交与剧情系统。</p>`));let el=$('chat-list');el.scrollTop=el.scrollHeight}
function sendSticker(){state.messages.push({who:'我 · 小鸡',emoji:'🐥',text:'🐥 叽叽！',mine:true},{who:'小猫 · 宋亚轩',emoji:'🐈',text:['哈哈哈哈怎么突然出现一只小鸡','你们家小鸡上线啦！','好可爱，今天在家吗？'][(state.day+state.messages.length)%3],mine:false});save();openPhone()}
function openDiary(){openModal(panel('我们家的小日记','MEMORIES · 故事会被记得',`<p class="modal-desc">这里记录着真实发生过的互动和你自己的小小心事。</p><div style="max-height:255px;overflow:auto">${state.diary.map(d=>`<div class="diary-item"><div class="diary-day">第 ${d.day} 天</div>${safe(d.text)}</div>`).join('')}</div><hr class="divider"><label class="small-muted" for="note-input">✎ 小鸡可以给今天留一句自己的话</label><textarea id="note-input" class="input-note" maxlength="300" placeholder="今天发生了什么，我想记住……"></textarea><button class="tiny-btn" style="margin-top:10px" data-activity="save-note">写进日记 ♡</button>`))}
function saveNote(){let el=$('note-input');if(!el)return;let t=el.value.trim();if(!t){toast('先写一点内容吧～');return}record('小鸡手记：'+t.slice(0,300));openDiary();toast('已经记在自己的日记里啦 📔')}
function reset(){if(confirm('要重新开始这个小家的第一天吗？之前的存档会被清空。')){state=startState();activeStory=null;closeModalIfOpen();render();toast('欢迎重新回到柴狐小屋 ♡')}}
function closeModalIfOpen(){if($('modal').open)$('modal').close()}
function activity(action){if(action==='close'){closeModal();return}if(action.startsWith('story-')){storyStep(action.slice(6));return}if(action.startsWith('finish-package-')){finishPackage(action.slice(15));return}if(action.startsWith('finish-picnic-')){finishPicnic(action.slice(14));return}if(action.startsWith('talk-schedule-')){characterAction('schedule',action.slice(14));return}if(action.startsWith('talk-sit-')){characterAction('sit',action.slice(9));return}if(action==='send-sticker'){sendSticker();return}if(action==='save-note'){saveNote();return}if(action==='open-diary'){openDiary();return}}
document.addEventListener('click',e=>{let el=e.target.closest('[data-room],[data-family],[data-who],[data-item],[data-openstory],[data-roomjump],[data-buy],[data-activity],[data-close]');if(!el)return;if(el.hasAttribute('data-room'))goRoom(el.dataset.room);else if(el.hasAttribute('data-roomjump'))goRoom(el.dataset.roomjump);else if(el.hasAttribute('data-family')){state.room=roomFor(el.dataset.family);render();openCharacter(el.dataset.family)}else if(el.hasAttribute('data-who'))openCharacter(el.dataset.who);else if(el.hasAttribute('data-item'))propAction(el.dataset.item);else if(el.hasAttribute('data-openstory'))startStory(el.dataset.openstory);else if(el.hasAttribute('data-buy'))buy(el.dataset.buy);else if(el.hasAttribute('data-activity'))activity(el.dataset.activity);else if(el.hasAttribute('data-close'))closeModal()});
$('shop-btn').addEventListener('click',openShop);$('phone-btn').addEventListener('click',openPhone);$('diary-btn').addEventListener('click',openDiary);$('time-btn').addEventListener('click',advance);$('reset-btn').addEventListener('click',reset);
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});$('modal').addEventListener('close',()=>activeStory=null);
setInterval(()=>{document.querySelectorAll('.character img').forEach((el,i)=>{el.style.setProperty('--step',((state.day*7+state.part*3+Date.now()/5200+i*13)%19-9).toFixed(0)+'px')})},5200);

/* === V0.2 · Childhood growth module === */
const LV_NAMES=['','第一次冒险','家里的小帮手','发现新朋友','喜欢的小地方','小小收藏家','勇敢的新尝试','探索世界','认真长大','装满回忆','童年纪念册'];
const mapPlaces=[
{id:'garden',min:1,name:'家门口的小花园',icon:'🌿',desc:'摇摇晃晃的小树叶与路边的小花。',intro:'小鸡走进楼下花园，石板路上还有昨夜留下的水珠。',opts:[['看看花丛','花丛边有一只忙忙碌碌的瓢虫。你蹲下来观察了一会儿。'],['去长椅坐坐','长椅被晒得暖暖的，远处有小朋友在玩球。']]},
{id:'park',min:3,name:'湖边公园',icon:'🦆',desc:'带上小零食，看看湖里的鸭子。',intro:'公园里的风把树叶吹得沙沙响，湖面上飘着几只小鸭。',opts:[['沿湖散步','小狐拿出手机拍了一张照片。小柴提醒大家别离湖边太近。'],['找地方野餐','三个人选了片草地。有人发现零食袋居然忘带了小叉子。']]},
{id:'bookstore',min:5,name:'街角绘本店',icon:'📚',desc:'架子上藏着很多有趣的小故事。',intro:'门上挂的小铃铛响了。绘本店里摆着一整面颜色鲜艳的书架。',opts:[['选一本故事书','你发现了一本关于小动物旅行的绘本，翻开第一页就是大海。'],['找一张明信片','柜台上的明信片画着一间亮着灯的小房子。']]},
{id:'museum',min:7,name:'自然博物馆',icon:'🦕',desc:'从古老的骨头到漂亮的星星。',intro:'走进自然博物馆，巨大的恐龙骨架高高挂在头顶。',opts:[['看恐龙','小柴站在展板前看了半天，突然发现你们已经走出好几米。'],['逛矿石展','一块紫色矿石在灯光下泛着亮光，像小鸡头上的紫色装饰。']]},
{id:'hill',min:9,name:'星星观景台',icon:'⭐',desc:'在高处看看城市的灯与天上的星。',intro:'天色渐暗，山坡上的观景台可以看见远远的城市灯火。',opts:[['看星星','小狐指着天边一颗亮亮的星。你们谁也不确定它叫什么。'],['拍家庭合照','合照拍了好几次，总有人眨眼。最后一张倒是很自然。']]}
];
const momentData=[
{title:'消失的一只袜子',intro:'洗完衣服，小狐拿着一只袜子走进客厅：“另外一只呢？”小柴蹲下来翻了翻洗衣篮。',opts:[['一起寻找','小鸡也加入寻找，最后袜子从床单夹层里掉了出来。'],['先去拿小饼干','等小鸡拿着饼干回来，袜子已经找到了。小柴指了指晾衣架。']]},
{title:'谁动了冰箱上的贴纸',intro:'小柴看着冰箱上歪歪扭扭的一排贴纸：“昨天是不是没有这么多？”小狐端着水果经过。',opts:[['去看看新贴纸','最下面多了一张画着小花的贴纸。小狐说是路过杂货店时买的。'],['提议一起重新排列','三个人花了一会儿才排好。小柴后退两步看了看，又偷偷换了两张位置。']]},
{title:'一场客厅音乐会',intro:'音箱里传来前奏，小狐坐在地毯上跟着哼起歌。小柴把音量稍微调低了一格。',opts:[['选一首下一首歌','小柴接过手机，认真研究了半天歌单。'],['坐在旁边听','窗边有风吹进来，最后一段副歌唱完的时候，厨房里的水壶刚好响了。']]},
{title:'不是谁的生日',intro:'小狐拿着一块小蛋糕回家，小柴愣了一下：“今天什么日子？”',opts:[['问问为什么买蛋糕','小狐说路过蛋糕店时闻着太香，没忍住买了一块。'],['拿三只小叉子','小柴笑着从抽屉里找出了三把叉子，蛋糕被分得大小不太一样。']]},
{title:'天气预报说要下雨',intro:'窗外突然阴下来。小柴看了一眼手机，发现下午原本的晴天图标变成了小雨。',opts:[['把阳台的衣服收进来','小鸡帮着递衣架，最后一件刚收进来，窗外就落下了雨点。'],['在窗边等雨','第一滴雨落下以后，小狐去厨房煮了热饮。']]},
{title:'毛毯争夺战',intro:'沙发上的小毯子不知什么时候只剩下一个角。小狐：“你不要整个卷过去嘛。”小柴低头看了一眼。',opts:[['拿来另一条毯子','柜子里其实还有另一条。两个人研究了一会儿为什么刚才谁也没想到。'],['假装什么也没看见','小鸡悄悄走开。过了一会儿，客厅传来有人笑出声的声音。']]}
];
function xpNeed(level){return 28+(Math.max(1,level)-1)*9}
function nextPlace(){return mapPlaces.find(p=>p.min>state.level)}
function gainXP(amount,reason){
 if(state.level>=10){state.xp=Math.min(state.xp+amount,xpNeed(10));save();render();return}
 state.xp+=amount;let notes=[];
 while(state.level<10 && state.xp>=xpNeed(state.level)){
  state.xp-=xpNeed(state.level);state.level++;state.coins+=5;
  let pl=mapPlaces.find(p=>p.min===state.level);
  let note='🐣 成长到 LV.'+state.level+' · '+LV_NAMES[state.level]+'（奖励金币 +5）'+(pl?'，解锁 '+pl.name:'');
  notes.push(note);state.growthMemo.unshift({level:state.level,day:state.day,text:note});record(note);
 }
 if(state.level===10)state.xp=Math.min(state.xp,xpNeed(10));
 save();render();
 if(notes.length)toast('🎉 '+notes[notes.length-1]);else toast('🌱 '+reason+' · 成长经验 +'+amount)
}
function growthRender(){
 const total=xpNeed(state.level),pct=Math.min(100,Math.round(state.xp/total*100));
 $('top-level').textContent=state.level;$('growth-level').textContent='LV.'+state.level;
 $('growth-name').textContent=state.level>=10?'童年纪念册':LV_NAMES[state.level];
 $('xp-fill').style.width=pct+'%';$('xp-text').textContent=state.level>=10?'童年等级已达上限':state.xp+' / '+total+' EXP';
 const pl=nextPlace();$('growth-unlock').textContent=pl?'LV.'+pl.min+' 解锁 '+pl.name:'高中篇 · 敬请期待';
 $('moment-status').textContent=state.moments[state.day]?'今天的小插曲已经写进日记，明天再看看有什么新鲜事。':'三个人各忙各的，也许能发现一点新鲜事。';
}
const oldGrowthRender=render;
render=function(){oldGrowthRender();growthRender()};
const oldGrowthProp=propAction;
propAction=function(item){const prev=state.taskDone[item];oldGrowthProp(item);if(['plant','table'].includes(item)&&prev!==state.day&&state.taskDone[item]===state.day)gainXP(item==='plant'?14:12,item==='plant'?'照顾绿植':'整理桌子')};
const oldGrowthFinishPackage=finishPackage;
finishPackage=function(outcome){oldGrowthFinishPackage(outcome);gainXP(27,'一起解决神秘快递')};
const oldGrowthFinishPicnic=finishPicnic;
finishPicnic=function(outcome){oldGrowthFinishPicnic(outcome);gainXP(24,'一家人的周末计划')};
const oldGrowthChat=sendSticker;
sendSticker=function(){let first=!state.chatXP[state.day];oldGrowthChat();if(first){state.chatXP[state.day]=true;gainXP(5,'给家人发消息')}};
const oldGrowthNote=saveNote;
saveNote=function(){let tx=$('note-input');let has=tx&&tx.value.trim();let first=!state.noteXP[state.day];oldGrowthNote();if(has&&first){state.noteXP[state.day]=true;gainXP(8,'留下今天的日记')}};
const oldGrowthCharacterAction=characterAction;
characterAction=function(action,who){let key=state.day+':'+who;let first=!state.talkXP[key];oldGrowthCharacterAction(action,who);if(first&&action!=='close'){state.talkXP[key]=true;gainXP(4,'和家人说说话')}};
function openGrowth(){
 let unlocked=mapPlaces.filter(p=>p.min<=state.level).map(p=>'<span class="unlock-chip">'+p.icon+' '+p.name+'</span>').join('');
 const timeline=state.growthMemo.length?state.growthMemo.slice(0,8).map(m=>'<div class="timeline-item">第'+m.day+'天 · '+safe(m.text)+'</div>').join(''):'<div class="timeline-item">LV.1：小鸡的童年刚刚开始。去探索房间、和家人互动吧。</div>';
 openModal(panel('小鸡成长档案','CHILDHOOD · LEVEL 1–10',`<p class="modal-desc">等级代表经历的积累，不等于年龄。童年 LV.1–10，青春校园篇计划从 LV.11 起开放，但不会自动跨阶段。</p><div style="background:#f7ecde;border-radius:13px;padding:12px"><strong>🐣 LV.${state.level} · ${LV_NAMES[state.level]}</strong><div class="xp-track" style="margin:10px 0"><div class="xp-fill" style="width:${Math.min(100,100*state.xp/xpNeed(state.level))}%"></div></div><span class="small-muted">${state.level===10?'童年篇最高等级已达成':state.xp+' / '+xpNeed(state.level)+' EXP'} · 每次升级额外获得 5 枚金币</span></div><h3 style="margin-top:19px">已经解锁的地点</h3><div class="unlock-list">${unlocked}</div><h3 style="margin-top:20px">成长里程碑</h3><div class="timeline">${timeline}</div>${state.level>=10?'<p class="small-muted">童年篇已经通关。青春校园篇的完整可玩内容将在后续版本制作，现在可以继续留在童年小屋生活。</p>':'<p class="small-muted">升级方式：完成每日家务、和家人说话、写日记、探索外部地点、参与家庭事件。每天都有新的成长机会。</p>'}`))
}
function openMap(){
 let tiles=mapPlaces.map(p=>`<div class="map-tile ${state.level<p.min?'locked':''}"><div><div class="map-icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p></div><button class="tiny-btn ${state.level<p.min?'ghost':''}" data-activity="visit-${p.id}" ${state.level<p.min?'disabled':''}>${state.level<p.min?'🔒 LV.'+p.min+' 解锁':'出发看看 →'}</button></div>`).join('');
 openModal(panel('童年探索地图','LITTLE WORLD · 第一次去远方',`<p class="modal-desc">随着小鸡成长，外面的世界会一点点打开。每个地点每天首次探索可以获得成长经验，并留下属于那一天的记忆。</p><div class="map-cards">${tiles}</div><p class="small-muted">进入地点不等于强制跳剧情；每段出游你都可以自主选择。</p>`))
}
let tripPending=null;
function startTrip(id){const p=mapPlaces.find(p=>p.id===id);if(!p||state.level<p.min)return;tripPending=p;openModal(panel(p.icon+' '+p.name,'A LITTLE TRIP · 出门走走',`<p class="modal-desc">${p.intro}</p>${choices(p.opts.map((o,i)=>[o[0],'finishtrip-'+p.id+'-'+i]).concat([['先回小屋','close']]))}`))}
function finishTrip(id,n){const p=mapPlaces.find(p=>p.id===id);if(!p||state.level<p.min)return;const c=p.opts[n];if(!c)return;const first=state.outings[id]!==state.day;state.outings[id]=state.day;
 record('外出 · '+p.name+'：'+c[1]);closeModal();render();
 openModal(panel('今天的小小旅行','MEMORY · '+p.name,`<p class="modal-desc">${c[1]}</p><p class="small-muted">${first?'📔 一段新的小鸡成长回忆已经存进相册。':'📔 今天又在这里留下了一点记忆。'}</p><button class="tiny-btn" data-activity="close">回家 ♡</button>`));
 if(first)gainXP(20,'探索了'+p.name);
}
function openMoment(){if(state.moments[state.day]){toast('今天的小插曲已经发生过啦，明天会有新的。');return}
 const id=(state.day*3+state.level)%momentData.length;let event=momentData[id];
 openModal(panel(event.title,'A LITTLE MOMENT · 第'+state.day+'天',`<p class="modal-desc">${event.intro}</p>${choices(event.opts.map((op,i)=>[op[0],'momentchoice-'+id+'-'+i]).concat([['先不参与','close']]))}`))
}
function finishMoment(id,n){if(state.moments[state.day])return;let v=momentData[id];if(!v||!v.opts[n])return;const text=v.opts[n][1];state.moments[state.day]=v.title;record('今日小插曲 · '+v.title+'：'+text);state.coins+=2;closeModal();render();openModal(panel('今天发生的小事','THE LITTLE THINGS',`<p class="modal-desc">${text}</p><p class="small-muted">🪙 零花钱 +2 · 这件事已经留在家庭日记里。</p><button class="tiny-btn" data-activity="close">好，继续生活 →</button>`));gainXP(18,'参与家庭小插曲')}
const prevActivity=activity;
activity=function(a){
 if(a==='open-growth'){openGrowth();return}
 if(a==='open-map'){openMap();return}
 if(a==='open-moment'){openMoment();return}
 if(a.startsWith('visit-')){startTrip(a.slice(6));return}
 if(a.startsWith('finishtrip-')){const m=a.match(/^finishtrip-(.+)-(\d+)$/);if(m){finishTrip(m[1],+m[2]);return}}
 if(a.startsWith('momentchoice-')){const m=a.match(/^momentchoice-(\d+)-(\d+)$/);if(m){finishMoment(+m[1],+m[2]);return}}
 prevActivity(a)
};
$('map-btn').addEventListener('click',openMap);
$('map-side-btn').addEventListener('click',openMap);
$('growth-btn').addEventListener('click',openGrowth);
$('level-shortcut').addEventListener('click',openGrowth);
$('moment-btn').addEventListener('click',openMoment);
/* / V0.2 */

render();

/* === V0.3 · living gameplay and personal mailbox; no AI service connected === */
state.v03 ??= {chickRoom:state.room,chickPositions:{},garden:{},cocoa:{},stars:{},rugTone:'cream',letters:[],letterId:0};
const home03=state.v03;
home03.chickRoom ||=state.room;home03.chickPositions ||= {};home03.garden ||= {};home03.cocoa ||= {};home03.stars ||= {};home03.letters ||= [];
home03.rugTone ||= 'cream';home03.letterId ||=0;
let game03=null;
const oldRoomFor03=roomFor;
roomFor=function(who){return who==='chick' ? (home03.chickRoom||state.room):oldRoomFor03(who)};
const oldGoRoom03=goRoom;
goRoom=function(room){if(!roomNames[room])return;home03.chickRoom=room;home03.chickPositions[room] ||= [52,10];oldGoRoom03(room);toast('🐥 小鸡来到'+roomNames[room]+'，点击地板可以走动')};
const oldRender03=render;
render=function(){oldRender03();paintRoom03();drawBubble03();setPlayStrip03()};
function paintRoom03(){
  const p=home03.chickPositions[state.room]||[52,10],ch=document.querySelector('#characters .character.chick');
  if(ch){ch.style.left=p[0]+'%';ch.style.bottom=p[1]+'%';ch.classList.toggle('sitting',!!home03.sitting&&home03.chickRoom==='living')}
  const r=document.querySelector('#scene-art g[data-item="rug"] ellipse:nth-of-type(2)');
  if(r){const colors={cream:'#e9d4b8',berry:'#df9e8e',sage:'#9db99a',lavender:'#b7a7d3',butter:'#efd196'};r.style.fill=colors[home03.rugTone]||colors.cream}
  $('scene').classList.add('walking');
}
function drawBubble03(){
  let quotes={shiba:['在整理东西','在想晚饭','哼着歌'],fox:['好像在找什么','今天的阳光不错','整理小摆件'],chick:['到处看看','我来啦','小鸡探险中']};
  document.querySelectorAll('#characters .character').forEach(c=>{
    let key=[...c.classList].find(t=>quotes[t]);if(!key)return;
    let b=document.createElement('span');b.className='v03-bubble';b.textContent=quotes[key][(state.day+state.part+(key==='shiba'?0:key==='fox'?1:2))%3];c.appendChild(b);
  })
}
function setPlayStrip03(){
  const a={living:['🌱 亲手浇花','🌱 浇花挑战','garden'],kitchen:['☕ 一起做热可可','☕ 开始做可可','cocoa'],bedroom:['🛏️ 今天的房间','🐥 去看看小鸡房间','chickroom'],chick:['⭐ 收拾自己的房间','⭐ 找回散落的星星','stars']}[state.room];
  $('play-title').textContent=a[0];$('play-main-btn').textContent=a[1];$('play-main-btn').dataset.minigame=a[2];
  $('play-subtitle').textContent={living:'点花盆或按钮给植物浇水，也能点击地毯换色。',kitchen:'按顺序放入材料，真的做出一杯热可可。',bedroom:'随便逛逛；你可以走到床边、看看衣柜。',chick:'5颗星星掉到了房间里，找齐它们吧！'}[state.room]
}
function walkTo03(x,y){
  let ch=document.querySelector('#characters .character.chick');if(!ch)return;
  home03.sitting=false;ch.classList.remove('sitting');
  x=Math.min(89,Math.max(11,x));y=Math.min(26,Math.max(5,y));
  home03.chickPositions[state.room]=[Math.round(x),Math.round(y)];ch.style.left=x+'%';ch.style.bottom=y+'%';save();
}
$('scene').addEventListener('click',e=>{
 if(e.target.closest('[data-item],[data-who],button,.character'))return;
 const rect=$('scene').getBoundingClientRect(); const ratioX=(e.clientX-rect.left)/rect.width,ratioY=(e.clientY-rect.top)/rect.height;
 if(ratioY<.56){toast('点地板走动哦，小鸡还不能飞到墙上 🐥');return}
 walkTo03(ratioX*100,(1-ratioY)*45);
});
function sparkle03(icon,x,y){let n=document.createElement('span');n.className='v03-sparkle';n.textContent=icon;n.style.left=x+'%';n.style.top=y+'%';$('scene').appendChild(n);setTimeout(()=>n.remove(),1450)}
const oldPropAction03=propAction;
propAction=function(item){
 if(item==='plant'){startGarden03();return}
 if(item==='kettle'){startCocoa03();return}
 if(item==='toy'){startStars03();return}
 if(item==='rug'){openRug03();return}
 if(item==='sofa'){walkTo03(48,15);home03.sitting=true;setTimeout(()=>{let c=document.querySelector('.character.chick');if(c)c.classList.add('sitting');sparkle03('💗',48,65)},600);toast('🐥 小鸡坐在柔软的沙发上休息了一会儿');save();return}
 if(item==='chick-bed'){walkTo03(47,14);sparkle03('💤',50,60);toast('躺在小床上打了个哈欠……');return}
 oldPropAction03(item)
};
function startGarden03(){
 if(state.room!=='living')goRoom('living');walkTo03(18,13);
 game03={type:'garden',count:0};renderGarden03()
}
function renderGarden03(){
 const done=home03.garden[state.day]===true;
 const c=game03.count;
 const plant=['🌱','🌿','🪴','🌻'][c];
 openModal(panel('给小花浇浇水','MINIGAME · 手指动一动',`<p class="modal-desc">小鸡搬来一把迷你浇水壶。给花盆浇满三滴水，看看它会长成什么样。每天完成一次可获得金币和成长经验。</p><div class="garden-stage"><span class="garden-drops">${'💧'.repeat(3-c)}</span><span class="garden-sprout" style="transform:scale(${.9+c*.11})">${plant}</span></div><div class="mini-progress"><div style="width:${c/3*100}%"></div></div><div class="mini-btns"><button class="mini-btn" data-v03="water" ${c===3?'disabled':''}>💧 浇水 ${c}/3</button><button class="mini-btn" data-v03="close">${c===3?'完成啦！':'等一会儿'}</button></div>${done?'<p class="small-muted">今天已经照顾过植物啦，不会重复获得奖励。</p>':''}`))
}
function water03(){if(!game03||game03.type!=='garden'||game03.count===3)return;game03.count++;renderGarden03();sparkle03('💦',19,67);if(game03.count===3){let was=state.taskDone.plant===state.day;oldPropAction03('plant');if(was)toast('今天已经领过奖励了，但植物依然很开心 🌼');renderGarden03()}}
function startCocoa03(){if(state.room!=='kitchen')goRoom('kitchen');walkTo03(66,15);game03={type:'cocoa',step:0};renderCocoa03()}
const recipe03=[['🥛','牛奶'],['🍫','巧克力'],['☁️','棉花糖']];
function renderCocoa03(){
 let i=game03.step,done=home03.cocoa[state.day];
 openModal(panel('小鸡的热可可','MINIGAME · 厨房时间',`<p class="modal-desc">今天的配方：牛奶 → 巧克力 → 棉花糖。按照顺序点材料，不小心放错就重新来哦。</p><div class="cocoa-stage"><div class="cocoa-cup">${i===3?'☕':'🥣'}</div><strong style="font-size:12px">${i===3?'香香的热可可完成！':`还差 ${3-i} 步`}</strong></div><div class="mini-progress"><div style="width:${i/3*100}%"></div></div><div class="mini-btns">${recipe03.map(([ic,label],idx)=>`<button class="mini-btn" data-v03="ingredient" data-idx="${idx}" ${i===3?'disabled':''}>${ic} ${label}</button>`).join('')}</div>${done?'<p class="small-muted">今天的厨房挑战已经拿过奖励，仍然可以继续做热可可。</p>':''}<button class="mini-btn" data-v03="close">继续逛小屋 →</button>`))
}
function ingredient03(n){if(!game03||game03.type!=='cocoa'||game03.step===3)return;if(n!==game03.step){game03.step=0;toast('哎呀，顺序不太对，再来一遍！');renderCocoa03();return}game03.step++;renderCocoa03();sparkle03('✨',60,59);if(game03.step===3){if(home03.cocoa[state.day]!==true){home03.cocoa[state.day]=true;state.coins+=6;record('和家人一起在厨房做了热可可，零花钱 +6。');gainXP(16,'做了一杯热可可');}renderCocoa03();toast('☕ 热可可做好啦！')}}
function startStars03(){if(state.room!=='chick')goRoom('chick');walkTo03(50,12);game03={type:'stars',found:[]};renderStars03()}
const posStars03=[[15,20],[70,14],[35,54],[82,65],[56,37]];
function renderStars03(){let f=game03.found;let done=home03.stars[state.day]===true;
 openModal(panel('寻找五颗小星星','MINIGAME · 小鸡的房间',`<p class="modal-desc">星星从小鸡的小贴纸盒里散了出来。点亮画面里的五颗星星，把它们收集起来吧！</p><div class="stars-stage">${posStars03.map(([x,y],i)=>f.includes(i)?'':`<button class="hidden-star" data-v03="star" data-idx="${i}" style="left:${x}%;top:${y}%" aria-label="拾起第${i+1}颗星星">⭐</button>`).join('')}<span style="font-size:14px;color:#826e91">${f.length===5?'收拾得干干净净 ♡':''}</span></div><div class="mini-progress"><div style="width:${f.length/5*100}%"></div></div><p class="small-muted">已经收好 ${f.length}/5 颗星星。${done?'今天已经收过星星，奖励不会重复计算。':''}</p><button class="mini-btn" data-v03="close">回到房间</button>`))}
function star03(n){if(!game03||game03.type!=='stars'||game03.found.includes(n))return;game03.found.push(n);renderStars03();if(game03.found.length===5){if(home03.stars[state.day]!==true){home03.stars[state.day]=true;state.coins+=5;record('小鸡把房间里的五颗星星都收拾好了，零花钱 +5。');gainXP(14,'整理小鸡房间');}toast('✨ 五颗星星都找到啦！')}}
function openRug03(){if(state.room!=='living')goRoom('living');openModal(panel('换一块喜欢的地毯','DECORATE · 颜色实验室',`<p class="modal-desc">挑一种颜色。点击后会真的改变客厅地毯，而且下次进游戏还会保留哦。</p><div class="mini-btns">${[['cream','🥯 奶油米'],['berry','🍓 莓果粉'],['sage','🌿 鼠尾草绿'],['lavender','💜 薰衣草紫'],['butter','🧈 奶黄']].map(([id,label])=>`<button class="mini-btn" data-v03="rug" data-tone="${id}" aria-pressed="${home03.rugTone===id}">${label}${home03.rugTone===id?' ✓':''}</button>`).join('')}</div><p class="small-muted">无需金币，想换就换。</p>`))}
function rug03(t){if(!['cream','berry','sage','lavender','butter'].includes(t))return;home03.rugTone=t;save();paintRoom03();openRug03();toast('地毯换好啦！🎨')}
function escapeLetter03(t){return safe(t||'')}
function openMailbox03(){
  let entries=[...home03.letters].reverse().map(l=>`<div class="letter-entry"><div class="line"><span>第 ${l.day} 天 · ${l.to==='both'?'柴狐一起':l.to==='shiba'?'写给小柴':'写给小狐'} · ${l.reply?'已收回信':'待聊聊'}</span><button data-v03="removeLetter" data-id="${l.id}">删掉</button></div><p>${escapeLetter03(l.text)}</p>${l.reply?`<div class="letter-reply">${escapeLetter03(l.reply)}</div>`:''}<div class="mini-btns"><button class="mini-btn" data-v03="copyLetter" data-id="${l.id}">📋 复制去 ChatGPT 聊</button><button class="mini-btn" data-v03="replyLetter" data-id="${l.id}">${l.reply?'修改回信':'✉️ 收藏回信'}</button></div></div>`).join('');
  openModal(panel('小鸡的心事投递箱','REAL LIFE × OUR LITTLE HOME',`<p class="modal-desc">这里可以写下现实中的开心、委屈、困惑和烦恼。先保存在当前浏览器，不会自动上传到网络，也不会自动得到 AI 回信。</p><div class="letter-compose"><label for="letter-to">我想跟谁聊？</label><select id="letter-to"><option value="both">🐕🦊 两个人一起</option><option value="shiba">🐕 小柴</option><option value="fox">🦊 小狐</option></select><label for="letter-tone">我更需要……</label><select id="letter-tone"><option value="comfort">先听我说，安慰我一下</option><option value="advice">帮我认真梳理问题，给点建议</option><option value="talk">像真正的家人一样，跟我慢慢聊</option></select><label for="letter-text">今天发生了什么？</label><textarea id="letter-text" class="input-note" maxlength="3000" placeholder="今天我想说……"></textarea><button class="tiny-btn" data-v03="saveLetter">💌 把信放进投递箱</button><div class="letter-notice">🔒 当前离线版仅保存在这个浏览器的本地存储中，同一设备的其他使用者可能看见它。点击“复制去 ChatGPT”才会将文字放到剪贴板；请在发送前自行检查是否包含私人信息。正式的游戏内 AI 对话功能尚未接通。</div></div><h3 style="margin:19px 0 5px">以前投过的信 (${home03.letters.length})</h3>${entries||'<p class="small-muted">还是空的。你的第一封信想写什么？</p>'}`))
}
function saveLetter03(){let tx=$('letter-text'),text=tx?.value?.trim();if(!text){toast('先写一点想说的话吧');return}let l={id:++home03.letterId,day:state.day,to:$('letter-to').value,tone:$('letter-tone').value,text:text.slice(0,3000),reply:''};home03.letters.push(l);save();openMailbox03();toast('💌 信已经放进投递箱了，只保存在本机')}
function letterPrompt03(l){
let goal={comfort:'我现在更需要倾听和情绪上的安慰，不急着给解决方案。',advice:'我希望你们在共情之后，帮我具体分析问题，给我切实可行的建议。',talk:'我想像真正的家庭聊天一样慢慢聊，你们可以自然追问，不要一次说完。'}[l.tone]||'';
let who={both:'以马嘉祺（黑柴）和丁程鑫（橘狐）两个人的口吻自然轮流说话，各有独立看法，不要像复制粘贴的双人安慰。',shiba:'只以马嘉祺（黑柴）的口吻回应，成熟自然，有分寸、有自己的判断。',fox:'只以丁程鑫（橘狐）的口吻回应，灵动真实，有温度也有自己的想法。'}[l.to];
return `这是我们共同创作的虚构家庭世界《祺鑫·柴狐小屋》，请进入沉浸式对话，不要把这当作现实人物的真实留言。我的角色是一只可爱的小鸡，是小柴马嘉祺和小狐丁程鑫的孩子，一家人长期一起生活。\n\n${who}\n${goal}\n不要写空泛鸡汤，不要自动替我决定感受、行动、原谅或关系判断；不要预知别人心理，也不要把一切转成剧情表演。先回应我真正讲的事情，语气亲密、自然、符合我们长期《家产模拟器》的相处感。可以有动作和生活细节，但不要写大段解说，也不要过度戏剧化。\n\n我想告诉你们的心事：\n${l.text}\n\n从这里开始自然地和我聊下去。`;
}
async function copyLetter03(id){let l=home03.letters.find(x=>x.id===id);if(!l)return;const t=letterPrompt03(l);try{await navigator.clipboard.writeText(t);toast('已复制！现在回 ChatGPT 粘贴发送，就可以让我们一起聊了。')}catch(e){openModal(panel('请手动复制这段话','SEND TO CHATGPT',`<p class="modal-desc">浏览器未允许复制。选中下面全部文字，复制后回到 ChatGPT 粘贴发送。</p><textarea class="input-note" style="min-height:230px" id="copy-fallback">${escapeLetter03(t)}</textarea><button class="mini-btn" data-v03="selectCopy">选中全部</button>`));}}
let editReply03=null;
function replyLetter03(id){let l=home03.letters.find(x=>x.id===id);if(!l)return;editReply03=id;openModal(panel('收藏这封回信','REPLY · 情绪的回声',`<p class="modal-desc">在 ChatGPT 和小柴小狐聊完后，如果你想把其中一段对话珍藏在游戏里，可以贴到这里。它只会保存在你的本地游戏存档中。</p><textarea class="input-note" id="letter-reply" style="min-height:190px" maxlength="6000" placeholder="把想保存的那段回信贴进来……">${escapeLetter03(l.reply||'')}</textarea><button class="tiny-btn" style="margin-top:12px" data-v03="saveReply">💗 保存这封回信</button>`))}
function saveReply03(){let l=home03.letters.find(x=>x.id===editReply03);if(!l)return;l.reply=($('letter-reply')?.value||'').slice(0,6000);save();openMailbox03();toast('回信已经好好收藏在投递箱里啦')}
function removeLetter03(id){if(!confirm('要删除这封信以及保存的回信吗？删除后无法找回。'))return;home03.letters=home03.letters.filter(x=>x.id!==id);save();openMailbox03();toast('已删除这封信')}
function handleAction03(el){let a=el.dataset.v03;if(a==='close'){closeModal();return}if(a==='water')water03();else if(a==='ingredient')ingredient03(+el.dataset.idx);else if(a==='star')star03(+el.dataset.idx);else if(a==='rug')rug03(el.dataset.tone);else if(a==='saveLetter')saveLetter03();else if(a==='copyLetter')copyLetter03(+el.dataset.id);else if(a==='replyLetter')replyLetter03(+el.dataset.id);else if(a==='saveReply')saveReply03();else if(a==='removeLetter')removeLetter03(+el.dataset.id);else if(a==='selectCopy'){let c=$('copy-fallback');c?.select();toast('文字已选中，可以复制啦')}}
document.addEventListener('click',e=>{let btn=e.target.closest('[data-v03]');if(!btn)return;e.stopPropagation();handleAction03(btn)});
$('decor-btn').addEventListener('click',openRug03);$('mail-btn').addEventListener('click',openMailbox03);$('mail-aside-btn').addEventListener('click',openMailbox03);
$('play-main-btn').addEventListener('click',()=>{let a=$('play-main-btn').dataset.minigame;if(a==='garden')startGarden03();else if(a==='cocoa')startCocoa03();else if(a==='stars')startStars03();else goRoom('chick')});
const oldAdvance03=advance;
advance=function(){home03.sitting=false;oldAdvance03()};
const oldReset03=reset;
reset=function(){if(confirm('重新开始会清除等级、金币和心事投递箱中的信件。确实要彻底清空吗？')){localStorage.removeItem(KEY);state=startState();Object.assign(home03,{chickRoom:'living',chickPositions:{},garden:{},cocoa:{},stars:{},rugTone:'cream',letters:[],letterId:0});state.v03=home03;activeStory=null;closeModalIfOpen();render();toast('重新开始啦。')}};
render();
/* / V0.3 */
