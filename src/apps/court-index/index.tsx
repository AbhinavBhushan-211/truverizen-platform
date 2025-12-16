import { Routes, Route, Navigate } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultPage } from './pages/ResultPage';

export function CourtIndexApp() {
  return (
    <Routes>
      <Route index element={<Navigate to="upload" replace />} />
      <Route path="upload" element={<UploadPage />} />
      <Route path="processing" element={<ProcessingPage />} />
      <Route path="result" element={<ResultPage />} />
    </Routes>
  );
}
