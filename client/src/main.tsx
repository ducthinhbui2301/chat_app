// import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from './App.tsx';
import './index.css';
import { Store } from '@/redux/main.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={Store}>
    {/* <React.StrictMode> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    {/* </React.StrictMode > */}
  </Provider>
)
