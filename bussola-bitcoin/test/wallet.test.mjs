/* Valida o núcleo da carteira contra o vetor oficial do BIP84 e gera uma xpub de exemplo. */
import { deriveAddresses, isValidExtendedKey, createTestnetWallet, restoreTestnetWallet,
  addressAt, buildPsbt, signPsbtWithMnemonic, finalizePsbt, makeQR, estimarImposto, sha256Hex } from '../src/wallet/index.js';
import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha256';

let fail = 0;
function eq(name, got, exp) {
  const ok = got === exp;
  console.log((ok ? '✓ ' : '✗ ') + name + (ok ? '' : `\n   got: ${got}\n   exp: ${exp}`));
  if (!ok) fail++;
}

/* Vetor oficial BIP84 (mainnet) — mnemônico "abandon ... about" */
const zpub = 'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs';
const addrs = deriveAddresses(zpub, 2, 'bc');
eq('BIP84 m/84\'/0\'/0\'/0/0', addrs[0].address, 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
eq('BIP84 m/84\'/0\'/0\'/0/1', addrs[1].address, 'bc1qnjg0jd8228aq7egyzacy8cys3knf9xvrerkf9g');

eq('isValidExtendedKey(zpub)', isValidExtendedKey(zpub), true);
eq('isValidExtendedKey(lixo)', isValidExtendedKey('nao-e-uma-chave'), false);

/* Criar e restaurar carteira testnet (roundtrip determinístico) */
const w = createTestnetWallet();
eq('mnemônico tem 12 palavras', w.mnemonic.split(' ').length, 12);
const r = restoreTestnetWallet(w.mnemonic);
eq('restaurar gera a mesma conta xpub', r.accountXpub, w.accountXpub);
eq('endereços derivam da carteira criada', deriveAddresses(w.accountXpub, 1, 'tb').length, 1);
let restoreErro = false; try { restoreTestnetWallet('palavra palavra palavra'); } catch { restoreErro = true; }
eq('restaurar frase inválida lança erro', restoreErro, true);

/* Air-gap: vetor de endereço testnet + paridade + roundtrip montar→assinar→finalizar */
const AB = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const ab = restoreTestnetWallet(AB);
eq('vetor testnet 0/0', addressAt(ab.accountXpub, 0, 0), 'tb1q6rz28mcfaxtmd6v789l9rrlrusdprr9pqcpvkl');
eq('paridade p2wpkh (btc-signer == bech32 manual)', addressAt(ab.accountXpub, 0, 0), deriveAddresses(ab.accountXpub, 1, 'tb')[0].address);

const w2 = createTestnetWallet();
const built = buildPsbt({
  accountXpub: w2.accountXpub,
  utxos: [{ txid: 'aa' + '00'.repeat(31), vout: 0, valueSats: 100000, chain: 0, index: 0 }],
  toAddress: addressAt(w2.accountXpub, 0, 1), amountSats: 50000, feeRate: 2,
});
eq('PSBT montado (base64 não vazio)', built.psbt.length > 50, true);
const sg = signPsbtWithMnemonic(built.psbt, w2.mnemonic);
eq('assinou 1 entrada', sg.signedInputs, 1);
const fin = finalizePsbt(sg.psbt);
eq('txid final tem 64 hex', /^[0-9a-f]{64}$/.test(fin.txid), true);
eq('hex final não vazio', fin.hex.length > 100, true);
eq('saldo insuficiente lança erro', (() => { try { buildPsbt({ accountXpub: w2.accountXpub, utxos: [{ txid: 'aa' + '00'.repeat(31), vout: 0, valueSats: 100, chain: 0, index: 0 }], toAddress: addressAt(w2.accountXpub, 0, 1), amountSats: 50000 }); return false; } catch { return true; } })(), true);
eq('makeQR retorna SVG', typeof makeQR('teste') === 'string' && makeQR('teste').includes('<svg'), true);

/* Estimador fiscal (math) */
eq('isento quando vendas do mes <= limite', estimarImposto({ vendaMes: 10000, valorVenda: 8000, custo: 5000, limite: 35000, aliquota: 15 }).isento, true);
eq('tributa quando acima do limite', Math.round(estimarImposto({ vendaMes: 40000, valorVenda: 8000, custo: 5000, limite: 35000, aliquota: 15 }).imposto), 450);
eq('sem ganho => isento', estimarImposto({ vendaMes: 40000, valorVenda: 5000, custo: 6000, limite: 35000, aliquota: 15 }).isento, true);

/* Prova de integridade (vetor SHA-256 de "abc") */
eq('sha256("abc")', sha256Hex(new TextEncoder().encode('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

/* Gera uma xpub de CONTA testnet (m/84'/1'/0') determinística, para usar como exemplo na UI.
 * Só material PÚBLICO é exportado/impresso. */
const seed = sha256('bussola exemplo testnet publico');
const master = HDKey.fromMasterSeed(seed);
const account = master.derive("m/84'/1'/0'");
console.log('\nEXEMPLO_XPUB_TESTNET=' + account.publicExtendedKey);
console.log('  primeiros endereços tb1:', deriveAddresses(account.publicExtendedKey, 2, 'tb').map(a => a.address).join(', '));

console.log(fail ? `\nFALHOU: ${fail} teste(s)` : '\nTODOS OS TESTES OK');
process.exit(fail ? 1 : 0);
