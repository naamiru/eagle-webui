import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Icon from "~/components/Icon/Icon";
import {
  DEFAULT_PROXY_URL,
  getProxyConfig,
  type ProxyConfig,
  resetToDefault,
  setProxyConfig,
  type ValidationResult,
  validateProxyConnection,
} from "~/services/settings";
import styles from "~/styles/settings.module.css";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialSetup = searchParams.get("initial") === "true";

  const [proxyUrl, setProxyUrlState] = useState("");
  const [proxyToken, setProxyTokenState] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "error" | "unknown"
  >("unknown");
  const [errorMessage, setErrorMessage] = useState("");

  const handleValidationResult = useCallback((result: ValidationResult) => {
    switch (result) {
      case "connected":
        setConnectionStatus("connected");
        setErrorMessage("");
        break;
      case "unauthorized":
        setConnectionStatus("error");
        setErrorMessage(
          "Authentication failed. Please check your token is correct.",
        );
        break;
      case "unreachable":
        setConnectionStatus("error");
        setErrorMessage(
          "Cannot reach proxy server. Please check the URL and ensure the Eagle proxy is running.",
        );
        break;
    }
  }, []);

  const handleAutoSetup = useCallback(
    async (url: string, token: string) => {
      setIsValidating(true);
      setErrorMessage("");
      setConnectionStatus("unknown");

      try {
        const result = await validateProxyConnection(url.trim(), token.trim());

        if (result === "connected") {
          const config: ProxyConfig = {
            url: url.trim(),
            token: token.trim(),
          };
          setProxyConfig(config);
          setConnectionStatus("connected");
          setErrorMessage("");

          // Auto-redirect after successful validation
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          handleValidationResult(result);
        }
      } catch (_error) {
        setConnectionStatus("error");
        setErrorMessage("Network error occurred while testing connection");
      } finally {
        setIsValidating(false);
      }
    },
    [handleValidationResult, navigate],
  );

  useEffect(() => {
    const config = getProxyConfig();
    setProxyUrlState(config.url);
    setProxyTokenState(config.token || "");

    // Handle query parameters for auto-setup
    const urlParam = searchParams.get("url");
    const tokenParam = searchParams.get("token");

    if (urlParam) {
      setProxyUrlState(urlParam);
    }

    if (tokenParam) {
      setProxyTokenState(tokenParam);
    }

    // Auto-validate if both parameters are present
    if (urlParam && tokenParam) {
      handleAutoSetup(urlParam, tokenParam);
    }
  }, [searchParams, handleAutoSetup]);

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
      const result = await validateProxyConnection(
        proxyUrl.trim(),
        proxyToken.trim() || undefined,
      );

      if (result === "connected") {
        const config: ProxyConfig = {
          url: proxyUrl.trim(),
        };
        if (proxyToken.trim()) {
          config.token = proxyToken.trim();
        }
        setProxyConfig(config);
        setConnectionStatus("connected");
        setErrorMessage("");

        // Auto-redirect after successful validation
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        handleValidationResult(result);
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
    setProxyTokenState("");
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

        <div className={styles.formGroup}>
          <label htmlFor="proxyToken">Authentication Token:</label>
          <div className={styles.tokenInputWrapper}>
            <input
              id="proxyToken"
              type={showToken ? "text" : "password"}
              value={proxyToken}
              onChange={(e) => setProxyTokenState(e.target.value)}
              placeholder="Enter authentication token"
            />
            <button
              type="button"
              className={styles.toggleTokenButton}
              onClick={() => setShowToken(!showToken)}
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              <Icon
                name={showToken ? "eyeOff" : "eye"}
                size={20}
                aria-hidden="true"
              />
            </button>
          </div>
          <small>
            The authentication token provided when starting the proxy server
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
            Check the authentication token matches what was displayed when
            starting the proxy
          </li>
          <li>
            If using a remote server, ensure it's accessible from your network
          </li>
        </ul>
      </div>
    </main>
  );
}
