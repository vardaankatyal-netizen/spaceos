let power=72, oxygen=98, temperature=22;
let z=100, windowCount=0, selectedFile=null;

let files=JSON.parse(localStorage.getItem("spaceos_files"));
if(!files){
 files=[
  {name:"Documents",type:"folder"},
  {name:"Pictures",type:"folder"},
  {name:"Downloads",type:"folder"},
  {name:"mission.txt",type:"text",text:"Mission: Explore the solar system.\n\nStatus: Ready."},
  {name:"notes.txt",type:"text",text:"Welcome to SpaceOS!"}
 ];
 saveFiles();
}

function saveFiles(){localStorage.setItem("spaceos_files",JSON.stringify(files));}

function updateClock(){
 let d=new Date(),h=String(d.getHours()).padStart(2,"0"),m=String(d.getMinutes()).padStart(2,"0"),s=String(d.getSeconds()).padStart(2,"0");
 document.getElementById("clock").innerText=h+":"+m+":"+s;
}
updateClock();setInterval(updateClock,1000);

setInterval(function(){
 power-=.01;if(power<=5){power=72;showNotification("Power cells recharged.");}
 temperature=22+Math.sin(Date.now()/5000)*2;
 document.getElementById("power").innerText=Math.floor(power)+"%";
 document.getElementById("oxygen").innerText=oxygen+"%";
 document.getElementById("temp").innerText=Math.floor(temperature)+"°C";
},1000);

function openApp(app){
 let old=document.getElementById("window-"+app);
 if(old){old.style.display="block";bringToFront(old);return;}

 let win=document.createElement("div");
 win.className="oswindow";win.id="window-"+app;
 windowCount++;
 win.style.left=(220+(windowCount%5)*35)+"px";
 win.style.top=(90+(windowCount%4)*30)+"px";

 let titles={files:"📁 Files",terminal:"💻 Terminal",comms:"📡 Communications",monitor:"📊 System Monitor",settings:"⚙️ Settings",launcher:"☰ Applications",about:"🛰️ About SpaceOS"};

 win.innerHTML=`<div class="titlebar"><span>${titles[app]||"SpaceOS"}</span><div class="title-buttons"><button onclick="minimizeWindow('${win.id}')">−</button><button onclick="closeWindow('${win.id}')">×</button></div></div><div class="windowbody">${getApp(app)}</div>`;
 document.getElementById("windows").appendChild(win);
 makeDraggable(win);bringToFront(win);

 if(app=="files")showFiles();
 if(app=="terminal")setTimeout(()=>{let i=win.querySelector(".terminal-input");if(i)i.focus()},50);
}

