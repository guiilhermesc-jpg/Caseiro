/* Núcleo watch-only da carteira soberana da Bússola.
 *
 * SEGURANÇA: este módulo só lida com chaves PÚBLICAS estendidas (xpub/tpub/vpub).
 * Não gera, não guarda e não pede chave privada/seed. Não assina nada.
 * Bibliotecas auditadas (pure-JS, sem WASM): @scure/bip32, @scure/base, @noble/hashes.
 */
import { HDKey } from '@scure/bip32';
import { base58check, bech32, bech32m, base64, hex } from '@scure/base';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { secp256k1, schnorr } from '@noble/curves/secp256k1';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic, mnemonicToEntropy, entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import * as btc from '@scure/btc-signer';
import qrcode from 'qrcode-generator';
import jsQR from 'jsqr';
import { split as shamirSplit, combine as shamirCombine } from 'shamir-secret-sharing';

const NET = btc.TEST_NETWORK;

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

/* =================== Recuperação social (Shamir k-de-N) =================== */
/* Divide a entropia da seed em N partes; recompõe com k. Abaixo de k não revela nada. */
export async function splitMnemonic(mnemonic, total, threshold) {
  const m = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(m, wordlist)) throw new Error('Frase de recuperação inválida.');
  const t = Math.max(2, Math.min(10, total | 0));
  const k = Math.max(2, Math.min(t, threshold | 0));
  const shares = await shamirSplit(mnemonicToEntropy(m, wordlist), t, k);
  return shares.map(s => hex.encode(s));
}
export async function combineMnemonic(shareHexes) {
  const shares = shareHexes.map(s => hex.decode(String(s).trim()));
  if (shares.length < 2) throw new Error('Forneça pelo menos 2 partes.');
  const ent = await shamirCombine(shares);
  return entropyToMnemonic(ent, wordlist);
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

/* =================== Air-gap (PSBT) — testnet =================== */

function pubAt(accountXpub, chain, index) {
  const acc = HDKey.fromExtendedKey(normalizeToXpub(accountXpub));
  const pk = acc.deriveChild(chain).deriveChild(index).publicKey;
  if (!pk) throw new Error('Não foi possível derivar a chave pública.');
  return pk;
}
function scriptAt(accountXpub, chain, index) { return btc.p2wpkh(pubAt(accountXpub, chain, index), NET).script; }

/* Endereço (tb1…) para uma derivação (chain 0 = recebimento, 1 = troco). */
export function addressAt(accountXpub, chain, index) {
  return btc.p2wpkh(pubAt(accountXpub, chain, index), NET).address;
}

/* 1) MONTAR (online, watch-only, SEM chaves): monta um PSBT não assinado.
 * utxos: [{ txid (hex do explorer), vout, valueSats, chain, index }] */
export function buildPsbt({ accountXpub, utxos, toAddress, amountSats, feeRate = 2, changeIndex = 0 }) {
  if (!utxos || !utxos.length) throw new Error('Sem UTXOs (endereços sem saldo na testnet?).');
  const amount = Math.floor(Number(amountSats));
  if (!(amount > 0)) throw new Error('Valor inválido.');
  const tx = new btc.Transaction();
  let totalIn = 0;
  for (const u of utxos) {
    tx.addInput({
      txid: hex.decode(u.txid), index: u.vout,
      witnessUtxo: { script: scriptAt(accountXpub, u.chain, u.index), amount: BigInt(u.valueSats) },
    });
    totalIn += u.valueSats;
  }
  const vsize = utxos.length * 68 + 2 * 31 + 11;
  const fee = Math.ceil(vsize * Math.max(1, feeRate));
  const change = totalIn - amount - fee;
  if (change < 0) throw new Error(`Saldo insuficiente: tem ${totalIn} sats, precisa de ${amount + fee} (valor + taxa).`);
  tx.addOutputAddress(toAddress, BigInt(amount), NET);
  const hasChange = change >= 294; // poeira
  if (hasChange) tx.addOutputAddress(addressAt(accountXpub, 1, changeIndex), BigInt(change), NET);
  return {
    psbt: base64.encode(tx.toPSBT()), fee, totalIn, change: hasChange ? change : 0,
    note: change > 0 && !hasChange ? 'Troco abaixo da poeira foi somado à taxa.' : '',
  };
}

/* 2) ASSINAR (offline, COM a seed): as chaves só existem aqui. */
export function signPsbtWithMnemonic(psbtB64, mnemonic, scan = 30) {
  const m = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(m, wordlist)) throw new Error('Frase de recuperação inválida.');
  const acct = HDKey.fromMasterSeed(mnemonicToSeedSync(m)).derive(TESTNET_ACCOUNT_PATH);
  let tx;
  try { tx = btc.Transaction.fromPSBT(base64.decode(String(psbtB64).trim())); }
  catch { throw new Error('PSBT inválido (confira o texto colado).'); }
  let signed = 0;
  for (const chain of [0, 1]) {
    const branch = acct.deriveChild(chain);
    for (let i = 0; i < scan; i++) {
      const child = branch.deriveChild(i);
      if (!child.privateKey) continue;
      try { signed += tx.sign(child.privateKey); } catch { /* chave não combina com esta entrada */ }
    }
  }
  if (!signed) throw new Error('Nenhuma entrada combinou com esta seed (carteira/derivação diferente).');
  return { psbt: base64.encode(tx.toPSBT()), signedInputs: signed };
}

