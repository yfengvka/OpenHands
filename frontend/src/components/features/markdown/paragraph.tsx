import React from "react";
import { ExtraProps } from "react-markdown";

export function Paragraph({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node, // node is part of the react-markdown API for custom renderers, keep it for API compatibility
  ...props
}: React.ClassAttributes<HTMLParagraphElement> &
  React.HTMLAttributes<HTMLParagraphElement> &
  ExtraProps) {
  return (
    <p {...props} className="pb-[10px] last:pb-0">
      {children}
    </p>
  );
}
