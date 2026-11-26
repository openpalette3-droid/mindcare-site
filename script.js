// Leave empty for demo mode. After deploying the back end, set to its URL, e.g. "https://api.mindcare.rw"
const API_BASE = "https://mindcare-backend-wjl7.onrender.com";
const tabs=document.querySelectorAll(".tab"),cat=document.getElementById("cat");
function showTab(i){tabs.forEach((t,n)=>{t.setAttribute("aria-selected",n==i);document.getElementById("p"+n).hidden=n!=i})}
tabs.forEach(t=>t.addEventListener("click",()=>showTab(+t.dataset.i)));
function sync(){const hf=document.getElementById("hospitalField");if(hf&&cat)hf.style.display=cat.value==="hospital"?"grid":"none"}
if(cat){cat.addEventListener("change",sync);
 const p=new URLSearchParams(location.search).get("cat");let it=null;try{it=JSON.parse(sessionStorage.getItem("mc_intake")||"null")}catch(e){}
 if(p)cat.value=p;else if(it&&it.answers&&it.answers.care==="doctor")cat.value="hospital";sync()}
if(document.getElementById("opts")){
const Q=[
{k:"concerns",m:1,t:"What has been on your mind?",h:"Choose up to 3.",o:[["stress","Stress"],["anxiety","Constant worry or anxiety"],["mood","Low mood or sadness"],["trauma","Trauma or grief"],["relationships","Relationships or family"],["pressure","School or work pressure"],["sleep","Sleep problems"],["substance","Alcohol or drug use"],["other","Something else"]]},
{k:"duration",t:"How long has this been going on?",o:[["new","Less than 2 weeks"],["weeks","2 weeks to 3 months"],["months","3 to 12 months"],["year","More than a year"]]},
{k:"impact",t:"How much is it affecting your daily life?",o:[["low","Not much"],["some","A little"],["high","A lot"],["severe","I can barely get through the day"]]},
{k:"safety",t:"In the last 2 weeks, have you had thoughts of harming yourself or ending your life?",h:"We ask everyone this. There is no wrong answer.",o:[["no","No"],["sometimes","Sometimes"],["often","Yes, often or right now"]]},
{k:"care",t:"Are you already seeing a doctor or taking medication for this?",o:[["none","No"],["doctor","I see a doctor"],["meds","I take medication"]]},
{k:"language",t:"Which language do you prefer?",o:[["rw","Kinyarwanda"],["en","English"],["any","Either"]]},
{k:"format",t:"How would you like to meet?",o:[["video","Video"],["voice","Voice call"],["chat","Chat"]]},
{k:"gender",t:"Do you prefer a woman or a man as your therapist?",o:[["f","A woman"],["m","A man"],["any","No preference"]]}
];
let qi=0;const A={};const $=id=>document.getElementById(id);
function upd(){const q=Q[qi],c=[...document.querySelectorAll("#opts input:checked")].map(x=>x.value);A[q.k]=q.m?c:(c[0]||null);$("next").disabled=!c.length}
function renderQ(){const q=Q[qi],cur=A[q.k]||(q.m?[]:null);
 $("qcount").textContent="Question "+(qi+1)+" of "+Q.length;$("bar").style.width=(qi/Q.length*100)+"%";
 $("qtext").textContent=q.t;$("qhint").textContent=q.h||"";
 $("opts").innerHTML=q.o.map(([v,l])=>'<label class="opt"><input type="'+(q.m?"checkbox":"radio")+'" name="q" value="'+v+'"'+((q.m?cur.includes(v):cur===v)?" checked":"")+'> '+l+'</label>').join("");
 $("back").style.visibility=qi?"visible":"hidden";$("next").textContent=qi==Q.length-1?"See my match":"Next";upd()}
$("opts").addEventListener("change",e=>{if(Q[qi].m&&document.querySelectorAll("#opts input:checked").length>3)e.target.checked=false;upd()});
$("back").onclick=()=>{qi--;renderQ()};
$("next").onclick=()=>{if(qi<Q.length-1){qi++;renderQ()}else finish()};
function finish(){const a=A,c=a.concerns||[],risk=a.safety!=="no";
 const doc=risk||a.impact==="severe"||a.care!=="none"||c.includes("substance");
 let pro="Counselling therapist";
 if(c.includes("trauma"))pro="Trauma-informed psychologist";
 else if(c.includes("relationships"))pro="Relationship and family counsellor";
 else if(c.includes("pressure")&&!c.includes("mood")&&!c.includes("anxiety"))pro="Counsellor for school and work stress";
 const lang={rw:"Kinyarwanda",en:"English",any:"Kinyarwanda or English"}[a.language],fmt={video:"video",voice:"voice call",chat:"chat"}[a.format],g={f:"a woman",m:"a man",any:"any available therapist"}[a.gender];
 const group=!doc&&(c.includes("stress")||c.includes("pressure"));
 let h="";
 if(risk)h+='<div class="urgent"><h3>Thank you for telling us</h3><p>You deserve support today, not only a booking. Please call the MindCare toll-free line now, go to your nearest health centre or hospital, or tell someone you trust who can stay with you. We have also marked your answers for priority review by our clinical lead.</p></div>';
 h+='<h3>Your suggested match</h3><ul class="mlist"><li><b>Who:</b> '+pro+(doc?', with a doctor or psychiatrist to review your care':'')+'</li><li><b>How:</b> '+fmt+' sessions in '+lang+'</li><li><b>Therapist:</b> '+g+'</li>'+(group?'<li><b>Also helpful:</b> group sessions</li>':'')+(a.care!=="none"?'<li><b>Your doctor:</b> with your consent, we can coordinate with them</li>':'')+'</ul><p class="lead">A licensed clinician confirms this match before your first session. It is a starting point, not a diagnosis. Your first chat is free.</p><p><a class="btn" href="join.html">Create account to book</a></p>';
 $("result").innerHTML=h;$("result").hidden=false;$("qbox").hidden=true;
 try{sessionStorage.setItem("mc_intake",JSON.stringify({answers:a}))}catch(e){}if(typeof tok==="function"&&tok())api("/api/intake",{method:"POST",body:JSON.stringify({answers:a})});
 
 $("result").scrollIntoView({behavior:"smooth",block:"start"})}
renderQ();


}
if(document.getElementById("f")){
document.getElementById("f").addEventListener("submit", async e=>{
  e.preventDefault();
  const msg = document.getElementById("msg");
  const d = Object.fromEntries(new FormData(e.target));try{d.intake=JSON.parse(sessionStorage.getItem("mc_intake")||"null")}catch(x){d.intake=null}
  if(!d.name || !d.contact || d.password.length<8){msg.textContent="Enter a name or nickname, your email or phone, and a password of 8+ characters.";return}
  if(d.category==="hospital" && (!d.hospital || !d.patientNumber)){msg.textContent="Enter your hospital and patient number.";return}
  if(!API_BASE){msg.textContent="Demo mode: no account was created. Connect the back end to go live.";return}
  try{
    const r = await fetch(API_BASE+"/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});
    const j = await r.json();
    if(r.ok){try{localStorage.setItem("mc_token",j.token)}catch(x){}msg.textContent="Account created. Taking you to your account…";setTimeout(()=>{location.href="account.html"},1200)}else msg.textContent=j.error||"Something went wrong. Try again.";
  }catch(err){msg.textContent="Can't reach the server. Check your connection and try again."}
});

}

// ---------- login, account and clinical team pages ----------
const tok=()=>{try{return localStorage.getItem("mc_token")}catch(e){return null}};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const D={low:"Not much",some:"A little",high:"A lot",severe:"Can barely get through the day",no:"No",sometimes:"Sometimes",often:"Yes, often or right now",none:"No doctor or medication",doctor:"Sees a doctor",meds:"Takes medication",rw:"Kinyarwanda",en:"English",any:"Either",video:"Video",voice:"Voice call",chat:"Chat",f:"A woman",m:"A man",new:"Less than 2 weeks",weeks:"2 weeks to 3 months",months:"3 to 12 months",year:"More than a year"};
const dd=v=>D[v]||v||"";
const CL={stress:"Stress",anxiety:"Anxiety",mood:"Low mood",trauma:"Trauma or grief",relationships:"Relationships",pressure:"School or work pressure",sleep:"Sleep",substance:"Alcohol or drug use",other:"Other"};
async function api(path,opt){opt=opt||{};const h={"Content-Type":"application/json"};if(tok())h.Authorization="Bearer "+tok();const r=await fetch(API_BASE+path,{method:opt.method||"GET",headers:h,body:opt.body});let j={};try{j=await r.json()}catch(e){}return{ok:r.ok,status:r.status,j:j}}
function logout(){try{localStorage.removeItem("mc_token")}catch(e){}location.href="index.html"}
const na=document.getElementById("navAuth");
if(na&&tok()){na.textContent="My account";na.href="account.html"}

const lf=document.getElementById("loginForm");
if(lf)lf.addEventListener("submit",async e=>{e.preventDefault();const m=document.getElementById("lmsg");const d=Object.fromEntries(new FormData(lf));
 if(!API_BASE){m.textContent="Demo mode: connect the back end to log in.";return}
 m.textContent="Logging in…";
 try{const r=await api("/api/login",{method:"POST",body:JSON.stringify(d)});
  if(r.ok){try{localStorage.setItem("mc_token",r.j.token)}catch(x){}location.href="account.html"}
  else m.textContent=r.j.error||"Could not log in."}
 catch(x){m.textContent="Can’t reach the server. Wait a minute and try again."}});

function renderAcct(u){
 const i=u.intake,a=(i&&i.answers)||{};
 let h='<p class="lead">Hello, <b>'+esc(u.display_name)+'</b>.</p>';
 if(!i){h+='<div class="card s" style="margin-top:20px"><h3>Let’s find your match</h3><p>Answer eight short, private questions so we can match you with the right therapist or doctor.</p><p style="margin-top:14px"><a class="btn" href="match.html">Start the questions</a></p></div>'}
 else{
  if(i.urgent)h+='<div class="urgent" style="margin-top:20px"><h3>We are thinking of you</h3><p>You deserve support today. Please call the MindCare toll-free line now, go to your nearest health centre or hospital, or tell someone you trust who can stay with you. Our clinical lead has been told to review your answers first.</p></div>';
  h+='<div class="card k" style="margin-top:20px"><h3>Your suggested match</h3><ul class="mlist"><li><b>Who:</b> '+esc(i.professional)+(i.needs_doctor?', with a doctor or psychiatrist to review your care':'')+'</li><li><b>How:</b> '+esc(dd(a.format))+' sessions in '+esc(dd(a.language))+'</li><li><b>Therapist:</b> '+esc(dd(a.gender))+'</li></ul><p><b>Status:</b> '+(i.status==="assigned"?'You have been matched with <b>'+esc(i.assigned_to||"our team")+'</b>. We will contact you to book your free first chat.':i.status==="closed"?'This request is closed. Answer the questions again if you need us.':'Our clinical team is reviewing your answers and will confirm your match soon.')+'</p></div>'}
 if(u.category==="hospital")h+='<div class="card l" style="margin-top:16px"><h3>Your hospital</h3><p>'+esc(u.hospital_name||"")+': '+(u.hospital_verified?'your link is confirmed.':'waiting for confirmation. This can take a few days.')+'</p></div>';
 h+='<p style="margin-top:26px"><a class="btn ghost sm" href="match.html">Answer the questions again</a> <button class="btn ghost sm" type="button" onclick="logout()">Log out</button>'+(u.isClinical?' <a class="btn sm" href="clinic.html">Clinical team page</a>':'')+'</p>';
 return h}
const ac=document.getElementById("acct");
if(ac)(async()=>{
 if(!tok()){location.href="login.html";return}
 try{let r=await api("/api/me");
  if(r.status===401||r.status===404){try{localStorage.removeItem("mc_token")}catch(x){}location.href="login.html";return}
  if(!r.ok){ac.innerHTML='<p class="lead">Something went wrong. Please try again in a minute.</p>';return}
  let u=r.j,it=null;try{it=JSON.parse(sessionStorage.getItem("mc_intake")||"null")}catch(x){}
  if(!u.intake&&it&&it.answers){await api("/api/intake",{method:"POST",body:JSON.stringify(it)});const r2=await api("/api/me");if(r2.ok)u=r2.j}
  ac.innerHTML=renderAcct(u)}
 catch(x){ac.innerHTML='<p class="lead">Can’t reach the server. Wait a minute and refresh the page.</p>'}})();

function card(x){const a=x.answers||{};const c=(a.concerns||[]).map(v=>CL[v]||v).join(", ");
 return '<div class="cl'+(x.urgent?' urg':'')+'"><div>'+(x.urgent?'<span class="badge u">Urgent: contact today</span>':'')+(x.needs_doctor?'<span class="badge p">Needs doctor review</span>':'')+'<span class="badge a">'+esc(x.status.replace("_"," "))+'</span></div><h3 style="margin-top:10px">'+esc(x.display_name)+'</h3><dl><dt>Contact</dt><dd>'+esc(x.contact)+'</dd><dt>Group</dt><dd>'+esc(x.category)+(x.hospital_name?' · '+esc(x.hospital_name)+' · patient no. '+esc(x.patient_number)+(x.hospital_verified?' (verified)':' (not verified)'):'')+'</dd><dt>Concerns</dt><dd>'+esc(c)+'</dd><dt>Duration</dt><dd>'+esc(dd(a.duration))+'</dd><dt>Daily impact</dt><dd>'+esc(dd(a.impact))+'</dd><dt>Self-harm thoughts</dt><dd>'+esc(dd(a.safety))+'</dd><dt>Doctor or medication</dt><dd>'+esc(dd(a.care))+'</dd><dt>Preferences</dt><dd>'+esc(dd(a.language))+', '+esc(dd(a.format))+', therapist: '+esc(dd(a.gender))+'</dd><dt>Suggested</dt><dd>'+esc(x.professional)+'</dd><dt>Assigned to</dt><dd>'+esc(x.assigned_to||"Nobody yet")+'</dd></dl><div class="row2"><input id="as-'+x.id+'" placeholder="Name of therapist or doctor" value="'+esc(x.assigned_to||"")+'"><button class="btn sm" data-id="'+x.id+'" data-act="assigned">Save as assigned</button><button class="btn ghost sm" data-id="'+x.id+'" data-act="closed">Close</button></div></div>'}
const cl=document.getElementById("clinic");
async function loadClinic(){
 if(!tok()){location.href="login.html";return}
 try{const r=await api("/api/clinical/intakes");
  if(r.status===401){try{localStorage.removeItem("mc_token")}catch(x){}location.href="login.html";return}
  if(r.status===403){cl.innerHTML='<p class="lead">This page is only for the MindCare clinical team.</p>';return}
  if(!r.ok){cl.innerHTML='<p class="lead">Something went wrong. Please try again in a minute.</p>';return}
  cl.innerHTML=r.j.length?r.j.map(card).join(""):'<p class="lead">No requests yet.</p>'}
 catch(x){cl.innerHTML='<p class="lead">Can’t reach the server. Wait a minute and refresh.</p>'}}
if(cl){loadClinic();
 document.getElementById("refresh").onclick=loadClinic;
 cl.addEventListener("click",async e=>{const b=e.target.closest("button[data-id]");if(!b)return;
  const id=b.dataset.id,act=b.dataset.act,name=document.getElementById("as-"+id).value.trim();
  if(act==="assigned"&&!name){alert("Type the name of the therapist or doctor first.");return}
  b.disabled=true;await api("/api/clinical/intakes/"+id,{method:"POST",body:JSON.stringify({status:act,assignedTo:name})});loadClinic()})}
