import request from 'supertest';
import app from '../src/app';
import { generateAccessToken, generateRefreshToken } from '../src/utils/generateToken';

describe('API Integration Tests', () => {

    let adminToken: string;
    let studentToken: string;

    beforeAll(() => {
        // Mock logic to bypass DB calls if DB is offline during raw isolated testing
        // Generate valid JWTs for standard roles to test middleware
        adminToken = generateAccessToken({ user_id: 'user123', email: 'admin@test.com', role: 'admin', role_id: 1 });
        studentToken = generateAccessToken({ user_id: 'user456', email: 'student@test.com', role: 'student', role_id: 3 });
    });

    describe('GET /api/health', () => {
        it('should return 200 OK and status up', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('ok');
        });
    });

    describe('RBAC Middleware', () => {
        it('should block unauthenticated requests to protected routes', async () => {
            const res = await request(app).get('/api/users/profile');
            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/Access token is missing/i);
        });

        it('should allow authenticated users to hit resources route', async () => {
            const res = await request(app)
                .get('/api/resources')
                .set('Authorization', `Bearer ${studentToken}`);
            // If it passes 401 auth, the middleware test is successful.
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });
        
        it('should block students from accessing admin routes', async () => {
            const res = await request(app)
                .post('/api/resources') // Requires Admin/Staff
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ name: 'Test', type: 'computer', status: 'available' });
            
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/Access denied/i);
        });
    });

});
