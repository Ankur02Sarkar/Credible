"use client";
import { Button } from "~/components/ui/button";

export default function Home() {
	const handleSearch = async () => {
		const response = await fetch("/api/cards", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sortby: "joining-fee(low-high)",
				privileges: "EMI Benefit",
				emptype: "Salaried",
				incomeRange: "50000-100000",
				page: 0,
			}),
		});

		const result = await response.json();
		console.log("result : ", result);
	};
	return (
		<div>
			<div className="filterContainer">
				<div className="filters">
					{/* Soft by filter */}
					<select className="selectpicker sort col-12" title="" id="sortby">
						<option selected value="" data-order="desc">
							Featured
						</option>
						<option value="most-viewed" data-order="desc">
							Most Viewed
						</option>
						<option value="most-rated" data-order="desc">
							Most Rated
						</option>
						<option value="latest-credit-card" data-order="desc">
							Latest Credit Cards
						</option>
						<option value="joining-fee(low-high)" data-order="asc">
							Joining Fee(Low - High)
						</option>
						<option value="joining-fee(high-low)" data-order="desc">
							Joining Fee(High - Low)
						</option>
					</select>

					{/* Priviledge Filter */}
					<select
						className="selectpicker col-12 filter"
						title="Choose a Privilege"
						data-size="7"
						id="privileges"
					>
						<option selected value="">
							Choose a Privilege
						</option>
						<option value="Cash Withdrawal Benefit">
							Cash Withdrawal Benefit
						</option>
						<option value="Cashback Benefit">Cashback Benefit</option>
						<option value="Concierge Services">Concierge Services</option>
						<option value="Dining Benefit">Dining Benefit</option>
						<option value="EMI Benefit">EMI Benefit</option>
						<option value="Entertainment Benefit">Entertainment Benefit</option>
						<option value="Fuel Surcharge">Fuel Surcharge</option>
						<option value="Insurance Benefit">Insurance Benefit</option>
						<option value="Interest-Free Period">Interest-Free Period</option>
						<option value="Lounge Access">Lounge Access</option>
						<option value="Milestone Benefit">Milestone Benefit</option>
						<option value="Other Benefit">Other Benefit</option>
						<option value="Revolving Credit">Revolving Credit</option>
						<option value="Reward Points">Reward Points</option>
						<option value="Shopping Benefit">Shopping Benefit</option>
						<option value="Travel Benefit">Travel Benefit</option>
						<option value="Welcome Bonus">Welcome Bonus</option>
						<option value="Zero Lost Card Liability">
							Zero Lost Card Liability
						</option>
					</select>

					{/* Income Filter */}
					<select
						className="selectpicker col-12 filter"
						title="Choose Your Income"
						data-size="7"
						id="income"
					>
						<option selected value="">
							Choose Your Income
						</option>
						<option value="0-20000">Up to ₹ 20k</option>
						<option value="20001-25000">₹ 20k to 25k</option>
						<option value="25001-50000">₹ 25k to 50k</option>
						<option value="50000-100000">₹ 50k to 1l</option>
						<option value="100000-1000000">Above ₹ 1l</option>
					</select>

					{/* Employment Filter */}
					<select
						className="selectpicker col-12 filter"
						title="Choose Your Employment"
						data-size="7"
						id="emptype"
					>
						<option selected value="">
							Choose Your Employment
						</option>
						<option value="Salaried">I'm Salaried</option>
						<option value="Self Employed">I'm Self Employed</option>
						<option value="Student">I'm Student</option>
					</select>
				</div>
				<div>
					Applied Filters with remove icon for each and clear all button
				</div>
			</div>

			<div className="creditCardsContainer"></div>
			<Button onClick={() => handleSearch()}>Load More</Button>
		</div>
	);
}
