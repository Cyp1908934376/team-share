import { test, expect } from '@playwright/test'

test.describe('Resource Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[placeholder="用户名或邮箱"]', 'admin@teamshare.com')
    await page.fill('input[placeholder="密码"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 10000 })
  })

  test('should display resource list', async ({ page }) => {
    await page.goto('/resources')
    await expect(page).toHaveURL('/resources')
  })

  test('should navigate to create resource page', async ({ page }) => {
    await page.goto('/resources/new')
    await expect(page.getByPlaceholder(/名称/)).toBeVisible()
  })

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })
})
