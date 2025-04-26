import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { SecretsManagerProps } from 'src/types/props';

export class SecretsManager extends Construct {
  public readonly secret: secretsmanager.Secret;

  /**
   *
   */
  constructor(scope: Construct, id: string, props: SecretsManagerProps) {
    super(scope, id);
    // Create the secret with initial values
    this.secret = new secretsmanager.Secret(this, 'EnvironmentSecret', {
      secretName: `${props.projectName}/${props.environment}/env-variables`,
      description: `Environment variables for ${props.projectName} ${props.environment}`,
      encryptionKey: props.encryptionKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          DATABASE_URL: props.secretValues.DATABASE_URL,
          ENCRYPTION_PASSWORD: props.secretValues.ENCRYPTION_PASSWORD,
          PORT: props.secretValues.PORT,
          JWT_SECRET_KEY: props.secretValues.JWT_SECRET_KEY,
          AWS_ACCESS_KEY_ID: props.secretValues.AWS_ACCESS_KEY_ID,
          AWS_REGION: props.secretValues.AWS_REGION,
          AWS_SECRET_ACCESS_KEY: props.secretValues.AWS_SECRET_ACCESS_KEY,
          NODE_ENV: props.environment,
          AWS_SECRETS_NAME: `${props.projectName}/${props.environment}/env-variables`,
          PINPOINT_PROJECT_ID: props.secretValues.PINPOINT_PROJECT_ID,
          PINPOINT_FROM_EMAIL: props.secretValues.PINPOINT_FROM_EMAIL,
          PINPOINT_SMS_SENDER_ID: props.secretValues.PINPOINT_SMS_SENDER_ID,
          SMS_POOL_ORIGINATION_NUMBER: props.secretValues.SMS_POOL_ORIGINATION_NUMBER,
          CORS_ORIGIN: props.secretValues.CORS_ORIGIN,
        }),
        generateStringKey: 'password' // This is required but won't be used
      }
    });
  }


}
