import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactManagementStore } from '../../../application/contact-management.store';
import { TrustedContact, ChatMessage } from '../../../domain/trusted-contact.entity';
import { Observable } from 'rxjs';

import { CommunityAlertsView } from '../community-alerts-view/community-alerts-view';
import { CommunitySetupView } from '../community-setup-view/community-setup-view';

import { InvitationResponseView } from '../invitation-response-view/invitation-response-view';
import { GpsTrackingView } from '../gps-tracking-view/gps-tracking-view';
import { MonitoringStore } from '../../../application/monitoring.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-monitoring-panel-view',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    CommunityAlertsView,
    CommunitySetupView,
    InvitationResponseView,
    GpsTrackingView,
    TranslateModule,
  ],
  templateUrl: './monitoring-panel-view.html',
  styleUrls: ['./monitoring-panel-view.css'],
})
export class MonitoringPanelView implements OnInit {
  private store = inject(ContactManagementStore);
  private monitoringStore = inject(MonitoringStore);

  currentUser: any = null;
  contacts$: Observable<TrustedContact[]> = this.store.contacts$;
  selectedContact: TrustedContact | null = null;
  activeConversation: ChatMessage[] = [];
  newMessageText: string = '';

  contactList: any[] = [];

  vistaActual: 'chat' | 'alertas' | 'configurar' | 'invitacion' | 'gps' = 'chat';

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('instalert_user') || '{}');

    if (this.currentUser && this.currentUser.id) {
      this.store.loadContacts(this.currentUser.id);

      this.contacts$.subscribe((contactos) => (this.contactList = contactos));

      this.store.messages$.subscribe((allMessages) => {
        this.filterActiveConversation(allMessages);
      });
    }
  }

  selectContact(contact: TrustedContact) {
    this.selectedContact = contact;
    this.store.messages$
      .subscribe((allMessages) => {
        this.filterActiveConversation(allMessages);
      })
      .unsubscribe();
  }

  private filterActiveConversation(allMessages: ChatMessage[]) {
    if (!this.selectedContact || !this.currentUser) return;

    if (this.selectedContact.role === 'Grupo Vecinal') {
      this.activeConversation = allMessages.filter(
        (msg) => msg.receiverId === this.selectedContact!.id,
      );
    } else {
      this.activeConversation = allMessages.filter(
        (msg) =>
          (msg.senderId === this.currentUser.id && msg.receiverId === this.selectedContact!.id) ||
          (msg.senderId === this.selectedContact!.id && msg.receiverId === this.currentUser.id),
      );
    }
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedContact || !this.currentUser) return;

    this.store.sendMessage(
      this.currentUser.id,
      this.selectedContact.id,
      this.newMessageText.trim(),
    );

    this.newMessageText = '';
  }

  compartirUbicacion() {
    if (!this.selectedContact || !this.currentUser) return;

    const sesionGPS = this.monitoringStore.activeSession();

    const lat = sesionGPS ? sesionGPS.currentLocation.lat : -12.0464;
    const lng = sesionGPS ? sesionGPS.currentLocation.lng : -77.0428;

    const mensajeLink = `📍 Mi ubicación en vivo: https://maps.google.com/?q=${lat},${lng}`;

    this.store.sendMessage(this.currentUser.id, this.selectedContact.id, mensajeLink);
  }

  getSenderName(senderId: number): string {
    if (senderId === this.currentUser?.id) return 'Tú';

    const contact = this.contactList.find((c) => c.id === senderId);
    return contact ? contact.name.split(' ')[0] : `Vecino`;
  }
}
