/**
 * Client Component for User Table
 * Receives server-fetched data as props and handles client-side interactions
 */

"use client";

import React, {
  Suspense,
  lazy,
  useState,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation } from "@/contexts/divisionContext";
import {
  USER_ROLES,
  ERROR_MESSAGES,
  API_ENDPOINTS,
} from "@/lib/constants/user-management";
import type { UserRole } from "@/lib/constants/user-management";
import {
  validateUserForm,
  formatDate,
  canDeleteUser,
  canImpersonate,
  buildUserUpdatePayload,
  isUserVisibleToStationAdmin,
} from "@/lib/utils/user-management";
import {
  useUserOperations,
  type User,
  type Station,
} from "@/hooks/use-user-management-client";
import UserTableSkeletonRows from "./UserTableSkeletonRows";

// Lazy dialogs
const CreateEditUserDialog = lazy(() =>
  import("@/components/user-management/CreateEditUserDialog").then((m) => ({
    default: m.CreateEditUserDialog,
  })),
);
const DeleteConfirmationDialog = lazy(() =>
  import("@/components/user-management/ConfirmationDialogs").then((m) => ({
    default: m.DeleteConfirmationDialog,
  })),
);
const RestoreConfirmationDialog = lazy(() =>
  import("@/components/user-management/ConfirmationDialogs").then((m) => ({
    default: m.RestoreConfirmationDialog,
  })),
);
const RoleChangeConfirmationDialog = lazy(() =>
  import("@/components/user-management/ConfirmationDialogs").then((m) => ({
    default: m.RoleChangeConfirmationDialog,
  })),
);

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole | null;
  division: string;
  district: string;
  upazila: string;
  stationId: string;
}

interface UserTableClientProps {
  initialUsers: User[];
  initialTotalUsers: number;
  initialStations: Station[];
  initialPage: number;
  pageSize: number;
  session: any;
}

