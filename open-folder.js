
function openFolder(folders){
    pywebview.api.set_directory(folders[0]).then(function(path){
        closeAllTabs();
        loadExplorer();
        if(document.querySelector('.explorer').style.display === 'none' || document.querySelector('.explorer').style.display === ''){
            openExplorer();
        }
        loadVisuals();
    });
}