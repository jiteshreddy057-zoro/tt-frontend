import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Translator from './components/UnifiedTranslator';
import OCR from './components/OCR';
import Models from './components/ModelManager';
import CameraTranslator from './components/CameraTranslator';
import Interesting from './components/Interesting';
import Home from './components/Home';
import Layout from './components/Layout';
import MemoryGraph from './components/MemoryGraph';
import { Analytics } from '@vercel/analytics/react';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('username');
  return (
    <Router>
      <Analytics />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/auth" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="translator" element={<Translator />} />
          <Route path="ocr" element={<OCR />} />
          <Route path="camera" element={<CameraTranslator />} />
          <Route path="models" element={<Models />} />
          <Route path="interesting" element={<Interesting />} />
          <Route path="memory" element={<MemoryGraph />} />
        </Route>
      </Routes>
    </Router>
  );
};
export default App;

