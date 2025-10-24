import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {VocabularyItem} from '../models/vocabulary.model';
@Injectable({
  providedIn: 'root'
})
export class VocabularyService {
  private collectionName = 'vocabulary';

  constructor(private firestore: Firestore) { }

  getItems(): Observable<any[]> {
    const coll = collection(this.firestore, this.collectionName);
    console.log(coll);
    return collectionData(coll, { idField: 'id' });
  }
  async createItem(data: VocabularyItem) {
    const itemsCollection = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(itemsCollection, data);
    return docRef.id;
  }
  

    // read a single item by ID
    getItemById(id: string): Observable<any> {
        const itemDoc = doc(this.firestore, `${this.collectionName}/${id}`);
        return docData(itemDoc, { idField: 'id' });
    }

    // update an item
    async updateItem(id: string, data: any): Promise<void> {
        const itemDoc = doc(this.firestore, `${this.collectionName}/${id}`);
        await updateDoc(itemDoc, data);
    }

    // delete an item
    async deleteItem(id: string): Promise<void> {
        const itemDoc = doc(this.firestore, `${this.collectionName}/${id}`);
        await deleteDoc(itemDoc);
    }
}
