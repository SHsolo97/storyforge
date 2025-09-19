import { test, expect } from '@playwright/test';

// Basic smoke test: load web app and navigate to chapter player test route,
// then progress through initial dialogues to ensure auto transition past the problematic goto.

test('chapter player progresses past initial goto', async ({ page }) => {
  await page.goto('/');

  // Assuming there is a route to /chapter-player-test or via navigation; try direct first
  await page.goto('/chapter-player-test');

  // Wait for first dialogue text
  await expect(page.getByText('What do you want to do?')).toBeVisible({ timeout: 15000 });

  // Advance through dialogues until Patty line that previously stalled
  const advance = async () => {
    await page.mouse.click(400, 500); // Click approximate dialogue area
  };

  const lines = [
    'What do you want to do?',
    'I don’t know, Patty. What do you want to do?',
    'Not fair, Brad. I asked you first.',
    'Patty and Brad. Your two best friends. Arguing. As usual. It’s the last week of August, and they haven’t stopped fighting since summer vacation started.',
    'Patty likes being bossy. You don’t mind, though. It\'s hard to win a fight with her anyway.',
    'There’s nothing to do. I guess I’ll just go home.',
    'He shoves his hands in his pockets. His shoulders slump. You guess Brad is kind of a wimp — even if he is your best friend.',
    'You’re so boring, Brad.',
    'Whenever Patty complains, her freckles really pop out. Now there are about a million of them spread across her face.',
    'Hey! I know what we should do!' // Last line before goto
  ];

  for (const line of lines) {
    await expect(page.getByText(line, { exact: false })).toBeVisible();
    await advance();
  }

  // After advancing past last line, ensure next node text appears (page_2 dialogue)
  await expect(page.getByText('Let’s bike over to Bennet’s Field and watch them set up the carnival!', { exact: false })).toBeVisible({ timeout: 10000 });
});
