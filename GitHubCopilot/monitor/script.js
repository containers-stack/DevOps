
const url = 'https://api.github.com/orgs/containers-stack/copilot/metrics';

const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': 'Bearer <ENTER_YOUR_PAT_TOKEN>',
    'X-GitHub-Api-Version': '2022-11-28',
};

fetch(url, { headers })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Prepare data for charts
        const dates = data.map(entry => entry.date);
        const totalChats = data.map(entry => entry.copilot_ide_chat.editors[0].models[0].total_chats);
        const totalChatCopyEvents = data.map(entry => entry.copilot_ide_chat.editors[0].models[0].total_chat_copy_events);
        const totalChatInsertionEvents = data.map(entry => entry.copilot_ide_chat.editors[0].models[0].total_chat_insertion_events);
        const totalEngagedUsers = data.map(entry => entry.total_engaged_users);
        const totalCodeAcceptances = data.map(entry =>
            entry.copilot_ide_code_completions.editors[0].models[0].languages.reduce((sum, lang) => sum + lang.total_code_acceptances, 0)
        );
        const totalCodeSuggestions = data.map(entry =>
            entry.copilot_ide_code_completions.editors[0].models[0].languages.reduce((sum, lang) => sum + lang.total_code_suggestions, 0)
        );
        const totalCodeLinesAccepted = data.map(entry =>
            entry.copilot_ide_code_completions.editors[0].models[0].languages.reduce((sum, lang) => sum + lang.total_code_lines_accepted, 0)
        );
        const totalCodeLinesSuggested = data.map(entry =>
            entry.copilot_ide_code_completions.editors[0].models[0].languages.reduce((sum, lang) => sum + lang.total_code_lines_suggested, 0)
        );
        const totalActiveUsers = data.map(entry => entry.total_active_users);

        // Create chat chart
        const chatCtx = document.getElementById('chatChart').getContext('2d');
        const chatChart = new Chart(chatCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Chats',
                    data: totalChats,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Chats' } }
                }
            }
        });

        // Create code acceptance chart
        const codeAcceptanceCtx = document.getElementById('codeAcceptanceChart').getContext('2d');
        const codeAcceptanceChart = new Chart(codeAcceptanceCtx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Code Acceptances',
                    data: totalCodeAcceptances,
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Acceptances' } }
                }
            }
        });

        // Create chat copy events chart
        const chatCopyEventsCtx = document.getElementById('chatCopyEventsChart').getContext('2d');
        const chatCopyEventsChart = new Chart(chatCopyEventsCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Chat Copy Events',
                    data: totalChatCopyEvents,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Copy Events' } }
                }
            }
        });

        // Create chat insertion events chart
        const chatInsertionEventsCtx = document.getElementById('chatInsertionEventsChart').getContext('2d');
        const chatInsertionEventsChart = new Chart(chatInsertionEventsCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Chat Insertion Events',
                    data: totalChatInsertionEvents,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Insertion Events' } }
                }
            }
        });

        // Create engaged users chart
        const engagedUsersCtx = document.getElementById('engagedUsersChart').getContext('2d');
        const engagedUsersChart = new Chart(engagedUsersCtx, {
            type: 'pie',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Engaged Users',
                    data: totalEngagedUsers,
                    backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                }]
            },
            options: {
                responsive: true,
            }
        });

        // Create total active users chart
        const totalActiveUsersCtx = document.getElementById('totalActiveUsersChart').getContext('2d');
        const totalActiveUsersChart = new Chart(totalActiveUsersCtx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Active Users',
                    data: totalActiveUsers,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Active Users' } }
                }
            }
        });

        // Create total code suggestions chart
        const codeSuggestionsCtx = document.getElementById('totalCodeSuggestionsChart').getContext('2d');
        const totalCodeSuggestionsChart = new Chart(codeSuggestionsCtx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Code Suggestions',
                    data: totalCodeSuggestions,
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Suggestions' } }
                }
            }
        });

        // Create code lines accepted chart
        const codeLinesAcceptedCtx = document.getElementById('codeLinesAcceptedChart').getContext('2d');
        const codeLinesAcceptedChart = new Chart(codeLinesAcceptedCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Code Lines Accepted',
                    data: totalCodeLinesAccepted,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Lines Accepted' } }
                }
            }
        });

        // Create code lines suggested chart
        const codeLinesSuggestedCtx = document.getElementById('codeLinesSuggestedChart').getContext('2d');
        const codeLinesSuggestedChart = new Chart(codeLinesSuggestedCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Code Lines Suggested',
                    data: totalCodeLinesSuggested,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Number of Lines Suggested' } }
                }
            }
        });

        // languages usage chart
        const languagesUsageCtx = document.getElementById('languageUsageChart').getContext('2d');
        const languagesUsageChart = new Chart(languagesUsageCtx, {
            type: 'bar',
            data: {
                labels: data[0].copilot_ide_code_completions.editors[0].models[0].languages.map(lang => lang.language),
                datasets: [{
                    label: 'Total Code Acceptances',
                    data: data[0].copilot_ide_code_completions.editors[0].models[0].languages.map(lang => lang.total_code_acceptances),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                }, {
                    label: 'Total Code Suggestions',
                    data: data[0].copilot_ide_code_completions.editors[0].models[0].languages.map(lang => lang.total_code_suggestions),
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                }, {
                    label: 'Total Code Lines Accepted',
                    data: data[0].copilot_ide_code_completions.editors[0].models[0].languages.map(lang => lang.total_code_lines_accepted),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                }, {
                    label: 'Total Code Lines Suggested',
                    data: data[0].copilot_ide_code_completions.editors[0].models[0].languages.map(lang => lang.total_code_lines_suggested),
                    backgroundColor: 'rgba(255, 206, 86, 0.5)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Language' } },
                    y: { title: { display: true, text: 'Count' } }
                }
            }
        });

        // Update charts
        const updateCharts = () => {
            chatChart.update();
            codeAcceptanceChart.update();
            chatCopyEventsChart.update();
            chatInsertionEventsChart.update();
            engagedUsersChart.update();
            totalActiveUsersChart.update();
            totalCodeSuggestionsChart.update();
            codeLinesAcceptedChart.update();
            codeLinesSuggestedChart.update();
            languagesUsageChart.update();
        };

        


    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });