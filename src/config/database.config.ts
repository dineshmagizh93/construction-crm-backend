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

  // Parse DATABASE_URL to check if SSL is needed
  try {
    const url = new URL(databaseUrl);
    const isRailway = url.hostname.includes('railway.app') || url.hostname.includes('railway.internal');
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    // For Railway MySQL, we need to add SSL parameters
    if (isRailway || isProduction) {
      // If DATABASE_URL doesn't already have SSL parameters, add them
      if (!databaseUrl.includes('?ssl=') && !databaseUrl.includes('&ssl=')) {
        const separator = databaseUrl.includes('?') ? '&' : '?';
        return `${databaseUrl}${separator}ssl={"rejectUnauthorized":false}`;
      }
    }

    return databaseUrl;
  } catch (error) {
    // If URL parsing fails, return original (might be a connection string format)
    console.warn('Could not parse DATABASE_URL, using as-is:', error.message);
    return databaseUrl;
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
