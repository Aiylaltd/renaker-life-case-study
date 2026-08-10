"use client";

import { useEffect, useState } from "react";

export function useDebug3d() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("debug3d") === "1");
  }, []);

  return enabled;
}
