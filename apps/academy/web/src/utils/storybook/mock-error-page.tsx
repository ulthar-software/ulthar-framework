import { useLocation } from "react-router";
import { PageContainer } from "../../components/academy/page-container.tsx";
import { PageContent } from "../../components/academy/page-content.tsx";
import { PageTitle } from "../../components/academy/page-title.tsx";
import { Anchor } from "../../components/ui/anchor.tsx";
import { Icon } from "../../components/ui/icon.tsx";

interface MockErrorPageProps {
  originalLocation: string;
}

export function MockErrorPage({ originalLocation }: MockErrorPageProps) {
  const location = useLocation();

  return (
    <PageContainer>
      <PageContent className="gap-12 ">
        <PageTitle>Algo pasó</PageTitle>
        <p className="max-w-lg text-center mx-auto">
          Pasó algo y fuiste redireccionado a: {location.pathname}
        </p>
        <Anchor href={originalLocation} className="w-24 mx-auto">
          <Icon name="bx-arrow-back" />
          Volver!
        </Anchor>
      </PageContent>
    </PageContainer>
  );
}
