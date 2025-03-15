export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const authStore = useAuthStore();
    const user = authStore.getUser;

    // Handle role-based redirection
    if (to.meta.roleCheck && user) {
      const role = user.roles[0]?.name;
      if (role === "User") {
        return navigateTo("/parents", { external: true });
      } else if (role === "Driver") {
        return navigateTo("/drivers/home", { external: true });
      }
    }

    // Handle authenticated routes
    if (to.meta.auth) {
      if (!user) {
        return navigateTo("/login");
      }
      if (!checkUserRole(user, to.meta.role)) {
        return navigateTo("/unauthorized"); // Optional: redirect if user role does not match
      }
    }
  }
});

// Utility function to check user role
function checkUserRole(user, pageRole) {
  return user.roles.some((role) => role.name === pageRole);
}
