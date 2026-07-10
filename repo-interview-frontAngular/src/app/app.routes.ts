import { Routes } from '@angular/router';
import {ListComponent} from './feature/products/pages/list/list.component';
import {ProductFormComponent} from './feature/products/pages/product-form/product-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
];
