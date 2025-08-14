"use client";

import { useTranslations } from "next-intl";
import styles from "./Troubleshooting.module.css";

export function Troubleshooting() {
  const t = useTranslations();

  return (
    <div className={`container ${styles.container}`}>
      <h4>{t("troubleshooting.title")}</h4>
      <article>
        <header>
          <h6>{t("troubleshooting.troubleshooting")}</h6>
        </header>
        <section>
          <h5>{t("troubleshooting.eagleRunning")}</h5>
          <p>
            {t("troubleshooting.checkApi")}{" "}
            <a target="_blank" href="http://localhost:41595/api/library/info">
              http://localhost:41595/api/library/info
            </a>
          </p>
          <p>{t("troubleshooting.urlDifferent")}</p>
          <pre>npx eagle-webui --eagle-api-url http://192.168.0.100:41595</pre>
        </section>
        <section>
          <h5>{t("troubleshooting.sameMachine")}</h5>
          <p>{t("troubleshooting.accessRequirement")}</p>
        </section>
      </article>
      <button className="secondary" onClick={() => window.location.reload()}>
        {t("navigation.reload")}
      </button>
    </div>
  );
}
