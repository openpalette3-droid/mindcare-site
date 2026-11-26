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
 try{sessionStorage.setItem("mc_intake",JSON.stringify({answers:a}))}catch(e){}
 
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
    msg.textContent = r.ok ? "Account created. Your first chat is free." : (j.error || "Something went wrong. Try again.");
  }catch(err){msg.textContent="Can't reach the server. Check your connection and try again."}
});

}
