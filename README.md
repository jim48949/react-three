# Project Overview

This project aims to develop an interactive 3D model viewer using Three.js and React, capable of displaying one or multiple 3D models simultaneously. Users can interact with these models, selecting specific ones to load or unload. Additionally, the project features an AI chatbot integration (using Chat GPT) to assist users by answering their questions. The API key for the chatbot is securely managed through AWS Lambda and API Gateway (REST API).


## Key Features


### 1. 3D Model Interaction:

- Display and Interaction: Users can view and interact with 3D models in real-time.
- Dynamic Loading: Models can be loaded and unloaded based on user selection.
- Multiple Models: Support for multiple models being displayed simultaneously.

### 2. AI Chatbot Integration:

- Chat GPT-Based: An AI chatbot integrated to provide user assistance.
- Prompt Engineering: Custom prompts are used to set up the chatbot’s characteristics and ensure relevant responses.

### 3. Secure API Key Management:

- AWS Lambda: API key is securely stored and fetched via AWS Lambda functions.
- API Gateway: REST API endpoints manage the communication between the frontend and the backend.
