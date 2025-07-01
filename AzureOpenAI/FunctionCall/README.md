# Azure OpenAI Function Calling with Semantic Kernel

A C# console application demonstrating how to implement function calling with Azure OpenAI using Microsoft Semantic Kernel. This example creates an intelligent assistant that can control smart home lights through natural language commands.

---

## Purpose

This application showcases:

- **Function Calling:** How to enable Azure OpenAI to call custom functions based on user requests.
- **Semantic Kernel Integration:** Using Microsoft's Semantic Kernel framework for AI orchestration.
- **Plugin Architecture:** Creating reusable plugins that extend AI capabilities.
- **Interactive Chat:** Building a conversational AI assistant with memory.

---

## Features

- 🤖 **Intelligent Light Control:** Control smart lights using natural language.
- 💬 **Interactive Chat Interface:** Continuous conversation with the AI assistant.
- 🔌 **Plugin System:** Extensible architecture for adding new capabilities.
- 🧠 **Memory:** Maintains conversation history for context-aware responses.
- ⚡ **Real-time Function Execution:** AI automatically calls appropriate functions based on user intent.

---

## Prerequisites

- .NET 6.0 or later
- Azure OpenAI Service resource
- Visual Studio or VS Code with C# extension

---

## Required NuGet Packages

*(List the required NuGet packages here, if applicable.)*

---

## Setup Instructions

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2. **Configure Azure OpenAI credentials:**
    - Update the following variables in `Program.cs` with your Azure OpenAI endpoint and API key.

3. **Install dependencies:**
    ```bash
    dotnet restore
    ```

4. **Run the application:**
    ```bash
    dotnet run
    ```

---

## How It Works

### 1. Plugin System

The `LightsPlugin` class demonstrates how to create custom functions that the AI can call.

### 2. Function Discovery

The AI automatically discovers available functions through:

- `[KernelFunction]` attributes for function identification
- `[Description]` attributes for function purpose understanding
- Strongly-typed parameters for proper function calling

### 3. Natural Language Processing

Users can interact with lights using natural commands, for example:

- "Turn on the table lamp"
- "Show me all the lights"
- "Turn off the porch light"
- "What lights are currently on?"

### 4. Automatic Function Execution

The AI:

- Analyzes user intent
- Determines which function to call
- Extracts parameters from the user's message
- Executes the appropriate function
- Returns results in natural language

---

## Example Usage

*(Provide example input/output or screenshots if available.)*

---

## Code Structure

- **Program.cs**
  - *Kernel Configuration:* Sets up Azure OpenAI connection and Semantic Kernel
  - *Plugin Registration:* Adds the `LightsPlugin` to the kernel
  - *Chat Loop:* Manages the interactive conversation flow
  - *Function Choice Behavior:* Enables automatic function calling

- **LightsPlugin.cs**
  - *Mock Data:* Simulates smart home lights with state management
  - *Get Lights Function:* Retrieves current state of all lights
  - *Change State Function:* Toggles lights on/off based on ID
  - *Data Models:* Defines the structure for light information

---

## Key Concepts

### Function Calling

Azure OpenAI can automatically determine when to call functions based on user input, making the interaction feel natural and intelligent.

### Plugin Architecture

Semantic Kernel's plugin system allows you to extend AI capabilities by adding custom functions that the AI can discover and use.

### Conversation Memory

The application maintains chat history, enabling context-aware responses and more natural conversations.

---

## Extending the Application

To add new capabilities:

1. Create new plugin classes with `[KernelFunction]` decorated methods.
2. Register plugins with `kernel.Plugins.AddFromType<YourPlugin>()`.
3. Add descriptive attributes to help the AI understand function purposes.
4. Use proper parameter types for reliable function calling.

---

## Security Considerations

- Store API keys securely (use Azure Key Vault in production).
- Validate function parameters to prevent malicious input.
- Implement proper error handling for failed function calls.
- Consider rate limiting for production deployments.

---

## Troubleshooting

- **Authentication errors:** Verify your Azure OpenAI endpoint and API key.
- **Function not called:** Check function descriptions and parameter types.
- **Model limitations:** Ensure your deployed model supports function calling.
- **Timeout issues:** Adjust request timeout settings if needed.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.