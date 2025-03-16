// Global array to store the conversation history
let ChatConversationHistory = [
    {
        role: "system",
        content: [
            {
                type: "text",
                text: "You are an AI assistant that helps people find information."
            }
        ]
    }
];

// Global array to store the RAG conversation history
let RagConversationHistory = [
    {
        role: "system",
        content: "You are an AI assistant designed to help ISSTA customers by providing clear, accurate, and helpful information about their cancellation policy"
    }
];

document.querySelectorAll('.sidebar ul li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar ul li').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const contentArea = document.getElementById('content-area');
        const responseArea = document.getElementById('response-area');
        
        if (responseArea) {
            responseArea.style.display = 'none'; // Hide the pre element
        }
        
        contentArea.textContent = `You selected: ${item.textContent}`;

        // Create a new chat container for each item
        const chatContainer = document.createElement('div');

        const chatMessages = document.createElement('div');
        chatMessages.classList.add('chat-messages');
        chatContainer.appendChild(chatMessages);

        const chatInputContainer = document.createElement('div');
        chatInputContainer.classList.add('chat-input-container');

        const chatInput = document.createElement('input');
        chatInput.classList.add('chat-input');
        chatInput.type = 'text';
        chatInput.placeholder = 'Type your message...';
        chatInputContainer.appendChild(chatInput);

        const sendBtn = document.createElement('button');
        sendBtn.classList.add('send-btn');
        sendBtn.textContent = 'Send';
        chatInputContainer.appendChild(sendBtn);

        chatContainer.appendChild(chatInputContainer);
        contentArea.appendChild(chatContainer);

        // 4. Voice
        if(item.textContent === 'Voice'){
            const recordBtn = document.createElement('button');
            recordBtn.classList.add('record-btn', 'center');
            recordBtn.textContent = 'Record';
            chatInputContainer.appendChild(recordBtn);
        
            // Hide the chat input and show the record button
            chatInput.style.display = 'none';
            sendBtn.style.display = 'none';
        
            let mediaRecorder;
            let audioChunks = [];
        
            recordBtn.addEventListener('click', () => {
                if (recordBtn.textContent === 'Record') {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(stream => {
                            mediaRecorder = new MediaRecorder(stream);
                            mediaRecorder.start();
                            recordBtn.textContent = 'Stop';
                            mediaRecorder.ondataavailable = event => {
                                audioChunks.push(event.data);
                            };
                            mediaRecorder.onstop = () => {
                                // Add thinkingDiv to chatMessages
                                const thinkingDiv = document.createElement('div');
                                thinkingDiv.classList.add('message', 'bot-message', 'thinking');
                                const spinner = document.createElement('div');
                                spinner.classList.add('spinner');
                                thinkingDiv.appendChild(spinner);
                                chatMessages.appendChild(thinkingDiv);
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                                
                                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                                audioChunks = [];
                                const formData = new FormData();
                                formData.append('audio', audioBlob);
                                formData.append('definition', JSON.stringify({
                                    locales: ["en-US", "ja-JP"]
                                }));
        
                                fetch(`<YOUR_ENDPOINT>`, {
                                    method: 'POST',
                                    headers: {
                                        'Ocp-Apim-Subscription-Key': "<YOUR_SUBSCRIPTION_KEY>"
                                    },
                                    body: formData
                                })
                                .then(response => response.json())
                                .then(data => {
                                    chatMessages.removeChild(thinkingDiv);
                                    const userMessageDiv = document.createElement('div');
                                    userMessageDiv.classList.add('message', 'user-message');
                                    userMessageDiv.textContent = `User: ${data.combinedPhrases[0].text}`;
                                    chatMessages.appendChild(userMessageDiv);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                })
                                .catch(error => {
                                    chatMessages.removeChild(thinkingDiv);
                                    const botMessageDiv = document.createElement('div');
                                    botMessageDiv.classList.add('message', 'bot-message');
                                    botMessageDiv.textContent = `Bot: Sorry, there was an error processing your request. ${error}`;
                                    chatMessages.appendChild(botMessageDiv);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                });
                            };
                        });
                } else {
                    mediaRecorder.stop();
                    recordBtn.textContent = 'Record';
                }
            });
        }

        // 5. OCR - Azure Document Intelligence
        if(item.textContent === 'OCR'){

            // remove the chat input and send button
            chatInput.style.display = 'none';
            sendBtn.style.display = 'none';

            // Create a new input element to upload the file
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            chatInputContainer.appendChild(fileInput);

            const uploadBtn = document.createElement('button');
            uploadBtn.classList.add('upload-btn', 'center');
            uploadBtn.textContent = 'Upload File';

            chatInputContainer.appendChild(uploadBtn);

            uploadBtn.addEventListener('click', () => {
                fileInput.click();

                // show privew of the file in screen
                fileInput.addEventListener('change', () => {
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {

                        // delete the previous file if exists
                        const previousFile = document.getElementById('file-ocr');
                        if (previousFile) {
                            chatMessages.removeChild(previousFile);
                            // delete confirm button
                            const confirmBtn = document.querySelector('.confirm-btn');
                            chatInputContainer.removeChild(confirmBtn); 
                        }


                        const img = document.createElement('img');
                        img.id = 'file-ocr';
                        img.src = reader.result;
                        img.style.width = '50%'; // Maintain aspect ratio
                        img.style.height = '50%';
                        chatMessages.appendChild(img);
                        chatMessages.scrollTop = chatMessages.scrollHeight;

                        // Ask user if he want to send the file to azure for OCR
                        const confirmBtn = document.createElement('button');
                        confirmBtn.classList.add('confirm-btn', 'center');
                        confirmBtn.textContent = 'Start Analysis';
                        chatInputContainer.appendChild(confirmBtn);

                        confirmBtn.addEventListener('click', () => {
                            
                            // Hide the file preview and add the spinner 
                            img.style.display = 'none';
                            confirmBtn.style.display = 'none';

                            const thinkingDiv = document.createElement('div');
                            thinkingDiv.classList.add('message', 'bot-message', 'thinking');
                            const spinner = document.createElement('div');
                            spinner.classList.add('spinner');
                            thinkingDiv.appendChild(spinner);
                            chatMessages.appendChild(thinkingDiv);
                            chatMessages.scrollTop = chatMessages.scrollHeight;

                            let bodyContent = JSON.stringify({
                                "base64Source": reader.result.split(',')[1]
                            });

                            fetch('<YOUR_ENDPOINT>', {
                                method: 'POST',
                                headers: {
                                    'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>',
                                    'Content-Type': 'application/json'
                                },
                                body: bodyContent
                            })
                            .then(response =>{
                                // get the operation-location from the response
                                const operationLocation = response.headers.get('operation-location');

                                // get the result from the operation-location
                                fetch(operationLocation, {
                                    method: 'GET',
                                    headers: {
                                        'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>',
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(response => response.json())
                                .then(response => {
                                    if (response.status === 'running') {
                                        setTimeout(() => {
                                            fetch(operationLocation, {
                                                method: 'GET',
                                                headers: {
                                                    'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>',

                                                }
                                            })
                                            .then(response => response.json())
                                            .then(operationData => {
                                                if (operationData.status === 'succeeded') {
                                                    chatMessages.removeChild(thinkingDiv);

                                                    const canvas = document.createElement('canvas');
                                                    canvas.style.width = '50%';
                                                    const ctx = canvas.getContext('2d');
                                                    const imgElement = new Image();
                                                    imgElement.src = img.src;

                                                    const tooltip = document.createElement('div');
                                                    tooltip.style.position = 'absolute';
                                                    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                                    tooltip.style.color = 'white';
                                                    tooltip.style.padding = '5px';
                                                    tooltip.style.borderRadius = '5px';
                                                    tooltip.style.display = 'none';
                                                    document.body.appendChild(tooltip);
                                                    
                                                    imgElement.onload = () => {
                                                        canvas.width = imgElement.width;
                                                        canvas.height = imgElement.height;
                                                        ctx.drawImage(imgElement, 0, 0);
                                                        
                                                        const polygons = [];

                                                        operationData.analyzeResult.paragraphs.forEach(paragraph => {
                                                            const [x1, y1, x2, y2, x3, y3, x4, y4] = paragraph.boundingRegions[0].polygon;

                                                            polygons.push({
                                                                polygon: [x1, y1, x2, y2, x3, y3, x4, y4],
                                                                text: paragraph.content
                                                            });
                                                            ctx.beginPath();
                                                            ctx.moveTo(x1, y1);
                                                            ctx.lineTo(x2, y2);
                                                            ctx.lineTo(x3, y3);
                                                            ctx.lineTo(x4, y4);
                                                            ctx.closePath();
                                                            ctx.lineWidth = 2;
                                                            ctx.strokeStyle = 'red';
                                                            ctx.stroke();
                                                        });
                                                        canvas.addEventListener('mousemove', (e) => {
                                                            const rect = canvas.getBoundingClientRect();
                                                            const x = e.clientX - rect.left;
                                                            const y = e.clientY - rect.top;
                                                
                                                            let found = false;
                                                            polygons.forEach(polygon => {
                                                                const [x1, y1, x2, y2, x3, y3, x4, y4] = polygon.polygon;
                                                                ctx.beginPath();
                                                                ctx.moveTo(x1, y1);
                                                                ctx.lineTo(x2, y2);
                                                                ctx.lineTo(x3, y3);
                                                                ctx.lineTo(x4, y4);
                                                                ctx.closePath();
                                                                if (ctx.isPointInPath(x, y)) {
                                                                    tooltip.style.left = `${e.clientX + 10}px`;
                                                                    tooltip.style.top = `${e.clientY + 10}px`;
                                                                    tooltip.textContent = polygon.text;
                                                                    tooltip.style.display = 'block';
                                                                    found = true;
                                                                }
                                                            });
                                                
                                                            if (!found) {
                                                                tooltip.style.display = 'none';
                                                            }
                                                        });
                                                    
                                                        chatMessages.appendChild(canvas);
                                                        chatMessages.scrollTop = chatMessages.scrollHeight;
                                                    };
                                                }
                                            })
                                            .catch(error => {
                                                chatMessages.removeChild(thinkingDiv);
                                                const botMessageDiv = document.createElement('div');
                                                botMessageDiv.classList.add('message', 'bot-message');
                                                botMessageDiv.textContent = `Bot: Sorry, there was an error processing your request. ${error}`;
                                                chatMessages.appendChild(botMessageDiv);
                                                chatMessages.scrollTop = chatMessages.scrollHeight;
                                            });
                                        }, 5000);
                                    } else if (operationStatus.status === 'succeeded') {
                                        chatMessages.removeChild(thinkingDiv);
                                        const botMessageDiv = document.createElement('div');
                                        botMessageDiv.classList.add('message', 'bot-message');
                                        botMessageDiv.textContent = `Bot: Analysis result: ${JSON.stringify(operationStatus)}`;
                                        chatMessages.appendChild(botMessageDiv);
                                        chatMessages.scrollTop = chatMessages.scrollHeight;
                                    }
                                })
                                .catch(error => {
                                    chatMessages.removeChild(thinkingDiv);
                                    const botMessageDiv = document.createElement('div');
                                    botMessageDiv.classList.add('message', 'bot-message');
                                    botMessageDiv.textContent = `Bot: Sorry, there was an error processing your request. ${error}`;
                                    chatMessages.appendChild(botMessageDiv);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                });
                                
                                
                            })
                        });
                    };
                });
            });
        }

        sendBtn.addEventListener('click', () => {
            const messageText = chatInput.value.trim();

            const currentSidebarItem = document.querySelector('.sidebar ul li.active');

            // 1. CHAT SECTION
            if (currentSidebarItem.textContent === 'Chat') {
                if (messageText) {
                    // Update the conversation history with the user's message
                    ChatConversationHistory.push({
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: messageText
                            }
                        ]
                    });

                    // Create a new div element to display the user's message
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message', 'user-message');
                    messageDiv.textContent = `User: ${messageText}`;
                    chatMessages.appendChild(messageDiv);
                    chatInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;


                    // Show thinking animation
                    const thinkingDiv = document.createElement('div');
                    thinkingDiv.classList.add('message', 'bot-message', 'thinking');
                    const spinner = document.createElement('div');
                    spinner.classList.add('spinner');
                    thinkingDiv.appendChild(spinner);
                    chatMessages.appendChild(thinkingDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // Make request to Azure OpenAI
                    const payload = JSON.stringify({
                        messages: ChatConversationHistory,
                        temperature: 0.7,
                        top_p: 0.95,
                        max_tokens: 800,
                        stream: true
                    });

                    fetch("<YOUR_ENDPOINT>", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "api-key": "<YOUR_API_KEY>"
                        },
                        body: payload
                    })
                    .then(response => {
                        
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        let botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        chatMessages.appendChild(botMessageDiv);
        
                        function readStream() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    chatMessages.removeChild(thinkingDiv);
                                    return;
                                }
                                const chunk = decoder.decode(value, { stream: true });
                                const lines = chunk.split('\n');
                                for (const line of lines) {
                                    if (line.trim()) {
                                        try {
                                            const jsonString = line.replace(/^data: /, '');
                                            const data = JSON.parse(jsonString);
                                            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                                                botMessageDiv.textContent += data.choices[0].delta.content;
                                                chatMessages.scrollTop = chatMessages.scrollHeight;
                                            }
                                        } catch (error) {
                                            console.error('Error parsing JSON:', error);
                                        }
                                    }
                                }
                                readStream();
                            });
                        }
        
                        readStream();
                    })
                    .catch(error => {
                        chatMessages.removeChild(thinkingDiv);
                        const botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        botMessageDiv.textContent = `Bot: Sorry, there was an error processing your request. ${error}`;
                        chatMessages.appendChild(botMessageDiv);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    });
                }
            }
            
            // 2. RAG SECTION
            else if (currentSidebarItem.textContent === 'RAG') {
                if (messageText) {
                    
                    // Update the RAG conversation history with the user's message
                    RagConversationHistory.push({
                        role: "user",
                        content: messageText
                    });

                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message', 'user-message');
                    messageDiv.textContent = `User: ${messageText}`;
                    chatMessages.appendChild(messageDiv);
                    chatInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // Show thinking animation
                    const thinkingDiv = document.createElement('div');
                    thinkingDiv.classList.add('message', 'bot-message', 'thinking');
                    const spinner = document.createElement('div');
                    spinner.classList.add('spinner');
                    thinkingDiv.appendChild(spinner);
                    chatMessages.appendChild(thinkingDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;


                    // Make request to Azure OpenAI with RAG
                    const payload = JSON.stringify({
                        data_sources: [
                            {
                                type: "azure_search",
                                parameters: {
                                    endpoint: "<YOUR_ENDPOINT>",
                                    index_name: "issta-canaclation",
                                    semantic_configuration: "default",
                                    query_type: "simple",
                                    fields_mapping: {},
                                    in_scope: true,
                                    role_information: "You are an AI assistant designed to help ISSTA customers by providing clear, accurate, and helpful information about their cancellation policy",
                                    filter: null,
                                    strictness: 3,
                                    top_n_documents: 5,
                                    authentication: {
                                        type: "api_key",
                                        key: "<YOUR_API_KEY>"
                                    }
                                }
                            }
                        ],
                        messages: RagConversationHistory,
                        temperature: 0.7,
                        top_p: 0.95,
                        max_tokens: 800,
                        stop: null,
                        stream: true
                    });


                    fetch("<YOUR_ENDPOINT>", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "api-key": "<YOUR_API_KEY>"
                        },
                        body: payload
                    })
                    .then(response => {
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        let botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        chatMessages.appendChild(botMessageDiv);
        
                        function readStream() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    chatMessages.removeChild(thinkingDiv);
                                    return;
                                }
                                const chunk = decoder.decode(value, { stream: true });
                                const lines = chunk.split('\n');
                                for (const line of lines) {
                                    if (line.trim()) {
                                        try {
                                            const jsonString = line.replace(/^data: /, '');
                                            const data = JSON.parse(jsonString);
                                            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                                                botMessageDiv.textContent += data.choices[0].delta.content;
                                                chatMessages.scrollTop = chatMessages.scrollHeight;
                                            }
                                        } catch (error) {
                                            console.error('Error parsing JSON:', error);
                                        }
                                    }
                                }
                                readStream();
                            });
                        }
        
                        readStream();
                    }
                    )
                    .catch(error => {
                        chatMessages.removeChild(thinkingDiv);
                        const botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        botMessageDiv.textContent = `Bot: Sorry, there was an error processing your request.` + error;
                        chatMessages.appendChild(botMessageDiv);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    });
                }
            }

            // 3. DALLE SECTION
            else if (currentSidebarItem.textContent === 'Dalle') {
                if (messageText) {

                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('message', 'user-message');
                    messageDiv.textContent = `User: ${messageText}`;
                    chatMessages.appendChild(messageDiv);
                    chatInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // Show the spinner
                    const thinkingDiv = document.createElement('div');
                    thinkingDiv.classList.add('message', 'bot-message', 'thinking');
                    const spinner = document.createElement('div');
                    spinner.classList.add('spinner');
                    thinkingDiv.appendChild(spinner);
                    chatMessages.appendChild(thinkingDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    
                    const payload = JSON.stringify({
                        prompt: messageText,
                        size: "1024x1024",
                        n: 1
                    });

                    fetch("<YOUR_ENDPOINT>", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "api-key": "<YOUR_API_KEY>"
                        },
                        body: payload
                    })
                    .then(response => response.json())
                    .then(data => {

                        // hide the spinner
                        chatMessages.removeChild(thinkingDiv);

                        // add image tag to the chat data.data[0].url
                        const botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        const img = document.createElement('img');
                        img.src = data.data[0].url;
                        img.style.width = '100%'; // Maintain aspect ratio
                        img.style.height = '30%';
                        botMessageDiv.appendChild(img);
                        chatMessages.appendChild(botMessageDiv);
                        chatMessages.scrollTop = chatMessages.scrollHeight;

                    })
                    .catch(error => {
                        const botMessageDiv = document.createElement('div');
                        botMessageDiv.classList.add('message', 'bot-message');
                        botMessageDiv.textContent = `Bot: Sorry, there was an error processing your request.` + error;
                        chatMessages.appendChild(botMessageDiv);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    });
                }
            }

            // Ensure the chat input container remains visible when new messages are added
            chatInputContainer.scrollIntoView({ behavior: 'smooth' });
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    });
});