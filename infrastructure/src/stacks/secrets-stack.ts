import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { SecretsManager } from '../constructs/secrets-manager';
import { SecretsStackProps } from 'src/types/props';

export class SecretsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SecretsStackProps) {
    super(scope, id, props);

    // Create KMS Key for encryption
    const kmsKey = new kms.Key(this, 'SecretsEncryptionKey', {
      enableKeyRotation: true,
      alias: `${props.projectName}-${props.environment}-secrets-key`,
      description: `KMS key for ${props.projectName} ${props.environment} secrets`,
    });

    // Create Secrets Manager with environment variables
    const secretsManager = new SecretsManager(this, 'EnvironmentSecrets', {
      projectName: props.projectName,
      environment: props.environment,
      encryptionKey: kmsKey,
      secretValues: props.secretValues,
    });

    // Outputs
    new cdk.CfnOutput(this, 'SecretArn', {
      value: secretsManager.secret.secretArn,
      description: 'ARN of the created secret',
      exportName: `${props.projectName}-${props.environment}-secret-arn`,
    });

    new cdk.CfnOutput(this, 'SecretName', {
      value: secretsManager.secret.secretName,
      description: 'Name of the created secret',
      exportName: `${props.projectName}-${props.environment}-secret-name`,
    });

    new cdk.CfnOutput(this, 'KmsKeyArn', {
      value: kmsKey.keyArn,
      description: 'ARN of the KMS key',
      exportName: `${props.projectName}-${props.environment}-kms-key-arn`,
    });
  }
}

