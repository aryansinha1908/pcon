import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Syntax highlight color tokens matching the approved dark palette
const highlightSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), ["className", /^hljs/]],
    code: [...(defaultSchema.attributes?.code || []), ["className", /^language-/, /^hljs/]],
  },
};

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="blog-prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, highlightSchema],
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
        ]}
      >
        {content}
      </Markdown>
    </div>
  );
}

