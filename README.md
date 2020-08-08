# Serverless Template

A template for a AWS Lambda Serverless API
Includes the auto setup for:
- DynamoDB (One-Table Design)
- Cognito
- API Gateway
- Custom WebSockets (PubSub system)

## Setup

- Add the project name to `/serverless.common.yml`
- Copy the `/environment/env.ts` to `/environment/env.tpl.ts` and fill in the values 
    (You may need to deploy the application to get some of these values)
- Add the table name to `/services/api-shared-modules/src/models/DynamoDBItem.ts`
- Preferably move objects from `/services/api-shared-modules/src/types/objects.ts` to an external NPM package 
    (Define objects in the package to keep consistent with client)

## Serverless Offline

If you are running the API offline, to allow websockets to work, you need to have
`https://localhost:3001` as the offline URL in the .env file.

```
sls offline
```

