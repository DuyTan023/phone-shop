/* eslint-disable @typescript-eslint/no-explicit-any */
// UserPageList.tsx

"use client";

import { useEffect, useState } from "react";

import type {
  user_role,
  user_status,
  users,
} from "@/app/generated/prisma/client";

import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type EditingUser = {
  role: user_role;
  status: user_status;
};

// const MOCK_USER_ID = 999;

// const MOCK_USER: users = {
//   id: MOCK_USER_ID,
//   clerk_id: "user_test_999",
//   email: "test@example.com",
//   full_name: "Nguyễn Văn Test",
//   phone: "0901234567",
//   avatar_url: null,
//   role: "USER",
//   status: "ACTIVE",
//   created_at: new Date(),
//   updated_at: new Date(),
// };

export default function UserPageList() {
  // =====================================================
  // STATE
  // =====================================================

  const [users, setUsers] = useState<users[]>([]);

  // keyword dùng để lưu giá trị ô Input
  const [keyword, setKeyword] = useState("");

  // searchKeyword dùng để kích hoạt fetch API khi người dùng bấm tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");

  const [role, setRole] = useState<user_role | "ALL">("ALL");

  const [status, setStatus] = useState<user_status | "ALL">("ALL");

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [totalPage, setTotalPage] = useState(1);

  const [loading, setLoading] = useState(false);

  // Những user đang được chỉnh sửa
  const [editingUsers, setEditingUsers] = useState<Record<number, EditingUser>>(
    {},
  );

  // =====================================================
  // FETCH USERS (Single Source of Truth)
  // =====================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        // Chờ microtask để tránh gọi setState đồng bộ trực tiếp trong Effect
        await Promise.resolve();
        setLoading(true);

        const params = new URLSearchParams();

        if (searchKeyword) {
          params.set("keyword", searchKeyword);
        }

        if (role !== "ALL") {
          params.set("role", role);
        }

        if (status !== "ALL") {
          params.set("status", status);
        }

        params.set("page", String(page));
        params.set("limit", String(limit));

        const response = await fetch(`/api/users?${params.toString()}`, {
          signal: controller.signal,
        });

        const result: ApiResponse<PaginationResult<users>> =
          await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Không thể lấy danh sách user");
        }

        const apiUsers = result.data.data;

        // Cập nhật danh sách user
        //setUsers([MOCK_USER, ...apiUsers]);
        setUsers([...apiUsers]);

        setTotalPage(result.data.totalPage > 0 ? result.data.totalPage : 1);
      } catch (error: any) {
        if (error.name === "AbortError") return;

        console.error("Fetch users error:", error);

        // Khi lỗi vẫn hiển thị mock user để test
        //setUsers([MOCK_USER]);
        setTotalPage(1);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    // Hủy request nếu dependencies thay đổi nhanh
    return () => {
      controller.abort();
    };
  }, [page, role, status, searchKeyword, limit]);

  // =====================================================
  // SEARCH & RESET
  // =====================================================

  const handleSearch = () => {
    setSearchKeyword(keyword.trim());
    setPage(1);
  };

  const handleReset = () => {
    setKeyword("");
    setSearchKeyword("");
    setRole("ALL");
    setStatus("ALL");
    setPage(1);
  };

  // =====================================================
  // EDIT HANDLERS
  // =====================================================

  const handleRoleChange = (user: users, newRole: user_role) => {
    setEditingUsers((prev) => ({
      ...prev,
      [user.id]: {
        role: newRole,
        status: prev[user.id]?.status ?? user.status,
      },
    }));
  };

  const handleStatusChange = (user: users, newStatus: user_status) => {
    setEditingUsers((prev) => ({
      ...prev,
      [user.id]: {
        role: prev[user.id]?.role ?? user.role,
        status: newStatus,
      },
    }));
  };

  const handleCancel = (userId: number) => {
    setEditingUsers((prev) => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

  const handleSave = async (user: users) => {
    const editing = editingUsers[user.id];

    if (!editing) return;

    // if (user.id === MOCK_USER_ID) {
    //   setUsers((prev) =>
    //     prev.map((item) =>
    //       item.id === MOCK_USER_ID
    //         ? {
    //             ...item,
    //             role: editing.role,
    //             status: editing.status,
    //           }
    //         : item,
    //     ),
    //   );

    //   handleCancel(user.id);
    //   return;
    // }

    try {
      setLoading(true);

      // Update Role
      if (editing.role !== user.role) {
        const response = await fetch(`/api/users/${user.id}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: editing.role }),
        });

        const result: ApiResponse<users> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Cập nhật role thất bại");
        }
      }

      // Update Status
      if (editing.status !== user.status) {
        const response = await fetch(`/api/users/${user.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: editing.status }),
        });

        const result: ApiResponse<users> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Cập nhật trạng thái thất bại");
        }
      }

      // Update UI
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role: editing.role,
                status: editing.status,
              }
            : item,
        ),
      );

      handleCancel(user.id);
    } catch (error) {
      console.error("Update user error:", error);

      alert(error instanceof Error ? error.message : "Cập nhật user thất bại");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">
      {/* FILTER */}
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          placeholder="Tìm kiếm user..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="md:w-[350px]"
        />

        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value as user_role | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">Tất cả role</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as user_status | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleSearch}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Tìm kiếm
        </Button>

        <Button
          onClick={handleReset}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Đặt lại
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không có user
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const editing = editingUsers[user.id];
                const currentRole = editing?.role ?? user.role;
                const currentStatus = editing?.status ?? user.status;
                const isEditing = !!editing;

                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.full_name || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={currentRole}
                        onValueChange={(value) =>
                          handleRoleChange(user, value as user_role)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentStatus}
                        onValueChange={(value) =>
                          handleStatusChange(user, value as user_status)
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="BLOCKED">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(user)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Lưu
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCancel(user.id)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Hủy
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPage > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPage }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={page === pageNumber}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPage) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