function getApp(app){
 if(app=="files")return `<div class="filesapp"><div class="filetools"><button class="action" onclick="newFolder()">+ Folder</button><button class="action" onclick="newFile()">+ Text File</button><button class="action" onclick="renameFile()">Rename</button><button class="action danger" onclick="deleteFile()">Delete</button></div><div class="path">Home /</div><div id="filegrid" class="filegrid"></div></div>`;

 if(app=="terminal")return `<div class="terminal"><div class="terminal-output" id="terminal-output">SpaceOS Terminal v2.0
Type "help" to see commands.</div><div class="terminal-line">user@spaceos:~$<input class="terminal-input" onkeydown="terminalKey(event,this)"></div></div>`;

 if(app=="monitor")return `<div class="monitorapp"><h2>Spacecraft System Monitor</h2><div class="stat"><div class="stattop"><span>Power</span><span id="monpower">${Math.floor(power)}%</span></div><div class="statbar"><div class="statfill" style="width:${power}%"></div></div></div><div class="stat"><div class="stattop"><span>Oxygen</span><span>98%</span></div><div class="statbar"><div class="statfill" style="width:98%"></div></div></div><div class="stat"><div class="stattop"><span>Hull</span><span>97%</span></div><div class="statbar"><div class="statfill" style="width:97%"></div></div></div><p>Location: Earth Orbit</p><p>Fuel: 64%</p><p>Communication: ONLINE</p></div>`;

 if(app=="comms")return `<div class="commsapp"><h2>Mission Control</h2><div class="message"><b>MISSION CONTROL</b><br>All systems are operating normally.<br><small>just now</small></div><div class="message"><b>EARTH STATION</b><br>Your signal is strong.<br><small>2 minutes ago</small></div><button class="action" onclick="sendMessage()">Send Test Message</button></div>`;

 if(app=="settings")return `<div class="settingsapp"><h2>Settings</h2><div class="settingrow"><label>Theme</label><button class="action" onclick="changeTheme()">Change Theme</button></div><div class="settingrow"><label>Space background</label><button class="action" onclick="changeSpace()">Change Background</button></div><div class="settingrow"><label>System</label><button class="action" onclick="location.reload()">Restart SpaceOS</button></div><div class="settingrow"><label>Data</label><button class="action danger" onclick="resetFiles()">Reset Files</button></div></div>`;

 if(app=="launcher")return `<div class="launcher"><h2>Applications</h2><br><div class="launchergrid"><div class="launchapp" onclick="openApp('files')"><div>📁</div>Files</div><div class="launchapp" onclick="openApp('terminal')"><div>💻</div>Terminal</div><div class="launchapp" onclick="openApp('comms')"><div>📡</div>Comms</div><div class="launchapp" onclick="openApp('monitor')"><div>📊</div>Monitor</div><div class="launchapp" onclick="openApp('settings')"><div>⚙️</div>Settings</div><div class="launchapp" onclick="openApp('about')"><div>🛰️</div>About</div></div></div>`;

 if(app=="about")return `<div class="settingsapp"><h2>SpaceOS</h2><br><p>A browser-based spacecraft operating system.</p><br><p>Version: 2.0</p><p>Mission: Build a personal space computer.</p><br><p>Files and settings are stored locally in your browser.</p></div>`;
 return "";
}

function showFiles(){
 let grid=document.getElementById("filegrid");if(!grid)return;grid.innerHTML="";
 files.forEach((file,index)=>{
  let item=document.createElement("div");item.className="fileitem";
  if(selectedFile===index)item.classList.add("selected");
  item.innerHTML=`<div class="fileicon">${file.type=="folder"?"📁":"📄"}</div><div class="filename">${file.name}</div>`;
  item.onclick=()=>{selectedFile=index;showFiles()};
  item.ondblclick=()=>{if(file.type=="text")openEditor(index)};
  grid.appendChild(item);
 });
}

function newFolder(){let name=prompt("Folder name:");if(!name)return;files.push({name,type:"folder"});saveFiles();selectedFile=null;showFiles();showNotification("Folder created.");}
function newFile(){let name=prompt("Text file name:","newfile.txt");if(!name)return;if(!name.includes("."))name+=".txt";files.push({name,type:"text",text:""});saveFiles();selectedFile=null;showFiles();showNotification("Text file created.");}
function renameFile(){if(selectedFile===null){alert("Select a file first.");return}let name=prompt("New name:",files[selectedFile].name);if(!name)return;files[selectedFile].name=name;saveFiles();showFiles();}
function deleteFile(){if(selectedFile===null){alert("Select a file first.");return}if(!confirm("Delete "+files[selectedFile].name+"?"))return;files.splice(selectedFile,1);selectedFile=null;saveFiles();showFiles();showNotification("File deleted.");}
function resetFiles(){if(confirm("Reset your SpaceOS files?")){localStorage.removeItem("spaceos_files");location.reload()}}

