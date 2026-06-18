/* Valida o núcleo da carteira contra o vetor oficial do BIP84 e gera uma xpub de exemplo. */
import { deriveAddresses, isValidExtendedKey, createTestnetWallet, restoreTestnetWallet,
  addressAt, buildPsbt, signPsbtWithMnemonic, finalizePsbt, makeQR, estimarImposto, impostoProgressivo, sha256Hex, decodeQR,
  createMultisigCosigner, multisigAddresses, buildMultisigPsbt, signMultisigPsbt,
  splitMnemonic, combineMnemonic,
  inheritanceAddresses, buildInheritancePsbt, signInheritancePsbt, finalizeInheritancePsbt,
  encodeSilentPaymentAddress, decodeSilentPaymentAddress, silentPaymentAddress,
  silentPaymentOutputScript, silentPaymentSend, silentPaymentScanTx, silentPaymentScan,
  silentPaymentSpend } from '../src/wallet/index.js';
import qrcode from 'qrcode-generator';
import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha256';
import { secp256k1, schnorr } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

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
/* Tabela progressiva de ganho de capital (15/17,5/20/22,5%) */
eq('progressivo: ganho 3M => 15%', Math.round(impostoProgressivo(3_000_000)), 450000);
eq('progressivo: ganho 5M => 15%', Math.round(impostoProgressivo(5_000_000)), 750000);
eq('progressivo: ganho 7M => 5M*15% + 2M*17,5%', Math.round(impostoProgressivo(7_000_000)), 750000 + 350000);
eq('progressivo: ganho 40M topo 22,5%', Math.round(impostoProgressivo(40_000_000)), 750000 + 875000 + 4_000_000 + 2_250_000);
eq('estimarImposto progressivo default', Math.round(estimarImposto({ vendaMes: 8_000_000, valorVenda: 7_000_000, custo: 0, limite: 35000 }).imposto), 1_100_000);
eq('estimarImposto alíquota efetiva 7M', estimarImposto({ vendaMes: 8_000_000, valorVenda: 7_000_000, custo: 0, limite: 35000 }).aliquotaEfetiva.toFixed(2), (1_100_000 / 7_000_000 * 100).toFixed(2));

/* Prova de integridade (vetor SHA-256 de "abc") */
eq('sha256("abc")', sha256Hex(new TextEncoder().encode('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

/* QR: roundtrip encode -> pixels RGBA -> decode */
function qrToRGBA(text, scale = 5, margin = 4) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), size = (n + margin * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) {
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const x = (c + margin) * scale + dx, y = (r + margin) * scale + dy, i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 0;
    }
  }
  return { data, width: size, height: size };
}
const qimg = qrToRGBA('PSBT-TESTE-air-gap-123');
eq('QR roundtrip (encode->decode)', decodeQR(qimg.data, qimg.width, qimg.height), 'PSBT-TESTE-air-gap-123');

/* Multisig 2-de-3: endereço determinístico (BIP67) + roundtrip montar->assinar(x2)->finalizar */
const c0 = createMultisigCosigner(), c1 = createMultisigCosigner(), c2 = createMultisigCosigner();
const grp = [c0.accountXpub, c1.accountXpub, c2.accountXpub];
eq('multisig endereço é tb1 (P2WSH)', multisigAddresses(grp, 2, 1)[0].address.startsWith('tb1'), true);
eq('multisig endereço independe da ordem (BIP67)',
  multisigAddresses(grp, 2, 1)[0].address, multisigAddresses([c2.accountXpub, c0.accountXpub, c1.accountXpub], 2, 1)[0].address);
const mb = buildMultisigPsbt({ xpubs: grp, m: 2, utxos: [{ txid: 'bb' + '00'.repeat(31), vout: 0, valueSats: 200000, chain: 0, index: 0 }], toAddress: multisigAddresses(grp, 2, 2)[1].address, amountSats: 100000, feeRate: 2 });
const s1 = signMultisigPsbt(mb.psbt, c0.mnemonic);
eq('cosigner 1 assinou', s1.signedInputs, 1);
const s2 = signMultisigPsbt(s1.psbt, c1.mnemonic);
eq('cosigner 2 assinou', s2.signedInputs, 1);
const mfin = finalizePsbt(s2.psbt);
eq('multisig: txid final 64 hex', /^[0-9a-f]{64}$/.test(mfin.txid), true);

