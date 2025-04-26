#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SecretsStack } from '../src/stacks/secrets-stack';
import * as dotenv from 'dotenv';
import { Environment } from '../src/types/environment';
import { EnvironmentConfig, ConfigurationError } from '../src/config/env';
import { env } from 'process';



const app = new cdk.App();

// Load environment variables based on environment
const targetEnv = (process.env.NODE_ENV || app.node.tryGetContext('env')) as cdk.Environment;

if (!targetEnv || !Object.values(Environment).includes(targetEnv)) {
  throw new Error(
    `Invalid or missing environment. Please specify environment using TARGET_ENV or -c env=<env>. Valid values: ${Object.values(Environment).join(', ')}`
  );
}

try {

  const envConfig = EnvironmentConfig.getInstance(targetEnv);
  new SecretsStack(app, `SecretsStack-${environment}`, {
    environment: targetEnv,
    projectName: envConfig.projectName,
    secretValues: {
      DATABASE_URL: envConfig.databaseUrl,
      ENCRYPTION_PASSWORD: envConfig.entryptionPassword,
      PORT: envConfig.port,
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
      AWS_REGION: process.env.AWS_REGION!,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
      NODE_ENV: targetEnv,
      AWS_SECRETS_NAME: `ckm/${environment}/env-variables`,
      PINPOINT_PROJECT_ID: process.env.PINPOINT_PROJECT_ID || '',
      PINPOINT_FROM_EMAIL: process.env.PINPOINT_FROM_EMAIL!,
      PINPOINT_SMS_SENDER_ID: process.env.PINPOINT_SMS_SENDER_ID || '',
      SMS_POOL_ORIGINATION_NUMBER: process.env.SMS_POOL_ORIGINATION_NUMBER || '',
      CORS_ORIGIN: process.env.CORS_ORIGIN!,
    },
    env: {
      account: process.env.AWS_ACCOUNT_ID,
      region: process.env.AWS_REGION,
    },
  });

  app.synth();

} catch (error) {

}

