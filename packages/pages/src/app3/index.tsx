// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.tsx';
// import './index.css';

// const rootElement = document.getElementById('root');

// rootElement && createRoot(rootElement).render(<App />);

import './esbuild.tsx';

import React from 'react';
import './index.css';
// Testing against multiple version of React.
// eslint-disable-next-line react/no-deprecated
import { render } from 'react-dom';

// import App from './App.tsx';
import Test from './Test5.tsx';

const rootElement = document.getElementById('root');

// render(<App />, rootElement);
render(<Test />, rootElement);