export const UserTableClient = ({
  initialUsers,
  initialTotalUsers,
  initialStations,
  initialPage,
  pageSize,
  session,
}: UserTableClientProps) => {
  // Track which user is being impersonated for button loading
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(
    null,
  );

  // ============================================================================
  // ROUTER & SEARCH PARAMS
  // ============================================================================
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const {
    divisions,
    districts,
    upazilas,
    selectedDivision,
    setSelectedDivision,
    selectedDistrict,
    setSelectedDistrict,
    setSelectedUpazila,
    loading: locationLoading,
  } = useLocation();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [totalUsers, setTotalUsers] = useState(initialTotalUsers);
  const [stations, setStations] = useState<Station[]>(initialStations);

  // ✅ FIX: pageIndex should reflect URL offset if present
  const [pageIndex, setPageIndex] = useState(() => {
    const offsetParam = searchParams.get("offset");
    const offset = Number.parseInt(offsetParam ?? "", 10);
    if (Number.isFinite(offset) && offset > 0) {
      return Math.floor(offset / pageSize);
    }
    return initialPage ?? 0;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { isOperating, createUser, updateUser, deleteUser, impersonateUser } =
    useUserOperations();

  // ============================================================================
  // LOCAL STATE - FORM DATA
  // ============================================================================
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: USER_ROLES.OBSERVER,
    division: "",
    district: "",
    upazila: "",
    stationId: "",
  });

  // ============================================================================
  // LOCAL STATE - UI/DIALOG STATES
  // ============================================================================
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openRoleUpdateDialog, setOpenRoleUpdateDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToRestore, setUserToRestore] = useState<User | null>(null);
  const [roleChangeData, setRoleChangeData] = useState<{
    originalRole: string | null;
    newRole: string | null;
  }>({ originalRole: null, newRole: null });

  // ============================================================================
  // SEARCH STATE (SERVER-SIDE)
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ============================================================================
  // FILTER STATE
  // ============================================================================
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "banned" || statusParam === "all") {
      return statusParam;
    }

    const isPrivileged =
      session?.user?.role === USER_ROLES.SUPER_ADMIN ||
      session?.user?.role === USER_ROLES.ROOT_ADMIN;

    return isPrivileged ? "all" : "active";
  });
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const actorRole = session?.user?.role as UserRole | null;
  const isRootAdmin = actorRole === USER_ROLES.ROOT_ADMIN;
  const isSuperAdmin = actorRole === USER_ROLES.SUPER_ADMIN;
  const isStationAdmin = actorRole === USER_ROLES.STATION_ADMIN;
  const canCreateUsers = isRootAdmin || isSuperAdmin || isStationAdmin;
  const canManageUsers = isRootAdmin || isSuperAdmin;
  const canShowRoleSelector = isRootAdmin || isSuperAdmin || isStationAdmin;
  const actorStationId =
    session?.user?.station?.id ?? session?.user?.stationId;
  const actorStationCode = session?.user?.station?.stationId;

  const canLoadingLocationData = useMemo(
    () => ({
      loadingDivisions: locationLoading,
      loadingDistricts: locationLoading,
      loadingUpazilas: locationLoading,
    }),
    [locationLoading],
  );

  // ✅ FIX: map both station.id and station.stationId to name
  const stationNameById = useMemo(() => {
    const map = new Map<string, string>();
    stations.forEach((s: any) => {
      if (s?.id) map.set(String(s.id), s.name);
      if (s?.stationId) map.set(String(s.stationId), s.name);
    });
    return map;
  }, [stations]);

  const visibleUsers = useMemo(() => {
    if (actorRole === USER_ROLES.ROOT_ADMIN) return users;

    // Station admin: self + station observers
    if (actorRole === USER_ROLES.STATION_ADMIN) {
      return users.filter((u) =>
        isUserVisibleToStationAdmin(u, {
          id: session?.user?.id,
          stationId: session?.user?.stationId,
          station: session?.user?.station,
        }),
      );
    }

    // Other roles filter out Root Admin
    return users.filter((u) => u.role !== USER_ROLES.ROOT_ADMIN);
  }, [users, session?.user?.role, session?.user?.station?.id]);

  const allRoles = useMemo<UserRole[]>(() => {
    const actorRole = session?.user?.role as UserRole | undefined;

    // Station Admin can only create Observer role
    if (actorRole === USER_ROLES.STATION_ADMIN) {
      return [USER_ROLES.OBSERVER];
    }

    // base roles everyone can see
    const roles: UserRole[] = [USER_ROLES.STATION_ADMIN, USER_ROLES.OBSERVER];

    // ✅ only super_admin and root_admin can see super_admin role option
    if (
      actorRole === USER_ROLES.SUPER_ADMIN ||
      actorRole === USER_ROLES.ROOT_ADMIN
    ) {
      roles.unshift(USER_ROLES.SUPER_ADMIN);
    }

    // ✅ only root_admin can see root_admin
    if (actorRole === USER_ROLES.ROOT_ADMIN) {
      roles.unshift(USER_ROLES.ROOT_ADMIN);
    }

    return roles;
  }, [session?.user?.role]);

  const allStations = useMemo(() => {
    const actorRole = session?.user?.role;
    const userStationDbId = session?.user?.station?.id;

    // Station Admin can only see their own station
    if (actorRole === USER_ROLES.STATION_ADMIN) {
      return stations.filter((station) => station?.id === userStationDbId);
    }

    // Other roles see all stations
    return stations
      .filter((station) => station?.id || station?.stationId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [stations, session?.user?.role, session?.user?.station?.id]);

  // ============================================================================
  // PAGINATION FUNCTIONS
  // ============================================================================
const updatePageInUrl = useCallback(
  (newPageIndex: number) => {
    startTransition(() => {
      // ✅ IMPORTANT: useSearchParams() না, window.location.search ব্যবহার করছি
      const params = new URLSearchParams(window.location.search);

      const newOffset = newPageIndex * pageSize;
      if (newOffset === 0) params.delete("offset");
      else params.set("offset", String(newOffset));

      // nice to keep limit
      params.set("limit", String(pageSize));

      // ✅ keep filters/search
      if (debouncedSearch) params.set("search", debouncedSearch);
      else params.delete("search");

      if (roleFilter !== "all") params.set("role", roleFilter);
      else params.delete("role");

      if (statusFilter !== "active") params.set("status", statusFilter);
      else params.delete("status");

      if (stationFilter !== "all") params.set("station", stationFilter);
      else params.delete("station");

      if (dateFromFilter) params.set("dateFrom", dateFromFilter);
      else params.delete("dateFrom");

      if (dateToFilter) params.set("dateTo", dateToFilter);
      else params.delete("dateTo");

      // ✅ replace দিলে history clutter কম হবে, push দিলেও চলবে
      router.replace(`/dashboard/user?${params.toString()}`, { scroll: false });
    });
  },
  [
    router,
    pageSize,
    debouncedSearch,
    roleFilter,
    statusFilter,
    stationFilter,
    dateFromFilter,
    dateToFilter,
  ],
);


  const nextPage = useCallback(() => {
    if ((pageIndex + 1) * pageSize < totalUsers) {
      const newPage = pageIndex + 1;
      setPageIndex(newPage);
      updatePageInUrl(newPage);
    }
  }, [pageIndex, pageSize, totalUsers, updatePageInUrl]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      const newPage = pageIndex - 1;
      setPageIndex(newPage);
      updatePageInUrl(newPage);
    }
  }, [pageIndex, updatePageInUrl]);

  const resetPagination = useCallback(() => {
    setPageIndex(0);
    if (isMounted) {
      updatePageInUrl(0);
    }
  }, [updatePageInUrl, isMounted]);

  // Set mounted flag after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // ✅ when filters/search change: reset to first page
  useEffect(() => {
    if (isMounted) {
      setPageIndex((prev) => {
        if (prev !== 0) {
          updatePageInUrl(0);
          return 0;
        }
        return prev;
      });
    }
  }, [debouncedSearch, updatePageInUrl, isMounted]);

  useEffect(() => {
    if (isMounted) {
      setPageIndex((prev) => {
        if (prev !== 0) {
          updatePageInUrl(0);
          return 0;
        }
        return prev;
      });
    }
  }, [
    roleFilter,
    statusFilter,
    stationFilter,
    dateFromFilter,
    dateToFilter,
    updatePageInUrl,
    isMounted,
  ]);

  // ============================================================================
  // DATA REFRESH FUNCTION (SERVER-SIDE SEARCH INCLUDED)
  // ============================================================================
  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", pageSize.toString());

      // ✅ FIX: backend expects offset
      params.set("offset", String(pageIndex * pageSize));

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "active") params.set("status", statusFilter);
      if (stationFilter !== "all") params.set("station", stationFilter);
      if (dateFromFilter) params.set("dateFrom", dateFromFilter);
      if (dateToFilter) params.set("dateTo", dateToFilter);

      const response = await fetch(
        `${API_ENDPOINTS.USERS}?${params.toString()}`,
        {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Refresh failed:", response.status, text);
        throw new Error("Failed to refresh users");
      }

      const data = await response.json();
      setUsers(data.users ?? []);
      setTotalUsers(data.total ?? 0);
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Failed to refresh users");
    } finally {
      setIsLoading(false);
    }
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    roleFilter,
    statusFilter,
    stationFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  useEffect(() => {
    refreshUsers();
  }, [
    pageIndex,
    debouncedSearch,
    roleFilter,
    statusFilter,
    stationFilter,
    dateFromFilter,
    dateToFilter,
    refreshUsers,
  ]);

  // ============================================================================
  // FORM MANAGEMENT FUNCTIONS
  // ============================================================================
  const resetForm = useCallback(() => {
    const actorRole = session?.user?.role;
    const userStationId = session?.user?.station?.stationId;

    let defaultStationId = "";
    let defaultRole = USER_ROLES.OBSERVER;

    if (actorRole === USER_ROLES.STATION_ADMIN && userStationId) {
      const userStation = stations.find(
        (s) => s.stationId === userStationId || s.id === userStationId,
      );
      if (userStation) {
        defaultStationId = userStation.id;
        defaultRole = USER_ROLES.OBSERVER;
      } else {
        console.log("Station not found for userStationId:", userStationId);
        console.log(
          "Available stations:",
          stations.map((s) => ({
            id: s.id,
            stationId: s.stationId,
            name: s.name,
          })),
        );
      }
    }

    setFormData({
      name: "",
      email: "",
      password: "",
      role: defaultRole,
      division: "",
      district: "",
      upazila: "",
      stationId: defaultStationId,
    });
    setEditUser(null);
  }, [session?.user?.role, session?.user?.station?.stationId, stations]);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setOpenDialog(true);
  }, [resetForm]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    resetForm();
  }, [resetForm]);

  // ============================================================================
  // USER CREATION
  // ============================================================================
  const handleCreateUser = useCallback(async () => {
    const validation = validateUserForm(formData, false);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const result = await createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      division: formData.division,
      district: formData.district,
      upazila: formData.upazila,
      stationId: formData.stationId,
    });

    if (result.success) {
      handleCloseDialog();
      resetPagination();
      refreshUsers();
    }
  }, [formData, createUser, handleCloseDialog, resetPagination, refreshUsers]);

  // ============================================================================
  // USER EDITING
  // ============================================================================
  const openEditDialog = useCallback(
    (user: User) => {
      // ✅ root_admin allow to edit super_admin
      if (user.role === USER_ROLES.SUPER_ADMIN) {
        if (actorRole !== USER_ROLES.ROOT_ADMIN) {
          toast.error(ERROR_MESSAGES.CANNOT_MODIFY_SUPER_ADMIN);
          return;
        }
      }

      // ✅ root_admin account protection
      if (user.role === USER_ROLES.ROOT_ADMIN) {
        toast.error(ERROR_MESSAGES.CANNOT_MODIFY_ROOT_ADMIN);
        return;
      }

      if (actorRole === USER_ROLES.STATION_ADMIN) {
        const sameStation =
          user.stationId === actorStationId ||
          user.stationId === actorStationCode;

        if (user.role !== USER_ROLES.OBSERVER || !sameStation) {
          toast.error(
            "Station Admin can only edit Observer accounts in their station",
          );
          return;
        }
      }

      setEditUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role as UserRole,
        division: user.division || "",
        district: user.district || "",
        upazila: user.upazila || "",
        stationId: user.stationId || "",
      });

      setOpenDialog(true);
    },
    [actorRole, actorStationId, actorStationCode],
  );

  const handleUpdateUser = useCallback(async () => {
    if (!editUser) return;

    const validation = validateUserForm(formData, true);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setOpenRoleUpdateDialog(false);

    const payload = buildUserUpdatePayload(editUser, formData);
    const result = await updateUser(payload);

    if (result.success) {
      handleCloseDialog();
      refreshUsers();
    }
  }, [editUser, formData, updateUser, handleCloseDialog, refreshUsers]);

  const confirmRoleUpdate = useCallback(() => {
    if (!editUser) return;

    const validation = validateUserForm(formData, true);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (editUser.role === formData.role) {
      handleUpdateUser();
      return;
    }

    setRoleChangeData({
      originalRole: editUser.role,
      newRole: formData.role,
    });
    setOpenRoleUpdateDialog(true);
  }, [editUser, formData, handleUpdateUser]);

  // ============================================================================
  // USER DELETION
  // ============================================================================
  const openDeleteConfirmation = useCallback(
    (userId: string, userRole: string | null) => {
      const check = canDeleteUser(
        session?.user?.id || "",
        userId,
        userRole,
        session?.user?.role,
      );

      if (!check.canDelete) {
        toast.error(check.error);
        return;
      }

      setUserToDelete(userId);
      setOpenDeleteDialog(true);
    },
    [session?.user?.id, session?.user?.role],
  );

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    const result = await deleteUser(userToDelete);

    if (result.success) {
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      refreshUsers();
    }
  }, [userToDelete, deleteUser, refreshUsers]);

  const openRestoreConfirmation = useCallback((user: User) => {
    if (!user.banned) return;
    setUserToRestore(user);
    setOpenRestoreDialog(true);
  }, []);

  const handleRestoreDialogChange = useCallback((open: boolean) => {
    setOpenRestoreDialog(open);
    if (!open) {
      setUserToRestore(null);
    }
  }, []);

  const handleRestoreUser = useCallback(async () => {
    if (!userToRestore) return;

    const result = await updateUser({
      id: userToRestore.id,
      banned: false,
      banReason: null,
      banExpires: null,
    });

    if (result.success) {
      setOpenRestoreDialog(false);
      setUserToRestore(null);
      refreshUsers();
    }
  }, [userToRestore, updateUser, refreshUsers]);

  // ============================================================================
  // USER IMPERSONATION
  // ============================================================================
  const handleImpersonate = useCallback(
    async (userId: string, userName: string | null, userRole: string | null) => {
      const check = canImpersonate(
        session?.user?.id || "",
        userId,
        userRole,
        actorRole,
      );
      if (!check.canImpersonate) {
        toast.error(check.error);
        return;
      }
      setImpersonatingUserId(userId);
      try {
        await impersonateUser(userId, userName, userRole);
      } finally {
        setImpersonatingUserId(null);
      }
    },
    [session?.user?.id, actorRole, impersonateUser],
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {canCreateUsers && (
          <Button
            className="bg-sky-600 hover:bg-sky-400"
            onClick={openCreateDialog}
          >
            + Create User
          </Button>
        )}
      </div>

      {/* Search and Filters Section */}
      <div className="bg-linear-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Role Filter */}
            <div className="min-w-[180px]">
              <Label
                htmlFor="role-filter"
                className="text-sm font-semibold text-slate-700 mb-2 block"
              >
                Role
              </Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger
                  id="role-filter"
                  className="bg-white border-slate-300 rounded-lg shadow-sm hover:border-slate-400 transition-colors"
                >
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-lg shadow-lg">
                  <SelectItem value="all">All roles</SelectItem>
                  {allRoles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="hover:bg-slate-50"
                    >
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canManageUsers && (
              <div className="min-w-[160px]">
                <Label
                  htmlFor="status-filter"
                  className="text-sm font-semibold text-slate-700 mb-2 block"
                >
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    id="status-filter"
                    className="bg-white border-slate-300 rounded-lg shadow-sm hover:border-slate-400 transition-colors"
                  >
                    <SelectValue placeholder="Active" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 rounded-lg shadow-lg">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Station Filter */}
            <div className="min-w-[180px]">
              <Label
                htmlFor="station-filter"
                className="text-sm font-semibold text-slate-700 mb-2 block"
              >
                Station
              </Label>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger
                  id="station-filter"
                  className="bg-white border-slate-300 rounded-lg shadow-sm hover:border-slate-400 transition-colors"
                >
                  <SelectValue placeholder="All stations" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-lg shadow-lg">
                  <SelectItem value="all">All stations</SelectItem>
                  {allStations.map((station) => (
                    <SelectItem
                      key={station.id ?? station.stationId}
                      value={String(station.id ?? station.stationId)}
                      className="hover:bg-slate-50"
                    >
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-slate-400"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white py-6 rounded-xl border shadow">
        <Table>
          <TableHeader className="border-b-2 border-slate-300 bg-slate-100">
            <TableRow>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Name
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Email
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Role
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[200px] text-left">
                Status
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Station
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Joined
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <UserTableSkeletonRows rows={pageSize} />
            ) : visibleUsers.length > 0 ? (
              visibleUsers.map((user) => {
                const stationName = user.stationId
                  ? stationNameById.get(String(user.stationId))
                  : undefined;
                const isBanned = Boolean(user.banned);
                const statusLabel = isBanned ? "Banned" : "Active";
                const statusClasses = isBanned
                  ? "bg-rose-50 text-rose-700"
                  : "bg-emerald-50 text-emerald-700";

                return (
                  <TableRow key={user.id}>
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {user.name || "N/A"}
                    </TableCell>
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {user.email}
                    </TableCell>
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {user.role || "N/A"}
                    </TableCell>
                    <TableCell className="p-3 text-left">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusClasses}`}
                      >
                        {statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {stationName || "N/A"}
                    </TableCell>
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <UserActionButtons
                        user={user}
                        canManageUsers={canManageUsers}
                        actorRole={actorRole}
                        actorStationId={actorStationId}
                        actorStationCode={actorStationCode}
                        currentUserId={session?.user?.id}
                        onEdit={openEditDialog}
                        onDelete={openDeleteConfirmation}
                        onRestore={openRestoreConfirmation}
                        onImpersonate={handleImpersonate}
                        onOpenSettings={() => router.push("/dashboard/settings")}
                        isImpersonating={impersonatingUserId === user.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 px-3 border-t pt-5">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalUsers > 0 && (
              <>
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, totalUsers)} of{" "}
                {totalUsers} users
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pageIndex === 0 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={(pageIndex + 1) * pageSize >= totalUsers || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs (Lazy + Suspense) */}
      <Suspense fallback={null}>
        <CreateEditUserDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          editUser={editUser}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={editUser ? confirmRoleUpdate : handleCreateUser}
          onCancel={handleCloseDialog}
          isLoading={isOperating}
          stations={stations}
          loadingStations={false}
          divisions={divisions.map((d) => ({
            osmId: d.osmId.toString(),
            name: d.name,
          }))}
          districts={districts.map((d) => ({
            osmId: d.osmId.toString(),
            name: d.name,
          }))}
          upazilas={upazilas.map((u) => ({
            osmId: u.osmId.toString(),
            name: u.name,
          }))}
          selectedDivision={
            selectedDivision
              ? {
                  osmId: selectedDivision.osmId.toString(),
                  name: selectedDivision.name,
                }
              : null
          }
          onDivisionChange={setSelectedDivision}
          selectedDistrict={
            selectedDistrict
              ? {
                  osmId: selectedDistrict.osmId.toString(),
                  name: selectedDistrict.name,
                }
              : null
          }
          onDistrictChange={setSelectedDistrict}
          onUpazilaChange={setSelectedUpazila}
          loadingDivisions={canLoadingLocationData.loadingDivisions}
          loadingDistricts={canLoadingLocationData.loadingDistricts}
          loadingUpazilas={canLoadingLocationData.loadingUpazilas}
          canShowRoleSelector={canShowRoleSelector}
          currentUserRole={actorRole}
          userStationId={session?.user?.station?.stationId}
        />

        {canManageUsers && (
          <DeleteConfirmationDialog
            open={openDeleteDialog}
            onOpenChange={setOpenDeleteDialog}
            onConfirm={handleDeleteUser}
            isLoading={isOperating}
          />
        )}

        {canManageUsers && (
          <RestoreConfirmationDialog
            open={openRestoreDialog}
            onOpenChange={handleRestoreDialogChange}
            onConfirm={handleRestoreUser}
            isLoading={isOperating}
          />
        )}

        <RoleChangeConfirmationDialog
          open={openRoleUpdateDialog}
          onOpenChange={setOpenRoleUpdateDialog}
          originalRole={roleChangeData.originalRole}
          newRole={roleChangeData.newRole}
          onConfirm={handleUpdateUser}
          isLoading={isOperating}
        />
      </Suspense>
    </div>
  );
};

// ============================================================================
// ACTION BUTTONS SUBCOMPONENT
// ============================================================================
interface UserActionButtonsProps {
  user: User;
  canManageUsers: boolean;
  actorRole?: UserRole | null;
  actorStationId?: string;
  actorStationCode?: string;
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (userId: string, userRole: string | null) => void;
  onRestore: (user: User) => void;
  onImpersonate: (
    userId: string,
    userName: string | null,
    userRole: string | null,
  ) => void;
  onOpenSettings: () => void;
  isImpersonating: boolean;
}

const UserActionButtons = ({
  user,
  canManageUsers,
  actorRole,
  actorStationId,
  actorStationCode,
  currentUserId,
  onEdit,
  onDelete,
  onRestore,
  onImpersonate,
  onOpenSettings,
  isImpersonating,
}: UserActionButtonsProps) => {
  const isRootActor = actorRole === USER_ROLES.ROOT_ADMIN;
  const isSuperActor = actorRole === USER_ROLES.SUPER_ADMIN;
  const isStationActor = actorRole === USER_ROLES.STATION_ADMIN;
  const isTargetSuper = user.role === USER_ROLES.SUPER_ADMIN;
  const isTargetRoot = user.role === USER_ROLES.ROOT_ADMIN;
  const blockSuperOnSuper = isSuperActor && isTargetSuper;

  const sameStation =
    (actorStationId || actorStationCode) &&
    (user.stationId === actorStationId || user.stationId === actorStationCode);

  const canEditUser = isTargetRoot
    ? false
    : isTargetSuper
      ? isRootActor
      : isStationActor
        ? user.role === USER_ROLES.OBSERVER && Boolean(sameStation)
        : isRootActor || isSuperActor;

  const canImpersonateUser =
    canManageUsers && !user.banned && !blockSuperOnSuper;
  const canManageStatus = canManageUsers && !blockSuperOnSuper;

  const canManageTarget = user.role !== USER_ROLES.ROOT_ADMIN || isRootActor;
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="flex gap-2">
      {isCurrentUser && (
        <Button variant="outline" size="sm" onClick={onOpenSettings}>
          My Account
        </Button>
      )}

      {canEditUser && (
        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
          Edit
        </Button>
      )}

      {canManageStatus &&
        canManageTarget &&
        (user.banned ? (
          <Button variant="outline" size="sm" onClick={() => onRestore(user)}>
            Restore
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(user.id, user.role)}
          >
            Deactivate
          </Button>
        ))}

      {canImpersonateUser &&
        user.role !== USER_ROLES.ROOT_ADMIN &&
        user.id !== currentUserId && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onImpersonate(user.id, user.name, user.role)}
            disabled={isImpersonating}
          >
            {isImpersonating ? "..." : "Impersonate"}
          </Button>
        )}
    </div>
  );
};
