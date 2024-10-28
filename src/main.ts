import {RunUpdate} from "./update"
import {keyWindow} from "./keys"
import {modelList} from "./models";
import {
    CheckState,
    Direction,
    QAction,
    QBoxLayout,
    QCheckBox,
    QComboBox,
    QIcon,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMenu,
    QMenuBar,
    QPlainTextEdit,
    QPushButton,
    QWidget
} from "@nodegui/nodegui";
import fs from "node:fs";
import {exec} from "child_process";


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

    const menuBar = new QMenuBar();
    win.setMenuBar(menuBar);

    let logs = {}

    // File Menu
    const fileMenu = new QMenu();
    fileMenu.setTitle("Configure");
    const keysAction = new QAction();
    keysAction.setText("Keys");
    fileMenu.addAction(keysAction)
    const reinstallModulesAction = new QAction();
    reinstallModulesAction.setText("Reinstall node_modules / Check for updates");
    fileMenu.addAction(reinstallModulesAction)

    menuBar.addMenu(fileMenu)

    const leftLayout = new QBoxLayout(Direction.TopToBottom);
    rootLayout.addLayout(leftLayout);

    const topButtonLayout = new QBoxLayout(Direction.LeftToRight);
    leftLayout.addLayout(topButtonLayout);

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

    const label = new QLineEdit();
    label.setObjectName("label");
    label.setText("Choose a profile to get started");
    label.setInlineStyle("font-weight: bold; font-size: 20px;");

    rightLayout.addWidget(label);

    const rightSideButtonLayout = new QBoxLayout(Direction.LeftToRight);
    rightLayout.addLayout(rightSideButtonLayout);

    const RunButton = new QPushButton();
    rightSideButtonLayout.addWidget(RunButton);
    RunButton.setText("Run");
    RunButton.setFixedWidth(100);

    const toggleConsoleButton = new QPushButton();
    toggleConsoleButton.setText("Toggle Console");
    rightSideButtonLayout.addWidget(toggleConsoleButton);
    toggleConsoleButton.setFixedWidth(125);

    rightSideButtonLayout.addStretch();

    const console = new QPlainTextEdit();
    console.setReadOnly(true);
    console.setVisible(false);
    rightLayout.addWidget(console);

    const modelLayout = new QBoxLayout(Direction.LeftToRight);
    rightLayout.addLayout(modelLayout);

    const providerLabel = new QLabel();
    providerLabel.setText("Provider");
    modelLayout.addWidget(providerLabel);

    const providerDropdown = new QComboBox()
    modelLayout.addWidget(providerDropdown);
    for (let key in modelList) {
        providerDropdown.addItem(new QIcon(), key)
    }

    const modelLabel = new QLabel();
    modelLabel.setText("Model");
    modelLayout.addWidget(modelLabel);

    const modelDropdown = new QComboBox()
    modelDropdown.setFixedWidth(150)
    modelLayout.addWidget(modelDropdown);

    const modelTextBox = new QLineEdit()
    modelLayout.addWidget(modelTextBox);
    modelTextBox.setVisible(false)

    const textInputCheckBox = new QCheckBox()
    textInputCheckBox.setText("Use text box")
    modelLayout.addWidget(textInputCheckBox);

    const customURLLayout = new QBoxLayout(Direction.LeftToRight);
    rightLayout.addLayout(customURLLayout);

    const customURLLabel = new QLabel()
    customURLLabel.setText("Custom URL");
    customURLLayout.addWidget(customURLLabel);

    const customURLTextBox = new QLineEdit()
    customURLLayout.addWidget(customURLTextBox);

    customURLLayout.addStretch()

    modelLayout.addStretch()

    const modes = new QListWidget()
    modes.setFixedSize(150, 200)
    const modesList = {
        "self_preservation": "Self Preservation",
        "unstuck": "Unstuck",
        "cowardice": "Cowardice",
        "self_defense": "Self defense",
        "hunting": "Hunting",
        "item_collecting": "Item collecting",
        "torch_placing": "Torch placing",
        "idle_staring": "Idle staring",
        "cheat": "Cheat"
    }

    for (let key in modesList) {
        let listWidgetItem = new QListWidgetItem()
        listWidgetItem.setText(modesList[key])
        listWidgetItem.setCheckState(CheckState.Unchecked)
        modes.addItem(listWidgetItem)
    }

    rightLayout.addWidget(modes)

    rightLayout.addStretch()

    const serverSettingsLayout = new QBoxLayout(Direction.TopToBottom)
    rootLayout.addLayout(serverSettingsLayout);

    const ipLayout = new QBoxLayout(Direction.RightToLeft);
    serverSettingsLayout.addLayout(ipLayout)

    const ipLabel = new QLabel()
    ipLabel.setText("IP Address");

    const ipAddress = new QLineEdit()
    ipAddress.setFixedWidth(150)

    ipLayout.addWidget(ipAddress)
    ipLayout.addWidget(ipLabel)

    ipLayout.addStretch()

    const portLayout = new QBoxLayout(Direction.RightToLeft);
    serverSettingsLayout.addLayout(portLayout)

    const portLabel = new QLabel()
    portLabel.setText("Port");

    const port = new QLineEdit()
    port.setFixedWidth(150)

    portLayout.addWidget(port)
    portLayout.addWidget(portLabel)

    portLayout.addStretch()

    const minecraftVersionLayout = new QBoxLayout(Direction.RightToLeft)
    serverSettingsLayout.addLayout(minecraftVersionLayout)

    const minecraftVersionDropdown = new QComboBox()
    const testedVersions = ['1.8.8', '1.9.4', '1.10.2', '1.11.2', '1.12.2', '1.13.2', '1.14.4', '1.15.2', '1.16.5', '1.17.1', '1.18.2', '1.19', '1.19.2', '1.19.3', '1.19.4', '1.20.1', '1.20.2', '1.20.4', '1.20.6', '1.21.1']
    // ^ Copied from official mineflayer repository
    testedVersions.forEach(function (version) {
        minecraftVersionDropdown.addItem(new QIcon(), version)
    })

    minecraftVersionDropdown.setFixedWidth(150)
    minecraftVersionLayout.addWidget(minecraftVersionDropdown)

    const minecraftVersionLabel = new QLabel()
    minecraftVersionLabel.setText("Minecraft Version")
    minecraftVersionLayout.addWidget(minecraftVersionLabel)

    minecraftVersionLayout.addStretch()

    const authenticationMethodLayout = new QBoxLayout(Direction.RightToLeft)
    serverSettingsLayout.addLayout(authenticationMethodLayout)

    const authenticationMethodCheckBox = new QCheckBox()
    authenticationMethodLayout.addWidget(authenticationMethodCheckBox)

    const authenticationMethodLabel = new QLabel()
    authenticationMethodLabel.setText("Online Mode")
    authenticationMethodLayout.addWidget(authenticationMethodLabel)

    authenticationMethodLayout.addStretch()

    serverSettingsLayout.addStretch()

    win.setCentralWidget(centralWidget);
    win.show();

    const module = await import(mindCraftLocation + "/settings.js")
    const settings = module.default
    ipAddress.setText(settings["host"])
    port.setText(settings["port"])
    minecraftVersionDropdown.setCurrentText(settings["minecraft_version"])
    authenticationMethodCheckBox.setChecked(settings["auth"] == "microsoft")

    function saveSettings() {
        settings["host"] = ipAddress.text()
        settings["port"] = Number(port.text())
        settings["minecraft_version"] = minecraftVersionDropdown.currentText()
        if (authenticationMethodCheckBox.isChecked()) settings["auth"] = "microsoft"
        else settings["auth"] = "offline"
        fs.writeFileSync(mindCraftLocation + '/settings.js', "export default\n" + JSON.stringify(settings));
    }

    ipAddress.addEventListener("textChanged", saveSettings)
    port.addEventListener("textChanged", saveSettings)
    minecraftVersionDropdown.addEventListener("currentIndexChanged", saveSettings)
    authenticationMethodCheckBox.addEventListener("clicked", saveSettings)

    fs.readdirSync(mindCraftLocation + "/profiles").forEach(file => {
        let listWidgetItem = new QListWidgetItem();
        listWidgetItem.setText(file.slice(0, -5));
        list.addItem(listWidgetItem);
        logs[file.slice(0, -5)] = ""
    });

    if (list.count() > 0) list.setCurrentItem(list.item(0));

    if (list.count() > 0) label.setText(list.item(0).text());

    function updateModelDropdown() {
        modelDropdown.clear()
        for (let value in modelList[providerDropdown.currentText()]) {
            modelTextBox.setVisible(modelList[providerDropdown.currentText()][value] == "useTextBox" || textInputCheckBox.isChecked() &&
                modelList[providerDropdown.currentText()][value] != "noInput")
            modelDropdown.setVisible(modelList[providerDropdown.currentText()][value] != "useTextBox" &&
                modelList[providerDropdown.currentText()][value] != "noInput" && !textInputCheckBox.isChecked())
            textInputCheckBox.setVisible(modelList[providerDropdown.currentText()][value] != "noInput" &&
                modelList[providerDropdown.currentText()][value] != "useTextBox")
            modelLabel.setVisible(modelList[providerDropdown.currentText()][value] != "noInput")
            customURLLabel.setVisible(providerDropdown.currentText() != "Custom")
            customURLTextBox.setVisible(providerDropdown.currentText() != "Custom")
            modelDropdown.addItem(new QIcon(), modelList[providerDropdown.currentText()][value]);
        }
    }

    function updateDropdown() {
        const data = fs.readFileSync(mindCraftLocation + '/profiles/' + list.currentItem().text() + '.json', 'utf8');
        let profileData = JSON.parse(data)
        let profileDataModel: string;
        if (typeof profileData["model"] === "string") {
            profileDataModel = profileData["model"];
        } else {
            profileDataModel = profileData["model"]["model"];
        }
        if (profileDataModel.includes('gemini'))
            providerDropdown.setCurrentText("Google")
        else if (profileDataModel.includes('gpt') || profileDataModel.includes('o1'))
            providerDropdown.setCurrentText("OpenAI")
        else if (profileDataModel.includes('claude'))
            providerDropdown.setCurrentText("Anthropic")
        else if (profileDataModel.includes('huggingface/'))
            providerDropdown.setCurrentText("Hugging Face")
        else if (profileDataModel.includes('meta/') || profileDataModel.includes('mistralai/') || profileDataModel.includes('replicate/'))
            providerDropdown.setCurrentText("Replicate")
        else if (profileDataModel.includes("groq/") || profileDataModel.includes("groqcloud/"))
            providerDropdown.setCurrentText("GroqCloud")
        else if (profileDataModel.toLowerCase() === "llama3")
            providerDropdown.setCurrentText("Ollama")
        else
            providerDropdown.setCurrentText("Custom")
        if (profileDataModel in modelList[providerDropdown.currentText()]) textInputCheckBox.setChecked(false)
        updateModelDropdown()
        if (profileDataModel in modelList[providerDropdown.currentText()]){
            modelDropdown.setCurrentText(modelList[providerDropdown.currentText()][profileDataModel]);
        } else {
            textInputCheckBox.setChecked(true)
            updateModelDropdown()
            modelTextBox.setText(profileDataModel)
        }
        let i = 0
        for (const key in profileData["modes"]){
            if (profileData["modes"][key])
                modes.item(i).setCheckState(CheckState.Checked)
            else
                modes.item(i).setCheckState(CheckState.Unchecked)
            i++
        }
    }

    function findKeyByValue(obj, targetValue) {
        for (const [key, value] of Object.entries(obj)) {
            if (value === targetValue) {
                return key;
            }
        }
        return null;
    }

    function updateCurrentProfile(){
        const data = fs.readFileSync(mindCraftLocation + '/profiles/' + list.currentItem().text() + '.json', 'utf8');
        let profileData = JSON.parse(data)
        profileData["model"] = {}
        let theModel;
        if (modelTextBox.isVisible()){
            profileData["model"] = {"model": modelTextBox.text()}
            theModel = modelTextBox.text()
        } else if (modelDropdown.isVisible()){
            profileData["model"] = {"model": findKeyByValue(modelList[providerDropdown.currentText()], modelDropdown.currentText())}
            theModel = findKeyByValue(modelList[providerDropdown.currentText()], modelDropdown.currentText())
        } else {
            profileData["model"] = {"model": "llama3"}
            theModel = "llama3"
        }
        if (theModel.includes('gemini'))
            profileData["model"]["api"] = "google"
        else if (theModel.includes('gpt') || theModel.includes('o1'))
            profileData["model"]["api"] = "openai"
        else if (theModel.includes('claude'))
            profileData["model"]["api"] = "anthropic"
        else if (theModel.includes('huggingface/'))
            profileData["model"]["api"] = "huggingface"
        else if (theModel.includes('meta/') || theModel.includes('mistralai/') || theModel.includes('replicate/'))
            profileData["model"]["api"] = "replicate"
        else if (theModel.includes("groq/") || theModel.includes("groqcloud/"))
            profileData["model"]["api"] = "groq"
        else if (theModel.toLowerCase() === "llama3")
            profileData["model"]["api"] = "ollama"
        else {
            profileData["model"] = theModel
        }
        let i = 0
        for (const key in profileData["modes"]){
            profileData["modes"][key] = modes.item(i).checkState() == CheckState.Checked;
            i++
        }
        fs.writeFileSync(mindCraftLocation + '/profiles/' + list.currentItem().text() + '.json', JSON.stringify(profileData));
    }

    providerDropdown.addEventListener("currentIndexChanged", updateModelDropdown)
    providerDropdown.addEventListener("currentIndexChanged", updateCurrentProfile)
    modelDropdown.addEventListener("currentIndexChanged", updateCurrentProfile)
    modelTextBox.addEventListener("textChanged", updateCurrentProfile)
    textInputCheckBox.addEventListener("clicked", updateModelDropdown)
    textInputCheckBox.addEventListener("clicked", updateCurrentProfile)
    modes.addEventListener("itemClicked", updateCurrentProfile)

    updateDropdown()

    list.addEventListener('itemClicked', (item) => {
        const data = fs.readFileSync(mindCraftLocation + '/profiles/' + item.text() + '.json', 'utf8');
        let profileData = JSON.parse(data)
        label.setText(profileData["name"]);
        console.setPlainText(logs[list.currentItem().text()]);
        updateDropdown()
    });

    label.addEventListener("textChanged", () => {
        const data = fs.readFileSync(mindCraftLocation + '/profiles/' + list.currentItem().text() + '.json', 'utf8');
        let profileData = JSON.parse(data)
        profileData["name"] = label.text()
        fs.writeFileSync(mindCraftLocation + '/profiles/' + list.currentItem().text() + '.json', JSON.stringify(profileData));
    })

    function executeCommand(command: string, name : string) {
        const process = exec(command);

        process.stdout.on('data', (data) => {
            logs[name] += data; // Collect output
            console.setPlainText(logs[list.currentItem().text()]);
        });

        process.stderr.on('data', (data) => {
            logs[name] += `Error: ${data}`;
            console.setPlainText(logs[list.currentItem().text()]);
        });

        process.on('close', (code) => {
            logs[name] += `Command exited with code: ${code}`;
            console.setPlainText(logs[list.currentItem().text()]);
        });
    }

    RunButton.addEventListener('clicked', () => {
        logs[list.currentItem().text()] = ""
        console.setVisible(true);
        executeCommand("cd " + mindCraftLocation+ " && node main.js --profiles ./profiles/" + list.currentItem().text() + ".json", list.currentItem().text());
    });

    keysAction.addEventListener('triggered', () => {
        keyWindow()
    });

    reinstallModulesAction.addEventListener('triggered', () => {
        fs.rmSync(mindCraftLocation + "/node_modules", { recursive: true, force: true });
        RunUpdate()
    })

    toggleConsoleButton.addEventListener('clicked', () => {
        console.setVisible(!console.isVisible());
    });
}

main();
