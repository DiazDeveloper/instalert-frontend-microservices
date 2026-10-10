import { TrackingSession } from '../domain/tracking-session.entity';

export class CommunityAssembler {
  static toTrackingSession(rawData: any): TrackingSession {
    return {
      sessionId: rawData.id_session || Date.now().toString(),
      citizenId: rawData.user_id,
      citizenName: rawData.full_name || 'Ciudadano',
      currentLocation: {
        lat: parseFloat(rawData.lat) || 0,
        lng: parseFloat(rawData.long) || 0,
      },
      status: rawData.state === 'ok' ? 'Active' : 'Danger',
      lastUpdate: new Date().toISOString(),
    };
  }
}
