<p align="center">
<img src="https://github.com/akashic-games/amflow-util/blob/main/img/akashic.png" />
</p>

# amflow-util

このモジュールは、[Akashic Message Flow (AMFlow)](https://github.com/akashic-games/amflow) のユーティリティモジュールで以下を提供します。
**ゲーム開発者(Akashic Engineの利用者)がこのモジュールを直接利用する必要はありません**。

|   提供するクラス   |                        内容                           |             import/require() 元             |
|:-------------------|:------------------------------------------------------|:--------------------------------------------|
| MemoryAMFlowClient | tick データをオンメモリに保持する AMFlow 実装         | @akashic/amflow-util/lib/MemoryAMFlowClient
| ReplayAMFlowProxy  | 与えられた playlog データをそのまま返す AMFlow 実装。<br/>ただし、与えられた範囲外のデータは別の AMFlow インスタンスに問い合わせる| @akashic/amflow-util/lib/ReplayAmflowProxy

## インストール

Node.jsが必要です。次のコマンドでインストールできます。

```
npm install @akashic/amflow-util
```

## ビルド方法

TypeScriptで書かれています。インストール後にビルドしてください。

```sh
npm install
npm run build
```

## 利用方法

`require()` してください。

```javascript
var MemoryAMFlowClient = require("@akashic/amflow-util/lib/MemoryAMFlowClient").MemoryAMFlowClient;

var amflow = new MemoryAMFlowClient({
  playId: "0"
});
```

## テスト方法

```
npm test
```

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](https://github.com/akashic-games/amflow-util/blob/master/LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
