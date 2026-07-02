import { apiSlice } from '@/api/apiSlice.js';

export const expensesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params = {}) => ({ url: '/expenses', params }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((e) => ({ type: 'Expense', id: e.id })), { type: 'Expense', id: 'LIST' }]
          : [{ type: 'Expense', id: 'LIST' }],
    }),
    getExpenseSummary: builder.query({
      query: (params = {}) => ({ url: '/expenses/summary', params }),
      providesTags: () => [{ type: 'Expense', id: 'ExpenseSummary' }],
    }),
    getExpense: builder.query({
      query: (id) => `/expenses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Expense', id }],
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Expense', id: 'ExpenseSummary' }],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/expenses/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
        { type: 'Expense', id: 'ExpenseSummary' },
      ],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Expense', id: 'ExpenseSummary' }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