/* 3) FINALIZAR: devolve o tx bruto (hex) + txid, pronto pra transmitir. */
export function finalizePsbt(psbtB64) {
  let tx;
  try { tx = btc.Transaction.fromPSBT(base64.decode(String(psbtB64).trim())); }
  catch { throw new Error('PSBT inválido.'); }
  tx.finalize();
  return { hex: tx.hex, txid: tx.id };
}

/* =================== Multisig 2-de-3 (P2WSH, testnet) =================== */
const MULTISIG_PATH = "m/48'/1'/0'/2'"; // BIP48 P2WSH testnet

function msPubsSorted(xpubs, chain, index) { // BIP67: pubkeys ordenadas
  return xpubs.map(x => {
    const k = HDKey.fromExtendedKey(normalizeToXpub(x)).deriveChild(chain).deriveChild(index).publicKey;
    if (!k) throw new Error('Chave estendida inválida no multisig.');
    return k;
  }).sort((a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; });
}
function msPayment(xpubs, m, chain, index) { return btc.p2wsh(btc.p2ms(m, msPubsSorted(xpubs, chain, index)), NET); }

/* Gera um cosigner: frase + xpub de conta multisig (m/48'/1'/0'/2') para compartilhar. */
export function createMultisigCosigner() {
  const mnemonic = generateMnemonic(wordlist, 128);
  const accountXpub = HDKey.fromMasterSeed(mnemonicToSeedSync(mnemonic)).derive(MULTISIG_PATH).publicExtendedKey;
  return { mnemonic, accountXpub };
}
export function multisigAccountXpub(mnemonic) {
  const m = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(m, wordlist)) throw new Error('Frase de recuperação inválida.');
  return HDKey.fromMasterSeed(mnemonicToSeedSync(m)).derive(MULTISIG_PATH).publicExtendedKey;
}
export function multisigAddresses(xpubs, m, count = 5, chain = 0) {
  const n = Math.max(1, Math.min(50, count | 0)), out = [];
  for (let i = 0; i < n; i++) out.push({ path: `${chain}/${i}`, chain, index: i, address: msPayment(xpubs, m, chain, i).address });
  return out;
}
export function buildMultisigPsbt({ xpubs, m, utxos, toAddress, amountSats, feeRate = 2, changeIndex = 0 }) {
  if (!utxos || !utxos.length) throw new Error('Sem UTXOs (endereços multisig sem saldo?).');
  const amount = Math.floor(Number(amountSats));
  if (!(amount > 0)) throw new Error('Valor inválido.');
  const tx = new btc.Transaction();
  let totalIn = 0;
  for (const u of utxos) {
    const pay = msPayment(xpubs, m, u.chain, u.index);
    tx.addInput({ txid: hex.decode(u.txid), index: u.vout, witnessUtxo: { script: pay.script, amount: BigInt(u.valueSats) }, witnessScript: pay.witnessScript });
    totalIn += u.valueSats;
  }
  const vsize = utxos.length * 105 + 2 * 43 + 11;
  const fee = Math.ceil(vsize * Math.max(1, feeRate));
  const change = totalIn - amount - fee;
  if (change < 0) throw new Error(`Saldo insuficiente: tem ${totalIn} sats, precisa de ${amount + fee} (valor + taxa).`);
  tx.addOutputAddress(toAddress, BigInt(amount), NET);
  const hasChange = change >= 330;
  if (hasChange) tx.addOutputAddress(msPayment(xpubs, m, 1, changeIndex).address, BigInt(change), NET);
  return { psbt: base64.encode(tx.toPSBT()), fee, totalIn, change: hasChange ? change : 0 };
}
/* Assina como cosigner (chaves de m/48'/1'/0'/2'). Passe o PSBT ao próximo cosigner; ao
 * atingir m assinaturas, use finalizePsbt e transmita. */
export function signMultisigPsbt(psbtB64, mnemonic, scan = 30) {
  const mm = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(mm, wordlist)) throw new Error('Frase de recuperação inválida.');
  const acct = HDKey.fromMasterSeed(mnemonicToSeedSync(mm)).derive(MULTISIG_PATH);
  let tx; try { tx = btc.Transaction.fromPSBT(base64.decode(String(psbtB64).trim())); } catch { throw new Error('PSBT inválido.'); }
  let signed = 0;
  for (const chain of [0, 1]) { const br = acct.deriveChild(chain); for (let i = 0; i < scan; i++) { const c = br.deriveChild(i); if (!c.privateKey) continue; try { signed += tx.sign(c.privateKey); } catch {} } }
  if (!signed) throw new Error('Nenhuma entrada combinou com esta seed (cosigner não pertence ao grupo?).');
  return { psbt: base64.encode(tx.toPSBT()), signedInputs: signed };
}

