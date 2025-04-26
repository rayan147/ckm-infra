import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { MonitoringProps } from '../types/props';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class Monitoring extends Construct {
  public readonly alarmTopic: sns.Topic

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    this.alarmTopic = this.createAlarmTopic(props);
    this.createAlarms(props);
  }

  private createAlarmTopic(props: MonitoringProps): sns.Topic {
    const topic = new sns.Topic(this, 'AlarmTopic', {
      displayName: `${props.projectName}-${props.environment}-pinpoint-alarms`,
    });

    props.alertEmailAddresses.forEach((email) => {
      topic.addSubscription(new subscriptions.EmailSubscription(email));
    });
    return topic;
  }

  private createAlarms(props: MonitoringProps): void {
    // Bounce Rate Alarm
    const bounceMetric = new cloudwatch.Metric({
      namespace: 'AWS/Pinpoint',
      metricName: 'BounceRate',
      dimensionsMap: {
        ApplicationId: props.applicationId,
        Channel: 'EMAIL',
      },
      period: cdk.Duration.minutes(5),
      statistic: 'Average',
    });

    const bounceAlarm = new cloudwatch.Alarm(this, 'BounceRateAlarm', {
      metric: bounceMetric,
      threshold: props.bounceRateThreshold,
      evaluationPeriods: 1,
      alarmDescription: `Bounce rate exceeded ${props.bounceRateThreshold}% for ${props.projectName} in ${props.environment}`,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    bounceAlarm.addAlarmAction(new cw_actions.SnsAction(this.alarmTopic));

    // Complaint Rate Alarm
    const complaintMetric = new cloudwatch.Metric({
      namespace: 'AWS/Pinpoint',
      metricName: 'ComplaintRate',
      dimensionsMap: {
        ApplicationId: props.applicationId,
        Channel: 'EMAIL',
      },
      period: cdk.Duration.minutes(5),
      statistic: 'Average',
    });

    const complaintAlarm = new cloudwatch.Alarm(this, 'ComplaintRateAlarm', {
      metric: complaintMetric,
      threshold: props.complaintRateThreshold,
      evaluationPeriods: 1,
      alarmDescription: `Complaint rate exceeded ${props.complaintRateThreshold}% for ${props.projectName} in ${props.environment}`,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    complaintAlarm.addAlarmAction(new cw_actions.SnsAction(this.alarmTopic));
  }
}

