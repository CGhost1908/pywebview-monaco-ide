let editors = [];
let editorStates = [];

function openEditor(directory, language, content){
    let editor = null;
    directory = normalizePath(directory);

    require(['vs/editor/editor.main'], function() {

        monaco.editor.defineTheme('custom', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                "activityBar.dropBorder": "#9039c7",
                "activityBar.foreground": "#fff",
                "activityBarBadge.background": "#4d057b",
                "activityBarBadge.foreground": "#e7e7e7",
                "badge.background": "#7d16bfa0",
                "breadcrumb.activeSelectionForeground": "#ede4f1",
                "breadcrumb.background": "#25013c",
                "breadcrumb.focusForeground": "#ede4f1",
                "breadcrumb.foreground": "#ede4f1",
                "breadcrumbPicker.background": "#160024",
                "button.background": "#7d16bf",
                "button.hoverBackground": "#9039c7",
                "button.secondaryBackground": "#5a068e80",
                "button.secondaryHoverBackground": "#5a068e",
                "contrastBorder": "#4d057b",
                "debugToolBar.background": "#4d057b",
                "diffEditor.border": "#4d057b",
                "diffEditor.diagonalFill": "#d4d4d425",
                "diffEditor.insertedTextBackground": "#00ff0028",
                "diffEditor.removedTextBackground": "#ff000028",
                "diffEditor.unchangedRegionBackground": "#25013c",
                "diffEditor.unchangedRegionShadow": "#8818cd",
                "diffEditor.unchangedRegionForeground": "#d4d4d4d0",
                "dropdown.background": "#350354",
                "dropdown.border": "#350354",
                "dropdown.foreground": "#d4d4d4",
                "dropdown.listBackground": "#350354",
                "editor.findMatchBackground": "#7d16bf",
                "editor.findMatchHighlightBackground": "#4d057be0",
                "editor.findRangeHighlightBackground": "#4d057b50",
                "editor.foreground": "#d4d4d4",
                "editor.hoverHighlightBackground": "#4d057b80",
                "editor.inactiveSelectionBackground": "#4d057b80",
                "editor.lineHighlightBackground": "#25013Cb0",
                "editor.rangeHighlightBackground": "#4d057ba0",
                "editor.selectionBackground": "#1D022E",
                "editor.selectionHighlightBackground": "#2F0F42FF",
                "editor.wordHighlightBackground": "#1D022E",
                "editor.wordHighlightStrongBackground": "#1D022E",
                "editorBracketMatch.background": "#4d057b",
                "editorBracketMatch.border": "#7d16bfb0",
                "editorBracketHighlight.foreground1": "#ffd700",
                "editorBracketHighlight.foreground2": "#da70d6",
                "editorBracketHighlight.foreground3": "#179fff",
                "editorBracketPairGuide.activeBackground1": "#ffd70090",
                "editorBracketPairGuide.activeBackground2": "#da70d690",
                "editorBracketPairGuide.activeBackground3": "#179fff90",
                "editorBracketPairGuide.background1": "#ffd70040",
                "editorBracketPairGuide.background2": "#da70d640",
                "editorBracketPairGuide.background3": "#179fff40",
                "editorCodeLens.foreground": "#9e85add0",
                "editorCursor.foreground": "#b133ff",
                "editorGroup.border": "#4d057b",
                "editorGroup.dropBackground": "#9039c750",
                "editorGroup.emptyBackground": "#160024",
                "editorGroupHeader.noTabsBackground": "#25013c",
                "editorGroupHeader.tabsBackground": "#25013c",
                "editorGroupHeader.tabsBorder": "#25013c",
                "editorHoverWidget.background": "#350354",
                "editorHoverWidget.border": "#4d057b",
                "editorInlayHint.foreground": "#d4d4d460",
                "editorInlayHint.background": "#b133ff10",
                "editorIndentGuide.activeBackground": "#9e85ad32",
                "editorIndentGuide.activeBackground1": "#9e85ad32",
                "editorIndentGuide.background": "#9e85ad00",
                "editorIndentGuide.background1": "#9e85ad00",
                "editorLink.activeForeground": "#ba7dd9",
                "editorMarkerNavigation.background": "#25013c",
                "editorMarkerNavigationError.background": "#ff5a5a",
                "editorMarkerNavigationWarning.background": "#5aac5a",
                "editorOverviewRuler.border": "#160024",
                "editorRuler.foreground": "#9e85ad20",
                "editorStickyScroll.background": "#25013c",
                "editorStickyScrollHover.background": "#4d057b60",
                "editorStickyScroll.border": "#4d057ba0",
                "editorStickyScroll.shadow": "#4d057b30",
                "editorSuggestWidget.foreground": "#d4d4d4d0",
                "editorSuggestWidget.background": "#25013c",
                "editorSuggestWidget.border": "#4d057bb0",
                "editorSuggestWidget.selectedBackground": "#4d057b",
                "editorSuggestWidget.selectedForeground": "#d4d4d4",
                "editorSuggestWidget.highlightForeground": "#ba7dd9",
                "editorWhitespace.foreground": "#9e85ad32",
                "editorWidget.background": "#4d057b",
                "errorForeground": "#e86969",
                "foreground": "#d4d4d4",
                "input.background": "#350354",
                "input.foreground": "#d4d4d4",
                "input.placeholderForeground": "#d4d4d460",
                "inputOption.activeBorder": "#7d16bf",
                "list.activeSelectionBackground": "#4d057b",
                "list.activeSelectionForeground": "#d4d4d4",
                "list.deemphasizedForeground": "#d4d4d450",
                "list.dropBackground": "#4d057b80",
                "list.focusBackground": "#4d057b",
                "list.focusForeground": "#d4d4d4",
                "list.highlightForeground": "#ba7dd9",
                "list.hoverBackground": "#4d057b80",
                "list.hoverForeground": "#d4d4d4a0",
                "list.inactiveFocusBackground": "#4d057b",
                "list.inactiveSelectionBackground": "#4d057b80",
                "list.inactiveSelectionForeground": "#d4d4d4",
                "list.invalidItemForeground": "#e86969",
                "menu.background": "#25013c",
                "menu.border": "#4d057b",
                "menu.foreground": "#fff",
                "menu.selectionForeground": "#fff",
                "menu.separatorBackground": "#4d057b",
                "menubar.selectionBackground": "#25013c",
                "menubar.selectionBorder": "#25013c",
                "menubar.selectionForeground": "#fff",
                "multiDiffEditor.border": "#4d057bb0",
                "multiDiffEditor.headerBackground": "#25013c",
                "notebook.cellBorderColor": "#4d057ba6",
                "notebook.cellHoverBackground": "#4d057b40",
                "notebook.cellStatusBarItemHoverBackground": "#4d057b60",
                "notebook.cellToolbarSeparator": "#4d057b60",
                "notebook.focusedEditorBorder": "#4d057b",
                "notebook.focusedCellBorder": "#4d057b",
                "notebook.focusedCellBackground": "#4d057b60",
                "notebook.outputContainerBackgroundColor": "#25013c",
                "notifications.background": "#4d057b",
                "panel.background": "#25013c",
                "panel.border": "#160024",
                "panel.dropBorder": "#9039c7",
                "panelSectionHeader.background": "#4d057b",
                "panelTitle.activeBorder": "#7d16bf",
                "panelTitle.inactiveForeground": "#e7e7e750",
                "panelTitle.activeForeground": "#e7e7e7",
                "peekView.border": "#4d057b",
                "peekViewEditorStickyScroll.background": "#25013c",
                "peekViewTitle.background": "#4d057b",
                "peekViewResult.background": "#25013c",
                "peekViewEditor.background": "#25013c80",
                "peekViewEditor.matchHighlightBackground": "#4d057be0",
                "peekViewEditorGutter.background": "#25013c80",
                "peekViewResult.matchHighlightBackground": "#4d057be0",
                "peekViewResult.selectionBackground": "#4d057b",
                "pickerGroup.border": "#4d057b",
                "pickerGroup.foreground": "#b884d2",
                "progressBar.background": "#9039c7",
                "quickInput.foreground": "#d4d4d4d0",
                "quickInput.background": "#25013c",
                "quickInputList.focusBackground": "#4d057b",
                "quickInputList.focusForeground": "#d4d4d4",
                "sash.hoverBorder": "#4d057b",
                "scrollbar.shadow": "#160024",
                "scrollbarSlider.activeBackground": "#7d16bfa0",
                "scrollbarSlider.background": "#7d16bf50",
                "scrollbarSlider.hoverBackground": "#7d16bf80",
                "selection.background": "#9039c7",
                "settings.checkboxBackground": "#350354",
                "settings.checkboxBorder": "#350354",
                "settings.dropdownBackground": "#350354",
                "settings.dropdownBorder": "#350354",
                "settings.headerForeground": "#d4d4d4",
                "settings.numberInputBackground": "#350354",
                "settings.numberInputBorder": "#350354",
                "settings.textInputBackground": "#350354",
                "settings.textInputBorder": "#350354",
                "sideBar.background": "#25013c",
                "sideBarSectionHeader.background": "#4d057b",
                "statusBar.background": "#7d16bf",
                "statusBar.border": "#7d16bf",
                "statusBar.debuggingBackground": "#9716bf",
                "statusBar.debuggingBorder": "#9716bf",
                "statusBar.noFolderBackground": "#7d16bf",
                "statusBarItem.remoteBackground": "#9333dc",
                "statusBarItem.remoteForeground": "#ffffff",
                "tab.activeBackground": "#7d16bf",
                "tab.activeBorder": "#b133ff",
                "tab.unfocusedActiveBorder": "#9039c7",
                "tab.border": "#4d057b",
                "tab.inactiveBackground": "#4d057b",
                "tab.inactiveForeground": "#ffffff80",
                "tab.unfocusedInactiveForeground": "#ffffff66",
                "tab.unfocusedActiveForeground": "#ffffff80",
                "terminal.background": "#160024",
                "terminal.foreground": "#d4d4d4",
                "terminalStickyScrollHover.background": "#4d057b60",
                "textBlockQuote.background": "#d4d4d41a",
                "textBlockQuote.border": "#d4d4d440",
                "textCodeBlock.background": "#d4d4d41a",
                "textLink.activeForeground": "#ba7dd9",
                "textLink.foreground": "#ba7dd9",
                "titleBar.activeBackground": "#7d16bf",
                "titleBar.inactiveBackground": "#4d057b",
                "widget.border": "#4d057b",
                "widget.shadow": "#4d057b60",
                "window.activeBorder": "#7d16bf",
                "window.inactiveBorder": "#4d057b",
                'editor.background': '#00000000',
                // 'editor.lineHighlightBackground': '#3f1e84',
                'editor.focusBorder': 'none'
            },
        });
    
        editor = monaco.editor.create(document.querySelector(`.window[directory='${normalizePath(directory)}']`), {
            value: content,
            language: language,
            theme: "custom",
            automaticLayout: true,
            focusBorder: false,
            overviewRulerBorder: false,
            readOnly: false,
            folding: true,
            minimap: {
                enabled: false,
            },
            editorStickyScroll: false,
            suggestOnTriggerCharacters: true,
            tabCompletion: 'on',
            parameterHints: {
                enabled: false,
            },
            quickSuggestions: {
                comments: true,
                other: true,
                strings: true,
            },
        });

        editor.addAction({
            id: 'complete-code-button',
            label: 'Complete Code',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1,
            run: async function(ed) {
                const currentPosition = editor.getPosition();
                const model = editor.getModel();
                const decorations = editor.getLineDecorations(currentPosition.lineNumber);

                if (decorations.length > 0) {
                    const range = model.getDecorationRange(decorations[0].id);
                    if (range) {
                        const newEndLineNumber = range.endLineNumber;

                        const upperRange = new monaco.Range(
                            range.startLineNumber,
                            1,
                            newEndLineNumber,
                            range.endColumn
                        );

                        const selectedText = model.getValueInRange(upperRange);

                        console.log(selectedText);

                        const result = await window.pywebview.api.complete_code(selectedText);

                        const selectionRange = new monaco.Range(
                            currentPosition.lineNumber + 1,
                            1,
                            currentPosition.lineNumber + 1,
                            1
                        );

                        model.pushEditOperations(
                            [selectionRange],
                            [{
                                range: selectionRange,
                                text: result + "\n",
                                forceMoveMarkers: true
                            }],
                            () => null
                        );
                    }
                }
            }
        });

        editor.addAction({
            id: 'ask-to-ai-button',
            label: 'Ask to AI',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1,
            run: function(ed) {
                openChatPanel();
            }
        });
        

        editors.push({
            directory: directory,
            editor: editor
        });

        editorStates.push({
            directory: directory,
            content: editor.getValue(),
            cursor: editor.getPosition(),
            scrollTop: editor.getScrollTop(),
            scrollLeft: editor.getScrollLeft(),
        });

        pywebview.api.save_editors(editorStates);

        let timeout;

        editor.onDidChangeModelContent(async (event) => {
            document.querySelector(`.file-bottom[directory='${directory}'] .unsaved-sign`).style.opacity = '1';
            document.querySelector(`.file-bottom[directory='${directory}']`).setAttribute('unsaved', '');

            for (let i = 0; i < editorStates.length; i++) {
                if (editorStates[i].directory === directory) {
                    editorStates[i].content = editor.getValue();
                    editorStates[i].cursor = editor.getPosition();
                    editorStates[i].scrollTop = editor.getScrollTop();
                    editorStates[i].scrollLeft = editor.getScrollLeft();
                    pywebview.api.save_editors(editorStates);
                    break;
                }
            }

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(() => {
                const currentPosition = editor.getPosition();
                const model = editor.getModel();
                const decorations = editor.getLineDecorations(currentPosition.lineNumber);

                if (decorations.length > 0) {
                    const range = model.getDecorationRange(decorations[0].id);
                    if (range) {
                        const newEndLineNumber = range.endLineNumber;

                        const upperRange = new monaco.Range(
                            range.startLineNumber,
                            1,
                            newEndLineNumber,
                            range.endColumn
                        );

                        const selectedText = model.getValueInRange(upperRange);

                        // window.pywebview.api.answer_prompt(selectedText).then(response => {
                        //     sendAnswerPopup(response);
                        // });
                    }
                }
            }, 2000); 
        });

        editor.onDidChangeCursorPosition((e) => {
            for(let i = 0; i < editorStates.length; i++) {
                if(editorStates[i].directory === directory){
                    editorStates[i].cursor = editor.getPosition();
                    editorStates[i].scrollTop = editor.getScrollTop();
                    editorStates[i].scrollLeft = editor.getScrollLeft();
                    pywebview.api.save_editors(editorStates);
                    break;
                }
            }
        });
          
        // editor.onDidScrollChange((e) => {
        //     for(let i = 0; i < editorStates.length; i++) {
        //         if(editorStates[i].directory === directory){
        //             editorStates[i].scrollTop = editor.getScrollTop();
        //             editorStates[i].scrollLeft = editor.getScrollLeft();
        //             pywebview.api.save_editors(editorStates);
        //             break;
        //         }
        //     }
        // });
    });
}