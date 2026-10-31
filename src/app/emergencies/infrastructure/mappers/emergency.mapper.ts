import { AlertHistory } from '../../domain/entities/emergency-alert.entity';
import { EmergencyRequestDto } from '../../application/dto/emergency-request.dto';
export class EmergencyMapper {
  static toEntity(dto: EmergencyRequestDto): AlertHistory {
    return {
      ...dto,
      location: `Lat: ${dto.latitude.toFixed(4)} | Lon: ${dto.longitude.toFixed(4)}`,
      time: new Date(dto.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: dto.status === 'ACTIVE' ? 'Activa' : 'Cancelada',
      statusClass: dto.status === 'ACTIVE' ? 'badge-active' : 'badge-canceled',
    };
  }
  static toDto(e: Partial<AlertHistory>) {
    if (!Number.isFinite(e.latitude) || !Number.isFinite(e.longitude) || !e.locationRecordedAt)
      throw new Error('Se necesita una ubicación válida y reciente.');
    return {
      type: e.type || 'PANIC',
      latitude: e.latitude,
      longitude: e.longitude,
      accuracyM: e.accuracyM,
      locationRecordedAt: e.locationRecordedAt,
    };
  }
}
