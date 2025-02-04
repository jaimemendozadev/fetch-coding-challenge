import { ReactNode } from 'react';

export default function HomePageLayout({
  children
}: {
  children: ReactNode;
}): ReactNode {
  return <div className="min-h-screen">{children}</div>;
}
