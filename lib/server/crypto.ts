import crypto from 'crypto';

export type Algorithm = 'RSA-PSS' | 'DSA' | 'ECDSA' | 'Ed25519';

export const algorithms: Record<Algorithm, { name: string; keySize: string; description: string }> = {
  'RSA-PSS': {
    name: 'RSA-PSS',
    keySize: '2048 bits',
    description: 'RSA probabilistic signature scheme — widely supported, larger signatures',
  },
  DSA: {
    name: 'DSA',
    keySize: '2048 bits',
    description: 'Digital Signature Algorithm — FIPS standard, fixed-size signatures',
  },
  ECDSA: {
    name: 'ECDSA',
    keySize: 'P-256',
    description: 'Elliptic Curve DSA — compact signatures, high security per bit',
  },
  Ed25519: {
    name: 'Ed25519',
    keySize: '256 bits',
    description: 'Edwards-curve deterministic signatures — fastest, most modern',
  },
};

export function hashDocument(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateKeyPair(algorithm: Algorithm) {
  if (algorithm === 'RSA-PSS')
    return crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicExponent: 0x10001 });
  if (algorithm === 'DSA')
    return crypto.generateKeyPairSync('dsa', { modulusLength: 2048, divisorLength: 256 });
  if (algorithm === 'ECDSA')
    return crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return crypto.generateKeyPairSync('ed25519');
}

export function sign(
  data: Buffer,
  algorithm: Algorithm
): { signature: Buffer; publicKey: string; signingTime: number; keySize: number } {
  const started = process.hrtime.bigint();
  const keys = generateKeyPair(algorithm);

  let sig: Buffer;
  if (algorithm === 'Ed25519') {
    sig = crypto.sign(null, data, keys.privateKey);
  } else {
    const signer = crypto.createSign('sha256');
    signer.update(data);
    signer.end();
    if (algorithm === 'RSA-PSS') {
      sig = signer.sign({
        key: keys.privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      });
    } else {
      sig = signer.sign(keys.privateKey);
    }
  }

  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  const publicKey = keys.publicKey
    .export({ type: 'spki', format: 'pem' })
    .toString();

  return { signature: sig, publicKey, signingTime: ms, keySize: Buffer.byteLength(publicKey) };
}

export function verify(
  data: Buffer,
  algorithm: Algorithm,
  signature: Buffer,
  publicKey: string
): { valid: boolean; verificationTime: number } {
  const started = process.hrtime.bigint();
  try {
    let ok: boolean;
    if (algorithm === 'Ed25519') {
      ok = crypto.verify(null, data, publicKey, signature);
    } else {
      const verifier = crypto.createVerify('sha256');
      verifier.update(data);
      verifier.end();
      if (algorithm === 'RSA-PSS') {
        ok = verifier.verify(
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
          },
          signature
        );
      } else {
        ok = verifier.verify(publicKey, signature);
      }
    }
    return { valid: ok, verificationTime: Number(process.hrtime.bigint() - started) / 1e6 };
  } catch {
    return { valid: false, verificationTime: Number(process.hrtime.bigint() - started) / 1e6 };
  }
}
