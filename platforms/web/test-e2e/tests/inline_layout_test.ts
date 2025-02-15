import { testConfigs } from '@jwp/ott-testing/constants';

import constants, { normalTimeout, ShelfId } from '#utils/constants';

const videoListLocator = locate({ css: 'div[data-testid="video-list"]' });

Feature('inline layout').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.inlinePlayer);
});

Scenario('I can see the movie inline player layout', async ({ I }) => {
  await I.openVideoCard(constants.bigBuckBunnyTitle, ShelfId.allFilms);
  I.seeElement(`[data-testid="inline-layout"]`);
  I.dontSeeElement(`[data-testid="cinema-layout"]`);
  I.seeElement('video');
  I.see(constants.bigBuckBunnyTitle);
  I.see('2008');
  I.see('10m');
  I.see('Comedy');
  I.see('CC-BY');
  I.see(constants.bigBuckBunnyDescription);
  I.see('Trailer');
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Related Films', 'h2');
  I.see('Caminandes 1: Llama Drama', locate({ css: 'a[aria-label="Caminandes 1: Llama Drama"]' }).inside(videoListLocator));
  I.see('Caminandes 2: Gran Dillama', locate({ css: 'a[aria-label="Caminandes 2: Gran Dillama"]' }).inside(videoListLocator));
});

Scenario('I switch to another video in the movie screen', async ({ I }) => {
  await I.openVideoCard(constants.bigBuckBunnyTitle, ShelfId.allFilms);
  I.see(constants.bigBuckBunnyTitle);

  I.click('Caminandes 1: Llama Drama', locate({ css: 'a[aria-label="Caminandes 1: Llama Drama"]' }).inside(videoListLocator));
  I.see('Caminandes 1: Llama Drama');
});

Scenario('I can see the series inline player layout', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle, ShelfId.allCourses, true);
  I.seeElement(`[data-testid="inline-layout"]`);
  I.dontSeeElement(`[data-testid="cinema-layout"]`);
  I.seeElement('video');
  I.see(constants.minecraftAnimationWorkshopTitle);
  I.see('2023');
  I.see('17 episodes');
  I.see('Beginner');
  I.see('CC-BY');
  I.see(constants.minecraftAnimationWorkshopDescription);
  I.see('Favorite');
  I.see('Share');
  I.seeTextEquals('Minecraft Animation Workshop', 'h2');
  I.see('Season 1', locate({ css: 'select' }).inside(videoListLocator));
  I.see('S1:E2', locate({ css: 'a[aria-label="Basics Of Blender"]' }).inside(videoListLocator));
  I.see('S1:E3', locate({ css: 'a[aria-label="Using Mineways"]' }).inside(videoListLocator));
});

Scenario('I can start the inline player', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle, ShelfId.allCourses, true);
  await playInlineVideo(I, constants.minecraftAnimationWorkshopTitle);
});

Scenario('I switch to the episode in the video list', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle, ShelfId.allCourses, true);
  I.waitForElement('a[aria-label="Welcome"]', 3);
  I.click('S1:E1', locate({ css: 'a[aria-label="Welcome"]' }).inside(videoListLocator));
  I.see('S1:E1 - Welcome');
});

Scenario('I switch to another season in the video list', async ({ I }) => {
  await I.openVideoCard(constants.minecraftAnimationWorkshopTitle, ShelfId.allCourses, true);
  I.waitForElement('a[aria-label="Welcome"]', 3);
  I.click('S1:E1', locate({ css: 'a[aria-label="Welcome"]' }).inside(videoListLocator));

  I.see('Season 1/4 - Episode 1/6');
  I.selectOption({ css: 'select[name="season"]' }, 'Season 2');

  I.waitForElement('a[aria-label="Choosing a skin (Cycles Render)"]', 3);
  I.click(locate({ css: 'a[aria-label="Choosing a skin (Cycles Render)"]' }).inside(videoListLocator));

  I.dontSee('Season 1/4 - Episode 1/6');
  I.see('Season 2/4 - Episode 1/4');
  I.see('S2:E1 - Choosing a skin (Cycles Render)');
  I.dontSee('S1:E2 - Basics Of Blender');
});

Scenario('I can see the video auto play when play=1 is set', async ({ I }) => {
  I.seeInCurrentUrl(constants.baseUrl);
  await I.openVideoCard(constants.bigBuckBunnyTitle);
  await I.executeScript(() => {
    window.location.href += '&play=1';
  });

  I.waitForElement('video', normalTimeout);
  await I.waitForPlayerPlaying(constants.bigBuckBunnyTitle);
});

Scenario("I don't see the video auto play when play=1 is not set", async ({ I }) => {
  I.seeInCurrentUrl(constants.baseUrl);

  await I.openVideoCard(constants.bigBuckBunnyTitle);

  I.waitForElement('video', normalTimeout);
  await I.waitForPlayerState('idle');
});

async function playInlineVideo(I: CodeceptJS.I, title: string) {
  I.click('div[aria-label="Play"]');
  await I.waitForPlayerPlaying(title);

  I.clickPlayerContainer(); //pauses the player
  await I.waitForPlayerState('paused', ['idle']);
}
