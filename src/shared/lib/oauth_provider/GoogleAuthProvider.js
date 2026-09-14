// GoogleAuthProvider.js

const axios = require("axios");
const { OAuth2Client } = require('google-auth-library');

class GoogleAuthProvider {
    constructor(config = {}) {
        this.clientId = config.clientId || process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
        this.redirectUri = config.redirectUri || `${process.env.BASE_URL}/api/v1/user/auth/google/callback`;
        this.authApiUrl = config.authApiUrl || 'https://oauth2.googleapis.com';
        this.wwwApiUrl = config.wwwApiUrl || 'https://www.googleapis.com';

        this.client = new OAuth2Client(this.clientId);
    }

    /**
     * Récupère le profil utilisateur Google
     */
    async getProfile(credentials) {
        const { code, access_token, id_token } = credentials;

        if (id_token) {
            return this.getProfileFromIdToken(id_token);
        }

        if (access_token) {
            return this.getProfileFromAccessToken(access_token);
        }

        if (code) {
            return this.getProfileFromCode(code);
        }

        throw new Error("Credential manquante: code, access_token ou id_token requis");
    }

    /**
     * Vérifie et décode un ID token
     */
    async getProfileFromIdToken(id_token) {
        const ticket = await this.client.verifyIdToken({
            idToken: id_token,
            audience: this.clientId,
        });

        const payload = ticket.getPayload();

        return {
            id: payload.sub,
            email: payload.email,
            given_name: payload.given_name,
            family_name: payload.family_name,
            picture: payload.picture,
            verified_email: payload.email_verified,
        };
    }

    /**
     * Récupère le profil via access token
     */
    async getProfileFromAccessToken(access_token) {
        const { data } = await axios.get(
            `${this.wwwApiUrl}/oauth2/v1/userinfo`, {
                headers: { Authorization: `Bearer ${access_token}` }
            }
        );

        return data;
    }

    /**
     * Échange le code contre un access token puis récupère le profil
     */
    async getProfileFromCode(code) {
        const { data } = await axios.post(
            `${this.authApiUrl}/token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
            }
        );

        return this.getProfileFromAccessToken(data.access_token);
    }

    /**
     * Échange le code contre les tokens (access + refresh)
     */
    async exchangeCodeForTokens(code) {
        const { data } = await axios.post(
            `${this.authApiUrl}/token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code',
            }
        );

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            id_token: data.id_token,
            expires_in: data.expires_in,
        };
    }

    /**
     * Rafraîchit un access token
     */
    async refreshAccessToken(refresh_token) {
        const { data } = await axios.post(
            `${this.authApiUrl}/token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token,
                grant_type: 'refresh_token',
            }
        );

        return {
            access_token: data.access_token,
            expires_in: data.expires_in,
        };
    }

    /**
     * Révoque un token
     */
    async revokeToken(token) {
        await axios.post(
            `${this.authApiUrl}/revoke`,
            `token=${token}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        return true;
    }

    /**
     * Génère l'URL d'autorisation Google
     */
    getAuthUrl(scopes = ['profile', 'email'], state = '') {
        const scopeString = scopes.map(s =>
            s.startsWith('https://') ? s : `https://www.googleapis.com/auth/${s}`
        ).join(' ');

        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: scopeString,
            access_type: 'offline',
            state,
        });

        return `${this.authApiUrl}/auth?${params.toString()}`;
    }
}

module.exports = GoogleAuthProvider;