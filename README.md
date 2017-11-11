# github-slack-gateway

Github Webhook を受け取り、Slack に通知する。
AWS API Gatewayと、lambdaを使用することを前提とする。

## Specification

* [x] プルリクエスト作成時にSlackに通知する
* [x] プルリクエストのレビュー状態変更時にSlackに通知する (自動的にプルリクエスト作成者にメンションを飛ばす)
* [x] プルリクエストのレビューコメントを付けた際にSlackに通知する
* [x] プルリクエストクローズ時に通知 (自動的にプルリクエスト作成者にメンションを飛ばす)
* [x] Githubのアカウント名をSlackのアカウント名に変換する
* [x] Slackのデスクトップ通知に対応(@付きメンションのときのみ)

* ※自動メンションは、本人以外の操作のときに飛ばす

## Directory Structure

```
lambda/ … AWS Lambda用のファイル群
  ├── config.json.template
  ├── index.js … Lambda のメインソース
  ├── node_modules/
apigateway/ … AWS API Gateway用のファイル群
  └── swagger-template.yaml  … API GatewayのSwaggerテンプレート (ホスト名とタイトルは空欄にしている)
```

## How to Deploy(Lambda)
### Setup/Configファイルを用意
* 設定ファイルのテンプレートから設定ファイルを用意
```
cp config.json.template config.json
```
* config.json に適切に内容を埋める
  * 以下例
```
{
  "token": "your-slack-api-token",
  "channel": "your-slack-channel",
  "github_to_slack":{
      "@github-name1" : "@slack-name1",
      "@github-name2" : "@slack-name2"
  }
}
```

### Setup/node_module パッケージをインストール
```
cd /path/to/github-slack-gateway/lambda
npm install
```

### デプロイ
* zip作成(ファイル名は何でも良い)
```
cd /path/to/github-slack-gateway/lambda
zip -r github.zip index.js WebHookHandler.js SlackClient.js node_modules config.json
```
* 作成したzipをLambdaにアップロード

## How to Setup API Gateway
* lambda が既にデプロイされている前提とする
* api-gatwway/swagger-template.yaml の 以下を修正する
  * <your api name>
    * 任意でOK
  * <your lambda's arn>
    * デプロイされた lambda の arn
* api-gateway で 上記修正済みの swagger-template.yaml をインポートする

## How to Run UnitTest
* lambda
```
cd /path/to/github-slack-gateway/lambda
./node_modules/mocha/bin/mocha
```
