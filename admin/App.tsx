import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import UsersPage from './UsersPage';
import TransactionsPage from './TransactionsPage';

export default function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="users" element={<UsersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="/" element={<Navigate to="/users" replace />} />
      </Routes>
    </AdminLayout>
  );
}