/* Recuperação social (Shamir): split 3-de-5 + recompor */
const shMn = createTestnetWallet().mnemonic;
const shares = await splitMnemonic(shMn, 5, 3);
eq('shamir gera 5 partes', shares.length, 5);
eq('shamir recompõe 3-de-5 == original', await combineMnemonic([shares[0], shares[2], shares[4]]), shMn);

/* Herança com timelock (cofre P2WSH): endereço + resgate (herdeiro+timelock) + normal (2-de-3) */
const ihA = createMultisigCosigner(), ihB = createMultisigCosigner(), ihC = createMultisigCosigner(), ihH = createMultisigCosigner();
const cox = [ihA.accountXpub, ihB.accountXpub, ihC.accountXpub];
const TL = 144;
const vault = inheritanceAddresses({ cosignerXpubs: cox, heirXpub: ihH.accountXpub, timelock: TL, count: 1 })[0];
eq('herança: endereço P2WSH (tb1q…)', /^tb1q[0-9a-z]{50,}$/.test(vault.address), true);
const vaultR = inheritanceAddresses({ cosignerXpubs: [cox[2], cox[0], cox[1]], heirXpub: ihH.accountXpub, timelock: TL, count: 1 })[0];
eq('herança: endereço independe da ordem dos cosigners (BIP67)', vaultR.address, vault.address);

const utxo = [{ txid: '11'.repeat(32), vout: 0, chain: 0, index: 0, valueSats: 100000 }];
const dest = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
// Resgate: herdeiro sozinho após o timelock
const rb = buildInheritancePsbt({ cosignerXpubs: cox, heirXpub: ihH.accountXpub, timelock: TL, utxos: utxo, toAddress: dest, amountSats: 90000, feeRate: 1, mode: 'recovery' });
const rs = signInheritancePsbt(rb.psbt, ihH.mnemonic);
eq('herança/resgate: herdeiro assina a entrada', rs.signedInputs, 1);
eq('herança/resgate: txid 64 hex', /^[0-9a-f]{64}$/.test(finalizeInheritancePsbt(rs.psbt, 'recovery').txid), true);
// Normal: 2 de 3 co-signatários
const nb = buildInheritancePsbt({ cosignerXpubs: cox, heirXpub: ihH.accountXpub, timelock: TL, utxos: utxo, toAddress: dest, amountSats: 90000, feeRate: 1, mode: 'normal' });
const nf = finalizeInheritancePsbt(signInheritancePsbt(signInheritancePsbt(nb.psbt, ihA.mnemonic).psbt, ihC.mnemonic).psbt, 'normal');
eq('herança/normal: 2-de-3 finaliza, txid 64 hex', /^[0-9a-f]{64}$/.test(nf.txid), true);
// Negativo: uma assinatura só não fecha o caminho normal
let needs2 = false; try { finalizeInheritancePsbt(signInheritancePsbt(nb.psbt, ihA.mnemonic).psbt, 'normal'); } catch { needs2 = true; }
eq('herança/normal: 1 assinatura não finaliza (precisa de 2)', needs2, true);

/* Silent Payments (BIP-352): codificador confere com o vetor oficial + roundtrip */
eq('SP: endereço == vetor oficial BIP-352 (mainnet)',
  encodeSilentPaymentAddress('0220bcfac5b99e04ad1a06ddfb016ee13582609d60b6291e98d01a9bc9a16c96d4', '025cc9856d6f8375350e123978daac200c260cb5b5ae83106cab90484dcd8fcf36', 'main'),
  'sp1qqgste7k9hx0qftg6qmwlkqtwuy6cycyavzmzj85c6qdfhjdpdjtdgqjuexzk6murw56suy3e0rd2cgqvycxttddwsvgxe2usfpxumr70xc9pkqwv');
