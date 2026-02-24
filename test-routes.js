// Simple script to test if backend routes are working
const http = require('http');

const testRoutes = [
  { path: '/api/auth/register', method: 'POST', requiresAuth: false },
  { path: '/api/projects', method: 'GET', requiresAuth: true },
  { path: '/api/projects/stats', method: 'GET', requiresAuth: true },
];

console.log('Testing backend routes...\n');

testRoutes.forEach((route) => {
  const options = {
    hostname: 'localhost',
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
    path: route.path,
    method: route.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 404) {
        console.log(`❌ ${route.method} ${route.path} - 404 Not Found`);
      } else if (res.statusCode === 401 && route.requiresAuth) {
        console.log(`✅ ${route.method} ${route.path} - 401 Unauthorized (Route exists, auth required)`);
      } else if (res.statusCode === 400 || res.statusCode === 422) {
        console.log(`✅ ${route.method} ${route.path} - ${res.statusCode} (Route exists, validation error)`);
      } else {
        console.log(`✅ ${route.method} ${route.path} - ${res.statusCode} OK`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ ${route.method} ${route.path} - Error: ${error.message}`);
  });

  if (route.method === 'POST') {
    req.write(JSON.stringify({}));
  }
  req.end();
});

setTimeout(() => {
  console.log('\nTest complete. Check results above.');
  process.exit(0);
}, 2000);

