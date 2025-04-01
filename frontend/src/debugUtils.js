import axios from 'axios';

export const debugLogin = async (email, password) => {
  try {
    console.log('Running debug login with:', email);
    
    // Try verification endpoint first
    const verifyResponse = await axios.post('/api/debug/verify-login-flow', {
      email: email,
      password: password
    });
    
    console.log('Login verification response:', verifyResponse.data);
    
    // If the verification endpoint returns a token, save it and return success
    if (verifyResponse.data.access_token) {
      // Save the token and user information
      localStorage.setItem('token', verifyResponse.data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: verifyResponse.data.user_id,
        username: verifyResponse.data.username,
        email: verifyResponse.data.email,
        role: verifyResponse.data.role || 'user'
      }));
      
      console.log('Debug login successful with token');
      return {
        success: true,
        debugInfo: verifyResponse.data.debug_info,
        userData: {
          id: verifyResponse.data.user_id,
          username: verifyResponse.data.username,
          email: verifyResponse.data.email,
          role: verifyResponse.data.role
        }
      };
    }
    
    // If no token was returned, return diagnostic info
    return {
      success: false,
      debugInfo: verifyResponse.data,
      error: 'Login verification failed. See debug info for details.'
    };
  } catch (error) {
    console.error('Debug login error:', error);
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
};

export const testLoginEndpoint = async (email, password) => {
  try {
    // Test all login endpoints to see which ones work
    const results = {
      endpoints: {}
    };
    
    // Test JSON login endpoint
    try {
      console.log('Testing /api/json-login endpoint...');
      const jsonLoginResponse = await axios.post('/api/json-login', {
        email: email,
        password: password
      });
      
      results.endpoints['api/json-login'] = {
        status: jsonLoginResponse.status,
        hasToken: Boolean(jsonLoginResponse.data?.access_token),
        dataKeys: Object.keys(jsonLoginResponse.data || {})
      };
      
      // If this endpoint works and returns a token, use it
      if (jsonLoginResponse.data?.access_token) {
        results.workingEndpoint = 'api/json-login';
        results.token = jsonLoginResponse.data.access_token;
        results.userData = {
          id: jsonLoginResponse.data.user_id,
          username: jsonLoginResponse.data.username,
          email: jsonLoginResponse.data.email,
          role: jsonLoginResponse.data.role
        };
      }
    } catch (e) {
      results.endpoints['api/json-login'] = {
        error: e.message,
        status: e.response?.status,
        data: e.response?.data
      };
    }
    
    // Test login endpoint
    try {
      console.log('Testing /api/login endpoint...');
      const loginResponse = await axios.post('/api/login', 
        `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      results.endpoints['api/login'] = {
        status: loginResponse.status,
        hasToken: Boolean(loginResponse.data?.access_token),
        dataKeys: Object.keys(loginResponse.data || {})
      };
      
      // If this endpoint works and returns a token, and we don't already have a token, use it
      if (loginResponse.data?.access_token && !results.token) {
        results.workingEndpoint = 'api/login';
        results.token = loginResponse.data.access_token;
        results.userData = {
          id: loginResponse.data.user_id,
          username: loginResponse.data.username,
          email: loginResponse.data.email,
          role: loginResponse.data.role
        };
      }
    } catch (e) {
      results.endpoints['api/login'] = {
        error: e.message,
        status: e.response?.status,
        data: e.response?.data
      };
    }
    
    // Test debug login endpoint
    try {
      console.log('Testing /api/debug/debug-login endpoint...');
      const debugLoginResponse = await axios.post('/api/debug-login', {
        email: email,
        password: password
      });
      
      results.endpoints['api/debug-login'] = {
        status: debugLoginResponse.status,
        authenticated: debugLoginResponse.data?.authenticated,
        hasToken: Boolean(debugLoginResponse.data?.auth_details?.access_token),
        dataKeys: Object.keys(debugLoginResponse.data || {})
      };
      
      // If this endpoint works and returns a token, and we don't already have a token, use it
      if (debugLoginResponse.data?.auth_details?.access_token && !results.token) {
        results.workingEndpoint = 'api/debug-login';
        results.token = debugLoginResponse.data.auth_details.access_token;
        results.userData = {
          id: debugLoginResponse.data.auth_details.user_id,
          username: debugLoginResponse.data.user?.username,
          email: debugLoginResponse.data.user?.email,
          role: debugLoginResponse.data.user?.role
        };
      }
    } catch (e) {
      results.endpoints['api/debug-login'] = {
        error: e.message,
        status: e.response?.status,
        data: e.response?.data
      };
    }
    
    // If we found a working endpoint with a token, save it
    if (results.token) {
      localStorage.setItem('token', results.token);
      localStorage.setItem('user', JSON.stringify(results.userData));
      results.success = true;
    } else {
      results.success = false;
      results.error = 'No working login endpoint found that returns a token';
    }
    
    return results;
  } catch (error) {
    console.error('Test login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};