
new Sortable(document.querySelector('.bottom-files'), {
    animation: 150,
    filter: '.anchor-icon, .anchor-file, .anchor-block, .anchor-div',
    onStart: function(evt) {
        document.querySelector('.file-trash-bottom').style.display = 'flex';
    },
    onEnd: function(evt) {
        document.querySelector('.file-trash-bottom').style.display = 'none';
        document.querySelectorAll('.file-trash-bottom .file-bottom').forEach(function(file){
            file.remove();
        });
        isCurrentFileExist();
    },
    group: {
        name: 'files',
        put: true
    }
});

new Sortable(document.querySelector('.file-trash-bottom'), {
    animation: 150,
    group: {
        name: 'files',
        pull: 'clone',
    },
});

new Sortable(document.querySelector('.terminal-element'), {
    animation: 150,
    group: {
        name: 'files',
        pull: 'clone',
    },
    sort: false,
});