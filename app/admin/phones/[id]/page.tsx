import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  RefreshCw,
  Save,
  Sliders,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";

export default function PhoneDetailPage() {
  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          href="/admin/phones"
          className="hover:text-blue-600 transition-colors"
        >
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">iPhone 15 Pro Max</span>
      </div>

      {/* Header Info Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/phones">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                iPhone 15 Pro Max
              </h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                Đang bán
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              ID: #1 <span className="mx-1">•</span> Slug: iphone-15-pro-max
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            Xem trên Web
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
          >
            <Save className="h-3.5 w-3.5" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <Tabs
        defaultValue="skus"
        className="flex w-full flex-col space-y-5"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* DÒNG 1: TABS HEADER VỚI BADGE & COLOR HIGHLIGHT */}
        <div className="w-full shrink-0 border-b border-slate-200 pb-3">
          <TabsList className="flex h-auto w-full justify-start gap-2 bg-transparent p-0 overflow-x-auto">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <FileText className="h-4 w-4" />
              <span>Thông tin chung</span>
            </TabsTrigger>

            <TabsTrigger
              value="skus"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-indigo-600 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              <Layers className="h-4 w-4" />
              <span>Biến thể (SKUs)</span>
              <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700 font-bold">
                2
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="specs"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-violet-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-600"
            >
              <Sliders className="h-4 w-4" />
              <span>Thông số kỹ thuật</span>
            </TabsTrigger>

            <TabsTrigger
              value="gallery"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-amber-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Thư viện ảnh</span>
              <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 font-bold">
                4
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* DÒNG 2: NỘI DUNG TABS */}
        <div className="w-full shrink-0">
          {/* TAB 1: THÔNG TIN CHUNG */}
          <TabsContent
            value="general"
            className="m-0 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Thông tin cơ bản
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cấu hình tiêu đề, đường dẫn hiển thị và danh mục.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    Đặt lại
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Cập nhật
                  </Button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-slate-700"
                  >
                    Tên sản phẩm
                  </Label>
                  <Input
                    id="name"
                    defaultValue="iPhone 15 Pro Max"
                    className="border-slate-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="slug"
                    className="text-xs font-medium text-slate-700"
                  >
                    Slug đường dẫn
                  </Label>
                  <Input
                    id="slug"
                    defaultValue="iphone-15-pro-max"
                    className="border-slate-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Dòng sản phẩm (Serie)
                  </Label>
                  <Select defaultValue="iphone-15">
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Chọn dòng sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iphone-15">
                        iPhone 15 Series
                      </SelectItem>
                      <SelectItem value="iphone-14">
                        iPhone 14 Series
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Trạng thái hiển thị
                  </Label>
                  <Select defaultValue="active">
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang bán (Active)</SelectItem>
                      <SelectItem value="draft">Nháp (Draft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: BIẾN THỂ SKUS */}
          <TabsContent value="skus" className="m-0 focus-visible:outline-none">
            <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
              {/* Bảng danh sách SKU */}
              <div className="w-full xl:flex-1 min-w-0">
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Danh sách Biến thể (SKUs)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quản lý Mã SKU, Giá bán, Giá nhập và Số lượng tồn kho.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm biến thể
                    </Button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <Table className="w-full min-w-[650px]">
                      <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs font-semibold text-slate-700">
                            Mã SKU
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">
                            Cấu hình
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-right text-slate-700">
                            Giá bán
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-right text-slate-700">
                            Giá nhập
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center text-slate-700">
                            Tồn kho
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center text-slate-700">
                            Trạng thái
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-center text-slate-700">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                            IP15PM-TITAN-256
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-slate-800">
                              Titan Tự Nhiên
                            </span>
                            <br />
                            <span className="text-[11px] text-slate-500">
                              256GB • 8GB RAM
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-emerald-600 text-right">
                            29,990,000 đ
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 text-right">
                            25,000,000 đ
                          </TableCell>
                          <TableCell className="text-xs text-center font-medium">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                              45
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 text-[10px] font-medium">
                              Mặc định
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-blue-600"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                            IP15PM-BLUE-512
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-slate-800">
                              Titan Xanh
                            </span>
                            <br />
                            <span className="text-[11px] text-slate-500">
                              512GB • 8GB RAM
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-emerald-600 text-right">
                            34,990,000 đ
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 text-right">
                            29,500,000 đ
                          </TableCell>
                          <TableCell className="text-xs text-center font-medium">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                              12
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className="text-slate-600 border-slate-200 text-[10px]"
                            >
                              Hoạt động
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-blue-600"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Ô xem ảnh bên phải */}
              <div className="w-full xl:w-80 shrink-0">
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900">
                      Ảnh đại diện chính
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
                    >
                      Xóa ảnh
                    </Button>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition-colors">
                    <div className="h-36 w-36 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-400 font-medium text-xs mb-3 shadow-inner">
                      Main Preview
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Định dạng PNG, JPG (Tối đa 2MB)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                      Thay ảnh mới
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: THÔNG SỐ KỸ THUẬT */}
          <TabsContent value="specs" className="m-0 focus-visible:outline-none">
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Thông số kỹ thuật chi tiết
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thiết lập thông số cho trang so sánh và chi tiết sản phẩm.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  Lưu cấu hình
                </Button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Màn hình
                  </Label>
                  <Input
                    defaultValue="6.7 inch, Super Retina XDR OLED, 120Hz"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Chip xử lý (CPU)
                  </Label>
                  <Input
                    defaultValue="Apple A17 Pro 6 nhân"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Camera sau
                  </Label>
                  <Input
                    defaultValue="Chính 48 MP & Phụ 12 MP, 12 MP"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Pin & Sạc
                  </Label>
                  <Input
                    defaultValue="4422 mAh, Sạc nhanh 20W"
                    className="border-slate-200"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: THƯ VIỆN ẢNH */}
          <TabsContent
            value="gallery"
            className="m-0 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Bộ sưu tập ảnh sản phẩm
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý danh sách hình ảnh bổ sung cho sản phẩm.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Tải ảnh lên
                </Button>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="group relative aspect-square rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-medium overflow-hidden hover:border-amber-400 transition-all"
                  >
                    <span>Image {item}</span>
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 hover:bg-white text-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 bg-rose-600 hover:bg-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
