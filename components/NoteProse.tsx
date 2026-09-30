import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

function isExternal(href?: string) {
  return !!href && /^https?:\/\//.test(href);
}

const components = {
  a: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) =>
    isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    ) : (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  img: ({ src, alt, ...rest }: ComponentPropsWithoutRef<"img">) => (
    // Plain img keeps MDX authoring simple (no width/height needed).
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />
  ),
};

export function NoteProse({ source }: { source: string }) {
  return (
    <div className="note-prose">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  );
}
