import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  let status = "Đang kiểm tra...";
  let details = "";
  let isSuccess = false;

  try {
    // Gửi lệnh truy vấn thô để test tín hiệu
    await prisma.$queryRaw`SELECT 1`;

    status = "Kết nối PostgreSQL thành công! 🎉";
    details =
      "Hệ thống Prisma 7 và Driver Adapter pg đã thông suốt, sẵn sàng làm việc.";
    isSuccess = true;
  } catch (error: unknown) {
    // Đổi từ 'any' sang 'unknown' theo đúng chuẩn TypeScript
    status = "Kết nối thất bại! ❌";

    // Kiểm tra xem error có phải là một đối tượng Error chuẩn không để lấy message
    if (error instanceof Error) {
      details = error.message;
    } else {
      details =
        "Không thể thiết lập kết nối tới cơ sở dữ liệu do lỗi không xác định.";
    }

    isSuccess = false;
  }
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "650px",
        margin: "60px auto",
        border: `1px solid ${isSuccess ? "#22c55e" : "#ef4444"}`,
        borderRadius: "12px",
        backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <h1
        style={{
          color: isSuccess ? "#15803d" : "#b91c1c",
          marginTop: 0,
          fontSize: "24px",
        }}
      >
        {status}
      </h1>

      <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.5" }}>
        {details}
      </p>

      {!isSuccess && (
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #fca5a5",
            paddingTop: "15px",
          }}
        >
          <strong style={{ color: "#b91c1c" }}>💡 Gợi ý kiểm tra nhanh:</strong>
          <ul
            style={{
              paddingLeft: "20px",
              color: "#4b5563",
              lineHeight: "1.8",
              marginTop: "8px",
            }}
          >
            <li>
              Bạn đã bật ứng dụng PostgreSQL (như pgAdmin, Docker Postgres) lên
              chưa?
            </li>
            <li>
              Chuỗi <code>DATABASE_URL</code> trong file <code>.env</code> đã
              điền đúng thông tin chưa?
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
