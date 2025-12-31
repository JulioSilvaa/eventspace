import { writeFile } from 'fs/promises';

const API_URL = 'http://localhost:5000'; // Make sure this matches your backend URL
const USER_EMAIL = 'seeder_1767183511740@test.com'; // User already created
const USER_PASS = '123456';

const CITIES = [
  { city: 'São Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Recife', state: 'PE' },
  { city: 'Brasília', state: 'DF' },
  { city: 'Campinas', state: 'SP' },
  { city: 'Santos', state: 'SP' }
];

const ADJECTIVES = ['Incrível', 'Espaçoso', 'Moderno', 'Aconchegante', 'Luxuoso', 'Econômico', 'Central', 'Exclusivo', 'Rústico', 'Charmoso'];
const TYPES = ['Salão de Festas', 'Sítio', 'Chácara', 'Rooftop', 'Galpão', 'Estúdio', 'Casa de Eventos', 'Espaço Gourmet'];

const IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
];

let authToken = null;

function extractToken(cookieStr) {
    if (!cookieStr) return null;
    const match = cookieStr.match(/accessToken=([^;]+)/);
    return match ? match[1] : null;
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function register() {
  // Skipping register to avoid 429
  console.log('Skipping register, going straight to login with known user...');
}

async function login() {
  console.log('Logging in...');
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

  // 1. Check Cookies
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
     const cookieToken = extractToken(setCookie);
     if (cookieToken) authToken = cookieToken;
  }
  
  // 2. Check Body (this is usually where accessToken is if using httpOnly refresh cookie)
  try {
      const data = await res.json();
      if(data.token) authToken = data.token;
      if(data.accessToken) authToken = data.accessToken;
      // Only set from body if not already set from cookie (or override if body is preferred)
      // Usually body has the accessToken for immediate use
  } catch (e) {
      console.log('No JSON body in login response');
  }

  console.log('Logged in. Token length:', authToken ? authToken.length : 0);
}

async function createAds() {
  // Always try login first given our current state
  await login();

  if (!authToken) {
      console.error('Could not authenticate. Check API URL or backend logs.');
      return;
  }

  console.log('Starting seed of 30 ads...');

  for (let i = 0; i < 30; i++) {
    const location = getRandom(CITIES);
    const type = getRandom(TYPES);
    const adj = getRandom(ADJECTIVES);
    const title = `${type} ${adj} em ${location.city}`;
    
    // Random images (3 per ad)
    const adImages = [getRandom(IMAGES), getRandom(IMAGES), getRandom(IMAGES)];

    const payload = {
      title,
      description: `Este é um maravilhoso ${title.toLowerCase()}. Perfeito para seu evento. Capacidade para até ${Math.floor(Math.random() * 500) + 50} pessoas. Possui ótima infraestrutura e localização privilegiada. Entre em contato para mais detalhes!`,
      category_id: Math.floor(Math.random() * 3) + 1, // Assumes categories 1-3 exist for spaces
      capacity: Math.floor(Math.random() * 500) + 50,
      area_sqm: Math.floor(Math.random() * 1000) + 100,
      address: {
        street: 'Rua Exemplo',
        number: `${Math.floor(Math.random() * 1000)}`,
        neighborhood: 'Centro',
        city: location.city,
        state: location.state,
        zipcode: '12345-678',
        country: 'Brasil'
      },
      price_per_day: Math.floor(Math.random() * 2000) + 500,
      price_per_weekend: Math.floor(Math.random() * 5000) + 1500,
      price_type: 'daily',
      status: 'active',
      featured: Math.random() > 0.8, // 20% chance of being featured
      images: adImages, // Sending URLs directly
      comfort: ['wifi', 'parking', 'kitchen', 'air_conditioning'], // Backend expects 'comfort'
      contact_phone: '11999999999'
    };

    try {
      const res = await fetch(`${API_URL}/api/spaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // CORRECTED: Send as Bearer token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Failed to create ad ${i+1}: ${res.status} ${err}`);
      } else {
        console.log(`Created ad ${i+1}: ${title}`);
      }
    } catch (e) {
      console.error(`Error creating ad ${i+1}:`, e);
    }
  }

  console.log('Seeding complete!');
}

createAds();
