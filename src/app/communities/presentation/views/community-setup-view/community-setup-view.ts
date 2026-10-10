import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommunityApi } from '../../../infrastructure/community-api';
import { ContactManagementStore } from '../../../application/contact-management.store';

@Component({
  selector: 'app-community-setup-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './community-setup-view.html',
  styleUrls: ['./community-setup-view.css'],
})
export class CommunitySetupView implements OnInit {
  private communityApi = inject(CommunityApi);
  private contactStore = inject(ContactManagementStore);

  communityName: string = '';
  communityDescription: string = '';
  isPrivate: boolean = true;

  misComunidades: any[] = [];

  ngOnInit() {
    this.cargarComunidadesBD();
  }

  cargarComunidadesBD() {
    this.communityApi.getCommunities().subscribe({
      next: (comunidadesSQL: any[]) => {

        const currentUser = JSON.parse(localStorage.getItem('instalert_user') || '{}');
        const miUsuarioId = currentUser.id || 1;


        const comunidadesVisibles = comunidadesSQL.filter(c => !c.isPrivate || c.ownerId === miUsuarioId);

        this.misComunidades = comunidadesVisibles.map((c: any) => ({
          id: c.id,
          nombre: c.name,
          descripcion: c.description,
          privada: c.isPrivate,
          fechaCreacion: new Date().toISOString()
        }));
      },
      error: (err: any) => {
        console.error('Error al traer comunidades de MySQL:', err);
      }
    });
  }

  createCommunity() {
    if (!this.communityName.trim()) {
      alert('Por favor, ingresa un nombre para tu comunidad segura.');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('instalert_user') || '{}');
    const usuarioId = currentUser.id || 1;

    const nuevaComunidadPayload = {
      name: this.communityName,
      description: this.communityDescription,
      isPrivate: this.isPrivate,
      ownerId: usuarioId
    };

    this.communityApi.createCommunity(nuevaComunidadPayload).subscribe({
      next: (comunidadCreada: any) => {
        console.log('¡Comunidad guardada en SQL exitosamente!', comunidadCreada);


        this.cargarComunidadesBD();

        this.communityName = '';
        this.communityDescription = '';
        this.isPrivate = true;
      },
      error: (err: any) => {
        console.error('Error al guardar en la BD:', err);
        alert('Hubo un error al crear la comunidad en el servidor.');
      }
    });
  }

  invitar(comunidad: any) {
    localStorage.setItem('instalert_invitacion_activa', JSON.stringify(comunidad));
    alert(
      `¡Enlace copiado! \n\nAhora ve a la pestaña "Simular Invitación" para ver cómo le aparecerá la pantalla a tu vecino.`,
    );
  }

  eliminarComunidad(id: number) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta comunidad? Esta acción no se puede deshacer.');

    if (confirmar) {
      this.communityApi.deleteCommunity(id).subscribe({
        next: () => {
          console.log(`Comunidad con ID ${id} eliminada exitosamente.`);
          this.cargarComunidadesBD();
          this.contactStore.removeCommunityChat(id);
        },
        error: (err: any) => {
          console.error('Error al intentar eliminar la comunidad:', err);
          alert('Hubo un error al eliminar la comunidad. Inténtalo nuevamente.');
        }
      });
    }
  }
}
