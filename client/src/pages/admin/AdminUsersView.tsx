import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { trpc } from "@/lib/trpc";
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Mail,
  User,
  Key,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard & Metrics" },
  { id: "products", label: "Product Management" },
  { id: "categories", label: "Categories & Hierarchy" },
  { id: "brands", label: "Brand Directory" },
  { id: "orders", label: "Orders & Shipping Dispatch" },
  { id: "customers", label: "Customer CRM" },
  { id: "marketing", label: "Flash Sales & Campaigns" },
  { id: "coupons", label: "Discounts & Promo Codes" },
  { id: "sliders", label: "Hero Sliders & Banners" },
  { id: "homepage", label: "Homepage Dynamic Builder" },
  { id: "pages", label: "CMS Custom Pages" },
  { id: "media", label: "Media Library" },
  { id: "settings", label: "Store Configuration" },
  { id: "seo", label: "SEO & Social Metadata" },
  { id: "all", label: "Full System Super Access" },
];

export default function AdminUsersView() {
  const { admin: currentAdmin } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<any>("manager");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "dashboard",
    "products",
    "orders",
  ]);
  const [isActive, setIsActive] = useState(true);

  const { data: users = [], refetch, isLoading } = trpc.admin.users.list.useQuery();
  const saveMutation = trpc.admin.users.save.useMutation();
  const deleteMutation = trpc.admin.users.delete.useMutation();

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("manager");
    setSelectedPermissions(["dashboard", "products", "orders"]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Keep blank unless resetting
    setRole(user.role);
    setSelectedPermissions(user.permissions || []);
    setIsActive(Boolean(user.isActive));
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    if (permId === "all") {
      if (selectedPermissions.includes("all")) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions(["all"]);
      }
      return;
    }

    if (selectedPermissions.includes("all")) {
      setSelectedPermissions([permId]);
      return;
    }

    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: editingId || undefined,
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        role,
        permissions: role === "super_admin" ? ["all"] : selectedPermissions,
        isActive,
      });

      toast.success(editingId ? "User updated successfully!" : "User created successfully!");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user");
    }
  };

  const handleDelete = async (user: any) => {
    if (user.id === currentAdmin?.id) {
      toast.error("You cannot delete your own active logged-in account");
      return;
    }

    if (user.role === "super_admin") {
      const superAdmins = users.filter((u) => u.role === "super_admin");
      if (superAdmins.length <= 1) {
        toast.error("Cannot delete the only remaining Super Admin account");
        return;
      }
    }

    if (!window.confirm(`Are you sure you want to remove administrator ${user.name}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: user.id });
      toast.success("Administrator user removed");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    }
  };

  return (
    <AdminLayout
      pageTitle="Admin Users &amp; Permissions"
      breadcrumbs={[{ label: "Configuration", href: "/admin/settings" }, { label: "Admin Users" }]}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Staff &amp; Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure administrative permissions, staff accounts, and operational access levels.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Staff</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {users.length}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Super Admins</span>
            <Shield size={16} className="text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {users.filter((u) => u.role === "super_admin").length}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Accounts</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {users.filter((u) => u.isActive).length}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Managers</span>
            <User size={16} className="text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {users.filter((u) => u.role.includes("manager")).length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search administrators by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((user) => {
                const isSuper = user.role === "super_admin";

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {user.name}
                            </span>
                            {user.id === currentAdmin?.id && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-sm">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                          isSuper
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {isSuper && <Shield size={12} className="text-amber-600" />}
                        {user.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {isSuper || (user.permissions && user.permissions.includes("all")) ? (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          Full Super Admin Access
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions && user.permissions.length > 0 ? (
                            user.permissions.slice(0, 3).map((p: string) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium"
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">No permissions</span>
                          )}
                          {user.permissions && user.permissions.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{user.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        }`}
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={user.id === currentAdmin?.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingId ? "Edit Administrator User" : "Add Administrator User"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign administrative roles and module permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mahfuzur Rahman"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. manager@ghorerbazar.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password {editingId ? "(Leave empty to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Administrative Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setRole(newRole);
                      if (newRole === "super_admin") {
                        setSelectedPermissions(["all"]);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="super_admin">Super Admin (Full Root Access)</option>
                    <option value="admin">Store Admin</option>
                    <option value="manager">Operations Manager</option>
                    <option value="product_manager">Product &amp; Catalog Manager</option>
                    <option value="order_manager">Order Dispatcher</option>
                    <option value="content_manager">Content &amp; CMS Manager</option>
                    <option value="marketing_manager">Marketing &amp; Promotions</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              {role !== "super_admin" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Module Access Permissions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked =
                        selectedPermissions.includes("all") ||
                        selectedPermissions.includes(perm.id);

                      return (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                          <span className="truncate">{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveUser"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveUser" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Account Active &amp; Allowed to Sign In
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{saveMutation.isPending ? "Saving..." : "Save User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
