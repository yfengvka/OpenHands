import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { I18nKey } from "#/i18n/declaration";
import { RootState } from "#/store";
import { RUNTIME_INACTIVE_STATES } from "#/types/agent-state";
import { useVSCodeUrl } from "#/hooks/query/use-vscode-url";
import { VSCODE_IN_NEW_TAB } from "#/utils/feature-flags";
// Placeholder: This Redux action/slice would need to be created by a developer

function VSCodeTab() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useVSCodeUrl();
  const { curAgentState } = useSelector((state: RootState) => state.agent);
  // Placeholder: These would come from the new ideSlice in Redux
  const { targetFilePathInVSCode, forceReloadKey } = useSelector(
    (state: RootState) =>
      state.ide || { targetFilePathInVSCode: null, forceReloadKey: 0 }, // Provide default if ide slice doesn't exist yet
  );
  const [effectiveIframeSrc, setEffectiveIframeSrc] = useState<string | null>(
    null,
  );
  const isRuntimeInactive = RUNTIME_INACTIVE_STATES.includes(curAgentState);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isCrossProtocol, setIsCrossProtocol] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.url) {
      try {
        const iframeProtocol = new URL(data.url).protocol;
        const currentProtocol = window.location.protocol;

        // Check if the iframe URL has a different protocol than the current page
        setIsCrossProtocol(
          VSCODE_IN_NEW_TAB() || iframeProtocol !== currentProtocol,
        );
      } catch (e) {
        // Silently handle URL parsing errors
        setIframeError(t("VSCODE$URL_PARSE_ERROR"));
      }
    }
  }, [data?.url]);

  useEffect(() => {
    if (data?.url) {
      let finalUrl = data.url;
      if (targetFilePathInVSCode) {
        // Ensure the base URL doesn't already have a file parameter that might conflict
        // A more robust URL manipulation might be needed if complex query params exist
        // Also, consider using URLSearchParams for cleaner query param addition
        if (finalUrl.includes("?")) {
          finalUrl += `&file=${encodeURIComponent(targetFilePathInVSCode)}`;
        } else {
          finalUrl += `?file=${encodeURIComponent(targetFilePathInVSCode)}`;
        }
      }
      setEffectiveIframeSrc(finalUrl);
    } else {
      setEffectiveIframeSrc(null);
    }
    // forceReloadKey is included to ensure this effect runs even if other dependencies haven't changed,
    // allowing a re-trigger of iframe loading if needed.
  }, [data?.url, targetFilePathInVSCode, forceReloadKey]);

  const handleOpenInNewTab = () => {
    if (data?.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
  };

  if (isRuntimeInactive) {
    return (
      <div className="w-full h-full flex items-center text-center justify-center text-2xl text-tertiary-light">
        {t("DIFF_VIEWER$WAITING_FOR_RUNTIME")}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center text-center justify-center text-2xl text-tertiary-light">
        {t("DIFF_VIEWER$WAITING_FOR_RUNTIME")}
      </div>
    );
  }

  if (error || (data && data.error) || !data?.url || iframeError) {
    return (
      <div className="w-full h-full flex items-center text-center justify-center text-2xl text-tertiary-light">
        {iframeError ||
          data?.error ||
          String(error) ||
          t(I18nKey.VSCODE$URL_NOT_AVAILABLE)}
      </div>
    );
  }

  // If cross-origin, show a button to open in new tab
  if (isCrossProtocol) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-xl text-tertiary-light text-center max-w-md">
          {t("VSCODE$CROSS_ORIGIN_WARNING")}
        </div>
        <button
          type="button"
          onClick={handleOpenInNewTab}
          className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors"
        >
          {t("VSCODE$OPEN_IN_NEW_TAB")}
        </button>
      </div>
    );
  }

  // If same origin, use the iframe
  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        key={
          effectiveIframeSrc
            ? `${effectiveIframeSrc}_${forceReloadKey}`
            : "vscode-iframe-key"
        }
        title={t(I18nKey.VSCODE$TITLE)}
        src={effectiveIframeSrc || ""}
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}

// Export the VSCodeTab directly since we're using the provider at a higher level
export default VSCodeTab;
