// ═══════════════════════════════════════
// Auth Helpers — AWS Cognito + Amplify v6
// Enterprise-grade: PKCE, SRP, MFA, sessionStorage
// Falls back to demo mode when Cognito is not configured
// ═══════════════════════════════════════

import { authConfig } from "./auth-config";

// ───────────────────────────────────────
// Check if Cognito is properly configured
// ───────────────────────────────────────
function isCognitoConfigured() {
  const poolId = authConfig?.Auth?.Cognito?.userPoolId || "";
  const clientId = authConfig?.Auth?.Cognito?.userPoolClientId || "";
  // Must have real values, not empty or placeholder
  return (
    poolId.length > 5 &&
    clientId.length > 5 &&
    !poolId.includes("XXXXXXXXX") &&
    !clientId.includes("xxxxxxxxxx")
  );
}

// Lazy-loaded Amplify modules (only imported when Cognito is configured)
let _amplifyModules = null;

async function getAmplifyModules() {
  if (_amplifyModules) return _amplifyModules;
  const [amplifyCore, amplifyAuth] = await Promise.all([
    import("aws-amplify"),
    import("aws-amplify/auth"),
  ]);
  _amplifyModules = {
    Amplify: amplifyCore.Amplify,
    amplifySignIn: amplifyAuth.signIn,
    amplifySignUp: amplifyAuth.signUp,
    amplifySignOut: amplifyAuth.signOut,
    amplifyConfirmSignUp: amplifyAuth.confirmSignUp,
    getCurrentUser: amplifyAuth.getCurrentUser,
    fetchAuthSession: amplifyAuth.fetchAuthSession,
    fetchUserAttributes: amplifyAuth.fetchUserAttributes,
    setUpTOTP: amplifyAuth.setUpTOTP,
    verifyTOTPSetup: amplifyAuth.verifyTOTPSetup,
    confirmSignIn: amplifyAuth.confirmSignIn,
    resetPassword: amplifyAuth.resetPassword,
    confirmResetPassword: amplifyAuth.confirmResetPassword,
    signInWithRedirect: amplifyAuth.signInWithRedirect,
  };
  return _amplifyModules;
}

// ───────────────────────────────────────
// Custom sessionStorage token provider
// PenTest: tokens never persist in localStorage
// ───────────────────────────────────────
const sessionStorageAdapter = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
  },
  clear() {
    if (typeof window === "undefined") return;
    // Only clear Cognito keys, not all sessionStorage
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("CognitoIdentityServiceProvider")) {
        keys.push(k);
      }
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  },
};

// ───────────────────────────────────────
// Demo mode helpers (when Cognito is not configured)
// ───────────────────────────────────────
const DEMO_AUTH_KEY = "aries_auth";
const DEMO_USER_KEY = "aries_user";

function getDemoUser() {
  if (typeof window === "undefined") return null;
  try {
    var authFlag = sessionStorage.getItem(DEMO_AUTH_KEY);
    if (!authFlag) return null;
    var userData = sessionStorage.getItem(DEMO_USER_KEY);
    return userData ? JSON.parse(userData) : { userId: "demo", username: "demo@aztra.ai", email: "demo@aztra.ai", name: "Demo User" };
  } catch {
    return null;
  }
}

function setDemoUser(email) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DEMO_AUTH_KEY, "true");
  sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify({ userId: "demo", username: email, email: email, name: email.split("@")[0] }));
}

function clearDemoUser() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DEMO_AUTH_KEY);
  sessionStorage.removeItem(DEMO_USER_KEY);
}

// ───────────────────────────────────────
// Initialize Amplify (call once at app load)
// ───────────────────────────────────────
let _initialized = false;
let _cognitoActive = false;

export function isUsingCognito() {
  return _cognitoActive;
}

export async function initAuth() {
  if (_initialized) return;
  _initialized = true;

  if (!isCognitoConfigured()) {
    // Demo mode — no Cognito SDK loaded
    _cognitoActive = false;
    return;
  }

  try {
    var mods = await getAmplifyModules();
    mods.Amplify.configure(authConfig, {
      ssr: false,
      Storage: {
        CognitoIdentityServiceProvider: sessionStorageAdapter,
      },
    });
    _cognitoActive = true;
  } catch {
    _cognitoActive = false;
  }
}

