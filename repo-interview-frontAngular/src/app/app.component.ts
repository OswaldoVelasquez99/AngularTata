import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ListComponent} from './feature/products/pages/list/list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'repo-interview-frontAngular';
}
