import type { IUser, IAuthResponse } from "@/services/UserService";

// Interfaces
interface IAuthUser {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: IUser | null;
  isAuthModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  answeredTicketCount: number;
  isRenderingPwaDialog: boolean;
  isAndroid: boolean;
  isIphone: boolean;
}

export const useAuthStore = defineStore("_auth", {
  state: (): IAuthUser => ({
    isLoggedIn: false,
    token: null,
    refreshToken: null,
    user: null,
    isAuthModalOpen: false,
    isForgotPasswordModalOpen: false,
    answeredTicketCount: 0,
    isRenderingPwaDialog: false,
    isAndroid: false,
    isIphone: false,
  }),
  getters: {
    isLogged(): boolean {
      return this.isLoggedIn;
    },
    getToken(): string | null {
      const tokenCookie = useCookie("_token");

      return this.token
        ? this.token
        : tokenCookie.value
        ? tokenCookie.value
        : null;
    },
    getUser(): IUser | null {
      return this.user;
    },
    isIphoneDevice(): boolean {
      return this.isIphone;
    },
    isAndroidDevice(): boolean {
      return this.isAndroid;
    },
    getAnsweredTicketCount(): number {
      return this.answeredTicketCount;
    },
    isRenderingAuthModal(): boolean {
      return this.isAuthModalOpen;
    },
    isRenderingForgetModal(): boolean {
      return this.isForgotPasswordModalOpen;
    },
    isRenderingPwaModal(): boolean {
      return this.isRenderingPwaDialog;
    },
  },
  actions: {
    logout(): void {
      this.isLoggedIn = false;
      this.token = null;
      this.user = null;
      this.answeredTicketCount = 0;
      const tokenCookie = useCookie("_token");
      const refreshCookie = useCookie("_refresh");
      tokenCookie.value = null;
      refreshCookie.value = null;
      useRouter().push("/");
    },
    renderAuthModal(): void {
      this.isAuthModalOpen = true;
    },
    closeAuthModal(): void {
      this.isAuthModalOpen = false;
    },
    renderForgetPasswordModal(): void {
      this.isForgotPasswordModalOpen = true;
    },
    closeForgetPasswordModal(): void {
      this.isForgotPasswordModalOpen = false;
    },
    setIphone(): void {
      this.isIphone = true;
      this.isAndroid = false;
    },
    setAndroid(): void {
      this.isAndroid = true;
      this.isIphone = false;
    },
    updatePwaModalState(state: boolean): void {
      const isFirstVisitCookie = useCookie<boolean>("_firstVisit");
      this.isRenderingPwaDialog = state;
      if (!state) {
        isFirstVisitCookie.value = false;
      }
    },
    setUser(loginResponse: IAuthResponse): Promise<void> {
      const cookieMaxAge = 2628288; // One month in seconds
      return new Promise(async (resolve, reject) => {
        const tokenCookie = useCookie("_token", {
          maxAge: cookieMaxAge,
        });
        const refreshCookie = useCookie("_refresh", {
          maxAge: cookieMaxAge,
        });
        this.token = loginResponse.token;
        tokenCookie.value = this.token;
        this.refreshToken = loginResponse.refreshToken;
        refreshCookie.value = this.refreshToken;
        this.isLoggedIn = true;
        setTimeout(async () => {
          await this.fetchUser();
          const { success } = useAlerts();
          success("با موفقیت وارد شدید");
        }, 1000);
        resolve();
      });
    },
    updateUser(userDetails: IUser): void {
      this.user = userDetails;
    },
    updateTicketCount(count: number): void {
      this.answeredTicketCount = count;
    },
    // async fetchMyAnsweredTicketsCount(): Promise<void> {
    //   const { $api } = useNuxtApp();
    //   const spinner = useSpinner();
    //   const alert = useAlerts();
    //   try {
    //     spinner.showSpinner();
    //     const response = await $api.tickets.getMyAnsweredTicketCount();
    //     if (response.data.isSuccess) {
    //       this.updateTicketCount(response.data.data.count);
    //     } else {
    //       alert.error(
    //         response?.data.message || "مشکلی پیش آمد، لطفا دوباره امتحان کنید"
    //       );
    //     }
    //   } catch (error) {
    //     if (isAxiosError(error))
    //       alert.error(
    //         error?.response?.data?.message ||
    //           "مشکلی پیش آمد، لطفا دوباره امتحان کنید"
    //       );
    //     else console.error(error);
    //   } finally {
    //     spinner.hideSpinner();
    //   }
    // },
    async fetchUser(): Promise<void> {
      const { $api } = useNuxtApp();
      const spinner = useSpinner();
      const alert = useAlerts();
      try {
        spinner.showSpinner();
        const response = await $api.users.getUserByToken();
        if (response.data.isSuccess) {
          this.updateUser(response.data.data);
          console.log(response.data.data);
        } else {
          alert.error(
            response?.data.message || "مشکلی پیش آمد، لطفا دوباره امتحان کنید"
          );
        }
      } catch (error) {
        if (isAxiosError(error))
          alert.error(
            error?.response?.data?.message ||
              "مشکلی پیش آمد، لطفا دوباره امتحان کنید"
          );
        else console.error(error);
      } finally {
        spinner.hideSpinner();
      }
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ["isLoggedIn", "token", "user"],
  },
});
