import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ServiceRoleProps } from 'src/types/props';

export class ServiceRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: ServiceRoleProps) {
    super(scope, id);

    // Create the IAM role
    this.role = new iam.Role(this, 'ServiceRole', {
      roleName: `${props.projectName}-${props.environment}-service-role`,
      description: 'Role for accessing S3, KMS, Secrets Manager, CloudWatch, and Pinpoint',
      assumedBy: new iam.ArnPrincipal(`arn:aws:iam::${cdk.Stack.of(this).account}:user/${props.projectName}-${props.environment}-service-user`),
    });

    // S3 permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:ListBucket',
        's3:DeleteObject'
      ],
      resources: [
        `arn:aws:s3:::${props.bucketName}`,
        `arn:aws:s3:::${props.bucketName}/*`
      ],
    }));

    // KMS permissions
    if (props.kmsKeyArn) {
      this.role.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'kms:Decrypt',
          'kms:GenerateDataKey',
          'kms:DescribeKey'
        ],
        resources: [props.kmsKeyArn],
      }));
    }

    // Secrets Manager permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret'
      ],
      resources: props.secretNames.map(secretName =>
        `arn:aws:secretsmanager:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:secret:${secretName}-*`
      ),
    }));

    // CloudWatch permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'cloudwatch:GetMetricData',
        'cloudwatch:GetMetricStatistics',
        'cloudwatch:ListMetrics'
      ],
      resources: ['*'],
    }));

    // CloudWatch Logs permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams',
        'logs:GetLogEvents'
      ],
      resources: [
        `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/pinpoint/*`,
        `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/pinpoint/*:log-stream:*`
      ],
    }));

    // Pinpoint permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'mobiletargeting:CreateCampaign',
        'mobiletargeting:DeleteCampaign',
        'mobiletargeting:GetCampaign',
        'mobiletargeting:ListCampaigns',
        'mobiletargeting:UpdateCampaign',
        'mobiletargeting:CreateSegment',
        'mobiletargeting:DeleteSegment',
        'mobiletargeting:GetSegment',
        'mobiletargeting:ListSegments',
        'mobiletargeting:UpdateSegment',
        'mobiletargeting:SendMessages',
        'mobiletargeting:CreateImportJob',
        'mobiletargeting:GetImportJob',
        'mobiletargeting:ListImportJobs'
      ],
      resources: [
        // Base app ARN
        `arn:aws:mobiletargeting:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:apps/*`,
        // Messages ARN
        `arn:aws:mobiletargeting:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:apps/*/messages`,
        // Campaigns ARN
        `arn:aws:mobiletargeting:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:apps/*/campaigns/*`,
        // Segments ARN
        `arn:aws:mobiletargeting:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:apps/*/segments/*`
      ],
    }));

    // SES permissions for Pinpoint
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail'
      ],
      resources: ['*'], // You might want to restrict this to specific SES identities
    }));
  }
}
