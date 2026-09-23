let power = 72;
let oxygen = 98;
let temperature = 22;
let z = 100;
let windowCount = 0;
let selectedFile = null;

let files = JSON.parse(localStorage.getItem("spaceFiles")) || [
    { name: "Documents", type: "folder" },
    { name: "System", type: "folder" },
    { name: "welcome.txt", type: "file", content: "Welcome to SpaceOS!" },
    { name: "mission.txt", type: "file", content: "Mission status: Active" }
];

function saveFiles() {
    localStorage.setItem("spaceFiles", JSON.stringify(files));
}

function updateClock() {
    let now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("date").textContent =
        now.toLocaleDateString();
}

setInterval(updateClock, 1000);
updateClock();

setInterval(() => {
    power = Math.max(0, power - 1);
    temperature += Math.random() > 0.5 ? 1 : -1;

    let powerBar = document.getElementById("power");
    let temp = document.getElementById("temperature");

    if (powerBar) powerBar.textContent = power + "%";
    if (temp) temp.textContent = temperature + "°C";
}, 1000);


function openApp(app) {
    windowCount++;

    let win = document.createElement("div");
    win.className = "window";
    win.style.zIndex = ++z;
    win.style.left = 100 + windowCount * 20 + "px";
    win.style.top = 70 + windowCount * 20 + "px";

    win.innerHTML = `
        <div class="window-bar">
            <span>${app}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="window-content">
            ${getApp(app)}
        </div>
    `;

    document.body.appendChild(win);
    makeDraggable(win);
}


function getApp(app) {
    if (app === "files") return `
        <h2>Files</h2>
        <button onclick="newFolder()">New Folder</button>
        <button onclick="newFile()">New File</button>
        <button onclick="showFiles()">Refresh</button>
        <div id="fileList"></div>
    `;

    if (app === "terminal") return `
        <h2>Terminal</h2>
        <div id="terminalOutput">SpaceOS Terminal<br>Type "help"</div>
        <input id="terminalInput"
        onkeydown="if(event.key==='Enter') runCommand(this.value)">
    `;

    if (app === "monitor") return `
        <h2>System Monitor</h2>
        <p>Power: <span id="power">${power}%</span></p>
        <p>Oxygen: ${oxygen}%</p>
        <p>Temperature: <span id="temperature">${temperature}°C</span></p>
    `;

    if (app === "comms") return `
        <h2>Communications</h2>
        <input id="message" placeholder="Enter message">
        <button onclick="sendMessage()">Send</button>
        <div id="messages"></div>
    `;

    if (app === "settings") return `
        <h2>Settings</h2>
        <button onclick="document.body.classList.toggle('dark')">
            Toggle Theme
        </button>
    `;

    if (app === "about") return `
        <h2>SpaceOS</h2>
        <p>Spacecraft Operating System</p>
        <p>Version 1.0</p>
    `;

    return "<h2>SpaceOS</h2><p>App not found.</p>";
}


function showFiles() {
    let list = document.getElementById("fileList");
    if (!list) return;

    list.innerHTML = "";

    files.forEach((file, index) => {
        let icon = file.type === "folder" ? "📁" : "📄";

        list.innerHTML += `
            <div>
                ${icon} ${file.name}
                <button onclick="renameFile(${index})">Rename</button>
                <button onclick="deleteFile(${index})">Delete</button>
                ${file.type === "file"
                    ? `<button onclick="editFile(${index})">Open</button>`
                    : ""}
            </div>
        `;
    });
}


function newFolder() {
    let name = prompt("Folder name:");
    if (!name) return;

    files.push({
        name: name,
        type: "folder"
    });

    saveFiles();
    showFiles();
}


function newFile() {
    let name = prompt("File name:");
    if (!name) return;

    files.push({
        name: name,
        type: "file",
        content: ""
    });

    saveFiles();
    showFiles();
}


function renameFile(index) {
    let name = prompt("New name:", files[index].name);

    if (name) {
        files[index].name = name;
        saveFiles();
        showFiles();
    }
}


function deleteFile(index) {
    if (confirm("Delete this item?")) {
        files.splice(index, 1);
        saveFiles();
        showFiles();
    }
}


function editFile(index) {
    selectedFile = index;

    let text = prompt(
        "Edit file:",
        files[index].content
    );

    if (text !== null) {
        files[index].content = text;
        saveFiles();
    }
}


function makeDraggable(win) {
    let bar = win.querySelector(".window-bar");
    let move = false;
    let x, y;

    bar.onmousedown = function(e) {
        move = true;
        x = e.clientX - win.offsetLeft;
        y = e.clientY - win.offsetTop;
        win.style.zIndex = ++z;
    };

    document.onmousemove = function(e) {
        if (!move) return;

        win.style.left = e.clientX - x + "px";
        win.style.top = e.clientY - y + "px";
    };

    document.onmouseup = function() {
        move = false;
    };
}


function runCommand(command) {
    let output = document.getElementById("terminalOutput");
    let input = document.getElementById("terminalInput");

    if (!output) return;

    command = command.trim();

    if (command === "help") {
        output.innerHTML +=
            "<br>help | clear | date | time | status | ls | touch | mkdir | echo | about | reboot";
    }

    else if (command === "clear") {
        output.innerHTML = "";
    }

    else if (command === "date") {
        output.innerHTML += "<br>" + new Date().toLocaleDateString();
    }

    else if (command === "time") {
        output.innerHTML += "<br>" + new Date().toLocaleTimeString();
    }

    else if (command === "status") {
        output.innerHTML +=
            `<br>Power: ${power}% | Oxygen: ${oxygen}% | Temp: ${temperature}°C`;
    }

    else if (command === "ls") {
        output.innerHTML +=
            "<br>" + files.map(file => file.name).join("<br>");
    }

    else if (command.startsWith("echo ")) {
        output.innerHTML +=
            "<br>" + command.substring(5);
    }

    else if (command === "about") {
        output.innerHTML += "<br>SpaceOS v1.0";
    }

    else if (command === "reboot") {
        location.reload();
    }

    else if (command) {
        output.innerHTML += "<br>Command not found";
    }

    input.value = "";
}


function sendMessage() {
    let input = document.getElementById("message");
    let messages = document.getElementById("messages");

    if (!input || !messages || !input.value) return;

    messages.innerHTML +=
        `<p>You: ${input.value}</p>`;

    input.value = "";
}


function notify(message) {
    alert(message);
}


function boot() {
    let boot = document.getElementById("boot");
    let bar = document.getElementById("loadbar");
    let text = document.getElementById("boottext");

    let value = 0;

    let timer = setInterval(() => {
        value += 10;

        bar.style.width = value + "%";
        text.textContent = "Loading " + value + "%";

        if (value >= 100) {
            clearInterval(timer);
            boot.style.display = "none";
        }
    }, 100);
}

window.onload = boot;
window.onload = boot;
