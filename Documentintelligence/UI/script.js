document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const loadingDiv = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    const resultsDiv = document.getElementById('results');
    const submitButton = document.querySelector('button[type="submit"]');

    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.files[0];
    const endpoint = "http://localhost:8000/analyze-layout/";

    loadingDiv.classList.remove('hidden');
    submitButton.disabled = true;
    messageDiv.innerHTML = '';
    resultsDiv.innerHTML = '';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error analyzing document.');
        }

        const result = await response.json();
        displayResults(result);
        messageDiv.innerHTML = '<p style="color: green;">Document analyzed successfully.</p>';
    } catch (error) {
        console.error(error);
    } finally {
        loadingDiv.classList.add('hidden');
        submitButton.disabled = false;
    }
});

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (result.handwritten_content) {
        resultsDiv.innerHTML += '<p>Document contains handwritten content</p>';
    } else {
        resultsDiv.innerHTML += '<p>Document does not contain handwritten content</p>';
    }

    result.pages.forEach(page => {
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('result-section');
        pageDiv.innerHTML = `<h2>טופס ${page.lines[0].text}</h2>`;

        resultsDiv.appendChild(pageDiv);
    });

    if (result.tables) {
        result.tables.forEach(table => {
            const tableDiv = document.createElement('div');
            tableDiv.classList.add('result-section');
            
            const tableElement = document.createElement('table');
            tableElement.style.width = '100%';
            tableElement.style.borderCollapse = 'collapse';
            tableElement.style.marginBottom = '20px';

            try {
                const tbody = document.createElement('tbody');
                const maxColumns = Math.max(...table.cells.map(cell => cell.column_index));
                table.cells.forEach(cell => {
                    let row = tbody.rows[cell.row_index];
                    if (!row) {
                        row = tbody.insertRow(cell.row_index);
                    }
                    while (row.cells.length <= maxColumns) {
                        row.insertCell();
                    }
                    const cellElement = row.cells[cell.column_index];
                    cellElement.style.border = '1px solid #444';
                    cellElement.style.padding = '8px';

                    if (cell.type === 'checkbox') {
                        debugger
                        cellElement.innerHTML = cell.content === 'selected' ? '<input type="checkbox" checked>' : '<input type="checkbox">';
                    } else if (!cell.content) {
                        cellElement.innerHTML = '<input type="text" placeholder="Enter value">';
                    } else {
                        cellElement.innerHTML = cell.content;
                    }
                });

                tableElement.appendChild(tbody);
                tableDiv.appendChild(tableElement);
                resultsDiv.appendChild(tableDiv);
            } catch (error) {
                console.error('Error processing table cells:', error);
            }
        });
    }
}
