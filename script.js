(function(){
var menu=document.getElementById('menu'),nav=document.getElementById('nav');
menu.addEventListener('click',function(){var o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menu.setAttribute('aria-expanded',false)}});

var inputs=document.querySelectorAll('.calc input'),total=document.getElementById('total');
function calc(){var t=0;inputs.forEach(function(i){t+=(parseFloat(i.value)||0)*parseFloat(i.dataset.p)});total.textContent='GH₵'+t.toFixed(2)}
inputs.forEach(function(i){i.addEventListener('input',calc)});

var d=document.getElementById('date');d.min=new Date().toISOString().slice(0,10);
document.getElementById('form').addEventListener('submit',function(e){
e.preventDefault();
var n=document.getElementById('name').value.trim(),p=document.getElementById('phone').value.trim(),a=document.getElementById('addr').value.trim(),lm=document.getElementById('lm').value.trim(),dt=d.value,err=document.getElementById('err');
if(!n||!dt||(!a&&!lm)){err.textContent='Please enter your name, pickup date, and an address or a landmark.';return}
var digits=p.replace(/[\s-]/g,'').replace(/^\+233/,'0');
if(!/^0\d{9}$/.test(digits)){err.textContent='Enter a Ghana phone number, like 024 123 4567 or +233 24 123 4567.';return}
p=digits.replace(/^(\d{3})(\d{3})(\d{4})$/,'$1 $2 $3');
err.textContent='';
var form=this,svc=document.getElementById('svc').value;
var b={name:n,phone:p,address:a,landmark:lm,service:svc,date:dt,createdAt:Date.now()};
save(b).then(function(shared){
var ok=document.getElementById('ok');
ok.hidden=false;
ok.textContent='Thanks '+n+'. Your '+svc.toLowerCase()+' pickup is requested for '+dt+'. We will call '+p+' to confirm.'+(shared?'':' (Saved on this device only.)');
form.hidden=true;
var again=document.createElement('button');again.type='button';again.className='btn';again.style.marginTop='12px';again.textContent='Book another pickup';
again.addEventListener('click',function(){form.reset();form.hidden=false;ok.hidden=true;ok.textContent='';document.getElementById('name').focus()});
ok.appendChild(document.createElement('br'));ok.appendChild(again);
if(refreshLocal)refreshLocal();
});
});

/* Bookings: shared database when available, this browser otherwise */
var dbp=(window.claude&&claude.use)?claude.use('db').catch(function(){return null}):Promise.resolve(null);
function localList(){try{return JSON.parse(localStorage.getItem('bookings')||'[]')}catch(e){return []}}
var refreshLocal=null;
function save(b){
return dbp.then(function(db){
if(db){
return db.doc('bookings/b'+b.createdAt+Math.random().toString(36).slice(2,6)).set(b).then(function(){return true},function(){return local(b)});
}
return local(b);
});
}
function local(b){try{var l=localList();l.push(b);localStorage.setItem('bookings',JSON.stringify(l))}catch(e){}return false}

/* Admin page: #admin, owner only */
var view=document.getElementById('adminView'),rows=document.getElementById('adminRows'),msg=document.getElementById('adminMsg'),statsEl=document.getElementById('stats');
var all=[],delFn=null,authed=false,fails=0,lockUntil=0,HASH="fc6624726fb2be8d3c69b1bcb67682e747739c42814657bce428992c651bf461";
try{authed=sessionStorage.getItem('adm')==='1'}catch(e){}
function paint(){
var on=location.hash==='#admin';
['header','main','footer'].forEach(function(t){document.querySelector(t).hidden=on});
view.hidden=!on;
if(!on)return;
document.getElementById('adm-login').hidden=authed;
document.getElementById('adm-content').hidden=!authed;
document.getElementById('logout').hidden=!authed;
window.scrollTo(0,0);
}
window.addEventListener('hashchange',paint);
function td(tr,t){var c=document.createElement('td');c.textContent=t;tr.appendChild(c)}
function stat(label,val){var d=document.createElement('div');d.className='stat';var l=document.createElement('span');l.textContent=label;var v=document.createElement('b');v.textContent=val;d.appendChild(l);d.appendChild(v);statsEl.appendChild(d)}
function draw(){
statsEl.textContent='';
var today=new Date().toISOString().slice(0,10),up=all.filter(function(b){return b.date>=today}).map(function(b){return b.date}).sort()[0];
var counts={};all.forEach(function(b){counts[b.service]=(counts[b.service]||0)+1});
var top=Object.keys(counts).sort(function(x,y){return counts[y]-counts[x]})[0];
stat('Total bookings',all.length);stat('Next pickup date',up||'None yet');stat('Most requested',top||'None yet');
var q=document.getElementById('q').value.trim().toLowerCase(),f=document.getElementById('filter').value;
var list=all.filter(function(b){return (!f||b.service===f)&&(!q||((b.name||'')+' '+(b.phone||'')+' '+(b.address||'')+' '+(b.landmark||'')).toLowerCase().indexOf(q)>-1)});
list.sort(function(x,y){return (y.createdAt||0)-(x.createdAt||0)});
rows.textContent='';
if(!list.length){var tr=document.createElement('tr'),c=document.createElement('td');c.colSpan=8;c.textContent=all.length?'No bookings match your search.':'No bookings yet. New pickups appear here.';tr.appendChild(c);rows.appendChild(tr);return}
list.forEach(function(b){
var tr=document.createElement('tr');
td(tr,new Date(b.createdAt||0).toLocaleString());td(tr,b.name||'');
var pc=document.createElement('td'),pa=document.createElement('a');pa.href='tel:'+(b.phone||'').replace(/\s/g,'');pa.textContent=b.phone||'';pc.appendChild(pa);tr.appendChild(pc);
td(tr,b.address||'');td(tr,b.landmark||'');td(tr,b.service||'');td(tr,b.date||'');
var c=document.createElement('td'),x=document.createElement('button');x.textContent='Done';x.setAttribute('aria-label','Remove booking for '+(b.name||'customer'));x.addEventListener('click',function(){delFn&&delFn(b)});c.appendChild(x);tr.appendChild(c);rows.appendChild(tr);
});
}
document.getElementById('q').addEventListener('input',draw);
document.getElementById('filter').addEventListener('change',draw);
function sha(t){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
document.getElementById('loginForm').addEventListener('submit',function(e){
e.preventDefault();
var err=document.getElementById('aerr'),u=document.getElementById('au').value.trim().toLowerCase(),pw=document.getElementById('ap').value;
if(Date.now()<lockUntil){err.textContent='Too many attempts. Wait 30 seconds and try again.';return}
sha(u+':'+pw).then(function(h){
if(h===HASH){
fails=0;err.textContent='';authed=true;try{sessionStorage.setItem('adm','1')}catch(x){}
document.getElementById('ap').value='';paint();
}else{
fails++;document.getElementById('ap').value='';
if(fails>=5){lockUntil=Date.now()+30000;fails=0;err.textContent='Too many attempts. Wait 30 seconds and try again.'}
else err.textContent='Wrong username or password.';
}
},function(){err.textContent='Login is not available in this browser.'});
});
document.getElementById('logout').addEventListener('click',function(){
authed=false;try{sessionStorage.removeItem('adm')}catch(x){}
document.getElementById('au').value='';paint();
});
function localMode(){
msg.textContent='Showing bookings saved in this browser only.';
var load=function(){all=localList();draw()};refreshLocal=load;
delFn=function(b){localStorage.setItem('bookings',JSON.stringify(localList().filter(function(x){return x.createdAt!==b.createdAt})));load()};
load();
}
paint();
dbp.then(function(db){
if(db){
msg.textContent='Bookings from signed-in visitors of this page.';
delFn=function(b){db.doc('bookings/'+b._id).delete()};
db.collection('bookings').onSnapshot(function(s){
all=s.docs.map(function(d){var o=Object.assign({},d.data());o._id=d.id;return o});draw();
},function(){msg.textContent='Could not load shared bookings.';all=[];draw()});
}else{localMode()}
});
})();
