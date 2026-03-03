import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CompaniesProvider } from './context/CompaniesContext';
import { AdminPage } from './pages/AdminPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterCompanyPage } from './pages/RegisterCompanyPage';

function App() {
  return (
    <CompaniesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/directorio" element={<DirectoryPage />} />
            <Route path="/empresa/:slug" element={<CompanyProfilePage />} />
            <Route path="/registro" element={<RegisterCompanyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompaniesProvider>
  );
}

export default App;
