import React, { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export const DisplayMap = ({ params }) => {
	const [data, setData] = useState();
	const [error, setError] = useState();
	const [activeElement, setActiveElement] = useState()

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
			{error ? <pre>{JSON.stringify(error, null, 4)}</pre> : null}
			<pre>
				{JSON.stringify(activeElement, null, 4)}
			</pre>
			<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
				<MapContainer center={[51, -114]} zoom={12} style={{border: 'solid 1px black', height: '600px', width: '600px'}}>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				/>
					{
						data ? data.filter(elem => elem && elem.lat && elem.long).map(( element, index ) => {
							return <Marker key={index} position={[element.lat, element.long]} onClick={() => { console.log('Click!'); setActiveElement(element) }} />}) : null
					}
					{activeElement ? <Popup position={[activeElement.lat, activeElement.long]} onClose={() => setActiveElement(null)}>Here I am!</Popup> :null}
				</MapContainer>
		</div>
		</>
	);
};
