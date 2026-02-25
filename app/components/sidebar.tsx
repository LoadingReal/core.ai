import Logo from "./logo";

export default function Sidebar() {
  return (
    <div className="bg-sidebar-accent min-w-60">
      <div className="p-1.5">
        <Logo />
      </div>
      <p>Sidebar</p>
    </div>
  );
}
