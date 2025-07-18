let contextTarget = null;

const contextMenus = {
    bottomFiles: [
        { label: "Close", action: () => {contextTarget.remove(); isCurrentFileExist()} },
        { label: "Copy File Name", action: () => copyFileName() },
        { label: "Copy Path", action: () => deleteImage() },
        { label: "Set Anchor for Workspace", action: () => setAnchor(contextTarget.getAttribute('directory'))},
    ],
    bottom: [
        { label: "New File", action: () => editText() },
        { label: "Copy Text", action: () => copyText() }
    ],
    default: [
        { label: "Reload", action: () => location.reload() }
    ]
};

const contextMenu = document.querySelector('.context-menu');

document.addEventListener("DOMContentLoaded", function() {
  
    document.addEventListener("contextmenu", function(event){
        event.preventDefault();
        contextTarget = event.target;

        let menuType = 'default';
        if (event.target.classList.contains('file-bottom')) menuType = "bottomFiles";
        else if (event.target.classList.contains('bottom-files')) menuType = "bottom";

        contextMenu.innerHTML = "";
        contextMenus[menuType].forEach(item => {
            const createButton = document.createElement('button');
            createButton.textContent = item.label;
            createButton.className = 'context-menu-button';
            createButton.onclick = () => {
                item.action();
                contextMenu.style.display = 'none';
            };
            contextMenu.appendChild(createButton);
        });

        contextMenu.style.display = 'flex';
        contextMenu.style.visibility = 'hidden';

        let top = mouseY(event);
        const menuHeight = contextMenu.offsetHeight;

        if (top + menuHeight > window.innerHeight) top -= menuHeight;
        if (top < 0) top = 0;

        contextMenu.style.top = top + 'px';
        contextMenu.style.left = mouseX(event) + 'px';

        contextMenu.style.visibility = 'visible';
    });

    document.addEventListener("click", function(event) {
        contextMenu.style.display = 'none';
    });
});


function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ?
        document.documentElement.scrollLeft :
        document.body.scrollLeft);
    } else {
        return null;
    }
}

function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop ?
        document.documentElement.scrollTop :
        document.body.scrollTop);
    } else {
        return null;
    }
}