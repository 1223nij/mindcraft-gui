import {QMainWindow, QWidget, QLabel, QBoxLayout, Direction, QProgressBar, QPlainTextEdit} from '@nodegui/nodegui';
import * as path from "node:path";
import fs from 'node:fs';
import sourceMapSupport from 'source-map-support';
import git, {simpleGit} from 'simple-git';
import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import {exec} from "child_process";
import * as process from "node:process";

export async function RunUpdate(): Promise<void> {
    sourceMapSupport.install();
    // GUI Initialization
    const appDataLocation = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const mindCraftLocation = appDataLocation + "/mindcraft";
    const repoUrl = 'https://github.com/kolbytn/mindcraft.git';
    const alternativeClone = 'https://codeload.github.com/kolbytn/mindcraft/zip/refs/heads/main';
    const win = new QMainWindow();
    win.setWindowTitle("Mindcraft Updater");

    const centralWidget = new QWidget();

    const rootLayout = new QBoxLayout(Direction.TopToBottom);
    centralWidget.setObjectName("myroot");
    centralWidget.setLayout(rootLayout);

    const label = new QLabel();
    label.setObjectName("updatesLabel");
    label.setText("Checking for updates");

    const newLabel = new QLabel();
    newLabel.setText("Checking for a mindcraft installation at " + mindCraftLocation);

    const consoleOutput = new QPlainTextEdit()
    consoleOutput.setReadOnly(true);

    rootLayout.addWidget(label);
    rootLayout.addWidget(newLabel);
    rootLayout.addWidget(consoleOutput);
    win.setCentralWidget(centralWidget);
    win.setStyleSheet(
        `
        #myroot {
            width:500px; 
            height:500px;
            height: '100%';
            align-items: 'center';
            justify-content: 'center';
        }
        #updatesLabel {
            font-size: 16px;
            font-weight: bold;
        }
        `
    );
    centralWidget.setInlineStyle("width:500px; height:500px;");
    win.show();

    function checkKeys() : void{
        if (!fs.existsSync(mindCraftLocation + "/keys.json")){
            if (fs.existsSync(mindCraftLocation + "/keys.example.json")){
                fs.renameSync(mindCraftLocation + "/keys.example.json", mindCraftLocation + "/keys.json")
            } else {
                fetch("https://github.com/kolbytn/mindcraft/blob/main/keys.example.json")
                    .then((response) => response.buffer())
                    .then((buffer) => {
                        fs.writeFileSync(mindCraftLocation + "/keys.json", buffer);
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            }
        }
    }

    (global as any).win = win;
    let gitt
    if(!fs.existsSync(mindCraftLocation)){
        newLabel.setText("Mindcraft installation at " + mindCraftLocation + " not found. Cloning repo...");
        try {
            await git().clone(repoUrl, mindCraftLocation);
            newLabel.setText("Installed Mindcraft at " + mindCraftLocation + " with Git");
            checkKeys()
        } catch (error) {
            console.log(error);
            process.exit(1)
            /*newLabel.setText("Cloning with Git failed. Trying to download zip manually...");
            await fetch(alternativeClone)
                .then((response) => response.buffer())
                .then((buffer) => {
                    const zipPath = path.join(appDataLocation, 'mindcraft.zip');
                    fs.writeFileSync(zipPath, buffer);

                    const zip = new AdmZip(zipPath);
                    zip.extractAllTo(appDataLocation, true);

                    fs.unlinkSync(zipPath);
                    fs.renameSync(appDataLocation + "/mindcraft-main", appDataLocation + "/mindcraft")

                    console.log('File downloaded and extracted successfully.');
                    newLabel.setText("Installed Mindcraft at " + mindCraftLocation + " with manual zip download");
                    checkKeys()
                })
                .catch((error) => {
                    console.error('Error downloading or extracting the file:', error);
                    newLabel.setText("Manual zip download failed.");
                    process.exit(1);
                }); */
        }
    } else {
        newLabel.setText("Mindcraft installation at " + mindCraftLocation + " found.");
        checkKeys()
    }
    gitt = simpleGit(mindCraftLocation)
    const status = await gitt.status();

    if (status.behind > 0){
        label.setText("Updating");
        let tempFolder: string;
        newLabel.setText("Stashing configs");
        fs.mkdtemp("mindcraftManager", (err, folder) => {
            if (err) throw err;
            tempFolder = folder;
        })
        fs.cpSync(mindCraftLocation + "/profiles", tempFolder + "/profiles");
        fs.cpSync(mindCraftLocation + "/settings.js", tempFolder + "/settings.js");
        fs.cpSync(mindCraftLocation + "/keys.json", tempFolder + "/keys.json");
        newLabel.setText("Deleting MindCraft");
        fs.rmSync(mindCraftLocation, { recursive: true, force: true });
        newLabel.setText("Cloning MindCraft");
        try {
            await git().clone(repoUrl, mindCraftLocation);
            newLabel.setText("Updated Mindcraft at " + mindCraftLocation + " with Git");
            fs.cpSync(tempFolder + "/profiles", mindCraftLocation + "/profiles");
            fs.cpSync(tempFolder + "/settings.js", mindCraftLocation + "/settings.js");
            fs.cpSync(tempFolder + "/keys.json", mindCraftLocation + "/keys.json");
            newLabel.setText("Done!");
            console.log("Done!")
        } catch (error) {
            console.log(error);
            fs.cpSync(tempFolder + "/profiles", mindCraftLocation + "/profiles");
            fs.cpSync(tempFolder + "/settings.js", mindCraftLocation + "/settings.js");
            fs.cpSync(tempFolder + "/keys.json", mindCraftLocation + "/keys.json");
            console.log("Changes reverted.")
            process.exit(1)
        }
    }

    newLabel.setText("Checking for node_modules");
    if (!fs.existsSync(mindCraftLocation + "/node_modules")) {
        console.log("node_modules not found")
        newLabel.setText("Installing node_modules");
        await new Promise<void>((resolve) => {
            const process = exec("cd '" + mindCraftLocation + "' && npm install");
            let output = '';

            process.stdout.on('data', (data) => {
                output += data;
                consoleOutput.setPlainText(output);
            });

            process.stderr.on('data', (data) => {
                output += `Error: ${data}`;
                consoleOutput.setPlainText(output);
            });

            process.on('close', (code) => {
                output += `Command exited with code: ${code}`;
                consoleOutput.setPlainText(output);
                win.close()
                resolve();
            });
        });
        newLabel.setText("node_modules installed.");
    } else {
        newLabel.setText("node_modules found.");
        win.close()
    }
}



