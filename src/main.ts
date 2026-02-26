import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);
  const configService = app.get(ConfigService);
  app.useLogger(logger);
  
  // Trust proxy for Render/Railway (behind reverse proxy)
  // Get the underlying Express instance and set trust proxy
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  
  const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';

  const killProcessOnPort = async (port: number): Promise<boolean> => {
    try {
      // Windows: Find process using port
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          
          if (pid && !isNaN(Number(pid))) {
            try {
              await execAsync(`taskkill /PID ${pid} /F`);
              console.log(`✅ Killed process ${pid} that was using port ${port}`);
              return true;
            } catch (killErr: any) {
              // Process might have already exited
              if (!killErr.message.includes('not found')) {
                console.warn(`⚠️  Could not kill process ${pid}: ${killErr.message}`);
              }
            }
          }
        }
      }
      return false;
    } catch (err: any) {
      // No process found or command failed
      return false;
    }
  };

  const listenWithRetry = async (port: number, retries = 5, delayMs = 2000) => {
    let lastError: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await app.listen(port);
        return;
      } catch (err: any) {
        lastError = err;
        if (err?.code === 'EADDRINUSE' && attempt < retries) {
          console.warn(
            `⚠️  Port ${port} is still in use (attempt ${attempt}/${retries}).`,
          );
          
          // Try to automatically kill the process on first retry
          if (attempt === 1) {
            console.log(`   Attempting to free port ${port} automatically...`);
            const killed = await killProcessOnPort(port);
            if (killed) {
              console.log(`   Waiting ${delayMs}ms for port to be released...`);
              await new Promise((r) => setTimeout(r, delayMs));
              continue;
            }
          }
          
          console.warn(`   Waiting ${delayMs}ms before retry...`);
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        if (err?.code === 'EADDRINUSE' && attempt === retries) {
          console.error(`\n❌ Failed to bind to port ${port} after ${retries} attempts.`);
          console.error(`   Port ${port} is still in use by another process.`);
          console.error(`\n   To fix this manually, run:`);
          console.error(`   netstat -ano | findstr :${port}`);
          console.error(`   taskkill /PID <PID> /F\n`);
        }
        throw err;
      }
    }
    throw lastError;
  };

  // Enable CORS FIRST - before other middleware
  let frontendUrl = configService.get<string>('FRONTEND_URL');
  
  if (!frontendUrl && !isDevelopment) {
    throw new Error(
      'FRONTEND_URL environment variable is required in production. Please set it in your environment variables.',
    );
  }

  // Normalize FRONTEND_URL: remove trailing slashes and whitespace
  if (frontendUrl) {
    frontendUrl = frontendUrl.trim().replace(/\/+$/, '');
  }

  console.log(
    `🔧 CORS configured for: ${frontendUrl || 'development (allowing localhost)'} ${isDevelopment ? '(dev mode)' : '(production)'}`,
  );

  app.enableCors({
    origin: isDevelopment
      ? (origin, callback) => {
          // Allow same-origin / server-to-server requests (no Origin header)
          if (!origin) return callback(null, true);

          // Allow any localhost port in development (Next may pick 3001/3002/etc if 3000 is busy)
          const isLocalhost =
            /^https?:\/\/localhost:\d+$/.test(origin) || /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);
          if (isLocalhost) return callback(null, true);

          return callback(new Error(`CORS blocked for origin: ${origin}`), false);
        }
      : (origin, callback) => {
          // Allow same-origin / server-to-server requests (no Origin header)
          if (!origin) return callback(null, true);

          // Normalize origin: remove trailing slashes
          const normalizedOrigin = origin.trim().replace(/\/+$/, '');
          const normalizedFrontendUrl = frontendUrl!.trim().replace(/\/+$/, '');

          // Exact match (handles trailing slash differences)
          if (normalizedOrigin === normalizedFrontendUrl) {
            return callback(null, true);
          }

          // Log for debugging
          console.warn(
            `⚠️  CORS: Origin mismatch. Expected: ${normalizedFrontendUrl}, Got: ${normalizedOrigin}`,
          );

          return callback(
            new Error(
              `CORS blocked: Origin ${normalizedOrigin} does not match ${normalizedFrontendUrl}`,
            ),
            false,
          );
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Security: Helmet for HTTP headers (after CORS)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Rate limiting - disabled in development, enabled in production
  if (!isDevelopment) {
    // Production rate limiting
    const limiter = rateLimit.default({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requests per 15 minutes
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS requests
    });

    // Apply rate limiting to all routes except auth and OPTIONS requests
    app.use('/api', (req, res, next) => {
      // Skip rate limiting for OPTIONS (CORS preflight) requests
      if (req.method === 'OPTIONS') {
        return next();
      }
      if (req.path.startsWith('/auth')) {
        // More lenient rate limit for auth endpoints
        return next();
      }
      return limiter(req, res, next);
    });
  } else {
    console.log('⚠️  Rate limiting DISABLED in development mode');
  }

  // Stricter rate limit for auth endpoints (but not OPTIONS) - only in production
  if (!isDevelopment) {
    const authLimiter = rateLimit.default({
      windowMs: 15 * 60 * 1000,
      max: 5, // 5 login attempts per 15 minutes
      message: 'Too many login attempts, please try again later.',
      skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS requests
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
  }

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Log all incoming requests (for debugging) - must be after setGlobalPrefix
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📥 [${timestamp}] ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      // Mask sensitive data
      const bodyCopy = { ...req.body };
      if (bodyCopy.password) bodyCopy.password = '***';
      if (bodyCopy.newPassword) bodyCopy.newPassword = '***';
      if (bodyCopy.currentPassword) bodyCopy.currentPassword = '***';
      console.log(`   Body:`, JSON.stringify(bodyCopy, null, 2));
    }
    next();
  });

  // Use PORT from environment (Render provides this automatically)
  // Fallback to 5000 for production, 3001 for development
  const port = configService.get<string>('PORT') || (isDevelopment ? '3001' : '5000');
  const portNumber = Number(port);

  if (isNaN(portNumber)) {
    throw new Error(`Invalid PORT value: ${port}. Must be a number.`);
  }

  // Only use retry logic in development (for Windows port conflicts)
  if (isDevelopment) {
    await listenWithRetry(portNumber);
  } else {
    await app.listen(portNumber);
  }

  const baseUrl = isDevelopment
    ? `http://localhost:${portNumber}`
    : `https://${configService.get<string>('RENDER_SERVICE_NAME') || 'your-app'}.onrender.com`;

  console.log(`\n✅ Application is running on port: ${portNumber}`);
  console.log(`✅ API Base URL: ${baseUrl}/api`);
  console.log(`✅ Environment: ${isDevelopment ? 'development' : 'production'}`);
  console.log(`✅ Security: Helmet & Rate Limiting ${isDevelopment ? 'disabled' : 'enabled'}`);
  console.log(`✅ All routes registered successfully!`);
  
  if (isDevelopment) {
    console.log(`✅ Request logging enabled - all incoming requests will be logged`);
  }
  console.log('');
}

bootstrap();

