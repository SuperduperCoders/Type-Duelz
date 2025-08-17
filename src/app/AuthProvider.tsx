import React from "react";
// ...removed ClerkProvider, useAuth, useUser imports...

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
		return <>{children}</>;
};

// ...removed Clerk-related hooks and logic...