/* =================== Herança com timelock (cofre P2WSH, testnet) =================== */
/* Cofre: gasto NORMAL 2-de-3 OU resgate pelo HERDEIRO sozinho após `timelock` blocos
 * (OP_CHECKSEQUENCEVERIFY, relativo). Membros (co-signatários e herdeiro) usam o mesmo
 * caminho do multisig (m/48'/1'/0'/2'), então reutilizam createMultisigCosigner. */
const INH_TRUE = new Uint8Array([1]);
const INH_EMPTY = new Uint8Array(0);

function inhWitnessScript(cosignerXpubs, heirXpub, timelock, chain, index) {
  if (!Array.isArray(cosignerXpubs) || cosignerXpubs.length !== 3) throw new Error('Use exatamente 3 co-signatários.');
  const tl = timelock | 0;
  if (tl < 1 || tl > 65535) throw new Error('Timelock deve ser entre 1 e 65535 blocos.');
  const pks = cosignerXpubs.map(x => {
    const k = HDKey.fromExtendedKey(normalizeToXpub(x)).deriveChild(chain).deriveChild(index).publicKey;
    if (!k) throw new Error('xpub de co-signatário inválida.');
    return k;
  }).sort((a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; });
  const heir = HDKey.fromExtendedKey(normalizeToXpub(heirXpub)).deriveChild(chain).deriveChild(index).publicKey;
  if (!heir) throw new Error('xpub do herdeiro inválida.');
  // IF 2 <A><B><C> 3 CHECKMULTISIG ELSE <tl> CSV DROP <heir> CHECKSIG ENDIF
  return btc.Script.encode(['IF', 2, pks[0], pks[1], pks[2], 3, 'CHECKMULTISIG',
    'ELSE', tl, 'CHECKSEQUENCEVERIFY', 'DROP', heir, 'CHECKSIG', 'ENDIF']);
}
function inhPayment(cosignerXpubs, heirXpub, timelock, chain, index) {
  const witnessScript = inhWitnessScript(cosignerXpubs, heirXpub, timelock, chain, index);
  const pay = btc.p2wsh({ type: 'wsh', script: witnessScript }, NET);
  return { address: pay.address, script: pay.script, witnessScript };
}
function inhPubkeyOrder(witnessScript) { // ordem dos pubkeys (33b) no script, p/ ordenar as assinaturas
  return btc.Script.decode(witnessScript).filter(x => x instanceof Uint8Array && x.length === 33).map(x => hex.encode(x));
}

export function inheritanceAddresses({ cosignerXpubs, heirXpub, timelock, count = 5, chain = 0 }) {
  const n = Math.max(1, Math.min(50, count | 0)), out = [];
  for (let i = 0; i < n; i++) out.push({ path: `${chain}/${i}`, chain, index: i, address: inhPayment(cosignerXpubs, heirXpub, timelock, chain, i).address });
  return out;
}

/* Monta o gasto do cofre. mode: 'normal' (2-de-3) ou 'recovery' (herdeiro; define o sequence=timelock). */
export function buildInheritancePsbt({ cosignerXpubs, heirXpub, timelock, utxos, toAddress, amountSats, feeRate = 2, changeIndex = 0, mode = 'normal' }) {
  if (!utxos || !utxos.length) throw new Error('Sem UTXOs no cofre (sem saldo?).');
  const amount = Math.floor(Number(amountSats));
  if (!(amount > 0)) throw new Error('Valor inválido.');
  const tl = timelock | 0;
  const tx = new btc.Transaction();
  let totalIn = 0;
  for (const u of utxos) {
    const p = inhPayment(cosignerXpubs, heirXpub, tl, u.chain, u.index);
    const inp = { txid: hex.decode(u.txid), index: u.vout, witnessUtxo: { script: p.script, amount: BigInt(u.valueSats) }, witnessScript: p.witnessScript };
    if (mode === 'recovery') inp.sequence = tl; // CSV relativo em blocos
    tx.addInput(inp);
    totalIn += u.valueSats;
  }
  const perIn = mode === 'recovery' ? 73 : 108; // vbytes aprox. por entrada
  const vsize = utxos.length * perIn + 2 * 43 + 11;
  const fee = Math.ceil(vsize * Math.max(1, feeRate));
  const change = totalIn - amount - fee;
  if (change < 0) throw new Error(`Saldo insuficiente: tem ${totalIn} sats, precisa de ${amount + fee} (valor + taxa).`);
  tx.addOutputAddress(toAddress, BigInt(amount), NET);
  const hasChange = change >= 330;
  if (hasChange) tx.addOutputAddress(inhPayment(cosignerXpubs, heirXpub, tl, 1, changeIndex).address, BigInt(change), NET);
  return { psbt: base64.encode(tx.toPSBT()), fee, totalIn, change: hasChange ? change : 0, mode };
}

/* Assina o cofre com UMA seed (co-signatário no normal, ou herdeiro no resgate). Só assina
 * entradas cujo pubkey derivado aparece no script. Guarda partialSig; finalize depois. */
