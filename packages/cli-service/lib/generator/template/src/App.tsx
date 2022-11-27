import React from 'react'

import { isFunction } from '@/utils/validate'

import Header from './components/Header'
import BasicLayout from './layout/BasicLayout'
import styles from './index.module.less'

console.log(isFunction(1))
function App() {
  return (
    <div className={styles.App}>
      <BasicLayout>
        <Header></Header>
      </BasicLayout>
    </div>
  )
}

export default App
