import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

// Do main.js chạy trong môi trường ES Module, cần định nghĩa __dirname thủ công
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Định nghĩa CSDL (tên db, user, password, host, port...)
// import { Pool } from 'pg'; 
// const pool = new Pool({...}); // KHỞI TẠO KẾT NỐI POSTGRESQL TẠI ĐÂY

let win; // Biến giữ tham chiếu đến cửa sổ

function createWindow() {
  // 1. Tạo cửa sổ trình duyệt (BrowserWindow)
  win = new BrowserWindow({
    width: 1300,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000', // Đảm bảo nền đen Dark Mode
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false, 
      // preload: path.join(__dirname, 'preload.js') // Tùy chọn: Dùng cho bảo mật IPC
    },
  });

  // 2. Tải index.html từ thư mục Angular đã build
  // LƯU Ý: Thay thế 'project-name/browser' bằng đường dẫn thực tế của bạn
  const indexPath = path.join(__dirname, 'dist/index.html');
  
  win.loadURL(
    url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true
    })
  );

  // Mở DevTools (chỉ dùng khi debug)
  // win.webContents.openDevTools();

  // Xử lý khi cửa sổ đóng
  win.on('closed', () => {
    win = null;
  });
}

// Khi Electron sẵn sàng, tạo cửa sổ
app.whenReady().then(createWindow);

// Thoát khi tất cả cửa sổ đóng, ngoại trừ trên macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ----------------------------------------------------------------
// 3. LỚP IPC (INTER-PROCESS COMMUNICATION) CHO CSDL
// ----------------------------------------------------------------
/*
ipcMain.on('query-db', async (event, queryData) => {
    // ... logic PostgreSQL
});
*/