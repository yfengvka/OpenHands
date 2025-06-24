import React from "react";
import { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useDispatch } from "react-redux";
import { setTargetFileInVSCode } from "#/store/ideSlice"; // Adjusted path

// See https://github.com/remarkjs/react-markdown?tab=readme-ov-file#use-custom-components-syntax-highlight

/**
 * Component to render code blocks in markdown.
 */
export function Code({
  children,
  className,
}: React.ClassAttributes<HTMLElement> &
  React.HTMLAttributes<HTMLElement> &
  ExtraProps) {
  const match = /language-(\w+)/.exec(className || ""); // get the language
  const dispatch = useDispatch();

  if (!match) {
    const isMultiline = String(children).includes("\n");

    if (!isMultiline) {
      const rawText = String(children);
      let normalizedPath = rawText.trim(); // Trim whitespace early

      // Normalize path
      if (normalizedPath.startsWith("file:///")) {
        normalizedPath = normalizedPath.substring(8);
      }
      // Replace backslashes with forward slashes for consistency
      normalizedPath = normalizedPath.split("\\").join("/");
      if (normalizedPath.startsWith("./")) {
        normalizedPath = normalizedPath.substring(2);
      }

      const finalPath = normalizedPath.trim();

      const handleFileLinkClick = (
        event: React.MouseEvent<HTMLButtonElement>,
      ) => {
        event.preventDefault();
        if (finalPath) {
          // Check if path is not empty
          dispatch(setTargetFileInVSCode(finalPath));
        }
      };
      return (
        <button
          type="button"
          onClick={handleFileLinkClick}
          title={`Open file: ${finalPath}`}
          className={className} // Pass className, though usually undefined here
          style={{
            // Original styles from <code>
            backgroundColor: "#2a3038",
            padding: "0.2em 0.4em",
            borderRadius: "4px",
            color: "#e6edf3",
            border: "1px solid #30363d",
            // Button reset and inline behavior styles
            cursor: "pointer",
            fontFamily: "inherit", // Inherit font, typically monospace for code
            fontSize: "inherit",
            textAlign: "left",
            appearance: "none", // Remove default button appearance
            display: "inline", // Act like an inline element
            verticalAlign: "baseline",
            margin: 0, // Reset margin
          }}
        >
          {rawText} {/* Display the original, untrimmed text */}
        </button>
      );
    }

    return (
      <pre
        style={{
          backgroundColor: "#2a3038",
          padding: "1em",
          borderRadius: "4px",
          color: "#e6edf3",
          border: "1px solid #30363d",
          overflow: "auto",
        }}
      >
        <code className={className}>{String(children).replace(/\n$/, "")}</code>
      </pre>
    );
  }

  return (
    <SyntaxHighlighter
      className="rounded-lg"
      style={vscDarkPlus}
      language={match?.[1]}
      PreTag="div"
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}
