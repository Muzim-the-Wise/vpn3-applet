const confMenu = document.querySelector(".confMenu");

confMenu.addEventListener("click", (event) =>{
    console.log(event.target.id);
})

const testDiv = document.querySelector("#testOutput");

const confBut = document.querySelector("#confBut");
const confDiv = document.querySelector("#confDiv")

async function connect (event) {
    const logpas = await window.electronAPI.login();
    if (!logpas) {
        return;
    }
    const confPath = event.target.previousSibling.textContent.replace("\"", "");
    console.log(confPath);
    const connStatus = await window.electronAPI.connectVPN(confPath, logpas);
    //const testTextNode = document.createTextNode(event.target.previousSibling.textContent + `\n${logpas[0]} ${logpas[1]}\n`);
    const testNode = document.createElement("p");
    const testTextNode = document.createTextNode(connStatus);
    testNode.appendChild(testTextNode);
    testDiv.appendChild(testNode);
}

async function refreshConfs (event) {
    while (confDiv.lastElementChild) {
        confDiv.removeChild(confDiv.lastElementChild);
    }
    const confArr = await window.electronAPI.getConfs();
    if (confArr == false) {
        const node = document.createElement("p");
        const textNode = document.createTextNode("No configs found in home/vpn3Confs");
        node.appendChild(textNode);
        confDiv.appendChild(node);
        return 0;
    }
    for (const conf in confArr) {
        const confNode = document.createElement("p");
        const textNode = document.createTextNode(confArr[conf]);
        confNode.appendChild(textNode);
        confDiv.appendChild(confNode);
        const connButNode = document.createElement("p");
        const connTextNode = document.createTextNode('Connect');
        connButNode.appendChild(connTextNode);
        connButNode.classList.add("connBut");
        confDiv.appendChild(connButNode);
    }
    const buttonsArr = document.querySelectorAll("#confDiv .connBut");
    for (let but = 0; but < buttonsArr.length; but++) {
        buttonsArr[but].addEventListener("click", (event) => connect(event));
    }
    return 1;
}
addEventListener("load", (event) => refreshConfs(event));
confBut.addEventListener("click", (event) => refreshConfs(event));

const sessBut = document.querySelector("#sessionBut");
async function listConfs (event) {
    // sess = await window.electronAPI.getSessions();
    // const confNode = document.createElement("p");
    // const textNode = document.createTextNode(JSON.stringify(sess));
    // console.log(sess[0].ConfigName)
    // confNode.appendChild(textNode);
    // testDiv.appendChild(confNode);
    await window.electronAPI.getSessWin();
}
sessBut.addEventListener("click", async (event) => await listConfs(event));

const addConfBut = document.querySelector("#addConfBut");
addConfBut.addEventListener('click', async () => {
    const filePath = await window.electronAPI.addConf();
    if(!filePath) {
        return;
    }
    alert("Config added succesfully");
    await refreshConfs();
})