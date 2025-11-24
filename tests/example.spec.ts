import { test, expect } from '@playwright/test';

test('carregar notícias do editor', async ({ page }) => {
  await page.goto('https://equipe-5-vert.vercel.app/');
  await expect(page.getByTestId("noticia").first()).toBeVisible();
});

test('entrar na noticia' , async ({ page }) => {
  await page.goto('https://equipe-5-vert.vercel.app/');
  await page.getByTestId("noticia").first().click();
});

test('criar noticia' , async ({ page }) => {
  await page.goto('https://equipe-5-vert.vercel.app/');
  await page.getByTestId("criar-noticia").click();
});
