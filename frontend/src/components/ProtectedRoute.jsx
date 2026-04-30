import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "@/lib/api";

export default function ProtectedRoute({ children }) {
  if (!auth.isAuthenticated()) return <Navigate to="/admin/login" replace />;
  return children;
}
