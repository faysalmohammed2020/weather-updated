/**
 * Create/Edit User Dialog Component
 * Handles user creation and editing with form validation
 */

"use client";

import { memo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  USER_ROLES,
  PASSWORD_REQUIREMENTS,
  type UserRole,
} from "@/lib/constants/user-management";
import { User, Station } from "@/hooks/use-user-management";
import { DialogDescription } from "@radix-ui/react-dialog";

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

interface CreateEditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editUser: User | null;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  stations: Station[];
  loadingStations?: boolean;
  divisions: Array<{ osmId: string; name: string }>;
  districts: Array<{ osmId: string; name: string }>;
  upazilas: Array<{ osmId: string; name: string }>;
  selectedDivision: any;
  onDivisionChange: (division: any) => void;
  selectedDistrict: any;
  onDistrictChange: (district: any) => void;
  onUpazilaChange: (upazila: any) => void;
  loadingDivisions?: boolean;
  loadingDistricts?: boolean;
  loadingUpazilas?: boolean;
  canShowRoleSelector: boolean;
  currentUserRole: UserRole | null;
  userStationId?: string;
  createTrigger?: React.ReactNode;
}

const DialogTitle_Internal = memo(({ editUser }: { editUser: User | null }) => {
  return (
    <DialogTitle>{editUser ? "Edit User" : "Create New User"}</DialogTitle>
  );
});

DialogTitle_Internal.displayName = "DialogTitle_Internal";

const NameField = memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="name">Name</label>
      <Input
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter user name"
      />
    </div>
  )
);

NameField.displayName = "NameField";

