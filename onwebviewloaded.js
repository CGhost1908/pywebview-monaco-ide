let ai_api_key;
let chatHistory = [];

window.onload = function() {
    const checkPyWebviewAPI = () => {
        if(typeof window.pywebview !== "undefined" && window.pywebview.api){
            // AFTER PYWEBVIEW IS LOADED
            loadExplorer();
            loadVisuals();

            pywebview.api.get_explorer().then(function(explorer){
                if(explorer){
                    openExplorer();
                }
            });

            ai_api_key = pywebview.api.get_ai_api_key();
            if(ai_api_key)document.querySelector('.ai-api-tick').style.opacity='1';
            
            pywebview.api.get_ai_chat().then(result => {
                chatHistory = result;
            });

        }else{
            setTimeout(checkPyWebviewAPI, 100);
        }
    };
    checkPyWebviewAPI();
};


function loadVisuals(){
    pywebview.api.get_editors().then(function(editorStates){
        pywebview.api.get_current_file().then(function(currentFile){
            pywebview.api.get_bottom_files().then(async function(bottomFiles){
                document.querySelector('.bottom-files').innerHTML = '';
                for(const file of bottomFiles){
                    if(!file.directory && file.name){
                        openMLTab(file.name);
                    }else if(file.name){
                        await bringFile(file.name, normalizePath(file.directory));
                    }
                }
                
                if(!currentFile.directory && currentFile.name){
                    openMLTab(currentFile.name);
                }else{
                    if(document.querySelector(`.file-bottom[directory="${normalizePath(currentFile.directory)}"]`)){
                        await bringFile(currentFile.name, normalizePath(currentFile.directory));
                    }
                }
                
                setTimeout(() => {
                    editorStates.forEach(state => {
                        for(let i = 0; i < editors.length; i++){
                            if(normalizePath(editors[i].directory) === normalizePath(state.directory)){
                                if(editors[i].editor.getValue() != state.content){
                                    editors[i].editor.setValue(state.content);
                                }

                                if(state.cursor){
                                    editors[i].editor.setPosition({
                                        lineNumber: state.cursor.lineNumber,
                                        column: state.cursor.column
                                    });
                                }
                                
                                if(state.scrollTop !== undefined){
                                    editors[i].editor.setScrollTop(state.scrollTop);
                                }
                                if(state.scrollLeft !== undefined){
                                    editors[i].editor.setScrollLeft(state.scrollLeft);
                                }

                                break;
                            }
                        }
                    });
                
                    pywebview.api.get_anchor_file().then(function(anchorFile){
                        if(anchorFile){
                            setAnchor(anchorFile.directory);
                        }
                    });
                }, 1000);
            });
        });
    });

}




