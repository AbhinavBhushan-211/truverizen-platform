import { Routes, Route } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultPage } from './pages/ResultPage';
import { DownloadPage } from './pages/DownloadPage';

export function CourtIndexRoutes() {
  return (
    <Routes>
      <Route path="upload" element={<UploadPage />} />
      <Route path="processing" element={<ProcessingPage />} />
      <Route path="result" element={<ResultPage />} />
      <Route path="download" element={<DownloadPage />} />
    </Routes>
  );
}
