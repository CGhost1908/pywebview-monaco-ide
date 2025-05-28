const windows = document.querySelector('.windows');

//SCROLLING
const bottomFiles = document.querySelector('.bottom-files');
bottomFiles.addEventListener('wheel', (event) => {
    event.preventDefault();
    bottomFiles.scrollLeft += event.deltaY;
});

const directoryTitle = document.querySelector('.directory-title');
let isScrolling1 = false;

directoryTitle.addEventListener('mousedown', function(event){
    isScrolling1 = true;
    const startX = event.clientX;
    const scrollLeft = directoryTitle.scrollLeft;

    const onMouseMove = (e) => {
        if (!isScrolling1) return;
        const distance = e.clientX - startX;
        directoryTitle.scrollLeft = scrollLeft - distance;
    };

    const onMouseUp = () => {
        isScrolling1 = false;
        directoryTitle.removeEventListener('mousemove', onMouseMove);
        directoryTitle.removeEventListener('mouseup', onMouseUp);
    };

    directoryTitle.addEventListener('mousemove', onMouseMove);
    directoryTitle.addEventListener('mouseup', onMouseUp);
});


const explorerButton = document.querySelector('.explorer-button')
explorerButton.addEventListener('click', function(){
    openExplorer();
});

function openExplorer(){
    const explorer = document.querySelector('.explorer');
    if(explorer.style.display === 'none' || explorer.style.display === ''){
        explorer.style.display = 'flex';
        explorerButton.querySelector('iconify-icon').style.rotate = '180deg';
    }else{
        explorer.style.display = 'none';
        explorerButton.querySelector('iconify-icon').style.rotate = '';
    }
    pywebview.api.save_explorer(document.querySelector('.explorer').style.display);
}

function formatPathForSelector(path){
    return path.replace(/\\/g, '\\\\');
}

function formatOneSlashPath(path){
    return path.replace(/\\\\/g, '/');
}

function normalizePath(path){
    while(path.includes('\\')){
        path = path.replace(/\\/g, '/');
        if(path.includes('//')){
            path = path.replace(/\/\//g, '/');
        }
    }
    return path;
}

function insertAfter(newNode, referenceNode) {
    const parent = referenceNode.parentNode;

    if (referenceNode.nextSibling) {
        parent.insertBefore(newNode, referenceNode.nextSibling);
    } else {
        parent.appendChild(newNode);
    }
}

function generateColor(){
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);  
    const b = Math.floor(Math.random() * 256);
    
    return `rgb(${r}, ${g}, ${b})`;
}
async function isFile(name, directory) {
    const path = `${directory}\\${name}`;
    
   const isFile = await pywebview.api.is_file(path);
   return isFile;

}
function loadExplorer(){
    pywebview.api.get_directory().then(async function(directory){
        directory = normalizePath(directory);

        document.querySelector('.directory-title').textContent = directory;
        document.querySelector('.files-explorer').setAttribute('directory', directory);
        document.querySelector('.files-explorer').innerHTML = '';

        const response = await pywebview.api.get_files(directory);
        const explorerFiles = document.querySelector('.files-explorer');

        const folders = [];
        const files = [];

        for(const file of response){
            const isFileFlag = await isFile(file, directory);
            if(isFileFlag){
                files.push(file);
            }else{
                folders.push(file);
            }
        }

        folders.forEach(function(folder){
            const folderElement = createFileElement(folder, true);
            explorerFiles.appendChild(folderElement);
            folderElement.setAttribute('directory', `${explorerFiles.getAttribute('directory')}/${folder}`);
            folderElement.setAttribute('title', normalizePath(`${explorerFiles.getAttribute('directory')}/${folder}`));
        });

        files.forEach(function(file){
            const fileElement = createFileElement(file, false);
            explorerFiles.appendChild(fileElement);
            fileElement.setAttribute('directory', `${explorerFiles.getAttribute('directory')}/${file}`);
            fileElement.setAttribute('title', normalizePath(`${explorerFiles.getAttribute('directory')}/${file}`));
        });

    });
}


function createFileElement(name, isFolder){
    const fileElement = document.createElement('div');
    fileElement.classList.add('file-explorer');

    const icon = document.createElement('iconify-icon');
    icon.classList.add('file-icon-explorer');
    icon.style.color = generateColor();
    
    if(isFolder){
        icon.setAttribute('icon', 'flat-color-icons:folder');
        fileElement.onclick = function(){
            extendFolder(name, this.getAttribute('directory'));
        }
        fileElement.setAttribute('file', name);
    }else{
        const ext = name.split('.').pop().toLowerCase();
        icon.setAttribute('icon', getIconForExtension(ext));
        fileElement.onclick = function(){
            bringFile(name, this.getAttribute('directory'));
        }
        fileElement.setAttribute('file', name);
    }

    const fileName = document.createElement('p');
    fileName.textContent = name;

    fileElement.appendChild(icon);
    fileElement.appendChild(fileName);

    return fileElement;
}

