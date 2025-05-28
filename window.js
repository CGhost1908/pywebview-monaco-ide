let isDragging = false;
let startX, startY;

document.querySelector('.drag-bar').addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        let win = pywebview.api;
        win.move(e.screenX - startX, e.screenY - startY);
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

document.querySelector('.minimize').addEventListener('click', function() {
    pywebview.api.minimize();
});

document.querySelector('.maximize').addEventListener('click', function() {
    pywebview.api.maximize();
});

document.querySelector('.close').addEventListener('click', function() {
    pywebview.api.close();
});

// Resize
function setupResizer(id, edge) {
    const resizer = document.getElementById(id);
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startWinX, startWinY;

    resizer.addEventListener('mousedown', async function(e) {
        e.preventDefault();
        isResizing = true;

        const info = await window.pywebview.api.get_window_info();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = info.width;
        startHeight = info.height;
        startWinX = info.x;
        startWinY = info.y;

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = startWinX;
        let newY = startWinY;
        let newWidth = startWidth;
        let newHeight = startHeight;

        if(edge === 'right') {
            newWidth = startWidth + dx;
        } else if(edge === 'left') {
            newWidth = startWidth - dx;
            newX = startWinX + dx; 
        } else if(edge === 'bottom') {
            newHeight = startHeight + dy;
        } else if(edge === 'top') {
            newHeight = startHeight - dy;
            newY = startWinY + dy;
        }

        window.pywebview.api.resize_and_move(newX, newY, newWidth, newHeight);
    }

    function onMouseUp() {
        isResizing = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }
}

setupResizer('resizer1', 'left');   
setupResizer('resizer2', 'right');  
setupResizer('resizer3', 'top');    
setupResizer('resizer4', 'bottom'); 

function fibonacci(number){
    
}