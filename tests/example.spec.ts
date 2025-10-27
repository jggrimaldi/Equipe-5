import { test, expect } from '@playwright/test';

test('carregar notícias do editor', async ({ page }) => {
  await page.goto('https://equipe-5-vert.vercel.app/');
  await expect(page.getByTestId("noticia")).toBeVisible()
});

test('entrar na noticia' , async ({ page }) => {
  await page.goto('https://equipe-5-vert.vercel.app/');
  await page.getByTestId("noticia").click()
  await expect(page.getByText("Detalhes da Notícia")).toBeVisible()
});

test('criar noticia' , async ({ page }) => {
  await page.goto('https://equipe-5-vert.vercel.app/');
  await page.getByTestId("criar-noticia").click()
});
