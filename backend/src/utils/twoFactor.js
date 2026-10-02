import { generateSecret, generate, verify, generateURI } from "otplib";
import QRCode from "qrcode";

const ISSUER = "CTI Threat Platform";

/**
 * Génère un nouveau secret TOTP et l'URL otpauth:// correspondante,
 * compatible avec Google Authenticator, Microsoft Authenticator, Authy, etc.
 */
export function generateTwoFactorSecret(email) {
  const secret = generateSecret();
  const otpauthUrl = generateURI({ secret, label: email, issuer: ISSUER });
  return { secret, otpauthUrl };
}

/** Convertit une URL otpauth:// en image QR code encodée en data URL (PNG base64). */
export async function generateQrCodeDataUrl(otpauthUrl) {
  return QRCode.toDataURL(otpauthUrl);
}

/** Vérifie qu'un code à 6 chiffres saisi par l'utilisateur correspond au secret stocké. */
export async function verifyTwoFactorCode(code, secret) {
  if (!code || !secret) return false;
  try {
    const result = await verify({ token: code.toString().trim(), secret });
    return result.valid === true;
  } catch {
    return false;
  }
}
