import React, { memo, useCallback, useState } from 'react';
import './App.css';
import GitHubLogo from './GitHubLogo';
import SourceCode from './SourceCode';
import WebPage, { CodeEventHandler } from './WebPage';

function App() {
  const [tab] = useState('demo1.html');
  const [code, setCode] = useState('');

  const handleCode = useCallback<CodeEventHandler>(
    data => {
      setCode(data.code);
    },
    [setCode]
  );

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
        <SourceCode code={code} title={tab} />
      </div>
      <div className="app__pane app__pane--right">
        <WebPage onCode={handleCode} src={tab} />
      </div>
    </div>
  );
}

export default memo(App);
