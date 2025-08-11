import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Icon from "~/components/Icon/Icon";
import {
  DEFAULT_PROXY_URL,
  getProxyUrl,
  resetToDefault,
  setProxyUrl,
  validateProxyUrl,
} from "~/services/settings";
import styles from "~/styles/settings.module.css";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialSetup = searchParams.get("initial") === "true";

  const [proxyUrl, setProxyUrlState] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "error" | "unknown"
  >("unknown");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setProxyUrlState(getProxyUrl());
  }, []);

  const handleTest = async () => {
    if (!proxyUrl.trim()) {
      setErrorMessage("Please enter a proxy URL");
      setConnectionStatus("error");
      return;
    }

    setIsValidating(true);
    setErrorMessage("");
    setConnectionStatus("unknown");

    try {
      const isValid = await validateProxyUrl(proxyUrl.trim());

      if (isValid) {
        setConnectionStatus("connected");
        setProxyUrl(proxyUrl.trim());
        setErrorMessage("");

        // Auto-redirect after successful validation
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setConnectionStatus("error");
        setErrorMessage(
          "Failed to connect to proxy server. Please check the URL and ensure the Eagle proxy is running.",
        );
      }
    } catch (_error) {
      setConnectionStatus("error");
      setErrorMessage("Network error occurred while testing connection");
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    resetToDefault();
    setProxyUrlState(DEFAULT_PROXY_URL);
    setConnectionStatus("unknown");
    setErrorMessage("");
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "✓ Connected";
      case "error":
        return "✗ Connection Failed";
      default:
        return "Not tested";
    }
  };

  const getStatusClass = () => {
    switch (connectionStatus) {
      case "connected":
        return styles.connected;
      case "error":
        return styles.error;
      default:
        return styles.unknown;
    }
  };

  return (
    <main className={styles.container}>
      <nav className={styles.header}>
        <ul>
          <li>
            <Link to="/" aria-label="戻る">
              <Icon name="arrowLeft" size={20} aria-label="Back" />
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <strong>Proxy Settings</strong>
          </li>
        </ul>
        <ul>
          <li></li>
        </ul>
      </nav>

      {isInitialSetup && (
        <article className={styles.setupAlert}>
          <h3>Initial Setup Required</h3>
          <p>
            Please configure your Eagle proxy server URL to continue using the
            application.
          </p>
        </article>
      )}

      <form>
        <div className={styles.formGroup}>
          <label htmlFor="proxyUrl">Proxy Server URL:</label>
          <input
            id="proxyUrl"
            type="url"
            value={proxyUrl}
            onChange={(e) => setProxyUrlState(e.target.value)}
            placeholder="http://localhost:57821"
          />
          <small>
            Enter the URL where your Eagle proxy server is running (default:
            http://localhost:57821)
          </small>
        </div>

        <div className={styles.statusIndicator}>
          <strong>Connection Status: </strong>
          <span className={getStatusClass()}>{getStatusText()}</span>
        </div>

        {errorMessage && <mark className={styles.error}>{errorMessage}</mark>}

        {connectionStatus === "connected" && (
          <mark className={styles.connected}>
            Connection successful! Redirecting to application...
          </mark>
        )}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleTest}
            disabled={isValidating}
            aria-busy={isValidating}
          >
            {isValidating ? "Testing..." : "Test Connection"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isValidating}
            className="secondary"
          >
            Reset to Default
          </button>
        </div>
      </form>

      <div className={styles.troubleshooting}>
        <h3>Troubleshooting</h3>
        <ul>
          <li>Ensure the Eagle proxy server is running</li>
          <li>Check that the URL is correct (including http:// or https://)</li>
          <li>
            Verify the port number matches your proxy server configuration
          </li>
          <li>
            If using a remote server, ensure it's accessible from your network
          </li>
        </ul>
      </div>
    </main>
  );
}
