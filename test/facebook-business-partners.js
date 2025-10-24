import 'dotenv/config';
import open from 'open';

const APP_ID = process.env.FACEBOOK_APP_ID;
const REDIRECT_URI = 'http://localhost:3000/api/facebook/callback/'; 
const SCOPE = 'ads_management';

const oauthUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPE}`;

console.log('Opening Facebook OAuth dialog...');
open(oauthUrl);