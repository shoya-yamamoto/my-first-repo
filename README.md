# 上海 - Mahjong Solitaire

スマートフォン向け上海（麻雀ソリティア）ゲームです。

## 遊び方

- 同じ柄の牌を2つタップして消していきます
- 左右どちらかが空いていて、上に牌が乗っていない「自由な牌」のみ選択可能です
- すべての牌を消せばクリア！

## 操作

| ボタン | 説明 |
|--------|------|
| ヒント | 取れるペアをハイライト表示 |
| 配り直し | 残りの牌をシャッフル |
| 新規 | 最初からやり直し |

## 技術スタック

- React (Hooks)
- CSS（レスポンシブ表示）と一部の動的インラインスタイル

## そのまま遊ぶ

`index.html`をブラウザーで開いてください。牌画像と`assets/`を同じフォルダー構成に保てば、外部CDNへの接続は不要です。GitHub Pagesでもリポジトリ直下から配信できます。

## 開発

Node.js 20以降で以下を実行します。

```sh
npm ci
npm test
npm run build
```

`src/`変更後はビルドし、`assets/app.js`と`assets/app.css`も更新してください。ReactとCSSを事前にまとめるので、ブラウザー上のBabel変換は不要です。

- `src/game.js`: 5配置、牌の生成、取れる牌の判定
- `src/state.js`: ペア探索、配り直し、スコア、履歴と一手戻す
- `src/ShanghaiGame.jsx`: 画面と操作
- `src/style.css`: レスポンシブ表示と演出
- `src/main.jsx`: 起動処理
- `tests/game.test.js`: ルールの回帰テスト

一手戻すでは配り直し前の状態にも戻れます。新しいゲームでは配置を選べます。ドラッグで盤面移動、ピンチ・ホイール・＋／−で拡大縮小し、全体表示で位置を戻せます。

詳細な分析・優先順位・確認結果・残課題は[IMPROVEMENTS.md](IMPROVEMENTS.md)を参照してください。

## 他のReactアプリに組み込む

React環境で `shanghai.jsx` をインポートして使用してください。

```jsx
import ShanghaiGame from './shanghai';

function App() {
  return <ShanghaiGame />;
}
```
