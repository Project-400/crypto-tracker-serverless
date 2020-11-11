module.exports = {
    tables: [
        {
            TableName: `CryptoTracker-GENERAL`,
            KeySchema: [
                {AttributeName: 'pk', KeyType: 'HASH'},
                {AttributeName: 'sk', KeyType: 'RANGE'},
            ],
            AttributeDefinitions: [
                {AttributeName: 'pk', AttributeType: 'S'},
                {AttributeName: 'sk', AttributeType: 'S'},
                // {AttributeName: 'sk2', AttributeType: 'S'},
                // {AttributeName: 'sk3', AttributeType: 'S'},
                // {AttributeName: 'entity', AttributeType: 'S'}
            ],
            ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
        },
    ],
};
