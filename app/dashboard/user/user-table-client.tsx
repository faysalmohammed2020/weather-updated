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
  const [pageIndex, setPageIndex] = useState(initialPage);
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
  const [openRoleUpdateDialog, setOpenRoleUpdateDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
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
  const isPrivilegedAdmin = useMemo(
    () =>
      session?.user?.role === USER_ROLES.SUPER_ADMIN ||
      session?.user?.role === USER_ROLES.ROOT_ADMIN,
    [session?.user?.role],
  );

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
    const actorRole = session?.user?.role;
    if (actorRole === USER_ROLES.ROOT_ADMIN) return users;
    return users.filter((u) => u.role !== USER_ROLES.ROOT_ADMIN);
  }, [users, session?.user?.role]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    visibleUsers.forEach((user) => {
      if (user.role) roles.add(user.role);
    });
    return Array.from(roles).sort();
  }, [visibleUsers]);

  const uniqueStations = useMemo(() => {
    const stationList = new Set<string>();
    users.forEach((user) => {
      if (user.stationId && stationNameById.has(String(user.stationId))) {
        stationList.add(String(user.stationId));
      }
    });
    return Array.from(stationList).sort();
  }, [users, stationNameById]);

  // ============================================================================
  // PAGINATION FUNCTIONS
  // ============================================================================
  const updatePageInUrl = useCallback(
    (newPage: number) => {
      // Use startTransition to prevent blocking render
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (newPage === 0) {
          params.delete("page");
        } else {
          params.set("page", newPage.toString());
        }

        if (debouncedSearch) params.set("search", debouncedSearch);
        else params.delete("search");

        if (roleFilter !== "all") params.set("role", roleFilter);
        else params.delete("role");

        if (stationFilter !== "all") params.set("station", stationFilter);
        else params.delete("station");

        if (dateFromFilter) params.set("dateFrom", dateFromFilter);
        else params.delete("dateFrom");

        if (dateToFilter) params.set("dateTo", dateToFilter);
        else params.delete("dateTo");

        router.push(`/dashboard/user?${params.toString()}`, { scroll: false });
      });
    },
    [
      router,
      searchParams,
      debouncedSearch,
      roleFilter,
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

  useEffect(() => {
    // Only update URL if component is mounted
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
    // Only update URL if component is mounted
    if (isMounted) {
      setPageIndex((prev) => {
        if (prev !== 0) {
          updatePageInUrl(0);
          return 0;
        }
        return prev;
      });
    }
  }, [roleFilter, stationFilter, dateFromFilter, dateToFilter, updatePageInUrl, isMounted]);

  // ============================================================================
  // DATA REFRESH FUNCTION (SERVER-SIDE SEARCH INCLUDED)
  // ============================================================================
  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", pageSize.toString());
      params.set("offset", (pageIndex * pageSize).toString());

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "all") params.set("role", roleFilter);
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
    stationFilter,
    dateFromFilter,
    dateToFilter,
    refreshUsers,
  ]);

  // ============================================================================
  // FORM MANAGEMENT FUNCTIONS
  // ============================================================================
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: USER_ROLES.OBSERVER,
      division: "",
      district: "",
      upazila: "",
      stationId: "",
    });
    setEditUser(null);
  }, []);

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
      const actorRole = session?.user?.role;

      // ✅ root_admin allow to edit super_admin
      if (user.role === USER_ROLES.SUPER_ADMIN) {
        if (actorRole !== USER_ROLES.ROOT_ADMIN) {
          toast.error(ERROR_MESSAGES.CANNOT_MODIFY_SUPER_ADMIN);
          return;
        }
        // actor is root_admin -> allow
      }

      // ✅ root_admin account protection (unchanged): nobody edits root_admin here
      if (user.role === USER_ROLES.ROOT_ADMIN) {
        toast.error(ERROR_MESSAGES.CANNOT_MODIFY_ROOT_ADMIN);
        return;
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
    [session?.user?.role], // ✅ dependency add
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
      // ✅ FIX: pass actor role so root_admin can delete super_admin (per API)
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

  // ============================================================================
  // USER IMPERSONATION
  // ============================================================================
  const handleImpersonate = useCallback(
    async (
      userId: string,
      userName: string | null,
      userRole: string | null,
    ) => {
      const check = canImpersonate(session?.user?.id || "", userId, userRole);
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
    [session?.user?.id, impersonateUser],
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {isPrivilegedAdmin && (
          <Button
            className="bg-sky-600 hover:bg-sky-400"
            onClick={openCreateDialog}
          >
            + Create User
          </Button>
        )}
      </div>

      {/* Search and Filters Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
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
                  {uniqueRoles.map((role) => (
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
                  {uniqueStations.map((stationId) => (
                    <SelectItem
                      key={stationId}
                      value={stationId}
                      className="hover:bg-slate-50"
                    >
                      {stationNameById.get(stationId) || stationId}
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
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {stationName || "N/A"}
                    </TableCell>
                    <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <UserActionButtons
                        user={user}
                        isSuper={isPrivilegedAdmin}
                        currentUserId={session?.user?.id}
                        onEdit={openEditDialog}
                        onDelete={openDeleteConfirmation}
                        onImpersonate={handleImpersonate}
                        isImpersonating={impersonatingUserId === user.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
          canShowRoleSelector={isPrivilegedAdmin}
          currentUserRole={session?.user?.role as UserRole | null}
        />

        {isPrivilegedAdmin && (
          <DeleteConfirmationDialog
            open={openDeleteDialog}
            onOpenChange={setOpenDeleteDialog}
            onConfirm={handleDeleteUser}
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
  isSuper: boolean;
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (userId: string, userRole: string | null) => void;
  onImpersonate: (
    userId: string,
    userName: string | null,
    userRole: string | null,
  ) => void;
  isImpersonating: boolean;
}

const UserActionButtons = ({
  user,
  isSuper,
  currentUserId,
  onEdit,
  onDelete,
  onImpersonate,
  isImpersonating,
}: UserActionButtonsProps) => {
  // Allow root_admin and super_admin to impersonate any user except themselves
  const canImpersonateUser = isSuper;
  const canDeleteUserLocal = isSuper;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
        Edit
      </Button>

      {canDeleteUserLocal && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(user.id, user.role)}
        >
          Delete
        </Button>
      )}

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
