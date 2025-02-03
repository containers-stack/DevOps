document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const loadingDiv = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    const resultsDiv = document.getElementById('results');
    const submitButton = document.querySelector('button[type="submit"]');
    const textContentDiv = document.getElementById('textContent');
    const selectionMarksDiv = document.getElementById('selectionMarks');
    const tablesDiv = document.getElementById('tables');

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
    textContentDiv.innerHTML = '';
    selectionMarksDiv.innerHTML = '';
    tablesDiv.innerHTML = '';

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
    const textContentDiv = document.getElementById('textContent');
    const selectionMarksDiv = document.getElementById('selectionMarks');
    const tablesDiv = document.getElementById('tables');
    resultsDiv.innerHTML = '';
    textContentDiv.innerHTML = '';
    selectionMarksDiv.innerHTML = '';
    tablesDiv.innerHTML = '';

    if (result.handwritten_content) {
        resultsDiv.innerHTML += '<p>Document contains handwritten content</p>';
    } else {
        resultsDiv.innerHTML += '<p>Document does not contain handwritten content</p>';
    }

    result.pages.forEach(page => {
        page.lines.forEach((line, lineIdx) => {
            debugger
            if(line.text === "מק״ט"){
                debugger
                console.log("found")
            }
            textContentDiv.innerHTML += `<p>${line.text}</p>`;
        });

        page.selection_marks.forEach((mark, markIdx) => {
            selectionMarksDiv.innerHTML += `<p>Selection mark #${markIdx + 1}: ${mark.state} (Confidence: ${mark.confidence})</p>`;
        });
    });

    if (result.tables) {
        result.tables.forEach((table, tableIdx) => {
            tablesDiv.innerHTML += `<h3>Table ${tableIdx + 1}</h3>`;
            const tableElement = document.createElement('table');
            tableElement.style.width = '100%';
            tableElement.style.borderCollapse = 'collapse';
            tableElement.style.marginBottom = '20px';

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
                    cellElement.innerHTML = cell.content === 'selected' ? '<input type="checkbox" checked>' : '<input type="checkbox">';
                } else if (!cell.content) {
                    cellElement.innerHTML = '<input type="text" placeholder="Enter value">';
                } else {
                    cellElement.innerHTML = cell.content;
                }
            });

            tableElement.appendChild(tbody);
            tablesDiv.appendChild(tableElement);
        });
    }
}
