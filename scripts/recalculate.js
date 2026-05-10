/**
 * Recalculate cumulative results for all competitions.
 * Usage: `node scripts/recalculate.js`
 * Requires `DATABASE_URL` in environment.
 */
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const competitions = await prisma.competition.findMany();
    const results = [];

    for (const competition of competitions) {
      const votes = await prisma.vote.findMany({
        where: { competitionId: competition.id },
        select: { points: true, votes: true }
      });

      console.log(`Competition ${competition.year} has ${votes.length} votes`);

      const countryPoints = {};
      const countryVoteCounts = {};
      (competition.countries || []).forEach(country => {
        countryPoints[country] = 0;
        countryVoteCounts[country] = 0;
      });

      // Sum up points
      votes.forEach(vote => {
        const pts = vote.points || {};
        Object.entries(pts).forEach(([country, pointsValue]) => {
          if (countryPoints[country] !== undefined) {
            countryPoints[country] += pointsValue || 0;
          }
        });
      });

      // Count actual non-empty votes (robustly handle votes stored as arrays, strings, or objects)
      const actualVotes = votes.filter(vote => {
        let arr = vote.votes || [];
        if (!Array.isArray(arr)) {
          if (typeof arr === 'string') {
            try { arr = JSON.parse(arr); } catch (e) { arr = []; }
          } else if (arr && typeof arr === 'object') {
            // Convert object-like arrays (e.g. {0: 'A', 1: 'B'}) to values
            arr = Object.values(arr);
          } else {
            arr = [];
          }
        }
        return Array.isArray(arr) && arr.some(e => e && String(e).trim() !== '');
      }).length;

      // Count voteCounts per country (how many users had the country in their list)
      votes.forEach(vote => {
        let arr = vote.votes || [];
        if (!Array.isArray(arr)) {
          if (typeof arr === 'string') {
            try { arr = JSON.parse(arr); } catch (e) { arr = []; }
          } else if (arr && typeof arr === 'object') {
            arr = Object.values(arr);
          } else {
            arr = [];
          }
        }
        if (!Array.isArray(arr)) arr = [];
        arr.forEach(country => {
          if (country && String(country).trim() !== '' && countryVoteCounts[country] !== undefined) {
            countryVoteCounts[country] += 1;
          }
        });
      });

      // Upsert cumulative results
      await prisma.cumulativeResult.upsert({
        where: { competitionId: competition.id },
        update: {
          results: countryPoints,
          voteCounts: countryVoteCounts,
          totalVotes: actualVotes,
          lastUpdated: new Date()
        },
        create: {
          competitionId: competition.id,
          results: countryPoints,
          voteCounts: countryVoteCounts,
          totalVotes: actualVotes,
          lastUpdated: new Date()
        }
      });

      results.push({ year: competition.year, actualVotes, topCountries: Object.entries(countryPoints).sort((a,b)=>b[1]-a[1]).slice(0,5) });
      console.log(`Recalculated competition ${competition.year}: ${actualVotes} votes`);
    }

    console.log('Recalculation completed. Summary:');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Error during recalculation:', err);
    process.exitCode = 1;
  } finally {
    try { await prisma.$disconnect(); } catch (e) {}
  }
}

main();
