import { z } from 'zod';
import * as dotenv from 'dotenv';
import { Environment, IEnvironmentConfig } from '../types/environment';
import { envSchema, type EnvConfig } from './schema';

export class ConfigurationError extends Error {
  /**
   *
   */
  constructor(message: string, public errors?: z.ZodError) {
    super(message);
    this.name = `ConfigurationError`;
  }
}


export class EnvironmentConfig implements IEnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvConfig

  private constructor(environment: Environment) {
    this.config = this.loadConfig(environment)
  }

  public static getInstance(environment: Environment): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig(environment);
    }

    return EnvironmentConfig.instance
  }

  private loadConfig(environment: Environment): EnvConfig {

    const result = dotenv.config({ path: `.env.${environment}` })
    if (result.error) {
      throw new ConfigurationError(
        `Failed to load .env.${environment}`
      )
    }

    try {
      return envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join('\n');

        throw new ConfigurationError(
          `Environment validation failed for ${environment}:\n${formattedErrors}`,
          error
        );
      }
      throw error;
    }
  }

  get awsAccount(): string {
    return this.config.AWS_ACCOUNT;
  }

  get awsRegion(): string {
    return this.config.AWS_REGION;
  }

  get projectName(): string {
    return this.config.PROJECT_NAME;
  }

  get fromEmailAddress(): string {
    return this.config.FROM_EMAIL_ADDRESS;
  }

  get replyToEmailAddress(): string {
    return this.config.REPLY_TO_EMAIL_ADDRESS;
  }

  get bounceRateThreshold(): number {
    return this.config.BOUNCE_RATE_THRESHOLD;
  }

  get complaintRateThreshold(): number {
    return this.config.COMPLAINT_RATE_THRESHOLD;
  }

  get alertEmailAddresses(): string[] {
    return this.config.ALERT_EMAIL_ADDRESSES;
  }

  get environment(): string {
    return this.config.ENVIRONMENT
  }

  get databaseUrl(): string {
    return this.config.DATABASE_URL
  }

  get entryptionPassword(): string {
    return this.config.ENCRYPTION_PASSWORD
  }

  get port(): number {
    return this.config.PORT
  }




} // #endofregion
