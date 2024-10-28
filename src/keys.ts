import {
    Direction,
    QBoxLayout,
    QLabel,
    QMainWindow,
    QPlainTextEdit,
    QTableWidget,
    QTableWidgetItem, QLineEdit,
    QWidget, QPushButton
} from "@nodegui/nodegui";

import fs from "node:fs";

export function keyWindow(): void{
    const win = new QMainWindow();
    win.setWindowTitle("Mindcraft Updater");

    const centralWidget = new QWidget();

    const rootLayout = new QBoxLayout(Direction.TopToBottom);
    centralWidget.setObjectName("myroot");

    centralWidget.setLayout(rootLayout);
    win.setCentralWidget(centralWidget);

    const openaiKeyLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(openaiKeyLayout);

    const appDataLocation = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const mindCraftLocation = appDataLocation + "/mindcraft";

    const data = fs.readFileSync(mindCraftLocation + '/keys.json', 'utf8');
    let keys = JSON.parse(data);

    const openaiKeyLabel = new QLabel()
    openaiKeyLabel.setText("OpenAI API Key");
    openaiKeyLayout.addWidget(openaiKeyLabel)

    const openaiKeyTextBox = new QLineEdit()
    openaiKeyTextBox.setText(keys["OPENAI_API_KEY"]);
    openaiKeyLayout.addWidget(openaiKeyTextBox)



    const openaiOrgLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(openaiOrgLayout);

    const openaiOrgLabel = new QLabel()
    openaiOrgLabel.setText("OpenAI Organization Key");
    openaiOrgLayout.addWidget(openaiOrgLabel)

    const openaiOrgTextBox = new QLineEdit()
    openaiOrgTextBox.setText(keys["OPENAI_ORG_ID"]);
    openaiOrgLayout.addWidget(openaiOrgTextBox)



    const googleKeyLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(googleKeyLayout);

    const googleKeyLabel = new QLabel()
    googleKeyLabel.setText("Google API Key");
    googleKeyLayout.addWidget(googleKeyLabel)

    const googleKeyTextBox = new QLineEdit()
    googleKeyTextBox.setText(keys["GEMINI_API_KEY"]);
    googleKeyLayout.addWidget(googleKeyTextBox)



    const anthropicKeyLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(anthropicKeyLayout);

    const anthropicKeyLabel = new QLabel()
    anthropicKeyLabel.setText("Anthropic API Key");
    anthropicKeyLayout.addWidget(anthropicKeyLabel)

    const anthropicTextBox = new QLineEdit()
    anthropicTextBox.setText(keys["ANTHROPIC_API_KEY"]);
    anthropicKeyLayout.addWidget(anthropicTextBox)



    const replicateKeyLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(replicateKeyLayout);

    const replicateKeyLabel = new QLabel()
    replicateKeyLabel.setText("Replicate API Key");
    replicateKeyLayout.addWidget(replicateKeyLabel)

    const replicateTextBox = new QLineEdit()
    replicateTextBox.setText(keys["REPLICATE_API_KEY"]);
    replicateKeyLayout.addWidget(replicateTextBox)



    const groqcloudKeyLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(groqcloudKeyLayout);

    const groqcloudKeyLabel = new QLabel()
    groqcloudKeyLabel.setText("GroqCloud API Key");
    groqcloudKeyLayout.addWidget(groqcloudKeyLabel)

    const groqcloudKeyTextBox = new QLineEdit()
    groqcloudKeyTextBox.setText(keys["GROQCLOUD_API_KEY"]);
    groqcloudKeyLayout.addWidget(groqcloudKeyTextBox)



    const huggingfaceKeyLayout = new QBoxLayout(Direction.LeftToRight);
    rootLayout.addLayout(huggingfaceKeyLayout);

    const huggingfaceKeyLabel = new QLabel()
    huggingfaceKeyLabel.setText("Hugging Face API Key");
    huggingfaceKeyLayout.addWidget(huggingfaceKeyLabel)

    const huggingfaceTextBox = new QLineEdit()
    huggingfaceTextBox.setText(keys["HUGGINGFACE_API_KEY"]);
    huggingfaceKeyLayout.addWidget(huggingfaceTextBox)

    const applyButton = new QPushButton();
    rootLayout.addWidget(applyButton);
    applyButton.setText("Apply");

    applyButton.addEventListener('clicked', () => {
        let newKey = {
            "OPENAI_API_KEY": openaiKeyTextBox.text(),
            "OPENAI_ORG_ID": openaiOrgTextBox.text(),
            "GEMINI_API_KEY": googleKeyTextBox.text(),
            "ANTHROPIC_API_KEY": anthropicTextBox.text(),
            "REPLICATE_API_KEY": replicateTextBox.text(),
            "GROQCLOUD_API_KEY": groqcloudKeyTextBox.text(),
            "HUGGINGFACE_API_KEY":huggingfaceTextBox.text()
        }
        fs.writeFileSync(mindCraftLocation + '/keys.json', JSON.stringify(newKey));
        win.close()
    });

    win.show();
}