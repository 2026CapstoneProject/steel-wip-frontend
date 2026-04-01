import Web_Sidebar from "../Web_Sidebar/Web_Sidebar";
import Web_Header from "../Web_Header/Web_Header";

export default function Web_AppLayout({ pageTitle, children }) {
  return (
    <>
      <Web_Sidebar />
      <main className="ml-64 min-h-screen pb-12 bg-surface">
        <Web_Header title={pageTitle} />
        <div className="px-8 pt-8 pb-12">{children}</div>
      </main>
    </>
  );
}
