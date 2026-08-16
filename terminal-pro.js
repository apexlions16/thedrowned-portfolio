(()=>{'use strict';
const term=document.querySelector('#terminal'),out=document.querySelector('#termOut'),input=document.querySelector('#termInput');
if(!term||!out||!input)return;
const promptEl=input.parentElement?.querySelector('span');
const head=term.querySelector('.terminal-head b');if(head)head.textContent='TERMINAL — CMD / JS';
const style=document.createElement('style');style.textContent=`
#terminal{--term-bg:#0c0c0c;--term-fg:#cccccc;background:var(--term-bg)!important;color:var(--term-fg)!important}
#terminal .terminal-head{background:color-mix(in srgb,var(--term-bg) 86%,#fff 14%);color:var(--term-fg)!important}
#terminal .terminal-head button,#terminal .term-out,#terminal .term-input,#terminal .term-input span,#terminal .term-input input{color:var(--term-fg)!important}
#terminal .term-out{background:var(--term-bg)!important;white-space:pre-wrap!important;font-family:Consolas,"Cascadia Code",monospace!important;line-height:1.48!important;user-select:text}
#terminal .term-input{background:var(--term-bg)!important;border-top:1px solid color-mix(in srgb,var(--term-fg) 18%,transparent)!important}
#terminal .term-input input{caret-color:var(--term-fg)!important;font-family:Consolas,"Cascadia Code",monospace!important}
#terminal.open{height:min(360px,48vh)!important}.term-out{height:calc(100% - 66px)!important}
@media(max-width:860px){#terminal.open{height:52dvh!important}.term-out{height:calc(52dvh - 66px)!important}}
`;document.head.appendChild(style);

const COLORS={0:'#000000',1:'#0000aa',2:'#00aa00',3:'#00aaaa',4:'#aa0000',5:'#aa00aa',6:'#aa5500',7:'#aaaaaa',8:'#555555',9:'#5555ff',A:'#55ff55',B:'#55ffff',C:'#ff5555',D:'#ff55ff',E:'#ffff55',F:'#ffffff'};
let cwd='C:\\Users\\Hasan';
const dirs=new Set(['C:','C:\\Users','C:\\Users\\Hasan','C:\\Users\\Hasan\\Desktop','C:\\Users\\Hasan\\Documents','C:\\Users\\Hasan\\Projects','C:\\Users\\Hasan\\Backups']);
const files=new Map([
 ['C:\\Users\\Hasan\\Desktop\\portfolio.url','https://apexlions16.github.io/thedrowned-portfolio/'],
 ['C:\\Users\\Hasan\\Documents\\nowiland.txt','https://www.nowiland.com/'],
 ['C:\\Users\\Hasan\\Projects\\about.txt',"Odium Stüdyo'da Full Stack Developer olarak çalışıyorum. Web tasarımı, reverse engineering ve yüksek seviye yazılım analizi üzerine yoğunlaşıyorum."],
 ['C:\\Users\\Hasan\\Projects\\skills.json','{"Reverse_Engineering":"Static / Dynamic Analysis","C++":"Native / Low-Level Programming"}']
]);
const env={USERNAME:'Hasan',USERPROFILE:'C:\\Users\\Hasan',COMPUTERNAME:'ODIUM-WORKSTATION',OS:'BrowserOS',SHELL:'Portfolio Terminal',PATH:'C:\\Portfolio\\bin'};
let history=[];try{history=JSON.parse(localStorage.getItem('portfolioTerminalHistory')||'[]')}catch{}let historyIndex=history.length;
const aliases={cls:'clear',ls:'dir',pwd:'cd',cat:'type',md:'mkdir',rd:'rmdir',erase:'del',rm:'del',mv:'move',ren:'rename',node:'js'};
function saveHistory(){localStorage.setItem('portfolioTerminalHistory',JSON.stringify(history.slice(-100)))}
function write(text=''){out.textContent+=(out.textContent?'\n':'')+String(text);out.scrollTop=out.scrollHeight}
function clear(){out.textContent=''}
function updatePrompt(){if(promptEl)promptEl.textContent=cwd+'>'}
function norm(path){path=String(path||'').trim().replace(/^"|"$/g,'').replace(/\//g,'\\');let parts;if(/^[A-Za-z]:/.test(path)){parts=path.split('\\')}else{parts=(cwd+'\\'+path).split('\\')}const root=parts.shift()||'C:';const stack=[];for(const p of parts){if(!p||p==='.')continue;if(p==='..'){stack.pop();continue}stack.push(p)}return root+(stack.length?'\\'+stack.join('\\'):'')}
function parent(path){const i=path.lastIndexOf('\\');return i<2?path.slice(0,2):path.slice(0,i)}
function base(path){const i=path.lastIndexOf('\\');return i<0?path:path.slice(i+1)}
function expandEnv(s){return s.replace(/%([^%]+)%/g,(_,k)=>env[k.toUpperCase()]??`%${k}%`)}
function listDir(path){path=norm(path||cwd);if(!dirs.has(path))return null;const childDirs=[...dirs].filter(d=>d!==path&&parent(d)===path).sort();const childFiles=[...files.keys()].filter(f=>parent(f)===path).sort();return{childDirs,childFiles}}
function formatDir(path){const data=listDir(path);if(!data)return `File Not Found: ${path}`;const rows=[` Volume in drive ${path.slice(0,2)} is PORTFOLIO`,` Directory of ${path}`,''];data.childDirs.forEach(d=>rows.push(`16.08.2026  12:00    <DIR>          ${base(d)}`));data.childFiles.forEach(f=>rows.push(`16.08.2026  12:00             ${String(files.get(f)).length.toString().padStart(6)} ${base(f)}`));rows.push('',`${data.childFiles.length} File(s)    ${data.childDirs.length} Dir(s)`);return rows.join('\n')}
function tree(path=cwd,prefix=''){path=norm(path);if(!dirs.has(path))return `Path not found: ${path}`;const data=listDir(path),lines=[base(path)||path];data.childDirs.forEach((d,i)=>{const last=i===data.childDirs.length-1&&data.childFiles.length===0;const branch=last?'└── ':'├── ';lines.push(prefix+branch+base(d));const sub=tree(d,prefix+(last?'    ':'│   ')).split('\n').slice(1);lines.push(...sub)});data.childFiles.forEach((f,i)=>lines.push(prefix+(i===data.childFiles.length-1?'└── ':'├── ')+base(f)));return lines.join('\n')}
function setColor(arg='07'){arg=arg.trim().toUpperCase();if(arg===''){arg='07'}if(arg.length===1)arg='0'+arg;if(arg.length!==2||!COLORS[arg[0]]||!COLORS[arg[1]]||arg[0]===arg[1]){write('Invalid color. Use COLOR [0-9A-F][0-9A-F], e.g. color A, color 0B.');return}term.style.setProperty('--term-bg',COLORS[arg[0]]);term.style.setProperty('--term-fg',COLORS[arg[1]]);localStorage.setItem('portfolioTerminalColor',arg)}
const savedColor=localStorage.getItem('portfolioTerminalColor');if(savedColor)setColor(savedColor);
function navigateTarget(arg){const q=arg.trim().toLowerCase();const map={projects:'projects',skills:'skills',about:'about',experience:'experience','index.tsx':'hero','about.tsx':'about','skills.json':'skills','projects.tsx':'projects','git-history.log':'experience'};const id=map[q];if(id){document.querySelector(`[href="#${id}"]`)?.click()||document.querySelector(`[data-go="${id}"]`)?.click();write(`${q} açıldı.`);return true}return false}
async function runJS(code){if(!code.trim()){write('Usage: js <JavaScript>');return}try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;let result;try{result=await new AsyncFunction(`"use strict"; return (${code});`)()}catch{result=await new AsyncFunction(`"use strict"; ${code}`)()}if(result!==undefined){if(typeof result==='object'){try{write(JSON.stringify(result,null,2))}catch{write(String(result))}}else write(String(result))}}catch(e){write(`${e.name}: ${e.message}`)}}
function help(topic=''){const docs={color:'COLOR [attr]  Renk değiştirir. Örn: color A, color 0B, color 1F.',js:'JS <code>  Tarayıcı içinde JavaScript çalıştırır. Örn: js 2+2 veya js document.title',dir:'DIR [path]  Sanal klasör içeriğini listeler.',cd:'CD [path]  Sanal çalışma klasörünü değiştirir.',echo:'ECHO metin [> dosya]  Metin yazar; > ve >> ile sanal dosyaya yönlendirilebilir.',set:'SET veya SET NAME=value  Sanal ortam değişkenlerini gösterir/değiştirir.'};if(topic&&docs[topic.toLowerCase()])return docs[topic.toLowerCase()];return [
'Portfolio Terminal Pro — CMD + JavaScript',
'',
'CMD: help, cls/clear, color, echo, dir/ls, cd/chdir/pwd, tree, mkdir/md, rmdir/rd, touch, type/cat, del/erase/rm, copy, move/mv, ren/rename, set, title, ver, date, time, whoami, hostname, history',
'CODE: js/node <JavaScript>, calc <expression>',
'PORTFOLIO: open <file>, projects, skills, about, experience, desktop, theme <dark|light|hc>, start <url|portfolio>, exit',
'',
'Örnek: color A   |   color 0B   |   echo hello > test.txt   |   type test.txt   |   js Math.random()'
].join('\n')}
async function executeOne(raw){raw=expandEnv(raw.trim());if(!raw)return;write(`${cwd}>${raw}`);
 const redir=raw.match(/^echo\s+(.*?)\s*(>>|>)\s*(.+)$/i);if(redir){const text=redir[1],op=redir[2],path=norm(redir[3]);const p=parent(path);if(!dirs.has(p)){write('The system cannot find the path specified.');return}files.set(path,op==='>>'?(files.get(path)||'')+text+'\n':text);return}
 const m=raw.match(/^([^\s]+)(?:\s+(.*))?$/),name=(m?.[1]||'').toLowerCase(),arg=m?.[2]||'',cmd=aliases[name]||name;
 if(cmd==='help'){write(help(arg));return}if(cmd==='clear'){clear();return}if(cmd==='color'){setColor(arg);return}if(cmd==='echo'){write(arg.replace(/^on$|^off$/i,''));return}
 if(cmd==='dir'){write(formatDir(arg?norm(arg):cwd));return}if(cmd==='cd'||cmd==='chdir'){if(!arg){write(cwd);return}const p=norm(arg);if(dirs.has(p)){cwd=p;updatePrompt()}else write('The system cannot find the path specified.');return}
 if(cmd==='tree'){write(tree(arg||cwd));return}if(cmd==='mkdir'){if(!arg){write('The syntax of the command is incorrect.');return}const p=norm(arg);if(!dirs.has(parent(p))){write('The system cannot find the path specified.');return}dirs.add(p);return}
 if(cmd==='rmdir'){let target=arg.replace(/^\/s\s+/i,'').trim(),recursive=/^\/s\s+/i.test(arg);if(!target){write('The syntax of the command is incorrect.');return}const p=norm(target);const hasChildren=[...dirs].some(d=>d!==p&&d.startsWith(p+'\\'))||[...files.keys()].some(f=>f.startsWith(p+'\\'));if(hasChildren&&!recursive){write('The directory is not empty. Use rmdir /s <folder>.');return}if(recursive){[...dirs].filter(d=>d===p||d.startsWith(p+'\\')).forEach(d=>dirs.delete(d));[...files.keys()].filter(f=>f.startsWith(p+'\\')).forEach(f=>files.delete(f))}else dirs.delete(p);return}
 if(cmd==='touch'){if(!arg)return write('Usage: touch <file>');const p=norm(arg);if(!dirs.has(parent(p)))return write('Path not found.');if(!files.has(p))files.set(p,'');return}
 if(cmd==='type'){const p=norm(arg);write(files.has(p)?files.get(p):'The system cannot find the file specified.');return}
 if(cmd==='del'){const p=norm(arg);if(files.delete(p))return;write('Could Not Find '+p);return}
 if(cmd==='copy'||cmd==='move'||cmd==='rename'){const parts=arg.match(/"[^"]+"|\S+/g)||[];if(parts.length<2)return write(`Usage: ${cmd} <source> <destination>`);const src=norm(parts[0]),dest=norm(parts[1]);if(!files.has(src))return write('The system cannot find the file specified.');if(!dirs.has(parent(dest)))return write('Destination path not found.');files.set(dest,files.get(src));if(cmd!=='copy')files.delete(src);write('        1 file(s) processed.');return}
 if(cmd==='set'){if(!arg){write(Object.keys(env).sort().map(k=>`${k}=${env[k]}`).join('\n'));return}const i=arg.indexOf('=');if(i<1){const k=arg.toUpperCase();write(env[k]!==undefined?`${k}=${env[k]}`:'Environment variable not defined.');return}env[arg.slice(0,i).trim().toUpperCase()]=arg.slice(i+1);return}
 if(cmd==='title'){document.title=arg||'thedrowned — Portfolio';write(`Title: ${document.title}`);return}if(cmd==='ver'){write('Portfolio Terminal [Version 1.0.2026] — Browser Runtime');return}if(cmd==='date'){write(new Date().toLocaleDateString('tr-TR',{weekday:'long',year:'numeric',month:'long',day:'numeric'}));return}if(cmd==='time'){write(new Date().toLocaleTimeString('tr-TR'));return}if(cmd==='whoami'){write('odium\\hasan');return}if(cmd==='hostname'){write(env.COMPUTERNAME);return}if(cmd==='history'){write(history.map((h,i)=>`${String(i+1).padStart(3)}  ${h}`).join('\n'));return}
 if(cmd==='calc'){try{if(!/^[0-9+\-*/%().\s**]+$/.test(arg))throw new Error('Unsupported characters');const v=Function(`"use strict";return (${arg})`)();write(String(v))}catch(e){write('Calc error: '+e.message)}return}
 if(cmd==='js'){await runJS(arg);return}if(cmd==='open'){if(!navigateTarget(arg))write('Dosya/section bulunamadı: '+arg);return}if(['projects','skills','about','experience'].includes(cmd)){navigateTarget(cmd);return}
 if(cmd==='desktop'){document.querySelector('#desktopBtn')?.click();return}if(cmd==='theme'){const b=document.querySelector(`[data-theme="${arg.toLowerCase()}"]`);if(b){b.click();write('Tema: '+arg.toLowerCase())}else write('Usage: theme <dark|light|hc>');return}
 if(cmd==='start'){if(!arg||arg.toLowerCase()==='portfolio'){write('Portfolio zaten açık.');return}if(/^https?:\/\//i.test(arg)){window.open(arg,'_blank','noopener');write('Opening '+arg);return}if(navigateTarget(arg))return;write('Cannot start: '+arg);return}
 if(cmd==='exit'){document.querySelector('#terminalClose')?.click();return}if(cmd==='reset'){cwd='C:\\Users\\Hasan';setColor('07');updatePrompt();write('Terminal state reset.');return}
 write(`'${name}' is not recognized as an internal or external command. Type help.`)
}
async function execute(raw){const chunks=raw.split(/\s*&&\s*/).filter(Boolean);for(const c of chunks)await executeOne(c)}
function complete(){const value=input.value,parts=value.split(/\s+/),last=parts.pop()||'';const commands=['help','cls','clear','color','echo','dir','ls','cd','chdir','pwd','tree','mkdir','md','rmdir','rd','touch','type','cat','del','erase','rm','copy','move','mv','ren','rename','set','title','ver','date','time','whoami','hostname','history','calc','js','node','open','projects','skills','about','experience','desktop','theme','start','exit','reset'];let pool;if(parts.length===0)pool=commands;else{const data=listDir(cwd);pool=[...(data?.childDirs||[]).map(base),...(data?.childFiles||[]).map(base)]}const matches=pool.filter(x=>x.toLowerCase().startsWith(last.toLowerCase()));if(matches.length===1){parts.push(matches[0]);input.value=(parts.join(' ')+' ')}else if(matches.length>1)write(matches.join('    '))}
input.onkeydown=async e=>{if(e.key==='Enter'){e.preventDefault();const v=input.value.trim();input.value='';if(!v)return;if(history.at(-1)!==v)history.push(v);history=history.slice(-100);historyIndex=history.length;saveHistory();await execute(v)}else if(e.key==='ArrowUp'){e.preventDefault();if(history.length){historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';queueMicrotask(()=>input.setSelectionRange(input.value.length,input.value.length))}}else if(e.key==='ArrowDown'){e.preventDefault();if(history.length){historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||''}}else if(e.key==='Tab'){e.preventDefault();complete()}else if(e.key==='l'&&(e.ctrlKey||e.metaKey)){e.preventDefault();clear()}};
clear();write('Microsoft Windows [Portfolio Terminal Pro]\n(c) thedrowned / Odium Workstation. Browser-sandboxed terminal.\n\nType HELP for commands. JavaScript: JS <code>');updatePrompt();
})();
