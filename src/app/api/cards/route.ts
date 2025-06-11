// app/api/cards/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const {
			sortby,
			privileges,
			emptype,
			incomeRange,
			page = 0,
		} = await req.json();

		const formBody = new URLSearchParams({
			sortby,
			privileges,
			emptype,
			incomeRange,
			page: String(page),
		});

		const finologyResponse = await fetch(
			"https://select.finology.in/credit-card/sort",
			{
				method: "POST",
				headers: {
					accept: "*/*",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
					"cache-control": "no-cache",
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					pragma: "no-cache",
					priority: "u=1, i",
					"sec-ch-ua":
						'"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"macOS"',
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-requested-with": "XMLHttpRequest",
					Referer: "https://select.finology.in/credit-card",
					"Referrer-Policy": "strict-origin-when-cross-origin",
				},
				body: formBody.toString(),
			},
		);

		if (!finologyResponse.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch data from Finology" },
				{ status: finologyResponse.status },
			);
		}

		const data = await finologyResponse.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
