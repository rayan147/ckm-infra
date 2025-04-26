#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../src/stacks/infrastructure-stack';
import { Environment } from '../src/types/environment';
import { EnvironmentConfig, ConfigurationError } from '../src/config/env';
import * as dotenv from "dotenv";

const app = new cdk.App();

// Get target environment
const targetEnv = process.env.TARGET_ENV || app.node.tryGetContext('env');

// Load environment-specific .env file
if (targetEnv) {
  const result = dotenv.config({ path: `.env.${targetEnv}` });
  if (result.error) {
    console.warn(`Warning: Could not load .env.${targetEnv}: ${result.error.message}`);
  }
} else {
  // Load default .env file
  dotenv.config();
}

// Validate environment
if (!targetEnv || !Object.values(Environment).includes(targetEnv as Environment)) {
  console.error('\nAvailable environments:');
  Object.values(Environment).forEach(env => {
    console.error(`- ${env}`);
  });
  throw new Error(
    `Invalid or missing environment. Please specify using:
     - Environment variable: TARGET_ENV=dev|staging|prod
     - CDK context: cdk deploy -c env=dev|staging|prod`
  );
}

try {
  // Load and validate environment configuration
  const envConfig = EnvironmentConfig.getInstance(targetEnv as Environment);

  // Create the stack
  new InfrastructureStack(app, `InfrastructureStack-${targetEnv}`, {
    environment: targetEnv as Environment,
    projectName: envConfig.projectName,
    fromAddress: envConfig.fromEmailAddress,
    replyToAddress: envConfig.replyToEmailAddress,
    bounceRateThreshold: envConfig.bounceRateThreshold,
    complaintRateThreshold: envConfig.complaintRateThreshold,
    alertEmailAddresses: envConfig.alertEmailAddresses,
    env: {
      account: envConfig.awsAccount,
      region: envConfig.awsRegion,
    },
    tags: {
      Environment: targetEnv,
      Project: envConfig.projectName,
    },
  });

  app.synth();
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('\nConfiguration Error:');
    console.error(error.message);
    if (error.errors) {
      console.error('\nValidation Errors:');
      error.errors.errors.forEach(err => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    }
  } else {
    console.error('\nUnexpected Error:', error);
  }
  process.exit(1);
}