function getIconForExtension(ext){
    const icons = {
        'txt': 'tabler:txt',
        'pdf': 'tabler:pdf',
        'jpg': 'tabler:jpg',
        'jpeg': 'tabler:jpg',
        'png': 'tabler:png',
        'gif': 'tabler:gif',
        'mp4': 'material-icon-theme:video',
        'mp3': 'material-icon-theme:audio',
        'html': 'devicon:html5',
        'css': 'devicon:css3',
        'js': 'devicon:javascript',
        'py': 'devicon:python',
        'cpp': 'devicon:cpp',
        'csharp': 'devicon:csharp',
        'cs': 'devicon:csharp',
        'c': 'devicon:c',
        'java': 'devicon:java',
        'json': 'vscode-icons:file-type-json',
        'zip': 'material-icon-theme:zip',
        'rar': 'material-icon-theme:zip',
        'sqlite3': 'vscode-icons:file-type-sql',
        'env': 'vscode-icons:file-type-dotenv',
        'ini': 'vscode-icons:file-type-ini',
        'bat': 'vscode-icons:file-type-bat',
        'exe': 'vscode-icons:file-type-bat',
        'dll': 'vscode-icons:file-type-bat',
        'md': 'material-icon-theme:readme',
    };
    return icons[ext] || 'codex:file';
}

function extendFolder(folder, directory){
    directory = normalizePath(directory);
    const explorerFiles = document.querySelector('.files-explorer');
    
    if (!document.querySelector(`.folder-explorer[directory='${directory}']`)){


        pywebview.api.get_files(directory).then(async function (files) {
            const folderDiv = document.createElement('div');
            folderDiv.classList.add('folder-explorer');
            folderDiv.setAttribute('folder', folder);
            folderDiv.setAttribute('directory', directory);

            const folders2 = [];
            const files2 = [];

            
            for(const file of files){
                const isFileFlag = await isFile(file, directory);
        
                if(isFileFlag){
                    files2.push(file);
                }else{
                    folders2.push(file);
                }
            }

            folders2.forEach(function (folder) {
                const folderElement = createFileElement(folder, true);
                folderDiv.appendChild(folderElement);
                folderElement.setAttribute('directory', `${folderDiv.getAttribute('directory')}/${folder}`);
                folderElement.setAttribute('title', normalizePath(`${folderDiv.getAttribute('directory')}/${folder}`));
            });

            files2.forEach(function (file) {
                const fileElement = createFileElement(file, false);
                folderDiv.appendChild(fileElement);
                fileElement.setAttribute('directory', `${folderDiv.getAttribute('directory')}/${file}`);
                fileElement.setAttribute('title', normalizePath(`${folderDiv.getAttribute('directory')}/${file}`));
            });

            if(folders2.length > 0 || files2.length > 0){
                console.log(directory);
                insertAfter(folderDiv, document.querySelector(`.file-explorer[directory='${directory}']`));
            }
        });
    } else {
        document.querySelector(`.folder-explorer[folder='${folder}']`).remove();
    }
}


function closeAllTabs(){
    document.querySelectorAll('.window').forEach(window => {
        window.style.display = 'none';
    }); 
    document.querySelector('.current-file').classList.remove('current-file');
}



const menus = [
    document.getElementById('file-menu'),
    document.getElementById('edit-menu'),
    document.getElementById('run-menu'),
    document.getElementById('terminal-menu'),
    document.getElementById('gpt-menu')
];

const frameButtons = [
    document.querySelector('.atr-file'),
    document.querySelector('.atr-edit'),
    document.querySelector('.atr-run'),
    document.querySelector('.atr-terminal'),
    document.querySelector('.atr-gpt')
];

frameButtons.forEach((button, index) => {
    button.addEventListener('click', function(event) {
        showMenu(menus[index], event);
    });
});

function showMenu(menu, event) {
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        event.target.style.backgroundColor = '';
        event.target.style.color = '';
    } else {
        menus.forEach(m => m.style.display = 'none');
        frameButtons.forEach(b => {
            b.style.backgroundColor = '';
            b.style.color = '';
        });

        menu.style.display = 'block';

        event.target.style.backgroundColor = 'rgba(175, 174, 174, 0.226)';
        event.target.style.color = '#fff';

        const rect = event.target.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;
    }
}

window.addEventListener('click', function(e) {
    if (![...frameButtons].includes(e.target)) {
        menus.forEach(menu => {
            menu.style.display = 'none';
        });
        frameButtons.forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
        });
    }
});


const bottomFilesElement = document.querySelector('.bottom-files');
const config = {
    attributes: true,
    childList: true, 
};


const callback = function(mutationsList, observer){
    let files = [];

    bottomFilesElement.querySelectorAll('.file-bottom').forEach(file => {
        const name = file.getAttribute('name');
        const directory = file.getAttribute('directory');
        files.push({name: name, directory: directory});

    });
    pywebview.api.save_bottom_files(files)

};

const observer = new MutationObserver(callback);
observer.observe(bottomFilesElement, config);


function isCurrentFileExist(){
    if(!document.querySelector('.current-file')){
        if(document.querySelector('.file-explorer.active')){
            document.querySelector('.file-explorer.active').classList.remove('active');
        }
        document.querySelectorAll('.window').forEach(window => {
            window.style.display = 'none';
        });
    }
}