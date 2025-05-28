
function disableF5(e) { if ((e.which || e.keyCode) == 116) e.preventDefault(); };

document.addEventListener('keydown', function(event){
    
    if(event.ctrlKey && event.key === 's'){
        event.preventDefault();
        saveFile();
    }else if(event.ctrlKey && event.key === '`'){
        event.preventDefault();
        toggleTerminal();
    }else if(event.ctrlKey && event.altKey && event.key === '`'){
        event.preventDefault();
        console.log('dfhglkhdskfg')
        restartTerminal();
    }else if(event.key === 'F5'){
        disableF5(event);
        runCode();
    }
});