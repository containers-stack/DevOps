// Make previewImage globally accessible
function previewImage(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewId = `image-preview-${Array.from(fileInput.parentNode.parentNode.children).indexOf(fileInput.parentNode) + 1}`;
      const previewImage = document.getElementById(previewId);
      previewImage.src = e.target.result;
      previewImage.style.display = "block";

      // Update the hidden input with the base64 image data
      document.getElementById('image-url').value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Function to preview image from URL
function previewImageFromUrl(event) {
  const urlInput = event.target;
  const imageUrl = urlInput.value.trim();
  const previewImage = urlInput.nextElementSibling.querySelector('.image-preview-img');
  if (imageUrl) {
    previewImage.src = imageUrl;
    previewImage.style.display = "block";
  } else {
    alert("אנא הכנס כתובת URL חוקית של תמונה.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if configuration exists in localStorage
  const endpoint = localStorage.getItem('endpoint');
  const subscriptionKey = localStorage.getItem('subscriptionKey');
  const analyzerId = localStorage.getItem('analyzerId');

  if (!endpoint || !subscriptionKey || !analyzerId) {
    // Show the configuration form and hide the rest of the page
    document.getElementById('config-form-container').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
  } else {
    // Hide the configuration form if secrets are already set
    document.getElementById('config-form-container').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
  }

  // Save configuration to localStorage
  document.getElementById('save-config-button').addEventListener('click', () => {
    const endpointInput = document.getElementById('endpoint').value.trim();
    const subscriptionKeyInput = document.getElementById('subscription-key').value.trim();
    const analyzerIdInput = document.getElementById('analyzer-id').value.trim();

    if (!endpointInput || !subscriptionKeyInput || !analyzerIdInput) {
      alert('אנא מלא את כל השדות.');
      return;
    }

    localStorage.setItem('endpoint', endpointInput);
    localStorage.setItem('subscriptionKey', subscriptionKeyInput);
    localStorage.setItem('analyzerId', analyzerIdInput);

    alert('ההגדרות נשמרו בהצלחה!');
    document.getElementById('config-form-container').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
  });

  // Add functionality to dynamically add more image URL inputs
  const addImageButton = document.getElementById('add-image-button');
  if (addImageButton) {
    addImageButton.addEventListener('click', () => {
      const issuesContainer = document.getElementById('issues-container');
      const issueCount = issuesContainer.children.length + 1;

      const issueDiv = document.createElement('div');
      issueDiv.classList.add('issue');
      issueDiv.innerHTML = `
        <label>בעיה #${issueCount}</label>
        <input type="text" class="image-url-input" placeholder="הכנס כתובת URL של התמונה" required onchange="previewImageFromUrl(event)">
        <div class="image-preview">
          <img class="image-preview-img" src="" alt="תצוגה מקדימה של התמונה" style="display: none; max-width: 100%; margin-top: 8px;">
        </div>
      `;
      issuesContainer.appendChild(issueDiv);
    });
  }

  // Analyze all images one by one
  document.getElementById('analyze-button').addEventListener('click', async () => {
    const endpoint = localStorage.getItem('endpoint');
    const subscriptionKey = localStorage.getItem('subscriptionKey');
    const analyzerId = localStorage.getItem('analyzerId');

    if (!endpoint || !subscriptionKey || !analyzerId) {
      alert('אנא הגדר את פרטי החיבור ל-Azure לפני שליחה.');
      return;
    }

    const imageInputs = document.querySelectorAll('.image-url-input');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const inspectionForm = document.getElementById('inspection-form');
    const resultContainer = document.getElementById('analysis-result-container');
    const resultList = document.getElementById('analysis-result-list');

    // Hide the form and show the progress bar
    inspectionForm.style.display = "none";
    progressBarContainer.style.display = "block";

    // Clear previous results
    resultList.innerHTML = "";
    resultContainer.style.display = "none";

    try {
      for (const [index, input] of imageInputs.entries()) {
        const imageUrl = input.value.trim();
        if (!imageUrl) {
          alert(`אנא הכנס כתובת URL חוקית לתמונה #${index + 1}`);
          continue;
        }

        // Step 1: POST request to analyze the image
        const analyzeResponse = await fetch(`${endpoint}/contentunderstanding/analyzers/${analyzerId}:analyze?api-version=2024-12-01-preview`, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": subscriptionKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: imageUrl })
        });

        if (analyzeResponse.status !== 202) {
          throw new Error(`Failed to analyze image #${index + 1}`);
        }

        const operationLocation = analyzeResponse.headers.get("Operation-Location");

        // Step 2: Poll the GET request to retrieve the analysis result
        let result;
        while (true) {
          const resultResponse = await fetch(operationLocation, {
            method: "GET",
            headers: {
              "Ocp-Apim-Subscription-Key": subscriptionKey
            }
          });

          const resultData = await resultResponse.json();
          if (resultData.status === "Succeeded") {
            result = resultData.result;
            break;
          } else if (resultData.status === "Failed") {
            throw new Error(`Image analysis failed for image #${index + 1}`);
          }

          // Wait for 1 second before polling again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Step 3: Display the analysis result for the current image
        displayAnalysisResult(result, imageUrl, index + 1);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during image analysis.");
    } finally {
      // Hide the progress bar
      progressBarContainer.style.display = "none";
    }
  });
});

// Function to display the analysis result for a single image
function displayAnalysisResult(result, imageUrl, imageIndex) {
  const resultContainer = document.getElementById('analysis-result-container');
  const resultList = document.getElementById('analysis-result-list');

  // Translate field names to Hebrew
  const fieldTranslations = {
    IssueType: "סוג הבעיה",
    SeverityLevel: "רמת חומרה",
    SuggestedAction: "פעולה מומלצת",
    LocationHint: "רמז למיקום",
    DetailedDescription: "תיאור מפורט"
  };

  // Add a header for the current image
  const imageHeader = document.createElement('h3');
  imageHeader.textContent = `תמונה #${imageIndex}`;
  resultList.appendChild(imageHeader);

  // Add the image preview
  const imagePreview = document.createElement('img');
  imagePreview.src = imageUrl;
  imagePreview.alt = `תמונה #${imageIndex}`;
  imagePreview.style = "max-width: 100%; margin-bottom: 16px;";
  resultList.appendChild(imagePreview);

  // Extract fields from the result
  const fields = result.contents[0].fields;
  for (const [key, field] of Object.entries(fields)) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${fieldTranslations[key] || key}:</strong> ${field.valueString}`;
    resultList.appendChild(listItem);
  }

  // Show the result container
  resultContainer.style.display = "block";
}