export function signInheritancePsbt(psbtB64, mnemonic, scan = 30) {
  const mm = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(mm, wordlist)) throw new Error('Frase de recuperação inválida.');
  const acct = HDKey.fromMasterSeed(mnemonicToSeedSync(mm)).derive(MULTISIG_PATH);
  let tx; try { tx = btc.Transaction.fromPSBT(base64.decode(String(psbtB64).trim())); } catch { throw new Error('PSBT inválido.'); }
  const cands = [];
  for (const chain of [0, 1]) { const br = acct.deriveChild(chain); for (let i = 0; i < scan; i++) { const c = br.deriveChild(i); if (c.privateKey) cands.push(c); } }
  let signed = 0;
  for (let idx = 0; idx < tx.inputsLength; idx++) {
    const ws = tx.getInput(idx).witnessScript; if (!ws) continue;
    const wsHex = hex.encode(ws);
    for (const c of cands) {
      if (wsHex.includes(hex.encode(c.publicKey))) { try { if (tx.signIdx(c.privateKey, idx)) signed++; } catch { /* segue */ } }
    }
  }
  if (!signed) throw new Error('Esta seed não pertence ao cofre (nenhuma chave combinou).');
  return { psbt: base64.encode(tx.toPSBT()), signedInputs: signed };
}

/* Finaliza montando o witness do ramo certo e devolve tx bruto (hex)+txid.
 * normal: [<vazio> sigs... <true> script]  |  recovery: [sig <vazio> script]. */
export function finalizeInheritancePsbt(psbtB64, mode = 'normal') {
  let tx; try { tx = btc.Transaction.fromPSBT(base64.decode(String(psbtB64).trim())); } catch { throw new Error('PSBT inválido.'); }
  for (let idx = 0; idx < tx.inputsLength; idx++) {
    const inp = tx.getInput(idx);
    const ws = inp.witnessScript; if (!ws) throw new Error('Entrada sem witnessScript.');
    const ps = inp.partialSig || [];
    if (mode === 'recovery') {
      if (ps.length < 1) throw new Error('Falta a assinatura do herdeiro.');
      tx.updateInput(idx, { finalScriptWitness: [ps[0][1], INH_EMPTY, ws] });
    } else {
      if (ps.length < 2) throw new Error('Faltam assinaturas (precisa de 2 de 3).');
      const order = inhPubkeyOrder(ws);
      const sigs = ps.slice().sort((a, b) => order.indexOf(hex.encode(a[0])) - order.indexOf(hex.encode(b[0]))).slice(0, 2).map(x => x[1]);
      tx.updateInput(idx, { finalScriptWitness: [INH_EMPTY, ...sigs, INH_TRUE, ws] });
    }
  }
  return { hex: tx.hex, txid: tx.id };
}

/* "Interruptor da vida" (dead man's switch): dado o timelock (em blocos) e as UTXOs do cofre com
 * a altura de confirmação, calcula quantos blocos faltam para o HERDEIRO poder resgatar. O relógio
 * de cada UTXO reinicia quando ela é movida — mover/renovar = "prova de vida". Retorna a maior
 * contagem restante (o cofre só fica 100% resgatável quando a UTXO mais recente amadurece). */
export function inheritanceClaimStatus({ timelock, utxos, tipHeight }) {
  const tl = Math.max(1, timelock | 0);
  const tip = tipHeight | 0;
  const items = (utxos || []).map(u => {
    const h = u.height | 0;
    const confs = h > 0 && tip >= h ? (tip - h + 1) : 0; // 0 = ainda na mempool
    const remaining = Math.max(0, tl - confs);
    return { valueSats: u.valueSats | 0, height: h, confs, remaining, claimable: confs >= tl };
  });
  const totalSats = items.reduce((s, i) => s + i.valueSats, 0);
  const remaining = items.length ? Math.max(...items.map(i => i.remaining)) : tl;
  const claimableAll = items.length > 0 && items.every(i => i.claimable);
  return { timelock: tl, items, totalSats, remaining, remainingDays: Math.ceil(remaining * 10 / 60 / 24), claimableAll };
}

/* Lembrete de "prova de vida" como calendário (.ics, RFC 5545): um evento RECORRENTE para mover/
 * renovar o cofre antes do herdeiro poder resgatar. O intervalo é ~2/3 da janela do timelock, para
 * você renovar sempre com folga. Zero backend: importa em qualquer agenda. startDate: Date (default agora). */
