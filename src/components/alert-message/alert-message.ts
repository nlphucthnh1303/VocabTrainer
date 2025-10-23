// src/app/components/alert-message/alert-message.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-alert-message',
  templateUrl: './alert-message.html',
  styleUrls: ['./alert-message.css'],
  imports: [CommonModule]
})
export class AlertMessageComponent implements OnInit, OnDestroy {
  currentAlert: Alert | null = null;
  private alertSubscription!: Subscription;
  private timeoutId: any; // ID của setTimeout

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertSubscription = this.alertService.alert$.subscribe(alert => {
      // 1. Xóa timeout cũ nếu có thông báo mới đến
      this.clearTimeout(); 

      if (alert.message) {
        this.currentAlert = alert;
        
        // 2. Thiết lập timeout mới nếu thông báo có cờ autoClose
        if (alert.autoClose) {
          this.timeoutId = setTimeout(() => {
            this.hideAlert();
          }, alert.timeout); 
        }
      } else {
        // Ẩn thông báo nếu nhận được lệnh clear (message rỗng)
        this.hideAlert();
      }
    });
  }

  // Hàm ẩn thông báo và reset trạng thái
  hideAlert() {
    this.currentAlert = null;
    this.clearTimeout();
  }

  // Xóa setTimeout ID để tránh rò rỉ bộ nhớ
  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  ngOnDestroy() {
    this.alertSubscription.unsubscribe();
    this.clearTimeout(); // Đảm bảo xóa timeout khi component bị hủy
  }
}