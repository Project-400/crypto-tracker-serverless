export const WEBSOCKET_ENDPOINT: string = process.env.IS_OFFLINE ?
	'http://localhost:3001' :
	'{{ LIVE_WEBSOCKET_ENDPOINT }}';

export const AWS_S3_SECRET_KEY: string = '{{ AWS_S3_SECRET_KEY }}';

export const USER_POOL_ID: string = '{{ COGNITO_USER_POOL_ID }}';
export const USER_POOL_URL: string = `{{ USER_POOL_URL }}/${USER_POOL_ID}`;

export const BINANCE_API_KEY: string = '{{ BINANCE_API_KEY }}';
export const BINANCE_API_SECRET_KEY: string = '{{ BINANCE_API_SECRET_KEY }}';
export const BINANCE_API_HOST: string = '{{ BINANCE_API_HOST }}';
export const BINANCE_API_DOMAIN: string = '{{ BINANCE_API_DOMAIN }}';
