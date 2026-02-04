import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.is_admin) {
      fetchUsers();
    } else {
      setLoading(false);
      setError("Access Denied. You are not an admin.");
    }
  }, [currentUser]);

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setIsResetModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/users/${selectedUser.id}`);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    setActionLoading(true);
    try {
      await axios.put(`${API_URL}/users/${selectedUser.id}/reset-password`, {
        newPassword,
      });
      alert("Password reset successfully");
      setIsResetModalOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reset password");
    } finally {
      setActionLoading(false);
    }
  };

  if (!currentUser?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-red-500 font-bold text-xl">
        Access Denied
      </div>
    );
  }

  if (loading) return <div className="text-center mt-10">Loading users...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gradient-gold">
          Admin Dashboard
        </h2>
        <Link
          to="/"
          className="px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-accent via-amber-500 to-yellow-500 hover:bg-yellow-500 rounded-xl transition-all"
        >
          &larr; Back to Home
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs">{user.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openResetModal(user)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Reset Pass
                    </button>
                    {!user.is_admin && (
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        actions={
          <button
            onClick={handleDeleteUser}
            disabled={actionLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {actionLoading ? "Deleting..." : "Delete User"}
          </button>
        }
      >
        <p>
          Are you sure you want to delete user{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {selectedUser?.username}
          </span>
          ?
        </p>
        <p className="mt-2 text-sm text-red-500">
          This action cannot be undone and will delete all associated data.
        </p>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Password"
        actions={
          <button
            onClick={handleResetPassword}
            disabled={actionLoading || newPassword.length < 6}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {actionLoading ? "Resetting..." : "Reset Password"}
          </button>
        }
      >
        <p className="mb-4">
          Enter a new password for{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {selectedUser?.username}
          </span>
          .
        </p>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-500">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Min. 6 characters"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
