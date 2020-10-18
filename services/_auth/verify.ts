import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { USER_POOL_URL } from '../../environment/env';

export default class Auth {

	public static VerifyToken = (token: string): TokenVerification => {
		return { sub: 'fakeuserid350350' };

		const jwks: any = {
			keys: [
				{
					alg: 'RS256',
					e: 'AQAB',
					kid: '2Ya2VzkJzFO9vkyZRyRMFQv+l8lc1pTJUWZDti7LASU=',
					kty: 'RSA',
					n: 'ig5dE8AWdcY8EhDGPTDaDvVWPpAIGo4jLMgOOPRPZMqwQKrrvaidFRy3gwjm6pdy9RKNWPsze2o2rN3f9fT50umXRLvxoChjR22TB_D1Tr8pd3k7QRXa6PPJ2Pj_bbhy5vO2vr3RmmaOgek7Ki6ax0XfV9mjffFPoGs9yxIUjnMYp2EvfmMDIzGMoOy5xbLEj1n3dMvBV7RVE2GM1x4BO9G_IQplplSBlxxP5bWSPXwRmGl6nnTvzL67XHXfJRDGqaIwloPGYs3vuLk4tD_QW5UAqIEiq8K4N8Fl1BV6pD6BohfeNSTpw-WNsjWfZS7WPcOe_FhDo5l26AWFzfIp4w',
					use: 'sig'
				},
				{
					alg: 'RS256',
					e: 'AQAB',
					kid: 'nJjeM3OwTjUlxoyit8STCOaNIydIa9Xm4AWIBJBxyt0=',
					kty: 'RSA',
					n: 'wSX5oYRsQn2xRuQ-KHxH-3vQ2n1oUXZ9wOGo8nK84poJe3E2kzhcNxJh6USTCI3uZUmZpAFsYxN3tOpzlM_Zeom0BpuSE60-CIvYOQZIhYkHRM7hym-W-w7exlYUJ-SSL7rYFSOt-_gF-kWKJxyGpNIqoGc1uUGitHO69qtbuC6EkFvpGgqFc5svOaHqsQdoGyI5BWCnXQZzpsrIwVMGd6TRAOBEeLU9R_eM56h3ZVhDNhthss8U3HI_pqo8PnZNf5AHhsD2mXdOcLmif21L5-ckbmANiyOWLntMg276A4t_TKpAIoK34PupVr5vpLiqSpiu0Fb_AzHiyjncffqbuw',
					use: 'sig'
				}
			]
		};
		const pems: any = jwks.keys.map((k: { [key: string]: string }) => ({ kid: k.kid, pem: jwkToPem({ kty: k.kty, n: k.n, e: k.e }) }));
		const decodedJwt: any = jwt.decode(token, { complete: true });

		if (decodedJwt.payload.iss !== USER_POOL_URL) return { error: true, message: 'Invalid Issuer' };
		if (decodedJwt.payload.token_use !== 'access') return { error: true, message: 'Not an access token' };

		const pem: any = pems.find((p: any) => p.kid === decodedJwt.header.kid).pem;

		try {
			return jwt.verify(token, pem, { algorithms: ['RS256'] });
		} catch (e) {
			return { error: true, message: e.message };
		}
	}

}

export interface TokenVerification {
	sub?: string;
	error?: boolean;
	message?: string;
}
