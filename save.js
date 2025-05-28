
function saveFile(file){
    if(file){
        currentDirectory = file;
    }else{
        currentDirectory = document.querySelector('.current-file').getAttribute('directory');
    }
    
    Object.values(editors).forEach(editor => {
        if(currentDirectory === editor.directory) {
            value = editor.editor.getValue();
            pywebview.api.save_file(currentDirectory, value).then(function(result){
                if(result == true){
                    document.querySelector(`.file-bottom[directory='${currentDirectory}'] .unsaved-sign`).style.opacity = '0';
                    document.querySelector(`.file-bottom[directory='${currentDirectory}']`).removeAttribute('unsaved');
                }
            });
        }
    });
}
