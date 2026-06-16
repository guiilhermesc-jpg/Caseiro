# App nativo (Android & iOS) — Bússola

O app nativo usa **Capacitor**: ele empacota exatamente o mesmo app web (a pasta `www/`) dentro
de um app Android e iOS. Mesmo código, duas lojas, e o site PWA continua valendo.

> 💡 **Quer testar AGORA, sem instalar nada?** Abra o site no celular e use **"Adicionar à tela
> de início"** (Android/Chrome e iOS/Safari). Vira um app instalável (PWA), idêntico ao nativo.

## Pré-requisitos
- **Node 20+** e o repositório clonado.
- **Android:** [Android Studio](https://developer.android.com/studio) (inclui SDK + emulador).
- **iOS:** um **Mac** com **Xcode** (a Apple só permite build de iOS no macOS).

## Preparar (uma vez)
```bash
cd bussola-bitcoin
npm ci                 # instala dependências
npm run cap:sync       # gera o bundle, monta www/ e sincroniza android/ e ios/
```

Se as pastas `android/` e `ios/` não existirem (foram regeneradas/ignoradas), crie-as:
```bash
npx cap add android
npx cap add ios
```

## Rodar no Android
```bash
npx cap open android      # abre no Android Studio
```
No Android Studio: selecione um emulador ou device e clique **Run ▶**. Para gerar o APK/AAB:
**Build → Build Bundle(s)/APK(s)**.

> A leitura de **QR pela câmera** exige permissão. Em `android/app/src/main/AndroidManifest.xml`
> adicione, se necessário: `<uses-permission android:name="android.permission.CAMERA"/>` e
> `<uses-feature android:name="android.hardware.camera" android:required="false"/>`.

## Rodar no iOS (Mac)
```bash
npx cap open ios          # abre no Xcode
```
No Xcode: selecione um simulador/device, ajuste o *Signing Team* e clique **Run ▶**. Para câmera,
adicione em `ios/App/App/Info.plist` a chave **NSCameraUsageDescription** com uma descrição.

## Fluxo de desenvolvimento
Sempre que mudar o app web, ressincronize:
```bash
npm run cap:sync
```
Isso reconstrói o bundle da carteira, recopia `www/` e atualiza os projetos nativos.

## Ícones e splash (opcional, recomendado para publicar)
```bash
npm i -D @capacitor/assets
# coloque um icon de 1024x1024 em resources/icon.png e rode:
npx capacitor-assets generate
```

## Notas
- **Identidade do app:** `appId` = `app.bussola.bitcoin`, `appName` = `Bússola`
  (veja `capacitor.config.json`).
- **Offline-first:** os arquivos do app são locais no app nativo; só preço/saldo/índices usam rede.
- **Segurança:** mesma base do web — testnet-first, libs auditadas, nunca pede a seed.
- **Publicar nas lojas:** requer conta de desenvolvedor (Google Play / Apple Developer) e build
  assinado. Faça a auditoria de segurança antes de habilitar mainnet.
