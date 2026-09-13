import { Banner } from '@/components/banner';
import { NoticeSnackbar } from '@/components/noticeSnackbar';
import { PageContent } from '@/components/pageContent';
import { useCoinbaseSettingsSync } from '@/connections/hooks/useCoinbaseSettingsSync';
import { LoginPage } from '@/features/auth/loginPage';
import { RequireAuth } from '@/features/auth/requireAuth';
import { Navigate, Route, Routes } from 'react-router-dom';

export const App = () => {
  useCoinbaseSettingsSync();

  return (
    <>
      <Banner />
      <Routes>
        <Route path='/login' element={<LoginPage mode='login' />} />
        <Route path='/register' element={<LoginPage mode='register' />} />
        <Route
          path='/'
          element={
            <RequireAuth>
              <PageContent />
            </RequireAuth>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <NoticeSnackbar />
    </>
  );
};
