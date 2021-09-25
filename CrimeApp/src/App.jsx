import { useState } from "react";

import { DisplayMap } from "./components/DisplayMap";

function App() {
	const [params, setParams] = useState({});
	return (
		<>
			<h1>Calgary Crime Map and Predictions</h1>
			<label>
				Select Month
				<select
					name="month"
					onChange={(event) => {
						console.log({ value: event.target.value });
						setParams((params) => ({
							...params,
							month: event.target.value,
						}));
					}}
				>
					<option value="" default>
						---
					</option>
					<option value="JAN">January</option>
					<option value="FEB">February</option>
					<option value="MAR">March</option>
					<option value="APR">April</option>
					<option value="MAY">May</option>
					<option value="JUN">June</option>
					<option value="JUL">July</option>
					<option value="AUG">August</option>
					<option value="SEP">September</option>
					<option value="OCT">October</option>
					<option value="NOV">November</option>
					<option value="DEC">December</option>
				</select>
			</label>
			<label>
				Year
				<select
					name="year"
					onChange={(event) =>
						setParams((params) => ({
							...params,
							year: event.target.value,
						}))
					}
				>
					<option value="">---</option>
					<option value="2017">2017</option>
					<option value="2018">2018</option>
					<option value="2019">2019</option>
					<option value="2020">2020</option>
					<option value="2021">2021</option>
				</select>
			</label>
			<DisplayMap params={params} />
		</>
	);
}

export default App;
