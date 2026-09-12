import { Banner } from '@/components/banner';
import { PageContent } from '@/components/pageContent';
import { useCoinbaseSettingsSync } from '@/connections/hooks/useCoinbaseSettingsSync';

export const App = () => {
  useCoinbaseSettingsSync();

  return (
    <>
      <Banner />
      <PageContent />
    </>
  );
};