export function lifeProofReminderICS({ timelock, startDate, label = 'Bússola: prova de vida do cofre' } = {}) {
  const tl = Math.max(1, timelock | 0);
  const windowDays = tl * 10 / 60 / 24;                       // ~10 min por bloco
  const everyDays = Math.max(1, Math.round(windowDays * 2 / 3));
  const start = startDate instanceof Date ? startDate : new Date();
  const first = new Date(start.getTime() + everyDays * 86400000); // 1ª ocorrência: +everyDays
  const pad = n => String(n).padStart(2, '0');
  const dt = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  const ein = s => String(s).replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n'); // escape RFC 5545
  const uid = `bussola-${dt(start)}-${tl}@bussola.bitcoin`;
  const desc = `Mova/renove o saldo do seu Cofre (Interruptor da Vida) pelo caminho normal 2-de-3 para zerar o relogio do timelock (${tl} blocos). Essa e a sua prova de vida: enquanto voce renova, so voce controla; o herdeiro so resgata apos ~${Math.round(windowDays)} dias sem movimento.`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bussola Bitcoin//Prova de Vida//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dt(start)}`, `DTSTART:${dt(first)}`,
    `RRULE:FREQ=DAILY;INTERVAL=${everyDays}`,
    `SUMMARY:${ein(label)}`, `DESCRIPTION:${ein(desc)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT12H', 'ACTION:DISPLAY', `DESCRIPTION:${ein(label)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return { ics: lines.join('\r\n') + '\r\n', everyDays, windowDays: Math.round(windowDays) };
}

/* =================== Silent Payments (BIP-352) — endereço reutilizável =================== */
/* Um endereço estático que pode ser publicado e reusado sem perder privacidade: cada pagamento
 * cai num endereço on-chain diferente. Aqui geramos a IDENTIDADE (endereço + chaves de visão/gasto).
 * Codificação bech32m validada contra o vetor oficial do BIP-352. */
const SP_NET = {
  test: { scan: "m/352'/1'/0'/1'/0", spend: "m/352'/1'/0'/0'/0", hrp: 'tsp' },
  main: { scan: "m/352'/0'/0'/1'/0", spend: "m/352'/0'/0'/0'/0", hrp: 'sp' },
};
export function encodeSilentPaymentAddress(scanPub, spendPub, network = 'test') {
  const hrp = (SP_NET[network] || SP_NET.test).hrp;
  const sp = typeof scanPub === 'string' ? hex.decode(scanPub) : scanPub;
  const bp = typeof spendPub === 'string' ? hex.decode(spendPub) : spendPub;
  if (sp.length !== 33 || bp.length !== 33) throw new Error('Pubkeys devem ter 33 bytes (comprimidas).');
  // versão 0 (caractere "q") + bech32m(scan || spend)
  return bech32m.encode(hrp, [0, ...bech32m.toWords(new Uint8Array([...sp, ...bp]))], 1023);
}
export function decodeSilentPaymentAddress(addr) {
  const a = String(addr).trim().toLowerCase();
  const hrp = a.startsWith('tsp1') ? 'tsp' : a.startsWith('sp1') ? 'sp' : null;
  if (!hrp) throw new Error('Endereço Silent Payment inválido (sp1…/tsp1…).');
  let dec; try { dec = bech32m.decode(a, 1023); } catch { throw new Error('Endereço SP inválido (bech32m).'); }
  if (dec.prefix !== hrp || dec.words[0] !== 0) throw new Error('Versão/prefixo de SP não suportado.');
  const payload = bech32m.fromWords(dec.words.slice(1));
  if (payload.length !== 66) throw new Error('Payload SP inválido (esperado 66 bytes).');
  return { network: hrp === 'sp' ? 'main' : 'test', scanPub: hex.encode(payload.slice(0, 33)), spendPub: hex.encode(payload.slice(33)) };
}
export function silentPaymentAddress(mnemonic, network = 'test') {
  const mm = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(mm, wordlist)) throw new Error('Frase de recuperação inválida.');
  const cfg = SP_NET[network] || SP_NET.test;
  const root = HDKey.fromMasterSeed(mnemonicToSeedSync(mm));
  const scanPub = root.derive(cfg.scan).publicKey, spendPub = root.derive(cfg.spend).publicKey;
  if (!scanPub || !spendPub) throw new Error('Falha ao derivar chaves de Silent Payment.');
  return { address: encodeSilentPaymentAddress(scanPub, spendPub, network), scanPub: hex.encode(scanPub), spendPub: hex.encode(spendPub), network };
}

/* Deriva o scriptPubKey (P2TR) de saída de um pagamento Silent Payment a partir das chaves
 * privadas das entradas e dos outpoints. Núcleo validado contra o vetor oficial do BIP-352. */
function spTagged(tag, msg) { const t = sha256(new TextEncoder().encode(tag)); return sha256(new Uint8Array([...t, ...t, ...msg])); }
function spOutpointSer(txid, vout) { const t = hex.decode(txid).slice().reverse(); const v = new Uint8Array(4); new DataView(v.buffer).setUint32(0, vout, true); return new Uint8Array([...t, ...v]); }
export function silentPaymentOutputScript({ inputPrivKeys, outpoints, scanPub, spendPub, k = 0 }) {
  const P = secp256k1.ProjectivePoint, n = secp256k1.CURVE.n;
  const toB = b => BigInt('0x' + hex.encode(b));
  const privs = inputPrivKeys.map(p => (typeof p === 'string' ? hex.decode(p) : p));
  let a = privs.reduce((s, p) => (s + toB(p)) % n, 0n); // P2WPKH: sem negação
  if (a === 0n) throw new Error('Soma das chaves de entrada é inválida.');
  const A = P.BASE.multiply(a);
  const opL = outpoints.map(o => spOutpointSer(o.txid, o.vout)).sort((x, y) => { for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; })[0];
  const inputHash = toB(spTagged('BIP0352/Inputs', new Uint8Array([...opL, ...A.toRawBytes(true)]))) % n;
  if (inputHash === 0n) throw new Error('input_hash inválido.');
  const ecdh = P.fromHex(typeof scanPub === 'string' ? scanPub : hex.encode(scanPub)).multiply((inputHash * a) % n);
  const kb = new Uint8Array(4); new DataView(kb.buffer).setUint32(0, k, false); // ser32(k) big-endian
  const tk = toB(spTagged('BIP0352/SharedSecret', new Uint8Array([...ecdh.toRawBytes(true), ...kb]))) % n;
  if (tk === 0n) throw new Error('tweak t_k inválido.');
  const Pout = P.fromHex(typeof spendPub === 'string' ? spendPub : hex.encode(spendPub)).add(P.BASE.multiply(tk));
  const xonly = Pout.toRawBytes(true).slice(1);
  return { script: new Uint8Array([0x51, 0x20, ...xonly]), xonly: hex.encode(xonly) };
}

