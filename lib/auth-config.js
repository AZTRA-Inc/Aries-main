// ═══════════════════════════════════════
// AWS Cognito Configuration
// ═══════════════════════════════════════

export const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [
            typeof window !== "undefined" ? window.location.origin + "/" : "https://aries.aztra.ai/",
          ],
          redirectSignOut: [
            typeof window !== "undefined" ? window.location.origin + "/login/" : "https://aries.aztra.ai/login/",
          ],
          responseType: "code", // PKCE — no client secret
        },
      },
    },
  },
};
