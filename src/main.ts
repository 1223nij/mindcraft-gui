import {RunUpdate} from "./update"
import {keyWindow} from "./keys"
import {
    Direction,
    QBoxLayout,
    QLabel,
    QListView,
    QListWidget,
    QListWidgetItem,
    QMainWindow, QPlainTextEdit, QPushButton,
    QWidget
} from "@nodegui/nodegui";
import fs from "node:fs";
import { exec } from "child_process";


async function main() {
    await RunUpdate();

    const appDataLocation = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const mindCraftLocation = appDataLocation + "/mindcraft";
    const win = new QMainWindow();
    win.setWindowTitle("Mindcraft Instance Manager");

    const centralWidget = new QWidget();
    const rootLayout = new QBoxLayout(Direction.LeftToRight);
    centralWidget.setObjectName("myroot");
    centralWidget.setLayout(rootLayout);
    centralWidget.setMinimumSize(800, 600);

    const leftLayout = new QBoxLayout(Direction.TopToBottom);
    rootLayout.addLayout(leftLayout);

    const topButtonLayout = new QBoxLayout(Direction.LeftToRight);
    leftLayout.addLayout(topButtonLayout);

    const keysButton = new QPushButton();
    topButtonLayout.addWidget(keysButton);
    keysButton.setText("Keys");

    const patchesButton = new QPushButton();
    topButtonLayout.addWidget(patchesButton);
    patchesButton.setText("Apply Patches");

    const list = new QListWidget();
    leftLayout.addWidget(list);
    list.setObjectName("list");
    list.setFixedWidth(200);

    const buttonLayout = new QBoxLayout(Direction.LeftToRight);
    leftLayout.addLayout(buttonLayout);

    const removeButton = new QPushButton();
    buttonLayout.addWidget(removeButton);
    removeButton.setText("Remove");

    const AddButton = new QPushButton();
    buttonLayout.addWidget(AddButton);
    AddButton.setText("Add");


    const rightLayout = new QBoxLayout(Direction.TopToBottom);
    rootLayout.addLayout(rightLayout);

    const label = new QLabel();
    label.setObjectName("label");
    label.setText("Choose a profile to get started");
    label.setInlineStyle("font-weight: bold; font-size: 30px;");

    rightLayout.addWidget(label);

    const rightSideButtonLayout = new QBoxLayout(Direction.LeftToRight);
    rightLayout.addLayout(rightSideButtonLayout);

    const RunButton = new QPushButton();
    rightSideButtonLayout.addWidget(RunButton);
    RunButton.setText("Run");
    RunButton.setFixedWidth(100);
    rightSideButtonLayout.addStretch();

    const console = new QPlainTextEdit();
    console.setReadOnly(true);
    rightLayout.addWidget(console);

    win.setCentralWidget(centralWidget);
    win.show();

    fs.readdirSync(mindCraftLocation + "/profiles").forEach(file => {
        let listWidgetItem = new QListWidgetItem();
        listWidgetItem.setText(file.slice(0, -5));
        list.addItem(listWidgetItem);
    });

    list.addEventListener('itemClicked', (item) => {
        label.setText(item.text());
    });
    list.setCurrentItem(list.item(0));
    if (list.count() > 0) label.setText(list.item(0).text());

    function executeCommand(command: string) {
        const process = exec(command);
        let output = '';

        process.stdout.on('data', (data) => {
            output += data; // Collect output
            console.setPlainText(output);
        });

        process.stderr.on('data', (data) => {
            output += `Error: ${data}`;
            console.setPlainText(output);
        });

        process.on('close', (code) => {
            output += `Command exited with code: ${code}`;
            console.setPlainText(output);
        });
    }

    RunButton.addEventListener('clicked', () => {
        executeCommand("cd " + mindCraftLocation+ " && node main.js --profiles ./profiles/" + list.currentItem().text() + ".json");
    });

    keysButton.addEventListener('clicked', () => {
        keyWindow()
    });
}

main();