/* Envia para um endereço Silent Payment a partir da carteira testnet (entradas P2WPKH).
 * Usa TODAS as UTXOs passadas como entradas (consolidação) e monta→assina→finaliza em um passo. */
export function silentPaymentSend({ mnemonic, accountXpub, utxos, toAddress, amountSats, feeRate = 2, changeIndex = 0 }) {
  const mm = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(mm, wordlist)) throw new Error('Frase de recuperação inválida.');
  if (!utxos || !utxos.length) throw new Error('Sem UTXOs (sem saldo na carteira testnet?).');
  const amount = Math.floor(Number(amountSats));
  if (!(amount > 0)) throw new Error('Valor inválido.');
  const { scanPub, spendPub } = decodeSilentPaymentAddress(toAddress);
  const acct = HDKey.fromMasterSeed(mnemonicToSeedSync(mm)).derive(TESTNET_ACCOUNT_PATH);
  const xpub = accountXpub || acct.publicExtendedKey;
  const tx = new btc.Transaction();
  const inputPrivKeys = [], outpoints = []; let totalIn = 0;
  for (const u of utxos) {
    const c = acct.deriveChild(u.chain).deriveChild(u.index);
    if (!c.privateKey) throw new Error('Falha ao derivar chave de uma entrada.');
    inputPrivKeys.push(c.privateKey); outpoints.push({ txid: u.txid, vout: u.vout });
    tx.addInput({ txid: hex.decode(u.txid), index: u.vout, witnessUtxo: { script: scriptAt(xpub, u.chain, u.index), amount: BigInt(u.valueSats) } });
    totalIn += u.valueSats;
  }
  const spOut = silentPaymentOutputScript({ inputPrivKeys, outpoints, scanPub, spendPub, k: 0 });
  const vsize = utxos.length * 68 + 43 + 31 + 11; // entradas p2wpkh + saída p2tr + troco + overhead
  const fee = Math.ceil(vsize * Math.max(1, feeRate));
  const change = totalIn - amount - fee;
  if (change < 0) throw new Error(`Saldo insuficiente: tem ${totalIn} sats, precisa de ${amount + fee} (valor + taxa).`);
  tx.addOutput({ script: spOut.script, amount: BigInt(amount) });
  const hasChange = change >= 294;
  if (hasChange) tx.addOutputAddress(addressAt(xpub, 1, changeIndex), BigInt(change), NET);
  for (const p of inputPrivKeys) { try { tx.sign(p); } catch { /* entrada de outra chave */ } }
  tx.finalize();
  return { hex: tx.hex, txid: tx.id, outputXonly: spOut.xonly, fee, totalIn, change: hasChange ? change : 0 };
}

/* Scanner de recebimentos SP: dados as chaves de visão (scan) + a spend pubkey, descobre quais
 * outputs taproot de uma transação são seus. Núcleo validado contra o vetor oficial do BIP-352. */
