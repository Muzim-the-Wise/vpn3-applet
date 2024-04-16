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