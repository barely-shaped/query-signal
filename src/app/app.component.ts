import { Component, signal } from '@angular/core';
import { querySignal } from '@barelyshaped/query-signal';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="quantity.set(10)">10 users</button>
    <button (click)="quantity.set(20)">20 users</button>

    <pre>{{ users() | json }}</pre>
  `,
})
export class AppComponent {
  title = signal('query-signal-app');
  quantity = signal(10);

  users = querySignal({
    queryFn: this.persons.getAll,
    queryParams: [this.quantity],
    initialValue: [],
  });

  constructor(private readonly persons: PersonsService) {}
}
