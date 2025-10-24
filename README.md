<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://firebasestorage.googleapis.com/v0/b/vietfurniture-38c34.appspot.com/o/image%2FScreenshot%20(136).png?alt=media&token=690c39fe-3d2c-4e78-a38e-a26e1bafa845" />

📚 Vocabulary Trainer (Desktop App)

Vocabulary Trainer là một ứng dụng học từ vựng trên desktop (Electron) được xây dựng bằng Angular, cung cấp một môi trường học tập cá nhân hóa, mạnh mẽ, và tập trung vào dữ liệu. Ứng dụng hỗ trợ các phương pháp học hiện đại như Flashcard và Trắc nghiệm, đồng thời sử dụng hệ thống báo cáo chi tiết để giúp người dùng theo dõi và cải thiện vốn từ vựng của mình.

✨ Tính Năng Chính

Ứng dụng được thiết kế xoay quanh các tính năng sau:

1. Quản lý Chủ đề (Topics Management)

Danh sách Chủ đề: Hiển thị tất cả các chủ đề (Topics) với tên, số lượng từ vựng, và cấp độ khó (Beginner, Intermediate, v.v.).

Tham khảo ảnh:

Hành động Nhanh: Mỗi chủ đề có các nút hành động trực quan như Practice, Flashcards, và các nút cấu hình/chỉnh sửa.

Cấu hình Luyện tập (Practice Settings): Cho phép người dùng tùy chỉnh tỷ lệ loại câu hỏi (ví dụ: Fill-in-the-Blank so với Multiple Choice) từng chủ đề.

Tham khảo ảnh:

2. Quản lý Từ vựng Chi tiết

Chế độ xem Từ vựng: Hiển thị danh sách từ vựng chi tiết cho từng chủ đề, bao gồm Word, Phonetic, Part of Speech, và Meaning.

Tham khảo ảnh:

Nhập Dữ liệu: Hỗ trợ nhập từ vựng một cách tiện lợi từ file CSV hoặc JSON (thông qua cơ chế IPC của Electron).

Thao tác CRUD: Dễ dàng thêm (Add New Word), chỉnh sửa (Edit), và xóa (Delete) từng từ vựng.

Tham khảo ảnh:

3. Các Phương thức Luyện tập

Flashcard Mode: Hiển thị từng từ vựng, phiên âm (/prɒmɪs/), và cho phép người dùng lật thẻ để xem nghĩa.

Tham khảo ảnh:

Practice Mode (Trắc nghiệm/Điền từ):

Hỗ trợ đa dạng loại câu hỏi, bao gồm trắc nghiệm chọn nghĩa của từ.

Cung cấp thanh tiến trình theo dõi số lượng câu hỏi đã hoàn thành (Ví dụ: Question 1 of 45).

Tham khảo ảnh:

4. Báo cáo Tiến độ (Progress Report - Đã đặc tả)

Mặc dù không có ảnh chụp, ứng dụng được thiết kế để theo dõi các số liệu quan trọng như: Tỉ lệ thuộc từ (Mastery Rate), Từ cần ôn tập, và Lịch sử luyện tập chi tiết. Dữ liệu này được lưu trữ và truy vấn hiệu quả bằng SQLite.

🛠️ Công Nghệ & Kiến Trúc

Ứng dụng được xây dựng trên mô hình Hybrid Desktop sử dụng các công nghệ sau:

Frontend (Renderer Process): Angular (TypeScript)

Cung cấp giao diện người dùng hiện đại, tốc độ cao, và quản lý trạng thái phức tạp (như trạng thái luyện tập, SRS).

Backend/Desktop Wrapper (Main Process): Electron (Node.js/JavaScript ES Module)

Quản lý cửa sổ desktop, truy cập các API hệ thống (ví dụ: dialog để chọn file CSV), và là cầu nối an toàn cho CSDL.

Giao tiếp: IPC (Inter-Process Communication)

Sử dụng ipcMain và ipcRenderer để Frontend Angular gọi các hàm Node.js trong Main Process một cách bảo mật (nhờ contextIsolation và preload.js).

Lưu trữ Dữ liệu: SQLite (File-based Local Database)

Lưu trữ tất cả dữ liệu từ vựng, chủ đề, và kết quả luyện tập vào một file cục bộ duy nhất (.db), đảm bảo hiệu suất truy vấn nhanh cần thiết cho tính năng SRS và Báo cáo, đồng thời đáp ứng yêu cầu lưu trữ dựa trên File của ứng dụng desktop.

🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

Yêu cầu Tiên quyết

Node.js (v20.19+ hoặc v22.12+)

npm (Thường đi kèm với Node.js)

Các Bước Thực hiện

Cài đặt Dependencies:

npm install
npm install csv-parser # Cần thiết cho tính năng nhập CSV
# Cần phải cài đặt SQLite3 sau khi hoàn tất các bước cấu hình DB



Khởi động Ứng dụng:
Chạy lệnh script đã cấu hình trong package.json để thực hiện cả Angular build và khởi động Electron:

npm run electron



(Lệnh này chạy ng build --base-href ./ sau đó là electron .)

Bắt đầu Nhập Dữ liệu:
Sau khi ứng dụng khởi chạy, bạn có thể sử dụng tính năng Import để tải dữ liệu từ vựng ban đầu từ file CSV/JSON vào Local Database (SQLite).
