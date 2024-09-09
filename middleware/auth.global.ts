import { useAuthStore } from "@/stores/auth.store";
export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.server) {
    const authStore = useAuthStore();
    const user = authStore.getUser;

    // if (to?.meta?.roleCheck) {
    //   if (user) {
    //     if (user.roles[0]?.name === "User") {
    //       return navigateTo("/parents", { external: true });
    //     } else if (user.roles[0]?.name === "Driver") {
    //       return navigateTo("/drivers/home", { external: true });
    //     }
    //   }
    // }

    if (to?.meta?.auth) {
      if (user) {
        if (checkUserRole(user, to.meta.role)) {
          navigateTo(to.path);
        }
      } else return navigateTo("/login");
    } else if (!to?.meta?.auth) {
      // @ts-ignore
      navigateTo(to.path);
    }
  }
});
function checkUserRole(user, pageRole) {
  let idx = user.roles.findLastIndex((e) => e.name === pageRole);
  return idx > -1;
}
