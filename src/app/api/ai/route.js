import { NextResponse } from "next/server";
const GITHUB_API_URL = "https://api.github.com/graphql";

// Declare contributions as an empty object globally
let contributions = {};

export async function POST(req) {
    const { username } = await req.json();

    if (!username) {
        return new NextResponse("Username required", { status: 400 });
    }

    const query = `
    query ($login: String!) {
      user(login: $login) {
        login
        contributionsCollection {
          totalCommitContributions
          contributionCalendar {
            totalContributions
          }
          pullRequestContributionsByRepository {
            repository {
              name
            }
            totalCount
          }
        }
        repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            primaryLanguage {
              name
            }
          }
        }
      }
    }
  `;

    try {
        const response = await fetch(GITHUB_API_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables: { login: username },
            }),
        });

        if (!response.ok) {
            return new NextResponse(await response.text(), {
                status: response.status,
            });
        }

        const data = await response.json();
        console.log(data);
        if (data.data.user) {
            contributions = data.data.user.contributionsCollection; // Assign contributions globally
            return contributions;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error checking GitHub username:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
export { contributions };
