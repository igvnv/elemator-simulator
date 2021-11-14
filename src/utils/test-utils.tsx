import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import App from '../app';

const WrappedTestEnvironment: React.FC = () => {
  return <App />;
};

const customRender = (
  ui?: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui ?? <></>, { wrapper: WrappedTestEnvironment, ...options });

export * from '@testing-library/react';
export { customRender as render };
