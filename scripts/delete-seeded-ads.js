import { writeFile } from 'fs/promises';

const API_URL = 'http://localhost:5000';
const USER_EMAIL = 'seeder_1767183511740@test.com'; // User from seed script
const USER_PASS = '123456';

let authToken = null;
let userId = null;

function extractToken(cookieStr) {
    if (!cookieStr) return null;
    const match = cookieStr.match(/accessToken=([^;]+)/);
    return match ? match[1] : null;
}

async function login() {
  console.log('Logging in to delete ads...');
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASS
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed: ${res.status} ${err}`);
  }

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
     const cookieToken = extractToken(setCookie);
     if (cookieToken) authToken = cookieToken;
  }
  
  try {
      const data = await res.json();
      if(data.token) authToken = data.token;
      if(data.accessToken) authToken = data.accessToken;
      if(data.user && data.user.id) userId = data.user.id;
  } catch (e) {
      console.log('No JSON body in login');
  }

  console.log(`Logged in. UserID: ${userId}`);
}

async function deleteAds() {
  await login();

  if (!authToken || !userId) {
      console.error('Authentication failed.');
      return;
  }

  // Fetch user ads
  console.log('Fetching user ads...');
  const res = await fetch(`${API_URL}/api/spaces?owner_id=${userId}&limit=100`, { // increasing limit to get all
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
  });

  if (!res.ok) {
      console.error('Failed to fetch ads');
      return;
  }

  const data = await res.json();
  const spaces = data.spaces || [];
  
  console.log(`Found ${spaces.length} ads to delete.`);

  for (const space of spaces) {
      const del = await fetch(`${API_URL}/api/spaces/${space.id}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${authToken}`
          }
      });
      
      if (del.ok) {
          console.log(`Deleted ad: ${space.title} (${space.id})`);
      } else {
          console.error(`Failed to delete ${space.id}: ${del.status}`);
      }
  }
  
  console.log('Cleanup complete.');
}

deleteAds();
