// const { editor } = require("monaco-editor");

const apiPopup = document.querySelector('.api-popup');

function saveAiApiKey(){
    const input = document.querySelector('.api-popup input');
    if(input.value){
        pywebview.api.set_ai_api_key(input.value);
        apiPopup.classList.remove('active-popup');
        input.value = '';
        document.querySelector('.ai-api-tick').style.opacity = '1';
    }else{
        input.classList.add("shake");
        setTimeout(() => {
            input.classList.remove("shake");
        }, 400);
    }
    ai_api_key = pywebview.api.get_ai_api_key();
}

function openApiPopup(){
    apiPopup.classList.add('active-popup');
}

function sendAnswerPopup(result){
    console.log(result);
    const popupDiv = document.querySelector('.answer-popups');

    const popup = document.createElement('div');
    popup.classList.add('answer-popup');
    popup.innerHTML = result;
    popup.style.animation = 'enterPopup 0.3s forwards';

    // const textarea = document.createElement('div');
    // textarea.classList.add('answer-popup-editor');
    // textarea.value = result;
    // popup.appendChild(textarea);

    if(result){
        popupDiv.querySelectorAll('.answer-popup').forEach(popup => {
            popup.style.animation = 'slideIn 0.3s forwards';
            setTimeout(() => {
                popup.style.animation = '';
            }, 300);
        });
    
    
        popupDiv.insertBefore(popup, popupDiv.firstChild);
    }
}

const answerPopups = document.querySelector('.answer-popups');
let timeout;

answerPopups.addEventListener('mouseenter', () => {
    clearTimeout(timeout);
    showAnswerPopups();
});

answerPopups.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
        answerPopups.style.opacity = '0';
    }, 5000);
});


function showAnswerPopups(){
    answerPopups.style.opacity = '1';
}

function chatPanelToLeft(button){
    const content = document.querySelector('.content');
    const chatWindow = document.querySelector('.chat-window');
    const windows = document.querySelector('.windows');
    content.insertBefore(chatWindow, windows);

    document.querySelector('.ai-chat-panel-button.active').classList.remove('active');
    button.classList.add('active');
}

function chatPanelToRight(button){
    const content = document.querySelector('.content');
    const chatWindow = document.querySelector('.chat-window');
    const windows = document.querySelector('.windows');
    content.insertBefore(windows, chatWindow);

    document.querySelector('.ai-chat-panel-button.active').classList.remove('active');
    button.classList.add('active');

}

function closeChatPanel(){
    document.querySelector('.chat-window').style.display = 'none';
}

function openChatPanel(){
    document.querySelector('.chat-window').style.display = 'flex';
}

