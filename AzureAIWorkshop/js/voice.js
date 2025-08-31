// Voice functionality with Azure Speech Services
// This file handles voice recording and speech-to-text conversion

function initializeVoice(chatMessages, chatInput, sendBtn, chatInputContainer) {
    // Hide default chat input for voice interface
    chatInput.style.display = 'none';
    sendBtn.style.display = 'none';

    // Create record button
    const recordBtn = document.createElement('button');
    recordBtn.classList.add('record-btn', 'center');
    recordBtn.textContent = 'Record';
    chatInputContainer.appendChild(recordBtn);

    let mediaRecorder;
    let audioChunks = [];

    recordBtn.addEventListener('click', () => {
        if (recordBtn.textContent === 'Record') {
            startRecording(recordBtn, mediaRecorder, audioChunks, chatMessages);
        } else {
            stopRecording(recordBtn, mediaRecorder);
        }
    });
}

function startRecording(recordBtn, mediaRecorder, audioChunks, chatMessages) {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            recordBtn.textContent = 'Stop';
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                processRecording(audioChunks, chatMessages);
                audioChunks = [];
            };
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            addMessage(chatMessages, 'Error accessing microphone. Please check permissions.', false);
        });
}

function stopRecording(recordBtn, mediaRecorder) {
    mediaRecorder.stop();
    recordBtn.textContent = 'Record';
}

function processRecording(audioChunks, chatMessages) {
    // Validate configuration before making API call
    const configValidation = validateService('speech');
    if (!configValidation.isValid) {
        addMessage(chatMessages, `Configuration Error: ${configValidation.issues.join(', ')}`, false);
        return;
    }

    // Show thinking animation
    const thinkingDiv = showThinking(chatMessages);
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('definition', JSON.stringify({
        locales: ["en-US", "ja-JP"]
    }));

    // Call Azure Speech Services
    fetch('<YOUR_ENDPOINT>', {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideThinking(chatMessages, thinkingDiv);
        
        if (data.combinedPhrases && data.combinedPhrases.length > 0) {
            const transcribedText = data.combinedPhrases[0].text;
            addMessage(chatMessages, transcribedText, true);
        } else {
            addMessage(chatMessages, 'Could not transcribe audio. Please try again.', false);
        }
    })
    .catch(error => {
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Sorry, there was an error processing your request. ${error}`, false);
    });
}
