import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('团队资源共享平台')).toBeVisible()
    await expect(page.getByPlaceholder('用户名或邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('密码')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="用户名或邮箱"]', 'wrong@test.com')
    await page.fill('input[placeholder="密码"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/错误/)).toBeVisible({ timeout: 5000 })
  })

  test('should login with demo admin account', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="用户名或邮箱"]', 'admin@teamshare.com')
    await page.fill('input[placeholder="密码"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page.getByText(/早上好|下午好|晚上好|夜深了/)).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/resources')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=注册')
    await expect(page).toHaveURL('/register')
    await expect(page.getByPlaceholder('用户名')).toBeVisible()
  })
})
