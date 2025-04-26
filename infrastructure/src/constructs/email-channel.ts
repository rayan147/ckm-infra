import * as iam from 'aws-cdk-lib/aws-iam';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import { Construct } from 'constructs';
import { EmailChannelProps } from '../types/props';
import * as ses from 'aws-cdk-lib/aws-ses';
import { Environment } from '../types/environment';
import { EnvironmentConfig, ConfigurationError } from '../config/env';

export class EmailChannel extends Construct {
  constructor(scope: Construct, id: string, props: EmailChannelProps) {
    super(scope, id);
    // Get target environment from command line arguments or environment variable
    const targetEnv = (process.env.TARGET_ENV || process.env.NODE_ENV) as Environment;

    if (!targetEnv || !Object.values(Environment).includes(targetEnv)) {
      throw new Error(
        `Invalid or missing environment. Please specify environment using TARGET_ENV or -c env=<env>. Valid values: ${Object.values(Environment).join(', ')}`
      );
    }

    const envConfig = EnvironmentConfig.getInstance(targetEnv);
    const pinpointRole = new iam.Role(this, 'PinpointRole', {
      assumedBy: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
    });

    const emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.email(props.fromAddress)
    })

    // Add SES permissions
    pinpointRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ses:SendEmail',
          'ses:SendRawEmail'
        ],
        resources: [
          // Allow sending from the verified identity
          emailIdentity.emailIdentityArn,
          // Allow sending via the configuration set
          `arn:aws:ses:${envConfig.awsRegion}:${envConfig.awsAccount}:configuration-set/${props.projectName}-${envConfig.environment}-config`
        ]
      })
    );

    new pinpoint.CfnEmailChannel(this, 'EmailChannel', {
      applicationId: props.applicationId,
      enabled: true,
      fromAddress: props.fromAddress,
      identity: emailIdentity.emailIdentityArn,
      roleArn: pinpointRole.roleArn,
      configurationSet: `${props.projectName}-${props.environment}-config`,

    });
  }
}
