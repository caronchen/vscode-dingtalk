'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as popsicle from 'popsicle';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "dingtalk" is now active!');

    vscode.commands.registerCommand('dingtalk.webhookSend', () => webhookSend(true));
    vscode.commands.registerCommand('dingtalk.webhookSendTo', webhookSend);

    function webhookSend(useDefaultHook) {
        let cfg   = vscode.workspace.getConfiguration('dingtalk');
        let hooks = <Array<Object>>cfg.get('webhooks');

        if (hooks === undefined || hooks === null || hooks.length === 0) {
            vscode.window.showWarningMessage("Pls config hook address first.");
            return;
        }

        if (hooks.length === 1 || useDefaultHook) {
            getSendContent().then(send((<any>hooks[0]).url));
            return;
        }

        vscode.window.showQuickPick(hooks.map((item: any) => {
            return {
                "label": item.groupName,
                "description": item.robotName,
                "url": item.url
            };
        }), {
                matchOnDescription: false,
                matchOnDetail: false,
                placeHolder: "Loading Webhooks (pick one to open)"
            }).then((selected) => {
                if (selected) {
                    getSendContent().then(send(selected.url));
                }
            }, () => vscode.window.showErrorMessage("Error loading webhooks: ${reason}"));
    };

    function getSendContent() {
        let editor = vscode.window.activeTextEditor;

        if (!editor || editor.selection.isEmpty) {
            return vscode.window.showInputBox({
                prompt: "Message",
                placeHolder: "Input your message here."
            });
        } else {
            return new Promise<string>((resolve, reject) => resolve(editor.document.getText(editor.selection)));
        }
    }

    function send(url) {
        return (msg) => {
            if (msg === null || msg === undefined || msg === '') {
                return;
            }

            popsicle.request({
                method: 'POST',
                url: url,
                body: {
                    "msgtype": "markdown",
                    "markdown": {
                        "title": msg,
                        "text": msg
                    }
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => vscode.window.showInformationMessage('done.'));
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}