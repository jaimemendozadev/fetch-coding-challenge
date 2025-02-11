import { ReactNode } from 'react';

export default function FavoritesPageLayout({
  children
}: {
  children: ReactNode;
}): ReactNode {
  return <div className="min-h-screen p-4">{children}</div>;
}
