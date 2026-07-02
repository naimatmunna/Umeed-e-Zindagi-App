import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import patientRepository from '../repositories/patient.repository.js';
import patientPdfRepository from '../repositories/patientPdf.repository.js';
import patientTimelineService from './patientTimeline.service.js';
import { BRAND } from '../constants/branding.js';
import { t } from '../constants/patientPdfLabels.js';
import { TIMELINE_EVENT } from '../constants/patient.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/messages.js';
import { getStorage } from '../storage/index.js';
import { registerPdfFonts, pickBodyFont, pickBoldFont } from '../utils/pdfFonts.js';

const LANG = 'en';
const PAGE_MARGIN = 36;
const FOOTER_H = 34;
const COMPACT_HEADER_Y = 44;
const PHOTO_SIZE = 64;
const QR_SIZE = 64;
const ROW_GAP = 3;
const LABEL_W = 78;
const GUTTER = 10;

const BRAND_GREEN = '#1A6B47';
const BRAND_DARK = '#124D32';
const TEXT_MUTED = '#5A6F62';
const TEXT_BODY = '#1A2B22';
const ACCENT = '#1A6B47';

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value))
    : '—';

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(new Date(value))
    : '—';

const yn = (v) => (v ? t(LANG, 'yes') : t(LANG, 'no'));
const dash = (v) => (v == null || v === '' ? '—' : String(v));
const humanize = (v) => (v == null || v === '' ? null : String(v).replace(/_/g, ' '));
const compactFields = (fields) =>
  fields.filter((f) => f.value != null && String(f.value).trim() !== '');

class PatientReportService {
  contentBottom(doc) {
    return doc.page.height - PAGE_MARGIN - FOOTER_H;
  }

