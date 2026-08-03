import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// interface FormCreateProductVariantDialogProps {
//   product_id: string;
//   name: string;
//   open?: boolean;
//   onOpenChange?: (open: boolean) => void;
//   trigger?: React.ReactNode;
// }

export default function FormCreateProductVariantDialog({
  product_id,
  name,
}: {
  product_id: number;
  name: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Tạo biến thể sản phẩm {name}</DialogTitle>
          <DialogDescription>Thêm biến thể mới cho sản phẩm</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Nhóm Combobox (Thuộc tính) */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Thuộc tính biến thể
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Combobox 1: Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Màu sắc (Color)</Label>
                <Select defaultValue="black">
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Chọn màu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Đen (Black)</SelectItem>
                    <SelectItem value="white">Trắng (White)</SelectItem>
                    <SelectItem value="blue">Xanh dương (Blue)</SelectItem>
                    <SelectItem value="gold">Vàng (Gold)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Combobox 2: RAM */}
              <div className="space-y-2">
                <Label htmlFor="ram">Dung lượng RAM</Label>
                <Select defaultValue="8gb">
                  <SelectTrigger id="ram">
                    <SelectValue placeholder="Chọn RAM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8gb">8 GB</SelectItem>
                    <SelectItem value="12gb">12 GB</SelectItem>
                    <SelectItem value="16gb">16 GB</SelectItem>
                    <SelectItem value="32gb">32 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Combobox 3: Storage */}
              <div className="space-y-2">
                <Label htmlFor="storage">Bộ nhớ trong (Storage)</Label>
                <Select defaultValue="128gb">
                  <SelectTrigger id="storage">
                    <SelectValue placeholder="Chọn bộ nhớ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128gb">128 GB</SelectItem>
                    <SelectItem value="256gb">256 GB</SelectItem>
                    <SelectItem value="512gb">512 GB</SelectItem>
                    <SelectItem value="1tb">1 TB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Nhóm Input (Giá & Kho) */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Giá & Tồn kho
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input 1: Cost Price */}
              <div className="space-y-2">
                <Label htmlFor="cost_price">Giá nhập (Cost Price)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  placeholder="0"
                  defaultValue="15000000"
                />
              </div>

              {/* Input 2: Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (Price)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  defaultValue="18990000"
                />
              </div>

              {/* Input 3: Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock">Số lượng kho (Stock)</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  defaultValue="50"
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Nhóm Switch (Cấu hình trạng thái) */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Trạng thái & Cấu hình
            </h3>

            <div className="space-y-3">
              {/* Switch 1 */}
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="is_active"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Kích hoạt biến thể (Active)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Cho phép hiển thị và bán biến thể này trên cửa hàng.
                  </p>
                </div>
                <Switch id="is_active" defaultChecked />
              </div>

              {/* Switch 2 */}
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="is_default"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Biến thể mặc định (Default)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Tự động chọn biến thể này khi khách hàng xem sản phẩm.
                  </p>
                </div>
                <Switch id="is_default" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline">Thêm mới</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
