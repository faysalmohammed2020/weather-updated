/**
 * Create/Edit User Dialog Component
 * Handles user creation and editing with form validation
 */

"use client";

import { memo, useCallback, useState } from "react";
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
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
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

type PasswordCheck = {
  id: string;
  label: string;
  passed: boolean;
};

type PasswordStrength = {
  label: "Bad" | "Weak" | "Strong" | "Extra Strong";
  score: number;
  maxScore: number;
  barClassName: string;
  textClassName: string;
};

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasNumber = (value: string) => /\d/.test(value);
const hasSymbol = (value: string) => /[^A-Za-z0-9]/.test(value);

function getPasswordChecks(
  password: string,
  role: UserRole | null,
): PasswordCheck[] {
  const minLength = role ? PASSWORD_REQUIREMENTS[role] : 0;

  return [
    {
      id: "length",
      label: `At least ${minLength} characters`,
      passed: Boolean(role) && password.length >= minLength,
    },
    {
      id: "uppercase",
      label: "Contains uppercase letter",
      passed: hasUppercase(password),
    },
    {
      id: "lowercase",
      label: "Contains lowercase letter",
      passed: hasLowercase(password),
    },
    {
      id: "number",
      label: "Contains number",
      passed: hasNumber(password),
    },
    {
      id: "symbol",
      label: "Contains symbol/special character",
      passed: hasSymbol(password),
    },
  ];
}

function getPasswordStrength(
  password: string,
  role: UserRole | null,
): PasswordStrength {
  const minLength = role ? PASSWORD_REQUIREMENTS[role] : 0;
  const maxScore = 6;
  const score = [
    Boolean(role) && password.length >= minLength,
    hasUppercase(password),
    hasLowercase(password),
    hasNumber(password),
    hasSymbol(password),
    Boolean(role) && password.length >= minLength + 4,
  ].filter(Boolean).length;

  if (score >= 6) {
    return {
      label: "Extra Strong",
      score,
      maxScore,
      barClassName: "bg-emerald-600",
      textClassName: "text-emerald-700",
    };
  }

  if (score >= 4) {
    return {
      label: "Strong",
      score,
      maxScore,
      barClassName: "bg-green-600",
      textClassName: "text-green-700",
    };
  }

  if (score >= 2) {
    return {
      label: "Weak",
      score,
      maxScore,
      barClassName: "bg-yellow-500",
      textClassName: "text-yellow-700",
    };
  }

  return {
    label: "Bad",
    score,
    maxScore,
    barClassName: "bg-red-500",
    textClassName: "text-red-600",
  };
}

function isPasswordValidForRole(password: string, role: UserRole | null) {
  return getPasswordChecks(password, role).every((check) => check.passed);
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
    const [showPassword, setShowPassword] = useState(false);
    const minLength = role ? PASSWORD_REQUIREMENTS[role] : 0;
    const showPasswordGuidance =
      Boolean(role) && !isPasswordDisabled && (!editUser || password.length > 0);

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                role ? `Min ${minLength} characters` : "Select a role first"
              }
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required={!editUser}
              disabled={isPasswordDisabled}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
              disabled={isPasswordDisabled}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {editUser && (
            <p className="text-xs text-gray-500">
              Leave password empty if you do not want to change it.
            </p>
          )}
          {showPasswordGuidance && (
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              {password.length > 0 && (
                <PasswordStrengthIndicator password={password} role={role} />
              )}
              <PasswordRulesChecklist password={password} role={role} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

EmailPasswordFields.displayName = "EmailPasswordFields";

const PasswordRulesChecklist = memo(
  ({ password, role }: { password: string; role: UserRole | null }) => {
    const checks = getPasswordChecks(password, role);

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-700">Password rules</p>
        <ul className="space-y-1">
          {checks.map((check) => (
            <PasswordRuleItem key={check.id} check={check} />
          ))}
        </ul>
      </div>
    );
  },
);

PasswordRulesChecklist.displayName = "PasswordRulesChecklist";

const PasswordRuleItem = memo(({ check }: { check: PasswordCheck }) => {
  return (
    <li
      className={`flex items-center gap-2 text-xs ${
        check.passed ? "text-green-700" : "text-slate-500"
      }`}
    >
      {check.passed ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
      ) : (
        <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
      )}
      <span>{check.label}</span>
    </li>
  );
});

PasswordRuleItem.displayName = "PasswordRuleItem";

const PasswordStrengthIndicator = memo(
  ({ password, role }: { password: string; role: UserRole | null }) => {
    const strength = getPasswordStrength(password, role);
    const progressPercent = Math.max(
      12,
      Math.round((strength.score / strength.maxScore) * 100),
    );

    return (
      <div className="space-y-1">
        <p className={`text-xs font-medium ${strength.textClassName}`}>
          Password strength: {strength.label}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${strength.barClassName}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  },
);

PasswordStrengthIndicator.displayName = "PasswordStrengthIndicator";

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
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
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

  const passwordHasValue = formData.password.length > 0;
  const shouldValidatePassword = !editUser || passwordHasValue;
  const passwordValidationFailed =
    shouldValidatePassword &&
    !isPasswordValidForRole(formData.password, formData.role);
  const isSubmitDisabled =
    Boolean(isLoading) ||
    !formData.role ||
    (!editUser && !passwordHasValue) ||
    passwordValidationFailed;

  const handleSubmit = useCallback(() => {
    if (!formData.role) {
      toast.error("Please select a role before submitting");
      return;
    }

    if (!editUser && !formData.password) {
      toast.error("Password is required");
      return;
    }

    if (editUser && !formData.password) {
      onSubmit();
      return;
    }

    const failedPasswordCheck = getPasswordChecks(
      formData.password,
      formData.role,
    ).find((check) => !check.passed);

    if (failedPasswordCheck) {
      toast.error(`Password rule failed: ${failedPasswordCheck.label}`);
      return;
    }

    onSubmit();
  }, [editUser, formData.password, formData.role, onSubmit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {createTrigger && <DialogTrigger asChild>{createTrigger}</DialogTrigger>}
      <DialogContent
        aria-describedby="user-dialog-description"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
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
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitDisabled}
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
