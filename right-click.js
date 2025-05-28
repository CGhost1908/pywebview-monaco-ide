document.addEventListener("DOMContentLoaded", function() {
    const bottomFiles = document.querySelector('.bottom-files');
    const fileBottomMenu = document.querySelector(".file-bottom-menu");
    let currentFile = null;

    document.addEventListener("contextmenu", function(event) {
        if (!bottomFiles.contains(event.target)) {
            fileBottomMenu.classList.add("hidden");
        }
    });
  
    bottomFiles.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        currentFile = event.target;
        
        fileBottomMenu.style.left = `${event.pageX}px`;
        fileBottomMenu.style.top = `${event.pageY - fileBottomMenu.offsetHeight}px`;
        fileBottomMenu.classList.remove("hidden");
    });

    document.addEventListener("click", function(event) {
        if (!fileBottomMenu.contains(event.target)) {
            fileBottomMenu.classList.add("hidden");
        }
    });
  
    document.getElementById("bottom-file-menu-anchor").addEventListener("click", function() {
        fileBottomMenu.classList.add("hidden");
        setAnchor(currentFile.getAttribute('directory'));
    });
});
