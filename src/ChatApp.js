import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatApp.css'; // Import the CSS file
import AWS from 'aws-sdk';

function ChatApp({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState(''); // State to store the API key


  useEffect(() => {
    /*
    const fetchApiKey = async () => {
      const secretName = "OpenAI_API";
      const region = 'us-west-1';
      AWS.config.update({ region: 'us-west-1' });
      // Set up AWS Secrets Manager client
      const secretsManager = new AWS.SecretsManager({ region });

      // Retrieve secret value
      secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err) {
          console.error('Error retrieving secret:', err);
        } else {
          if ('SecretString' in data) {
            const secretString = data.SecretString;
            setApiKey(secretString);
            console.log('Secret:', secretString);
            // Use the secret value as needed
          } else {
            console.error('Secret not found:', secretName);
          }
        }
      });
    };

    fetchApiKey();
    */
   setApiKey("YOUR_API_KEY");
  }, []); // Empty dependency array ensures this runs only once on mount

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    if (!apiKey) {
      setError('API Key is not loaded. Please wait or refresh.');
      return;
    }

    // Add user message to the UI with consistent property 'content'
    setMessages(prevMessages => [...prevMessages, { content: inputText, fromUser: true }]);
    setInputText('');
    setError('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Specify the ChatGPT model
          messages: [
            { role: 'system', content: 'You are a firearm specialist. You are only responsible for answering question regarding firearms. Questions that are not related to firearm should be response: Sorry, I could only answer questions about firearms. Please ask question like: Tell me the history of Glock; or: What is the megazine capacity of a Glock 17?' },
            { role: 'user', content: inputText }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`, // Use the actual API key
            'Content-Type': 'application/json'
          }
        }
      );

      // Ensure API response format is correctly handled
      const botResponse = response.data.choices[0].message.content;
      setMessages(prevMessages => [...prevMessages, { content: botResponse, fromUser: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please check the console for more details.');
    }
  };

  // Add an event listener to close on click outside
  const handleOutsideClick = (event) => {
    if (event.target.id === "chat-container") {
      onClose();
    }
  };

  return (
    <div id="chat-container" className="chat-container" onClick={handleOutsideClick}>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={message.fromUser ? 'user-message' : 'bot-message'}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Ask me questions about firearms! Click anywhere of the chat box to close it."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatApp;
