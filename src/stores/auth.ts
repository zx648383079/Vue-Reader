import { defineStore } from "pinia";
import type { IUser } from "../api/model";
import { withBoot } from "../utils";


interface AuthState {
    // token: string|null;
    isLoading: boolean;
    user: IUser|null;
    guest: boolean;
}

export const useAuthStore = defineStore('auth', {
    state(): AuthState {
        return {
            isLoading: false,
            guest: true,
            user: null
        };
    },
    actions: {
        getUser() {
            return withBoot(() => !this.isLoading).then(() => this.user);
        },
        setUser(user: IUser) {
            return new Promise<void>((resolve, reject) => {
                this.user = user;
                this.guest = !user;
                this.isLoading = false;
                resolve();
            });
        },
    }
    
});