const RoleField = memo(
  ({
    value,
    onChange,
    visible,
    currentUserRole,
  }: {
    value: UserRole | null;
    onChange: (value: UserRole) => void;
    visible: boolean;
    currentUserRole: UserRole | null;
  }) => {
    if (!visible) return null;

    // Station Admin can only create Observer role
    if (currentUserRole === USER_ROLES.STATION_ADMIN) {
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor="role">
            Role <span className="text-red-500">*</span>
          </label>
          <Select value={USER_ROLES.OBSERVER} disabled>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Observer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USER_ROLES.OBSERVER}>Observer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Hide Super Admin role for Super Admin users
    const shouldHideSuperAdmin = currentUserRole === USER_ROLES.SUPER_ADMIN;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </label>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {!shouldHideSuperAdmin && (
              <SelectItem value={USER_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
            )}
            <SelectItem value={USER_ROLES.STATION_ADMIN}>
              Station Admin
            </SelectItem>
            <SelectItem value={USER_ROLES.OBSERVER}>Observer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

RoleField.displayName = "RoleField";

const EmailPasswordFields = memo(
  ({
    email,
    onEmailChange,
    password,
    onPasswordChange,
    role,
    editUser,
    isPasswordDisabled,
  }: {
    email: string;
    onEmailChange: (value: string) => void;
    password: string;
    onPasswordChange: (value: string) => void;
    role: UserRole | null;
    editUser: User | null;
    isPasswordDisabled: boolean;
  }) => {
    const minLength = role ? PASSWORD_REQUIREMENTS[role] : 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="flex items-center gap-1">
            {editUser ? "New Password" : "Password"}
            {!editUser && <span className="text-red-500">*</span>}
            {role && (
              <span className="text-xs text-blue-600 block">{`Min ${minLength} characters`}</span>
            )}
          </label>
          <Input
            id="password"
            type="password"
            placeholder={
              role ? `Min ${minLength} characters` : "Select a role first"
            }
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required={!editUser}
            disabled={isPasswordDisabled}
          />
        </div>
      </div>
    );
  }
);

EmailPasswordFields.displayName = "EmailPasswordFields";

const StationFields = memo(
  ({
    stationId,
    onStationChange,
    stations,
    loadingStations,
    canSelectStation,
    currentUserRole,
    userStationId,
  }: {
    stationId: string;
    onStationChange: (stationId: string) => void;
    stations: Station[];
    loadingStations?: boolean;
    canSelectStation: boolean;
    currentUserRole: UserRole | null;
    userStationId?: string;
  }) => {
    const selectedStation = stations.find((s) => s.id === stationId);

    // Station Admin can only select their own station
    const isStationAdmin = currentUserRole === USER_ROLES.STATION_ADMIN;
    const availableStations = isStationAdmin 
      ? stations.filter(s => s.stationId === userStationId || s.id === userStationId)
      : stations;

    return (
      <>
        <div className="flex flex-col gap-2">
          <label htmlFor="stationName">Station Name</label>
          <Select
            value={stationId}
            onValueChange={onStationChange}
            disabled={!canSelectStation || isStationAdmin}
          >
            <SelectTrigger id="stationName" className="w-full">
              <SelectValue
                placeholder={loadingStations ? "Loading..." : "Select Station"}
              />
            </SelectTrigger>
            <SelectContent>
              {availableStations.map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isStationAdmin && !stationId && (
            <p className="text-xs text-gray-500">
              Station Admin can only assign users to their station
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="stationId">Station ID</label>
          <Input
            id="stationId"
            value={selectedStation?.stationId || ""}
            className="bg-gray-100"
            disabled
            readOnly
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="securityCode">Station Code (Security Code)</label>
          <Input
            id="securityCode"
            value={selectedStation?.securityCode || ""}
            className="bg-gray-100"
            disabled
            readOnly
          />
        </div>
      </>
    );
  }
);

StationFields.displayName = "StationFields";

const LocationFields = memo(
  ({
    division,
    onDivisionChange,
    district,
    onDistrictChange,
    upazila,
    onUpazilaChange,
    divisions,
    districts,
    upazilas,
    selectedDivision,
    selectedDistrict,
    loadingDivisions,
    loadingDistricts,
    loadingUpazilas,
    visible,
  }: {
    division: string;
    onDivisionChange: (value: string) => void;
    district: string;
    onDistrictChange: (value: string) => void;
    upazila: string;
    onUpazilaChange: (value: string) => void;
    divisions: Array<{ osmId: string; name: string }>;
    districts: Array<{ osmId: string; name: string }>;
    upazilas: Array<{ osmId: string; name: string }>;
    selectedDivision: any;
    selectedDistrict: any;
    loadingDivisions?: boolean;
    loadingDistricts?: boolean;
    loadingUpazilas?: boolean;
    visible: boolean;
  }) => {
    if (!visible) return null;

    return (
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="division">
            Division <span className="text-red-500">*</span>
          </label>
          <Select
            value={division}
            onValueChange={onDivisionChange}
            disabled={loadingDivisions}
          >
            <SelectTrigger id="division" className="w-full">
              <SelectValue
                placeholder={
                  loadingDivisions ? "Loading..." : "Select Division"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((div) => (
                <SelectItem key={div.osmId} value={div.name}>
                  {div.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="district">
            District <span className="text-red-500">*</span>
          </label>
          <Select
            value={district}
            onValueChange={onDistrictChange}
            disabled={!selectedDivision || districts.length === 0}
          >
            <SelectTrigger id="district" className="w-full">
              <SelectValue
                placeholder={
                  loadingDistricts ? "Loading..." : "Select District"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districts.map((dist) => (
                <SelectItem key={dist.osmId} value={dist.name}>
                  {dist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="upazila">
            Upazila <span className="text-red-500">*</span>
          </label>
          <Select
            value={upazila}
            onValueChange={onUpazilaChange}
            disabled={!selectedDistrict || upazilas.length === 0}
          >
            <SelectTrigger id="upazila" className="w-full">
              <SelectValue
                placeholder={loadingUpazilas ? "Loading..." : "Select Upazila"}
              />
            </SelectTrigger>
            <SelectContent>
              {upazilas.map((up) => (
                <SelectItem key={up.osmId} value={up.name}>
                  {up.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
);

LocationFields.displayName = "LocationFields";

/**
 * Main component for creating/editing users
 */
export const CreateEditUserDialog = memo((props: CreateEditUserDialogProps) => {
  const {
    open,
    onOpenChange,
    editUser,
    formData,
    onFormDataChange,
    onSubmit,
    onCancel,
    isLoading,
    stations,
    loadingStations,
    divisions,
    districts,
    upazilas,
    selectedDivision,
    onDivisionChange,
    selectedDistrict,
    onDistrictChange,
    onUpazilaChange,
    loadingDivisions,
    loadingDistricts,
    loadingUpazilas,
    canShowRoleSelector,
    currentUserRole,
    userStationId,
    createTrigger,
  } = props;

  const handleDivisionChange = useCallback(
    (value: string) => {
      const division = divisions.find((d) => d.name === value);
      if (division) {
        onFormDataChange({
          ...formData,
          division: value,
          district: "",
          upazila: "",
        });
        onDivisionChange(division);
      }
    },
    [formData, onFormDataChange, divisions, onDivisionChange]
  );

  const handleDistrictChange = useCallback(
    (value: string) => {
      const district = districts.find((d) => d.name === value);
      if (district) {
        onFormDataChange({
          ...formData,
          district: value,
          upazila: "",
        });
        onDistrictChange(district);
      }
    },
    [formData, onFormDataChange, districts, onDistrictChange]
  );

  const handleUpazilaChange = useCallback(
    (value: string) => {
      const upazila = upazilas.find((u) => u.name === value);
      if (upazila) {
        onFormDataChange({
          ...formData,
          upazila: value,
        });
        onUpazilaChange(upazila);
      }
    },
    [formData, onFormDataChange, upazilas, onUpazilaChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {createTrigger && <DialogTrigger asChild>{createTrigger}</DialogTrigger>}
      <DialogContent aria-describedby="user-dialog-description">
        <DialogHeader>
          <DialogTitle_Internal editUser={editUser} />
          <DialogDescription id="user-dialog-description" className="sr-only">
            {editUser
              ? "Update user details. Station Admins can only manage observer accounts in their own station."
              : "Enter details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <NameField
            value={formData.name}
            onChange={(value) => onFormDataChange({ ...formData, name: value })}
          />

          <RoleField
            value={formData.role}
            onChange={(value) => {
              const minLength = PASSWORD_REQUIREMENTS[value];
              onFormDataChange({ ...formData, role: value });
              toast.info(
                `Password must be at least ${minLength} characters for ${value} role`
              );
            }}
            visible={canShowRoleSelector}
            currentUserRole={currentUserRole}
          />

          <EmailPasswordFields
            email={formData.email}
            onEmailChange={(value) =>
              onFormDataChange({ ...formData, email: value })
            }
            password={formData.password}
            onPasswordChange={(value) =>
              onFormDataChange({ ...formData, password: value })
            }
            role={formData.role}
            editUser={editUser}
            isPasswordDisabled={!formData.role}
          />

          <StationFields
            stationId={formData.stationId}
            onStationChange={(stationId) =>
              onFormDataChange({ ...formData, stationId })
            }
            stations={stations}
            loadingStations={loadingStations}
            canSelectStation={canShowRoleSelector}
            currentUserRole={currentUserRole}
            userStationId={userStationId}
          />

          <LocationFields
            division={formData.division}
            onDivisionChange={handleDivisionChange}
            district={formData.district}
            onDistrictChange={handleDistrictChange}
            upazila={formData.upazila}
            onUpazilaChange={handleUpazilaChange}
            divisions={divisions}
            districts={districts}
            upazilas={upazilas}
            selectedDivision={selectedDivision}
            selectedDistrict={selectedDistrict}
            loadingDivisions={loadingDivisions}
            loadingDistricts={loadingDistricts}
            loadingUpazilas={loadingUpazilas}
            visible={canShowRoleSelector}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : editUser
                ? "Update User"
                : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CreateEditUserDialog.displayName = "CreateEditUserDialog";
