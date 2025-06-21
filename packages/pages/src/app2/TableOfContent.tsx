import { micromark } from 'micromark';
import React, { memo, useMemo } from 'react';
import './TableOfContent.css';

const MARKDOWN = `
## Table of content

- [demo1.html](#demo1.html)
- [demo-fluent.html](#demo-fluent.html)
`;

function TableOfContent() {
  const html = useMemo(() => ({ __html: micromark(MARKDOWN, undefined) }), []);

  return <div className="table-of-content" dangerouslySetInnerHTML={html} />;
}

export default memo(TableOfContent);
