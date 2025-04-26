// constructs/service-user.ts
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ServiceUserProps {
  projectName: string;
  environment: string;
  serviceRoleArn: string;
}

export class ServiceUser extends Construct {
  public readonly user: iam.User;

  constructor(scope: Construct, id: string, props: ServiceUserProps) {
    super(scope, id);

    // Create a dedicated service user
    this.user = new iam.User(this, 'ServiceUser', {
      userName: `${props.projectName}-${props.environment}-service-user`,
    });

    // Add only the permission to assume the specific service role
    const assumeRolePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [props.serviceRoleArn],
    });

    this.user.addToPolicy(assumeRolePolicy);
  }
}