  resolveProfileImagePath(patient) {
    const urls = [];
    if (patient.profilePhoto?.url) urls.push(patient.profilePhoto.url);
    const photoDoc = patient.documents?.find((d) => d.type === 'patient_photo');
    if (photoDoc?.url) urls.push(photoDoc.url);

    for (const url of urls) {
      if (!url?.startsWith('/uploads/')) continue;
      const local = path.resolve(url.replace(/^\//, ''));
      if (fs.existsSync(local)) return local;
    }
    return null;
  }

  patientInitials(patient) {
    const a = patient.firstName?.[0] ?? '';
    const b = patient.lastName?.[0] ?? patient.middleName?.[0] ?? '';
    return `${a}${b}`.toUpperCase() || '?';
  }

  drawProfilePlaceholder(doc, patient, x, y) {
    doc.rect(x, y, PHOTO_SIZE, PHOTO_SIZE).fill('#E9F4EE');
    const cx = x + PHOTO_SIZE / 2;
    doc.fillColor('#9BC4B0');
    doc.circle(cx, y + 18, 10).fill();
    doc.ellipse(cx, y + 38, 16, 9).fill();
    doc.font(pickBoldFont(LANG, 'A'))
      .fontSize(9)
      .fillColor(BRAND_GREEN)
      .text(this.patientInitials(patient), x, y + PHOTO_SIZE - 14, { width: PHOTO_SIZE, align: 'center' });
  }

  drawProfileImage(doc, patient, x, y) {
    const imagePath = this.resolveProfileImagePath(patient);
    doc.save();
    doc.roundedRect(x, y, PHOTO_SIZE, PHOTO_SIZE, 6).clip();
    if (imagePath) {
      try {
        doc.image(imagePath, x, y, { width: PHOTO_SIZE, height: PHOTO_SIZE, fit: [PHOTO_SIZE, PHOTO_SIZE] });
      } catch {
        this.drawProfilePlaceholder(doc, patient, x, y);
      }
    } else {
      this.drawProfilePlaceholder(doc, patient, x, y);
    }
    doc.restore();
    doc.roundedRect(x, y, PHOTO_SIZE, PHOTO_SIZE, 6).lineWidth(0.75).strokeColor('#D4E2DA').stroke();
  }

  drawFooter(doc, pageNum) {
    const w = doc.page.width - PAGE_MARGIN * 2;
    const y1 = doc.page.height - PAGE_MARGIN - 18;
    doc.font(pickBodyFont(LANG, BRAND.name))
      .fontSize(6.5)
      .fillColor(TEXT_MUTED)
      .text(`${BRAND.name} · ${t(LANG, 'footer')} · Page ${pageNum}`, PAGE_MARGIN, y1, {
        width: w,
        align: 'center',
      });
    doc.font(pickBodyFont(LANG, BRAND.softwareCredit))
      .fontSize(6)
      .fillColor(TEXT_MUTED)
      .text(`${t(LANG, 'softwareBy')} ${BRAND.softwareCredit}`, PAGE_MARGIN, y1 + 9, {
        width: w,
        align: 'center',
      });
  }

  drawFullHeader(doc, patient, pageNum) {
    const contentW = doc.page.width - PAGE_MARGIN * 2;
    const blockX = PAGE_MARGIN + 46;
    const blockW = contentW - 46;
    let blockY = PAGE_MARGIN;

    if (fs.existsSync(BRAND.logoPath)) {
      doc.image(BRAND.logoPath, PAGE_MARGIN, PAGE_MARGIN, { fit: [40, 40] });
    }

    doc.font(pickBoldFont(LANG, BRAND.name))
      .fontSize(12)
      .fillColor(BRAND_DARK)
      .text(BRAND.name, blockX, blockY, { width: blockW });
    blockY += doc.heightOfString(BRAND.name, { width: blockW }) + 2;

    doc.font(pickBodyFont(LANG, BRAND.tagline))
      .fontSize(7.5)
      .fillColor(TEXT_MUTED)
      .text(BRAND.tagline, blockX, blockY, { width: blockW });
    blockY += doc.heightOfString(BRAND.tagline, { width: blockW }) + 3;

    doc.font(pickBodyFont(LANG, BRAND.address))
      .fontSize(7)
      .fillColor(TEXT_BODY)
      .text(BRAND.address, blockX, blockY, { width: blockW });
    blockY += doc.heightOfString(BRAND.address, { width: blockW }) + 2;

    const contactLine = `Tel: ${BRAND.phone}  ·  Email: ${BRAND.email}`;
    doc.font(pickBodyFont(LANG, contactLine))
      .fontSize(7)
      .fillColor(TEXT_BODY)
      .text(contactLine, blockX, blockY, { width: blockW });
    blockY += doc.heightOfString(contactLine, { width: blockW }) + 12;

    let y = Math.max(blockY, PAGE_MARGIN + 46);

    doc.font(pickBoldFont(LANG, t(LANG, 'title')))
      .fontSize(11)
      .fillColor(ACCENT)
      .text(t(LANG, 'title'), PAGE_MARGIN, y, { width: contentW });
    y += doc.heightOfString(t(LANG, 'title'), { width: contentW }) + 12;

    const meta = [
      [t(LANG, 'patientId'), patient.patientId],
      [t(LANG, 'registrationNo'), patient.registrationNumber],
      [t(LANG, 'admissionNo'), patient.admissionNumber],
      [t(LANG, 'admissionDate'), formatDate(patient.admissionDate)],
      [t(LANG, 'status'), humanize(patient.status)],
      [t(LANG, 'generatedAt'), formatDateTime(new Date())],
    ];

    const halfW = contentW / 2 - 4;
    meta.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = PAGE_MARGIN + col * (halfW + 8);
      const rowY = y + row * 12;
      doc.font(pickBodyFont(LANG, label)).fontSize(6.5).fillColor(TEXT_MUTED)
        .text(`${label}: `, x, rowY, { continued: true, width: halfW });
      doc.font(pickBodyFont(LANG, value)).fillColor(TEXT_BODY).text(dash(value), { width: halfW });
    });
    y += Math.ceil(meta.length / 2) * 12 + 12;

    doc.moveTo(PAGE_MARGIN, y)
      .lineTo(doc.page.width - PAGE_MARGIN, y)
      .strokeColor('#D4E2DA')
      .lineWidth(0.75)
      .stroke();

    this.drawFooter(doc, pageNum);
    return y + 14;
  }

