import { AlertHistory } from '../../domain/entities/emergency-alert.entity';
import { EmergencyRequestDto } from '../../application/dto/emergency-request.dto';

export class EmergencyMapper {
  static toEntity(dto: EmergencyRequestDto): AlertHistory {
    return {
      id: dto.id || Date.now(),
      userId: dto.userId,
      type: dto.type,
      location: dto.location,
      time: dto.time,
      status: dto.status,
      statusClass: dto.statusClass,
      createdAt: dto.createdAt,
    };
  }

  static toDto(entity: Partial<AlertHistory>): EmergencyRequestDto {
    if (!entity.userId || entity.userId <= 0) throw new Error('Authenticated account reference is required');
    return {
      userId: entity.userId,
      type: entity.type || '',
      location: entity.location || '',
      time: entity.time || '',
      status: entity.status || '',
      statusClass: entity.statusClass || '',
      createdAt: entity.createdAt || new Date().toISOString(),
    };
  }
}
