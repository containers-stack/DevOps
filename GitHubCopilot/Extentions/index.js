import { Octokit } from "@octokit/core";
import express from "express";
import { Readable } from "node:stream";
import fetch from 'node-fetch';

const app = express()

const ADO_SYSTEM_PROMPT = `
      Your task is to assist a developer in creating a new Product Backlog Item (PBI) on Azure DevOps.

      Gather the necessary information from the user, validate the input, and provide the PBI Title and Description in a structured format.
      PBI Title: Create a new API for user authentication
      PBI Description:
        as a developer, I want to create a new API for user authentication including sign-up, login, and password reset functionality.
        Tasks:
          1. Implement sign-up functionality.
          2. Develop login functionality.
          3. Create password reset feature.
        Acceptance Criteria:
          - User should be able to sign up with valid credentials.
          - User should be able to log in with correct credentials.
          - User should be able to reset their password.
        Unit Tests:
          - Test sign-up functionality.
          - Test login functionality.
          - Test password reset feature.

      - Example Interaction (Input and Output) 
        User provides the following information: 
        - User Input: Create tasks to implement user authentication API.
        - System Output: PBI Title: Create a new API for user authentication
                         PBI Description: as a developer, I want to create a new API for user authentication including sign-up, login, and password reset functionality.
                                          Tasks:
                                            1. Implement sign-up functionality.
                                            2. Develop login functionality.
                                            3. Create password reset feature.
                                          Acceptance Criteria:
                                            - User should be able to sign up with valid credentials.
                                            - User should be able to log in with correct credentials.
                                            - User should be able to reset their password.
                                          Unit Tests:
                                            - Test sign-up functionality.
                                            - Test login functionality.
                                            - Test password reset feature.
          
        # Steps:
        1. Ask the user if he wants to change somthing in the PBI.
        2. If the user wants to change, ask the user to provide the new information.
        3. If the user confirms the PBI, create the PBI on Azure DevOps.
        4. the confirmation MUST include the word "confirm" in the user input.

`
async function open_pbi(title, description) {
  const url = '';
  const headers = {
    'Accept': '*/*',
    'Content-Type': 'application/json-patch+json',
    'Authorization': 'Basic '
  };
  const body = JSON.stringify([
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": title
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": description
    }
  ]);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.status;

    console.log('PBI Created:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

app.get("/", (req, res) => {
  res.send({ message: "Hello, welcome to the GitHub Copilot Azure DevOps bot!" });
});

app.post("/", express.json(), async (req, res) => {
  // Identify the user, using the GitHub API token provided in the request headers.
  const tokenForUser = req.get("X-GitHub-Token");
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");

  const user_input = req.body.messages[req.body.messages.length - 1].content;

  const messages = req.body.messages;
  messages.unshift({
    role: "system",
    content: ADO_SYSTEM_PROMPT
  });
  messages.unshift({
    role: "user",
    content: user_input
  });

  const copilotLLMResponse = await fetch(
    "https://api.githubcopilot.com/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${tokenForUser}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    }
  );

  // Check if the agent has all the information needed to open the PBI
  let pbiDetails = null;
  for (const message of messages) {
    if (message.role === "assistant" && message.content.includes("PBI Title")) {
      try {
        pbiDetails = message.content;
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(400).json({ message: "Invalid JSON format in message content", error });
        return;
      }
      break;
    }
  }

  if (pbiDetails && user_input.toLowerCase().includes("confirm")) {
    const title = pbiDetails.split('PBI')[1]
    const description = pbiDetails.split('PBI')[2]
    try {
      const pbiResponse = await open_pbi(title, description);
      Readable.from(copilotLLMResponse.body).pipe(res);
    } catch (error) {
      Readable.from(copilotLLMResponse.body).pipe(res);
      
    }
  } else {
    // Stream the response from the Copilot model to the user
    Readable.from(copilotLLMResponse.body).pipe(res);
  }
})

const port = Number(process.env.PORT || '3000')
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});