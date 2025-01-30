// Script to run in the JS console to have GPT just keep generating until it reaches the specified question count below. I wrote this because without it, you have to keep reprompting every 5-10 questions or so, because GPT reaches some upper word limit

// To use the script:
// (1) Edit the questionsToRequest array below with your desired question combo
// (2) Upload a doc to the custom med-school-question-bank GPT
// (3) Open the browser console and copy-paste this entire script
// (4) It should start generating questions, then reprompting GPT automatically. You can monitor the console for any status changes. When it's finished, you'll get an alert saying it's done
// (5) If you get a "GPT limit reached" message, you can refresh the page at the allowed time, and just copy-paste the script into the console to continue generating questions

const generationType = 'new'; // Use 'new' to generate new questions
// const generationType = 'recreate' // Use this to recreate existing questions (e.g. upload a doc of questions that you want recreated)

// Only used for 'new' generationType
const questionsToRequest = [
    "Explanatory 25",
    "Practice 25"
];

const doneMessage = "[DONE]";

let messageToSend = `I'll keep sending this message on a loop. Please keep generating questions until you generate all the questions I've requested. At that point, regardless of the message I send, just respond with "${doneMessage}". The questions I request are: ${questionsToRequest.join(", ")}. Please just respond to this prompt with questions in the format I've previously requested. Do not use the phrase "${doneMessage}" at any point, until you are finished with all your questions. If you are approaching the end of your response. Please do not put any concluding remarks (e.g. "Would you like me to continue?" or "Continuing to generate questions", etc. ). Just respond with multiple-choice questions. Thank you!`;

if (generationType === 'recreate') {
    messageToSend = `I'll keep sending this message on a loop. The original document I sent you contains a list of questions in a simple mcq format. Please reformat those questions as if they were 'explanatory questions', along with all the goodies that I've previously told you those question types should have. If the document is sectioned, please use the section titles for each question set (e.g. Histology Questions, Cardiomyopathy Questions, Clinical Questions, etc.); try to match the document. If the document includes an answer key or any section that is not just a set of questions, please ignore it. If any questions require images to understand them, please ignore the question. If any question is NOT multiple choice, please rewrite it as a multiple choice question. Please keep generating  until you finish all the questions in that document. At that point, regardless of the message I send, just respond with "${doneMessage}". Please just respond to this prompt with questions in the format I've previously requested. Do not use the phrase "${doneMessage}" at any point, until you are finished with all your questions. If you are approaching the end of your response. Please do not put any concluding remarks (e.g. "Would you like me to continue?" or "Continuing to generate questions", etc. ). Just respond with multiple-choice questions. Thank you!`
}


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

function deleteUserNodes() {
    console.log('Deleting user nodes')
    const nodes = document.querySelectorAll('[data-message-author-role="user"]')
        
    if (!nodes.length) {
        const err = "No user nodes found to delete"
        alert(err)
        throw new Error(err)
    }
    
    nodes.forEach(node => node.remove());
}

function deleteDoneNodes() {
    const assistantMessageNodes = document.querySelectorAll('[data-message-author-role="assistant"]')

    assistantMessageNodes.forEach(node => {

        const textContent = node.innerText.trim();

        if (textContent === doneMessage) {
            node.remove();
        }
    });
}

function copyQuestionsToClipboard() {
    const elements = document.querySelectorAll('div[data-message-author-role="assistant"]');

    if (elements.length === 0) {
        console.warn("No elements found with data-message-author-role='assistant'");
        return;
    }

    // Extract HTML content while preserving formatting
    const htmlContent = Array.from(elements)
        .map(el => el.outerHTML)
        .join("<br><br>"); // Separate messages with line breaks

    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.contentEditable = true;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px"; // Move off-screen
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    // Select and copy the content
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand("copy"); // Copy selected content
    document.body.removeChild(tempDiv); // Clean up

    console.log("Rich text copied to clipboard!");
}

// Main loop
function pollAndSendMessages() {

    if (gptLimitReached()) {
        console.log("GPT limit reached!");
        return
    }

    if (areQuestionsGenerated()) {
        const performCleanAndCopy = confirm("Questions generated! Copy? (Y/N)", "Y");

        if (performCleanAndCopy === 'Y') {
            deleteUserNodes();
            deleteDoneNodes();
    
            copyQuestionsToClipboard()
        }

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
