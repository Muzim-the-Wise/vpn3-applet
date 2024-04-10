const confMenu = document.querySelector(".confMenu");

confMenu.addEventListener("click", (event) =>{
    console.log(event.target.id);
})

const testDiv = document.querySelector("#testOutput");

const confBut = document.querySelector("#confBut");
const confDiv = document.querySelector("#confDiv")
confBut.addEventListener("click", async (event) => {
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
    return 1;
})

