/* Núcleo watch-only da carteira soberana da Bússola.
 *
 * SEGURANÇA: este módulo só lida com chaves PÚBLICAS estendidas (xpub/tpub/vpub).
 * Não gera, não guarda e não pede chave privada/seed. Não assina nada.
 * Bibliotecas auditadas (pure-JS, sem WASM): @scure/bip32, @scure/base, @noble/hashes.
 */
import { HDKey } from '@scure/bip32';
import { base58check, bech32 } from '@scure/base';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

/* Caminho da conta BIP84 na testnet (m/84'/1'/0'). */
const TESTNET_ACCOUNT_PATH = "m/84'/1'/0'";

function accountFromMnemonic(mnemonic) {
  const seed = mnemonicToSeedSync(mnemonic);
  const account = HDKey.fromMasterSeed(seed).derive(TESTNET_ACCOUNT_PATH);
  return { accountXpub: account.publicExtendedKey };
}

/* Cria uma carteira de TESTE (12 palavras). A seed é retornada UMA vez para o chamador
 * mostrar e o usuário anotar — este módulo não persiste nada. */
export function createTestnetWallet() {
  const mnemonic = generateMnemonic(wordlist, 128);
  return { mnemonic, ...accountFromMnemonic(mnemonic) };
}

/* Restaura a partir de 12/24 palavras (valida o checksum BIP39). */
export function restoreTestnetWallet(mnemonic) {
  const m = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(m, wordlist)) throw new Error('Frase de recuperação inválida (12/24 palavras BIP39).');
  return { mnemonic: m, ...accountFromMnemonic(m) };
}

const b58c = base58check(sha256);

/* Normaliza qualquer chave pública estendida (xpub/tpub/vpub/upub/zpub...) para a versão
 * "xpub" mainnet. As bytes de versão são só metadados; o que importa para derivar pubkeys
 * filhas é o chaincode + a pubkey. Assim o parser aceita carteiras BIP44/49/84 de qualquer rede. */
function normalizeToXpub(extKey) {
  const data = b58c.decode(String(extKey).trim());
  if (data.length !== 78) throw new Error('Chave estendida inválida (esperado 78 bytes).');
  const out = Uint8Array.from(data);
  out[0] = 0x04; out[1] = 0x88; out[2] = 0xb2; out[3] = 0x1e; // xpub
  return b58c.encode(out);
}

function hash160(buf) { return ripemd160(sha256(buf)); }

/* Endereço SegWit nativo v0 (P2WPKH). hrp 'bc' = mainnet, 'tb' = testnet/signet. */
function p2wpkh(pubkey, hrp) {
  if (!pubkey || pubkey.length !== 33) throw new Error('Pubkey comprimida inválida.');
  const words = bech32.toWords(hash160(pubkey));
  return bech32.encode(hrp, [0, ...words]);
}

/* Deriva endereços de recebimento (cadeia externa 0/i) a partir de uma xpub de CONTA
 * (ex.: m/84'/1'/0'). Retorna [{ path, address }]. Não toca em chaves privadas. */
export function deriveAddresses(extKey, count = 5, hrp = 'tb') {
  const n = Math.max(1, Math.min(50, count | 0));
  const account = HDKey.fromExtendedKey(normalizeToXpub(extKey));
  const external = account.deriveChild(0);
  const list = [];
  for (let i = 0; i < n; i++) {
    const child = external.deriveChild(i);
    if (!child.publicKey) throw new Error('Não foi possível derivar a chave pública.');
    list.push({ path: `0/${i}`, address: p2wpkh(child.publicKey, hrp) });
  }
  return list;
}

/* Conveniência testnet (tb1...). */
export function deriveTestnetAddresses(extKey, count = 5) {
  return deriveAddresses(extKey, count, 'tb');
}

/* Valida sem lançar: retorna true se a chave estendida parseia e deriva. */
export function isValidExtendedKey(extKey) {
  try { deriveAddresses(extKey, 1, 'tb'); return true; } catch { return false; }
}

export const version = '0.1.0';
