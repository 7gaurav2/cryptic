/**
 * Native WebCrypto AES-256-GCM Zero-Knowledge Engine
 * Specification per SYSTEM_SECURITY_ARCHITECTURE.md
 *
 * Binary `.cryptic` layout:
 * [0..5]    : Magic Header "CRPT\x01\x00" (6 bytes)
 * [6..21]   : Salt for PBKDF2 (16 bytes)
 * [22..33]  : Initialization Vector IV (12 bytes)
 * [34..35]  : Filename length N (2 bytes Uint16BE)
 * [36..36+N]: Original filename (UTF-8 bytes)
 * [rest]    : AES-256-GCM Ciphertext + 16-byte Authentication Tag
 */

const MAGIC_HEADER = new Uint8Array([0x43, 0x52, 0x50, 0x54, 0x01, 0x00]); // "CRPT\x01\x00"
const LEGACY_HEADER = new Uint8Array([0x56, 0x56, 0x4C, 0x54, 0x01, 0x00]); // "VVLT\x01\x00"
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface EncryptedVaultPayload {
  vaultBuffer: Uint8Array;
  originalFileName: string;
  originalSize: number;
  encryptedSize: number;
}

export interface DecryptedVaultPayload {
  decryptedBuffer: Uint8Array;
  originalFileName: string;
  fileSize: number;
}

export class CryptoEngine {
  /**
   * Derive AES-256-GCM key from password and salt using PBKDF2-SHA256
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt an arbitrary ArrayBuffer using AES-256-GCM and seal it in .cryptic container
   */
  public static async encryptFile(
    fileBuffer: ArrayBuffer,
    originalFileName: string,
    passphrase: string,
    onProgress?: (step: string) => void
  ): Promise<EncryptedVaultPayload> {
    onProgress?.('Generating cryptographic entropy (salt + IV)...');
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    onProgress?.('Deriving 256-bit key via PBKDF2 (100,000 rounds)...');
    const key = await this.deriveKey(passphrase, salt);

    onProgress?.('Sealing file with AES-256-GCM authenticated cipher...');
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      fileBuffer
    );

    onProgress?.('Constructing binary .cryptic container...');
    const enc = new TextEncoder();
    const fileNameBytes = enc.encode(originalFileName);
    const fileNameLength = fileNameBytes.byteLength;

    const totalHeaderLength = MAGIC_HEADER.length + SALT_LENGTH + IV_LENGTH + 2 + fileNameLength;
    const finalBuffer = new Uint8Array(totalHeaderLength + ciphertext.byteLength);

    // 1. Magic
    finalBuffer.set(MAGIC_HEADER, 0);

    // 2. Salt
    finalBuffer.set(salt, MAGIC_HEADER.length);

    // 3. IV
    finalBuffer.set(iv, MAGIC_HEADER.length + SALT_LENGTH);

    // 4. Filename length (Uint16BE)
    const offsetLength = MAGIC_HEADER.length + SALT_LENGTH + IV_LENGTH;
    finalBuffer[offsetLength] = (fileNameLength >> 8) & 0xff;
    finalBuffer[offsetLength + 1] = fileNameLength & 0xff;

    // 5. Filename
    finalBuffer.set(fileNameBytes, offsetLength + 2);

    // 6. Ciphertext + Auth Tag
    finalBuffer.set(new Uint8Array(ciphertext), totalHeaderLength);

    return {
      vaultBuffer: finalBuffer,
      originalFileName,
      originalSize: fileBuffer.byteLength,
      encryptedSize: finalBuffer.byteLength,
    };
  }

  /**
   * Decrypt and verify .cryptic container
   */
  public static async decryptVault(
    vaultBuffer: ArrayBuffer,
    passphrase: string,
    onProgress?: (step: string) => void
  ): Promise<DecryptedVaultPayload> {
    const bytes = new Uint8Array(vaultBuffer);

    // Verify magic header
    if (bytes.length < MAGIC_HEADER.length + SALT_LENGTH + IV_LENGTH + 2) {
      throw new Error('CORRUPTED_CONTAINER: File is smaller than minimum header size.');
    }

    const matchesMagic = MAGIC_HEADER.every((b, i) => bytes[i] === b);
    const matchesLegacy = LEGACY_HEADER.every((b, i) => bytes[i] === b);

    if (!matchesMagic && !matchesLegacy) {
      throw new Error('INVALID_FORMAT: Header mismatch. File is not a valid Cryptic (.cryptic) container.');
    }

    onProgress?.('Validating binary header structure...');
    let offset = MAGIC_HEADER.length;

    // Extract salt
    const salt = bytes.slice(offset, offset + SALT_LENGTH);
    offset += SALT_LENGTH;

    // Extract IV
    const iv = bytes.slice(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;

    // Extract filename length
    const fileNameLen = (bytes[offset] << 8) | bytes[offset + 1];
    offset += 2;

    if (bytes.length < offset + fileNameLen + 16) {
      throw new Error('CORRUPTED_CONTAINER: Payload truncated before ciphertext.');
    }

    // Extract filename
    const fileNameBytes = bytes.slice(offset, offset + fileNameLen);
    const dec = new TextDecoder();
    const originalFileName = dec.decode(fileNameBytes);
    offset += fileNameLen;

    // Extract ciphertext + auth tag
    const ciphertext = bytes.slice(offset);

    onProgress?.('Deriving key via PBKDF2 (100,000 rounds)...');
    const key = await this.deriveKey(passphrase, salt);

    onProgress?.('Verifying HMAC/GCM authentication tag and decrypting...');
    try {
      const plaintextBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
        },
        key,
        ciphertext as unknown as BufferSource
      );

      return {
        decryptedBuffer: new Uint8Array(plaintextBuffer),
        originalFileName,
        fileSize: plaintextBuffer.byteLength,
      };
    } catch {
      throw new Error('INTEGRITY_VIOLATION: Decryption failed. Incorrect passphrase or altered ciphertext.');
    }
  }

  /**
   * Calculate SHA-256 checksum string for audit log verification
   */
  public static async calculateChecksum(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
