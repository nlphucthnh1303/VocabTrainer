import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), 
    provideFirebaseApp(() => initializeApp({ projectId: "vocabulary-trainer-b30f3", appId: "1:562271025785:web:4b28e8cf6e2eb24810b2a8", storageBucket: "vocabulary-trainer-b30f3.firebasestorage.app", apiKey: "AIzaSyBIKcYNcRApjwLMsf7fqSu4qp8oJC1BXCE", authDomain: "vocabulary-trainer-b30f3.firebaseapp.com", messagingSenderId: "562271025785" })), 
    provideFirestore(() => getFirestore())],
}).catch((err) => console.error(err));


// AI Studio always uses an `index.tsx` file for all project types.
