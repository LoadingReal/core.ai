import Sidebar from "./components/sidebar";

function MainContent() {
  return (
    <div className="flex-1">
      Main Content
    </div>
  )
}

export default function Home() {
  return (
    <main className="flex w-screen h-screen bg-background overflow-hidden">
      <Sidebar />
      <MainContent />
    </main>
  );
}
