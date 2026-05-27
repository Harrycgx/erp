import { useEffect, useState } from "react";

import supabase from "../../lib/supabase";

import useAuth from "./useAuth";

export default function usePermissions() {
  const { user } = useAuth();

  const [permissions, setPermissions] =
    useState([]);

  useEffect(() => {
    if (user) {
      loadPermissions();
    }
  }, [user]);

  async function loadPermissions() {
    const { data, error } =
      await supabase
        .from("user_roles")
        .select(`
          roles (
            role_permissions (
              permissions (
                key
              )
            )
          )
        `)
        .eq("user_id", user.id);

    if (error) {
      console.error(error);

      return;
    }

    const extracted =
      data.flatMap((userRole) =>
        userRole.roles
          .role_permissions.map(
            (rp) =>
              rp.permissions.key
          )
      );

    const uniquePermissions =
      [...new Set(extracted)];

    setPermissions(
      uniquePermissions
    );
  }

  function hasPermission(
    permission
  ) {
    return permissions.includes(
      permission
    );
  }

  return {
    permissions,
    hasPermission,
  };
}