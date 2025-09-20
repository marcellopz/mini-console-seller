export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
            SC
          </div>
          <span className="text-base font-semibold text-gray-900">
            Mini Seller Console
          </span>
        </div>
        <div className="hidden gap-6 text-sm text-gray-600 sm:flex">
          <a className="hover:text-gray-900" href="#">
            Leads
          </a>
          <a className="hover:text-gray-900" href="#">
            Opportunities
          </a>
          <a className="hover:text-gray-900" href="#">
            Settings
          </a>
        </div>
      </div>
    </nav>
  );
}
