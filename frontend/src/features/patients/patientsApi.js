import { apiSlice } from '@/api/apiSlice.js';

export const patientsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: (params = {}) => ({ url: '/patients', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((p) => ({ type: 'Patient', id: p.id })), { type: 'Patient', id: 'LIST' }]
          : [{ type: 'Patient', id: 'LIST' }],
    }),
    getPatientSummary: builder.query({
      query: () => '/patients/summary',
      providesTags: [{ type: 'Patient', id: 'SUMMARY' }],
    }),
    getPatient: builder.query({
      query: (id) => `/patients/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Patient', id }],
    }),
    checkPatientDuplicates: builder.query({
      query: (params) => ({ url: '/patients/check-duplicates', params }),
    }),
    createPatient: builder.mutation({
      query: (body) => ({ url: '/patients', method: 'POST', body }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }, { type: 'Patient', id: 'SUMMARY' }],
    }),
    updatePatient: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/patients/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
        { type: 'Patient', id: 'SUMMARY' },
        { type: 'PatientTimeline', id },
      ],
    }),
    submitPatient: builder.mutation({
      query: (id) => ({ url: `/patients/${id}/submit`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
        { type: 'Patient', id: 'SUMMARY' },
        { type: 'PatientTimeline', id },
      ],
    }),
    deletePatient: builder.mutation({
      query: (id) => ({ url: `/patients/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }, { type: 'Patient', id: 'SUMMARY' }],
    }),
    getPatientTimeline: builder.query({
      query: ({ id, ...params }) => ({ url: `/patients/${id}/timeline`, params }),
      providesTags: (_r, _e, { id }) => [{ type: 'PatientTimeline', id }],
    }),
    getPatientAudit: builder.query({
      query: (id) => `/patients/${id}/audit`,
    }),
    getPatientPdfHistory: builder.query({
      query: (id) => `/patients/${id}/pdf-history`,
      providesTags: (_r, _e, id) => [{ type: 'PatientPdf', id }],
    }),
    uploadPatientDocument: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/patients/${id}/documents`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Patient', id }],
    }),
    deletePatientDocument: builder.mutation({
      query: ({ id, documentId }) => ({
        url: `/patients/${id}/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Patient', id }],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientSummaryQuery,
  useGetPatientQuery,
  useCheckPatientDuplicatesQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useSubmitPatientMutation,
  useDeletePatientMutation,
  useGetPatientTimelineQuery,
  useGetPatientAuditQuery,
  useGetPatientPdfHistoryQuery,
  useUploadPatientDocumentMutation,
  useDeletePatientDocumentMutation,
} = patientsApi;