  drawCompactHeader(doc, patient, pageNum) {
    const barW = doc.page.width - PAGE_MARGIN * 2;
    doc.rect(PAGE_MARGIN, PAGE_MARGIN, barW, 22).fill('#F0F7F3');
    doc.font(pickBoldFont(LANG, patient.fullName))
      .fontSize(8)
      .fillColor(BRAND_DARK)
      .text(patient.fullName ?? '—', PAGE_MARGIN + 8, PAGE_MARGIN + 6, { width: barW * 0.52 });
    doc.font(pickBodyFont(LANG, patient.patientId))
      .fontSize(7)
      .fillColor(TEXT_MUTED)
      .text(`${patient.patientId} · Page ${pageNum}`, PAGE_MARGIN + 8, PAGE_MARGIN + 7, {
        width: barW - 16,
        align: 'right',
      });
    doc.moveTo(PAGE_MARGIN, COMPACT_HEADER_Y - 6)
      .lineTo(doc.page.width - PAGE_MARGIN, COMPACT_HEADER_Y - 6)
      .strokeColor('#D4E2DA')
      .lineWidth(0.75)
      .stroke();
    this.drawFooter(doc, pageNum);
  }

  sectionTitle(doc, y, key) {
    doc.font(pickBoldFont(LANG, t(LANG, key)))
      .fontSize(9)
      .fillColor(ACCENT)
      .text(t(LANG, key), PAGE_MARGIN, y, { width: doc.page.width - PAGE_MARGIN * 2 });
    const h = doc.heightOfString(t(LANG, key), { width: doc.page.width - PAGE_MARGIN * 2 });
    const lineY = y + h + 2;
    doc.moveTo(PAGE_MARGIN, lineY)
      .lineTo(doc.page.width - PAGE_MARGIN, lineY)
      .strokeColor('#D4E2DA')
      .lineWidth(0.5)
      .stroke();
    return lineY + 12;
  }

  drawPatientIdentityBlock(doc, patient, qrDataUrl, startY) {
    const contentW = doc.page.width - PAGE_MARGIN * 2;
    const gap = 24;
    const totalW = QR_SIZE + gap + PHOTO_SIZE;
    const baseX = PAGE_MARGIN + (contentW - totalW) / 2;
    let y = startY;

    doc.moveTo(PAGE_MARGIN, y)
      .lineTo(doc.page.width - PAGE_MARGIN, y)
      .strokeColor('#D4E2DA')
      .lineWidth(0.5)
      .stroke();
    y += 10;

    doc.font(pickBoldFont(LANG, t(LANG, 'patientIdentification')))
      .fontSize(9)
      .fillColor(ACCENT)
      .text(t(LANG, 'patientIdentification'), PAGE_MARGIN, y, { width: contentW, align: 'center' });
    y += 16;

    if (qrDataUrl) {
      doc.image(qrDataUrl, baseX, y, { width: QR_SIZE, height: QR_SIZE });
      doc.font(pickBodyFont(LANG, t(LANG, 'qrLabel')))
        .fontSize(6.5)
        .fillColor(TEXT_MUTED)
        .text(t(LANG, 'qrLabel'), baseX - 4, y + QR_SIZE + 3, { width: QR_SIZE + 8, align: 'center' });
    }

    this.drawProfileImage(doc, patient, baseX + QR_SIZE + gap, y);

    const caption = this.resolveProfileImagePath(patient) ? 'Patient photo' : t(LANG, 'noPhoto');
    doc.font(pickBodyFont(LANG, caption))
      .fontSize(6.5)
      .fillColor(TEXT_MUTED)
      .text(caption, baseX + QR_SIZE + gap - 4, y + PHOTO_SIZE + 3, {
        width: PHOTO_SIZE + 8,
        align: 'center',
      });

    return y + PHOTO_SIZE + 18;
  }

  drawFieldCell(doc, x, y, colW, label, value) {
    const valueW = colW - LABEL_W - 2;
    const labelText = `${label}: `;
    doc.font(pickBodyFont(LANG, label)).fontSize(6.5).fillColor(TEXT_MUTED)
      .text(labelText, x, y, { width: LABEL_W, lineBreak: false });
    doc.font(pickBodyFont(LANG, value))
      .fontSize(7)
      .fillColor(TEXT_BODY)
      .text(dash(value), x + LABEL_W, y, { width: valueW, lineGap: 0 });
    const labelH = doc.heightOfString(labelText, { width: LABEL_W });
    const valueH = doc.heightOfString(dash(value), { width: valueW, lineGap: 0 });
    return Math.max(labelH, valueH, 9);
  }

