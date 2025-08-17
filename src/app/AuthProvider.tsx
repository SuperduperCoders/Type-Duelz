import React from "react";
import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	return <ClerkProvider>{children}</ClerkProvider>;
};

export function useUserAuth() {
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	return { isSignedIn, user };
}
