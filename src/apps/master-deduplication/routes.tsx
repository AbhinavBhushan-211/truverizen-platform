import { Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/MainPage';

export function MasterDeduplicationRoutes() {
  return (
    <Routes>
      <Route index element={<MainPage />} />
    </Routes>
  );
}
