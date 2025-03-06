import React, { useState } from 'react';
import { Camera } from './Record';

import styles from './App.module.css'

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <Camera />
    </div>
  )
};

export default App;