function formatGeminiResponse(text) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    text = text.replace(/```c#/gi, '```csharp');
    text = text.replace(/```c\+\+/gi, '```cpp');

    const codeBlocks = [];
    let replacedText = text.replace(codeBlockRegex, (match, lang = '', code) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        const html = `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
        codeBlocks.push(html);
        return `@@CODEBLOCK_${codeBlocks.length - 1}@@`;
    });

    const formattedText = replacedText
        .split(/\n{2,}/)
        .map(block => {
            const match = block.trim().match(/^@@CODEBLOCK_(\d+)@@$/);
            if (match) {
                return codeBlocks[parseInt(match[1])];
            }

            return `<p>${block
                .split('\n')
                .map(line =>
                    line
                        .replace(/\*{5}(.*?)\*{5}/g, '<b><i>$1</i></b>')
                        .replace(/\*{3}(.*?)\*{3}/g, '<b><i>$1</i></b>')
                        .replace(/\*\*_(.*?)_\*\*/g, '<b><i>$1</i></b>')
                        .replace(/\*\*"(.*?)"\*\*/g, '<b>"$1"</b>')
                        .replace(/"\*\*(.*?)\*\*"/g, '"<b>$1</b>"')
                        .replace(/\*\*~(.*?)~\*\*/g, '<b>$1</b>')
                        .replace(/\*\*#(.*?)\*\*/g, '<b>$1</b>')
                        .replace(/\*\*;(.*?);\*\*/g, '<b>$1</b>')
                        .replace(/\*\*\^(.*?)\^\*\*/g, '<b>$1</b>')
                        .replace(/\*\*\{(.*?)\}\*\*/g, '<b>$1</b>')
                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                        .replace(/_(.*?)_/g, '<i>$1</i>')
                ).join('<br>')}</p>`;
        })
        .join('\n');

    return formattedText;
}

let isAiWorking = false;

const promptInputField = document.querySelector('.prompt-input-field');
const sendPromptButton = document.querySelector('.send-prompt-button');

promptInputField.addEventListener('input', (event) => {
    if(promptInputField.value && promptInputField.value.trim() !== '' && !isAiWorking){
        sendPromptButton.removeAttribute('disabled');
    }
    else{
        sendPromptButton.setAttribute('disabled', true)
    }
});

const readCodeCheckbox = document.querySelector('#read-code-checkbox');
const readCodeButton = document.querySelector('.read-code-button');
const readCodeIcon = document.querySelector('.read-code-button iconify-icon');

readCodeCheckbox.addEventListener('change', (event) => {
    if(readCodeCheckbox.checked){
        readCodeButton.classList.add('active');
        readCodeIcon.setAttribute('icon', 'basil:book-check-solid');
    }else{
        readCodeButton.classList.remove('active');
        readCodeIcon.setAttribute('icon', 'basil:book-check-outline');
    }
});

promptInputField.addEventListener('keydown', function(event) {
    if(event.key === 'Enter' && !sendPromptButton.disabled) {
        event.preventDefault();
        sendPrompt();
    }
});

const aiChat = document.querySelector('.ai-chat');

function sendPrompt(){
    const createThinkingNav = document.createElement('nav');
    createThinkingNav.classList.add('ai-generating-nav');
    const createAiGeneratingIcon = document.createElement('iconify-icon');
    createAiGeneratingIcon.classList.add('ai-generating-icon');
    createAiGeneratingIcon.setAttribute('icon', 'line-md:loading-twotone-loop');
    const createAiGeneratingMessage = document.createElement('p');
    createAiGeneratingMessage.classList.add('ai-generating-message');
    createAiGeneratingMessage.innerHTML = "Thinking...";
    createThinkingNav.appendChild(createAiGeneratingIcon);
    createThinkingNav.appendChild(createAiGeneratingMessage);

    let prompt = promptInputField.value;

    isAiWorking = true;

    const createMessageBox = document.createElement('p');
    createMessageBox.classList.add('message-box');
    createMessageBox.innerHTML = prompt;

    if(readCodeCheckbox.checked){
        for(let i = 0; i < editors.length; i++){
            if(editors[i].directory === document.querySelector('.current-file').getAttribute('directory')){
                prompt += editors[i].editor.getValue();
                const createReadMessage = document.createElement('iconify-icon');
                createReadMessage.classList.add('read-message-icon');
                createReadMessage.setAttribute('icon', 'hugeicons:ai-book');
                createMessageBox.prepend(createReadMessage);
                break;
            }
        }
    }

    aiChat.appendChild(createMessageBox);
    aiChat.appendChild(createThinkingNav);

    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const MAX_TOKENS = 1000000;
    let totalCharCount = chatHistory.map(msg => msg.parts[0]).join('').length;
    if(totalCharCount > MAX_TOKENS * 3) {
        alert("Prompt history is too long! Please clear or shorten the conversation.");
        return;
    }

    pywebview.api.answer_prompt(chatHistory).then((result) => {
        console.log(result);

        result = formatGeminiResponse(result);

        const createMessageBox = document.createElement('p');
        createMessageBox.classList.add('ai-message');
        createMessageBox.innerHTML = result;
        aiChat.appendChild(createMessageBox);

        chatHistory.push({ role: "user", parts: [{ text: result }] });
        pywebview.api.set_ai_chat(chatHistory);
        hljs.highlightAll();
        createThinkingNav.remove();
        isAiWorking = false;
    }).catch((error) => {
        console.error("Error:", error);
        const createMessageBox = document.createElement('p');
        createMessageBox.classList.add('ai-message');
        createMessageBox.innerHTML = "An error occurred while processing your request.";
        aiChat.appendChild(createMessageBox);
        createThinkingNav.remove();
        isAiWorking = false;
    });

    promptInputField.value = '';
    sendPromptButton.setAttribute('disabled', true);
    readCodeCheckbox.checked = false;
    readCodeButton.classList.remove('active');
    readCodeIcon.setAttribute('icon', 'basil:book-check-outline');
}


function clearChatHistory(){
    chatHistory = [];
    pywebview.api.set_ai_chat(chatHistory);
    aiChat.innerHTML = '';
}