export function silentPaymentScanTx({ scanPriv, spendPub, inputPubKeys, outpoints, outputs }) {
  const P = secp256k1.ProjectivePoint, n = secp256k1.CURVE.n;
  const toB = b => BigInt('0x' + (typeof b === 'string' ? b : hex.encode(b)));
  const bn32 = x => hex.decode(x.toString(16).padStart(64, '0'));
  if (!inputPubKeys || !inputPubKeys.length || !outputs || !outputs.length) return [];
  let A = null;
  for (const p of inputPubKeys) { const pt = P.fromHex(typeof p === 'string' ? p : hex.encode(p)); A = A ? A.add(pt) : pt; }
  const opL = outpoints.map(o => spOutpointSer(o.txid, o.vout)).sort((x, y) => { for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; })[0];
  const inputHash = toB(spTagged('BIP0352/Inputs', new Uint8Array([...opL, ...A.toRawBytes(true)]))) % n;
  const ecdh = A.multiply((inputHash * toB(scanPriv)) % n);
  const B = P.fromHex(typeof spendPub === 'string' ? spendPub : hex.encode(spendPub));
  const left = new Map(outputs.map(o => [o.xonly, o]));
  const found = []; let k = 0;
  while (left.size) {
    const kb = new Uint8Array(4); new DataView(kb.buffer).setUint32(0, k, false);
    const tk = toB(spTagged('BIP0352/SharedSecret', new Uint8Array([...ecdh.toRawBytes(true), ...kb]))) % n;
    const xonly = hex.encode(B.add(P.BASE.multiply(tk)).toRawBytes(true).slice(1));
    if (left.has(xonly)) { found.push({ ...left.get(xonly), xonly, tweak: hex.encode(bn32(tk)) }); left.delete(xonly); k++; }
    else break;
  }
  return found;
}
/* Extrai a pubkey elegível de uma entrada (vin do Esplora): P2WPKH, P2TR key-path, P2SH-P2WPKH. */
function spInputPubFromVin(vin) {
  const t = vin.prevout && vin.prevout.scriptpubkey_type, w = vin.witness || [];
  if (t === 'v0_p2wpkh' && w.length >= 2) return w[w.length - 1];
  if (t === 'p2sh' && w.length >= 2) return w[w.length - 1]; // provável P2SH-P2WPKH
  if (t === 'v1_p2tr') {
    const annex = w.length >= 2 && w[w.length - 1].startsWith('50');
    const eff = annex ? w.length - 1 : w.length;
    const spk = vin.prevout.scriptpubkey;
    if (eff === 1 && spk && spk.startsWith('5120')) return '02' + spk.slice(4); // key-path
    return null; // script-path: excluído pelo BIP-352
  }
  return null;
}
/* Varre UMA transação (objeto do Esplora) procurando recebimentos SP da carteira (via frase). */
export function silentPaymentScan({ mnemonic, network = 'test', tx }) {
  const mm = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(mm, wordlist)) throw new Error('Frase de recuperação inválida.');
  const cfg = SP_NET[network] || SP_NET.test;
  const root = HDKey.fromMasterSeed(mnemonicToSeedSync(mm));
  const scanPriv = root.derive(cfg.scan).privateKey, spendPub = root.derive(cfg.spend).publicKey;
  const vin = tx.vin || [], vout = tx.vout || [];
  const inputPubKeys = vin.map(spInputPubFromVin).filter(Boolean);
  const outpoints = vin.map(v => ({ txid: v.txid, vout: v.vout }));
  const outputs = vout.map((o, i) => { const spk = o.scriptpubkey || ''; return spk.startsWith('5120') ? { vout: i, xonly: spk.slice(4), valueSats: o.value } : null; }).filter(Boolean);
  const found = (outputs.length && inputPubKeys.length) ? silentPaymentScanTx({ scanPriv, spendPub, inputPubKeys, outpoints, outputs }) : [];
  return { found, scannedOutputs: outputs.length, inputsUsed: inputPubKeys.length, inputsTotal: vin.length };
}

/* Gasta (sweep) recebimentos Silent Payment detectados pelo scanner — de um ou vários txids.
 * `inputs`: [{ txid, vout, xonly, tweak, valueSats }]. Cada output é taproot key-path cuja chave
 * de saída é o próprio P_k (sem o tweak do BIP-341): a chave de gasto é d = (b_spend + tweak) mod n.
 * Assina via Schnorr (BIP-340) sobre o sighash BIP-341 e finaliza. */
export function silentPaymentSpend({ mnemonic, network = 'test', inputs, toAddress, feeRate = 2 }) {
  const mm = String(mnemonic).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!validateMnemonic(mm, wordlist)) throw new Error('Frase de recuperação inválida.');
  if (!inputs || !inputs.length) throw new Error('Nenhum recebimento Silent Payment para gastar.');
  if (!toAddress) throw new Error('Informe o endereço de destino.');
  const cfg = SP_NET[network] || SP_NET.test;
  const P = secp256k1.ProjectivePoint, n = secp256k1.CURVE.n;
  const bSpend = BigInt('0x' + hex.encode(HDKey.fromMasterSeed(mnemonicToSeedSync(mm)).derive(cfg.spend).privateKey));
  const tx = new btc.Transaction();
  const signers = []; let totalIn = 0n;
  for (const o of inputs) {
    if (!/^[0-9a-fA-F]{64}$/.test(String(o.txid || ''))) throw new Error('txid de origem inválido.');
    if (!/^[0-9a-f]{64}$/.test(String(o.xonly)) || !/^[0-9a-f]{64}$/.test(String(o.tweak))) throw new Error('Recebimento SP inválido (xonly/tweak).');
    const script = hex.decode('5120' + o.xonly), amount = BigInt(o.valueSats);
    const d = (bSpend + BigInt('0x' + o.tweak)) % n;
    if (d === 0n) throw new Error('Chave de gasto derivada é inválida.');
    if (hex.encode(P.BASE.multiply(d).toRawBytes(true).slice(1)) !== o.xonly) throw new Error('Recebimento não confere com a sua chave (seed/tweak errado?).');
    tx.addInput({ txid: hex.decode(o.txid), index: o.vout, witnessUtxo: { script, amount } });
    signers.push({ d, script, amount, xonly: o.xonly });
    totalIn += amount;
  }
  const vsize = inputs.length * 58 + 43 + 11; // entradas taproot key-path + 1 saída + overhead
  const fee = BigInt(Math.ceil(vsize * Math.max(1, feeRate)));
  const send = totalIn - fee;
  if (send < 546n) throw new Error(`Valor após a taxa (${send} sats) fica abaixo do mínimo. Junte mais recebimentos ou reduza a taxa.`);
  tx.addOutputAddress(toAddress, send, NET);
  const scripts = signers.map(s => s.script), amounts = signers.map(s => s.amount);
  for (let i = 0; i < signers.length; i++) {
    const { d, xonly } = signers[i];
    const sighash = tx.preimageWitnessV1(i, scripts, btc.SigHash.DEFAULT, amounts);
    const sig = schnorr.sign(sighash, hex.decode(d.toString(16).padStart(64, '0')));
    if (!schnorr.verify(sig, sighash, hex.decode(xonly))) throw new Error(`Assinatura Schnorr não verificou (input ${i}).`);
    tx.updateInput(i, { tapKeySig: sig });
  }
  tx.finalize();
  return { hex: tx.hex, txid: tx.id, fee: Number(fee), totalIn: Number(totalIn), sent: Number(send), inputsCount: inputs.length };
}

