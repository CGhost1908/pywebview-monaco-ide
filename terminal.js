
let terminalElement = document.querySelector('.terminal-element');

let socket, term = null;

let isServerOpen = false;

function openTerminal(){

    if(term){
        terminalElement.style.display = 'flex';
        term.focus();
        return;
    }

    if(!isServerOpen){
        pywebview.api.start_server()
        isServerOpen = true;
    }

    socket = new WebSocket('ws://localhost:8765');

    terminalElement.style.display = 'flex';

    term = new Terminal({
        fontFamily: 'Courier New, monospace',
        fontSize: 14,
        width: '100%',
        height: '200px',
        theme: {
            foreground: '#ffffff',
            cursor: '#b035f9',
            selectionBackground: 'rgba(255, 255, 255, 0.3)'
        },
        cursorBlink: true,
    });

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalElement);
    fitAddon.fit();

    socket.onopen = () => {
        socket.send('');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        term.write(data.response.replace(/\n/g, '\r\n'));
    };

    let buffer = '';

    term.onData((data) => {
        if(data === '\r'){
            if(buffer.toLowerCase() === 'cls' || buffer.toLowerCase() === 'clear'){
                term.write('\n');
                term.clear();
                buffer = '';
                socket.send('');
            }else{
                socket.send(buffer);
                buffer = '';
                term.write('\r\n');
            }
        }else if(data === '\u007F'){
            if(buffer.length > 0) {
                buffer = buffer.slice(0, -1);
                term.write('\b \b');
            }
        }else if(data === '\x1b[A' || data === '\x1b[B' || data === '\x1b[C' || data === '\x1b[D'){
            return;
        }else if(data === '\x03'){
            console.log('terminate')
            socket.send('terminate');
        }else{
            buffer += data;
            term.write(data);
        }
    });

    term.focus();

}

function closeTerminal(){
    terminalElement.style.display = 'none';
}

function killTerminal(){
    closeTerminal();
    if(term){
        term.dispose();
        term = null;
    }
    if(socket){
        socket.close();
        // pywebview.api.stop_server()
        // isServerOpen = false;
    }
    terminalElement.innerHTML = '';
}

function restartTerminal(){
    if(term){
        term.dispose();
        term = null;
    }
    if(socket){
        socket.close();
    }
    terminalElement.innerHTML = '';
    openTerminal();
}

function toggleTerminal(){
    if(terminalElement.style.display == 'flex'){
        closeTerminal();
    }else{
        openTerminal();
    }
}