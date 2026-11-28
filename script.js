// MindCare site script
const API_BASE = "https://mindcare-backend-wjl7.onrender.com";
const $ = id => document.getElementById(id);
const tok = () => { try { return localStorage.getItem("mc_token") } catch (e) { return null } };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const D = { student: "Student", mutuelle: "Has Mutuelle or insurance", hospital: "Hospital patient", other: "Someone else", low: "Not much", some: "A little", high: "A lot", severe: "Can barely get through the day", no: "No", sometimes: "Sometimes", often: "Yes, often or right now", none: "No doctor or medication", doctor: "Sees a doctor", meds: "Takes medication", rw: "Kinyarwanda", en: "English", any: "Either", video: "Video", voice: "Voice call", chat: "Chat", f: "A woman", m: "A man", new: "Less than 2 weeks", weeks: "2 weeks to 3 months", months: "3 to 12 months", year: "More than a year" };
const dd = v => D[v] || v || "";
const CL = { stress: "Stress", anxiety: "Anxiety", mood: "Low mood", trauma: "Trauma or grief", relationships: "Relationships", pressure: "School or work pressure", sleep: "Sleep", substance: "Alcohol or drug use", other: "Other" };
const PRICES = [["student", "Student (with student ID)", 3000], ["mutuelle_1", "Mutuelle, 1st class", 2000], ["mutuelle_2_3", "Mutuelle, 2nd and 3rd class", 3000], ["mutuelle_4", "Mutuelle, 4th class", 4000], ["other_insurance", "Other insurance (co-pay varies)", null], ["workplace", "Through my workplace", 4000], ["full", "No insurance, individual session", 10000], ["group", "Group session (up to 5 people)", 15000]];
const PAYS = [["momo", "MoMoPay"], ["card", "Visa or Mastercard"], ["cash", "Cash at a partner centre"]];
const ROLE = { therapist: "Therapist", psychologist: "Psychologist", doctor: "Doctor" };
const p2 = n => String(n).padStart(2, "0");
const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const money = v => v === null ? "2,000 to 5,000 RWF" : v.toLocaleString("en-US") + " RWF";
const fmtWhen = iso => { const d = new Date(new Date(iso).getTime() + 7200000); return DN[d.getUTCDay()] + " " + d.getUTCDate() + " " + MN[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " + p2(d.getUTCHours()) + ":00"; };
async function api(path, opt) {
  opt = opt || {}; const h = { "Content-Type": "application/json" }; if (tok()) h.Authorization = "Bearer " + tok();
  const r = await fetch(API_BASE + path, { method: opt.method || "GET", headers: h, body: opt.body }); let j = {};
  try { j = await r.json() } catch (e) {} return { ok: r.ok, status: r.status, j: j };
}
function logout() { try { localStorage.removeItem("mc_token") } catch (e) {} location.href = "index.html" }
const na = $("navAuth"); if (na && tok()) { na.textContent = "My account"; na.href = "account.html"; const ns = $("navStart"); if (ns) ns.style.display = "none"; }
const URGENT = logged => '<div class="urgent"><h3>Thank you for telling us</h3><p>You deserve support today, not only a booking. Please call the MindCare toll-free line now, go to your nearest health centre or hospital, or tell someone you trust who can stay with you. ' + (logged ? "Our clinical lead has been told to review your answers first." : "Your answers are not saved yet. If you create an account, our clinical lead will review your answers first.") + '</p></div>';

// ---------- home: who are you + 8 questions ----------
if ($("opts")) {
  const Q = [
    { k: "who", t: "Who are you?", h: "Choose the one that fits you best.", o: [["student", "A student"], ["mutuelle", "I have Mutuelle de Santé or other insurance"], ["hospital", "A patient at a partner hospital"], ["other", "Someone else (paying myself or through work)"]] },
    { k: "concerns", m: 1, t: "What has been on your mind?", h: "Choose up to 3.", o: [["stress", "Stress"], ["anxiety", "Constant worry or anxiety"], ["mood", "Low mood or sadness"], ["trauma", "Trauma or grief"], ["relationships", "Relationships or family"], ["pressure", "School or work pressure"], ["sleep", "Sleep problems"], ["substance", "Alcohol or drug use"], ["other", "Something else"]] },
    { k: "duration", t: "How long has this been going on?", o: [["new", "Less than 2 weeks"], ["weeks", "2 weeks to 3 months"], ["months", "3 to 12 months"], ["year", "More than a year"]] },
    { k: "impact", t: "How much is it affecting your daily life?", o: [["low", "Not much"], ["some", "A little"], ["high", "A lot"], ["severe", "I can barely get through the day"]] },
    { k: "safety", t: "In the last 2 weeks, have you had thoughts of harming yourself or ending your life?", h: "We ask everyone this. There is no wrong answer.", o: [["no", "No"], ["sometimes", "Sometimes"], ["often", "Yes, often or right now"]] },
    { k: "care", t: "Are you already seeing a doctor or taking medication for this?", o: [["none", "No"], ["doctor", "I see a doctor"], ["meds", "I take medication"]] },
    { k: "language", t: "Which language do you prefer?", o: [["rw", "Kinyarwanda"], ["en", "English"], ["any", "Either"]] },
    { k: "format", t: "How would you like to meet?", o: [["video", "Video"], ["voice", "Voice call"], ["chat", "Chat"]] },
    { k: "gender", t: "Do you prefer a woman or a man as your therapist?", o: [["f", "A woman"], ["m", "A man"], ["any", "No preference"]] }
  ];
  let qi = 0; const A = {};
  const upd = () => { const q = Q[qi], c = [...document.querySelectorAll("#opts input:checked")].map(x => x.value); A[q.k] = q.m ? c : (c[0] || null); $("next").disabled = !c.length };
  const renderQ = () => {
    const q = Q[qi], cur = A[q.k] || (q.m ? [] : null);
    $("qcount").textContent = qi ? "Question " + qi + " of 8" : "Let’s begin";
    $("bar").style.width = (qi / Q.length * 100) + "%"; $("qtext").textContent = q.t; $("qhint").textContent = q.h || "";
    $("opts").innerHTML = q.o.map(([v, l]) => '<label class="opt"><input type="' + (q.m ? "checkbox" : "radio") + '" name="q" value="' + v + '"' + ((q.m ? cur.includes(v) : cur === v) ? " checked" : "") + '> ' + l + '</label>').join("");
    $("back").style.visibility = qi ? "visible" : "hidden"; $("next").textContent = qi == Q.length - 1 ? "Find my match" : "Next"; upd();
  };
  $("opts").addEventListener("change", e => { if (Q[qi].m && document.querySelectorAll("#opts input:checked").length > 3) e.target.checked = false; upd() });
  $("back").onclick = () => { qi--; renderQ() };
  $("next").onclick = () => { if (qi < Q.length - 1) { qi++; renderQ() } else finish() };
  async function finish() {
    const a = A, risk = a.safety !== "no", logged = !!tok();
    try { sessionStorage.setItem("mc_intake", JSON.stringify({ answers: a })) } catch (e) {}
    const go = async () => { if (logged) await api("/api/intake", { method: "POST", body: JSON.stringify({ answers: a }) }); location.href = logged ? "account.html" : "join.html" };
    if (!risk) { $("qbox").innerHTML = '<h3>Thank you</h3><p class="lead">Finding your match…</p>'; go(); return }
    $("qbox").innerHTML = URGENT(logged) + '<p style="margin-top:18px"><button class="btn" id="goNext" type="button">Continue to my match</button></p>'; $("goNext").onclick = go;
  }
  renderQ();
}

// ---------- create account ----------
if ($("f")) {
  const cat = $("cat"); let it = null; try { it = JSON.parse(sessionStorage.getItem("mc_intake") || "null") } catch (e) {}
  const sync = () => { $("hospitalField").style.display = cat.value === "hospital" ? "grid" : "none" };
  const pre = new URLSearchParams(location.search).get("cat") || (it && it.answers && it.answers.who);
  if (pre && [...cat.options].some(o => o.value === pre)) cat.value = pre;
  if (it) $("jh").textContent = "Create your account to meet your match";
  cat.addEventListener("change", sync); sync();
  $("f").addEventListener("submit", async e => {
    e.preventDefault(); const msg = $("msg"), d = Object.fromEntries(new FormData(e.target)); d.intake = it;
    if (!d.name || !d.contact || d.password.length < 8) { msg.textContent = "Enter a name or nickname, your email or phone, and a password of 8+ characters."; return }
    if (d.category === "hospital" && (!d.hospital || !d.patientNumber)) { msg.textContent = "Enter your hospital and patient number."; return }
    msg.textContent = "Creating your account…";
    try {
      const r = await api("/api/signup", { method: "POST", body: JSON.stringify(d) });
      if (r.ok) { try { localStorage.setItem("mc_token", r.j.token) } catch (x) {} msg.textContent = "Account created. Taking you to your match…"; setTimeout(() => { location.href = "account.html" }, 900) }
      else msg.textContent = r.j.error || "Something went wrong. Try again.";
    } catch (x) { msg.textContent = "Can’t reach the server. Wait a minute and try again." }
  });
}

// ---------- log in ----------
if ($("loginForm")) $("loginForm").addEventListener("submit", async e => {
  e.preventDefault(); const m = $("lmsg"), d = Object.fromEntries(new FormData(e.target)); m.textContent = "Logging in…";
  try { const r = await api("/api/login", { method: "POST", body: JSON.stringify(d) });
    if (r.ok) { try { localStorage.setItem("mc_token", r.j.token) } catch (x) {} location.href = "account.html" } else m.textContent = r.j.error || "Could not log in.";
  } catch (x) { m.textContent = "Can’t reach the server. Wait a minute and try again." }
});

// ---------- booking window ----------
function openBooking(mode, u) {
  const t = u.intake.therapist, a = u.intake.answers || {}, first = mode === "first";
  const pre = { student: "student", mutuelle: "mutuelle_2_3", hospital: "mutuelle_2_3", other: "full" }[a.who || u.category] || "full";
  const K = new Date(Date.now() + 7200000), days = [];
  for (let i = 1; days.length < 14; i++) { const d = new Date(Date.UTC(K.getUTCFullYear(), K.getUTCMonth(), K.getUTCDate() + i)); if (d.getUTCDay() !== 0) days.push(d) }
  const iso = (d, h) => d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()) + "T" + p2(h) + ":00:00+02:00";
  const wrap = document.createElement("div"); wrap.className = "mback"; wrap.id = "mback";
  wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><button class="x" id="mx" type="button" aria-label="Close">×</button><h2>' + (first ? "Your free first chat with " : "Book ") + esc(t.name) + '</h2>' +
    (first ? '<p class="lead">Your first chat is free. Pick a time that suits you.</p>' :
      '<h3>1. Choose your session</h3><div id="plist">' + PRICES.map(p => '<label class="opt"><input type="radio" name="pk" value="' + p[0] + '"' + (p[0] === pre ? " checked" : "") + '> <span>' + p[1] + ' · <b>' + money(p[2]) + '</b></span></label>').join("") + '</div><p class="small">We chose the first option for you from your answer to “Who are you?”. Change it if it does not fit.</p>') +
    '<h3>' + (first ? "" : "2. ") + 'Choose a day and time</h3><div class="row2"><select id="mday" aria-label="Day">' + days.map((d, i) => '<option value="' + i + '">' + DN[d.getUTCDay()] + " " + d.getUTCDate() + " " + MN[d.getUTCMonth()] + '</option>').join("") + '</select><select id="mtime" aria-label="Time"></select></div><p class="small">Times are Kigali time.</p>' +
    (first ? "" : '<h3>3. How will you pay?</h3><div id="paylist">' + PAYS.map((p, i) => '<label class="opt"><input type="radio" name="pay" value="' + p[0] + '"' + (i == 0 ? " checked" : "") + '> ' + p[1] + '</label>').join("") + '</div>') +
    '<p style="margin-top:20px"><button class="btn" id="mgo" type="button">' + (first ? "Book my free first chat" : "Confirm booking") + '</button></p><div id="mmsg" role="status" aria-live="polite" style="min-height:24px;font-weight:500;color:var(--accent)"></div></div>';
  document.body.appendChild(wrap);
  const close = () => wrap.remove(); $("mx").onclick = close;
  let taken = new Set();
  const times = () => { const d = days[+$("mday").value]; let o = ""; for (let h = 8; h <= 16; h++) if (!taken.has(new Date(iso(d, h)).getTime())) o += '<option value="' + h + '">' + p2(h) + ":00</option>"; $("mtime").innerHTML = o || '<option value="">No times left</option>' };
  api("/api/booked").then(r => { taken = new Set((r.j || []).map(x => new Date(x).getTime())); times() }); $("mday").onchange = times; times();
  $("mgo").onclick = async () => {
    const h = $("mtime").value; if (!h) { $("mmsg").textContent = "Please choose a day with a free time."; return }
    const body = { kind: first ? "first" : "session", startsAt: iso(days[+$("mday").value], +h) };
    if (!first) { body.priceKey = document.querySelector('input[name="pk"]:checked').value; body.payment = document.querySelector('input[name="pay"]:checked').value }
    $("mgo").disabled = true; $("mmsg").textContent = "Booking…";
    const r = await api("/api/bookings", { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) { $("mgo").disabled = false; $("mmsg").textContent = r.j.error || "Could not book. Try again."; return }
    wrap.querySelector(".modal").innerHTML = '<h2>You’re booked</h2><p class="lead">' + fmtWhen(body.startsAt) + ' with <b>' + esc(t.name) + '</b>.</p><p>' + esc(t.name) + ' has been emailed the details with a calendar file, so they can set reminders. ' + (first ? "" : "You chose to pay by " + esc(PAYS.find(p => p[0] === body.payment)[1]) + ". Payment is taken before or at your session. ") + 'You can see this booking under My appointments.</p><p style="margin-top:18px"><button class="btn" id="mdone" type="button">Done</button></p>';
    $("mdone").onclick = () => location.reload();
  };
}

// ---------- my account ----------
function renderAcct(u) {
  const i = u.intake, a = (i && i.answers) || {}, t = i && i.therapist, hasFirst = (u.bookings || []).some(b => b.kind === "first");
  let h = '<p class="lead">Hello, <b>' + esc(u.display_name) + '</b>.</p>';
  if (!i) h += '<div class="card s" style="margin-top:20px"><h3>Let’s find your match</h3><p>Answer a few private questions so we can match you with the right therapist or doctor.</p><p style="margin-top:14px"><a class="btn" href="index.html#start">Start</a></p></div>';
  else {
    if (i.urgent) h += URGENT(true).replace("Thank you for telling us", "We are thinking of you");
    if (t) h += '<div class="card k" style="margin-top:20px"><h3>You are matched with ' + esc(t.name) + '</h3><p>' + ROLE[t.role] + ' · ' + esc(dd(a.format)) + ' sessions in ' + esc(a.language === "any" ? "Kinyarwanda or English" : dd(a.language)) + '</p>' + (i.prefs_met ? "" : '<p class="small">We could not match every preference yet. You can ask our team for a change.</p>') +
      '<div class="row2" style="margin-top:16px">' + (hasFirst ? "" : '<button class="btn" id="bFirst" type="button">Continue to your free first chat</button>') + '<button class="btn' + (hasFirst ? "" : " ghost") + '" id="bBook" type="button">Book ' + esc(t.name) + '</button></div></div>';
    else h += '<div class="card k" style="margin-top:20px"><h3>We are finding your match</h3><p>Our clinical team is choosing the right therapist or doctor for you and will confirm soon.</p></div>';
  }
  const bk = u.bookings || [];
  h += '<h3 style="margin-top:28px">My appointments</h3>' + (bk.length ? '<ul class="mlist">' + bk.map(b => '<li><b>' + fmtWhen(b.starts_at) + '</b> with ' + esc(b.tname) + ' · ' + esc(b.price_label) + '</li>').join("") + '</ul>' : '<p class="lead">No appointments yet.</p>');
  h += '<p style="margin-top:26px"><a class="btn ghost sm" href="index.html#start">Answer the questions again</a> <a class="btn ghost sm" href="resources.html">Read about mental health</a> <button class="btn ghost sm" type="button" onclick="logout()">Log out</button>' + (u.isClinical ? ' <a class="btn sm" href="clinic.html">Clinical team page</a>' : '') + '</p>';
  return h;
}
if ($("acct")) (async () => {
  if (!tok()) { location.href = "login.html"; return }
  try {
    let r = await api("/api/me");
    if (r.status === 401 || r.status === 404) { try { localStorage.removeItem("mc_token") } catch (x) {} location.href = "login.html"; return }
    if (!r.ok) { $("acct").innerHTML = '<p class="lead">Something went wrong. Please try again in a minute.</p>'; return }
    let u = r.j, it = null; try { it = JSON.parse(sessionStorage.getItem("mc_intake") || "null") } catch (x) {}
    if (!u.intake && it && it.answers) { await api("/api/intake", { method: "POST", body: JSON.stringify(it) }); const r2 = await api("/api/me"); if (r2.ok) u = r2.j }
    $("acct").innerHTML = renderAcct(u);
    if ($("bFirst")) $("bFirst").onclick = () => openBooking("first", u);
    if ($("bBook")) $("bBook").onclick = () => openBooking("session", u);
  } catch (x) { $("acct").innerHTML = '<p class="lead">Can’t reach the server. Wait a minute and refresh the page.</p>' }
})();

// ---------- clinical team ----------
let THER = [];
async function loadTher() {
  const r = await api("/api/clinical/therapists"); if (r.ok) THER = r.j;
  if ($("ther")) $("ther").innerHTML = THER.length ? THER.map(t => '<div class="cl"><b>' + esc(t.name) + '</b> · ' + ROLE[t.role] + ' · ' + (t.gender === "f" ? "woman" : "man") + ' · ' + esc((t.languages || []).map(dd).join(", ")) + '<br><small>' + esc(t.email) + (t.active ? "" : " (inactive)") + '</small> <button class="btn ghost sm" data-tid="' + t.id + '" data-on="' + (t.active ? 0 : 1) + '">' + (t.active ? "Deactivate" : "Activate") + '</button></div>').join("") : '<p class="lead">No therapists yet. Add the first one below.</p>';
}
function card(x) {
  const a = x.answers || {}, c = (a.concerns || []).map(v => CL[v] || v).join(", ");
  const sel = '<select id="as-' + x.id + '"><option value="">Choose a therapist or doctor</option>' + THER.filter(t => t.active || t.id === x.therapist_id).map(t => '<option value="' + t.id + '"' + (t.id === x.therapist_id ? " selected" : "") + '>' + esc(t.name) + ' (' + ROLE[t.role] + ')</option>').join("") + '</select>';
  return '<div class="cl' + (x.urgent ? " urg" : "") + '"><div>' + (x.urgent ? '<span class="badge u">Urgent: contact today</span>' : "") + (x.needs_doctor ? '<span class="badge p">Needs doctor review</span>' : "") + '<span class="badge a">' + esc(x.status.replace("_", " ")) + '</span></div><h3 style="margin-top:10px">' + esc(x.display_name) + '</h3><dl><dt>Contact</dt><dd>' + esc(x.contact) + '</dd><dt>Group</dt><dd>' + esc(dd(a.who) || x.category) + (x.hospital_name ? " · " + esc(x.hospital_name) + " · patient no. " + esc(x.patient_number) + (x.hospital_verified ? " (verified)" : " (not verified)") : "") + '</dd><dt>Concerns</dt><dd>' + esc(c) + '</dd><dt>Duration</dt><dd>' + esc(dd(a.duration)) + '</dd><dt>Daily impact</dt><dd>' + esc(dd(a.impact)) + '</dd><dt>Self-harm thoughts</dt><dd>' + esc(dd(a.safety)) + '</dd><dt>Doctor or medication</dt><dd>' + esc(dd(a.care)) + '</dd><dt>Preferences</dt><dd>Language: ' + esc(a.language === "any" ? "Kinyarwanda or English" : dd(a.language)) + " · " + esc(dd(a.format)) + " · therapist: " + esc(a.gender === "any" ? "no preference" : dd(a.gender)) + '</dd><dt>Suggested</dt><dd>' + esc(x.professional) + '</dd><dt>Matched to</dt><dd>' + esc(x.tname || "Nobody yet") + '</dd></dl><div class="row2">' + sel + '<button class="btn sm" data-id="' + x.id + '" data-act="assigned">Save</button><button class="btn ghost sm" data-id="' + x.id + '" data-act="closed">Close</button></div></div>';
}
async function loadClinic() {
  if (!tok()) { location.href = "login.html"; return }
  try {
    await loadTher(); const r = await api("/api/clinical/intakes");
    if (r.status === 401) { try { localStorage.removeItem("mc_token") } catch (x) {} location.href = "login.html"; return }
    if (r.status === 403) { $("clinic").innerHTML = '<p class="lead">This page is only for the MindCare clinical team.</p>'; if ($("clinPanel")) $("clinPanel").remove(); return }
    if (!r.ok) { $("clinic").innerHTML = '<p class="lead">Something went wrong. Please try again in a minute.</p>'; return }
    $("clinic").innerHTML = r.j.length ? r.j.map(card).join("") : '<p class="lead">No requests yet.</p>';
  } catch (x) { $("clinic").innerHTML = '<p class="lead">Can’t reach the server. Wait a minute and refresh.</p>' }
}
if ($("clinic")) {
  $("sp").innerHTML = Object.keys(CL).map(k => '<label class="opt"><input type="checkbox" class="spc" value="' + k + '"> ' + CL[k] + '</label>').join("");
  loadClinic(); $("refresh").onclick = loadClinic;
  $("clinic").addEventListener("click", async e => {
    const b = e.target.closest("button[data-id]"); if (!b) return; const id = b.dataset.id, act = b.dataset.act, tid = $("as-" + id).value;
    if (act === "assigned" && !tid) { alert("Choose a therapist or doctor first."); return }
    b.disabled = true; await api("/api/clinical/intakes/" + id, { method: "POST", body: JSON.stringify({ status: act, therapistId: tid ? Number(tid) : null }) }); loadClinic();
  });
  $("ther").addEventListener("click", async e => { const b = e.target.closest("button[data-tid]"); if (!b) return; await api("/api/clinical/therapists/" + b.dataset.tid + "/active", { method: "POST", body: JSON.stringify({ active: b.dataset.on === "1" }) }); loadClinic() });
  $("therForm").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
    d.languages = [...f.querySelectorAll(".lg:checked")].map(x => x.value); d.specialties = [...f.querySelectorAll(".spc:checked")].map(x => x.value);
    const r = await api("/api/clinical/therapists", { method: "POST", body: JSON.stringify(d) });
    $("tmsg").textContent = r.ok ? "Added." : (r.j.error || "Could not add."); if (r.ok) { f.reset(); loadClinic() }
  });
}
