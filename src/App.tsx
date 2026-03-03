import { CompaniesProvider } from './context/CompaniesContext';
import { AppLayout } from './components/layout/AppLayout';
import { CompaniesShowcasePage } from './pages/CompaniesShowcasePage';

function App() {
  return (
    <CompaniesProvider>
      <AppLayout>
        <CompaniesShowcasePage />
      </AppLayout>
    </CompaniesProvider>
  );
}

export default App;
