import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';

import { env } from '../env.js';

const verifySchema = z
  .object({
    credential: z.string().min(10).optional(),
    code: z.string().min(10).optional()
  })
  .refine((value) => Boolean(value.credential || value.code), {
    message: 'Provide a Google ID token or authorization code.'
  });

export const authRouter = Router();

authRouter.post('/verify', async (req, res, next) => {
  try {
    const payload = verifySchema.parse(req.body);
    if (!env.googleClientId) {
      return res
        .status(501)
        .json({ error: 'Google client credentials are not configured on the server.' });
    }

	    if (payload.code) {
	      if (!env.googleClientSecret) {
	        return res
	          .status(501)
	          .json({ error: 'Google client secret is not configured on the server.' });
	      }

	      const oauthClient = new OAuth2Client(
	        env.googleClientId,
	        env.googleClientSecret,
	        env.googleRedirectUri
	      );
	      const { tokens } = await oauthClient.getToken({
	        code: payload.code,
	        redirect_uri: env.googleRedirectUri
	      });
	      if (!tokens.id_token) {
	        return res.status(502).json({ error: 'Google did not return an ID token.' });
	      }
	      const ticket = await oauthClient.verifyIdToken({
	        idToken: tokens.id_token,
	        audience: env.googleClientId
	      });
	      const idPayload = ticket.getPayload();
	      if (!idPayload || !idPayload.sub) {
	        return res.status(401).json({ error: 'Invalid token payload.' });
	      }
	      const hasRefreshToken = Boolean(tokens.refresh_token);
	      if (hasRefreshToken) {
	        res.cookie('quorvium_google_refresh', tokens.refresh_token, {
	          httpOnly: true,
	          secure: env.isProduction,
	          sameSite: 'lax',
	          path: '/',
	          maxAge: 1000 * 60 * 60 * 24 * 30
	        });
	      }
	      if (tokens.access_token) {
	        res.cookie('quorvium_google_access', tokens.access_token, {
	          httpOnly: true,
	          secure: env.isProduction,
	          sameSite: 'lax',
	          path: '/',
	          maxAge:
	            tokens.expiry_date && tokens.expiry_date > Date.now()
	              ? tokens.expiry_date - Date.now()
	              : 1000 * 60 * 60
	        });
	      }
	      return res.json({
	        user: {
	          id: idPayload.sub,
	          name: idPayload.name,
	          email: idPayload.email,
	          avatarUrl: idPayload.picture
	        },
	        tokens: {
	          hasRefreshToken
	        }
	      });
	    }

	    const client = new OAuth2Client(env.googleClientId);
	    const ticket = await client.verifyIdToken({
	      idToken: payload.credential!,
	      audience: env.googleClientId
	    });
	    const idPayload = ticket.getPayload();
	    if (!idPayload || !idPayload.sub) {
	      return res.status(401).json({ error: 'Invalid token payload.' });
	    }
	    res.json({
	      user: {
	        id: idPayload.sub,
	        name: idPayload.name,
	        email: idPayload.email,
	        avatarUrl: idPayload.picture
	      },
	      tokens: {
	        hasRefreshToken: false
	      }
	    });
  } catch (error) {
    next(error);
  }
});
