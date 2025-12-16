import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from './components/ui/sonner';
import { TARAAssistant } from './components/common/TARAAssistant';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" richColors />
      <TARAAssistant />
    </BrowserRouter>
  );
}