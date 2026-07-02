import { apiSlice } from '@/api/apiSlice.js';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodayAttendance: builder.query({
      query: () => '/attendance/today',
      providesTags: [{ type: 'Attendance', id: 'TODAY' }],
    }),
    checkIn: builder.mutation({
      query: (body = {}) => ({ url: '/attendance/check-in', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Attendance', id: 'TODAY' },
        { type: 'Attendance', id: 'LIST' },
        { type: 'Attendance', id: 'SUMMARY' },
        { type: 'Attendance', id: 'MATRIX' },
      ],
    }),
    checkOut: builder.mutation({
      query: (body = {}) => ({ url: '/attendance/check-out', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Attendance', id: 'TODAY' },
        { type: 'Attendance', id: 'LIST' },
        { type: 'Attendance', id: 'SUMMARY' },
        { type: 'Attendance', id: 'MATRIX' },
      ],
    }),
    getAttendance: builder.query({
      query: (params = {}) => ({ url: '/attendance', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((a) => ({ type: 'Attendance', id: a.id })), { type: 'Attendance', id: 'LIST' }]
          : [{ type: 'Attendance', id: 'LIST' }],
    }),
    getAttendanceSummary: builder.query({
      query: (params = {}) => ({ url: '/attendance/summary', params }),
      providesTags: [{ type: 'Attendance', id: 'SUMMARY' }],
    }),
    getAttendanceMatrix: builder.query({
      query: (params = {}) => ({ url: '/attendance/matrix', params }),
      providesTags: [{ type: 'Attendance', id: 'MATRIX' }],
    }),
    createAttendance: builder.mutation({
      query: (body) => ({ url: '/attendance', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Attendance', id: 'LIST' },
        { type: 'Attendance', id: 'SUMMARY' },
        { type: 'Attendance', id: 'MATRIX' },
      ],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/attendance/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Attendance', id },
        { type: 'Attendance', id: 'LIST' },
        { type: 'Attendance', id: 'SUMMARY' },
        { type: 'Attendance', id: 'MATRIX' },
      ],
    }),
    deleteAttendance: builder.mutation({
      query: (id) => ({ url: `/attendance/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Attendance', id: 'LIST' },
        { type: 'Attendance', id: 'SUMMARY' },
        { type: 'Attendance', id: 'MATRIX' },
      ],
    }),
  }),
});

export const {
  useGetTodayAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceMatrixQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
