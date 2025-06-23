import React from "react";
import { ExtraProps } from "react-markdown";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setTargetFileInVSCode } from "#/store/ideSlice"; // Adjust path as needed
import { I18nKey } from "#/i18n/declaration";

export function anchor({
  href,
  children,
  ...props // Capture other props passed by react-markdown
}: React.ClassAttributes<HTMLAnchorElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  if (!href) {
    // Fallback for safety, though react-markdown usually provides href for <a>
    // Render children as a span or similar non-interactive element if href is missing
    return <span {...props}>{children}</span>;
  }

  const isWebLink =
    href.startsWith("http:") ||
    href.startsWith("https:") ||
    href.startsWith("mailto:");

  if (isWebLink) {
    return (
      <a
        className="text-blue-500 hover:underline"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  // Assume it's a file path
  let normalizedPath = href;
  if (normalizedPath.startsWith("file:///")) {
    normalizedPath = normalizedPath.substring(8); // Length of "file:///"
  }
  // Replace backslashes with forward slashes for consistency
  normalizedPath = normalizedPath.replace(/\\/g, "/");

  // Remove leading "./" if present after other normalizations
  if (normalizedPath.startsWith("./")) {
    normalizedPath = normalizedPath.substring(2);
  }

  const handleFileLinkClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (
      normalizedPath &&
      normalizedPath.trim() !== ""
    ) {
      dispatch(setTargetFileInVSCode(normalizedPath));
    } else {
      // This case should ideally not be hit if href was present and normalization didn't empty it
      console.warn("Attempted to open an empty or invalid normalized file path from link:", href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleFileLinkClick}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit"
      title={t(I18nKey.VSCODE$OPEN_FILE_IN_EDITOR_TITLE, { filePath: normalizedPath })}
      // {...props} // Spreading props here might conflict with button's own attributes or type expectations.
                  // Only spread if certain props from <a> are desired and compatible.
                  // For now, let's be explicit about what we pass or inherit.
    >
      {children}
    </button>
  );
}
