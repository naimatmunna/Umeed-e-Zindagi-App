import request from 'supertest';
import createApp from '../../src/app.js';
import { seedTestRoles, createTestUser, loginAs } from '../helpers/roles.js';
import { seedCategories, getCategoryIdBySlug } from '../../src/seeders/category.seeder.js';
import { ROLES } from '../../src/constants/roles.js';
import { currentMonthParam } from '../../src/utils/dateRange.js';

const app = createApp();
const base = '/api/v1';

const countPdfPages = (buffer) => {
  const text = buffer.toString('latin1');
  return (text.match(/\/Type\s*\/Page(?!\s*s)/g) || []).length;
};

const fetchPdf = (token, query = {}) =>
  request(app)
    .get(`${base}/expenses/export/pdf`)
    .query({ month: currentMonthParam(), ...query })
    .set('Authorization', `Bearer ${token}`)
    .buffer(true)
    .parse((res, callback) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => callback(null, Buffer.concat(data)));
    });

beforeEach(async () => {
  await seedTestRoles();
  await seedCategories();
});

describe('Expenses API', () => {
  const userSession = async () => {
    const user = await createTestUser({
      firstName: 'Expense',
      lastName: 'Tester',
      email: 'expense-user@example.com',
      roleSlug: ROLES.USER,
    });
    const token = await loginAs(app, { email: user.email });
    return { user, token };
  };

  it('creates an expense for the current user', async () => {
    const { token } = await userSession();
    const categoryId = await getCategoryIdBySlug('food');
    const res = await request(app)
      .post(`${base}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Lunch',
        amount: 1200,
        date: new Date().toISOString(),
        categoryId: categoryId.toString(),
        paymentMethod: 'cash',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.expense.title).toBe('Lunch');
    expect(res.body.data.expense.category.slug).toBe('food');
  });

  it('returns month summary with category breakdown', async () => {
    const { token } = await userSession();
    const categoryId = await getCategoryIdBySlug('transport');
    await request(app)
      .post(`${base}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Taxi',
        amount: 800,
        date: new Date().toISOString(),
        categoryId: categoryId.toString(),
      });

    const month = currentMonthParam();
    const res = await request(app)
      .get(`${base}/expenses/summary`)
      .query({ month })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalAmount).toBeGreaterThanOrEqual(800);
    expect(res.body.data.byCategory.length).toBeGreaterThan(0);
    expect(res.body.data.trend.length).toBeGreaterThan(0);
  });

  it('lists expenses filtered by month', async () => {
    const { token } = await userSession();
    const categoryId = await getCategoryIdBySlug('food');
    await request(app)
      .post(`${base}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Breakfast',
        amount: 500,
        date: new Date().toISOString(),
        categoryId: categoryId.toString(),
      });

    const res = await request(app)
      .get(`${base}/expenses`)
      .query({ month: currentMonthParam() })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('exports expense report as PDF', async () => {
    const { token } = await userSession();
    const categoryId = await getCategoryIdBySlug('food');
    await request(app)
      .post(`${base}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Report item',
        amount: 1500,
        date: new Date().toISOString(),
        categoryId: categoryId.toString(),
      });

    const res = await fetchPdf(token);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
    expect(res.body.length).toBeGreaterThan(500);
    expect(countPdfPages(res.body)).toBeLessThanOrEqual(2);
  });

  it('does not add blank pages when exporting many transactions', async () => {
    const { token } = await userSession();
    const categoryId = await getCategoryIdBySlug('food');
    const month = currentMonthParam();
    const [year, mon] = month.split('-').map(Number);

    await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        request(app)
          .post(`${base}/expenses`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: `Expense item ${i + 1}`,
            amount: 1000 + i * 50,
            date: new Date(Date.UTC(year, mon - 1, (i % 28) + 1, 12, 0, 0)).toISOString(),
            categoryId: categoryId.toString(),
          }),
      ),
    );

    const res = await fetchPdf(token);
    expect(res.status).toBe(200);
    const pages = countPdfPages(res.body);
    expect(pages).toBeGreaterThanOrEqual(2);
    expect(pages).toBeLessThanOrEqual(4);
  });

  it('forbids users from reading another user expense', async () => {
    const owner = await createTestUser({ email: 'owner@example.com', roleSlug: ROLES.USER });
    const other = await createTestUser({ email: 'other@example.com', roleSlug: ROLES.USER });
    const ownerToken = await loginAs(app, { email: owner.email });
    const otherToken = await loginAs(app, { email: other.email });
    const categoryId = await getCategoryIdBySlug('food');

    const created = await request(app)
      .post(`${base}/expenses`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Private meal',
        amount: 900,
        date: new Date().toISOString(),
        categoryId: categoryId.toString(),
      });

    const res = await request(app)
      .get(`${base}/expenses/${created.body.data.expense.id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Categories API', () => {
  it('lists categories for authenticated users', async () => {
    const user = await createTestUser({ email: 'cat-user@example.com', roleSlug: ROLES.USER });
    const token = await loginAs(app, { email: user.email });
    const res = await request(app)
      .get(`${base}/categories`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);
  });
});
