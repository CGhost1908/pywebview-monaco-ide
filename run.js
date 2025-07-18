
let anchor = null;

function findCommand(ext) {
    const languageCommands = {
        js: 'node',     
        py: 'python',   
        java: 'java',   
        c: 'gcc',       
        cpp: 'g++',     
        php: 'php',     
        ruby: 'ruby',   
        go: 'go run',   
        sh: 'bash',     
        html: 'start',  
        css: 'start',   
        ts: 'ts-node',  
    };

    return languageCommands[ext] || "Unknown language";
}


function runCode(){
    openTerminal();
    setTimeout(() => {
        if(anchor){
            const directory = anchor.directory;
            const name = anchor.name;
            const ext = name.split('.').pop().toLowerCase();
            const command = `${findCommand(ext)} ${directory}`;
            term.write(command + '\r\n');
            socket.send(command);
        }else{
            const directory = document.querySelector('.current-file').getAttribute('directory');
            const name = document.querySelector('.current-file').getAttribute('name');
            const ext = name.split('.').pop().toLowerCase();
            const command = `${findCommand(ext)} ${directory}`;
            term.write(command + '\r\n');
            socket.send(command);
        }

    }, 500);
}

function setAnchor(directory){
    directory = normalizePath(directory);

    if(anchor){
        document.querySelector('.anchor-icon').remove();
        document.querySelector('.anchor-div').remove();
        document.querySelector('.anchor-block').remove();
        document.querySelector('.anchor-file').classList.remove('anchor-file');
    }

    const bottomFiles = document.querySelector('.bottom-files');
    const fileBottom = document.querySelector(`.file-bottom[directory='${directory}']`);
    if(fileBottom){
        const name  = fileBottom.getAttribute('name')
        anchor = {'directory': directory, 'name': name};

        pywebview.api.set_anchor_file(anchor);

        const anchorIcon = document.createElement('iconify-icon');
        anchorIcon.classList.add('anchor-icon');
        anchorIcon.setAttribute('icon', 'typcn:anchor-outline');
        anchorIcon.setAttribute('title', 'Remove anchor');
        anchorIcon.onclick = function(){
            removeAnchor();
        }

        fileBottom.classList.add('anchor-file');

        const anchorDiv = document.createElement('div');
        anchorDiv.classList.add('anchor-div');
        anchorDiv.style.width = `${fileBottom.offsetWidth + 68}px`;

        const anchorBlock = document.createElement('div');
        anchorBlock.classList.add('anchor-block');
        anchorBlock.style.width = `${fileBottom.offsetWidth + 48}px`;

        document.querySelector('.bottom-nav').insertBefore(anchorBlock, bottomFiles);
        bottomFiles.insertBefore(fileBottom, bottomFiles.firstChild);
        bottomFiles.insertBefore(anchorDiv, bottomFiles.firstChild);
        bottomFiles.insertBefore(anchorIcon, bottomFiles.firstChild);
    }
}

function removeAnchor(){
    document.querySelector('.anchor-icon').remove();
    document.querySelector('.anchor-div').remove();
    document.querySelector('.anchor-block').remove();
    document.querySelector('.anchor-file').classList.remove('anchor-file');
    anchor = null;
    pywebview.api.set_anchor_file(anchor);
}