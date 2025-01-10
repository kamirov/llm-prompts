const questionsToRequest = [
    "Explanatory 25",
    "Easy 25",
    "Hard 25"
];
const doneMessage = "[DONE]";

const messageToSend = `I'll keep sending this message on a loop. Please keep generating questions until you generate all the questions I've requested. At that point, regardless of the message I send, just respond with "${doneMessage}". The questions I request are: ${questionsToRequest.join(", ")}. Please just respond to this prompt with questions in the format I've previously requested. Thank you!`;

const pollingInterval = 1000;

function isAssistantDoneTyping() {
    const typingIndicator = document.querySelector('[data-testid="stop-button"]');
    return !typingIndicator;
}

function sendMessage() {
    const textBox = document.querySelector('#prompt-textarea');
    if (!textBox) {
        console.error("Error: Text box not found!");
    }

    if (textBox) {
        textBox.innerHTML = `<p>${messageToSend}</p>`;
    }

    // Send button takes some time to appear, so we wait a lil moment for it
    setTimeout(() => {
        const sendButton = document.querySelector('[data-testid="send-button"]');

        if (!sendButton) {
            console.error("Error: Send button not found!");
        }
    
        if (sendButton) {
            sendButton.click(); // Click the send button
        }
    }, pollingInterval/10)
}

function areQuestionsGenerated() {
    const assistantMessageNodes = document.querySelectorAll('[data-message-author-role="assistant"]')
    const assistantMessageTextAggregate = Array.from(assistantMessageNodes).map(node => node.innerText).join(" ");

    return assistantMessageTextAggregate.includes(doneMessage);
}

function gptLimitReached() {
    const errorBox = document.querySelector('.text-token-text-error');
    return !!errorBox
}

// Main loop
function pollAndSendMessages() {

    if (gptLimitReached()) {
        console.log("GPT limit reached!");
        return
    }

    if (areQuestionsGenerated()) {
        alert("Questions generated!");
        return
    } else {
        console.log("Questions not finished generating...");
    }

    if (isAssistantDoneTyping()) {
        sendMessage();
    } else {
        console.log("Assistant is still typing...");
    }

    setTimeout(pollAndSendMessages, pollingInterval); // Poll again after the interval

}

// Start the process
pollAndSendMessages();
