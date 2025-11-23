/**
 * Client Component for User Table
 * Receives server-fetched data as props and handles client-side interactions
 */

"use client";

import React, { Suspense, lazy, useState, useEffect, useCallback, useMemo } from "react";
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
import { toast } from "sonner";
import { useLocation } from "@/contexts/divisionContext";
import {
  USER_ROLES,
  PAGINATION,
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
  }))
);
const DeleteConfirmationDialog = lazy(() =>
  import("@/components/user-management/ConfirmationDialogs").then((m) => ({
    default: m.DeleteConfirmationDialog,
  }))
);
const RoleChangeConfirmationDialog = lazy(() =>
  import("@/components/user-management/ConfirmationDialogs").then((m) => ({
    default: m.RoleChangeConfirmationDialog,
  }))
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
  // COMPUTED VALUES
  // ============================================================================
  const isUserSuperAdmin = useMemo(
    () => session?.user?.role === USER_ROLES.SUPER_ADMIN,
    [session?.user?.role]
  );

  const canLoadingLocationData = useMemo(
    () => ({
      loadingDivisions: locationLoading,
      loadingDistricts: locationLoading,
      loadingUpazilas: locationLoading,
    }),
    [locationLoading]
  );

  const stationNameById = useMemo(() => {
    const map = new Map<string, string>();
    stations.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [stations]);

  // ============================================================================
  // DATA REFRESH FUNCTION
  // ============================================================================
  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}${API_ENDPOINTS.USERS}?limit=${pageSize}&offset=${pageIndex * pageSize}`,
        {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error('Error refreshing users:', error);
      toast.error('Failed to refresh users');
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize]);

  // ============================================================================
  // PAGINATION FUNCTIONS
  // ============================================================================
  const updatePageInUrl = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 0) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    router.push(`/dashboard/user?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

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
    updatePageInUrl(0);
  }, [updatePageInUrl]);

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
  const openEditDialog = useCallback((user: User) => {
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      toast.error(ERROR_MESSAGES.CANNOT_MODIFY_SUPER_ADMIN);
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
  }, []);

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
  }, [editUser, formData]);

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

  // ============================================================================
  // USER DELETION
  // ============================================================================
  const openDeleteConfirmation = useCallback(
    (userId: string, userRole: string | null) => {
      const check = canDeleteUser(session?.user?.id || "", userId, userRole);
      if (!check.canDelete) {
        toast.error(check.error);
        return;
      }

      setUserToDelete(userId);
      setOpenDeleteDialog(true);
    },
    [session?.user?.id]
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
      userRole: string | null
    ) => {
      const check = canImpersonate(session?.user?.id || "", userId, userRole);
      if (!check.canImpersonate) {
        toast.error(check.error);
        return;
      }

      await impersonateUser(userId, userName, userRole);
    },
    [session?.user?.id, impersonateUser]
  );

  // ============================================================================
  // TABLE ROWS RENDERING
  // ============================================================================
  const tableRows = useMemo(
    () =>
      users.map((user) => {
        const stationName = stationNameById.get(user.stationId);

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
                isSuper={isUserSuperAdmin}
                currentUserId={session?.user?.id}
                onEdit={openEditDialog}
                onDelete={openDeleteConfirmation}
                onImpersonate={handleImpersonate}
                isImpersonating={isOperating}
              />
            </TableCell>
          </TableRow>
        );
      }),
    [
      users,
      stationNameById,
      isUserSuperAdmin,
      session?.user?.id,
      openEditDialog,
      openDeleteConfirmation,
      handleImpersonate,
      isOperating,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {isUserSuperAdmin && (
          <Button
            className="bg-sky-600 hover:bg-sky-400"
            onClick={openCreateDialog}
          >
            + Create User
          </Button>
        )}
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
            ) : users.length > 0 ? (
              tableRows
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
              disabled={pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={(pageIndex + 1) * pageSize >= totalUsers}
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
          divisions={divisions.map(d => ({ osmId: d.osmId.toString(), name: d.name }))}
          districts={districts.map(d => ({ osmId: d.osmId.toString(), name: d.name }))}
          upazilas={upazilas.map(u => ({ osmId: u.osmId.toString(), name: u.name }))}
          selectedDivision={selectedDivision ? { osmId: selectedDivision.osmId.toString(), name: selectedDivision.name } : null}
          onDivisionChange={setSelectedDivision}
          selectedDistrict={selectedDistrict ? { osmId: selectedDistrict.osmId.toString(), name: selectedDistrict.name } : null}
          onDistrictChange={setSelectedDistrict}
          onUpazilaChange={setSelectedUpazila}
          loadingDivisions={canLoadingLocationData.loadingDivisions}
          loadingDistricts={canLoadingLocationData.loadingDistricts}
          loadingUpazilas={canLoadingLocationData.loadingUpazilas}
          canShowRoleSelector={isUserSuperAdmin}
        />

        {isUserSuperAdmin && (
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
    userRole: string | null
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
  const canImpersonateUser = isSuper || user.role === USER_ROLES.OBSERVER;
  const canDeleteUser = isSuper;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
        Edit
      </Button>

      {canDeleteUser && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(user.id, user.role)}
        >
          Delete
        </Button>
      )}

      {canImpersonateUser &&
        user.role !== USER_ROLES.SUPER_ADMIN &&
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
