import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (!hideNavbar) {
      <app-navbar></app-navbar>
    }
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App {
  hideNavbar = false;
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects || event.url)
    ).subscribe(url => {
      // Hide navbar on workspace pages (they have their own header)
      this.hideNavbar = url.startsWith('/problem/') || url.startsWith('/workspace/') || url.startsWith('/sql/') || url.startsWith('/nosql/');
    });
  }
}
