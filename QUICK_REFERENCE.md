/\*\*

- QUICK REFERENCE GUIDE
- কুইক রেফারেন্স গাইড
-
- Refactored User Management System
  \*/

// ============================================================================
// FILE LOCATIONS & PURPOSE
// ============================================================================

/\*\*

- 1.  CONSTANTS
- Location: lib/constants/user-management.ts
-
- Contains:
- - USER_ROLES (super_admin, station_admin, observer)
- - PASSWORD_REQUIREMENTS (12, 11, 10 chars per role)
- - PAGINATION settings
- - API_ENDPOINTS
- - ERROR_MESSAGES
- - SUCCESS_MESSAGES
- - TOAST_DURATION
-
- Import:
- import { USER_ROLES, ERROR_MESSAGES } from "@/lib/constants/user-management";
  \*/

/\*\*

- 2.  UTILITIES
- Location: lib/utils/user-management.ts
-
- Functions:
- - validatePassword(password, role)
- - validateUserForm(formData, isEdit)
- - formatDate(dateString)
- - getErrorMessage(error)
- - buildUserUpdatePayload(user, formData)
- - canImpersonate(currentId, targetId, targetRole)
- - canDeleteUser(currentId, targetId, targetRole)
-
- Import:
- import { validateUserForm, canDeleteUser } from "@/lib/utils/user-management";
  \*/

/\*\*

- 3.  CUSTOM HOOKS
- Location: hooks/use-user-management.ts
-
- Hooks:
- - useUsers(pageSize)
- - useStations()
- - useUserOperations()
- - usePagination(pageSize)
-
- Import:
- import { useUsers, useUserOperations } from "@/hooks/use-user-management";
  \*/

/\*\*

- 4.  DIALOG COMPONENTS
- Location: components/user-management/CreateEditUserDialog.tsx
-
- Exports:
- - CreateEditUserDialog
-
- Features:
- - Create new user form
- - Edit existing user form
- - Station selection
- - Location (division/district/upazila) selection
- - Password requirement display
-
- Import:
- import { CreateEditUserDialog } from "@/components/user-management/CreateEditUserDialog";
  \*/

/\*\*

- 5.  CONFIRMATION DIALOGS
- Location: components/user-management/ConfirmationDialogs.tsx
-
- Exports:
- - ConfirmationDialog (generic, reusable)
- - DeleteConfirmationDialog (specific)
- - RoleChangeConfirmationDialog (specific)
-
- Import:
- import { DeleteConfirmationDialog } from "@/components/user-management/ConfirmationDialogs";
  \*/

/\*\*

- 6.  MAIN COMPONENT
- Location: app/dashboard/user/user-table.tsx
-
- Exports:
- - UserTable (main component)
-
- Responsibilities:
- - Orchestrate data fetching
- - Manage dialog states
- - Handle user actions (create, edit, delete, impersonate)
- - Coordinate between hooks and components
- - Render table and dialogs
    \*/

// ============================================================================
// COMMON TASKS
// ============================================================================

/\*\*

- TASK 1: Add a new user role
- ***
- 1.  Edit: lib/constants/user-management.ts
- ADD: USER_ROLES.NEW_ROLE = "new_role"
-
- 2.  Edit: lib/constants/user-management.ts
- ADD: PASSWORD_REQUIREMENTS[USER_ROLES.NEW_ROLE] = 12;
-
- 3.  Edit: components/user-management/CreateEditUserDialog.tsx
- ADD: <SelectItem value={USER_ROLES.NEW_ROLE}>New Role</SelectItem>
-
- 4.  Update tests
      \*/

/\*\*

- TASK 2: Change validation rule
- ***
- 1.  Edit: lib/utils/user-management.ts
- Modify: validateUserForm() function
-
- 2.  All forms using validateUserForm() will automatically use new rules
-
- 3.  Update tests
      \*/

/\*\*

- TASK 3: Add a new user field to form
- ***
- 1.  Edit: hooks/use-user-management.ts
- Update: User interface
-
- 2.  Edit: lib/utils/user-management.ts
- Add validation if needed
-
- 3.  Edit: components/user-management/CreateEditUserDialog.tsx
- Create: New field component
- Add: Field to form
-
- 4.  Edit: app/dashboard/user/user-table.tsx
- Update: UserFormData interface
- Update: Form data state initialization
-
- 5.  Update tests
      \*/

/\*\*

- TASK 4: Change error message
- ***
- 1.  Edit: lib/constants/user-management.ts
- Find: ERROR_MESSAGES.MESSAGE_KEY
- Change: Message text
-
- 2.  All places using that constant automatically get new message
-
- 3.  No code changes needed beyond the constant
      \*/

/\*\*

- TASK 5: Add API integration
- ***
- 1.  Edit: lib/constants/user-management.ts
- Add: API_ENDPOINTS.NEW_ENDPOINT = "/api/new-endpoint"
-
- 2.  Create: hooks/use-\*.ts (custom hook for new data)
- Implement: Data fetching and state management
-
- 3.  Edit: app/dashboard/user/user-table.tsx
- Import: New hook
- Use: Hook in component
-
- 4.  Create: Utility functions if needed in lib/utils/
-
- 5.  Update tests
      \*/

/\*\*

- TASK 6: Handle new error scenario
- ***
- 1.  Add error message to lib/constants/user-management.ts
-
- 2.  Add check to appropriate utility function
-
- 3.  Handle error in component using toast
      \*/

// ============================================================================
// COMPONENT USAGE EXAMPLES
// ============================================================================

/\*\*

- USING CONSTANTS:
- ***
  \*/
  import { USER_ROLES, ERROR_MESSAGES, PASSWORD_REQUIREMENTS } from "@/lib/constants/user-management";

