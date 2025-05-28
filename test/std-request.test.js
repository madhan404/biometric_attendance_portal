const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testStdRequest() {
    try {
        // Create form data
        const formData = new FormData();
        
        // Add text fields
        formData.append('request_type', 'internship');
        formData.append('startDate', '2024-03-20');
        formData.append('endDate', '2024-03-21');
        
        // Add PDF file
        const pdfPath = path.join(__dirname, 'test.pdf');
        formData.append('pdf', fs.createReadStream(pdfPath));

        // Make the request
        const response = await axios.post('http://localhost:3000/std-request', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testStdRequest(); 