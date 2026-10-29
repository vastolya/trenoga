import './globals.css';
import './direction.css';
import './archive.css';
import './atmosphere.css';
import './chronology.css';
import './work-dialog.css';
import './exhibition-essay.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Маша Тренога — архив работ', description: 'Архив Маши Треноги, 2018–2025. Ранняя графика, линогравюра, уличные работы и фреска для биеннале.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="ru"><body>{children}</body></html>; }