// Type safety with autocomplete
const role: typeof USER_ROLES[keyof typeof USER_ROLES] = USER_ROLES.OBSERVER;

// Use in conditions
if (role === USER_ROLES.SUPER_ADMIN) { ... }

// Use in configuration lookup
const minChars = PASSWORD_REQUIREMENTS[role];

// Use in messages
toast.error(ERROR_MESSAGES.CANNOT_MODIFY_SUPER_ADMIN);

/\*\*

- USING UTILITIES:
- ***
  \*/
  import { validateUserForm, canDeleteUser, formatDate } from "@/lib/utils/user-management";

// Validate form data
const validation = validateUserForm(formData, false); // false = creating new
if (!validation.isValid) {
toast.error(validation.error);
return;
}

// Check if action allowed
const check = canDeleteUser(currentUserId, targetUserId, targetUserRole);
if (!check.canDelete) {
toast.error(check.error);
return;
}

// Format dates
const displayDate = formatDate(user.createdAt);

/\*\*

- USING HOOKS:
- ***
  \*/
  import { useUsers, useUserOperations } from "@/hooks/use-user-management";

// Fetch users with pagination
const { users, totalUsers, isLoading, fetchUsers } = useUsers(10);

// Perform operations
const { isOperating, createUser, updateUser, deleteUser } = useUserOperations();

// Use in handlers
const handleCreate = async () => {
const result = await createUser(userData);
if (result.success) {
// Do something
}
};

/\*\*

- USING COMPONENTS:
- ***
  \*/
  import { CreateEditUserDialog } from "@/components/user-management/CreateEditUserDialog";
  import { DeleteConfirmationDialog } from "@/components/user-management/ConfirmationDialogs";

// Create/Edit dialog
<CreateEditUserDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  editUser={userBeingEdited}
  formData={formData}
  onFormDataChange={setFormData}
  onSubmit={handleFormSubmit}
  onCancel={handleCancel}
  isLoading={isProcessing}
  stations={stations}
  divisions={divisions}
  districts={districts}
  upazilas={upazilas}
  selectedDivision={selectedDiv}
  onDivisionChange={setSelectedDiv}
  selectedDistrict={selectedDist}
  onDistrictChange={setSelectedDist}
  onUpazilaChange={setSelectedUpazila}
  canShowRoleSelector={isAdmin}
/>

// Delete dialog
<DeleteConfirmationDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  onConfirm={handleDeleteConfirm}
  isLoading={isDeleting}
/>

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

/\*\*

- Issue: Form validation not working
- Solution: Check validateUserForm() in lib/utils/user-management.ts
-
- Issue: User can't delete account
- Solution: Check canDeleteUser() logic in lib/utils/user-management.ts
-
- Issue: API call fails
- Solution: Check API_ENDPOINTS in lib/constants/user-management.ts
-           Verify endpoint URLs in hooks/use-user-management.ts
-
- Issue: Wrong error message shown
- Solution: Check ERROR_MESSAGES in lib/constants/user-management.ts
-           Check toast.error() calls in components
-
- Issue: Password requirement not shown correctly
- Solution: Check PASSWORD_REQUIREMENTS in constants
-           Check RoleField component in CreateEditUserDialog.tsx
-
- Issue: Component re-rendering too much
- Solution: Check memoization in components
-           Check dependency arrays in hooks
-           Use React DevTools Profiler
  \*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/\*\*

- BEFORE DEPLOYMENT:
-
- Unit Tests:
- ☐ validatePassword() returns correct errors
- ☐ validateUserForm() catches all invalid inputs
- ☐ canDeleteUser() prevents self-deletion
- ☐ canImpersonate() blocks super_admin impersonation
- ☐ formatDate() formats correctly for all timezones
-
- Integration Tests:
- ☐ Create user flow works
- ☐ Edit user flow works
- ☐ Delete user flow works
- ☐ Impersonate user flow works
- ☐ Pagination works correctly
-
- Manual Tests:
- ☐ Form validation shows errors
- ☐ Success messages appear
- ☐ Dialogs open/close properly
- ☐ Data persists after actions
- ☐ Permissions enforced correctly
-
- Edge Cases:
- ☐ Network error handling
- ☐ Concurrent operations
- ☐ Invalid data handling
- ☐ Session timeout
- ☐ Permission denied scenarios
  \*/

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/\*\*

- Current optimizations:
- ✅ Memoized components (React.memo)
- ✅ Memoized values (useMemo)
- ✅ Memoized callbacks (useCallback)
- ✅ Lazy loading hooks
- ✅ Efficient re-renders with dependencies
-
- Further optimization opportunities:
- 🔄 Virtual scrolling for large tables (if users list gets huge)
- 🔄 Query caching (React Query or SWR)
- 🔄 Debounced validation
- 🔄 Code splitting for dialogs
- 🔄 Image optimization for user avatars
  \*/

// ============================================================================
// SUPPORT & MAINTENANCE
// ============================================================================

/\*\*

- For questions about:
-
- Constants → Check lib/constants/user-management.ts
- Validation → Check lib/utils/user-management.ts
- Data fetching → Check hooks/use-user-management.ts
- UI Components → Check components/user-management/
- Main flow → Check app/dashboard/user/user-table.tsx
-
- For adding features:
- 1.  Check if utility function exists
- 2.  Use constants instead of magic strings
- 3.  Create custom hook for new data
- 4.  Extract reusable components
- 5.  Add proper error handling
- 6.  Update type definitions
- 7.  Add documentation
- 8.  Write tests
      \*/

export default "Quick Reference Guide - User Management Refactoring";