// ───────────────────────────────────────
// Session / User
// ───────────────────────────────────────
export async function getSession() {
  if (!_cognitoActive) {
    // Demo mode
    return getDemoUser();
  }
  try {
    var mods = await getAmplifyModules();
    const user = await mods.getCurrentUser();
    const attributes = await mods.fetchUserAttributes();
    const session = await mods.fetchAuthSession();
    return {
      userId: user.userId,
      username: user.username,
      email: attributes.email || "",
      name: attributes.name || attributes.email || "",
      tokens: {
        accessToken: session.tokens?.accessToken?.toString(),
        idToken: session.tokens?.idToken?.toString(),
      },
    };
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  if (!_cognitoActive) return null;
  try {
    var mods = await getAmplifyModules();
    const session = await mods.fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch {
    return null;
  }
}

// ───────────────────────────────────────
// Email/Password Sign-In (SRP)
// Passwords never sent in plaintext
// ───────────────────────────────────────
export async function signInWithEmail(email, password) {
  if (!_cognitoActive) {
    // Demo mode — accept any credentials
    setDemoUser(email);
    return { isSignedIn: true, nextStep: null };
  }
  var mods = await getAmplifyModules();
  const result = await mods.amplifySignIn({
    username: email,
    password: password,
    options: {
      authFlowType: "USER_SRP_AUTH",
    },
  });

  return {
    isSignedIn: result.isSignedIn,
    nextStep: result.nextStep,
  };
}

// ───────────────────────────────────────
// Federated SSO (Google / Microsoft)
// ───────────────────────────────────────
export async function signInWithProvider(provider) {
  if (!_cognitoActive) {
    // Demo mode — just sign in as demo user
    setDemoUser("sso-user@" + provider.toLowerCase() + ".com");
    return;
  }
  var mods = await getAmplifyModules();
  await mods.signInWithRedirect({
    provider: provider === "Microsoft" ? { custom: "Microsoft" } : provider,
  });
}

// ───────────────────────────────────────
// Sign Out
// ───────────────────────────────────────
export async function signOut() {
  if (!_cognitoActive) {
    clearDemoUser();
    return;
  }
  try {
    var mods = await getAmplifyModules();
    await mods.amplifySignOut({ global: true });
  } catch {
    try {
      var mods2 = await getAmplifyModules();
      await mods2.amplifySignOut();
    } catch {
      // swallow
    }
  }
  sessionStorageAdapter.clear();
}

// ───────────────────────────────────────
// Sign Up + Confirmation
// ───────────────────────────────────────
export async function signUp(email, password) {
  if (!_cognitoActive) {
    // Demo mode
    return { isSignUpComplete: false, nextStep: { signUpStep: "CONFIRM_SIGN_UP" } };
  }
  var mods = await getAmplifyModules();
  const result = await mods.amplifySignUp({
    username: email,
    password: password,
    options: {
      userAttributes: {
        email: email,
      },
    },
  });
  return result;
}

export async function confirmSignUpCode(email, code) {
  if (!_cognitoActive) {
    // Demo mode — accept any code
    return { isSignUpComplete: true };
  }
  var mods = await getAmplifyModules();
  const result = await mods.amplifyConfirmSignUp({
    username: email,
    confirmationCode: code,
  });
  return result;
}

// ───────────────────────────────────────
// MFA — TOTP Setup & Verification
// ───────────────────────────────────────
export async function setupMFA() {
  if (!_cognitoActive) {
    return { secretKey: "DEMO-SECRET-KEY", qrUri: "" };
  }
  var mods = await getAmplifyModules();
  const totpSetup = await mods.setUpTOTP();
  const setupUri = totpSetup.getSetupUri("Aries");
  return {
    secretKey: totpSetup.sharedSecret,
    qrUri: setupUri.toString(),
  };
}

export async function verifyMFA(code) {
  if (!_cognitoActive) return;
  var mods = await getAmplifyModules();
  await mods.verifyTOTPSetup({ code: code });
}

export async function handleMFAChallenge(totpCode) {
  if (!_cognitoActive) {
    return { isSignedIn: true, nextStep: null };
  }
  var mods = await getAmplifyModules();
  const result = await mods.confirmSignIn({
    challengeResponse: totpCode,
  });
  return {
    isSignedIn: result.isSignedIn,
    nextStep: result.nextStep,
  };
}

// ───────────────────────────────────────
// Password Reset
// ───────────────────────────────────────
export async function forgotPassword(email) {
  if (!_cognitoActive) return;
  var mods = await getAmplifyModules();
  await mods.resetPassword({ username: email });
}

export async function confirmNewPassword(email, code, newPassword) {
  if (!_cognitoActive) return;
  var mods = await getAmplifyModules();
  await mods.confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword: newPassword,
  });
}

// ───────────────────────────────────────
// Error Helpers
// ───────────────────────────────────────
export function getAuthErrorMessage(error) {
  const name = error?.name || "";
  const message = error?.message || "";

  switch (name) {
    case "UserNotConfirmedException":
      return "Please verify your email address first. Check your inbox for a confirmation code.";
    case "NotAuthorizedException":
      return "Invalid email or password. Please try again.";
    case "UserNotFoundException":
      return "No account found with this email address.";
    case "UsernameExistsException":
      return "An account with this email already exists.";
    case "LimitExceededException":
      return "Too many attempts. Please wait a moment and try again.";
    case "CodeMismatchException":
      return "Invalid verification code. Please try again.";
    case "ExpiredCodeException":
      return "Verification code has expired. Please request a new one.";
    case "InvalidPasswordException":
      return "Password must be at least 12 characters with uppercase, lowercase, numbers, and symbols.";
    case "InvalidParameterException":
      if (message.includes("password")) {
        return "Password must be at least 12 characters with uppercase, lowercase, numbers, and symbols.";
      }
      return "Invalid input. Please check your entries.";
    default:
      if (message.includes("Network")) {
        return "Network error. Please check your connection.";
      }
      return message || "An unexpected error occurred. Please try again.";
  }
}
