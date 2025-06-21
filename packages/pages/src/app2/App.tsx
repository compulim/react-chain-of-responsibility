import React, { memo, useCallback, useEffect, useState } from 'react';
import './App.css';
import GitHubLogo from './GitHubLogo';
import SourceCode from './SourceCode';
import TableOfContent from './TableOfContent';
import WebPage, { CodeEventHandler } from './WebPage';

function App() {
  const [tab, setTab] = useState(location.hash.replace(/^#/u, ''));
  const [code, setCode] = useState('');

  const handleCode = useCallback<CodeEventHandler>(
    data => {
      setCode(data.code);
    },
    [setCode]
  );

  useEffect(() => {
    const handleHashChange = () => setTab(location.hash.replace(/^#/u, ''));

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setTab]);

  return (
    <div className="app">
      <div className="app__title-bar">
        <h1 className="app__title">react-chain-of-responsibility demo</h1>
        <div>
          <a
            className="app__logo"
            href="https://github.com/compulim/react-chain-of-responsibility"
            rel="noopener noreferer"
            target="_blank"
            title="GitHub repository"
          >
            <GitHubLogo />
          </a>
        </div>
      </div>
      <div className="app__pane app__pane--code app__pane--left">
        {tab ? <SourceCode code={code} /> : <TableOfContent />}
      </div>
      <div className="app__pane app__pane--right">{tab && <WebPage onCode={handleCode} src={tab} />}</div>
    </div>
  );
}

export default memo(App);
