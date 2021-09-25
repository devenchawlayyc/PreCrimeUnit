import React, { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";

export const DisplayMap = ({ params }) => {
	const [data, setData] = useState();
	const [currentCrimeData, setCurrentCrimeData] = useState();
	const [communityBoundaryData, setCommunityBounaryData] = useState();
	const [communityCentres, setCommunityCentres] = useState({});
	const [error, setError] = useState();
	const [activeElement, setActiveElement] = useState();
	const [crimeCategory, setCrimeCategory] = useState();
	const [communityCrimeDensity, setCommunityCrimeDensity] = useState({});
	const [
		normalizedCommunityCrimeDensity,
		setNormalizeCommunityCrimeDensity,
	] = useState({});
	const [displayMarkers, setDisplayMarkers] = useState(false);

	const getCommunityBoundaryData = () => {
		axios
			.get("https://data.calgary.ca/resource/surr-xmvs.json")
			.then((returned) => {
				setCommunityBounaryData(returned.data);
			})
			.catch((error) => setError(error));
	};
	function getData() {
		axios
			.get("https://data.calgary.ca/resource/78gh-n26t.json", {
				params,
			})
			.then((returned) => {
				setData(returned.data);
			})
			.catch((error) => setError(error));
	}

	// change the display data every time the underlying data or category changes
	useEffect(() => {
		if (data) {
			setCurrentCrimeData(
				data
					.filter((elem) => !!elem)
					.filter((crime) =>
						crimeCategory ? crime.category === crimeCategory : true
					)
			);
		} else {
			setCurrentCrimeData(null);
		}
	}, [data, crimeCategory]);

	// set the crime density every time the data changes
	useEffect(() => {
		if (currentCrimeData) {
			const crimeDensity = currentCrimeData.reduce((density, crime) => {
				density[crime.community_name] = density[crime.community_name]
					? Number(density[crime.community_name]) +
					  Number(crime.crime_count)
					: Number(crime.crime_count);
				return density;
			}, {});
			const max = Math.max(...Object.values(crimeDensity));
			const normalizedCrimeDensity = Object.keys(crimeDensity).reduce(
				(normalized, key) => {
					normalized[key] = crimeDensity[key] / max;
					return normalized;
				},
				{}
			);
			console.log({ normalizedCrimeDensity });
			setCommunityCrimeDensity(crimeDensity);
			setNormalizeCommunityCrimeDensity(normalizedCrimeDensity);
		} else {
			setNormalizeCommunityCrimeDensity({});
			setCommunityCrimeDensity({});
		}
	}, [currentCrimeData]);

	// figure out the centres of the communities whenever we get that data
	useEffect(() => {
		if (communityBoundaryData) {
			const calculatedCentres = communityBoundaryData
				.filter((elem) => !!elem)
				.filter((elem) => elem.name)
				.reduce((centres, community) => {
					const coordinates = community.the_geom.coordinates[0];
					centres[community.name] = coordinates.reduce(
						(centre, point, _, allPoints) => {
							centre = [
								centre[0] + point[1] / allPoints.length,
								centre[1] + point[0] / allPoints.length,
							];
							return centre;
						},
						[0, 0]
					);
					return centres;
				}, {});
			console.log({ calculatedCentres });
			setCommunityCentres(calculatedCentres);
		} else {
			setCommunityCentres({});
		}
	}, [communityBoundaryData]);

	return (
		<>
			<h2>
				Crime Map{` - ${crimeCategory ? crimeCategory : "All Crimes"}`}
			</h2>
			<button onClick={getCommunityBoundaryData}>Get Boundaries</button>
			<button onClick={getData}>Get Data</button>
			{error ? <pre>{JSON.stringify(error, null, 4)}</pre> : null}
			<label>
				Crimes
				<select
					name="crimes"
					onChange={(e) => setCrimeCategory(e.target.value)}
				>
					<option value="" default>
						All
					</option>
					{data
						? data
								.map((elem) => elem && elem.category)
								.filter((elem) => !!elem)
								.reduce(
									(categories, current) =>
										categories.includes(current)
											? categories
											: [...categories, current],
									[]
								)
								.map((category) => (
									<option value={category} key={category}>
										{category}
									</option>
								))
						: null}
				</select>
			</label>
			<label>
				Show Markers?
				<input
					type="checkbox"
					name="show-markers"
					onChange={(e) => setDisplayMarkers(e.target.checked)}
				/>
			</label>
			<br />
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<MapContainer
					center={[51, -114]}
					zoom={12}
					style={{
						border: "solid 1px black",
						height: "800px",
						width: "800px",
					}}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					/>
					{communityBoundaryData
						? communityBoundaryData.map((community, index) => {
								return (
									<Polygon
										key={index}
										pathOptions={{
											color: "black",
											fillColor: "red",
											fillOpacity: normalizedCommunityCrimeDensity[
												community.name
											]
												? normalizedCommunityCrimeDensity[
														community.name
												  ]
												: 0,
										}}
										positions={community.the_geom.coordinates[0].map(
											(position) => [
												position[1],
												position[0],
											]
										)}
									></Polygon>
								);
						  })
						: null}
					{communityCentres && displayMarkers
						? Object.entries(communityCentres).map((entry) => {
								console.log({ entry });
								const [name, centre] = entry;
								return (
									<Marker position={centre} key={name}>
										<Popup>{`${name}${
											communityCrimeDensity[name]
												? `: ${communityCrimeDensity[name]}`
												: ""
										}`}</Popup>
									</Marker>
								);
						  })
						: null}
					{false
						? currentCrimeData
							? currentCrimeData
									.filter(
										(elem) => elem && elem.lat && elem.long
									)
									.map((element, index) => {
										return (
											<Marker
												key={index}
												position={[
													element.lat,
													element.long,
												]}
											>
												<Popup>
													{element.crime_count}
												</Popup>
											</Marker>
										);
									})
							: null
						: null}
				</MapContainer>
			</div>
		</>
	);
};