const spA = silentPaymentAddress(createTestnetWallet().mnemonic, 'test');
eq('SP: endereço testnet começa com tsp1', /^tsp1[0-9a-z]+$/.test(spA.address), true);
const spDec = decodeSilentPaymentAddress(spA.address);
eq('SP: decode recupera scan+spend', spDec.scanPub === spA.scanPub && spDec.spendPub === spA.spendPub, true);

/* Silent Payments ENVIO: kernel confere com o vetor oficial "Simple send: two inputs" */
const spVecOut = silentPaymentOutputScript({
  inputPrivKeys: ['eadc78165ff1f8ea94ad7cfdc54990738a4c53f6e0507b42154201b8e5dff3b1', '93f5ed907ad5b2bdbbdcb5d9116ebc0a4e1f92f910d5260237fa45a9408aad16'],
  outpoints: [{ txid: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', vout: 0 }, { txid: 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d', vout: 0 }],
  scanPub: '0220bcfac5b99e04ad1a06ddfb016ee13582609d60b6291e98d01a9bc9a16c96d4',
  spendPub: '025cc9856d6f8375350e123978daac200c260cb5b5ae83106cab90484dcd8fcf36', k: 0,
});
eq('SP/envio: output x-only == vetor oficial', spVecOut.xonly, '3e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1');
/* Envio integrado: monta→assina→finaliza um tx testnet pagando um endereço SP */
const spSender = createTestnetWallet();
const spRecv = silentPaymentAddress(createTestnetWallet().mnemonic, 'test').address;
const spUtxo = [{ txid: '33'.repeat(32), vout: 0, chain: 0, index: 0, valueSats: 200000 }];
const spSent = silentPaymentSend({ mnemonic: spSender.mnemonic, accountXpub: spSender.accountXpub, utxos: spUtxo, toAddress: spRecv, amountSats: 150000, feeRate: 1 });
eq('SP/envio: txid 64 hex', /^[0-9a-f]{64}$/.test(spSent.txid), true);
eq('SP/envio: output x-only 64 hex', /^[0-9a-f]{64}$/.test(spSent.outputXonly), true);

/* Silent Payments RECEBIMENTO: scanner confere com o vetor oficial (output + tweak) */
const spScan = silentPaymentScanTx({
  scanPriv: '0f694e068028a717f8af6b9411f9a133dd3565258714cc226594b34db90c1f2c',
  spendPub: '025cc9856d6f8375350e123978daac200c260cb5b5ae83106cab90484dcd8fcf36',
  inputPubKeys: ['025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5', '03bd85685d03d111699b15d046319febe77f8de5286e9e512703cdee1bf3be3792'],
  outpoints: [{ txid: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', vout: 0 }, { txid: 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d', vout: 0 }],
  outputs: [{ vout: 0, xonly: '3e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1', valueSats: 1000 }],
});
eq('SP/scan: encontra 1 output', spScan.length, 1);
eq('SP/scan: output x-only == vetor', spScan[0].xonly, '3e9fce73d4e77a4809908e3c3a2e54ee147b9312dc5044a193d1fc85de46e3c1');
eq('SP/scan: tweak == vetor', spScan[0].tweak, 'f438b40179a3c4262de12986c0e6cce0634007cdc79c1dcd3e20b9ebc2e7eef6');
eq('SP/scan: nada quando não é seu', silentPaymentScanTx({ scanPriv: '0f694e068028a717f8af6b9411f9a133dd3565258714cc226594b34db90c1f2c', spendPub: '025cc9856d6f8375350e123978daac200c260cb5b5ae83106cab90484dcd8fcf36', inputPubKeys: ['025a1e61f898173040e20616d43e9f496fba90338a39faa1ed98fcbaeee4dd9be5', '03bd85685d03d111699b15d046319febe77f8de5286e9e512703cdee1bf3be3792'], outpoints: [{ txid: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', vout: 0 }, { txid: 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d', vout: 0 }], outputs: [{ vout: 0, xonly: '0000000000000000000000000000000000000000000000000000000000000001', valueSats: 1 }] }).length, 0);

