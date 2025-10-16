import axios from 'axios';

const testAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test banners endpoint
    console.log('\n2. Testing banners endpoint...');
    const bannersResponse = await axios.get(`${baseURL}/banners?page=1`);
    console.log('✅ Banners:', bannersResponse.data);
    
    // Test games endpoint
    console.log('\n3. Testing games endpoint...');
    const gamesResponse = await axios.get(`${baseURL}/games?page=1`);
    console.log('✅ Games:', gamesResponse.data);
    
    // Test game templates endpoint
    console.log('\n4. Testing game templates endpoint...');
    const templatesResponse = await axios.get(`${baseURL}/games/templates`);
    console.log('✅ Game templates:', templatesResponse.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the backend running?');
    }
  }
};

testAPI();