  ensureSpace(doc, y, needed, patient, pageNum, qrDataUrl) {
    if (y + needed <= this.contentBottom(doc)) return { y, pageNum };
    doc.addPage();
    const nextPage = pageNum + 1;
    this.drawCompactHeader(doc, patient, nextPage);
    return { y: COMPACT_HEADER_Y, pageNum: nextPage };
  }

  fieldGrid(ctx, fields) {
    let { doc, y, patient, pageNum, qrDataUrl } = ctx;
    const tableW = doc.page.width - PAGE_MARGIN * 2;
    const colW = (tableW - GUTTER) / 2;

    const estimateRowH = (field) => {
      if (!field) return 0;
      const val = dash(field.value);
      const lines = Math.max(1, Math.ceil(val.length / 38));
      return Math.max(10, lines * 8);
    };

    for (let i = 0; i < fields.length; i += 2) {
      const left = fields[i];
      const right = fields[i + 1];
      const rowH = Math.max(estimateRowH(left), estimateRowH(right), 10) + ROW_GAP;

      ({ y, pageNum } = this.ensureSpace(doc, y, rowH, patient, pageNum, qrDataUrl));

      const leftH = left ? this.drawFieldCell(doc, PAGE_MARGIN, y, colW, t(LANG, left.key), left.value) : 0;
      const rightH = right
        ? this.drawFieldCell(doc, PAGE_MARGIN + colW + GUTTER, y, colW, t(LANG, right.key), right.value)
        : 0;
      y += Math.max(leftH, rightH, 10) + ROW_GAP;
    }

    return { ...ctx, y, pageNum };
  }

  async generateQrDataUrl(patientId) {
    return QRCode.toDataURL(`patient://${patientId}`, { margin: 1, width: 120, errorCorrectionLevel: 'M' });
  }

