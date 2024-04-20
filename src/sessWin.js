function createP (text) {
    const node = document.createElement('p');
    const nodeText = document.createTextNode(text);
    node.appendChild(nodeText);
    return node;
}

const testDiv = document.querySelector('#testOutput');
const refreshBut = document.querySelector("#refresh");
const sessBody = document.querySelector('#sessBody');
async function listConfs (event) {
    while (sessBody.lastElementChild) {
        sessBody.removeChild(sessBody.lastElementChild);
    }
    sess = await window.electronAPI.getSessions();
    console.log(sess);
    if (sess == false) {
        const infoNode = createP("There's no active sessions.");
        sessBody.appendChild(infoNode);
        return;
    }
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('sessRow');
    const infoName = createP('User:');
    infoDiv.appendChild(infoName);
    const infoDate = createP("Creation time:");
    infoDiv.appendChild(infoDate);
    const infoPID = createP('PID:');
    infoDiv.appendChild(infoPID);
    const infoStat = createP('Status:');
    infoDiv.appendChild(infoStat);
    const infoPath = createP("Session path:");
    infoDiv.appendChild(infoPath);
    const infoBut = createP('Disconnect:');
    infoDiv.appendChild(infoBut);
    sessBody.appendChild(infoDiv);
    for (let conf in sess) {
        const sessDiv = document.createElement('div');
        sessDiv.classList.add('sessRow');
        sessDiv.id = conf;

        const userNode = createP(sess[conf].Owner);
        sessDiv.appendChild(userNode);

        const dateNode = createP(sess[conf].Created);
        sessDiv.appendChild(dateNode);

        const pidNode = createP(sess[conf].PID);
        sessDiv.appendChild(pidNode);

        const statusNode = createP(sess[conf].Status.replace(/-/g, ""));
        sessDiv.appendChild(statusNode);

        const pathNode = createP(sess[conf].Path);
        sessDiv.appendChild(pathNode);

        const conBut = createP('Disconnect');
        conBut.classList.add('connBut');
        conBut.addEventListener('click', async (event) => {
            await window.electronAPI.disconnect(event.target.previousSibling.textContent);
            await listConfs();
        });
        sessDiv.appendChild(conBut);

        sessBody.appendChild(sessDiv);
    }
}
addEventListener("load", (event) => listConfs(event));
refreshBut.addEventListener("click", async (event) => await listConfs(event));

async function disconnectAll () {
    for (let div = 0; div < sessBody.children.length; div++) {
        const sess = sessBody.children[div].children;
        window.electronAPI.disconnect(sess[sess.length - 2].innerHTML);
    }
    setTimeout(() => listConfs(), 5000)
}
const discAllBut = document.querySelector('#disconAll');
discAllBut.addEventListener('click', async (event) => disconnectAll());

