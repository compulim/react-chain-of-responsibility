import './Demo.css';

import React from 'react';

import Link from './linkDecoratorService/Link.tsx';
import Provider from './linkDecoratorService/Provider.tsx';

const INTERNAL_HOSTS = ['internal.example.com'];

const Demo = () => (
  <Provider internalHosts={INTERNAL_HOSTS}>
    <div className="link-decorator-demo">
      <p>
        This is a{' '}
        <Link className="link-decorator-demo__link" href="/index.html">
          link to relative page
        </Link>
        .
      </p>
      <p>
        This is a{' '}
        <Link className="link-decorator-demo__link" href="https://bing.com/">
          link to an external website
        </Link>
        .
      </p>
      <p>
        This is a{' '}
        <Link className="link-decorator-demo__link" href="https://internal.example.com/index.html">
          link to a whitelisted internal website
        </Link>
        .
      </p>
      <p>
        This is a <Link className="link-decorator-demo__link">link without destination</Link> is treated as plain text.
      </p>
    </div>
  </Provider>
);

export default Demo;
