import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductoService} from '../../services/producto.service';
import {ActivatedRoute, Router} from '@angular/router';
import {fechaMinimaHoyValidator, idExisteValidator} from '../../Validators/producto.validator';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {HeaderComponent} from '../../components/header/header.component';
import {NgIf} from '@angular/common';
import {Producto} from '../../models/Product.model';

@Component({
  selector: 'app-product-form',
  imports: [
    HeaderComponent,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  standalone: true
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  enviando = false;
  errorEnvio: string | null = null;

  modoEdicion = signal(false);
  cargandoProducto = signal(false);
  private productoId: string | null = null;
  private productoOriginal: Producto | null = null;

  form: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
      [idExisteValidator(this.productService)],
    ],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', Validators.required],
    date_release : ['', [Validators.required, fechaMinimaHoyValidator()]],
    date_revision : [{ value: '', disabled: true }, [Validators.required]],
  })

  ngOnInit(): void {
      this.form
        .get('date_release')!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((fecha) => this.actualizarFechaRevision(fecha));

      this.productoId = this.route.snapshot.paramMap.get('id');

      if (this.productoId) {
        this.modoEdicion.set(true);
        this.cargandoProductoParaEditar(this.productoId);
      }
  }

  private cargandoProductoParaEditar(id: string) {
    this.cargandoProducto.set(true);

    this.productService.getProductoById(id).subscribe({
      next: (producto) => {
        this.productoOriginal = producto;
        this.form.patchValue(producto);
        this.form.get('id')!.disable();
        this.cargandoProducto.set(false);
      },
      error: () => {
        this.errorEnvio = 'No se pudo cargar el  producto para editar';
        this.cargandoProducto.set(false);
      }
    });
  }

  private actualizarFechaRevision(fechaLiberacion: string): void {
    const control = this.form.get('date_revision')!;

    if (!fechaLiberacion) {
      control.setValue('');
      return;
    }

    const fecha = new Date(fechaLiberacion);
    fecha.setFullYear(fecha.getFullYear() + 1);

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    control.setValue(`${yyyy}-${mm}-${dd}`);
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.form.get(nombreCampo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  mensajeError(nombreCampo: string): string {
    const control = this.form.get(nombreCampo);
    if (!control || !control.errors) {
      return '';
    }

    if (nombreCampo === 'id') {
      return 'ID no válido!';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido!';
    }
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['fechaInvalida']) {
      return 'La fecha debe ser igual o mayor a la fecha actual';
    }

    return 'Campo inválido';
  }

  // Acciones
  reiniciar() {
    if (this.modoEdicion() && this.productoOriginal) {
      this.form.patchValue(this.productoOriginal);
    } else {
      this.form.reset();
    }
    this.errorEnvio = null;
  }

  enviar() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.errorEnvio = null;

    const peticion = this.modoEdicion()
      ? this.productService.putProducto(this.productoId!, this.form.getRawValue())
      : this.productService.postProducts(this.form.getRawValue())

    peticion.subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigate(['/products']);
      },
      error: () => {
        this.enviando = false;
        this.errorEnvio = this.modoEdicion()
          ? 'Ocurrió un error al actualizar el producto. Intenta nuevamente.'
          : 'Ocurrió un error al crear el producto. Intenta nuevamente.';
      }
    });
  }

}
