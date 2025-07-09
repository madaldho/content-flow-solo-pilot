import { StackProvider, StackTheme } from "@stackframe/stack";

const stackAppId = import.meta.env.VITE_STACK_PROJECT_ID;
const stackPublishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider
      projectId={stackAppId}
      publishableClientKey={stackPublishableKey}
      theme={StackTheme.withBrandColor("#0f172a")}
    >
      {children}
    </StackProvider>
  );
}
