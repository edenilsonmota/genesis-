import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  navigationCatalog,
  canAccessItem,
  type AdminView,
} from "../app/navigation/navigation";
import type { AuthenticatedUser } from "../features/auth/types/auth";

type Props = {
  user: AuthenticatedUser;
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
};

export function TopNavigation({
  user,
  currentView,
  onNavigate,
  onLogout,
}: Props) {
  const categories = navigationCatalog
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => canAccessItem(user, item)),
    }))
    .filter((category) => category.items.length);
  return (
    <header className="border-b border-emerald-950 bg-[#123d32] text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between px-5">
        <div className="flex min-w-0 items-stretch gap-8">
          <div className="flex items-center py-4">
            <strong className="font-display text-xl">
              Genesis<span className="text-emerald-300">+</span>
            </strong>
          </div>
          <nav className="flex items-stretch" aria-label="Navegação principal">
            {categories.map((category) => (
              <Menu
                key={category.id}
                as="div"
                className="relative flex items-stretch"
              >
                <MenuButton className="flex items-center gap-2 border-b-2 border-transparent px-4 text-sm font-semibold transition hover:bg-white/10 data-open:border-emerald-300 data-open:bg-white/10">
                  {category.label}
                  <span aria-hidden="true" className="text-xs">
                    ▾
                  </span>
                </MenuButton>
                <MenuItems
                  anchor="bottom start"
                  className="z-50 mt-px min-w-56 rounded-b-lg border border-slate-200 bg-white p-1 text-slate-800 shadow-xl focus:outline-none"
                >
                  {category.items.map((item) => (
                    <MenuItem key={item.id}>
                      <button
                        className={`w-full rounded-md px-3 py-2.5 text-left text-sm data-focus:bg-emerald-50 ${currentView === item.id ? "font-semibold text-emerald-800" : ""}`}
                        onClick={() => onNavigate(item.id)}
                      >
                        {item.label}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 py-4 text-sm">
          <span className="hidden text-emerald-100 sm:inline">{user.name}</span>
          <button
            className="font-semibold text-emerald-200 hover:text-white"
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
