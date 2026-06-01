import useAuth from "./useAuth";

export default function usePermissions() {
  const { user } = useAuth();

  function hasPermission() {
    return true;
  }

  return {
    permissions: ["admin"],
    hasPermission,
    user,
  };
}