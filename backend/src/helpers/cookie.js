import config from '../config/index.js';
import { COOKIE_NAMES } from '../constants/tokens.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  maxAge: SEVEN_DAYS,
  path: '/',
});

/** Refresh token is already a signed JWT — httpOnly cookie is sufficient. */
export const setRefreshCookie = (res, token) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, refreshCookieOptions());
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshCookieOptions());
};

export const readRefreshCookie = (req) => req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
