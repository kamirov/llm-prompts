// Script to run in the JS console to have GPT just keep generating until it reaches the specified question count below. I wrote this because without it, you have to keep reprompting every 5-10 questions or so, because GPT reaches some upper word limit

// To use the script:
// (1) Edit the questionsToRequest array below with your desired question combo
// (2) Upload a doc to the custom med-school-question-bank GPT
// (3) Open the browser console and copy-paste this entire script
// (4) It should start generating questions, then reprompting GPT automatically. You can monitor the console for any status changes. When it's finished, you'll get an alert saying it's done
// (5) If you get a "GPT limit reached" message, you can refresh the page at the allowed time, and just copy-paste the script into the console to continue generating questions

// -- Inputs --

const questionsToRequest = [
  "50 Multiple Choice Questions"
];

// -- Implementation --

if (questionsToRequest.length === 0) {
  alert(
    "Please specify the questions you want to generate in the questionsToRequest array."
  );
  throw new Error("No questions specified in the questionsToRequest array.");
}

const doneMessage = "[DONE]";

let messageToSend = `I'll keep sending this message on a loop. Please keep generating questions until you generate all the questions I've requested. At that point, regardless of the message I send, just respond with "${doneMessage}". The questions I request are: ${questionsToRequest.join(
  ", "
)}. Please just respond to this prompt with questions in the format I've previously requested. Do not use the phrase "${doneMessage}" at any point, until you are finished with all your questions. If you are approaching the end of your response. Please do not put any concluding remarks (e.g. "Would you like me to continue?" or "Continuing to generate questions", or "I'll continue generating the remaining ..." etc. ). Just respond with multiple-choice questions and when you reach the limit of each response, finish the text for the question you're on and wrap the message up wit h a horizontal line <hr />. Lastly, if you are still generating questions for a section you've already started, please do not repeat the difficulty header (i.e. no need to say " Questions" if you've already done that in a previous message. Thank you!`;

const pollingInterval = 1000;

function isAssistantDoneTyping() {
  const typingIndicator = document.querySelector('[data-testid="stop-button"]');
  return !typingIndicator;
}

function sendMessage() {
  const textBox = document.querySelector("#prompt-textarea");
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
  }, pollingInterval / 10);
}

function areQuestionsGenerated() {
  const assistantMessageNodes = document.querySelectorAll(
    '[data-message-author-role="assistant"]'
  );
  const assistantMessageTextAggregate = Array.from(assistantMessageNodes)
    .map((node) => node.innerText)
    .join(" ");

  return assistantMessageTextAggregate.includes(doneMessage);
}

function gptLimitReached() {
  const errorBox = document.querySelector(".text-token-text-error");
  return !!errorBox;
}

function deleteUserNodes() {
  console.log("Deleting user nodes");
  const nodes = document.querySelectorAll('[data-message-author-role="user"]');

  if (!nodes.length) {
    const err = "No user nodes found to delete";
    alert(err);
    throw new Error(err);
  }

  nodes.forEach((node) => node.remove());
}

function deleteDoneNodes() {
  console.log("Deleting Done nodes");
  const assistantMessageNodes = document.querySelectorAll(
    '[data-message-author-role="assistant"]'
  );

  assistantMessageNodes.forEach((node) => {
    const textContent = node.innerText.trim();

    if (textContent === doneMessage) {
      node.remove();
    }
  });

  const doneNodes = document.querySelectorAll("p");

  doneNodes.forEach((node) => {
    const textContent = node.innerText.trim();

    if (textContent === doneMessage) {
      node.remove();
    }
  });
}

function deleteExtras() {
  console.log("Deleting extras");
  const extraNodes = document.querySelectorAll(
    ".isolate, .group, nav, .sr-only, .draggable, .bg-token-sidebar-surface-primary, .bg-token-main-surface-primary"
  );

  extraNodes.forEach((node) => {
    node.remove();
  });
}

// Main loop
function pollAndSendMessages() {
  if (gptLimitReached()) {
    console.log("GPT limit reached!");
    return;
  }

  if (areQuestionsGenerated()) {
    deleteUserNodes();
    deleteDoneNodes();
    deleteExtras();

    return;
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