  buildFieldSections(patient) {
    const mh = patient.mentalHealth ?? {};
    const mentalFlags = [
      mh.depression && t(LANG, 'depression'),
      mh.anxiety && t(LANG, 'anxiety'),
      mh.aggression && t(LANG, 'aggression'),
      mh.suicidalHistory && t(LANG, 'suicidalHistory'),
      mh.hallucinations && t(LANG, 'hallucinations'),
      mh.selfHarmHistory && t(LANG, 'selfHarm'),
    ].filter(Boolean);

    return {
      basic: [
        { key: 'fullName', value: patient.fullName },
        { key: 'gender', value: humanize(patient.gender) },
        { key: 'dob', value: formatDate(patient.dateOfBirth) },
        { key: 'age', value: patient.age },
        { key: 'maritalStatus', value: humanize(patient.maritalStatus) },
        { key: 'nationality', value: patient.nationality },
        { key: 'religion', value: patient.religion },
        { key: 'cnic', value: patient.cnic },
        { key: 'passport', value: patient.passportNumber },
        { key: 'phone', value: patient.phone },
        { key: 'alternatePhone', value: patient.alternatePhone },
        { key: 'email', value: patient.email },
        { key: 'education', value: patient.education },
        { key: 'occupation', value: patient.occupation },
        { key: 'monthlyIncome', value: patient.monthlyIncome != null ? `PKR ${patient.monthlyIncome}` : null },
        { key: 'city', value: patient.city },
        { key: 'province', value: patient.province },
        { key: 'country', value: patient.country },
        { key: 'postalCode', value: patient.postalCode },
        { key: 'address', value: patient.currentAddress || patient.address },
        { key: 'permanentAddress', value: patient.permanentAddress },
      ],
      guardian: [
        { key: 'guardianName', value: patient.guardian?.guardianName },
        { key: 'relationship', value: patient.guardian?.relationship },
        { key: 'guardianPhone', value: patient.guardian?.phone },
        { key: 'cnic', value: patient.guardian?.cnic },
        { key: 'guardianEmail', value: patient.guardian?.email },
        { key: 'guardianAddress', value: patient.guardian?.address },
      ],
      admission: [
        { key: 'admissionType', value: humanize(patient.admission?.admissionType) },
        { key: 'referredBy', value: patient.admission?.referredBy },
        { key: 'hospitalName', value: patient.admission?.hospitalName },
        { key: 'doctor', value: patient.admission?.doctorName },
        { key: 'reason', value: patient.admission?.reasonForAdmission },
        { key: 'complaint', value: patient.admission?.chiefComplaint },
        { key: 'symptoms', value: patient.admission?.presentingSymptoms },
        { key: 'admissionNotes', value: patient.admission?.admissionNotes },
      ],
      medical: [
        { key: 'bloodGroup', value: patient.medical?.bloodGroup },
        { key: 'height', value: patient.medical?.height != null ? `${patient.medical.height} cm` : null },
        { key: 'weight', value: patient.medical?.weight != null ? `${patient.medical.weight} kg` : null },
        { key: 'bmi', value: patient.medical?.bmi },
        { key: 'allergies', value: patient.medical?.allergies },
        {
          key: 'conditions',
          value: (patient.medical?.existingDiseases ?? []).map((d) => d.replace(/_/g, ' ')).join(', ') || null,
        },
        { key: 'medications', value: patient.medical?.currentMedications },
        { key: 'surgeries', value: patient.medical?.surgeries },
        { key: 'hospitalizations', value: patient.medical?.previousHospitalizations },
        { key: 'disability', value: patient.medical?.disability },
        { key: 'infectiousDisease', value: patient.medical?.infectiousDisease },
        { key: 'medicalNotes', value: patient.medical?.medicalNotes },
      ],
      mental: [
        { key: 'mental', value: mentalFlags.length ? mentalFlags.join(', ') : 'None reported' },
        { key: 'psychiatricTreatment', value: mh.psychiatricTreatment },
        { key: 'psychiatricNotes', value: mh.psychiatricNotes },
      ],
      social: [
        { key: 'employmentStatus', value: patient.social?.employmentStatus },
        { key: 'educationLevel', value: patient.social?.educationLevel },
        { key: 'familySupport', value: patient.social?.familySupport },
        { key: 'livingSituation', value: patient.social?.livingSituation },
        { key: 'financialCondition', value: patient.social?.financialCondition },
        { key: 'criminalHistory', value: patient.social?.criminalHistory },
        { key: 'legalCases', value: patient.social?.legalCases },
        { key: 'socialNotes', value: patient.social?.socialNotes },
      ],
      discharge: [
        { key: 'dischargeDate', value: formatDate(patient.discharge?.dischargeDate) },
        { key: 'dischargeReason', value: patient.discharge?.dischargeReason },
        { key: 'followUpDate', value: formatDate(patient.discharge?.followUpDate) },
        { key: 'followUpInstructions', value: patient.discharge?.followUpInstructions },
        { key: 'doctorRemarks', value: patient.discharge?.doctorRemarks },
      ],
    };
  }

