"use client";

import styles from "./Troubleshooting.module.css";

export function Troubleshooting() {
  return (
    <div className={`container ${styles.container}`}>
      <h4>画像データを取得できません</h4>
      <article>
        <header>
          <h6>トラブルシューティング</h6>
        </header>
        <section>
          <h5>Eagle は起動していていますか？</h5>
          <p>
            <a target="_blank" href="http://localhost:41595/api/library/info">
              http://localhost:41595/api/library/info
            </a>{" "}
            にアクセスして Eagle API が動いていることを確認してください。
          </p>
          <p>
            Eagle API の URL が異なる場合はサーバー起動オプションで URL
            を指定してください。
          </p>
          <pre>npx eagle-webui --eagle-api-url http://192.168.0.100:41595</pre>
        </section>
        <section>
          <h5>Eagle WebUI サーバーは Eagle と同じマシンで実行してください</h5>
          <p>
            少なくともサーバーから Eagle API にアクセス可能で、API
            が返すパスで画像を参照できる必要があります。
          </p>
        </section>
      </article>
      <button className="secondary" onClick={() => window.location.reload()}>
        リロード
      </button>
    </div>
  );
}
