import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, catchError, first, map, of } from 'rxjs';
import { ProductoService } from '../services/producto.service';

/* Requerido, la Fecha debe ser igual o mayor a la fecha actual. */
export function fechaMinimaHoyValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const fechaIngresada = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaIngresada.setHours(0, 0, 0, 0);

    return fechaIngresada < hoy ? { fechaInvalida: true } : null;
  };
}

/* validación de ser un Id que no exista mediante el consumo del servicio de verificación. */
export function idExisteValidator(productoService: ProductoService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    return productoService.verificarExistenciaId(control.value).pipe(
      first(),
      map((existe) => (existe ? { idExiste: true } : null)),
      catchError(() => of(null))
    );
  };
}