/* Monta um link de cobrança BIP-21 (bitcoin:<endereço>?amount=&label=&message=). Funciona com
 * endereço SP ou comum. amount em BTC, sem zeros supérfluos; label/message URL-encoded. */
export function buildPaymentURI({ address, amountBtc, label, message }) {
  if (!address) throw new Error('Endereço ausente.');
  const params = [];
  if (amountBtc != null && String(amountBtc).trim() !== '') {
    const a = Number(amountBtc);
    if (!(a > 0)) throw new Error('Valor inválido.');
    params.push('amount=' + a.toFixed(8).replace(/\.?0+$/, ''));
  }
  if (label) params.push('label=' + encodeURIComponent(label));
  if (message) params.push('message=' + encodeURIComponent(message));
  return 'bitcoin:' + address + (params.length ? '?' + params.join('&') : '');
}

export function makeQR(text, cell = 3) {
  try {
    const qr = qrcode(0, 'L'); qr.addData(String(text)); qr.make();
    return qr.createSvgTag({ cellSize: cell, margin: 2, scalable: true });
  } catch { return null; }
}

/* Decodifica um QR a partir de pixels RGBA (ImageData da câmera). Retorna o texto ou null. */
export function decodeQR(data, width, height) {
  const r = jsQR(data, width, height);
  return r ? r.data : null;
}

/* =================== Prova de integridade =================== */
/* SHA-256 (hex) de bytes — impressão digital de um documento. Base para notarização
 * (ancoragem no Bitcoin via OpenTimestamps é o próximo passo). */
export function sha256Hex(bytes) { return hex.encode(sha256(bytes)); }

/* =================== Util fiscal (estimativa educacional) =================== */
/* Estimativa de ganho de capital em VENDA. Parâmetros (limite/alíquota) são EDITÁVEIS pelo
 * usuário porque as regras mudam — isto NÃO é cálculo oficial nem recomendação. */
/* Tabela progressiva de ganho de capital (pessoa física, Brasil): alíquota por faixa de ganho. */
export const FAIXAS_GANHO_CAPITAL = [
  { ate: 5_000_000, aliq: 15 },
  { ate: 10_000_000, aliq: 17.5 },
  { ate: 30_000_000, aliq: 20 },
  { ate: Infinity, aliq: 22.5 },
];
/* Imposto sobre o ganho aplicando a tabela progressiva faixa a faixa. */
export function impostoProgressivo(ganho) {
  let resto = Math.max(0, Number(ganho)), base = 0, imposto = 0;
  for (const f of FAIXAS_GANHO_CAPITAL) {
    const faixa = Math.min(resto, f.ate - base);
    if (faixa > 0) { imposto += faixa * f.aliq / 100; resto -= faixa; }
    base = f.ate;
    if (resto <= 0) break;
  }
  return imposto;
}
/* Estimador educacional. Isenção quando as vendas do mês ≤ limite (ou sem ganho). Por padrão usa a
 * tabela progressiva; passe `aliquota` (e progressivo:false) para forçar uma alíquota fixa. */
export function estimarImposto({ vendaMes = 0, valorVenda = 0, custo = 0, limite = 35000, aliquota = null, progressivo = true }) {
  const ganho = Number(valorVenda) - Number(custo);
  const isento = Number(vendaMes) <= Number(limite) || ganho <= 0;
  const usaProg = progressivo && (aliquota === null || aliquota === undefined);
  const imposto = isento ? 0 : (usaProg ? impostoProgressivo(ganho) : ganho * (Number(aliquota) / 100));
  const aliquotaEfetiva = (!isento && ganho > 0) ? imposto / ganho * 100 : 0;
  return { ganho, isento, imposto, aliquotaEfetiva, progressivo: usaProg };
}

export const version = '0.3.0';
