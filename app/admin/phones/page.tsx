"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSerie, setSelectedSerie] = useState("all");

  const mockProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      serie: "iPhone 15 Series",
      variantCount: 6,
      specCount: 12,
      status: "active",
      featuredImage: "https://via.placeholder.com/80",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      serie: "Galaxy S Series",
      variantCount: 4,
      specCount: 15,
      status: "active",
      featuredImage: "https://via.placeholder.com/80",
    },
    {
      id: 3,
      name: "Xiaomi 14 Ultra",
      slug: "xiaomi-14-ultra",
      serie: "Xiaomi Series",
      variantCount: 2,
      specCount: 10,
      status: "draft",
      featuredImage: "https://via.placeholder.com/80",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Quản lý sản phẩm
            </h1>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 font-medium"
            >
              3 sản phẩm
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh mục sản phẩm gốc, biến thể, hình ảnh và thông số kỹ
            thuật.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" /> Xuất file
          </Button>
          <Button
            size="sm"
            className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-xl">
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên sản phẩm, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Select Serie */}
          <Select value={selectedSerie} onValueChange={setSelectedSerie}>
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs border-slate-200 bg-slate-50/50 focus:bg-white">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <SelectValue placeholder="Tất cả Serie" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Serie</SelectItem>
              <SelectItem value="iphone15">iPhone 15 Series</SelectItem>
              <SelectItem value="galaxys">Galaxy S Series</SelectItem>
              <SelectItem value="xiaomi">Xiaomi Series</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset filter button */}
          {(searchTerm || selectedSerie !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedSerie("all");
              }}
              className="h-9 px-3 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Đặt lại
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[70px] text-xs font-semibold text-slate-600 pl-4 py-3">
                    Ảnh
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3">
                    Tên & Slug
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3">
                    Dòng (Serie)
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3">
                    Biến thể
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3">
                    Thông số
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-600 pr-4 py-3">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Featured Image */}
                    <TableCell className="pl-4 py-3">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>

                    {/* Product Name & Slug */}
                    <TableCell className="py-3">
                      <Link
                        href={`/admin/phones/${product.id}`}
                        className="font-medium text-xs text-slate-900 hover:text-blue-600 transition-colors block"
                      >
                        {product.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        /{product.slug}
                      </div>
                    </TableCell>

                    {/* Serie Badge */}
                    <TableCell className="py-3">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 font-normal border border-slate-200/60 text-[11px] rounded-md px-2 py-0.5"
                      >
                        {product.serie}
                      </Badge>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-3">
                      {product.status === "active" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 shadow-none text-[11px] font-medium px-2 py-0.5">
                          • Đang bán
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-500 border-slate-200 text-[11px] font-medium px-2 py-0.5"
                        >
                          • Bản nháp
                        </Badge>
                      )}
                    </TableCell>

                    {/* Variant Count */}
                    <TableCell className="py-3">
                      <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 px-2 py-1 rounded-md bg-slate-100/80 border border-slate-200/50">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{product.variantCount} biến thể</span>
                      </div>
                    </TableCell>

                    {/* Spec Count */}
                    <TableCell className="py-3">
                      <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                        <span>{product.specCount} thông số</span>
                      </div>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right pr-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Menu thao tác</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[160px] text-xs"
                        >
                          <DropdownMenuLabel className="text-[11px] text-slate-400 font-normal">
                            Thao tác
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/phones/${product.id}`}
                              className="cursor-pointer flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />{" "}
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center">
                            <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />{" "}
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa sản phẩm
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-semibold text-slate-700">1-3</span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-slate-700">3</span> sản phẩm
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                disabled
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                disabled
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
