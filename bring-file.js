
async function bringFile(name, directory){
    directory = normalizePath(directory);
    checkBottomExistance(name, directory);

    if(document.querySelector('.current-file')){
        document.querySelector('.current-file').classList.remove('current-file');
    }
    document.querySelector(`.file-bottom[directory="${directory}"]`).classList.add('current-file');

    if(document.querySelector('.file-explorer.active')){
        document.querySelector('.file-explorer.active').classList.remove('active');
    }
    if(document.querySelector(`.file-explorer[directory="${directory}"]`)){
        document.querySelector(`.file-explorer[directory="${directory}"]`).classList.add('active');
    }

    pywebview.api.set_current_file(name, directory);

    pywebview.api.watch_file(directory);
    
    const result = await pywebview.api.read_file(directory);

    if(checkEditorExist(directory)){
        document.querySelectorAll('.window').forEach(window => {
            window.style.display = 'none';
        });
        // compareContent(directory);

        document.querySelector(`.window[directory="${directory}"]`).style.display = 'flex';
    }else{
        const result = await pywebview.api.read_file(directory);
    
        const createWindow = document.createElement('div');
        createWindow.classList.add('window');
        createWindow.setAttribute('directory', directory);
    
        document.querySelectorAll('.window').forEach(window => {
            window.style.display = 'none';
        });
        createWindow.style.display = 'flex';
        document.querySelector('.windows').appendChild(createWindow);
    
        if(result == 'void'){
            openEditor(directory, findLanguage(name.split('.').pop().toLowerCase()), '');
        }else if(result == 'unsupport'){
            if (['jpg', 'jpeg', 'gif', 'png', 'ico', 'webp'].includes(name.split('.').pop().toLowerCase())){
                const createImage = document.createElement('img');
                const encodedImage = await pywebview.api.send_image(directory);
                createImage.src = `data:image/jpeg;base64,${encodedImage}`;
                createImage.classList.add('window-image');

                createWindow.style.alignItems = 'center';
                createWindow.style.justifyContent = 'center';

                let scale = 1;
                let isDragging = false;
                let startX, startY, initialX = 0, initialY = 0;

                createImage.style.cursor = 'grab';

                createImage.addEventListener('wheel', function(event) {
                    if (event.deltaY > 0) {
                        scale /= 1.1;
                    } else {
                        scale *= 1.1;
                    }
                    createImage.style.scale = scale;
                });

                createImage.addEventListener('mousedown', function(event){
                    event.preventDefault();
                    if (event.target && event.target.classList.contains('window-image')) {
                        isDragging = true;
                        startX = event.clientX - initialX;
                        startY = event.clientY - initialY;
                        event.target.style.cursor = 'grabbing';
                    }
                });

                createImage.addEventListener('mousemove', function(event) {
                    if (isDragging) {
                        initialX = event.clientX - startX;
                        initialY = event.clientY - startY;
                        createImage.style.transform = `translate(${initialX}px, ${initialY}px)`;
                    }
                });

                createImage.addEventListener('mouseup', function(event) {
                    isDragging = false;
                    event.target.style.cursor = 'grab';
                });

                createImage.addEventListener('mouseleave', function(event) {
                    if (isDragging) {
                        isDragging = false;
                        event.target.style.cursor = 'grab';
                    }
                });


                createWindow.appendChild(createImage);
            }else{
                const createPopup = document.createElement('div');
                createPopup.classList.add('window-popup');
                const createPopupDecoration = document.createElement('div');
                createPopupDecoration.classList.add('popup-decoration');
                const createNav = document.createElement('nav');
                createNav.classList.add('popup-nav');
                const createDiv = document.createElement('div');
                createDiv.classList.add('popup-div');
                const createIcon = document.createElement('iconify-icon');
                createIcon.setAttribute('icon', 'mage:file-cross-fill')
                createIcon.classList.add('popup-icon');
                const createTitle = document.createElement('p');
                createTitle.classList.add('popup-title');
                createTitle.textContent = 'Unsupported File Type'
                const createText = document.createElement('p');
                createText.classList.add('popup-text');
                createText.textContent = 'Unfortunately, the file type you are trying to upload is not supported.'
                const createButton = document.createElement('button');
                createButton.classList.add('popup-button');

                createPopup.appendChild(createPopupDecoration);

                createPopup.appendChild(createNav);
                createNav.appendChild(createIcon);

                createDiv.appendChild(createTitle);
                createDiv.appendChild(createText);
                createNav.appendChild(createDiv);

                createPopup.appendChild(createNav);

                createButton.textContent = 'Close Tab';
                createButton.onclick = function(){
                    closeAllTabs();
                }
                createPopup.appendChild(createButton);

                createWindow.style.alignItems = 'center';
                createWindow.style.justifyContent = 'center';
                createWindow.appendChild(createPopup);
            }
        }else if(result){
            openEditor(directory, findLanguage(name.split('.').pop().toLowerCase()), result);
        }
    }
}

function checkBottomExistance(name, directory){
    directory = normalizePath(directory);
    if(!document.querySelector(`.file-bottom[directory="${normalizePath(directory)}"]`)){
        const createFileBottom = document.createElement('div');
        createFileBottom.onclick = function(){
            bringFile(name, directory);
        };
        createFileBottom.classList.add('file-bottom');
        createFileBottom.setAttribute('directory', directory);
        createFileBottom.setAttribute('name', name);
        createFileBottom.setAttribute('title', normalizePath(directory));

        const unsavedSign = document.createElement('iconify-icon');
        unsavedSign.classList.add('unsaved-sign');
        unsavedSign.setAttribute('icon', 'pepicons-print:circle-filled');

        const createIcon = document.createElement('iconify-icon');
        createIcon.classList.add('file-icon');
        const ext = name.split('.').pop().toLowerCase();
        createIcon.setAttribute('icon', getIconForExtension(ext));

        const createFileName = document.createElement('p');
        createFileName.classList.add('file-name-bottom');
        createFileName.textContent = name;

        createFileBottom.appendChild(createIcon);
        createFileBottom.appendChild(createFileName);
        createFileBottom.appendChild(unsavedSign);

        createFileBottom.draggable = true;
        bottomFiles.appendChild(createFileBottom);
    }
}
 

function checkEditorExist(directory){
    if(document.querySelector(`.window[directory='${normalizePath(directory)}']`)){
        return true;
    }else{
        return false; 
    }
}


async function compareContent(file){
    file = normalizePath(file);
    for(let i = 0; i < editors.length; i++){
        if(editors[i].directory === file){
            pywebview.api.read_file(file).then(function(content){
                if(editors[i].editor.getValue() != content && !document.querySelector(`.file-bottom[directory='${file}']`).hasAttribute('unsaved')){
                    editors[i].editor.setValue(content);
                    document.querySelector(`.file-bottom[directory='${file}'] .unsaved-sign`).style.opacity = '0';
                    document.querySelector(`.file-bottom[directory='${file}']`).removeAttribute('unsaved');
                }
            });
            break;
        }
    }
}


