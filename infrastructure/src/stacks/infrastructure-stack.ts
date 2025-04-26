import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import { ServiceRole } from '../constructs/service-role';
import { Environment } from '../types/environment';
import { Construct } from 'constructs';
import { EmailChannel } from '../constructs/email-channel';
import { InfrastructureStackProps } from 'src/types/props';
import { Monitoring } from '../constructs/monitoring';
import { ServiceUser } from '../constructs/service-user';

export class InfrastructureStack extends cdk.Stack {
  public readonly pinpointProject: pinpoint.CfnApp;
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);
    // Create Pinpoint Project
    this.pinpointProject = new pinpoint.CfnApp(this, 'PinpointProject', {
      name: `${props.projectName}-${props.environment}`,
    });

    // Create Email Channel
    new EmailChannel(this, 'EmailChannel', {
      applicationId: this.pinpointProject.ref,
      projectName: props.projectName,
      environment: props.environment,
      fromAddress: props.fromAddress,
    });

    // Create Monitoring
    new Monitoring(this, 'Monitoring', {
      projectName: props.projectName,
      environment: props.environment,
      applicationId: this.pinpointProject.ref,
      bounceRateThreshold: props.bounceRateThreshold,
      complaintRateThreshold: props.complaintRateThreshold,
      alertEmailAddresses: props.alertEmailAddresses,
    });

    // Create KMS Key for encryption
    const kmsKey = new kms.Key(this, 'EncryptionKey', {
      enableKeyRotation: true,
      alias: `${props.projectName}-${props.environment}-key`,
      description: `KMS key for ${props.projectName} ${props.environment}`,
    });

    // Create S3 Bucket
    const bucket = new s3.Bucket(this, 'StorageBucket', {
      bucketName: `${props.projectName}-${props.environment}-storage`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: kmsKey,
      removalPolicy: props.environment === Environment.PROD
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.environment !== Environment.PROD,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });


    // Create Service Role with all necessary permissions
    const serviceRole = new ServiceRole(this, 'ServiceRole', {
      projectName: props.projectName,
      environment: props.environment,
      bucketName: bucket.bucketName,
      kmsKeyArn: kmsKey.keyArn,
      secretNames: [
        `${props.projectName}/${props.environment}/env-variables`,
      ],
    });

    // Create Service User
    const serviceUser = new ServiceUser(this, 'ServiceUser', {
      projectName: props.projectName,
      environment: props.environment,
      serviceRoleArn: serviceRole.role.roleArn,
    });

    // Add tags to all resources
    const tags: { [key: string]: string } = {
      Environment: props.environment,
      Project: props.projectName,
      ManagedBy: 'CDK',
    };

    Object.entries(tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'Name of the created S3 bucket',
    });

    new cdk.CfnOutput(this, 'PinpointAppId', {
      value: this.pinpointProject.ref,
      description: 'ID of the Pinpoint application',
    });

    new cdk.CfnOutput(this, 'KmsKeyArn', {
      value: kmsKey.keyArn,
      description: 'ARN of the KMS key',
    });

    new cdk.CfnOutput(this, 'ServiceRoleArn', {
      value: serviceRole.role.roleArn,
      description: 'ARN of the service role',
    });
    // Output the user ARN
    new cdk.CfnOutput(this, 'ServiceUserName', {
      value: serviceUser.user.userName,
      description: 'Name of the service user',
    });
  }
}

