

function draggingFile(){
}

function draggingOver(){
    document.querySelector('.drag-overlay').style.display = 'none';
}

function openDroppedItems(folders, files){
    if(folders.length > 0){
        openFolder(folders);
    }

    if(files){
        files.forEach(file => {
            const name = file.name;
            const directory = normalizePath(file.directory);
            bringFile(name, directory);
        });
    }
}

document.querySelector('.content').addEventListener('dragover', function(event){
    document.querySelector('.drag-overlay').style.display = 'flex';
    event.preventDefault();
    event.stopPropagation();
});
document.querySelector('.drag-overlay').addEventListener('dragleave', function(event) {
    document.querySelector('.drag-overlay').style.display = 'none';
    event.preventDefault();
    event.stopPropagation();
    console.log('leave');
});
document.querySelector('.drag-overlay').addEventListener('drop', function(event) {
    document.querySelector('.drag-overlay').style.display = 'none';
});