/* Silent Payments GASTO: monta o sweep de um output SP e a assinatura Schnorr confere
 * (independentemente) com a chave de saída sobre o sighash BIP-341 canônico. */
{
  const Pt = secp256k1.ProjectivePoint, nn = secp256k1.CURVE.n;
  const M = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  const tweak = 'f438b40179a3c4262de12986c0e6cce0634007cdc79c1dcd3e20b9ebc2e7eef6';
  const B = Pt.fromHex(silentPaymentAddress(M, 'test').spendPub);
  const xonly = hex.encode(B.add(Pt.BASE.multiply(BigInt('0x' + tweak) % nn)).toRawBytes(true).slice(1)); // P_k = B_spend + t·G
  const toAddr = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
  const src = 'aa'.repeat(32);
  const r = silentPaymentSpend({ mnemonic: M, network: 'test', inputs: [{ txid: src, vout: 0, xonly, tweak, valueSats: 100000 }], toAddress: toAddr, feeRate: 2 });
  eq('SP/spend: gera txid', /^[0-9a-f]{64}$/.test(r.txid), true);
  eq('SP/spend: 1 entrada', r.inputsCount, 1);
  eq('SP/spend: valor após taxa', r.sent, 100000 - r.fee);
  const dtx = btc.Transaction.fromRaw(hex.decode(r.hex));
  const wsig = dtx.getInput(0).finalScriptWitness[0];
  eq('SP/spend: assinatura key-path 64 bytes', wsig.length, 64);
  const v = new btc.Transaction();
  v.addInput({ txid: hex.decode(src), index: 0, witnessUtxo: { script: hex.decode('5120' + xonly), amount: 100000n } });
  v.addOutputAddress(toAddr, BigInt(r.sent), btc.TEST_NETWORK);
  const sh = v.preimageWitnessV1(0, [hex.decode('5120' + xonly)], 0, [100000n]);
  eq('SP/spend: testemunha confere com a chave de saída (independente)', schnorr.verify(wsig, sh, hex.decode(xonly)), true);
  let threw = false; try { silentPaymentSpend({ mnemonic: M, network: 'test', inputs: [{ txid: src, vout: 0, xonly, tweak: '00'.repeat(31) + '01', valueSats: 100000 }], toAddress: toAddr }); } catch { threw = true; }
  eq('SP/spend: recusa output que não é seu', threw, true);
  let dust = false; try { silentPaymentSpend({ mnemonic: M, network: 'test', inputs: [{ txid: src, vout: 0, xonly, tweak, valueSats: 200 }], toAddress: toAddr }); } catch { dust = true; }
  eq('SP/spend: recusa valor abaixo do mínimo', dust, true);
  // sweep de DOIS txids diferentes numa só transação
  const r2 = silentPaymentSpend({ mnemonic: M, network: 'test', inputs: [{ txid: 'aa'.repeat(32), vout: 0, xonly, tweak, valueSats: 100000 }, { txid: 'bb'.repeat(32), vout: 1, xonly, tweak, valueSats: 50000 }], toAddress: toAddr, feeRate: 2 });
  eq('SP/spend: sweep multi-txid 2 entradas', r2.inputsCount, 2);
  eq('SP/spend: multi soma entradas', r2.sent, 150000 - r2.fee);
}

/* Gera uma xpub de CONTA testnet (m/84'/1'/0') determinística, para usar como exemplo na UI.
 * Só material PÚBLICO é exportado/impresso. */
const seed = sha256('bussola exemplo testnet publico');
const master = HDKey.fromMasterSeed(seed);
const account = master.derive("m/84'/1'/0'");
console.log('\nEXEMPLO_XPUB_TESTNET=' + account.publicExtendedKey);
console.log('  primeiros endereços tb1:', deriveAddresses(account.publicExtendedKey, 2, 'tb').map(a => a.address).join(', '));

console.log(fail ? `\nFALHOU: ${fail} teste(s)` : '\nTODOS OS TESTES OK');
process.exit(fail ? 1 : 0);