function openEditor(index){
 let file=files[index],id="editor-"+Date.now(),win=document.createElement("div");
 win.className="oswindow";win.id=id;win.style.left="350px";win.style.top="130px";
 win.innerHTML=`<div class="titlebar"><span>📝 ${file.name}</span><div class="title-buttons"><button onclick="closeWindow('${id}')">×</button></div></div><div class="windowbody"><div class="editor"><div class="editorhead"><button class="action" onclick="saveTextFile(${index},'${id}')">Save</button></div><textarea id="text-${id}">${escapeHTML(file.text)}</textarea></div></div>`;
 document.getElementById("windows").appendChild(win);makeDraggable(win);bringToFront(win);
}
function saveTextFile(index,id){let box=document.getElementById("text-"+id);files[index].text=box.value;saveFiles();showNotification("File saved.")}
function escapeHTML(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}

function closeWindow(id){let w=document.getElementById(id);if(w)w.remove()}
function minimizeWindow(id){let w=document.getElementById(id);if(w)w.style.display="none"}
function bringToFront(w){z++;w.style.zIndex=z}

function makeDraggable(win){
 let bar=win.querySelector(".titlebar"),moving=false,x=0,y=0;
 bar.addEventListener("mousedown",e=>{if(e.target.tagName=="BUTTON")return;moving=true;x=e.clientX-win.offsetLeft;y=e.clientY-win.offsetTop;bringToFront(win)});
 document.addEventListener("mousemove",e=>{if(moving){win.style.left=(e.clientX-x)+"px";win.style.top=(e.clientY-y)+"px"}});
 document.addEventListener("mouseup",()=>moving=false);
 win.addEventListener("mousedown",()=>bringToFront(win));
}

function terminalKey(e,input){
 if(e.key!="Enter")return;
 let command=input.value.trim(),lower=command.toLowerCase(),out=input.parentElement.parentElement.querySelector(".terminal-output"),result="";
 if(lower=="help")result=`Commands:
help
clear
date
time
status
ls
touch filename.txt
mkdir foldername
echo hello
about
reboot`;
 else if(lower=="clear")out.innerText="";
 else if(lower=="date")result=new Date().toDateString();
 else if(lower=="time")result=new Date().toLocaleTimeString();
 else if(lower=="status")result=`Power: ${Math.floor(power)}%
Oxygen: ${oxygen}%
Temperature: ${Math.floor(temperature)}°C
Hull: 97%
Location: Earth Orbit
Comms: ONLINE`;
 else if(lower=="ls")result=files.map(f=>f.type=="folder"?"[DIR] "+f.name:f.name).join("\n");
 else if(lower.startsWith("touch ")){let name=command.substring(6).trim();if(name){files.push({name,type:"text",text:""});saveFiles();result="Created "+name}}
 else if(lower.startsWith("mkdir ")){let name=command.substring(6).trim();if(name){files.push({name,type:"folder"});saveFiles();result="Created folder "+name}}
 else if(lower.startsWith("echo "))result=command.substring(5);
 else if(lower=="about")result="SpaceOS v2.0 - browser spacecraft operating system.";
 else if(lower=="reboot")location.reload();
 else if(lower=="")result="";
 else result="Command not found. Type help.";
 if(result)out.innerText+="\n"+result+"\n";input.value="";
}

function showNotification(text){
 let box=document.createElement("div");box.className="note";box.innerText=text;document.getElementById("notifications").appendChild(box);
 setTimeout(()=>box.remove(),3500);
}
function sendMessage(){showNotification("Message sent to Mission Control.")}
function changeTheme(){document.body.style.fontFamily="Consolas,monospace";showNotification("Theme changed.")}
function changeSpace(){document.getElementById("desktop").style.backgroundColor="#071629";showNotification("Background changed.")}

let loading=0;
let bootTimer=setInterval(()=>{
 loading+=4;document.getElementById("loadbar").style.width=loading+"%";
 if(loading>=30)document.getElementById("boottext").innerText="Checking spacecraft systems...";
 if(loading>=60)document.getElementById("boottext").innerText="Loading applications...";
 if(loading>=90)document.getElementById("boottext").innerText="Starting SpaceOS...";
 if(loading>=100){clearInterval(bootTimer);setTimeout(()=>{document.getElementById("boot").style.display="none";document.getElementById("desktop").style.display="block";showNotification("Welcome, commander.");},400)}
},60);
