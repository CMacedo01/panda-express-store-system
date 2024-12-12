import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { GITHUB_ID, GITHUB_SECRET , GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET, AUTH_TRUST_HOST} from "$env/static/private";

//
export const { handle } = SvelteKitAuth(async (event) => {
    const authOptions = {
        providers: [
            GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET}),
            Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })
        ],
        secret: AUTH_SECRET,
        trustHost: true,
        callbacks: {
            async jwt({token, account}) {
                if(account){
                    token.accessToken = account.access_Token;
                }
                return token;
            },
            async session({ session, token, user }){
                //@ts-ignore
                session.access_token = token.accessToken;
                return session;
            }
    }}
    return authOptions
})