  async buildPdfBuffer(patient) {
    return new Promise(async (resolve, reject) => {
      try {
        const chunks = [];
        const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN, autoFirstPage: true });
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        registerPdfFonts(doc);

        const qrDataUrl = await this.generateQrDataUrl(patient.patientId);
        let pageNum = 1;
        let y = this.drawFullHeader(doc, patient, pageNum);

        let ctx = { doc, y, patient, pageNum, qrDataUrl };
        const sections = this.buildFieldSections(patient);

        const renderSection = (titleKey, fields) => {
          const rows = compactFields(fields);
          if (!rows.length) return;
          ({ y, pageNum } = this.ensureSpace(ctx.doc, ctx.y, 32, patient, ctx.pageNum, qrDataUrl));
          ctx = { ...ctx, y, pageNum };
          ctx.y = this.sectionTitle(ctx.doc, ctx.y, titleKey);
          ctx = this.fieldGrid(ctx, rows);
        };

        renderSection('basicInfo', sections.basic);
        renderSection('guardian', sections.guardian);

        if (patient.emergencyContacts?.length) {
          ({ y, pageNum } = this.ensureSpace(ctx.doc, ctx.y, 32, patient, ctx.pageNum, qrDataUrl));
          ctx = { ...ctx, y, pageNum };
          ctx.y = this.sectionTitle(ctx.doc, ctx.y, 'emergency');
          const contacts = patient.emergencyContacts.map((c) => ({
            key: 'contactName',
            value: `${c.name ?? '—'} (${humanize(c.relationship)}) · ${c.phone ?? '—'}${c.priority ? ` · ${c.priority}` : ''}`,
          }));
          ctx = this.fieldGrid(ctx, contacts);
        }

        renderSection('admission', sections.admission);
        renderSection('medical', sections.medical);
        renderSection('mental', sections.mental);
        renderSection('social', sections.social);

        if (patient.addictions?.length) {
          ({ y, pageNum } = this.ensureSpace(ctx.doc, ctx.y, 32, patient, ctx.pageNum, qrDataUrl));
          ctx = { ...ctx, y, pageNum };
          ctx.y = this.sectionTitle(ctx.doc, ctx.y, 'substance');
          const items = patient.addictions.map((a) => ({
            key: 'substanceItem',
            value: `${humanize(a.substanceType)} · ${humanize(a.frequency)} · ${humanize(a.route)}${a.duration ? ` · ${a.duration}` : ''}`,
          }));
          ctx = this.fieldGrid(ctx, items);
        }

        if (patient.discharge?.dischargeDate || patient.discharge?.dischargeReason) {
          renderSection('discharge', sections.discharge);
        }

        const c = patient.consent ?? {};
        ({ y, pageNum } = this.ensureSpace(ctx.doc, ctx.y, 50, patient, ctx.pageNum, qrDataUrl));
        ctx = { ...ctx, y, pageNum };
        ctx.y = this.sectionTitle(ctx.doc, ctx.y, 'consent');
        ctx = this.fieldGrid(ctx, [
          { key: 'patientConsent', value: yn(c.patientConsent) },
          { key: 'guardianConsent', value: yn(c.guardianConsent) },
          { key: 'treatmentAgreement', value: yn(c.treatmentAgreement) },
          { key: 'hospitalRules', value: yn(c.hospitalRulesAgreement) },
          { key: 'privacyAgreement', value: yn(c.privacyAgreement) },
          { key: 'emergencyTreatment', value: yn(c.emergencyTreatmentPermission) },
          { key: 'dataProcessing', value: yn(c.dataProcessingConsent) },
          { key: 'date', value: formatDate(c.signedDate) },
        ]);

        ({ y, pageNum } = this.ensureSpace(ctx.doc, ctx.y, 56, patient, ctx.pageNum, qrDataUrl));
        ctx = { ...ctx, y, pageNum };
        ctx.y = this.sectionTitle(ctx.doc, ctx.y, 'signatures');
        const sigY = ctx.y + 4;
        const colW = (doc.page.width - PAGE_MARGIN * 2) / 3;
        [t(LANG, 'patientSig'), t(LANG, 'guardianSig'), t(LANG, 'officerSig')].forEach((lbl, i) => {
          const x = PAGE_MARGIN + i * colW;
          doc.moveTo(x, sigY + 28).lineTo(x + colW - 12, sigY + 28).strokeColor('#C6C6C8').stroke();
          doc.font(pickBodyFont(LANG, lbl))
            .fontSize(7)
            .fillColor(TEXT_MUTED)
            .text(lbl, x, sigY + 31, { width: colW - 12, align: 'center' });
        });
        ctx.y = sigY + 48;

        ({ y, pageNum } = this.ensureSpace(ctx.doc, ctx.y, 120, patient, ctx.pageNum, qrDataUrl));
        ctx = { ...ctx, y, pageNum };
        this.drawPatientIdentityBlock(ctx.doc, patient, qrDataUrl, ctx.y);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async streamPdf(patientId, _lang, reqUser, res) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) throw ApiError.notFound(MESSAGES.PATIENT.NOT_FOUND, { code: 'PATIENT_NOT_FOUND' });

    const buffer = await this.buildPdfBuffer(patient);
    const fileName = `admission-${patient.patientId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);

    const version = await patientPdfRepository.nextVersion(patientId, LANG);
    try {
      const storage = getStorage();
      const { url, publicId } = await storage.upload(buffer, { filename: fileName });
      await patientPdfRepository.create({
        patientId,
        language: LANG,
        version,
        url,
        publicId,
        fileName,
        fileSize: buffer.length,
        generatedBy: reqUser.id,
      });
    } catch {
      /* storage optional */
    }

    await patientTimelineService.record(patientId, TIMELINE_EVENT.PDF_GENERATED, {
      userId: reqUser.id,
      metadata: { language: LANG, version },
    });
  }

  async listPdfHistory(patientId) {
    return patientPdfRepository.listByPatient(patientId);
  }
}

export default new PatientReportService();
