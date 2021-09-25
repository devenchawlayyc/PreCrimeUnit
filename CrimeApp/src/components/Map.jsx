import React, { useState, useEffect } from "react";
import axios from "axios";

export const Map = ({ params }) => {
	const [data, setData] = useState();
	const [error, setError] = useState();

	console.log({ params });
	function getData() {
		axios
			.get("https://data.calgary.ca/resource/78gh-n26t.json", {
				params,
			})
			.then((returned) => setData(returned.data))
			.catch((error) => setError(error));
	}

	return (
		<>
			<h1>Map</h1>
			<button onClick={getData}>Get Data</button>
			<pre>{JSON.stringify(data, null, 4)}</pre>
			{error ? <pre>{JSON.stringify(error, null, 4)}</pre> : null}
		</>
	);
};
