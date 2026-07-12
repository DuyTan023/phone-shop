


CREATE TABLE brands (
    id SERIAL PRIMARY KEY,         -- Trong Postgres, dùng SERIAL để tự động tăng ID (1, 2, 3...)
    name VARCHAR(255) NOT NULL,    -- Tên thương hiệu, không được để trống
    slug VARCHAR(255) NOT NULL UNIQUE,      -- Đường dẫn thân thiện (ví dụ: 'apple', 'samsung'), nên đặt UNIQUE để không trùng
    logo VARCHAR(255),             -- Lưu đường dẫn hình ảnh logo (ví dụ: '/images/logos/apple.png')
    description TEXT               -- Mô tả chi tiết về hãng
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,         -- ID tự động tăng (1, 2, 3...) cho từng danh mục
    name VARCHAR(100) NOT NULL,    -- Tên danh mục (ví dụ: 'Photo phone', 'Gaming phone')
    slug VARCHAR(150) UNIQUE       -- Đường dẫn URL thân thiện (ví dụ: 'smartphone', 'tablet'), không được trùng
);


CREATE TABLE colors (
    id SERIAL PRIMARY KEY,         -- ID tự động tăng (1, 2, 3...) cho từng màu
    name VARCHAR(100) NOT NULL,    -- Tên màu sắc (ví dụ: 'Deep Purple', 'Bạc')
    hex_code VARCHAR(7) UNIQUE     -- Mã màu định dạng HEX (ví dụ: '#FFFFFF', '#000000')
);

CREATE TABLE storages (
    id SERIAL PRIMARY KEY,        -- ID tự động tăng (1, 2, 3...) cho từng tùy chọn bộ nhớ
    value VARCHAR(20) NOT NULL    -- Giá trị dung lượng (ví dụ: '128GB', '256GB', '1TB')
);

CREATE TABLE rams (
    id SERIAL PRIMARY KEY,        -- ID tự động tăng (1, 2, 3...) cho từng tùy chọn RAM
    value VARCHAR(20) NOT NULL    -- Giá trị dung lượng RAM (ví dụ: '6GB', '8GB', '12GB')
);


CREATE TABLE products (
    id SERIAL PRIMARY KEY,                                     -- Khóa chính tự tăng
    brand_id INT,                                              -- Cột lưu mã thương hiệu
    category_id INT,                                           -- Cột lưu mã danh mục
    name VARCHAR(255) NOT NULL,                                -- Tên sản phẩm
    slug VARCHAR(255) UNIQUE,                                  -- Đường dẫn URL thân thiện, không trùng lặp
    description TEXT,                                          -- Mô tả chi tiết sản phẩm
    
    -- Định nghĩa các khóa ngoại liên kết dữ liệu ở đây:
    CONSTRAINT fk_product_brand 
        FOREIGN KEY (brand_id) 
        REFERENCES brands(id) 
        ON DELETE SET NULL,
        
    CONSTRAINT fk_product_category 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE SET NULL
);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,                                     -- Khóa chính tự tăng
    product_id INT NOT NULL,                                   -- Mã sản phẩm chính (bắt buộc)
    color_id INT,                                              -- Mã màu sắc
    storage_id INT,                                            -- Mã dung lượng bộ nhớ
    ram_id INT,                                                -- Mã dung lượng RAM
    sku VARCHAR(100) UNIQUE,                                   -- Mã quản lý kho (Ví dụ: IP15PM-256-TITAN), không được trùng
    price DECIMAL(12, 2) NOT NULL DEFAULT 0,                   -- Giá bán của biến thể này
    stock INT NOT NULL DEFAULT 0,                              -- Số lượng tồn kho của biến thể này
    
    -- Thiết lập các khóa ngoại để liên kết dữ liệu:
    CONSTRAINT fk_variant_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE,                                     -- Nếu xóa sản phẩm chính, các biến thể tự động xóa theo
        
    CONSTRAINT fk_variant_color 
        FOREIGN KEY (color_id) 
        REFERENCES colors(id) 
        ON DELETE SET NULL,                                    
        
    CONSTRAINT fk_variant_storage 
        FOREIGN KEY (storage_id) 
        REFERENCES storages(id) 
        ON DELETE RESTRICT,                                    -- Không cho phép xóa mức dung lượng nếu đang có máy dùng nó
        
    CONSTRAINT fk_variant_ram 
        FOREIGN KEY (ram_id) 
        REFERENCES rams(id) 
        ON DELETE RESTRICT
);


CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,                                     -- Khóa chính tự tăng
    product_id INT NOT NULL,                                   -- Mã sản phẩm chính (bắt buộc)
    variant_id INT,                                            -- Mã biến thể (để trống nếu là ảnh chung)
    image_url VARCHAR(500) NOT NULL,                           -- Đường dẫn file ảnh (ví dụ: '/uploads/products/iphone15-titan.png')
    is_featured BOOLEAN DEFAULT FALSE,                         -- Ảnh đại diện chính (TRUE/FALSE)
    
    -- Thiết lập các khóa ngoại liên kết dữ liệu:
    CONSTRAINT fk_image_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE,                                     -- Xóa sản phẩm thì ảnh tự động xóa theo
        
    CONSTRAINT fk_image_variant 
        FOREIGN KEY (variant_id) 
        REFERENCES product_variants(id) 
        ON DELETE CASCADE                                      -- Xóa biến thể thì ảnh của biến thể đó tự động xóa theo
);

--Tạo bảng Nhóm thông số (Màn hình, Pin, Camera...)
CREATE TABLE spec_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

--Tạo bảng Tên thông số (Tần số quét, Dung lượng pin, Chip...)
CREATE TABLE spec_keys (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    -- Khóa ngoại nối tới nhóm thông số
    CONSTRAINT fk_spec_key_group 
        FOREIGN KEY (group_id) 
        REFERENCES spec_groups(id) 
        ON DELETE CASCADE
);

-- Bảng lưu giá trị thông số chi tiết của từng sản phẩm
CREATE TABLE product_specs (
    product_id INT NOT NULL,
    spec_key_id INT NOT NULL,
    spec_value TEXT NOT NULL,
    
    -- Tạo khóa chính kết hợp (Composite Primary Key) như bạn thiết kế
    PRIMARY KEY (product_id, spec_key_id),
    
    -- Khóa ngoại nối tới bảng sản phẩm chính
    CONSTRAINT fk_spec_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE,
        
    -- Khóa ngoại nối tới bảng tên thông số
    CONSTRAINT fk_spec_key 
        FOREIGN KEY (spec_key_id) 
        REFERENCES spec_keys(id) 
        ON DELETE CASCADE
);