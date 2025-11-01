import { UserMenu } from './UserMenu';

export function Navigation() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-900">Task Logger</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
