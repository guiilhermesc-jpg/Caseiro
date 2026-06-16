/* Valida o núcleo da carteira contra o vetor oficial do BIP84 e gera uma xpub de exemplo. */
import { deriveAddresses, isValidExtendedKey, createTestnetWallet, restoreTestnetWallet } from '../src/wallet/index.js';
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

/* Gera uma xpub de CONTA testnet (m/84'/1'/0') determinística, para usar como exemplo na UI.
 * Só material PÚBLICO é exportado/impresso. */
const seed = sha256('bussola exemplo testnet publico');
const master = HDKey.fromMasterSeed(seed);
const account = master.derive("m/84'/1'/0'");
console.log('\nEXEMPLO_XPUB_TESTNET=' + account.publicExtendedKey);
console.log('  primeiros endereços tb1:', deriveAddresses(account.publicExtendedKey, 2, 'tb').map(a => a.address).join(', '));

console.log(fail ? `\nFALHOU: ${fail} teste(s)` : '\nTODOS OS TESTES OK');
process.exit(fail ? 1 : 0);
