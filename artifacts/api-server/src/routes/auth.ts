import * as oidc from "openid-client";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  ISSUER_URL,
  type SessionData,
} from "../lib/auth";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;

const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const userData = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: (claims.profile_image_url as string) || null,
  };

  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user;
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(GetCurrentAuthUserResponse.parse({ user: req.user ?? null }));
});

router.get("/login", async (req: Request, res: Response) => {
  try {
    const config = await getOidcConfig();
    const origin = getOrigin(req);
    const callbackUrl = new URL("/api/callback", origin);

    const returnTo = getSafeReturnTo(req.query.returnTo);

    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();

    const authUrl = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl.toString(),
      response_type: "code",
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });

    setOidcCookie(res, "code_verifier", codeVerifier);
    setOidcCookie(res, "state", state);
    setOidcCookie(res, "nonce", nonce);
    setOidcCookie(res, "return_to", returnTo);

    res.redirect(authUrl.toString());
  } catch (err) {
    req.log?.error({ err }, "Login initiation error");
    res.status(500).send("Login failed");
  }
});

router.get("/callback", async (req: Request, res: Response) => {
  try {
    const config = await getOidcConfig();
    const origin = getOrigin(req);

    const currentUrl = new URL(req.originalUrl, origin);

    const code_verifier = req.cookies?.code_verifier;
    const state = req.cookies?.state;
    const nonce = req.cookies?.nonce;
    const returnTo = getSafeReturnTo(req.cookies?.return_to);

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: code_verifier,
      expectedNonce: nonce,
      expectedState: state,
    });

    const claims = tokens.claims();
    if (!claims) {
      res.redirect("/api/login");
      return;
    }

    const dbUser = await upsertUser(
      claims as unknown as Record<string, unknown>,
    );

    const now = Math.floor(Date.now() / 1000);
    const sessionData: SessionData = {
      user: {
        id: dbUser.id,
        email: dbUser.email ?? null,
        firstName: dbUser.firstName ?? null,
        lastName: dbUser.lastName ?? null,
        profileImageUrl: dbUser.profileImageUrl ?? null,
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiresIn()
        ? now + tokens.expiresIn()!
        : claims.exp,
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);

    res.clearCookie("code_verifier");
    res.clearCookie("state");
    res.clearCookie("nonce");
    res.clearCookie("return_to");

    res.redirect(returnTo);
  } catch (err) {
    req.log?.error({ err }, "OIDC callback error");
    res.redirect("/api/login");
  }
});

router.get("/logout", async (req: Request, res: Response) => {
  try {
    const sid = getSessionId(req);
    await clearSession(res, sid);

    const config = await getOidcConfig();
    const origin = getOrigin(req);
    const postLogoutUrl = new URL("/", origin);

    const endSessionUrl = oidc.buildEndSessionUrl(config, {
      post_logout_redirect_uri: postLogoutUrl.toString(),
    });

    res.redirect(endSessionUrl.toString());
  } catch {
    res.redirect("/");
  }
});

router.post(
  "/mobile-auth/token-exchange",
  async (req: Request, res: Response) => {
    try {
      const body = ExchangeMobileAuthorizationCodeBody.parse(req.body);
      const config = await getOidcConfig();

      const callbackUrl = new URL(body.redirect_uri);
      const fakeCurrentUrl = new URL(callbackUrl.toString());
      fakeCurrentUrl.searchParams.set("code", body.code);
      fakeCurrentUrl.searchParams.set("state", body.state);

      const tokens = await oidc.authorizationCodeGrant(config, fakeCurrentUrl, {
        pkceCodeVerifier: body.code_verifier,
        expectedNonce: body.nonce ?? undefined,
        expectedState: body.state,
        idTokenExpected: true,
      });

      const claims = tokens.claims();
      if (!claims) {
        res.status(401).json({ error: "No claims in ID token" });
        return;
      }

      const dbUser = await upsertUser(
        claims as unknown as Record<string, unknown>,
      );

      const now = Math.floor(Date.now() / 1000);
      const sessionData: SessionData = {
        user: {
          id: dbUser.id,
          email: dbUser.email ?? null,
          firstName: dbUser.firstName ?? null,
          lastName: dbUser.lastName ?? null,
          profileImageUrl: dbUser.profileImageUrl ?? null,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
      };

      const sid = await createSession(sessionData);
      res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
    } catch (err) {
      req.log?.error({ err }, "Mobile token exchange error");
      res.status(500).json({ error: "Token exchange failed" });
    }
  },
);

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;
