// import React from "react";
import { createRoot } from 'react-dom/client'

// import styles from "./index.module.css";
import App from './App'

const rootEle = document.getElementById('root')
if (rootEle) {
  createRoot(rootEle).render(<App />)
} else {
  throw new Error('Cant find root element')
}
