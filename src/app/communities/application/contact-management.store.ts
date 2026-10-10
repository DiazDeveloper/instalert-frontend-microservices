import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommunityApi } from '../infrastructure/community-api';
import { TrustedContact, ChatMessage } from '../domain/trusted-contact.entity';

@Injectable({
  providedIn: 'root',
})
export class ContactManagementStore {
  private communityApi = inject(CommunityApi);

  private contactsSubject = new BehaviorSubject<TrustedContact[]>([]);
  contacts$ = this.contactsSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.loadMessagesFromStorage();
  }

  loadContacts(currentUserId: number) {
    this.communityApi.getUsers().subscribe((users) => {
      const filtered = users.filter((u) => u.id !== currentUserId);

      this.communityApi.getCommunities().subscribe({
        next: (communities) => {
          const visibleCommunities = communities.filter(
            (c: any) => !c.isPrivate || c.ownerId === currentUserId,
          );

          const groupChats = visibleCommunities.map(
            (c: any) =>
              ({
                id: c.id,
                name: `🛡️ ${c.name}`,
                role: 'Grupo Vecinal',
                currentLocation: c.isPrivate ? 'Privado' : 'Público',
              }) as TrustedContact,
          );

          this.contactsSubject.next([...filtered, ...groupChats]);
        },
        error: () => {
          this.contactsSubject.next([...filtered]);
        },
      });
    });
  }

  private loadMessagesFromStorage() {
    const stored = localStorage.getItem('instalert_chat_db');
    this.messagesSubject.next(stored ? JSON.parse(stored) : []);
  }

  sendMessage(senderId: number, receiverId: number, content: string) {
    const currentMessages = this.messagesSubject.value;
    const newMsg: ChatMessage = {
      id: currentMessages.length + 1,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentMessages, newMsg];
    this.messagesSubject.next(updatedMessages);

    localStorage.setItem('instalert_chat_db', JSON.stringify(updatedMessages));
  }

  removeCommunityChat(communityId: number) {
    const currentContacts = this.contactsSubject.value;
    const updatedContacts = currentContacts.filter((c) => c.id !== communityId);
    this.contactsSubject.next(updatedContacts);
  }
}
