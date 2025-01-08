const levels = [
    { challenge: "Guess the 3-letter word starting with C", answer: "cat" },
    { challenge: "A color that starts with B", answer: "blue" },
    { challenge: "What has keys but can't open locks?", answer: "piano" },
    { challenge: "I speak without a mouth and hear without ears. What am I?", answer: "echo" },
    { challenge: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "m" }
];

let currentLevel = 0;

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('submit-btn').addEventListener('click', checkAnswer);

async function startGame() {
    currentLevel = 0;
    document.getElementById('level').textContent = `Level: ${currentLevel + 1}`;
    document.getElementById('challenge').textContent = levels[currentLevel].challenge;
    document.getElementById('feedback').textContent = '';
}

async function checkAnswer() {
    const userInput = document.getElementById('user-input').value.toLowerCase();
    const feedback = document.getElementById('feedback');
    const isCorrect = await verifyAnswerWithAzureOpenAI(userInput, levels[currentLevel].answer);

    if (isCorrect) {
        currentLevel++;
        if (currentLevel < levels.length) {
            document.getElementById('level').textContent = `Level: ${currentLevel + 1}`;
            document.getElementById('challenge').textContent = levels[currentLevel].challenge;
            feedback.textContent = 'Correct! Moving to the next level.';
            feedback.style.color = 'green';
        } else {
            document.getElementById('challenge').textContent = 'Congratulations! You completed all levels!';
            feedback.textContent = '';
        }
    } else {
        feedback.textContent = 'Incorrect, try again!';
        feedback.style.color = 'red';
    }
    document.getElementById('user-input').value = '';
}

async function verifyAnswerWithAzureOpenAI(userInput, correctAnswer) {
    const tenantId = "YOUR_TENANT_ID";
    const clientId = "YOUR_CLIENT_ID";
    const clientSecret = "YOUR_CLIENT_SECRET";
    const resource = "https://management.azure.com/.default";

    // Obtain an access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'client_id': clientId,
            'scope': resource,
            'client_secret': clientSecret,
            'grant_type': 'client_credentials'
        })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Use the access token in the API request
    const payload = {
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "You are an AI assistant that helps people find information."
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": `Is the answer "${userInput}" correct for the challenge "${correctAnswer}"?`
                    }
                ]
            }
        ],
        "temperature": 0.7,
        "top_p": 0.95,
        "max_tokens": 800
    };

    const response = await fetch("https://eastus-openai-itzhak.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content[0].text;

    return assistantResponse.toLowerCase().includes("yes");
}
