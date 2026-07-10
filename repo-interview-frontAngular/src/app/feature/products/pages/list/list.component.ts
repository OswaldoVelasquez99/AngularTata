import {Component, computed, HostListener, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ProductoService} from '../../services/producto.service';
import {Producto} from '../../models/Product.model';
import {HeaderComponent} from '../../components/header/header.component';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-list',
  imports: [CommonModule, FormsModule, HeaderComponent, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  standalone: true
})
export class ListComponent {

  private productoService = inject(ProductoService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  // Busqueda
  terminoBusqueda = signal<string>('');

  // Cantidad de regsitros
  opcionesPageSize = [5, 10, 20];
  pageSize = signal<number>(5);
  dropdownOpen = signal<boolean>(true);

  productosFiltrados = computed<Producto[]>(() => {
    const termino = this.terminoBusqueda().trim().toLowerCase();
    const lista = this.productos();

    if (!termino){
      return lista;
    }

    return lista.filter((p) => {
      p.name.toLowerCase().includes(termino) ||
      p.description.toLowerCase().includes(termino);
    })
  })

  productosVisibles = computed<Producto[]>(() => {
    return this.productosFiltrados().slice(0, this.pageSize());
  });

  menuAbiertoId = signal<string | null>(null);
  productoAEliminar = signal<Producto | null>(null);
  eliminando = signal<boolean>(false);
  errorEliminar = signal<string | null>(null);

  constructor() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.error.set(null);

    this.productoService.getProducts().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos financieros.');
        this.cargando.set(false);
      },
    });
  }

  onBuscar(valor: string) {
    this.terminoBusqueda.set(valor);
  }

  toggleDropdown() {
    this.dropdownOpen.update((abierto) => !abierto);
  }

  seleccionarPageSize(valor: number) {
    this.pageSize.set(valor);
    this.dropdownOpen.set(false);
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) {
      return '';
    }

    const palabras = nombre.trim().split(/\s+/);
    const iniciales = palabras.slice(0, 2).map((p) => p[0]?.toUpperCase());
    return iniciales.join('');
  }

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.menuAbiertoId.update((actual) => (actual === id ? null : id));
  }

  @HostListener('document:click')
  cerrarMenu() {
    this.menuAbiertoId.set(null)
  }

  editarProducto(producto: Producto, event: Event) {
    event.stopPropagation();
    this.menuAbiertoId.set(null);
    this.router.navigate(['/products/edit', producto.id]);
  }

  solicitarEliminar(producto: Producto, event: Event): void {
    event.stopPropagation();
    this.menuAbiertoId.set(null);
    this.errorEliminar.set(null);
    this.productoAEliminar.set(producto);
  }

  cancelarEliminar() {
    if (this.eliminando()) {
      return;
    }

    this.productoAEliminar.set(null);
  }

  confirmarEliminar() {
    const producto = this.productoAEliminar();
    if (!producto || this.eliminando()) {
      return;
    }

    this.eliminando.set(true);
    this.errorEliminar.set(null);

    this.productoService.deleteProducto(producto.id).subscribe({
      next: () => {
        this.productos.update((lista) => lista.filter((p) => p.id !== producto.id));
        this.eliminando.set(false);
        this.productoAEliminar.set(null);
      },
      error: () => {
        this.eliminando.set(false);
        this.errorEliminar.set('No se pudo eliminar los productos. Intenta nuevamente');
      }
    });
  }
}
