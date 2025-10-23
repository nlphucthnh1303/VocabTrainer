// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

// Định nghĩa giao diện (interface) cho thông báo
export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose: boolean; // Thêm cờ này để dễ quản lý
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  // Subject để phát ra thông báo mới
  private alertSubject = new Subject<Alert>();
  
  // Observable để các component đăng ký lắng nghe
  alert$ = this.alertSubject.asObservable();

  constructor() { }

  // Hàm chính để hiển thị thông báo
  show(
    type: Alert['type'], 
    message: string, 
    timeout: number = 3000 // Mặc định 3000ms (3s)
  ) {
    const alert: Alert = { 
      type, 
      message, 
      autoClose: true, 
      timeout 
    };
    
    // Phát ra thông báo
    this.alertSubject.next(alert);
  }

  // Hàm tắt thông báo (nếu cần thủ công)
  clear() {
    // Phát ra thông báo rỗng hoặc null để ẩn
    // Tùy thuộc vào cách component xử lý
    // Ở ví dụ này, ta sẽ dùng một thông báo rỗng
    this.alertSubject.next({
      type: 'info',
      message: '',
      autoClose: false,
      timeout: 0
    });
  }
}