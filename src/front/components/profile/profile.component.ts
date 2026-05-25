import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, ProfileResponse, RestCountryResponse } from '../../services/api.service';
import { AuthService, AuthUser } from '../../services/auth.service';

interface CountrySuggestion {
  code: string;
  name: string;
  phonePrefix: string;
  label: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName = '';
  nombre = '';
  apellidos = '';
  email = '';
  telefono = '';
  paisId: number | null = null;
  pais = '';
  codigoPais = '';
  prefijoPais = '';
  paisBusqueda = '';
  fechaRegistro = '';
  paises: CountrySuggestion[] = [];
  sugerenciasPais: CountrySuggestion[] = [];
  mostrarSugerenciasPais = false;
  editando = false;
  guardando = false;
  adminMode = false;
  profileUserName: string | null = null;
  rolesDisponibles: string[] = [];
  rolesUsuario: string[] = [];
  guardandoRoles = false;
  mensajeRoles = '';
  errorRoles = '';
  perfilNoEncontrado = false;
  mensajeErrorPerfil = '';

  constructor(
    public readonly servicioAuth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {
    if (!this.servicioAuth.validateSession()) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileUserName = this.route.snapshot.paramMap.get('userName');
    this.adminMode = Boolean(this.profileUserName);

    if (!this.adminMode) {
      this.resetForm();
    }
  }

  ngOnInit(): void {
    this.cargarPaisesRestCountries();
    this.cargarDatosPerfil();
  }

  get nombreMostrado(): string {
    return this.nombre.trim() || 'Usuario';
  }

  get userNameMostrado(): string {
    return this.userName.trim();
  }

  get miembroDesde(): string {
    if (!this.fechaRegistro) {
      return 'Miembro';
    }

    return `Miembro desde ${this.formatearFecha(this.fechaRegistro)}`;
  }

  get puedeEditarPerfil(): boolean {
    return !this.adminMode;
  }

  activarEdicion(): void {
    if (!this.puedeEditarPerfil) {
      return;
    }

    this.editando = true;
  }

  cancelarEdicion(): void {
    this.resetForm();
    this.editando = false;
  }

  cargarDatosPerfil(): void {
    this.perfilNoEncontrado = false;
    this.mensajeErrorPerfil = '';

    if (!this.servicioAuth.getUser()) {
      this.router.navigate(['/login']);
      return;
    }

    const token = this.servicioAuth.getToken();

    if (this.adminMode && this.profileUserName) {
      forkJoin({
        perfil: this.api.getProfileByUserName(this.profileUserName, token),
        roles: this.api.getRoles(token)
      }).subscribe({
        next: ({ perfil, roles }) => {
          this.rolesDisponibles = roles;
          this.aplicarPerfil(perfil);
        },
        error: (err: HttpErrorResponse) => this.handleProfileError(err, 'Error al obtener los datos del perfil:')
      });
      return;
    }

    this.api.getProfile(token).subscribe({
      next: (datos) => {
        this.aplicarPerfil(datos);
      },
      error: (err: HttpErrorResponse) => this.handleProfileError(err, 'Error al obtener los datos del perfil:')
    });
  }

  resetForm(): void {
    if (this.adminMode) {
      return;
    }

    const usuarioActual = this.servicioAuth.getUser();

    this.userName = usuarioActual?.userName ?? '';
    this.nombre = usuarioActual?.nombre ?? '';
    this.apellidos = usuarioActual?.apellidos ?? '';
    this.email = usuarioActual?.email ?? '';
    this.paisId = usuarioActual?.paisId ?? null;
    this.pais = usuarioActual?.pais ?? '';
    this.codigoPais = usuarioActual?.codigoPais ?? '';
    this.prefijoPais = usuarioActual?.prefijoPais ?? '';
    this.paisBusqueda = this.formatearPais(this.pais, this.codigoPais);
    this.telefono = this.quitarPrefijoTelefono(usuarioActual?.telefono ?? '', this.prefijoPais);
    this.fechaRegistro = usuarioActual?.fechaRegistro ?? '';
  }

  saveProfile(): void {
    if (!this.puedeEditarPerfil) {
      return;
    }

    const usuarioActual = this.servicioAuth.getUser();

    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    this.guardando = true;

    this.api.updateProfile({
      nombre: this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      telefono: this.getTelefonoCompleto(),
      pais: this.pais.trim(),
      codigoPais: this.codigoPais.trim().toUpperCase(),
      prefijoPais: this.prefijoPais.trim()
    }, this.servicioAuth.getToken()).subscribe({
      next: (perfilActualizado) => {
        const usuarioActualizado = this.mapProfileToAuthUser(perfilActualizado, usuarioActual);

        this.aplicarPerfil(perfilActualizado);
        this.servicioAuth.updateUser(usuarioActualizado);
        this.guardando = false;
        this.editando = false;
      },
      error: (err) => {
        this.guardando = false;
        this.handleProfileError(err, 'Error al actualizar el perfil:');
      }
    });
  }

  cargarPaisesRestCountries(): void {
    this.api.getRestCountries().subscribe({
      next: (paises) => {
        this.paises = paises
          .map((pais) => {
            const code = pais.cca2.toUpperCase();
            const name = this.getNombrePais(pais);
            const phonePrefix = this.getPrefijoPais(pais);

            return {
              code,
              name,
              phonePrefix,
              label: this.formatearPais(name, code)
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      },
      error: (err) => console.error('Error al obtener los paises:', err)
    });
  }

  buscarPaises(): void {
    if (!this.editando) {
      return;
    }

    const busqueda = this.normalizarTexto(this.paisBusqueda);
    this.pais = '';
    this.codigoPais = '';
    this.prefijoPais = '';

    if (busqueda.length < 2) {
      this.sugerenciasPais = [];
      this.mostrarSugerenciasPais = false;
      return;
    }

    this.sugerenciasPais = this.paises
      .filter((pais) => {
        const name = this.normalizarTexto(pais.name);
        const code = this.normalizarTexto(pais.code);

        return name.includes(busqueda) || code.includes(busqueda);
      })
      .slice(0, 8);
    this.mostrarSugerenciasPais = true;
  }

  seleccionarPais(pais: CountrySuggestion): void {
    this.pais = pais.name;
    this.codigoPais = pais.code;
    this.prefijoPais = pais.phonePrefix;
    this.paisBusqueda = pais.label;
    this.sugerenciasPais = [];
    this.mostrarSugerenciasPais = false;
  }

  ocultarSugerenciasPais(): void {
    window.setTimeout(() => {
      this.mostrarSugerenciasPais = false;
    }, 140);
  }

  logout(): void {
    this.servicioAuth.logout();
    this.router.navigate(['/login']);
  }

  tieneRol(rol: string): boolean {
    return this.rolesUsuario.includes(rol);
  }

  alternarRol(rol: string, checked: boolean): void {
    if (!this.adminMode || rol === 'USUARIO') {
      return;
    }

    if (checked) {
      this.rolesUsuario = Array.from(new Set([...this.rolesUsuario, rol]));
      return;
    }

    this.rolesUsuario = this.rolesUsuario.filter((rolUsuario) => rolUsuario !== rol);
  }

  guardarRoles(): void {
    if (!this.adminMode || !this.profileUserName || this.guardandoRoles) {
      return;
    }

    this.guardandoRoles = true;
    this.mensajeRoles = '';
    this.errorRoles = '';

    const roles = Array.from(new Set(['USUARIO', ...this.rolesUsuario]));

    this.api.updateUserRoles(this.profileUserName, roles, this.servicioAuth.getToken()).subscribe({
      next: (perfil) => {
        this.aplicarPerfil(perfil);
        this.guardandoRoles = false;
        this.mensajeRoles = 'Roles actualizados correctamente.';
      },
      error: () => {
        this.guardandoRoles = false;
        this.errorRoles = 'No se pudieron actualizar los roles.';
      }
    });
  }

  private aplicarPerfil(datos: ProfileResponse): void {
    this.userName = datos.userName || datos.username || datos.usuario || '';
    this.nombre = datos.nombre ?? '';
    this.apellidos = datos.apellidos || '';
    this.email = datos.email || '';
    this.paisId = datos.paisId ?? null;
    this.pais = datos.pais ?? '';
    this.codigoPais = datos.codigoPais ?? '';
    this.prefijoPais = datos.prefijoPais ?? '';
    this.paisBusqueda = this.formatearPais(this.pais, this.codigoPais);
    this.telefono = this.quitarPrefijoTelefono(datos.telefono || '', this.prefijoPais);
    this.fechaRegistro = datos.fechaRegistro || '';
    this.rolesUsuario = datos.roles ?? [];
  }

  private mapProfileToAuthUser(datos: ProfileResponse, usuarioActual: AuthUser): AuthUser {
    return {
      ...usuarioActual,
      userName: datos.userName || datos.username || datos.usuario || usuarioActual.userName,
      nombre: datos.nombre ?? usuarioActual.nombre,
      apellidos: datos.apellidos ?? usuarioActual.apellidos,
      email: datos.email || usuarioActual.email,
      telefono: datos.telefono ?? usuarioActual.telefono,
      paisId: datos.paisId ?? usuarioActual.paisId,
      pais: datos.pais ?? usuarioActual.pais,
      codigoPais: datos.codigoPais ?? usuarioActual.codigoPais,
      prefijoPais: datos.prefijoPais ?? usuarioActual.prefijoPais,
      fechaRegistro: datos.fechaRegistro ?? usuarioActual.fechaRegistro
    };
  }

  private handleProfileError(err: HttpErrorResponse, mensaje: string): void {
    if (err.status === 404) {
      this.perfilNoEncontrado = true;
      this.mensajeErrorPerfil = err.error?.mensaje || 'Usuario no encontrado.';
      this.limpiarPerfil();
      return;
    }

    if (err.status === 401 || err.error?.codigo === 4) {
      this.servicioAuth.logout();
      this.router.navigate(['/login']);
      return;
    }

    console.error(mensaje, err);
    this.mensajeErrorPerfil = 'No se pudo cargar el perfil.';
  }

  private limpiarPerfil(): void {
    this.userName = '';
    this.nombre = '';
    this.apellidos = '';
    this.email = '';
    this.telefono = '';
    this.paisId = null;
    this.pais = '';
    this.codigoPais = '';
    this.prefijoPais = '';
    this.paisBusqueda = '';
    this.fechaRegistro = '';
    this.rolesUsuario = [];
  }

  private formatearFecha(fecha: string): string {
    const fechaParseada = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(fechaParseada.getTime())) {
      return fecha;
    }

    return fechaParseada.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }

  private getTelefonoCompleto(): string {
    const numero = this.telefono.trim();
    const prefijo = this.prefijoPais.trim();

    if (!numero) {
      return '';
    }

    if (!prefijo || numero.startsWith('+')) {
      return numero;
    }

    return `${prefijo} ${numero}`.trim();
  }

  private quitarPrefijoTelefono(telefono: string, prefijo: string): string {
    const valor = telefono.trim();
    const prefijoNormalizado = prefijo.trim();

    if (!valor || !prefijoNormalizado || !valor.startsWith(prefijoNormalizado)) {
      return valor;
    }

    return valor.slice(prefijoNormalizado.length).trim();
  }

  private getNombrePais(pais: RestCountryResponse): string {
    return pais.translations?.spa?.common || pais.name.common || pais.cca2;
  }

  private getPrefijoPais(pais: RestCountryResponse): string {
    const root = pais.idd?.root || '';
    const suffix = pais.idd?.suffixes?.[0] || '';

    return `${root}${suffix}`.trim();
  }

  private formatearPais(nombre: string, codigo: string): string {
    return codigo ? `${nombre} (${codigo})` : nombre;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
