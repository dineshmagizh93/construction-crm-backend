import { ConfigService } from '@nestjs/config';

/**
 * Database configuration for Prisma
 * Handles Railway MySQL SSL requirements
 */
export function getDatabaseConfig(configService: ConfigService) {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required. Please set it in your environment variables.',
    );
  }

  // Remove any surrounding quotes or whitespace
  const cleanUrl = databaseUrl.trim().replace(/^["']|["']$/g, '');

  // Validate and parse DATABASE_URL
  try {
    const url = new URL(cleanUrl);
    
    // Validate protocol
    if (!['mysql:', 'mysql2:'].includes(url.protocol)) {
      throw new Error(
        `Invalid database protocol: ${url.protocol}. Expected mysql:// or mysql2://`
      );
    }

    // Validate hostname
    if (!url.hostname || url.hostname.trim() === '') {
      throw new Error('Database hostname is missing or invalid');
    }

    // Validate port
    if (url.port) {
      const portNum = parseInt(url.port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        throw new Error(
          `Invalid port number: "${url.port}". Port must be a number between 1 and 65535.`
        );
      }
    }

    // Validate database name (pathname)
    if (!url.pathname || url.pathname === '/' || url.pathname.trim() === '') {
      throw new Error(
        'Database name is missing. URL format should be: mysql://user:password@host:port/database'
      );
    }

    const isRailway = url.hostname.includes('railway.app') || 
                      url.hostname.includes('railway.internal') || 
                      url.hostname.includes('rlwy.net');
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    // For Railway MySQL, we need to add SSL parameters
    if (isRailway || isProduction) {
      // If DATABASE_URL doesn't already have SSL parameters, add them
      if (!cleanUrl.includes('?ssl=') && !cleanUrl.includes('&ssl=')) {
        const separator = cleanUrl.includes('?') ? '&' : '?';
        const urlWithSsl = `${cleanUrl}${separator}ssl={"rejectUnauthorized":false}`;
        
        // Validate the final URL before returning
        try {
          new URL(urlWithSsl);
          return urlWithSsl;
        } catch (sslError) {
          throw new Error(
            `Failed to construct SSL-enabled database URL: ${sslError.message}. ` +
            `Original URL: ${cleanUrl.substring(0, 50)}...`
          );
        }
      }
    }

    return cleanUrl;
  } catch (error) {
    // Provide helpful error message
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      throw new Error(
        `Invalid DATABASE_URL format: ${error.message}. ` +
        `Expected format: mysql://user:password@host:port/database. ` +
        `Make sure special characters in password are URL-encoded. ` +
        `Current value (first 50 chars): ${cleanUrl.substring(0, 50)}...`
      );
    }
    
    // Re-throw our custom errors
    if (error.message.includes('Invalid') || error.message.includes('missing')) {
      throw error;
    }
    
    // For other errors, provide context
    throw new Error(
      `Database URL validation failed: ${error.message}. ` +
      `Please check your DATABASE_URL environment variable. ` +
      `Format should be: mysql://user:password@host:port/database`
    );
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(prisma: any): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}
