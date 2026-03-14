/* ================================
PARTICLE BACKGROUND
================================ */

particlesJS("particles-js", {
particles:{
number:{value:60},
size:{value:3},
move:{speed:2},
line_linked:{enable:true}
}
});

/* ================================
DARK MODE
================================ */

const toggleBtn=document.getElementById("themeToggle");
const savedTheme=localStorage.getItem("theme");

if(savedTheme==="light"){
document.body.classList.add("light-mode");
toggleBtn.innerHTML="☀️";
}

toggleBtn.onclick=()=>{

document.body.classList.toggle("light-mode");

if(document.body.classList.contains("light-mode")){
localStorage.setItem("theme","light");
toggleBtn.innerHTML="☀️";
}
else{
localStorage.setItem("theme","dark");
toggleBtn.innerHTML="🌙";
}

};

/* ================================
SECTION NAVIGATION
================================ */

function openSection(id){

document.querySelectorAll(".section")
.forEach(sec=>sec.classList.add("hidden"));

document.getElementById(id).classList.remove("hidden");

}

/* ================================
LAW SEARCH
================================ */

async function searchLaw(){

const query=document.getElementById("searchInput").value.trim();

if(!query){
alert("Enter a legal process");
return;
}

const results=document.getElementById("results");
results.innerHTML="Searching...";

try{

const res=await fetch(
`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
);

const laws=await res.json();

results.innerHTML="";

if(!laws||laws.length===0){
results.innerHTML="No results found";
return;
}

laws.forEach(law=>{

const steps=law.processSteps||[];

results.innerHTML+=`

<div class="card lawCard">

<h3>${law.title}</h3>

<p><b>Category:</b> ${law.category}</p>

<p><b>Legal Code:</b> ${law.legalCode}</p>

<button onclick='renderTimeline(${JSON.stringify(steps)})'>
View Timeline
</button>

</div>

`;

});

openSection("lawResults");

}catch(err){

console.error(err);
results.innerHTML="Server error";

}

}

/* ================================
TIMELINE
================================ */

function renderTimeline(steps){

const container=document.getElementById("timeline");
container.innerHTML="";

if(!steps||steps.length===0){
container.innerHTML="No timeline available.";
return;
}

steps.forEach((step,i)=>{

const text=typeof step==="object"?step.text:step;

container.innerHTML+=`

<div class="timelineStep">

<span class="timelineDot"></span>

<b>Step ${i+1}</b><br>
${text}

</div>

`;

});

openSection("timelineSection");

}

/* ================================
CASE ANALYZER
================================ */

async function analyzeCase(){

const input=document.getElementById("caseInput");
const result=document.getElementById("analysisResult");

const problem=input.value.trim();

if(!problem){
alert("Describe your situation");
return;
}

result.innerHTML="Analyzing case...";

try{

const response=await fetch("https://civicroute.onrender.com/api/ai",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({message:problem})

});

const data=await response.json();

let reply=data.reply||"";

reply=reply.replace(/`json/g,"")
.replace(/`/g,"")
.trim();

let parsed;

try{
parsed=JSON.parse(reply);
}
catch{
result.innerHTML=reply;
return;
}

renderLegalReport(parsed);

/* Auto generate timeline */

if(parsed.legal_timeline){

renderTimeline(
parsed.legal_timeline.map(step=>({text:step}))
);

}

}catch(error){

console.error(error);
result.innerHTML="Error contacting AI.";

}

}

/* ================================
LEGAL REPORT RENDER
================================ */

function renderLegalReport(data){

const container=document.getElementById("analysisResult");

const laws=(data.applicable_laws||[])
.map(l=>`<li>${typeof l==="object"?Object.values(l)[0]:l}</li>`)
.join("");

const claims=(data.claims_user_can_make||[])
.map(c=>`<li>${typeof c==="object"?Object.values(c)[0]:c}</li>`)
.join("");

const timeline=(data.legal_timeline||[])
.map(t=>`<li>${typeof t==="object"?Object.values(t)[0]:t}</li>`)
.join("");

const resources=(data.useful_resources||[])
.map(r=>{
const url=typeof r==="object"?Object.values(r)[0]:r;
return `<li><a href="${url}" target="_blank">${url}</a></li>`;
}).join("");

container.innerHTML=`

<div class="legalReport">

<h2>⚖ Legal Case Analysis</h2>

<div class="reportSection">

<h3>Applicable Laws</h3>
<ul>${laws}</ul>

</div>

<div class="reportSection">

<h3>Claims You Can Make</h3>
<ul>${claims}</ul>

</div>

<div class="reportSection">

<h3>Legal Timeline</h3>
<ul>${timeline}</ul>

</div>

<div class="reportSection emergencyBox">

<h3>🚨 Emergency Contacts</h3>

<p><b>Police:</b> ${data.emergency_contacts?.police||"100"}</p>

<p><b>Women Helpline:</b> ${data.emergency_contacts?.women||"1091"}</p>

<p><b>Cyber Crime:</b> ${data.emergency_contacts?.cyber||"1930"}</p>

</div>

<div class="reportSection">

<h3>Helpful Resources</h3>
<ul>${resources}</ul>

</div>

</div>

`;

}

/* ================================
FIREBASE CONFIG
================================ */

const firebaseConfig={
apiKey:"AIzaSyAVXzC1XYnndi5qfkX14ZPrkPd1ICkzvZE",
authDomain:"civic-tech-85e10.firebaseapp.com",
projectId:"civic-tech-85e10",
storageBucket:"civic-tech-85e10.firebasestorage.app",
messagingSenderId:"143562883566",
appId:"1:143562883566:web:93ae69beef93406b130eff"
};

firebase.initializeApp(firebaseConfig);

const db=firebase.firestore();
const storage=firebase.storage();

/* ================================
UPLOAD EVIDENCE
================================ */

async function uploadEvidence(){

const file=document.getElementById("fileInput").files[0];
const caseId=document.getElementById("caseIdInput").value.trim();

if(!file||!caseId){
alert("Select file and enter Case ID");
return;
}

const storageRef=storage.ref(`evidence/${caseId}/${file.name}`);

await storageRef.put(file);

const fileURL=await storageRef.getDownloadURL();

await db.collection("cases").doc(caseId).set({

caseId:caseId,
files:firebase.firestore.FieldValue.arrayUnion(fileURL)

},{merge:true});

document.getElementById("preview").innerHTML=
"Evidence uploaded successfully.";

loadCases();

}

/* ================================
LOAD CASE DASHBOARD
================================ */

async function loadCases(){

const container=document.getElementById("caseList");
container.innerHTML="Loading cases...";

const snapshot=await db.collection("cases").get();

container.innerHTML="";

snapshot.forEach(doc=>{

const data=doc.data();

container.innerHTML+=`

<div class="caseCard">

<h3>Case ID: ${data.caseId}</h3>

${(data.files||[])
.map(f=>`<p><a href="${f}" target="_blank">View Evidence</a></p>`)
.join("")}

</div>

`;

});

}

loadCases();

/* ================================
ENTER KEY SUPPORT
================================ */

document.addEventListener("DOMContentLoaded",()=>{

const input=document.getElementById("caseInput");

if(input){

input.addEventListener("keypress",e=>{

if(e.key==="Enter") analyzeCase();

});

}

});
