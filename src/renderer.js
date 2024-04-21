//Funtion for creating text elements
function createP (text) {
    const node = document.createElement('p');
    const nodeText = document.createTextNode(text);
    node.appendChild(nodeText);
    return node;
}
//Output for tests
const testDiv = document.querySelector("#testOutput");
//Button to refresh conf list
const confBut = document.querySelector("#confBut");
//Output for config list
const confDiv = document.querySelector("#confDiv")
//Function to create vpn session
async function connect (event) {
    const logpas = await window.electronAPI.login();
    if (!logpas) {
        return;
    }
    const confPath = event.target.previousSibling.textContent.replace("\"", "");
    const connStatus = await window.electronAPI.connectVPN(confPath, logpas);
    alert(connStatus);
    refreshConfs();
}
//Function to disconnect all vpn sessions with this config
async function disconnect (event) {
    const conf = event.target.previousSibling.textContent.replace("\"", "");
    const sessList = await window.electronAPI.getSessions();
    for (let sessNum = 0; sessNum < sessList.length; sessNum++) {
        if (conf == sessList[sessNum].ConfigName) {
            await window.electronAPI.disconnect(sessList[sessNum].Path);
        }
    }
    await refreshConfs();
}
//Function to refresh conf lists
async function refreshConfs (event) {
    while (confDiv.lastElementChild) {
        confDiv.removeChild(confDiv.lastElementChild);
    }
    const confArr = await window.electronAPI.getConfs();
    if (confArr == false) {
        const node = createP("No configs found in home/vpn3Confs");
        confDiv.appendChild(node);
        return 0;
    }
    const sess = await window.electronAPI.getSessions();
    const sessList = sess.map(sess => sess.ConfigName);

    for (const conf in confArr) {
        if (sessList.includes(confArr[conf])) {
            const status = createP('Connected');
            status.classList.add('statusUp');
            confDiv.appendChild(status);
            const confNode = createP(confArr[conf]);
            confDiv.appendChild(confNode);
            const connButNode = createP('Disconnect');
            connButNode.classList.add("connBut", "conUp");
            connButNode.addEventListener("click", (event) => disconnect(event));
            confDiv.appendChild(connButNode);
        } else {
            const status = createP('Disconnected');
            status.classList.add('statusDown');
            confDiv.appendChild(status);
            const confNode = createP(confArr[conf]);
            confDiv.appendChild(confNode);
            const connButNode = createP('Connect');
            connButNode.classList.add("connBut", "conDown");
            connButNode.addEventListener("click", (event) => connect(event));
            confDiv.appendChild(connButNode);
        }
    }
}
//Refresh config on app start
addEventListener("load", (event) => refreshConfs(event));
//Refresh confs on button press
confBut.addEventListener("click", (event) => refreshConfs(event));
//Add config button
const addConfBut = document.querySelector("#addConfBut");
addConfBut.addEventListener('click', async () => {
    const filePath = await window.electronAPI.addConf();
    if(!filePath) {
        return;
    }
    alert("Config added succesfully");
    await refreshConfs();
})
//Open session windows button
const sessBut = document.querySelector("#sessionBut");
async function listConfs (event) {
    await window.electronAPI.getSessWin();
}
sessBut.addEventListener("click", async (event) => await listConfs(event));

const confDrag = document.querySelector('#confDrag');
function checkForConf (event) {
    const confReg = /(\.ovpn)$/g;
    return confReg.test(event.dataTransfer.files[0].name);
}
confDrag.addEventListener("dragstart", (event) => {
    event.preventDefault()
    console.log('jopa');
});
confDrag.addEventListener('dragover', (event) => {
    event.preventDefault();
});
confDrag.addEventListener("dragenter", (event) => {
    event.preventDefault();
    console.log(event)
});

// //const isConf = event.dataTransfer.files[0].path
// confDrag.addEventListener('dragover', (event) => {
//     // if (checkForConf(event)) {
//     //     event.preventDefault();
//     // }
//     event.preventDefault();
//     //console.log(event.dataTransfer);
// });
// confDrag.addEventListener("dragenter", (event) => {
//     // if (checkForConf(event)) {
//     //     event.preventDefault();
//     // }
//     event.preventDefault();
//     console.log(event.dataTransfer.getData("text"));
// });
// confDrag.addEventListener("drop", (event) => {
//     event.preventDefault();
//     checkForConf(event);
//     //console.log(event);
// });