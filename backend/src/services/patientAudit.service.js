import patientAuditLogRepository from '../repositories/patientAuditLog.repository.js';

class PatientAuditService {
  async log({ patientId, action, field, oldValue, newValue, userId, req }) {
    return patientAuditLogRepository.create({
      patientId,
      action,
      field,
      oldValue,
      newValue,
      userId,
      ip: req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null,
      userAgent: req?.headers?.['user-agent']?.slice(0, 300) ?? null,
    });
  }

  async logChanges(patientId, before, after, userId, req) {
    const skip = new Set(['updatedAt', 'createdAt', '__v', '_id', 'id']);
    const entries = [];
    const walk = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach((key) => {
        if (skip.has(key)) return;
        const path = prefix ? `${prefix}.${key}` : key;
        const oldVal = before?.[key];
        const newVal = after?.[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          if (typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
            walk(newVal, path);
          } else {
            entries.push({ field: path, oldValue: oldVal, newValue: newVal });
          }
        }
      });
    };
    walk(after);
    await Promise.all(
      entries.slice(0, 50).map((e) =>
        this.log({
          patientId,
          action: 'update',
          ...e,
          userId,
          req,
        }),
      ),
    );
  }

  async list(patientId, query = {}) {
    const limit = Math.min(Number(query.limit) || 50, 100);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    const items = await patientAuditLogRepository.listByPatient(patientId, { limit, skip });
    return { items };
  }
}

export default new PatientAuditService();
