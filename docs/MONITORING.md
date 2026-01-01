# Monitoring Guide

## Overview

This guide covers monitoring setup, dashboards, alerts, and best practices for the Philanthropical platform.

## Monitoring Stack

### Application Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Custom Analytics**: Business metrics and user behavior
- **Performance Monitoring**: Core Web Vitals, API response times

### Infrastructure Monitoring
- **Supabase**: Database performance and health
- **Vercel**: Frontend deployment and performance
- **Tenderly**: Blockchain transaction monitoring

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: (Datadog, LogRocket, or similar)
- **Error Logs**: Sentry integration

## Key Metrics

### Application Metrics
- **Error Rate**: < 0.1%
- **API Response Time**: < 200ms (95th percentile)
- **Page Load Time**: < 2 seconds (95th percentile)
- **Uptime**: > 99.9%

### Business Metrics
- **Total Donations**: Count and amount
- **Active Charities**: Number of verified charities
- **Verification Rate**: Percentage of successful verifications
- **Fraud Detection**: Number and severity of alerts

### Database Metrics
- **Query Performance**: < 100ms (95th percentile)
- **Connection Pool**: Usage and limits
- **Materialized View Refresh**: Status and duration

## Dashboards

### Main Dashboard
- Real-time metrics
- Error rate
- API response times
- Active users
- Recent donations

### Database Dashboard
- Query performance
- Connection pool usage
- Slow queries
- Materialized view status

### Blockchain Dashboard
- Transaction volume
- Gas costs
- Contract events
- Failed transactions

## Alerts

### Critical Alerts
- Platform down
- Error rate > 1%
- Database unavailable
- API response time > 1s

### Warning Alerts
- Error rate > 0.5%
- API response time > 500ms
- Database query time > 200ms
- High fraud alert rate

### Alert Channels
- **PagerDuty/Opsgenie**: Critical alerts
- **Slack**: Warning alerts and notifications
- **Email**: Daily summaries

## Health Checks

### API Health Endpoint
`GET /api/health`

Returns:
- Overall status
- Database connectivity
- Service status

### Metrics Endpoint
`GET /api/metrics`

Returns:
- Application metrics
- Database metrics
- System metrics

## Logging Best Practices

### Structured Logging
```typescript
log({
  level: "info",
  message: "Donation processed",
  correlationId: "abc123",
  metadata: {
    donationId: "123",
    amount: "1000",
  },
});
```

### Log Levels
- **ERROR**: Errors requiring attention
- **WARN**: Warnings that may need investigation
- **INFO**: Important events
- **DEBUG**: Detailed debugging information

### Correlation IDs
- Include in all logs
- Pass through request chain
- Use for tracing

## Performance Monitoring

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### API Performance
- Track response times
- Monitor slow endpoints
- Alert on degradation

### Database Performance
- Monitor query times
- Track slow queries
- Alert on connection issues

## Monitoring Tools Setup

### Sentry
1. Create Sentry project
2. Configure DSN in environment variables
3. Set up alerts
4. Configure release tracking

### Custom Analytics
1. Set up analytics provider (Mixpanel/PostHog)
2. Configure tracking events
3. Set up dashboards
4. Configure alerts

### Database Monitoring
1. Enable Supabase monitoring
2. Set up query performance tracking
3. Configure connection pool monitoring
4. Set up alerts

## Alert Configuration

### Error Rate Alert
```yaml
condition: error_rate > 0.01
duration: 5 minutes
action: page_oncall
```

### Performance Alert
```yaml
condition: p95_response_time > 500ms
duration: 10 minutes
action: notify_slack
```

### Database Alert
```yaml
condition: query_time > 200ms
duration: 5 minutes
action: notify_team
```

## Maintenance

### Daily
- Review error logs
- Check alert status
- Review performance metrics

### Weekly
- Review dashboard trends
- Analyze error patterns
- Update alert thresholds

### Monthly
- Review monitoring effectiveness
- Update dashboards
- Optimize alert rules

## Troubleshooting

### High Error Rate
1. Check Sentry for error details
2. Review recent deployments
3. Check dependencies
4. Review logs

### Performance Issues
1. Check API response times
2. Review database queries
3. Check resource usage
4. Review recent changes

### Missing Metrics
1. Verify instrumentation
2. Check data collection
3. Review configuration
4. Check service status

