"use strict";
import React, { useRef } from "react";
import { Button } from "@strapi/design-system/Button";
import { Textarea } from "@strapi/design-system/Textarea";
import { Typography } from "@strapi/design-system/Typography";

const Questions = ({ name, value, onChange }) => {
	const [text, setText] = React.useState(value ? JSON.parse(value)?.text ?? "" : "");
	const [converted, setConverted] = React.useState(value ?? "[]");

	const handleInput = event => {
		setText(event.target.value);
		handleClick();
	};

	return (
		<div style={{ display: "grid", gap: "16px" }}>
			<Typography variant="pi" fontWeight="bold">
				{name}
			</Typography>
			<Textarea name={name} value={text} onChange={handleInput}></Textarea>
			<pre>{converted}</pre>
		</div>
	);
};

export default Questions;
