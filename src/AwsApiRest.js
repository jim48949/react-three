import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AwsApiRest() {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {

        const fetchAPIKey = async () => {
            const response = await axios.get('https://sjjb0vmka6.execute-api.us-west-1.amazonaws.com/prod/api');
            console.log(response.data);  // Handle your API Key here
            setApiKey(response.data);
        }

        fetchAPIKey();
    })


    return apiKey;
}

export default AwsApiRest;