async function statistics(page) {
  // Define the scroll function
  const scrollUntilElementVisible = async () => {
    await page.evaluate(() => {
      window.scrollBy(0, 300); // Scroll down by 100 pixels
    });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second for the page to settle
  };
  await scrollUntilElementVisible();
  try {
    // Wait for the DOM to load
    await page.waitForSelector(".sr-leaguepositionform__wrapper", {
      timeout: 10000
    });
    await page.waitForSelector(
      ".sr-procvaltext__component-value.sr-procvaltext__component-value-medium",
      { timeout: 10000 }
    );
    // Wait for the home selector
    await page.waitForSelector(".sr-last-matches.sr-last-matches--right", {
      timeout: 5000
    });
    // Wait for the away selector
    await page.waitForSelector(".sr-teamform__lastXTeam.srm-left", {
      timeout: 10000
    });
    // Extract home league position
    const homeLeaguePosition = await page.evaluate(() => {
      const homeElement = document.querySelector(
        ".sr-positionchart__wrapper.srt-base-1-home-1 .sr-positionchart__box-content"
      );
      return homeElement ? homeElement.textContent.trim() : null;
    });
    // Extract away league position
    const awayLeaguePosition = await page.evaluate(() => {
      const awayElement = document.querySelector(
        ".sr-positionchart__box-content.srt-away-1"
      );
      return awayElement ? awayElement.textContent.trim() : null;
    });
    // Extract home and away values
    const [homeValueElement, awayValueElement] = await page.$$(
      ".sr-procvaltext__component-value.sr-procvaltext__component-value-medium"
    );
    // Extract home and away form value
    const homeValue = await page.evaluate(
      homeValueElement => homeValueElement.textContent.trim(),
      homeValueElement
    );
    const awayValue = await page.evaluate(
      awayValueElement => awayValueElement.textContent.trim(),
      awayValueElement
    );
    // Extracting home team results
    const homeResults = await page.evaluate(() => {
      const homeMatches = document.querySelectorAll(
        ".sr-teamform__lastXTeam.srm-left .sr-last-matches__wdl span"
      );
      const results = {
        W: 0,
        D: 0,
        L: 0
      };
      homeMatches.forEach(match => {
        const result = match.innerText.trim();
        if (result === "W") {
          results.W++;
        } else if (result === "D") {
          results.D++;
        } else if (result === "L") {
          results.L++;
        }
      });
      return results;
    });
    // Extracting away team results
    const awayResults = await page.evaluate(() => {
      const awayMatches = document.querySelectorAll(
        ".sr-last-matches.sr-last-matches--right .sr-last-matches__wdl span"
      );
      const results = {
        W: 0,
        D: 0,
        L: 0
      };
      awayMatches.forEach(match => {
        const result = match.innerText.trim();
        if (result === "W") {
          results.W++;
        } else if (result === "D") {
          results.D++;
        } else if (result === "L") {
          results.L++;
        }
      });
      return results;
    });
    if (parseInt(awayLeaguePosition) < parseInt(homeLeaguePosition)) {
      if (
        parseInt(awayValue.replace("%", "")) >
        parseInt(homeValue.replace("%", ""))
      ) {
        // Wait for the home selector
        await page.waitForSelector(".sr-last-matches.sr-last-matches--right", {
          timeout: 5000
        });
        // Wait for the away selector
        await page.waitForSelector(".sr-teamform__lastXTeam.srm-left", {
          timeout: 10000
        });
        // Extract home league position
        const homeLeaguePosition = await page.evaluate(() => {
          const homeElement = document.querySelector(
            ".sr-positionchart__wrapper.srt-base-1-home-1 .sr-positionchart__box-content"
          );
          return homeElement ? homeElement.textContent.trim() : null;
        });
        // Extract away league position
        const awayLeaguePosition = await page.evaluate(() => {
          const awayElement = document.querySelector(
            ".sr-positionchart__box-content.srt-away-1"
          );
          return awayElement ? awayElement.textContent.trim() : null;
        });

        await page.waitForSelector(".m-snap-nav");
        // Use page.evaluate to find the Table item and return a boolean
        await page.evaluate(() => {
          const items = document.querySelectorAll(".m-type-item");
          for (let item of items) {
            if (item.textContent.trim() === "Table") {
              item.click(); // Click on the "Table" item
              return true; // Indicate the item was found and clicked
            }
          }
          return false; // Indicate the item wasn't found
        });

        // Get if the team is more than 10 wins
        // Wait for the table to load (adjust the selector if necessary)
        await page.waitForSelector(".sr-livetable__table", {
          timeout: 5000
        });

        // Wait for the necessary content to load
        await page.waitForSelector(".m-event-title-team-horizontal", {
          timeout: 5000
        });

        // Define the team names you're interested in
        const homeTeamPos = homeLeaguePosition; // replace with your desired home team
        const awayTeamPos = awayLeaguePosition; // replace with your desired away team

        // Function to extract team data from the table
        async function getTeamData(teamPos) {
          console.log("Team Pos: ", teamPos);
          const data = await page.evaluate(teamPos => {
            const rows = document.querySelectorAll(".sr-livetable__tableRow");
            if (parseInt(teamPos) >= 1 && teamPos <= rows.length) {
              const row = rows[parseInt(teamPos)]; // Adjust for 0-based index
              const teamCell = row.querySelector(".srm-pos");
              if (teamCell && teamCell.textContent.trim() == teamPos) {
                const teamName = row
                  .querySelector(".sr-livetable__tableTeamName")
                  .textContent.trim();
                const position = teamCell.textContent.trim();
                const matchesPlayed = row
                  .querySelector("td:nth-child(4)")
                  .textContent.trim();
                const wins = row
                  .querySelector("td:nth-child(5)")
                  .textContent.trim();
                const draws = row
                  .querySelector("td:nth-child(6)")
                  .textContent.trim();
                const losses = row
                  .querySelector("td:nth-child(7)")
                  .textContent.trim();
                const goalsForAgainst = row
                  .querySelector("td:nth-child(8)")
                  .textContent.trim();
                const goalDifference = row
                  .querySelector("td:nth-child(9)")
                  .textContent.trim();
                const points = row
                  .querySelector(".sr-livetable__tableCell.srm-semibold")
                  .textContent.trim();

                return {
                  team: teamName,
                  position,
                  matchesPlayed,
                  wins,
                  draws,
                  losses,
                  goalsForAgainst,
                  goalDifference,
                  points
                };
              }
            } else {
              return teamPos + " is not a valid position."; // More descriptive return
            }
          }, teamPos); // Ensure teamPos is being passed correctly
          return data;
        }

        // Get data for both teams
        const homeTeamData = await getTeamData(homeTeamPos);
        const awayTeamData = await getTeamData(awayTeamPos);

        // Output the extracted data
        // console.log(homeTeamData && awayTeamData);

        if (homeTeamData && awayTeamData) {
          console.log("Home Team Data: ", homeTeamData);
          console.log("Away Team Data: ", awayTeamData);
          //checking that the losses is less than or equal to the opposite
          if (parseInt(homeTeamData.losses) <= parseInt(awayTeamData.losses)) {
            if (parseInt(homeTeamData.draws) >= parseInt(awayTeamData.draws)) {
              const pageUrl = await page.url();
              return pageUrl;
            }
          }
        }

        return null;
      }
    }
    return;
  } catch (error) {
    console.log("an error occurred: ", error);
    return;
  }
}
module.exports = statistics;
