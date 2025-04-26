export enum Environment {
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod'
}

export interface IEnvironmentConfig {
  projectName: string;
  fromEmailAddress: string;
  replyToEmailAddress: string;
  bounceRateThreshold: number;
  complaintRateThreshold: number;
  alertEmailAddresses: string[];
  awsAccount: string;
  awsRegion: string;
}

