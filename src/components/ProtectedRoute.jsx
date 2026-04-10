import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  let token = null;

  if (typeof window !== "undefined") {
    const existingToken = localStorage.getItem("authToken");
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl && tokenFromUrl !== existingToken) {
      localStorage.setItem("authToken", tokenFromUrl);
      window.history.replaceState({}, "", window.location.pathname);
    }

    token = tokenFromUrl || existingToken;
  }

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
