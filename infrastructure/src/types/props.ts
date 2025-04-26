import { Environment } from './environment';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cdk from 'aws-cdk-lib';

export interface InfrastructureStackProps extends cdk.StackProps {
  environment: Environment;
  projectName: string;
  fromAddress: string;
  replyToAddress: string;
  bounceRateThreshold: number;
  complaintRateThreshold: number;
  alertEmailAddresses: string[];
}

export interface MonitoringProps {
  projectName: string;
  environment: string;
  applicationId: string;
  bounceRateThreshold: number;
  complaintRateThreshold: number;
  alertEmailAddresses: string[];
}

export interface EmailChannelProps {
  applicationId: string;
  projectName: string;
  environment: string;
  fromAddress: string;
}

export interface ServiceRoleProps {
  projectName: string;
  environment: string;
  bucketName: string;
  kmsKeyArn?: string;
  secretNames: string[];
}


export interface SecretsManagerProps {
  projectName: string;
  environment: string;
  encryptionKey: kms.IKey;
  secretValues: {
    DATABASE_URL: string;
    ENCRYPTION_PASSWORD: string;
    PORT: string;
    JWT_SECRET_KEY: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_REGION: string;
    AWS_SECRET_ACCESS_KEY: string;
    NODE_ENV: string;
    AWS_SECRETS_NAME: string;
    PINPOINT_PROJECT_ID: string;
    PINPOINT_FROM_EMAIL: string;
    PINPOINT_SMS_SENDER_ID: string;
    SMS_POOL_ORIGINATION_NUMBER: string;
    CORS_ORIGIN: string;
  };
}

export interface SecretsStackProps extends cdk.StackProps {
  environment: string;
  projectName: string;
  secretValues: {
    DATABASE_URL: string;
    ENCRYPTION_PASSWORD: string;
    PORT: string;
    JWT_SECRET_KEY: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_REGION: string;
    AWS_SECRET_ACCESS_KEY: string;
    NODE_ENV: string;
    AWS_SECRETS_NAME: string;
    PINPOINT_PROJECT_ID: string;
    PINPOINT_FROM_EMAIL: string;
    PINPOINT_SMS_SENDER_ID: string;
    SMS_POOL_ORIGINATION_NUMBER: string;
    CORS_ORIGIN: string;
  };
}
